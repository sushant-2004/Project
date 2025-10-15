import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    posterUrl: { type: String },
    genre: { type: String },
    rating: { type: String },
    releaseDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
