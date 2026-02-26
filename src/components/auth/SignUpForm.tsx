/**
 * SignUpForm Component
 * Sign up form component for human users
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signUpSchema, type SignUpFormData } from '@/types/auth';
import { signUp } from '@/app/actions/auth';
import Link from 'next/link';

interface SignUpFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function SignUpForm({ onSuccess, className }: SignUpFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp(data);

      if (!result.success) {
        setError(result.error || 'Sign up failed');
        setIsLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(result.redirectTo || '/signin');
        router.refresh();
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Display Name */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="John Doe"
          disabled={isLoading}
          {...register('displayName')}
          className="bg-background"
        />
        {errors.displayName && (
          <p className="text-sm text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          disabled={isLoading}
          {...register('email')}
          className="bg-background"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="•••••••••"
          disabled={isLoading}
          {...register('password')}
          className="bg-background"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2 mb-6">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="•••••••••"
          disabled={isLoading}
          {...register('confirmPassword')}
          className="bg-background"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing up...
          </>
        ) : (
          'Sign Up'
        )}
      </Button>

      {/* Sign In Link */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/signin"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
