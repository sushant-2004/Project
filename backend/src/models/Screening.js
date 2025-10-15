import mongoose from 'mongoose';

const screeningSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    startTime: { type: Date, required: true },
    auditorium: { type: String, required: true },
    seatPrice: { type: Number, required: true },
    seatsTotal: { type: Number, required: true },
    seatsBooked: { type: [Number], default: [] },
    // Optional categories: e.g., [{ name: 'Silver', price: 200, seats: [1,2,...] }, { name: 'Gold', price: 300, seats: [21,...]}]
    categories: {
      type: [
        new mongoose.Schema(
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            seats: { type: [Number], default: [] },
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model('Screening', screeningSchema);
