'use client';

/**
 * Admin Header Component
 * Header component for admin panel with user info
 */

import { getAuthUser } from '@/lib/auth/session';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { useState } from 'react';

export function AdminHeader() {
  const [user, setUser] = useState<any>(null);

  // Load user data on mount
  useState(() => {
    getAuthUser().then(setUser);
  });

  const userInitials = user?.displayName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page Title */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.displayName || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">
              {user?.userType || 'Admin'}
            </p>
          </div>
          <Avatar>
            <AvatarImage src={user?.avatarUrl || undefined} />
            <AvatarFallback>{userInitials || 'AD'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
