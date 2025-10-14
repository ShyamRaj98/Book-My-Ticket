import express from "express";
import Booking from "../../models/Booking.js";
import Report from "../../models/Report.js";
import Showtime from "../../models/Showtime.js";
import { requireAdmin } from "../../middlewares/admin.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

// 📊 SALES REPORT (Last 7 Days)
router.get("/sales", auth, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = new Date(from);
    const end = new Date(to);

    // Calculate total sales & bookings
    const result = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = result[0] || { total: 0, count: 0 };

    // Top 5 movies by sales
    const topMovies = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: "paid" } },
      {
        $group: {
          _id: "$movie.title",
          totalSales: { $sum: "$amount" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          title: "$_id",
          totalSales: 1,
        },
      },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Report.findOneAndUpdate(
      { date: today },
      {
        $set: {
          date: today,
          totalSales: data.total,
          totalBookings: data.count,
          topMovies,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      totalSales: data.total || 0,
      totalBookings: data.count || 0,
      topMovies,
    });
  } catch (err) {
    console.error("❌ getSalesReport error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🎟️ OCCUPANCY REPORT
router.get("/occupancy", auth, requireAdmin, async (req, res) => {
  try {
    const showtimes = await Showtime.find({})
      .populate("movie", "title")
      .populate("theater", "name seatLayout")
      .lean();

    const data = showtimes.map((s) => {
      const totalSeats = s.theater?.seatLayout?.length || 0;
      const bookedSeats = s.bookedSeats?.length || 0;
      const occupancy =
        totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;

      return {
        movie: s.movie?.title || "Unknown",
        theater: s.theater?.name || "N/A",
        startTime: s.startTime,
        occupancy: parseFloat(occupancy),
      };
    });

    res.json(data);
  } catch (err) {
    console.error("❌ getOccupancyReport error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
