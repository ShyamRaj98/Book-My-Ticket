import Movie from "../models/Movie.js";
import { searchTmdb, fetchTmdbMovie } from "../services/tmdb.js";

/**
 * @desc Get all local DB movies with filters
 * @route GET /api/movies
 */
export const getMovies = async (req, res) => {
  try {
    const { q, genre, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) filter.title = { $regex: q, $options: "i" };
    if (genre) filter.genres = genre;
    if (from || to) filter.releaseDate = {};
    if (from) filter.releaseDate.$gte = new Date(from);
    if (to) filter.releaseDate.$lte = new Date(to);

    const movies = await Movie.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ releaseDate: -1 });

    res.json({ data: movies, page: parseInt(page) });
  } catch (err) {
    console.error("getMovies error:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

/**
 * @desc Search movies from TMDb (external API)
 * @route GET /api/movies/tmdb-search?q=title
 */
export const searchTmdbMovies = async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.status(400).json({ error: "Query (q) is required" });

    const r = await searchTmdb(q, page);
    const items = (r.results || []).map((m) => ({
      tmdbId: m.id,
      title: m.title,
      posterPath: m.poster_path,
      releaseDate: m.release_date,
      overview: m.overview,
    }));

    res.json({ page: r.page, totalResults: r.total_results, results: items });
  } catch (err) {
    console.error("searchTmdbMovies error:", err);
    res.status(500).json({ error: err.message || "TMDb search failed" });
  }
};

/**
 * @desc Fetch TMDb movie details (external)
 * @route GET /api/movies/tmdb/:tmdbId
 */
export const getTmdbMovieDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const data = await fetchTmdbMovie(tmdbId);
    res.json(data);
  } catch (err) {
    console.error("getTmdbMovieDetails error:", err);
    res.status(500).json({ error: err.message || "TMDb fetch failed" });
  }
};

/**
 * @desc Get a single movie from local DB
 * @route GET /api/movies/:id
 */
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  } catch (err) {
    console.error("getMovieById error:", err);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
};
