/**
 * Next.js Middleware
 * Handles route protection, authentication, and API key validation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If env is missing, fail open to avoid runtime 500s from middleware.
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Middleware missing Supabase env vars.');
      return NextResponse.next();
    }

    // Create Supabase client for middleware
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Check authentication status
    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes require authentication
    if (isProtectedPath(pathname)) {
      if (!user) {
        return redirectToSignIn(request);
      }
      return NextResponse.next();
    }

    // Auth pages - redirect authenticated users away
    if (isAuthPath(pathname)) {
      if (user) {
        // Get user type to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profile) {
          const userType = (profile as any).user_type;
          if (userType === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          } else if (userType === 'agent') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          } else {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
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
