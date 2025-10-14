// server/routes/bookings.js
import express from "express";
import mongoose from "mongoose";
import Showtime from "../models/Showtime.js";
import Booking from "../models/Booking.js";
import { auth } from "../middlewares/auth.js";
import { generateTicketPDF } from "../utils/generateTicketPDF.js";
import { sendTicketEmail } from "../utils/sendTicketEmail.js";
import { requireAdmin } from "../middlewares/admin.js";

const router = express.Router();



/**
 * POST /api/bookings/hold
 * Protected: user must be logged in.
 * Body: { showtimeId: string, seats: string[] } // seats are seatId like "A1","B3"
 *
 * Behavior:
 * - Start a mongoose transaction.
 * - Verify each requested seat is currently status 'available'.
 * - Mark them 'held' and set holdUntil = now + HOLD_MINUTES.
 * - Create a Booking record with status 'payment_pending' (amount calculated from seat prices).
 * - Return bookingId and hold expiry timestamp.
 */
const HOLD_MINUTES = parseInt(process.env.HOLD_MINUTES || "15", 10);

router.post("/hold", auth, async (req, res) => {
  const { showtimeId, seats } = req.body;

  if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
    return res
      .status(400)
      .json({ error: "showtimeId and non-empty seats[] are required" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Load showtime document in transaction
    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) throw new Error("Showtime not found");

    const now = new Date();
    const holdUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    // Validate and fetch seat docs
    const seatDocs = seats.map((sid) => {
      const seat = showtime.seats.find((x) => x.seatId === sid);
      return seat;
    });

    // Ensure all seats exist
    if (seatDocs.some((s) => !s)) {
      throw new Error("One or more selected seats do not exist");
    }

    // Ensure seats are available (not booked or held)
    for (const s of seatDocs) {
      if (s.status === "booked" || s.status === "unavailable") {
        throw new Error(`Seat ${s.seatId} is already booked or unavailable`);
      }
      if (s.status === "held" && s.holdUntil && s.holdUntil > now) {
        throw new Error(`Seat ${s.seatId} is currently held by another user`);
      }
    }

    // Mark seats as held
    for (const s of seatDocs) {
      s.status = "held";
      s.holdUntil = holdUntil;
    }

    // Calculate total amount
    const amount = seatDocs.reduce((acc, s) => acc + (s.price || 0), 0);

    // Create booking document (within transaction)
    const bookingDocs = await Booking.create(
      [
        {
          user: req.user.id,
          showtime: showtime._id,
          seats: seatDocs.map((s) => ({
            seatId: s.seatId,
            price: s.price,
            type: s.type,
          })),
          amount,
          currency: process.env.CURRENCY || "INR",
          status: "payment_pending",
          holdUntil,
        },
      ],
      { session }
    );

    await showtime.save({ session });
    await session.commitTransaction();
    session.endSession();

    const booking = bookingDocs[0];
    return res.json({
      ok: true,
      bookingId: booking._id,
      holdUntil: holdUntil.toISOString(),
      amount: booking.amount,
      currency: booking.currency,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("hold error:", err);
    return res.status(400).json({
      error: err.message || "Failed to hold seats",
    });
  }
});

/**
 * GET /api/bookings/my
 * returns bookings for current user
 */
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "showtime",
        populate: [{ path: "movie" }, { path: "theater" }],
      })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error("fetch my bookings error", err);
    res.status(500).json({ error: "failed to fetch bookings" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id)
      .populate({
        path: "showtime",
        populate: [{ path: "movie" }, { path: "theater" }],
      })
      .populate("user");
    if (!b) return res.status(404).json({ error: "booking not found" });
    if (String(b.user._id) !== String(req.user.id))
      return res.status(403).json({ error: "not your booking" });
    res.json({ booking: b });
  } catch (err) {
    console.error("get booking", err);
    res.status(500).json({ error: "failed to get booking" });
  }
});

// POST /api/bookings/:id/resend
router.post("/:id/resend", requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate({ path: "showtime", populate: ["movie", "theater"] });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "paid")
      return res.status(400).json({ error: "Booking not paid" });

    const pdf = await generateTicketPDF(booking);
    await sendTicketEmail(booking.user.email, booking, pdf);

    res.json({ message: "Ticket re-sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend ticket" });
  }
});

export default router;
