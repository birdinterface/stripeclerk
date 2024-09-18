import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { Readable } from 'stream';

// Initialize the Stripe client with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Disable the automatic body parser for this route
export const config = {
  api: {
    bodyParser: false,  // Required to process the raw body for Stripe webhook signature verification
  },
};

// Helper function to convert a stream to a buffer
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let event;

    try {
      // Read the raw body from the request
      const buf = await buffer(req);
      const sig = req.headers['stripe-signature'];

      // Verify the webhook signature with Stripe
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the Stripe checkout session completion event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;

      if (userId) {
        try {
          // Update Clerk user metadata to reflect the purchase
          await clerkClient.users.updateUser(userId, {
            publicMetadata: {
              hasPurchased: true,
            },
          });
        } catch (error) {
          console.error('Error updating user metadata:', error);
          return res.status(500).send('Error updating user metadata');
        }
      }
    }

    // Return a successful response to Stripe
    res.json({ received: true });
  } else {
    // Handle unsupported methods
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
