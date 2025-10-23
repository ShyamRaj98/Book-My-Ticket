import fs from "fs";
import csv from "csv-parser";
import Movie from "../models/Movie.js";
import Theater from "../models/Theater.js";
import Showtime from "../models/Showtime.js";
import SeatLayout from "../models/SeatLayout.js";
import { fetchTmdbMovie } from "../services/tmdb.js";

const adminController = {

  /**
 * POST /api/admin/movies
 * Add movie manually or from TMDb
 */
  addMovie: async (req, res) => {
    try {
      let payload = req.body || {};
      if (payload.tmdbId) {
        try {
          const tmdb = await fetchTmdbMovie(payload.tmdbId);
          payload = {
            ...payload,
            title: tmdb.title || payload.title,
            posterPath: tmdb.poster_path || payload.posterPath,
            overview: tmdb.overview || payload.overview,
            runtime: tmdb.runtime || payload.runtime,
            releaseDate: tmdb.release_date ? new Date(tmdb.release_date) : payload.releaseDate,
            language: tmdb.original_language,
            genres: (tmdb.genres || []).map(g => g.name),
          };
        } catch (e) {
          console.warn("TMDb enrich failed", e.message);
        }
      }
      const movie = await Movie.create(payload);
      res.json({ movie });
    } catch (err) {
      console.error("Add movie error:", err);
      res.status(500).json({ error: "failed to create movie" });
    }
  },
/**
 * GET /api/admin/movies
 * List all movies (for Admin panel)
 */
  listMovies: async (req, res) => {
    try {
      const movies = await Movie.find().sort({ createdAt: -1 });
      res.json({ movies });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to fetch movies" });
    }
  },
/**
 * PUT /api/admin/movies/:id
 * Update a movie
 */
  updateMovie: async (req, res) => {
    try {
      const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        { ...req.body, genres: req.body.genres || [] },
        { new: true }
      );
      if (!movie) return res.status(404).json({ error: "movie not found" });
      res.json({ movie });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to update movie" });
    }
  },
/**
 * DELETE /api/admin/movies/:id
 */
  deleteMovie: async (req, res) => {
    try {
      const movie = await Movie.findByIdAndDelete(req.params.id);
      if (!movie) return res.status(404).json({ error: "movie not found" });
      res.json({ message: "movie deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to delete movie" });
    }
  },

  /**
 * POST /api/admin/theaters
 */
  addTheater: async (req, res) => {
    try {
      const th = await Theater.create(req.body);
      res.json({ theater: th });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to create theater" });
    }
  },
/**
 * ✅ GET /api/admin/theaters-list
 * Include full screen list for frontend admin panel
 */
  listTheaters: async (req, res) => {
    try {
      const theaters = await Theater.find().sort({ name: 1 });
      res.json({ theaters });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to fetch theaters" });
    }
  },
/**
 * GET /api/admin/theaters/:id
 */
  getTheater: async (req, res) => {
    try {
      const theater = await Theater.findById(req.params.id);
      if (!theater) return res.status(404).json({ error: "not found" });
      res.json({ theater });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed" });
    }
  },
// Update theater
  updateTheater: async (req, res) => {
    const { name, location } = req.body;
    const updated = await Theater.findByIdAndUpdate(
      req.params.id,
      { name, location },
      { new: true }
    );
    res.json({ message: "Theater updated", updated });
  },
// Delete theater
  deleteTheater: async (req, res) => {
    await Theater.findByIdAndDelete(req.params.id);
    res.json({ message: "Theater deleted" });
  },

  /**
 * ✅ POST /api/admin/screens/:theaterId
 * Add new screen to a theater
 */
  addScreen: async (req, res) => {
    try {
      const { theaterId } = req.params;
      const { name, layoutId } = req.body;
      if (!name) return res.status(400).json({ error: "screen name required" });

      const theater = await Theater.findById(theaterId);
      if (!theater) return res.status(404).json({ error: "theater not found" });

      if (theater.screens.some(s => s.name === name))
        return res.status(400).json({ error: "screen with this name already exists" });

      let seats = [], layoutName;
      if (layoutId) {
        const layout = await SeatLayout.findById(layoutId);
        if (!layout) return res.status(404).json({ error: "layout not found" });
        seats = layout.seats.map(s => ({
          seatId: s.seatId,
          row: s.row,
          number: s.number,
          type: s.type,
          price: s.price
        }));
        layoutName = layout.name;
      }

      theater.screens.push({ name, rows: 0, cols: 0, layoutName: layoutName || null, seats });
      await theater.save();
      res.json({ message: "screen added", theater });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to add screen" });
    }
  },
// Delete a screen from a theater
// DELETE /api/admin/screens/:theaterId/:screenName

