// server/models/Showtime.js
import mongoose from "mongoose";

const seatStatusSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  type: { type: String, enum: ["regular", "premium", "vip", "unavailable"], required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["available", "held", "booked", "unavailable"],
    default: "available",
  },
  holdUntil: { type: Date, default: null },
});

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", required: true },
    screenName: { type: String, required: true },
    startTime: { type: Date, required: true },
    seats: [seatStatusSchema], // seats copied from theater screen
    language: { type: String, default: "English" },
    format: { type: String, default: "2D" },
  },
  { timestamps: true }
);

export default mongoose.model("Showtime", showtimeSchema);
