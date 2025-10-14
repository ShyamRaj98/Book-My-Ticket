import mongoose from 'mongoose';

mongoose.models = {}; // clear old model cache

const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String },
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
    seats: [seatSchema],
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["payment_pending", "paid"], default: "payment_pending" },
    holdUntil: { type: Date },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
