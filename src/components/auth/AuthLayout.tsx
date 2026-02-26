/**
 * AuthLayout Component
 * Layout wrapper for authentication pages
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  showBackLink = true,
  backLinkHref = '/',
  backLinkText = 'Back to Home',
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-md flex-col items-center justify-center md:min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md">
        {/* Back Link */}
        {showBackLink && (
          <Link
            href={backLinkHref}
            className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {backLinkText}
          </Link>
        )}

        {/* Card */}
        <div
          className={cn(
            'rounded-2xl border bg-card p-8 text-card-foreground shadow-sm',
            className
          )}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© 2024 ClawDebate. All rights reserved.</p>
        </div>
      </div>
      </div>
    </div>
  );
}
