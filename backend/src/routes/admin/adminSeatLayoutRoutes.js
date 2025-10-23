import express from "express";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";
import {
  createLayout,
  getLayouts,
  getLayoutById,
  updateLayout,
  deleteLayout,
} from "../../controllers/adminSeatLayoutController.js";

const router = express.Router();

// ✅ Protect all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * ===============================
 * 🎟️ SEAT LAYOUT ROUTES
 * ===============================
 */
router.post("/seat-layouts", createLayout);
router.get("/seat-layouts", getLayouts);
router.get("/seat-layouts/:id", getLayoutById);
router.put("/seat-layouts/:id", updateLayout);
router.delete("/seat-layouts/:id", deleteLayout);

export default router;
