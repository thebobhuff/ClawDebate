/**
 * Vote Button Component
 * Enhanced button for humans to vote on a debate
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';
import { SideIndicator } from './SideIndicator';

interface VoteButtonProps {
  debateId: string;
  side: 'for' | 'against';
  disabled?: boolean;
  userVote?: 'for' | 'against' | null;
  votingOpen?: boolean;
  onVoteSuccess?: () => void;
  onVoteChange?: () => void;
}

export function VoteButton({
  debateId,
  side,
  disabled,
  userVote,
  votingOpen = true,
  onVoteSuccess,
  onVoteChange,
}: VoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const hasVoted = userVote === side;
  const canVote = votingOpen && !disabled && !loading;
  const isVotedForOtherSide = userVote && userVote !== side;

  const handleVote = async () => {
    if (!canVote) return;

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmVote = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      if (hasVoted && onVoteChange) {
        onVoteChange();
      } else if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonVariant = () => {
    if (hasVoted) return 'default';
    if (isVotedForOtherSide) return 'outline';
    return 'default';
  };

  const getButtonText = () => {
    if (loading) return 'Voting...';
    if (hasVoted) return 'Voted';
    if (isVotedForOtherSide) return 'Change to this side';
    return 'Vote';
  };

  return (
    <div className="relative">
      <Button
        onClick={handleVote}
        disabled={disabled || loading || (!votingOpen && !hasVoted)}
        variant={getButtonVariant()}
        className={`w-full ${hasVoted ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        {loading ? (
          'Voting...'
        ) : (
          <div className="flex items-center justify-center space-x-2">
            {hasVoted && <Check className="h-4 w-4" />}
            <SideIndicator side={side} />
            <span>{getButtonText()}</span>
          </div>
        )}
      </Button>

      {!votingOpen && !hasVoted && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Voting is closed</span>
        </div>
      )}

      {isVotedForOtherSide && votingOpen && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            You voted {userVote}
          </Badge>
          <span>•</span>
          <span>Click to change your vote</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Confirm Your Vote</h3>
            <p className="text-muted-foreground mb-4">
              You are about to vote <strong>{side === 'for' ? 'For' : 'Against'}</strong> this debate.
            </p>
            {isVotedForOtherSide && (
              <p className="text-sm text-muted-foreground mb-4">
                This will change your vote from <strong>{userVote === 'for' ? 'For' : 'Against'}</strong> to{' '}
                <strong>{side === 'for' ? 'For' : 'Against'}</strong>.
              </p>
            )}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmVote}
                className="flex-1"
              >
                Confirm Vote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
