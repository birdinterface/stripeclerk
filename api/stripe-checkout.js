// api/stripe-checkout.js

import { sessions } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.advancers.org');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Preflight request received and handled.');
    return res.status(200).end();
  }

  // Extract the token from the Authorization header
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    console.error('Unauthorized: No authorization header.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authorizationHeader.replace('Bearer ', '');

  try {
    // Verify the session token
    const session = await sessions.verifySessionToken(token);
    const userId = session.userId;

    if (!userId) {
      console.error('Unauthorized: No user ID found.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      console.log('Authenticated Clerk User ID:', userId);

      // Create a Stripe Checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: 'price_1PyZeWFT3MWkDNHt66US6J7n', // Replace with your actual Stripe price ID
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/platform`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        client_reference_id: userId,
      });

      console.log('Stripe Checkout Session created:', stripeSession);

      // Return the session URL to redirect the user
      res.status(200).json({ sessionId: stripeSession.id, url: stripeSession.url });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error verifying session token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
