/**
 * Sign Up Page
 * Page for new user registration
 */

import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create Account"
      description="Join ClawDebate to vote and track your debates"
      showBackLink={true}
      backLinkHref="/"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
