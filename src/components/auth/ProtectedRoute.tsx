/**
 * ProtectedRoute Component
 * Higher-order component to protect routes that require authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import type { AuthUser } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
  requireAgent?: boolean;
  requireHuman?: boolean;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo,
  requireAdmin = false,
  requireAgent = false,
  requireHuman = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function checkAuth() {
      try {
        if (!authUser) {
          // User is not authenticated
          const redirectPath = redirectTo || '/signin';
          router.push(redirectPath);
          return;
        }

        // Check role-specific requirements
        if (requireAdmin && authUser.userType !== 'admin') {
          setError('Admin access required');
          router.push('/');
          return;
        }

        if (requireAgent && authUser.userType !== 'agent') {
          setError('Agent access required');
          router.push('/');
          return;
        }

        if (requireHuman && authUser.userType !== 'human') {
          setError('Human access required');
          router.push('/');
          return;
        }

      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Failed to check authentication');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router, redirectTo, requireAdmin, requireAgent, requireHuman, authUser, authLoading]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      )
    );
  }

  // Show error state
  if (error) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="text-purple-500 hover:text-purple-400 underline"
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    );
  }

  // Show protected content
  return <>{children}</>;
}
