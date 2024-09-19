// api/stripe-checkout.js

import { verifyToken } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';
import fetch from 'node-fetch'; // Ensure node-fetch is installed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.advancers.org');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
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
    const tokenClaims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = tokenClaims.sub;

    if (!userId) {
      console.error('Unauthorized: No user ID found.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      console.log('Authenticated Clerk User ID:', userId);

      // Retrieve user details from Clerk
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!clerkResponse.ok) {
        console.error('Failed to fetch user from Clerk:', await clerkResponse.text());
        return res.status(500).json({ error: 'Failed to retrieve user information' });
      }

      const clerkUser = await clerkResponse.json();
      const userEmail = clerkUser.email_addresses[0].email_address;

      // Create or retrieve a Stripe customer
      // In production, store the customer ID to avoid creating duplicates
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          clerkUserId: userId,
        },
      });

      // Create a Stripe Checkout session with automatic tax collection
      const stripeSession = await stripe.checkout.sessions.create({
        customer: customer.id,
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
        automatic_tax: { enabled: true },
      });

      console.log('Stripe Checkout Session created:', stripeSession);

      // Return the session URL to redirect the user
      res.status(200).json({ sessionId: stripeSession.id, url: stripeSession.url });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
