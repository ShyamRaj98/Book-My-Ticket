import mongoose from "mongoose";
import fs from "fs";
import Showtime from "../models/Showtime.js";
import Booking from "../models/Booking.js";
import { generateTicketPDF } from "../utils/generateTicketPDF.js";
import { sendTicketEmail } from "../utils/sendTicketEmail.js";

const HOLD_MINUTES = parseInt(process.env.HOLD_MINUTES || "15", 10);
const CURRENCY = process.env.CURRENCY || "INR";

/**
 * POST /api/bookings/hold
 * Hold seats temporarily before payment
 */
export const holdSeats = async (req, res) => {
  const { showtimeId, seats } = req.body;

  if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
    return res
      .status(400)
      .json({ error: "showtimeId and non-empty seats[] are required" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) throw new Error("Showtime not found");

    const now = new Date();
    const holdUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    const seatDocs = seats.map((sid) =>
      showtime.seats.find((x) => x.seatId === sid)
    );
    if (seatDocs.some((s) => !s)) throw new Error("Invalid seat(s) selected");

    for (const s of seatDocs) {
      if (["booked", "unavailable"].includes(s.status))
        throw new Error(`Seat ${s.seatId} already booked`);
      if (s.status === "held" && s.holdUntil > now)
        throw new Error(`Seat ${s.seatId} currently held`);

      s.status = "held";
      s.holdUntil = holdUntil;
    }

    const amount = seatDocs.reduce((sum, s) => sum + (s.price || 0), 0);

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
          currency: CURRENCY,
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
    res.json({
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
    res.status(400).json({ error: err.message || "Failed to hold seats" });
  }
};

/**
 * GET /api/bookings/my
 * Fetch all bookings of logged-in user
 */
export const getMyBookings = async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

/**
 * GET /api/bookings/:id
 * Get single booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "showtime",
        populate: [{ path: "movie" }, { path: "theater" }],
      })
      .populate("user");

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (String(booking.user._id) !== String(req.user.id))
      return res.status(403).json({ error: "Not authorized" });

    res.json({ booking });
  } catch (err) {
    console.error("get booking error", err);
    res.status(500).json({ error: "Failed to get booking" });
  }
};

/**
 * POST /api/bookings/:id/resend
 * Admin can resend paid booking ticket email
 */
export const resendTicket = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate({ path: "showtime", populate: ["movie", "theater"] });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "paid")
      return res.status(400).json({ error: "Booking not paid" });

    const pdf = await generateTicketPDF(booking);
    await sendTicketEmail(booking.user.email, booking, pdf);
    fs.unlink(pdf, () => {}); // delete PDF after sending

    res.json({ message: "Ticket re-sent successfully" });
  } catch (err) {
    console.error("resend error:", err);
    res.status(500).json({ error: "Failed to resend ticket" });
  }
};

/**
 * POST /api/bookings/:id/cancel
 * User cancels a booking (only before showtime start)
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("showtime")
      .populate("user");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (String(booking.user._id) !== String(req.user.id))
      return res.status(403).json({ error: "Not authorized" });

    const now = new Date();
    if (booking.showtime.startTime <= now)
      return res
        .status(400)
        .json({ error: "Cannot cancel after showtime start" });

    if (booking.status !== "paid")
      return res
        .status(400)
        .json({ error: "Only paid bookings can be canceled" });

    const showtime = await Showtime.findById(booking.showtime._id);
    showtime.seats.forEach((s) => {
      if (booking.seats.some((bs) => bs.seatId === s.seatId)) {
        s.status = "available";
        s.holdUntil = null;
      }
    });

    await showtime.save();
    await Booking.findByIdAndDelete(booking._id);

    res.json({ message: "Booking canceled successfully" });
  } catch (err) {
    console.error("cancel error:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

/**
 * GET /api/bookings/:id/download
 * Download ticket as PDF and auto-delete after download
 */
export const downloadTicket = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate({ path: "showtime", populate: ["movie", "theater"] });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (String(booking.user._id) !== String(req.user.id))
      return res.status(403).json({ error: "Not authorized" });
    if (booking.status !== "paid")
      return res.status(400).json({ error: "Payment not completed" });

    const pdfPath = await generateTicketPDF(booking);
    res.download(pdfPath, `ticket-${booking._id}.pdf`, (err) => {
      fs.unlink(pdfPath, () => {}); // Always delete after download
      if (err) console.error("Download error:", err);
    });
  } catch (err) {
    console.error("download error:", err);
    res.status(500).json({ error: "Failed to download ticket" });
  }
};
