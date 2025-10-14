import express from "express";
import Movie from "../../models/Movie.js";
import { searchTmdb, fetchTmdbMovie } from "../../services/tmdb.js";
const router = express.Router();

/**
 * GET /api/movies
 * query: ?q=title&genre=Action&from=2025-01-01&to=2025-12-31
 * - returns local DB movies matching query
 */
router.get("/", async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: "failed to fetch movies" });
  }
});

/**
 * GET /api/movies/tmdb-search?q=...
 * Search TMDb (external) — useful for admin or to enrich local DB
 */
router.get("/tmdb-search", async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.status(400).json({ error: "query (q) required" });
    const r = await searchTmdb(q, page);
    // return top results (id, title, poster_path, release_date, overview)
    const items = (r.results || []).map((m) => ({
      tmdbId: m.id,
      title: m.title,
      posterPath: m.poster_path,
      releaseDate: m.release_date,
      overview: m.overview,
    }));
    res.json({ page: r.page, totalResults: r.total_results, results: items });
  } catch (err) {
    console.error("tmdb-search err", err);
    res.status(500).json({ error: err.message || "tmdb search failed" });
  }
});

/**
 * GET /api/movies/tmdb/:tmdbId
 * Fetch TMDb detail (useful for admin UI preview)
 */
router.get("/tmdb/:tmdbId", async (req, res) => {
  try {
    const tmdbId = req.params.tmdbId;
    const data = await fetchTmdbMovie(tmdbId);
    res.json(data);
  } catch (err) {
    console.error("tmdb fetch err", err);
    res.status(500).json({ error: err.message || "tmdb fetch failed" });
  }
});

/**
 * GET /api/movies/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const m = await Movie.findById(req.params.id);
    if (!m) return res.status(404).json({ error: "movie not found" });
    res.json(m);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch movie" });
  }
});

export default router;
