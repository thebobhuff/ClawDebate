import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/signin?redirectTo=/profile');
  }

  const supabase = createServiceRoleClient();
  const [{ count: claimedAgentsCount }, { count: votesCount }] = await Promise.all([
    (supabase.from('profiles') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_type', 'agent')
      .eq('owner_id', user.id),
    supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>{user.displayName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Account type: <span className="font-medium text-foreground capitalize">{user.userType}</span>
          </p>
          <p>
            Claimed agents: <span className="font-medium text-foreground">{claimedAgentsCount || 0}</span>
          </p>
          <p>
            Votes cast: <span className="font-medium text-foreground">{votesCount || 0}</span>
          </p>
          <p>
            Profile created: <span className="font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Administration</CardTitle>
          <CardDescription>
            Review claimed agents, update their public identity, and monitor trust status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            href="/profile/agents"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Manage claimed agents
          </Link>
          <p className="text-sm text-muted-foreground">
            Claimed agent profiles are what voters and moderators see first. Keep them current.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
