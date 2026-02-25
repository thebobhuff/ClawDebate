/**
 * Single Debate View Page
 * Public page showing a specific debate with all details
 */

import { notFound } from 'next/navigation';
import { getDebateWithDetails } from '@/lib/supabase/debates';
import { DebateView } from '@/components/debates/DebateView';
import { DebateTimeline } from '@/components/debates/DebateTimeline';
import { ShareButtons } from '@/components/debates/ShareButtons';
import { VoteResults } from '@/components/voting/VoteResults';
import { VotingInstructions } from '@/components/voting/VotingInstructions';
import { VoteButton } from '@/components/debates/VoteButton';
import { prepareDebateViewData } from '@/lib/debates';
import { calculateVoteResults } from '@/lib/voting';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Vote as VoteIcon } from 'lucide-react';

interface DebatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DebatePage({ params }: DebatePageProps) {
  const { id } = await params;
  const debate = await getDebateWithDetails(id);

  if (!debate) {
    notFound();
  }

  const debateViewData = prepareDebateViewData(debate as any);

  // Calculate vote results
  const forVotes = (debate as any).stats?.for_votes || 0;
  const againstVotes = (debate as any).stats?.against_votes || 0;
  const voteResults = calculateVoteResults(forVotes, againstVotes);

  const isVotingOpen = (debate as any).status === 'voting';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Debate View */}
        <div className="lg:col-span-2 space-y-6">
          <DebateView debateViewData={debateViewData} />

          {/* Vote Results - Prominently Displayed */}
          <VoteResults
            results={voteResults}
            showWinner={!isVotingOpen}
            compact={false}
          />

          {/* Voting Instructions */}
          <VotingInstructions
            votingOpen={isVotingOpen}
            canChangeVote={isVotingOpen}
            votingDeadline={(debate as any).voting_deadline}
            compact={true}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DebateTimeline debate={debate as any} />

          {/* Quick Stats */}
          <div className="rounded-lg bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium">{(debate as any).status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max Arguments</span>
                <span className="text-sm font-medium">{(debate as any).max_arguments_per_side}</span>
              </div>
              {(debate as any).stats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Arguments</span>
                    <span className="text-sm font-medium">{(debate as any).stats.total_arguments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Votes</span>
                    <span className="text-sm font-medium">
                      {(debate as any).stats.for_votes + (debate as any).stats.against_votes}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Voting Section */}
          <div className="rounded-lg bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <VoteIcon className="h-5 w-5" />
              Vote on This Debate
            </h3>
            <div className="space-y-3">
              <VoteButton
                debateId={id}
                side="for"
                disabled={!isVotingOpen}
                votingOpen={isVotingOpen}
              />
              <VoteButton
                debateId={id}
                side="against"
                disabled={!isVotingOpen}
                votingOpen={isVotingOpen}
              />
            </div>
            {isVotingOpen && (
              <Link href={`/voting/${id}`}>
                <Button variant="outline" className="w-full">
                  View Voting Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* Share */}
          <div className="rounded-lg bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Share This Debate</h3>
            <ShareButtons title={(debate as any).title} />
          </div>
        </div>
      </div>
    </div>
  );
}
