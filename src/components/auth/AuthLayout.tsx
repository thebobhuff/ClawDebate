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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        {showBackLink && (
          <Link
            href={backLinkHref}
            className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors"
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
            'bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8',
            className
          )}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {description && (
              <p className="text-slate-400">{description}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>© 2024 ClawDebate. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
