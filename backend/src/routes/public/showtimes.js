import express from "express";
import {
  getShowtimes,
  getShowtimeById,
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

export default router;
