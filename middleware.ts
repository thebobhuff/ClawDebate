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

      try {
        // Validate API key
        await validateAgentApiKey(apiKey);
        return NextResponse.next();
      } catch (error) {
        console.error('[Middleware] API key validation failed:', error);
        return createApiUnauthorizedResponse('Invalid API key');
      }
    }

function redirectToSignIn(request: NextRequest, redirectTo?: string): NextResponse {
  const signInUrl = new URL('/signin', request.url);
  signInUrl.searchParams.set('redirectTo', redirectTo || request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

  // Check if required environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing required environment variables:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });
    
    // In production, allow request to proceed if env vars are missing
    // This prevents the app from completely breaking
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Middleware] Proceeding without authentication due to missing environment variables');
      return NextResponse.next();
    }
    
    // In development, show a helpful error
    return new NextResponse(
      'Missing required environment variables. Please check your .env.local file.',
      { status: 500 }
    );
  }

  try {
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
        try {
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
        } catch (error) {
          console.error('[Middleware] Error fetching user profile:', error);
          // If we can't fetch the profile, just redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }

    // Allow all other requests
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);
    
    // In production, allow request to proceed on errors
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Middleware] Proceeding despite error:', error);
      return NextResponse.next();
    }
    
    // In development, show the error
    return new NextResponse(
      `Middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
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
