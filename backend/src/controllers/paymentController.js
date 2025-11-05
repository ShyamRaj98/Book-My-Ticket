// controllers/paymentController.js
import Stripe from "stripe";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const CURRENCY = process.env.CURRENCY || "INR";

/* existing createPaymentIntent (keep as-is) */

export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: "bookingId required" });

    const booking = await Booking.findById(bookingId).populate("showtime");
    if (!booking) return res.status(404).json({ error: "booking not found" });

    if (String(booking.user) !== String(req.user.id))
      return res.status(403).json({ error: "not your booking" });

    // only pending bookings allowed
    if (!["payment_pending", "pending"].includes(booking.status)) {
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

/**
 * UPI endpoint stub
 * - In production, integrate with provider (Stripe UPI support, Razorpay, PayU, etc.)
 * - Should return { upiLink, qrUrl, orderId } or an error
 */
export const createUpiOrder = async (req, res) => {
  try {
    const { bookingId, vpa } = req.body;
    // If you haven't implemented UPI on server, return 501 to indicate not implemented
    // Frontend will detect and disable / show message.
    return res.status(501).json({ error: "UPI integration not implemented on server" });

    // Example (conceptual) using a payment provider:
    // 1. Create an order on provider with amount and metadata
    // 2. Provider returns a UPI deep link or QR image URL
    // 3. Save order id on booking, return link/qr to frontend
    //
    // const booking = await Booking.findById(bookingId);
    // const providerRes = await provider.createUpiOrder({ amount: booking.amount, vpa, metadata: { bookingId }});
    // booking.paymentProviderOrderId = providerRes.orderId;
    // booking.save();
    // return res.json({ upiLink: providerRes.upiLink, qrUrl: providerRes.qrUrl, orderId: providerRes.orderId });
  } catch (err) {
    console.error("createUpiOrder error", err);
    res.status(500).json({ error: "failed to create upi order" });
  }
};

/**
 * UPI status check stub — called by frontend to check whether payment completed
 * Should return { paid: true } when provider confirms payment
 */
export const checkUpiStatus = async (req, res) => {
  try {
    const { bookingId } = req.query;
    // Not implemented: return 501
    return res.status(501).json({ error: "UPI status check not implemented on server" });

    // Example:
    // const booking = await Booking.findById(bookingId);
    // const providerStatus = await provider.checkOrder(booking.paymentProviderOrderId);
    // if (providerStatus.paid) {
    //   booking.status = 'paid';
    //   await booking.save();
    //   return res.json({ paid: true });
    // }
    // return res.json({ paid: false });
  } catch (err) {
    console.error("checkUpiStatus error", err);
    res.status(500).json({ error: "failed to check upi status" });
  }
};

/**
 * Amazon Pay stub
 * - In production: integrate with Amazon Pay SDK / hosted flow; return redirect URL or token
 */
export const createAmazonOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    // Not implemented placeholder
    return res.status(501).json({ error: "Amazon Pay not implemented on server" });

    // Example flow (conceptual):
    // 1. Create Amazon Pay order reference via Amazon Pay API
    // 2. Return a redirect URL or client payload to frontend to continue
  } catch (err) {
    console.error("createAmazonOrder error", err);
    res.status(500).json({ error: "failed to create amazon order" });
  }
};
