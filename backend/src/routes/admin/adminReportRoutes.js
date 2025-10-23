import express from "express";
import { auth } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";
import {
  getSalesReport,
  getOccupancyReport,
} from "../../controllers/adminReportController.js";

const router = express.Router();

/**
 * ===============================
 * 📊 SALES REPORT (Last 7 Days)
 * GET /api/admin/reports/sales?from=&to=
 * ===============================
 */
router.get("/sales", auth, requireAdmin, getSalesReport);

/**
 * ===============================
 * 🎟️ OCCUPANCY REPORT
 * GET /api/admin/reports/occupancy?movieId=
 * ===============================
 */
router.get("/occupancy", auth, requireAdmin, getOccupancyReport);

export default router;
