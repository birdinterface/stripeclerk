// middleware.js

export default function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|favicon.ico).*)',
};
