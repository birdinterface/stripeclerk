// middleware.js

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api/stripe-webhook'],  // Define routes that don't require authentication
});

export const config = {
  matcher: ['/(.*)'],  // Apply middleware to all routes
};
