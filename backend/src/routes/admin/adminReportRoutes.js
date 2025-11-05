import express from "express";
import {
  getSalesReport,
  getPopularMovies,
  getTheaterOccupancy,
  getUserActivity,
  getDashboardSummary,
} from "../../controllers/adminReportController.js";
import { auth } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";

const router = express.Router();

router.use(auth);
router.use(requireAdmin);

router.get("/sales", getSalesReport);
router.get("/popular-movies", getPopularMovies);
router.get("/theater-occupancy", getTheaterOccupancy);
router.get("/user-activity", getUserActivity);
router.get("/summary", getDashboardSummary);

export default router;
