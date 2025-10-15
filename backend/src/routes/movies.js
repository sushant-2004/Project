import express from 'express';
import Movie from '../models/Movie.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.json({ movies });
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Not found' });
  res.json({ movie });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({ movie });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!movie) return res.status(404).json({ error: 'Not found' });
  res.json({ movie });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
