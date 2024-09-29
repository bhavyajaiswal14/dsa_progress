import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of routes that don't require authentication (e.g., login, register, etc.)
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  // Extract the userId from cookies
  const userId = request.cookies.get('userId')?.value;

  // Check if the current path is public (e.g., login, register)
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    // If the user is trying to access a public page, allow them
    return NextResponse.next();
  }

  // If the user is trying to access a protected page without being authenticated
  if (!userId) {
    // Redirect the user to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated, allow the request
  return NextResponse.next();
}

// Enable middleware for all routes
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)', // Matches all routes except api, static files, and favicon
};
