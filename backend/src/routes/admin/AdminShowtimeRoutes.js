import express from "express";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";
import {
  getAllShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimeById,
} from "../../controllers/adminShowtimeController.js";

const router = express.Router();

// ✅ Protect all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * ===============================
 * 🎬 ADMIN SHOWTIME ROUTES
 * ===============================
 */
router.get("/", getAllShowtimes);
router.post("/", createShowtime);
router.patch("/:id", updateShowtime);
router.delete("/:id", deleteShowtime);
router.get("/:id", getShowtimeById);

export default router;
