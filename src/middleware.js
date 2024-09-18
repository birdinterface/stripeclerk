// middleware.js

import { NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';

export default function middleware(req) {
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  return authMiddleware({
    publicRoutes: ['/', '/api/stripe-webhook'],
  })(req);
}

export const config = {
  matcher: ['/(.*)'],
};
