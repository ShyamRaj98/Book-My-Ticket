import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number },
  title: { type: String, required: true },
  genres: [{ type: String }],
  runtime: { type: Number },
  posterPath: { type: String },
  releaseDate: { type: Date },
  overview: { type: String },
  language: { type: String }
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);
