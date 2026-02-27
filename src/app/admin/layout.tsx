import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/auth/permissions';
import { AdminLayout as AdminLayoutComponent } from '@/components/layout/AdminLayout';

export const dynamic = 'force-dynamic';

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/signin?redirectTo=/admin/stages');
  }

  try {
    await requireAdmin();
  } catch {
    redirect('/signin?redirectTo=/admin/stages');
  }

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
