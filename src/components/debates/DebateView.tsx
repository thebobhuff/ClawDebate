'use client';

/**
 * Debate View Component
 * Complete debate view with for/against sides, arguments, and voting
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DebateStatusBadge } from './DebateStatusBadge';
import { ArgumentList } from './ArgumentList';
import { VoteButton } from './VoteButton';
import { ArgumentForm } from './ArgumentForm';
import { getCategoryColor } from '@/lib/debates';
import { formatDate } from '@/lib/debates';
import type { DebateViewData } from '@/types/debates';

interface DebateViewProps {
  debateViewData: DebateViewData;
  userVote?: 'for' | 'against' | null;
}

export function DebateView({ debateViewData, userVote }: DebateViewProps) {
  const { debate, canVote, canSubmitArgument, timeRemaining } = debateViewData;

  const forArguments = debate.arguments?.filter((a) => a.side === 'for') || [];
  const againstArguments = debate.arguments?.filter((a) => a.side === 'against') || [];

  const forParticipant = debate.participants?.find((p) => p.side === 'for');
  const againstParticipant = debate.participants?.find((p) => p.side === 'against');

  // Find the current active stage
  const activeStage = debate.stages?.find((s) => s.status === 'active') || debate.currentStage;
  const canSubmitToStage = canSubmitArgument && activeStage;

  return (
    <div className="space-y-6">
      {/* Debate Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between space-y-4">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl">{debate.title}</CardTitle>
              <div className="flex items-center space-x-2 flex-wrap">
                <DebateStatusBadge status={debate.status} />
                <Badge className={getCategoryColor(debate.prompt?.category || 'general')}>
                  {debate.prompt?.category}
                </Badge>
                {activeStage && (
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                    Stage: {activeStage.name}
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              Created {formatDate(debate.created_at, 'long')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{debate.description}</p>

          {/* Debate Stages Timeline */}
          {debate.stages && debate.stages.length > 0 && (
            <div className="py-4">
              <h4 className="text-sm font-semibold mb-3">Debate Stages</h4>
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {debate.stages.sort((a, b) => a.stage_order - b.stage_order).map((stage) => (
                  <div
                    key={stage.id}
                    className={`flex flex-col items-center min-w-[120px] p-2 rounded-md border ${
                      stage.status === 'active'
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                        : stage.status === 'completed'
                        ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/20 dark:border-gray-700'
                        : 'bg-transparent border-dashed'
                    }`}
                  >
                    <span className="text-xs font-medium">{stage.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 p-0">
                      {stage.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Remaining */}
          {timeRemaining && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              {timeRemaining.argumentSubmission && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Argument deadline:</span>
                  <span className="font-semibold">
                    {timeRemaining.argumentSubmission > 0
                      ? `${Math.ceil(timeRemaining.argumentSubmission / (1000 * 60))} minutes`
                      : 'Expired'}
                  </span>
                </div>
              )}
              {timeRemaining.voting && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Voting deadline:</span>
                  <span className="font-semibold">
                    {timeRemaining.voting > 0
                      ? `${Math.ceil(timeRemaining.voting / (1000 * 60))} minutes`
                      : 'Expired'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">For Side</h4>
              {forParticipant ? (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800">
                      {forParticipant.agent.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">{forParticipant.agent.display_name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No participant yet</p>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Against Side</h4>
              {againstParticipant ? (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-red-800">
                      {againstParticipant.agent.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">{againstParticipant.agent.display_name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No participant yet</p>
              )}
            </div>
          </div>

          {/* Statistics */}
          {debate.stats && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">For Arguments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {debate.stats.for_arguments}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Against Arguments</p>
                <p className="text-2xl font-bold text-red-600">
                  {debate.stats.against_arguments}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">
                  {debate.stats.for_votes + debate.stats.against_votes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arguments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* For Arguments */}
        <div>
          <ArgumentList
            arguments={forArguments}
            side="for"
            title="For Arguments"
          />
        </div>

        {/* Against Arguments */}
        <div>
          <ArgumentList
            arguments={againstArguments}
            side="against"
            title="Against Arguments"
          />
        </div>
      </div>

      {/* Voting Section */}
      {canVote && (
        <Card>
          <CardHeader>
            <CardTitle>Cast Your Vote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <VoteButton
                debateId={debate.id}
                side="for"
                disabled={userVote === 'for'}
                onVoteSuccess={() => window.location.reload()}
              />
              <VoteButton
                debateId={debate.id}
                side="against"
                disabled={userVote === 'against'}
                onVoteSuccess={() => window.location.reload()}
              />
            </div>
            {userVote && (
              <p className="text-sm text-center text-muted-foreground mt-4">
                You have already voted for the <strong>{userVote}</strong> side.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Argument Form */}
      {canSubmitToStage ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Argument ({activeStage.name})</CardTitle>
          </CardHeader>
          <CardContent>
            <ArgumentForm
              debateId={debate.id}
              stageId={activeStage.id}
              onSubmitSuccess={() => window.location.reload()}
            />
          </CardContent>
        </Card>
      ) : canSubmitArgument && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground">
              Wait for the next stage to be activated to submit your argument.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Winner Announcement */}
      {debate.status === 'completed' && debate.winner_side && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Debate Winner</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Badge className="text-lg px-4 py-2" variant="outline">
              {debate.winner_side.toUpperCase()} SIDE WINS
            </Badge>
            {debate.stats && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">For Votes</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {debate.stats.for_votes}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Against Votes</p>
                  <p className="text-3xl font-bold text-red-600">
                    {debate.stats.against_votes}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
