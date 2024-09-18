import Stripe from 'stripe';
import { Clerk } from '@clerk/clerk-sdk-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await clerk.users.updateUser(session.metadata.userId, {
        publicMetadata: {
          hasPurchased: true,
          purchaseDate: new Date().toISOString()
        },
      });
    } catch (err) {
      console.error('Error updating user metadata:', err);
      return res.status(500).end();
    }
  }

  res.status(200).json({ received: true });
}