// Update an existing screen: rename or apply different layout
// PUT /api/admin/screens/:theaterId
// body: { oldName, newName, layoutId }
updateScreen: async (req, res) => {
    try {
      const { theaterId } = req.params;
      const { oldName, newName, layoutId } = req.body;
      if (!oldName) return res.status(400).json({ error: "oldName required" });

      const theater = await Theater.findById(theaterId);
      if (!theater) return res.status(404).json({ error: "theater not found" });

      const screen = theater.screens.find(s => s.name === oldName);
      if (!screen) return res.status(404).json({ error: "screen not found" });

      if (layoutId) {
        const layout = await SeatLayout.findById(layoutId);
        if (!layout) return res.status(404).json({ error: "layout not found" });
        screen.seats = layout.seats.map(s => ({
          seatId: s.seatId,
          row: s.row,
          number: s.number,
          type: s.type,
          price: s.price
        }));
        screen.layoutName = layout.name;
      }

      if (newName) screen.name = newName;
      await theater.save();
      res.json({ message: "screen updated", theater });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to update screen" });
    }
  },

/**
 * ✅ PUT /api/admin/screens/:theaterId/:screenName
 * Replace or update a screen template (used by visual seat editor)
 */
  updateScreenTemplate: async (req, res) => {
    try {
      const { theaterId, screenName } = req.params;
      const { seats } = req.body;
      const theater = await Theater.findById(theaterId);
      if (!theater) return res.status(404).json({ error: "theater not found" });
      const screen = theater.screens.find(s => s.name === screenName);
      if (!screen) return res.status(404).json({ error: "screen not found" });

      screen.seats = seats;
      await theater.save();
      res.json({ message: "screen updated", theater });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to update screen" });
    }
  },
/**
 * ✅ DELETE /api/admin/theaters/:theaterId/screens/:screenName
 * Delete screen by name
 */
  deleteScreen: async (req, res) => {
    try {
      const { theaterId, screenName } = req.params;
      const theater = await Theater.findById(theaterId);
      if (!theater) return res.status(404).json({ error: "theater not found" });

      const before = theater.screens.length;
      theater.screens = theater.screens.filter(s => s.name !== screenName);
      if (before === theater.screens.length) return res.status(404).json({ error: "screen not found" });

      await theater.save();
      res.json({ message: "screen deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to delete screen" });
    }
  },

/**
 * GET /api/admin/showtimes/:id
 * Get single showtime details
 */
  getShowtime: async (req, res) => {
    try {
      const showtime = await Showtime.findById(req.params.id)
        .populate("movie", "title posterPath")
        .populate("theater", "name location");
      if (!showtime) return res.status(404).json({ error: "Showtime not found" });
      res.json({ showtime });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch showtime" });
    }
  },

/**
 * ✅ POST /api/admin/upload-seat-csv
 * Upload a CSV file and parse into seat JSON (with Multer)
 */
  uploadSeatCSV: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "file required" });
      const csvData = req.file.buffer.toString("utf-8");
      const lines = csvData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const seats = [];
      for (const line of lines) {
        const [row, numberStr, seatId, type, priceStr] = line.split(",").map(p => p.trim());
        if (!row || !numberStr || !seatId) continue;
        seats.push({ seatId, row, number: parseInt(numberStr, 10), type, price: parseFloat(priceStr) });
      }
      res.json({ seats });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to parse uploaded csv" });
    }
  },
/**
 * (legacy) POST /api/admin/parse-seat-csv
 * For text CSV in JSON body
 */
  parseSeatCSV: async (req, res) => {
    try {
      const { csv } = req.body;
      if (!csv) return res.status(400).json({ error: "csv required" });
      const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const seats = [];
      for (const line of lines) {
        const [row, numberStr, seatId, type, priceStr] = line.split(",").map(p => p.trim());
        if (!row || !numberStr || !seatId) continue;
        seats.push({ seatId, row, number: parseInt(numberStr, 10), type, price: parseFloat(priceStr) });
      }
      res.json({ seats });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to parse csv" });
    }
  },
/**
 * POST /api/admin/parse-seat-csv
 * Accepts raw CSV text in body { csv: "row,number,seatId,type,price\nA,1,A1,regular,150\n..." }
 * Returns parsed JSON seats array.
 */
  uploadScreenCSV: async (req, res) => {
    const { theaterId, screenName } = req.params;
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ error: "File not uploaded" });

    const seats = [];
    try {
      const readStream = fs.createReadStream(filePath);
      readStream
        .pipe(csv())
        .on("data", row => seats.push({
          seatId: row.seatId || `${row.row}${row.number}`,
          row: row.row || "",
          number: Number(row.number) || 0,
          type: row.type || "regular",
          price: Number(row.price) || 0,
        }))
        .on("end", async () => {
          fs.unlinkSync(filePath);
          const theater = await Theater.findById(theaterId);
          if (!theater) return res.status(404).json({ error: "Theater not found" });

          const screen = theater.screens.find(s => s.name === screenName);
          if (!screen) return res.status(404).json({ error: "Screen not found" });

          screen.seats = seats;
          await theater.save();
          res.json({ message: "CSV imported successfully", seats });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to import CSV" });
    }
  },

};

export default adminController;
