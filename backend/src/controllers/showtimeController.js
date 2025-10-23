import Showtime from "../models/Showtime.js";

/**
 * @desc Get all showtimes (with optional filters)
 * @route GET /api/showtimes
 * @access Public
 */
export const getShowtimes = async (req, res) => {
  try {
    const { movieId, theaterId, date } = req.query;
    const filter = {};

    if (movieId) filter.movie = movieId;
    if (theaterId) filter.theater = theaterId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    }

    const showtimes = await Showtime.find(filter)
      .populate("movie")
      .populate("theater")
      .sort({ startTime: 1 });

    res.json({ data: showtimes });
  } catch (err) {
    console.error("getShowtimes error:", err);
    res.status(500).json({ error: "Failed to fetch showtimes" });
  }
};

/**
 * @desc Get single showtime details (includes seats)
 * @route GET /api/showtimes/:id
 * @access Public
 */
export const getShowtimeById = async (req, res) => {
  try {
    const showtimeDoc = await Showtime.findById(req.params.id)
      .populate("movie", "title language")
      .populate("theater", "name city");

    if (!showtimeDoc)
      return res.status(404).json({ error: "Showtime not found" });

    // Convert Mongoose document to plain object
    const showtime = showtimeDoc.toObject();

    // Ensure every seat has a label for easy frontend use
    showtime.seats = showtime.seats.map((seat) => ({
      ...seat,
      label: seat.seatId || `${seat.row}${seat.number}`,
    }));

    res.json(showtime);
  } catch (err) {
    console.error("getShowtimeById error:", err);
    res.status(500).json({ error: "Failed to fetch showtime details" });
  }
};
