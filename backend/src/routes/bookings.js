import express from 'express';
import Booking from '../models/Booking.js';
import Screening from '../models/Screening.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const filter = req.user.isAdmin ? {} : { user: req.user.id };
  const bookings = await Booking.find(filter).populate({ path: 'screening', populate: { path: 'movie' } }).sort({ createdAt: -1 });
  res.json({ bookings });
});

router.post('/preview', requireAuth, async (req, res) => {
  // Returns calculated amount and verifies seat availability without creating a booking
  const { screeningId, seats } = req.body;
  const screening = await Screening.findById(screeningId);
  if (!screening) return res.status(404).json({ error: 'Screening not found' });
  const unavailable = seats.some((s) => screening.seatsBooked.includes(s));
  if (unavailable) return res.status(409).json({ error: 'Some seats are already booked' });
  // Calculate amount with categories if defined, fallback to seatPrice
  const seatPriceMap = new Map();
  for (const cat of screening.categories || []) {
    for (const seat of cat.seats) seatPriceMap.set(seat, cat.price);
  }
  const amount = seats.reduce((sum, seat) => sum + (seatPriceMap.get(seat) ?? screening.seatPrice), 0);
  res.json({ amount });
});

router.post('/confirm', requireAuth, async (req, res) => {
  // Finalize booking after successful payment (client provides verified paymentIntent status)
  const { screeningId, seats, amount, stripePaymentIntentId } = req.body;
  const screening = await Screening.findById(screeningId);
  if (!screening) return res.status(404).json({ error: 'Screening not found' });
  // Re-check availability atomically
  const conflict = seats.some((s) => screening.seatsBooked.includes(s));
  if (conflict) return res.status(409).json({ error: 'Seats just got booked by someone else' });

  // Lock seats and create booking
  screening.seatsBooked.push(...seats);
  await screening.save();

  const booking = await Booking.create({
    user: req.user.id,
    screening: screening._id,
    seats,
    amount,
    paymentStatus: 'succeeded',
    stripePaymentIntentId,
  });

  res.status(201).json({ booking });
});

// Cancel a booking: user can cancel own booking before showtime; admin can cancel any time
router.post('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('screening');
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const isOwner = booking.user.toString() === req.user.id;
  if (!isOwner && !req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  // If not admin, ensure showtime is in future
  if (!req.user.isAdmin && new Date(booking.screening.startTime) <= new Date()) {
    return res.status(400).json({ error: 'Cannot cancel after showtime' });
  }
  // Free seats
  const screening = await Screening.findById(booking.screening._id);
  screening.seatsBooked = screening.seatsBooked.filter(s => !booking.seats.includes(s));
  await screening.save();
  booking.paymentStatus = 'cancelled';
  await booking.save();
  res.json({ ok: true });
});

// Admin summary: totals and per-movie revenue
router.get('/summary', requireAuth, requireAdmin, async (_req, res) => {
  const succeeded = await Booking.aggregate([
    { $match: { paymentStatus: 'succeeded' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const totals = succeeded[0] || { totalRevenue: 0, count: 0 };

  const byMovie = await Booking.aggregate([
    { $match: { paymentStatus: 'succeeded' } },
    { $lookup: { from: 'screenings', localField: 'screening', foreignField: '_id', as: 'screen' } },
    { $unwind: '$screen' },
    { $lookup: { from: 'movies', localField: 'screen.movie', foreignField: '_id', as: 'movie' } },
    { $unwind: '$movie' },
    { $group: { _id: '$movie._id', title: { $first: '$movie.title' }, revenue: { $sum: '$amount' }, bookings: { $sum: 1 } } },
    { $sort: { revenue: -1 } }
  ]);

  res.json({ totalRevenue: totals.totalRevenue, totalBookings: totals.count, byMovie });
});

export default router;
