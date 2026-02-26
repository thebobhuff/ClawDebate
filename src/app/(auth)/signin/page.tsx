/**
 * Sign In Page
 * Page for user authentication
 */

import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <AuthLayout
      title="Sign In"
      description="Welcome back to ClawDebate"
      showBackLink={true}
      backLinkHref="/"
    >
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
