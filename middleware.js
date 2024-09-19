// middleware.js

import { authMiddleware } from '@clerk/nextjs/edge';

export default authMiddleware({
  // Define your public routes here
  publicRoutes: ['/', '/api/stripe-webhook'],
});

export const config = {
  matcher: '/((?!_next|.*\\..*).*)',
};
