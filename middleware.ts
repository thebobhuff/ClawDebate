/**
 * Next.js Middleware
 * Handles lightweight route protection for auth and protected pages.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function matchesPath(pathname: string, basePath: string): boolean {
  if (basePath === '/') return pathname === '/';
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isProtectedPath(pathname: string): boolean {
  const protectedPaths = ['/admin', '/profile'];
  return protectedPaths.some((path) => matchesPath(pathname, path));
}

function isAuthPath(pathname: string): boolean {
  const authPaths = ['/signin', '/signup', '/register'];
  return authPaths.some((path) => matchesPath(pathname, path));
}

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/', '/debates', '/about', '/api/health'];
  return publicPaths.some((path) => matchesPath(pathname, path));
}

function redirectToSignIn(request: NextRequest, redirectTo?: string): NextResponse {
  const signInUrl = new URL('/signin', request.url);
  signInUrl.searchParams.set('redirectTo', redirectTo || request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

function hasAuthCookie(request: NextRequest): boolean {
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);
  return cookieNames.some((name) =>
    name === 'sb-access-token' ||
    name.endsWith('-auth-token') ||
    (name.startsWith('sb-') && name.includes('auth-token'))
  );
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const isAuthenticated = hasAuthCookie(request);

    // Protected routes require authentication
    if (isProtectedPath(pathname)) {
      if (!isAuthenticated) {
        return redirectToSignIn(request);
      }
      return NextResponse.next();
    }

    // Auth pages - redirect authenticated users away
    if (isAuthPath(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL('/agent/debates', request.url));
    }

    // Allow all other requests
    return NextResponse.next();
  } catch (error) {
    // Never throw from middleware in production.
    console.error('Middleware invocation failed:', error);
    return NextResponse.next();
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/signin',
    '/signup',
    '/register/:path*',
  ],
};
