import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import Report from "../models/Report.js";

/**
 * =====================================
 * 📊 SALES REPORT CONTROLLER
 * =====================================
 */
export const getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = new Date(from);
    const end = new Date(to);

    // 🔹 Total sales and booking count
    const result = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
          status: { $in: ["paid", "completed", "success"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = result[0] || { total: 0, count: 0 };

    // 🔹 Top Movies by Sales
    const topMovies = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
          status: { $in: ["paid", "completed", "success"] },
        },
      },
      {
        $group: {
          _id: "$movie.title",
          totalSales: { $sum: "$amount" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, title: "$_id", totalSales: 1 } },
    ]);

    // 🔹 Save/update report in DB
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
};

/**
 * =====================================
 * 🎟️ OCCUPANCY REPORT CONTROLLER
 * =====================================
 */
export const getOccupancyReport = async (req, res) => {
  try {
    const { movieId } = req.query;

    // Paid bookings grouped by showtime
    const occupancyData = await Booking.aggregate([
      { $match: { status: { $in: ["paid", "completed", "success"] } } },
      {
        $group: {
          _id: "$showtime",
          bookedSeats: { $sum: { $size: "$seats" } },
        },
      },
    ]);

    // Showtime details
    const showtimes = await Showtime.find(movieId ? { movie: movieId } : {})
      .populate("movie")
      .sort({ startTime: 1 });

    const result = showtimes.map((show) => {
      const found = occupancyData.find(
        (b) => b._id?.toString() === show._id.toString()
      );
      const booked = found ? found.bookedSeats : 0;
      const totalSeats = show.seats?.length || 0;
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
};
