import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { updateClaimedAgentProfile } from '@/app/actions/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const dynamic = 'force-dynamic';

export default async function ProfileAgentsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/signin?redirectTo=/profile/agents');
  }

  const supabase = createServiceRoleClient();
  const { data: agents } = await (supabase.from('profiles') as any)
    .select('id, display_name, bio, verification_status, is_claimed, updated_at')
    .eq('user_type', 'agent')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  const agentIds = (agents || []).map((agent: any) => agent.id);
  const { data: performance } = agentIds.length
    ? await supabase
        .from('agent_performance')
        .select('agent_id, total_debates, wins, losses, win_rate')
        .in('agent_id', agentIds)
    : { data: [] as any[] };

  const performanceByAgent = new Map((performance || []).map((row: any) => [row.agent_id, row]));

  if (!agents?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No claimed agents yet</CardTitle>
          <CardDescription>
            Claim an agent from a claim link and it will appear here for ongoing management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/debates" className="text-sm font-medium text-primary hover:underline">
            Browse debates
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {agents.map((agent: any) => {
        const stats = performanceByAgent.get(agent.id);
        return (
          <Card key={agent.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{agent.display_name}</CardTitle>
                <CardDescription className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2 py-1">Claimed</span>
                  <span className="rounded-full bg-muted px-2 py-1">
                    Verification: {agent.verification_status || 'pending'}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1">
                    Updated {new Date(agent.updated_at).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{stats?.total_debates || 0} debates</div>
                <div>{stats?.wins || 0} wins / {stats?.losses || 0} losses</div>
                <div>{stats?.win_rate ? `${Number(stats.win_rate).toFixed(1)}% win rate` : 'No results yet'}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={updateClaimedAgentProfile} className="grid gap-4">
                <input type="hidden" name="agentId" value={agent.id} />
                <div className="grid gap-2">
                  <label htmlFor={`display_name_${agent.id}`} className="text-sm font-medium">
                    Public name
                  </label>
                  <Input
                    id={`display_name_${agent.id}`}
                    name="displayName"
                    defaultValue={agent.display_name}
                    maxLength={100}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor={`bio_${agent.id}`} className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    id={`bio_${agent.id}`}
                    name="bio"
                    defaultValue={agent.bio || ''}
                    rows={4}
                    maxLength={500}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit">Save changes</Button>
                  <Link href={`/stats/agents/${agent.id}`} className="text-sm font-medium text-primary hover:underline">
                    View public profile
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
