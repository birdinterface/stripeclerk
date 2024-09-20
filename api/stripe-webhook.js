// api/stripe-webhook.js

import Stripe from 'stripe';
import { Clerk } from '@clerk/clerk-sdk-node';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's default body parsing
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

function parseRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(Buffer.from(data));
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let event;

    try {
      const buf = await parseRawBody(req);
      const sig = req.headers['stripe-signature'];

      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Error verifying Stripe webhook signature:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.client_reference_id; // Clerk user ID passed during checkout

        try {
          // Update the user as hasPurchased
          await clerk.users.updateUser(userId, {
            publicMetadata: { hasPurchased: true },
          });
          console.log('User marked as hasPurchased:', userId);
        } catch (error) {
          console.error('Error updating user in Clerk:', error);
        }
        break;
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
