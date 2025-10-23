// controllers/paymentController.js
import Stripe from "stripe";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const CURRENCY = process.env.CURRENCY || "INR";

/**
 * Create Payment Intent (Stripe)
 * @route POST /api/payments/create-intent
 * @access Private (User)
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: "bookingId required" });

    const booking = await Booking.findById(bookingId).populate("showtime");
    if (!booking) return res.status(404).json({ error: "booking not found" });

    if (String(booking.user) !== String(req.user.id))
      return res.status(403).json({ error: "not your booking" });

    if (booking.status !== "payment_pending" && booking.status !== "pending") {
      return res.status(400).json({ error: `invalid booking status: ${booking.status}` });
    }

    const amountInMinor = Math.round((booking.amount || 0) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInMinor,
      currency: CURRENCY.toLowerCase(),
      metadata: {
        bookingId: String(booking._id),
        userId: String(req.user.id),
      },
    });

    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("create-intent error:", err);
    res.status(500).json({ error: "failed to create payment intent" });
  }
};
