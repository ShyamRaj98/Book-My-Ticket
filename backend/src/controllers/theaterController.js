// controllers/theaterController.js
import Theater from "../models/Theater.js";
import Showtime from "../models/Showtime.js";
import SeatLayout from "../models/SeatLayout.js";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";

const getOwnedTheaterIds = async (userId) => {
  const theaters = await Theater.find({ owner: userId }).select("_id");
  return theaters.map((t) => t._id);
};

const theaterController = {
  /**
   * @desc List theaters owned by the logged-in theater admin
   * @route GET /api/theater/my-theaters
   * @access Theater (Auth required)
   */
  listMyTheaters: async (req, res) => {
    try {
      const theaters = await Theater.find({ owner: req.user.id }).sort({
        createdAt: -1,
      });
      res.json({ theaters });
    } catch (err) {
      console.error("❌ listMyTheaters error:", err);
      res.status(500).json({ error: "Failed to fetch your theaters" });
    }
  },

  /**
   * @desc Add new theater by the logged-in theater admin
   * @route POST /api/theater/my-theaters
   * @access Theater (Auth required)
   */
  addMyTheater: async (req, res) => {
    try {
      const { name, location } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      const newTheater = await Theater.create({
        owner: req.user.id, // ✅ Fixed here
        name,
        location,
        isApproved: true, // ✅ Theater-created ones auto-approved
      });

      res.json({
        message: "Theater created successfully",
        theater: newTheater,
      });
    } catch (err) {
      console.error("❌ addMyTheater error:", err);
      res.status(500).json({ error: "Failed to create theater" });
    }
  },

  /**
   * @desc Update a theater owned by the logged-in theater admin
   * @route PUT /api/theater/my-theaters/:id
   * @access Theater (Auth required)
   */
  updateMyTheater: async (req, res) => {
    try {
      const { name, location } = req.body;

      const theater = await Theater.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.id }, // ✅ Fixed here
        { name, location },
        { new: true }
      );

      if (!theater)
        return res
          .status(404)
          .json({ error: "Theater not found or not yours" });

      res.json({ message: "Theater updated successfully", theater });
    } catch (err) {
      console.error("❌ updateMyTheater error:", err);
      res.status(500).json({ error: "Failed to update theater" });
    }
  },

  /**
   * @desc Delete a theater owned by the logged-in theater admin
   * @route DELETE /api/theater/my-theaters/:id
   * @access Theater (Auth required)
   */
  deleteMyTheater: async (req, res) => {
    try {
      const theater = await Theater.findOne({
        _id: req.params.id,
        owner: req.user.id, // ✅ Fixed here
      });

      if (!theater)
        return res
          .status(404)
          .json({ error: "Theater not found or not owned by you" });

      if (!theater.isApproved)
        return res
          .status(403)
          .json({ error: "You cannot delete unapproved theaters" });

      await Theater.findByIdAndDelete(req.params.id);
      res.json({ message: "Theater deleted successfully" });
    } catch (err) {
      console.error("❌ deleteMyTheater error:", err);
      res.status(500).json({ error: "Failed to delete theater" });
    }
  },

  /**
   * 🎭 Create layout (theater admin)
   * POST /api/theater/seat-layouts
   */
  createLayout: async (req, res) => {
    try {
      const { name, seats } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });

      const existing = await SeatLayout.findOne({
        name,
        createdBy: req.user.id,
      });
      if (existing)
        return res.status(400).json({ error: "Layout name already exists" });

      const layout = await SeatLayout.create({
        name,
        seats: seats || [],
        createdBy: req.user.id,
      });
      res.json({ layout });
    } catch (err) {
      console.error("❌ Theater createLayout:", err);
      res.status(500).json({ error: "Failed to create layout" });
    }
  },

  /**
   * 🎭 Get all layouts created by this theater admin
   * GET /api/theater/seat-layouts
   */
  getLayouts: async (req, res) => {
    try {
      const layouts = await SeatLayout.find({ createdBy: req.user.id }).sort({
        createdAt: -1,
      });
      res.json(layouts);
    } catch (err) {
      console.error("❌ Theater getLayouts:", err);
      res.status(500).json({ error: "Failed to fetch layouts" });
    }
  },

  /**
   * 🎭 Update layout
   * PUT /api/theater/seat-layouts/:id
   */
  updateLayout: async (req, res) => {
    try {
      const { name, seats } = req.body;
      const layout = await SeatLayout.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user.id },
        { name, seats },
        { new: true, runValidators: true }
      );

      if (!layout) return res.status(404).json({ error: "Layout not found" });
      res.json({ layout });
    } catch (err) {
      console.error("❌ Theater updateLayout:", err);
      res.status(500).json({ error: "Failed to update layout" });
    }
  },

  /**
   * 🎭 Delete layout
   * DELETE /api/theater/seat-layouts/:id
   */
  deleteLayout: async (req, res) => {
    try {
      const layout = await SeatLayout.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user.id,
      });
      if (!layout) return res.status(404).json({ error: "Layout not found" });
      res.json({ message: "Layout deleted" });
    } catch (err) {
      console.error("❌ Theater deleteLayout:", err);
      res.status(500).json({ error: "Failed to delete layout" });
    }
  },
  /**
   * ✅ POST /api/theater/screens/:theaterId
   * Add new screen to your own theater
   */
  addScreen: async (req, res) => {
    try {
      const { theaterId } = req.params;
      const { name, layoutId } = req.body;

      if (!name) return res.status(400).json({ error: "screen name required" });

      const theater = await Theater.findOne({
        _id: theaterId,
        owner: req.user.id,
      });
      if (!theater)
        return res
          .status(404)
          .json({ error: "theater not found or not yours" });

      if (theater.screens.some((s) => s.name === name))
        return res
          .status(400)
          .json({ error: "screen with this name already exists" });

      let seats = [],
        layoutName;
      if (layoutId) {
        const layout = await SeatLayout.findOne({
          _id: layoutId,
          createdBy: req.user.id,
        });
        if (!layout) return res.status(404).json({ error: "layout not found" });

        seats = layout.seats.map((s) => ({
          seatId: s.seatId,
          row: s.row,
          number: s.number,
          type: s.type,
          price: s.price,
        }));
        layoutName = layout.name;
      }

      theater.screens.push({
        name,
        rows: 0,
        cols: 0,
        layoutName: layoutName || null,
        seats,
      });
      await theater.save();
      res.json({ message: "screen added", theater });
    } catch (err) {
      console.error("❌ addScreen error:", err);
      res.status(500).json({ error: "failed to add screen" });
    }
  },

  /**
   * ✅ PUT /api/theater/screens/:theaterId
   * Update your theater’s screen name or layout
   */
  updateScreen: async (req, res) => {
    try {
      const { theaterId } = req.params;
      const { oldName, newName, layoutId } = req.body;
      if (!oldName) return res.status(400).json({ error: "oldName required" });

      const theater = await Theater.findOne({
        _id: theaterId,
        owner: req.user.id,
      });
      if (!theater)
        return res
          .status(404)
          .json({ error: "theater not found or not yours" });

      const screen = theater.screens.find((s) => s.name === oldName);
      if (!screen) return res.status(404).json({ error: "screen not found" });

      if (layoutId) {
        const layout = await SeatLayout.findOne({
          _id: layoutId,
          owner: req.user.id,
        });
        if (!layout) return res.status(404).json({ error: "layout not found" });

        screen.seats = layout.seats.map((s) => ({
          seatId: s.seatId,
          row: s.row,
          number: s.number,
          type: s.type,
          price: s.price,
        }));
        screen.layoutName = layout.name;
      }

      if (newName) screen.name = newName;
      await theater.save();
      res.json({ message: "screen updated", theater });
    } catch (err) {
      console.error("❌ updateScreen error:", err);
      res.status(500).json({ error: "failed to update screen" });
    }
  },

  /**
   * ✅ PUT /api/theater/screens/:theaterId/:screenName
   * Replace screen seats directly
   */
  updateScreenTemplate: async (req, res) => {
    try {
      const { theaterId, screenName } = req.params;
      const { seats } = req.body;

      const theater = await Theater.findOne({
        _id: theaterId,
        owner: req.user.id,
      });
      if (!theater)
        return res
          .status(404)
          .json({ error: "theater not found or not yours" });

      const screen = theater.screens.find((s) => s.name === screenName);
      if (!screen) return res.status(404).json({ error: "screen not found" });

      screen.seats = seats;
      await theater.save();
      res.json({ message: "screen template updated", theater });
    } catch (err) {
      console.error("❌ updateScreenTemplate error:", err);
      res.status(500).json({ error: "failed to update screen template" });
    }
  },

  /**
   * ✅ DELETE /api/theater/screens/:theaterId/:screenName
   */
  deleteScreen: async (req, res) => {
    try {
      const { theaterId, screenName } = req.params;
      const theater = await Theater.findOne({
        _id: theaterId,
        owner: req.user.id,
      });
      if (!theater)
        return res
          .status(404)
          .json({ error: "theater not found or not yours" });

      const before = theater.screens.length;
      theater.screens = theater.screens.filter((s) => s.name !== screenName);
      if (before === theater.screens.length)
        return res.status(404).json({ error: "screen not found" });

      await theater.save();
      res.json({ message: "screen deleted" });
    } catch (err) {
      console.error("❌ deleteScreen error:", err);
      res.status(500).json({ error: "failed to delete screen" });
    }
  },

  /**
   * 🎬 List all showtimes owned by the logged-in theater admin
   * GET /api/theater/showtimes
   */
  getMyShowtimes: async (req, res) => {
    try {
      const theaters = await Theater.find({ owner: req.user.id }).select("_id");
      const theaterIds = theaters.map((t) => t._id);

      const showtimes = await Showtime.find({ theater: { $in: theaterIds } })
        .populate("movie", "title")
        .populate("theater", "name location")
        .sort({ startTime: 1 });

      res.json({ showtimes });
    } catch (err) {
      console.error("❌ getMyShowtimes error:", err);
      res.status(500).json({ error: "Failed to fetch showtimes" });
    }
  },

  /**
   * 🎬 Create new showtime for one of your theaters
   * POST /api/theater/showtimes
   */
  createMyShowtime: async (req, res) => {
    try {
      const { movieId, theaterId, screenName, startTime, language, format } =
        req.body;

      // Check ownership
      const theater = await Theater.findOne({
        _id: theaterId,
        owner: req.user.id,
      });
      if (!theater)
        return res
          .status(404)
          .json({ error: "Theater not found or not yours" });

      const screen = theater.screens.find((s) => s.name === screenName);
      if (!screen) return res.status(404).json({ error: "Screen not found" });

      const seatsCopy = screen.seats.map((s) => ({
        seatId: s.seatId,
        row: s.row,
        number: s.number,
        type: s.type,
        price: s.price,
        status: "available",
      }));

      const showtime = await Showtime.create({
        movie: movieId,
        theater: theater._id,
        screenName,
        startTime: new Date(startTime),
        seats: seatsCopy,
        language,
        format,
      });

      res.json({ message: "Showtime created successfully", showtime });
    } catch (err) {
      console.error("❌ createMyShowtime error:", err);
      res.status(500).json({ error: "Failed to create showtime" });
    }
  },

  /**
   * 🎬 Update a showtime owned by your theaters
   * PATCH /api/theater/showtimes/:id
   */
  updateMyShowtime: async (req, res) => {
    try {
      const { id } = req.params;
      const { startTime, seatPrices } = req.body;

      // Ensure the showtime belongs to this theater admin
      const myTheaters = await Theater.find({ owner: req.user.id }).select(
        "_id"
      );
      const theaterIds = myTheaters.map((t) => t._id);

      const showtime = await Showtime.findOne({
        _id: id,
        theater: { $in: theaterIds },
      });
      if (!showtime)
        return res
          .status(404)
          .json({ error: "Showtime not found or not yours" });

      if (startTime) showtime.startTime = new Date(startTime);

      if (Array.isArray(seatPrices)) {
        seatPrices.forEach((sp) => {
          const seat = showtime.seats.find((s) => s.seatId === sp.seatId);
          if (seat && typeof sp.price === "number") seat.price = sp.price;
        });
      }

      await showtime.save();
      res.json({ message: "Showtime updated successfully", showtime });
    } catch (err) {
      console.error("❌ updateMyShowtime error:", err);
      res.status(500).json({ error: "Failed to update showtime" });
    }
  },

  /**
   * 🎬 Delete a showtime owned by your theaters
   * DELETE /api/theater/showtimes/:id
   */
  deleteMyShowtime: async (req, res) => {
    try {
      const myTheaters = await Theater.find({ owner: req.user.id }).select(
        "_id"
      );
      const theaterIds = myTheaters.map((t) => t._id);

      const st = await Showtime.findOneAndDelete({
        _id: req.params.id,
        theater: { $in: theaterIds },
      });

      if (!st)
        return res
          .status(404)
          .json({ error: "Showtime not found or not yours" });
      res.json({ message: "Showtime deleted successfully" });
    } catch (err) {
      console.error("❌ deleteMyShowtime error:", err);
      res.status(500).json({ error: "Failed to delete showtime" });
    }
  },

  /** 🎭 Get theater profile for logged-in theater admin */
  getMyTheaterProfile: async (req, res) => {
    try {
      const theater = await Theater.findOne({ owner: req.user.id });
      if (!theater) {
        return res
          .status(404)
          .json({ error: "No theater found for this user" });
      }

      res.json({ theater });
    } catch (err) {
      console.error("❌ getMyTheaterProfile error:", err);
      res.status(500).json({ error: "Failed to load theater profile" });
    }
  },

  /** 🎯 SUMMARY REPORT */
  getTheaterSummary: async (req, res) => {
    try {
      const theaterIds = await getOwnedTheaterIds(req.user.id);

      const showtimes = await Showtime.find({
        theater: { $in: theaterIds },
      }).select("_id seats");

      const showtimeIds = showtimes.map((s) => s._id);

      const totalBookings = await Booking.countDocuments({
        showtime: { $in: showtimeIds },
        status: "paid",
      });

      const totalSalesAgg = await Booking.aggregate([
        { $match: { showtime: { $in: showtimeIds }, status: "paid" } },
        { $group: { _id: null, totalSales: { $sum: "$amount" } } },
      ]);

      const totalSales = totalSalesAgg[0]?.totalSales || 0;

      const totalSeats = showtimes.reduce(
        (sum, s) => sum + (s.seats?.length || 0),
        0
      );

      const bookedSeatsAgg = await Booking.aggregate([
        { $match: { showtime: { $in: showtimeIds }, status: "paid" } },
        { $project: { count: { $size: "$seats" } } },
        { $group: { _id: null, bookedSeats: { $sum: "$count" } } },
      ]);

      const bookedSeats = bookedSeatsAgg[0]?.bookedSeats || 0;
      const avgOccupancy = totalSeats ? (bookedSeats / totalSeats) * 100 : 0;

      console.log("🎯 Theater Summary:", {
        totalSales,
        totalBookings,
        avgOccupancy,
      });

      res.json({
        success: true,
        data: {
          totalSales,
          totalBookings,
          avgOccupancy: Math.round(avgOccupancy * 100) / 100,
        },
      });
    } catch (err) {
      console.error("getTheaterSummary error:", err);
      res.status(500).json({ error: "Failed to load theater summary" });
    }
  },

  /** 💰 SALES REPORT */
  getTheaterSales: async (req, res) => {
    try {
      const { from, to, interval = "daily" } = req.query;
      const theaterIds = await getOwnedTheaterIds(req.user.id);
      const showtimes = await Showtime.find({
        theater: { $in: theaterIds },
      }).select("_id");
      const showtimeIds = showtimes.map((s) => s._id);

      const match = { showtime: { $in: showtimeIds }, status: "paid" };
      if (from || to) match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);

      const groupId =
        interval === "monthly"
          ? { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }
          : interval === "weekly"
          ? { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } }
          : {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            };

      const sales = await Booking.aggregate([
        { $match: match },
        {
          $group: {
            _id: groupId,
            totalSales: { $sum: "$amount" },
            totalBookings: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      ]);

      console.log("💰 Theater Sales:", sales);
      res.json({ success: true, data: sales });
    } catch (err) {
      console.error("getTheaterSales error:", err);
      res.status(500).json({ error: "Failed to load theater sales report" });
    }
  },

  /** 🎬 POPULAR MOVIES */
  getTheaterPopularMovies: async (req, res) => {
    try {
      const theaterIds = await getOwnedTheaterIds(req.user.id);
      const showtimes = await Showtime.find({
        theater: { $in: theaterIds },
      }).select("_id movie");
      const showtimeIds = showtimes.map((s) => s._id);

      const result = await Booking.aggregate([
        { $match: { showtime: { $in: showtimeIds }, status: "paid" } },
        {
          $lookup: {
            from: "showtimes",
            localField: "showtime",
            foreignField: "_id",
            as: "st",
          },
        },
        { $unwind: "$st" },
        {
          $group: {
            _id: "$st.movie",
            bookings: { $sum: 1 },
            totalRevenue: { $sum: "$amount" },
          },
        },
        { $sort: { bookings: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
      ]);

      console.log("🎬 Theater Popular Movies:", result);
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("getTheaterPopularMovies error:", err);
      res.status(500).json({ error: "Failed to load popular movies" });
    }
  },

  /** 🪑 THEATER OCCUPANCY */
  getTheaterOccupancy: async (req, res) => {
    try {
      const theaterIds = await getOwnedTheaterIds(req.user.id);

      const showtimes = await Showtime.find({ theater: { $in: theaterIds } })
        .select("theater seats _id")
        .populate("theater", "name")
        .lean();

      const showtimeMap = {};
      showtimes.forEach((st) => {
        if (!st.theater?._id) return;
        showtimeMap[st._id.toString()] = {
          theaterId: st.theater._id.toString(),
          theaterName: st.theater.name,
          totalSeats: st.seats.length,
        };
      });

      const bookingAgg = await Booking.aggregate([
        {
          $match: {
            showtime: { $in: showtimes.map((s) => s._id) },
            status: "paid",
          },
        },
        {
          $project: {
            showtime: 1,
            seatsCount: { $size: "$seats" },
          },
        },
        { $group: { _id: "$showtime", seatsBooked: { $sum: "$seatsCount" } } },
      ]);

      const theaterAccum = {};
      bookingAgg.forEach((b) => {
        const st = showtimeMap[b._id?.toString()];
        if (!st) return;
        const tId = st.theaterId;
        if (!theaterAccum[tId]) theaterAccum[tId] = { ...st, seatsBooked: 0 };
        theaterAccum[tId].seatsBooked += b.seatsBooked;
      });

      const data = Object.values(theaterAccum).map((t) => ({
        ...t,
        occupancyPct: t.totalSeats
          ? Math.round((t.seatsBooked / t.totalSeats) * 10000) / 100
          : 0,
      }));

      console.log("🪑 Theater Occupancy:", data);
      res.json({ success: true, data });
    } catch (err) {
      console.error("getTheaterOccupancy error:", err);
      res.status(500).json({ error: "Failed to load theater occupancy" });
    }
  },
};

export default theaterController;
