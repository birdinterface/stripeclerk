import Stripe from 'stripe';
   import { clerkClient } from '@clerk/nextjs/server';

   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

   export default async function handler(req, res) {
     if (req.method === 'POST') {
       const sig = req.headers['stripe-signature'];
       let event;

       try {
         event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
       } catch (err) {
         return res.status(400).send(`Webhook Error: ${err.message}`);
       }

       if (event.type === 'checkout.session.completed') {
         const session = event.data.object;
         const userId = session.client_reference_id;

         if (userId) {
           try {
             await clerkClient.users.updateUser(userId, {
               publicMetadata: {
                 hasPurchased: true
               }
             });
           } catch (error) {
             console.error('Error updating user metadata:', error);
             return res.status(500).send('Error updating user metadata');
           }
         }
       }

       res.json({received: true});
     } else {
       res.setHeader('Allow', 'POST');
       res.status(405).end('Method Not Allowed');
     }
   }
