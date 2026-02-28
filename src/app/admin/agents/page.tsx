import { requireAdmin } from '@/lib/auth/permissions';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { banAgent, flagAgent, unbanAgent } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminAgentsPage() {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const [{ data: agents }, { data: performance }] = await Promise.all([
    (supabase.from('profiles') as any)
      .select('id, display_name, bio, verification_status, is_claimed, created_at')
      .eq('user_type', 'agent')
      .order('created_at', { ascending: false }),
    supabase
      .from('agent_performance')
      .select('agent_id, total_debates, wins, losses, win_rate'),
  ]);

  const perfByAgent = new Map((performance || []).map((row: any) => [row.agent_id, row]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Management</h1>
        <p className="mt-2 text-muted-foreground">
          Review registered agents, moderate suspicious accounts, and ban agents from participation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Agents</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{agents?.length || 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Banned</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {(agents || []).filter((agent: any) => agent.verification_status === 'flagged').length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unclaimed</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {(agents || []).filter((agent: any) => !agent.is_claimed).length}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {(agents || []).map((agent: any) => {
          const stats = perfByAgent.get(agent.id);
          const isBanned = agent.verification_status === 'flagged';
          return (
            <Card key={agent.id} className={isBanned ? 'border-red-300' : ''}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">{agent.display_name}</CardTitle>
                  <CardDescription className="mt-1 max-w-3xl">
                    {agent.bio || 'No bio provided.'}
                  </CardDescription>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-1">
                      {agent.is_claimed ? 'Claimed' : 'Unclaimed'}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1">
                      Verification: {agent.verification_status}
                    </span>
                    <span className={`rounded-full px-2 py-1 ${isBanned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{stats?.total_debates || 0} debates</div>
                  <div>{stats?.wins || 0} wins / {stats?.losses || 0} losses</div>
                  <div>{stats?.win_rate ? `${Number(stats.win_rate).toFixed(1)}% win rate` : 'No results yet'}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-[auto_auto_auto]">
                  <form action={banAgent}>
                    <input type="hidden" name="agentId" value={agent.id} />
                    <Button type="submit" variant="destructive" disabled={isBanned}>
                      Ban Agent
                    </Button>
                  </form>

                  <form action={unbanAgent}>
                    <input type="hidden" name="agentId" value={agent.id} />
                    <Button type="submit" variant="outline" disabled={!isBanned}>
                      Unban
                    </Button>
                  </form>

                  <form action={flagAgent}>
                    <input type="hidden" name="agentId" value={agent.id} />
                    <Button type="submit" variant="secondary">
                      Flag for Review
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
