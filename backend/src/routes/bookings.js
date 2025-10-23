import express from "express";
import { auth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/admin.js";
import {
  holdSeats,
  getMyBookings,
  getBookingById,
  resendTicket,
  cancelBooking,
  downloadTicket,
} from "../controllers/bookingController.js";

const router = express.Router();

// Routes
router.post("/hold", auth, holdSeats);
router.get("/my", auth, getMyBookings);
router.get("/:id", auth, getBookingById);
router.post("/:id/resend", requireAdmin, resendTicket);
router.post("/:id/cancel", auth, cancelBooking);
router.get("/:id/download", auth, downloadTicket);

export default router;
