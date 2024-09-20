// middleware.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  // Exclude the Stripe webhook endpoint from middleware
  if (req.nextUrl.pathname.startsWith('/api/stripe-webhook')) {
    return NextResponse.next();
  }

  // Your existing middleware logic
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/stripe-webhook).*)', // Exclude '/api/stripe-webhook' from middleware
  ],
};
