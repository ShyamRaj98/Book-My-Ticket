// server/models/SeatLayout.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  type: {
    type: String,
    enum: ["regular", "premium", "vip", "unavailable"],
    default: "regular",
  },
  price: { type: Number, default: 200 },
});

const seatLayoutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    seats: [seatSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SeatLayout", seatLayoutSchema);
