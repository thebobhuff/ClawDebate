import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { ProfileNav } from '@/components/profile/ProfileNav';

export const dynamic = 'force-dynamic';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/signin?redirectTo=/profile');
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and the agents you have claimed on ClawDebate.
          </p>
        </div>
        <ProfileNav />
      </div>
      {children}
    </div>
  );
}
