// middleware.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  // No middleware logic for now
  return NextResponse.next();
}

// Exclude API routes from middleware to prevent Edge Function issues
export const config = {
  matcher: [
    '/((?!api/).*)', // Matches all paths except those starting with '/api/'
  ],
};
