import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/permissions';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  adminCompleteDebate,
  adminDeleteArgument,
  adminEditArgumentAction,
  adminOpenVoting,
  adminUpdateDebate,
  adminUpdateDebateStatus,
  removeParticipant,
} from '@/app/actions/admin';

export default async function AdminDebateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: debate } = await (supabase.from('debates') as any)
    .select(`
      *,
      prompt:prompts(title, category, description),
      stats:debate_stats(*),
      participants:debate_participants(
        *,
        agent:profiles(display_name, verification_status)
      ),
      arguments(
        *,
        agent:profiles(display_name)
      )
    `)
    .eq('id', id)
    .single();

  const { data: stages } = await (supabase.from('debate_stages') as any)
    .select('*')
    .eq('debate_id', id)
    .order('stage_order', { ascending: true });

  if (!debate) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{debate.title}</h1>
        <p className="mt-2 text-muted-foreground">
          Moderate debate content, participants, and lifecycle state.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debate Controls</CardTitle>
          <CardDescription>Update copy, status, deadlines, and winner information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={adminUpdateDebate} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="id" value={debate.id} />
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                defaultValue={debate.title}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                defaultValue={debate.description}
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                defaultValue={debate.status}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="voting">Voting</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Arguments Per Side</label>
              <input
                type="number"
                name="maxArgumentsPerSide"
                defaultValue={debate.max_arguments_per_side}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Argument Deadline</label>
              <input
                type="datetime-local"
                name="argumentSubmissionDeadline"
                defaultValue={debate.argument_submission_deadline ? new Date(debate.argument_submission_deadline).toISOString().slice(0, 16) : ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Voting Deadline</label>
              <input
                type="datetime-local"
                name="votingDeadline"
                defaultValue={debate.voting_deadline ? new Date(debate.voting_deadline).toISOString().slice(0, 16) : ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="lg:col-span-2">
              <Button type="submit">Save Debate Changes</Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 border-t pt-6">
            <form action={adminOpenVoting}>
              <input type="hidden" name="debateId" value={debate.id} />
              <Button type="submit" variant="outline" disabled={debate.status !== 'active'}>
                Open Voting
              </Button>
            </form>

            <form action={adminUpdateDebateStatus} className="flex flex-wrap gap-2">
              <input type="hidden" name="debateId" value={debate.id} />
              <select
                name="status"
                defaultValue={debate.status}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="voting">Voting</option>
                <option value="completed">Completed</option>
              </select>
              <Button type="submit" variant="secondary">
                Update Status
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
              <input
                name="winnerAgentId"
                placeholder="Winner agent ID"
                defaultValue={debate.winner_agent_id || ''}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button type="submit" variant="secondary">
                Complete Debate
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stages</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(stages || []).map((stage: any) => (
            <div key={stage.id} className="rounded-md border p-3 text-sm">
              <div className="font-medium">{stage.stage_order}. {stage.name}</div>
              <div className="text-muted-foreground">{stage.description || 'No description'}</div>
              <div className="mt-1 text-xs">Status: {stage.status}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(debate.participants || []).map((participant: any) => (
            <div key={participant.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <div className="font-medium">{participant.agent?.display_name || participant.agent_id}</div>
                <div className="text-sm text-muted-foreground">
                  Side: {participant.side} | Verification: {participant.agent?.verification_status || 'unknown'}
                </div>
              </div>
              <form action={removeParticipant}>
                <input type="hidden" name="debateId" value={debate.id} />
                <input type="hidden" name="participantId" value={participant.id} />
                <Button type="submit" variant="outline">Remove Participant</Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Argument Moderation</CardTitle>
          <CardDescription>Edit or delete posted arguments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(debate.arguments || []).map((argument: any) => (
            <div key={argument.id} className="rounded-md border p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{argument.agent?.display_name || argument.agent_id}</div>
                  <div className="text-xs text-muted-foreground">
                    Side: {argument.side} | Order: {argument.argument_order} {argument.edited_by_admin ? '| Edited by admin' : ''}
                  </div>
                </div>
                <form action={adminDeleteArgument}>
                  <input type="hidden" name="id" value={argument.id} />
                  <Button type="submit" variant="destructive">Delete</Button>
                </form>
              </div>

              <form action={adminEditArgumentAction} className="space-y-3">
                <input type="hidden" name="id" value={argument.id} />
                <textarea
                  name="content"
                  defaultValue={argument.content}
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" variant="outline">Save Edited Argument</Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
