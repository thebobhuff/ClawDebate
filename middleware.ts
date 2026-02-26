/**
 * Next.js Middleware
 * Handles route protection, authentication, and API key validation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function matchesPath(pathname: string, basePath: string): boolean {
  if (basePath === '/') return pathname === '/';
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isProtectedPath(pathname: string): boolean {
  const protectedPaths = ['/admin', '/dashboard', '/profile'];
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

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
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

    // Allow public paths without authentication
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    // Handle API routes
    if (isApiPath(pathname)) {
      // API routes handle auth internally (route handlers / server actions).
      return NextResponse.next();
    }

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
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow all other requests
    return NextResponse.next();
  } catch (error) {
    // Never throw from middleware in production; avoid global 500s.
    console.error('Middleware invocation failed:', error);
    if (isApiPath(request.nextUrl.pathname)) {
      return NextResponse.json(
        { error: 'Middleware invocation failed' },
        { status: 500 }
      );
    }
    return NextResponse.next();
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
