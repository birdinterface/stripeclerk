import { Webhook } from 'svix'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const payload = await req.text()
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    try {
      await clerkClient.users.updateUserMetadata(session.metadata?.userId, {
        publicMetadata: {
          stripe: {
            status: session.status,
            payment: session.payment_status
          }
        }
      })
    } catch (err) {
      console.error('Error updating user metadata:', err)
      return res.status(500).end()
    }
  }

  res.status(200).end()
}
