import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalSales: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  topMovies: [
    {
      movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
      title: String,
      totalSales: Number,
    },
  ],
});

export default mongoose.model("Report", reportSchema);
