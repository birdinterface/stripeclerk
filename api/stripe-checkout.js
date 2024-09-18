// api/stripe-checkout.js

import Stripe from 'stripe';
import { withAuth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default withAuth(async function handler(req, res) {
  // Add CORS headers to allow Webflow domain
  res.setHeader('Access-Control-Allow-Origin', 'https://www.advancers.org');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    console.log('Preflight request received and handled.');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Access authentication context from req.auth
      const { userId } = req.auth;

      if (!userId) {
        console.error('Unauthorized access attempt: No user ID found.');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('Authenticated Clerk User ID:', userId);

      // Create a Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: 'price_1PyZeWFT3MWkDNHt66US6J7n',  // Replace with your actual Stripe price ID
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/platform`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        client_reference_id: userId,
      });

      // Log the created session
      console.log('Stripe Checkout Session created:', session);

      // Return the session URL to redirect the user
      res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
});
