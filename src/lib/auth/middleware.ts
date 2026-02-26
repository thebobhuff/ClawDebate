/**
 * Middleware Helper Functions
 * Helper functions for authentication middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAgentApiKey } from '@/lib/supabase/auth';
import type { AgentAuthContext } from '@/types/auth';
import type { Database } from '@/types/supabase';

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: NextRequest): string | null {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization');
  if (!apiKey) {
    return null;
  }
  // Handle both "Bearer token" and raw token formats
  if (apiKey.startsWith('Bearer ')) {
    return apiKey.slice(7);
  }
  return apiKey;
}

/**
 * Validate API key and return agent context
 */
export async function validateApiKey(request: NextRequest): Promise<AgentAuthContext | null> {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return null;
  }

  try {
    const agent = await validateAgentApiKey(apiKey);
    const agentData = agent as Database['public']['Tables']['profiles']['Row'];
    return {
      agentId: agentData.id,
      agentName: agentData.display_name,
      capabilities: agentData.agent_capabilities as Record<string, any> | null,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Check if request is from an authenticated agent
 */
export async function isAgentRequest(request: NextRequest): Promise<boolean> {
  const agentContext = await validateApiKey(request);
  return agentContext !== null;
}

/**
 * Get agent context from request
 */
export async function getAgentContext(request: NextRequest): Promise<AgentAuthContext | null> {
  return validateApiKey(request);
}

/**
 * Check if path is protected (requires authentication)
 */
export function isProtectedPath(pathname: string): boolean {
  const protectedPaths = [
    '/admin',
    '/agent/debates',
    '/profile',
  ];
  return protectedPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if path is auth path (sign in, sign up, etc.)
 */
export function isAuthPath(pathname: string): boolean {
  const authPaths = [
    '/signin',
    '/signup',
    '/register',
  ];
  return authPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if path is public (no authentication required)
 */
export function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/debates',
    '/about',
    '/api/health',
  ];
  return publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if path is API route
 */
export function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/**
 * Check if path is agent API route
 */
export function isAgentApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/agents/');
}

/**
 * Redirect to sign in page
 */
export function redirectToSignIn(request: NextRequest, redirectTo?: string): NextResponse {
  const signInUrl = new URL('/signin', request.url);
  if (redirectTo) {
    signInUrl.searchParams.set('redirectTo', redirectTo);
  } else {
    signInUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
  }
  return NextResponse.redirect(signInUrl);
}

/**
 * Redirect to home page
 */
export function redirectToHome(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/', request.url));
}

/**
 * Redirect to dashboard
 */
export function redirectToDashboard(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/agent/debates', request.url));
}

/**
 * Redirect to admin panel
 */
export function redirectToAdmin(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/admin', request.url));
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function createForbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Create unauthorized response for API routes
 */
export function createApiUnauthorizedResponse(message: string = 'Invalid or missing API key'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Handle missing authentication
 */
export function handleMissingAuth(request: NextRequest): NextResponse {
  if (isApiPath(request.nextUrl.pathname)) {
    return createApiUnauthorizedResponse();
  }
  return redirectToSignIn(request);
}

/**
 * Handle forbidden access
 */
export function handleForbiddenAccess(request: NextRequest, message?: string): NextResponse {
  if (isApiPath(request.nextUrl.pathname)) {
    return createForbiddenResponse(message);
  }
  return NextResponse.redirect(new URL('/', request.url));
}

/**
 * Get redirect URL from query params
 */
export function getRedirectUrl(request: NextRequest): string | null {
  const redirectTo = request.nextUrl.searchParams.get('redirectTo');
  return redirectTo;
}

/**
 * Validate redirect URL (prevent open redirect attacks)
 */
export function isValidRedirectUrl(url: string, request: NextRequest): boolean {
  try {
    const redirectUrl = new URL(url, request.url);
    const currentOrigin = new URL(request.url).origin;
    return redirectUrl.origin === currentOrigin;
  } catch {
    return false;
  }
}

/**
 * Get safe redirect URL
 */
export function getSafeRedirectUrl(request: NextRequest, defaultUrl: string = '/'): string {
  const redirectTo = getRedirectUrl(request);
  if (redirectTo && isValidRedirectUrl(redirectTo, request)) {
    return redirectTo;
  }
  return defaultUrl;
}
