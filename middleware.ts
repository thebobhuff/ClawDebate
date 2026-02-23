/**
 * Next.js Middleware
 * Handles route protection, authentication, and API key validation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateAgentApiKey } from '@/lib/supabase/auth';
import {
  isProtectedPath,
  isAuthPath,
  isPublicPath,
  isApiPath,
  isAgentApiPath,
  extractApiKey,
  redirectToSignIn,
  redirectToHome,
  createApiUnauthorizedResponse,
} from '@/lib/auth/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Handle API routes
  if (isApiPath(pathname)) {
    // Agent API routes require API key authentication
    if (isAgentApiPath(pathname)) {
      const apiKey = extractApiKey(request);
      
      if (!apiKey) {
        return createApiUnauthorizedResponse('API key required');
      }

      try {
        // Validate API key
        await validateAgentApiKey(apiKey);
        return NextResponse.next();
      } catch (error) {
        console.error('API key validation failed:', error);
        return createApiUnauthorizedResponse('Invalid API key');
      }
    }

    // Other API routes may have their own authentication
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
