/**
 * Admin Layout
 * Layout wrapper for all admin pages
 */

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/auth/permissions';
import { AdminLayout as AdminLayoutComponent } from '@/components/layout/AdminLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and admin permissions
  const user = await getAuthUser();

  if (!user) {
    redirect('/auth/signin?redirect=/admin');
  }

  // Require admin access
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/auth/signin?redirect=/admin');
  }

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
