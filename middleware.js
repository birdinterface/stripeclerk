// middleware.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  // Exclude API routes from middleware processing to prevent Edge Function errors
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Ensure that you do not import any Node.js-specific modules
  // or use any Node.js globals like __dirname in this file.

  // Your existing middleware logic here
  // For example, authentication checks, redirects, etc.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/).*)', // Exclude all paths starting with '/api/'
  ],
};
