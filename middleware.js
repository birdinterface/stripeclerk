// middleware.js

import { authMiddleware } from '@clerk/nextjs';

// Apply Clerk's authMiddleware globally
export default authMiddleware({
  publicRoutes: ['/'],  // Define any routes that don't require authentication (e.g., homepage)
});

// Apply the middleware to ALL routes, including all API routes
export const config = {
  matcher: ['/(api|trpc)(.*)'],  // This will apply middleware to all API routes and any other paths under `/api` or `/trpc`
};
