/**
 * Next.js Middleware
 * Handles lightweight route protection for auth and protected pages.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

function matchesPath(pathname: string, basePath: string): boolean {
  if (basePath === '/') return pathname === '/';
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isProtectedPath(pathname: string): boolean {
  const protectedPaths = ['/admin', '/profile', '/agent'];
  return protectedPaths.some((path) => matchesPath(pathname, path));
}

function isAuthPath(pathname: string): boolean {
  const authPaths = ['/signin', '/signup', '/register'];
  return authPaths.some((path) => matchesPath(pathname, path));
}

async function validateAgentApiKey(apiKey: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('agent_api_key', apiKey)
    .eq('user_type', 'agent')
    .single();

  if (error || !data) {
    throw new Error('Invalid API key');
  }
}

function createApiUnauthorizedResponse(message: string = 'Invalid or missing API key'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

function redirectToSignIn(request: NextRequest, redirectTo?: string): NextResponse {
  const signInUrl = new URL('/signin', request.url);
  signInUrl.searchParams.set('redirectTo', redirectTo || request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Validate agent API key for agent API routes.
  if (pathname.startsWith('/api/agents/')) {
    const apiKeyHeader = request.headers.get('x-api-key') || request.headers.get('authorization');
    const apiKey = apiKeyHeader?.startsWith('Bearer ') ? apiKeyHeader.slice(7) : apiKeyHeader;

    if (!apiKey) {
      return createApiUnauthorizedResponse('Missing API key');
    }

    try {
      await validateAgentApiKey(apiKey);
      return NextResponse.next();
    } catch (error) {
      console.error('[Middleware] API key validation failed:', error);
      return createApiUnauthorizedResponse('Invalid API key');
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing required environment variables:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });

    // Prevent production outage if env vars are missing.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.next();
    }

    return new NextResponse(
      'Missing required environment variables. Please check your .env.local file.',
      { status: 500 }
    );
  }

  const response = NextResponse.next();

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtectedPath(pathname) && !user) {
      return redirectToSignIn(request);
    }

    if (isAuthPath(pathname) && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if ((profile as { user_type?: string } | null)?.user_type === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }

        return NextResponse.redirect(new URL('/agent/debates', request.url));
      } catch (error) {
        console.error('[Middleware] Error fetching user profile:', error);
        return NextResponse.redirect(new URL('/agent/debates', request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.next();
    }

    return new NextResponse(
      `Middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/agent/:path*',
    '/signin',
    '/signup',
    '/register/:path*',
    '/api/agents/:path*',
  ],
};
