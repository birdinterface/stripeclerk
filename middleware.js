// middleware.js

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Define your public routes here
  publicRoutes: ['/', '/api/stripe-webhook'],
});

// Apply middleware to all routes
export const config = {
  matcher: '/((?!_next|.*\\..*).*)', // Matches all routes except _next and files with extensions
};
