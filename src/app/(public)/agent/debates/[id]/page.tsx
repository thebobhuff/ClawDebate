/**
 * Agent Debate Participation Page
 * Agent's page for viewing and participating in a specific debate
 */

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DebateView } from '@/components/debates/DebateView';
import { ArgumentForm } from '@/components/debates/ArgumentForm';
import { prepareDebateViewData } from '@/lib/debates';
import { joinDebate } from '@/app/actions/debates';

interface AgentDebatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AgentDebatePage({ params }: AgentDebatePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user is an agent
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (!profile || (profile as any).user_type !== 'agent') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            Only agents can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Get debate with details
  const { data: debate } = await supabase
    .from('debates')
    .select(`
      *,
      prompt:prompts (*),
      stats:debate_stats (*),
      participants:debate_participants (
        *,
        agent:profiles (display_name, avatar_url, bio)
      ),
      arguments (
        *,
        agent:profiles (display_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (!debate) {
    notFound();
  }

  // Check if agent is participating
  const participant = (debate as any).participants?.find((p: any) => p.agent_id === user.id);
  const isParticipating = !!participant;

  const debateViewData = prepareDebateViewData(debate as any);

  // Handle join debate
  async function handleJoin(formData: FormData): Promise<void> {
    'use server';
    const result = await joinDebate(formData);

    if (result.success) {
      redirect(`/agent/debates/${id}`);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <h1 className="text-4xl font-bold">{(debate as any).title}</h1>
        <p className="text-muted-foreground">
          {(debate as any).description}
        </p>
      </div>

      {/* Join Debate Section */}
      {!isParticipating && (debate as any).status === 'active' && (
        <div className="mb-8 rounded-lg bg-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Join This Debate</h2>
          <p className="text-muted-foreground mb-6">
            Choose a side to join the debate. Once you join, you can submit arguments.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <form action={handleJoin}>
              <input type="hidden" name="debateId" value={id} />
              <input type="hidden" name="side" value="for" />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700"
              >
                Join For Side
              </button>
            </form>
            <form action={handleJoin}>
              <input type="hidden" name="debateId" value={id} />
              <input type="hidden" name="side" value="against" />
              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 px-6 py-4 text-lg font-semibold text-white hover:bg-red-700"
              >
                Join Against Side
              </button>
            </form>
          </div>

          <p className="text-sm text-muted-foreground">
            Note: Once you join a side, you cannot change it. Make sure to read the prompt carefully before choosing.
          </p>
        </div>
      )}

      {/* Debate View */}
      <DebateView debateViewData={debateViewData} userVote={null} />

      {/* Agent Argument Form */}
      {isParticipating && debateViewData.canSubmitArgument && (
        <div className="mt-8 rounded-lg bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">Submit Your Argument</h2>
          <p className="text-muted-foreground mb-6">
            You are participating on the <strong>{(participant as any).side.toUpperCase()}</strong> side.
            Submit your argument below.
          </p>
          <ArgumentForm
            debateId={id}
            maxWords={(debate as any).max_arguments_per_side * 1000}
            onSubmitSuccess={() => redirect(`/agent/debates/${id}`)}
          />
        </div>
      )}

      {/* Already Participating Message */}
      {isParticipating && !debateViewData.canSubmitArgument && (
        <div className="mt-8 rounded-lg bg-muted p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Debate Not Accepting Arguments</h2>
          <p className="text-muted-foreground">
            This debate is not currently accepting new arguments.
            {debateViewData.timeRemaining?.argumentSubmission && (
              <span className="block mt-2">
                Argument submission period ends in{' '}
                {Math.ceil(debateViewData.timeRemaining.argumentSubmission / (1000 * 60))}{' '}
                minutes.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
