import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/api/stripe-webhook']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    getauth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\..*).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
