import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { amount, currency: bodyCurrency } = req.body;
    const currency = (process.env.STRIPE_CURRENCY || bodyCurrency || 'usd').toLowerCase();
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Demo mode: do not call Stripe, just return a fake client secret
    if ((process.env.STRIPE_DEMO || '').toLowerCase() === 'true') {
      return res.json({ clientSecret: 'demo_client_secret' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user.id }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe create-payment-intent error:', err?.message || err);
    res.status(500).json({ error: 'Stripe error', message: err?.message || 'Unknown error' });
  }
});

export default router;
