// server/routes/adminShowtimes.js
import express from "express";
import Showtime from "../../models/Showtime.js";
import Theater from "../../models/Theater.js";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * GET /api/admin/showtimes
 * List all showtimes
 */
router.get("/", async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate("movie")
      .populate("theater")
      .sort({ startTime: 1 });
    res.json({ showtimes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch showtimes" });
  }
});

/**
 * POST /api/admin/showtimes
 * Create new showtime
 */
router.post("/", async (req, res) => {
  try {
    const { movieId, theaterId, screenName, startTime, language, format } = req.body;
    const theater = await Theater.findById(theaterId);
    if (!theater) return res.status(404).json({ error: "Theater not found" });

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

    res.json({ showtime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create showtime" });
  }
});

/**
 * PATCH /api/admin/showtimes/:id
 * Update showtime startTime or seatPrices
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, seatPrices } = req.body;

    const showtime = await Showtime.findById(id);
    if (!showtime) return res.status(404).json({ error: "Showtime not found" });

    if (startTime) showtime.startTime = new Date(startTime);
    if (Array.isArray(seatPrices) && seatPrices.length) {
      seatPrices.forEach((sp) => {
        const seat = showtime.seats.find((s) => s.seatId === sp.seatId);
        if (seat) seat.price = sp.price;
      });
    }

    await showtime.save();
    res.json({ showtime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update showtime" });
  }
});

/**
 * DELETE /api/admin/showtimes/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const st = await Showtime.findByIdAndDelete(req.params.id);
    if (!st) return res.status(404).json({ error: "Showtime not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete showtime" });
  }
});

/**
 * GET /api/admin/showtimes/:id
 * Get single showtime details
 */
router.get("/:id", async (req, res) => {
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
});

export default router;
