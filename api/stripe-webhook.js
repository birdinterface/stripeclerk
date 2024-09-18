import Stripe from 'stripe';
import { clerkClient } from '@clerk/clerk-sdk-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`Payment successful for session ID: ${session.id}`);
    try {
      await clerkClient.users.updateUserMetadata(session.metadata?.userId, {
        publicMetadata: {
          stripe: {
            status: session.status,
            payment: session.payment_status
          }
        }
      });
      console.log('Successfully updated user metadata');
    } catch (err) {
      console.error('Error updating user metadata:', err);
      return res.status(500).end();
    }
  }

  res.status(200).json({ received: true });
}
