import express from 'express';
import Screening from '../models/Screening.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { movie } = req.query;
  const filter = movie ? { movie } : {};
  const screenings = await Screening.find(filter).populate('movie').sort({ startTime: 1 });
  res.json({ screenings });
});

router.get('/:id', async (req, res) => {
  const screening = await Screening.findById(req.params.id).populate('movie');
  if (!screening) return res.status(404).json({ error: 'Not found' });
  res.json({ screening });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const screening = await Screening.create(req.body);
  res.status(201).json({ screening });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const screening = await Screening.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!screening) return res.status(404).json({ error: 'Not found' });
  res.json({ screening });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const screening = await Screening.findByIdAndDelete(req.params.id);
  if (!screening) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
