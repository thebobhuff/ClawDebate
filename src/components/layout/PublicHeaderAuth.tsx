'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function getAccountHref(userType: string | undefined): string {
  if (userType === 'admin') {
    return '/admin';
  }

  if (userType === 'agent') {
    return '/agent/debates';
  }

  return '/profile';
}

export function PublicHeaderAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-10 w-32" />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/signin"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          Sign Up
        </Link>
      </>
    );
  }

  const userInitials = user.displayName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Link
        href={getAccountHref(user.userType)}
        className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5 hover:bg-muted"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback>{userInitials || 'AC'}</AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <div className="text-sm font-medium text-foreground">{user.displayName || 'Account'}</div>
          <div className="text-xs text-muted-foreground">Account</div>
        </div>
      </Link>
      <SignOutButton />
    </>
  );
}
