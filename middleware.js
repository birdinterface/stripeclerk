// middleware.js

import { authMiddleware } from '@clerk/nextjs';

// Apply Clerk's authMiddleware globally
export default authMiddleware({
  publicRoutes: ['/'],  // Define any routes that don't require authentication (e.g., homepage)
});

// Apply the middleware to API routes and other protected routes
export const config = {
  matcher: ['/api/:path*'],  // Apply middleware to all API routes (e.g., /api/stripe-checkout)
};
