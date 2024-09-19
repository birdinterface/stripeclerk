// middleware.js

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Define your public routes here
  publicRoutes: ['/', '/api/stripe-webhook'],
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static files (e.g., favicon.ico, robots.txt)
     */
    '/((?!_next|.*\\..*).*)',
  ],
};
