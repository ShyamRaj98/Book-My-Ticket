// server/routes/payments.js
import express from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import mongoose from 'mongoose';
import { auth } from '../middlewares/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
const CURRENCY = process.env.CURRENCY || 'INR';

/**
 * POST /api/payments/create-intent
 * body: { bookingId }
 * Protected route (user must be logged in)
 */
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

    // load booking
    const booking = await Booking.findById(bookingId).populate('showtime');
    if (!booking) return res.status(404).json({ error: 'booking not found' });
    if (String(booking.user) !== String(req.user.id)) return res.status(403).json({ error: 'not your booking' });
    if (booking.status !== 'payment_pending' && booking.status !== 'pending') {
      return res.status(400).json({ error: `booking status invalid: ${booking.status}` });
    }

    // compute amount in smallest currency unit
    // assume booking.amount is in main unit (e.g., rupees)
    const amountInMinor = Math.round((booking.amount || 0) * 100); // paise

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInMinor,
      currency: CURRENCY.toLowerCase(),
      metadata: {
        bookingId: String(booking._id),
        userId: String(req.user.id)
      }
    });

    // store paymentIntentId on booking (optional)
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error('create-intent error', err);
    res.status(500).json({ error: 'failed to create payment intent' });
  }
});

export default router;
