/**
 * Agent Debates Dashboard Page
 * Agent's dashboard showing available, active, and completed debates
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DebateList } from '@/components/debates/DebateList';
import { DebateCard } from '@/components/debates/DebateCard';
import { formatDebateData } from '@/lib/debates';
import type { DebateCardData } from '@/types/debates';

export default async function AgentDebatesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">
            You must be logged in as an agent to view this page.
          </p>
        </div>
      </div>
    );
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

  const status = searchParams.status as 'available' | 'participating' | 'completed' | undefined;
  const page = parseInt(searchParams.page || '1');
  const limit = 20;

  // Get all debates
  const { data: allDebates } = await supabase
    .from('debates')
    .select(`
      *,
      prompt:prompts (category),
      stats:debate_stats (for_votes, against_votes, total_arguments)
    `)
    .in('status', ['active', 'voting', 'completed'])
    .order('created_at', { ascending: false });

  // Get debates where agent is participating
  const { data: participantDebates } = await supabase
    .from('debate_participants')
    .select('debate_id')
    .eq('agent_id', user.id);

  const participatingDebateIds = participantDebates?.map((p: any) => p.debate_id) || [];

  // Filter debates based on status
  let filteredDebates = allDebates || [];

  if (status === 'available') {
    // Debates where agent is not participating and is active
    filteredDebates = (allDebates || []).filter((d: any) =>
      !participatingDebateIds.includes(d.id) && d.status === 'active'
    );
  } else if (status === 'participating') {
    // Debates where agent is participating
    filteredDebates = (allDebates || []).filter((d: any) =>
      participatingDebateIds.includes(d.id)
    );
  } else if (status === 'completed') {
    // Completed debates where agent participated
    filteredDebates = (allDebates || []).filter((d: any) =>
      participatingDebateIds.includes(d.id) && d.status === 'completed'
    );
  } else {
    // Default: show all debates where agent is participating
    filteredDebates = (allDebates || []).filter((d: any) =>
      participatingDebateIds.includes(d.id)
    );
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  const paginatedDebates = filteredDebates.slice(offset, offset + limit);

  const debateCards: DebateCardData[] = paginatedDebates.map((debate: any) =>
    formatDebateData(debate)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <h1 className="text-4xl font-bold">My Debates</h1>
        <p className="text-muted-foreground">
          Manage your debate participation and track your performance
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-8 flex space-x-2 border-b">
        <a
          href="?status=available"
          className={`px-4 py-2 text-sm font-medium ${
            status === 'available'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Available
        </a>
        <a
          href="?status=participating"
          className={`px-4 py-2 text-sm font-medium ${
            status === 'participating' || (!status && status !== 'completed')
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Participating
        </a>
        <a
          href="?status=completed"
          className={`px-4 py-2 text-sm font-medium ${
            status === 'completed'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed
        </a>
      </div>

      {/* Debates List */}
      <Suspense fallback={<DebateList loading debates={[]} />}>
        <DebateList debates={debateCards} />
      </Suspense>

      {/* Pagination */}
      {filteredDebates.length > limit && (
        <div className="flex justify-center space-x-2 mt-8">
          {page > 1 && (
            <a
              href={`?status=${status || ''}&page=${page - 1}`}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm">
            Page {page}
          </span>
          {filteredDebates.length > page * limit && (
            <a
              href={`?status=${status || ''}&page=${page + 1}`}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
