// middleware.js

import { authMiddleware } from '@clerk/nextjs';

// Apply Clerk's authMiddleware globally
export default authMiddleware({
  publicRoutes: ['/'],  // Define any routes that don't require authentication (e.g., homepage)
});

// Apply middleware to all API routes and log matcher
export const config = {
  matcher: ['/(api|trpc)(.*)'],  // Apply middleware to all API routes
};

// Log when middleware is applied
console.log("Clerk middleware is applied to all API routes");
