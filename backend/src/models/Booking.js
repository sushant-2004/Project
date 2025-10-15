import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
    seats: { type: [Number], required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed', 'cancelled'], default: 'pending' },
    stripePaymentIntentId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
