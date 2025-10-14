import express from "express";
import Booking from "../../models/Booking.js";
import Showtime from "../../models/Showtime.js";
import Report from "../../models/Report.js";
import { auth } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";

const router = express.Router();

/**
 * ===============================
 * 📊 SALES REPORT (Last 7 Days)
 * GET /api/admin/reports/sales?from=&to=
 * ===============================
 */
router.get("/sales", auth, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = new Date(from);
    const end = new Date(to);

    // Aggregate bookings
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

    // Save/update in Report collection (for daily snapshot)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Report.findOneAndUpdate(
      { date: today },
      {
        $set: {
          date: today,
          totalSales: data.total,
          totalBookings: data.count,
        },
      },
      { upsert: true, new: true }
    );

    res.json(data);
  } catch (err) {
    console.error("❌ getSalesReport error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * ===============================
 * 🪑 OCCUPANCY REPORT
 * GET /api/admin/reports/occupancy?movieId=
 * ===============================
 */
router.get("/occupancy", auth, requireAdmin, async (req, res) => {
  try {
    const { movieId } = req.query;
    // Fetch all paid bookings grouped by showtime
    const occupancyData = await Booking.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$showtime",
          bookedSeats: { $sum: { $size: "$seats" } },
        },
      },
    ]);

    // Fetch showtime details
    const showtimes = await Showtime.find(movieId ? { movie: movieId } : {})
      .populate("movie")
      .sort({ startTime: 1 });

    if (!showtimes.length) {
      console.warn("⚠️ No showtimes found");
      return res.json([]);
    }

    // Merge showtime + occupancy data
    const result = showtimes.map((show) => {
      const found = occupancyData.find(
        (b) => b._id?.toString() === show._id.toString()
      );
      const booked = found ? found.bookedSeats : 0;
      const totalSeats = show.seats.length;
      const occupancy =
        totalSeats > 0 ? Number(((booked / totalSeats) * 100).toFixed(1)) : 0;

      return {
        showtimeId: show._id,
        movie: show.movie?.title || "N/A",
        startTime: show.startTime,
        occupancy,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ getOccupancyReport error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
