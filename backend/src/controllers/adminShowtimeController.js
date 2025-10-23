import Showtime from "../models/Showtime.js";
import Theater from "../models/Theater.js";

/**
 * ===============================
 * 🎬 GET ALL SHOWTIMES
 * GET /api/admin/showtimes
 * ===============================
 */
export const getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate("movie")
      .populate("theater")
      .sort({ startTime: 1 });
    res.json({ showtimes });
  } catch (err) {
    console.error("❌ getAllShowtimes error:", err);
    res.status(500).json({ error: "Failed to fetch showtimes" });
  }
};

/**
 * ===============================
 * 🎬 CREATE SHOWTIME
 * POST /api/admin/showtimes
 * ===============================
 */
export const createShowtime = async (req, res) => {
  try {
    const { movieId, theaterId, screenName, startTime, language, format } = req.body;
    const theater = await Theater.findById(theaterId);
    if (!theater) return res.status(404).json({ error: "Theater not found" });

    const screen = theater.screens.find((s) => s.name === screenName);
    if (!screen) return res.status(404).json({ error: "Screen not found" });

    // Clone seats into showtime
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

    res.json({ showtime });
  } catch (err) {
    console.error("❌ createShowtime error:", err);
    res.status(500).json({ error: "Failed to create showtime" });
  }
};

/**
 * ===============================
 * 🎬 UPDATE SHOWTIME
 * PATCH /api/admin/showtimes/:id
 * ===============================
 */
export const updateShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, seatPrices } = req.body;

    const showtime = await Showtime.findById(id);
    if (!showtime) return res.status(404).json({ error: "Showtime not found" });

    if (startTime) showtime.startTime = new Date(startTime);

    if (Array.isArray(seatPrices) && seatPrices.length) {
      seatPrices.forEach((sp) => {
        const seat = showtime.seats.find((s) => s.seatId === sp.seatId);
        if (seat && typeof sp.price === "number") {
          seat.price = sp.price;
        }
      });
    }

    await showtime.save();
    res.json({ showtime });
  } catch (err) {
    console.error("❌ updateShowtime error:", err);
    res.status(500).json({ error: "Failed to update showtime" });
  }
};

/**
 * ===============================
 * 🎬 DELETE SHOWTIME
 * DELETE /api/admin/showtimes/:id
 * ===============================
 */
export const deleteShowtime = async (req, res) => {
  try {
    const st = await Showtime.findByIdAndDelete(req.params.id);
    if (!st) return res.status(404).json({ error: "Showtime not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ deleteShowtime error:", err);
    res.status(500).json({ error: "Failed to delete showtime" });
  }
};

/**
 * ===============================
 * 🎬 GET SINGLE SHOWTIME
 * GET /api/admin/showtimes/:id
 * ===============================
 */
export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("movie", "title posterPath")
      .populate("theater", "name location");

    if (!showtime) return res.status(404).json({ error: "Showtime not found" });
    res.json({ showtime });
  } catch (err) {
    console.error("❌ getShowtimeById error:", err);
    res.status(500).json({ error: "Failed to fetch showtime" });
  }
};
