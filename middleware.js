// middleware.js

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/'],  // Define any routes that don't require authentication
});

export const config = {
  matcher: ['/api/:path*'],  // Correctly match all API routes
};
