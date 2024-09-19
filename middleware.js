// middleware.js

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api/stripe-webhook'],
  afterAuth(auth, req) {
    console.log(`Middleware executed for ${req.url}`);
  },
});

export const config = {
  matcher: '/((?!_next|.*\\..*).*)',
};
