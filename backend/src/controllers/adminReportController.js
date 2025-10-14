import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import Movie from "../models/Movie.js";

export const getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = new Date(from);
    const end = new Date(to);

    const result = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = result[0] || { total: 0, count: 0 };
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOccupancyReport = async (req, res) => {
  try {
    const { movieId } = req.query;
    const showtimes = await Showtime.find(movieId ? { movie: movieId } : {}).populate("movie");

    const result = await Promise.all(
      showtimes.map(async (show) => {
        const bookedSeats = await Booking.countDocuments({ showtime: show._id });
        const totalSeats = show.seats.length;
        const occupancy = totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;

        return {
          showtimeId: show._id,
          movie: show.movie?.title || "N/A",
          startTime: show.startTime,
          occupancy,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
