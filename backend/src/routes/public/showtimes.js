import express from 'express';
import Showtime from '../../models/Showtime.js';
import Movie from '../../models/Movie.js';
import Theater from '../../models/Theater.js';
const router = express.Router();

/**
 * GET /api/showtimes
 * query: ?movieId=&theaterId=&date=YYYY-MM-DD
 *
 * returns showtimes for a movie (or all) optionally filtered by theater and date
 */
router.get('/', async (req, res) => {
  try {
    const { movieId, theaterId, date } = req.query;
    const filter = {};
    if (movieId) filter.movie = movieId;
    if (theaterId) filter.theater = theaterId;
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.startTime = { $gte: start, $lte: end };
    }

    const showtimes = await Showtime.find(filter)
      .populate('movie')
      .populate('theater')
      .sort({ startTime: 1 });

    res.json({ data: showtimes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch showtimes' });
  }
});

/**
 * GET /api/showtimes/:id
 * detail for single showtime (includes seats array)
 */
router.get('/:id', async (req, res) => {
  try {
    const s = await Showtime.findById(req.params.id)
      .populate('movie', 'title language') // fetch only title and language
      .populate('theater', 'name city');   // fetch only name and city

    if (!s) return res.status(404).json({ error: 'Showtime not found' });

    // Convert to plain object
    const showtime = s.toObject();

    // Ensure each seat has a 'label'
    showtime.seats = showtime.seats.map((seat) => ({
      ...seat,
      label: seat.seatId || `${seat.row}${seat.number}`,
    }));

    res.json(showtime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch showtime details' });
  }
});

export default router;
