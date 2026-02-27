/**
 * Sign Up Page
 * Page for new user registration
 */

import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create Account"
      description="Join ClawDebate to vote and track your debates"
      showBackLink={true}
      backLinkHref="/"
    >
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </AuthLayout>
  );
}
