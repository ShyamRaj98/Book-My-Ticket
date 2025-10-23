// controllers/stripeWebhookController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import { generateTicketPDF } from "../utils/generateTicketPDF.js";
import { sendTicketEmail } from "../utils/sendTicketEmail.js";
import { sendConfirmationEmail } from "../services/emailService.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (!webhookSecret) {
      event = JSON.parse(req.body.toString());
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const bookingId = intent.metadata?.bookingId;

      if (!bookingId) {
        console.warn("⚠️ payment_intent.succeeded missing bookingId metadata");
        return res.json({ received: true });
      }

      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // Load booking
        const booking = await Booking.findById(bookingId)
          .populate("user")
          .session(session);
        if (!booking) throw new Error("Booking not found");

        if (booking.status === "paid") {
          await session.commitTransaction();
          session.endSession();
          return res.json({ received: true });
        }

        // Load showtime and related info
        const populatedShowtime = await Showtime.findById(booking.showtime)
          .populate("movie")
          .populate("theater")
          .session(session);
        if (!populatedShowtime) throw new Error("Showtime not found");

        // Mark held seats as booked
        for (const bs of booking.seats) {
          const seat = populatedShowtime.seats.find(
            (s) => s.seatId === bs.seatId
          );
          if (!seat) throw new Error(`Seat ${bs.seatId} not found`);
          seat.status = "booked";
          seat.holdUntil = null;
        }

        // Update booking
        booking.status = "paid";
        booking.paymentIntentId = intent.id;

        await populatedShowtime.save({ session });
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        console.log(`✅ Booking ${bookingId} finalized as PAID`);

        // Generate and send ticket email
        try {
          const pdfPath = await generateTicketPDF({
            ...booking.toObject(),
            showtime: populatedShowtime,
          });
          await sendTicketEmail(
            booking.user.email,
            booking,
            populatedShowtime,
            pdfPath
          );
          console.log("✅ Ticket PDF sent successfully");
        } catch (e) {
          console.error("⚠️ Ticket email failed:", e);
        }

        // Optional confirmation email
        try {
          await sendConfirmationEmail(booking);
        } catch (e) {
          console.error("⚠️ Confirmation email failed:", e);
        }
      } catch (txErr) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Failed to finalize booking:", txErr);
        return res.status(500).send("Failed to finalize booking");
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).send("Webhook handler error");
  }
};
