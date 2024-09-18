import Stripe from 'stripe';
   import { getAuth } from '@clerk/nextjs/server';

   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

   export default async function handler(req, res) {
     if (req.method === 'POST') {
       try {
         const { userId } = getAuth(req);
         
         if (!userId) {
           return res.status(401).json({ error: 'Unauthorized' });
         }

         const session = await stripe.checkout.sessions.create({
           line_items: [
             {
               price: 'price_1PyZeWFT3MWkDNHt66US6J7n',
               quantity: 1
             }
           ],
           mode: 'payment',
           success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/platform`,
           cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
           client_reference_id: userId,
         });

         res.status(200).json({ sessionId: session.id, url: session.url });
       } catch (error) {
         console.error('Error creating checkout session:', error);
         res.status(500).json({ error: 'Failed to create checkout session' });
       }
     } else {
       res.setHeader('Allow', 'POST');
       res.status(405).end('Method Not Allowed');
     }
   }
