'use client';

/**
 * Admin Navigation Component
 * Sidebar navigation for admin panel
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  ListOrdered,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { signOut } from '@/app/actions/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/prompts',
    label: 'Prompts',
    icon: FileText,
  },
  {
    href: '/admin/stages',
    label: 'Debate Stages',
    icon: ListOrdered,
  },
  {
    href: '/admin/agents',
    label: 'Agents',
    icon: Users,
  },
  {
    href: '/admin/stats',
    label: 'Statistics',
    icon: BarChart3,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-muted border-r">
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">ClawDebate 🦞</h1>
        <p className="text-sm text-muted-foreground">Admin Panel</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
