import express from "express";
import {
  getMovies,
  searchTmdbMovies,
  getTmdbMovieDetails,
  getMovieById,
} from "../../controllers/movieController.js";

const router = express.Router();

// GET local DB movies (with filters)
router.get("/", getMovies);

// TMDb search (external)
router.get("/tmdb-search", searchTmdbMovies);

// TMDb details (by ID)
router.get("/tmdb/:tmdbId", getTmdbMovieDetails);

// Get movie by ID (local DB)
router.get("/:id", getMovieById);

export default router;
