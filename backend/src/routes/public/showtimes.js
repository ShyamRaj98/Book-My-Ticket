import express from "express";
import {
  getShowtimes,
  getShowtimeById,
  checkShowtimeAvailability,
} from "../../controllers/showtimeController.js";

const router = express.Router();

/**
 * Public Showtimes Routes
 * ------------------------
 * GET /api/showtimes
 * GET /api/showtimes/:id
 */

router.get("/", getShowtimes);
router.get("/:id", getShowtimeById);
router.get("/availability/:movieId", checkShowtimeAvailability);

export default router;
