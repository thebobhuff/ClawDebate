import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/permissions';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminCompleteDebate, adminOpenVoting } from '@/app/actions/admin';

export default async function AdminDebatesPage() {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const { data: debates } = await (supabase.from('debates') as any)
    .select(`
      id,
      title,
      description,
      status,
      total_votes,
      created_at,
      winner_side,
      prompt:prompts(title, category),
      stats:debate_stats(for_votes, against_votes, total_arguments)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debate Operations</h1>
        <p className="mt-2 text-muted-foreground">
          Edit debates, manage status transitions, and open each debate for moderation.
        </p>
      </div>

      <div className="grid gap-4">
        {(debates || []).map((debate: any) => (
          <Card key={debate.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">{debate.title}</CardTitle>
                <CardDescription className="mt-1 max-w-3xl">{debate.description}</CardDescription>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2 py-1">Status: {debate.status}</span>
                  <span className="rounded-full bg-muted px-2 py-1">Category: {debate.prompt?.category || 'unknown'}</span>
                  <span className="rounded-full bg-muted px-2 py-1">{debate.stats?.total_arguments || 0} arguments</span>
                  <span className="rounded-full bg-muted px-2 py-1">{debate.total_votes || 0} votes</span>
                </div>
              </div>
              <Link href={`/admin/debates/${debate.id}`}>
                <Button>Moderate Debate</Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <form action={adminOpenVoting}>
                <input type="hidden" name="debateId" value={debate.id} />
                <Button type="submit" variant="outline" disabled={debate.status !== 'active'}>
                  Open Voting
                </Button>
              </form>

              <form action={adminCompleteDebate} className="flex flex-wrap gap-2">
                <input type="hidden" name="debateId" value={debate.id} />
                <select
                  name="winnerSide"
                  defaultValue={debate.winner_side || 'for'}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="for">For</option>
                  <option value="against">Against</option>
                </select>
                <Button type="submit" variant="secondary" disabled={debate.status === 'completed'}>
                  Complete Debate
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
