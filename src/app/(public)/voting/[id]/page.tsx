/**
 * Voting Detail Page
 * Detailed voting page for a specific debate
 */

import { useState } from 'react';
import { Suspense } from 'react';
import { VoteButton } from '@/components/debates/VoteButton';
import { VoteResults } from '@/components/voting/VoteResults';
import { VotingInstructions } from '@/components/voting/VotingInstructions';
import { VoteConfirmationDialog } from '@/components/voting/VoteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { useVoteStatus } from '@/hooks/useVoteStatus';
import { useVoteSubscription } from '@/hooks/useVoteSubscription';
import { calculateVoteResults } from '@/lib/voting';

function VotingDetailContent({ debateId }: { debateId: string }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'for' | 'against' | null>(null);

  const { data: voteStatus, loading: statusLoading } = useVoteStatus({ debateId });
  const { voteCounts } = useVoteSubscription({ debateId });

  const handleVoteClick = (side: 'for' | 'against') => {
    setSelectedSide(side);
    setShowConfirmation(true);
  };

  const handleConfirmVote = () => {
    setShowConfirmation(false);
    // Vote will be handled by the VoteButton component
  };

  const results = calculateVoteResults(voteCounts.for, voteCounts.against);

  if (statusLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading debate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <Link href="/debates">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Debates
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Debate Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    Debate #{debateId.slice(0, 8)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={voteStatus?.votingOpen ? 'default' : 'secondary'}>
                      {voteStatus?.votingOpen ? 'Voting Open' : 'Voting Closed'}
                    </Badge>
                    {voteStatus?.votingDeadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Deadline: {new Date(voteStatus.votingDeadline).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{voteCounts.total} votes cast</span>
              </div>
            </CardContent>
          </Card>

          {/* Vote Results */}
          <VoteResults results={results} showWinner={!voteStatus?.votingOpen} />

          {/* Voting Instructions */}
          <VotingInstructions
            votingOpen={voteStatus?.votingOpen || false}
            canChangeVote={voteStatus?.canChangeVote || false}
            votingDeadline={voteStatus?.votingDeadline}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User's Vote Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {voteStatus?.hasVoted ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      You voted {voteStatus.votedSide === 'for' ? 'For' : 'Against'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Voted {voteStatus.votedAt ? new Date(voteStatus.votedAt).toLocaleString() : 'recently'}
                    </p>
                  </div>

                  {voteStatus.canChangeVote && voteStatus.votingOpen && (
                    <p className="text-sm text-muted-foreground">
                      You can change your vote while voting is open.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't voted on this debate yet
                  </p>
                </div>
              )}

              {/* Vote Buttons */}
              <div className="space-y-3">
                <VoteButton
                  debateId={debateId}
                  side="for"
                  disabled={!voteStatus?.canVote}
                  userVote={voteStatus?.votedSide}
                  votingOpen={voteStatus?.votingOpen}
                  onVoteSuccess={() => {
                    setShowConfirmation(false);
                    setSelectedSide(null);
                  }}
                />
                <VoteButton
                  debateId={debateId}
                  side="against"
                  disabled={!voteStatus?.canVote}
                  userVote={voteStatus?.votedSide}
                  votingOpen={voteStatus?.votingOpen}
                  onVoteSuccess={() => {
                    setShowConfirmation(false);
                    setSelectedSide(null);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">For Votes</span>
                <span className="font-semibold text-blue-600">{voteCounts.for}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Against Votes</span>
                <span className="font-semibold text-red-600">{voteCounts.against}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Votes</span>
                <span className="font-semibold">{voteCounts.total}</span>
              </div>
              {results.winner && results.winner !== 'tie' && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Leader</span>
                    <Badge
                      variant="default"
                      className={results.winner === 'for' ? 'bg-blue-600' : 'bg-red-600'}
                    >
                      {results.winner === 'for' ? 'For' : 'Against'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vote Confirmation Dialog */}
      {showConfirmation && selectedSide && (
        <VoteConfirmationDialog
          open={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setSelectedSide(null);
          }}
          onConfirm={handleConfirmVote}
          data={{
            debateId,
            debateTitle: `Debate #${debateId.slice(0, 8)}`,
            debateDescription: 'Review the debate arguments and cast your vote',
            selectedSide,
            forVotes: voteCounts.for,
            againstVotes: voteCounts.against,
            totalVotes: voteCounts.total,
            isFinal: !voteStatus?.canChangeVote,
            canChange: voteStatus?.canChangeVote || false,
          }}
        />
      )}
    </div>
  );
}

export default function VotingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading voting details...</p>
        </div>
      </div>
    }>
      <VotingDetailContent debateId={params.id} />
    </Suspense>
  );
}
