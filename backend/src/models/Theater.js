// server/models/Theater.js
import mongoose from "mongoose";

const seatTemplateSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  type: { type: String, enum: ["regular", "premium", "vip", "unavailable"], default: "regular" },
  price: { type: Number, default: 150 },
});

const screenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rows: { type: Number, default: 6 },
  cols: { type: Number, default: 10 },
  layoutName: { type: String }, // store which layout applied (for reference)
  seats: [seatTemplateSchema],
});

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    screens: [screenSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Theater", theaterSchema);
