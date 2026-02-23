/**
 * Voting Utility Functions
 * Helper functions for voting operations
 */

import type { Vote, VoteResults, VoteStatus, VotingEligibility, VotingRestrictions } from '@/types/voting';
import type { Debate, VoteCounts } from '@/types/debates';

// ============================================================================
// VOTING ELIGIBILITY
// ============================================================================

/**
 * Check if a user can vote on a debate
 */
export function checkVotingEligibility(
  debate: Debate,
  userVote?: Vote | null,
  restrictions: Partial<VotingRestrictions> = {}
): VotingEligibility {
  const {
    oneVotePerDebate = true,
    votingOnlyDuringOpenPhase = true,
    cannotVoteAfterCompletion = true,
    allowVoteChange = true,
    allowAnonymousVoting = true,
    anonymousVotesPerSession = 10,
    rateLimitPerMinute = 10,
    ipBasedRestrictions = true,
  } = restrictions;

  // Check if debate exists
  if (!debate) {
    return {
      canVote: false,
      reason: 'Debate not found',
      restrictions: {
        oneVotePerDebate,
        votingOnlyDuringOpenPhase,
        cannotVoteAfterCompletion,
        allowVoteChange,
        allowAnonymousVoting,
        anonymousVotesPerSession,
        rateLimitPerMinute,
        ipBasedRestrictions,
      },
      userVoteCount: 0,
      sessionVoteCount: 0,
    };
  }

  // Check if voting is only allowed during open phase
  if (votingOnlyDuringOpenPhase && debate.status !== 'voting') {
    return {
      canVote: false,
      reason: 'Voting is not open for this debate',
      restrictions: {
        oneVotePerDebate,
        votingOnlyDuringOpenPhase,
        cannotVoteAfterCompletion,
        allowVoteChange,
        allowAnonymousVoting,
        anonymousVotesPerSession,
        rateLimitPerMinute,
        ipBasedRestrictions,
      },
      userVoteCount: 0,
      sessionVoteCount: 0,
    };
  }

  // Check if user has already voted
  if (oneVotePerDebate && userVote) {
    // Check if vote change is allowed
    if (allowVoteChange && debate.status === 'voting') {
      return {
        canVote: true,
        reason: 'You can change your vote',
        restrictions: {
          oneVotePerDebate,
          votingOnlyDuringOpenPhase,
          cannotVoteAfterCompletion,
          allowVoteChange,
          allowAnonymousVoting,
          anonymousVotesPerSession,
          rateLimitPerMinute,
          ipBasedRestrictions,
        },
        userVoteCount: 1,
        sessionVoteCount: 0,
      };
    }

    return {
      canVote: false,
      reason: 'You have already voted on this debate',
      restrictions: {
        oneVotePerDebate,
        votingOnlyDuringOpenPhase,
        cannotVoteAfterCompletion,
        allowVoteChange,
        allowAnonymousVoting,
        anonymousVotesPerSession,
        rateLimitPerMinute,
        ipBasedRestrictions,
      },
      userVoteCount: 1,
      sessionVoteCount: 0,
    };
  }

  // Check if voting is allowed after completion
  if (cannotVoteAfterCompletion && debate.status === 'completed') {
    return {
      canVote: false,
      reason: 'Voting has closed for this debate',
      restrictions: {
        oneVotePerDebate,
        votingOnlyDuringOpenPhase,
        cannotVoteAfterCompletion,
        allowVoteChange,
        allowAnonymousVoting,
        anonymousVotesPerSession,
        rateLimitPerMinute,
        ipBasedRestrictions,
      },
      userVoteCount: 0,
      sessionVoteCount: 0,
    };
  }

  return {
    canVote: true,
    restrictions: {
      oneVotePerDebate,
      votingOnlyDuringOpenPhase,
      cannotVoteAfterCompletion,
      allowVoteChange,
      allowAnonymousVoting,
      anonymousVotesPerSession,
      rateLimitPerMinute,
      ipBasedRestrictions,
    },
    userVoteCount: 0,
    sessionVoteCount: 0,
  };
}

// ============================================================================
// VOTE TIMING
// ============================================================================

/**
 * Check if voting is still open
 */
export function isVotingOpen(debate: Debate): boolean {
  if (debate.status !== 'voting') {
    return false;
  }

  if (!debate.voting_deadline) {
    return true;
  }

  const now = new Date();
  const deadline = new Date(debate.voting_deadline);

  return now < deadline;
}

/**
 * Get remaining time for voting
 */
export function getVotingTimeRemaining(debate: Debate): number | null {
  if (!isVotingOpen(debate)) {
    return null;
  }

  if (!debate.voting_deadline) {
    return null;
  }

  const now = new Date();
  const deadline = new Date(debate.voting_deadline);
  const remaining = deadline.getTime() - now.getTime();

  return Math.max(0, remaining);
}

/**
 * Format remaining time for display
 */
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

// ============================================================================
// VOTE RESULTS
// ============================================================================

/**
 * Calculate vote results
 */
export function calculateVoteResults(forVotes: number, againstVotes: number): VoteResults {
  const totalVotes = forVotes + againstVotes;

  let winner: 'for' | 'against' | 'tie' | undefined;
  if (totalVotes > 0) {
    if (forVotes > againstVotes) {
      winner = 'for';
    } else if (againstVotes > forVotes) {
      winner = 'against';
    } else {
      winner = 'tie';
    }
  }

  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0;
  const margin = Math.abs(forVotes - againstVotes);

  return {
    forVotes,
    againstVotes,
    totalVotes,
    forPercentage,
    againstPercentage,
    winner,
    margin,
  };
}

/**
 * Format vote counts for display
 */
export function formatVoteCounts(counts: VoteCounts): string {
  if (counts.total === 0) {
    return 'No votes yet';
  }

  const forPercentage = counts.total > 0 ? ((counts.for / counts.total) * 100).toFixed(1) : '0';
  const againstPercentage = counts.total > 0 ? ((counts.against / counts.total) * 100).toFixed(1) : '0';

  return `${counts.for} for (${forPercentage}%) · ${counts.against} against (${againstPercentage}%)`;
}

/**
 * Get vote outcome for a user
 */
export function getVoteOutcome(
  userVote: Vote,
  debate: Debate
): 'won' | 'lost' | 'pending' {
  if (debate.status !== 'completed') {
    return 'pending';
  }

  if (!debate.winner_side) {
    return 'pending';
  }

  return userVote.side === debate.winner_side ? 'won' : 'lost';
}

// ============================================================================
// VOTE DATA FORMATTING
// ============================================================================

/**
 * Format vote timestamp
 */
export function formatVoteTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
  }

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
}

/**
 * Format vote side for display
 */
export function formatVoteSide(side: 'for' | 'against'): string {
  return side === 'for' ? 'For' : 'Against';
}

// ============================================================================
// VOTE CHANGE
// ============================================================================

/**
 * Check if user can change their vote
 */
export function canChangeVote(debate: Debate, userVote?: Vote | null): boolean {
  if (!userVote) {
    return false;
  }

  if (debate.status !== 'voting') {
    return false;
  }

  if (!isVotingOpen(debate)) {
    return false;
  }

  return true;
}

/**
 * Get vote change message
 */
export function getVoteChangeMessage(debate: Debate): string {
  if (debate.status !== 'voting') {
    return 'Voting is closed';
  }

  const timeRemaining = getVotingTimeRemaining(debate);
  if (timeRemaining === null) {
    return 'You can change your vote';
  }

  const formatted = formatTimeRemaining(timeRemaining);
  return `You can change your vote for ${formatted}`;
}

// ============================================================================
// ANONYMOUS VOTING
// ============================================================================

/**
 * Generate a session ID for anonymous voting
 */
export function generateSessionId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check if session has exceeded vote limit
 */
export function hasExceededVoteLimit(
  sessionVoteCount: number,
  maxVotes: number = 10
): boolean {
  return sessionVoteCount >= maxVotes;
}

/**
 * Check if IP has exceeded vote limit
 */
export function hasExceededIPLimit(
  ipVoteCount: number,
  maxVotes: number = 5
): boolean {
  return ipVoteCount >= maxVotes;
}

// ============================================================================
// VOTE STATUS
// ============================================================================

/**
 * Get vote status for a debate and user
 */
export function getVoteStatus(
  debate: Debate,
  userVote?: Vote | null,
  allowVoteChange: boolean = true
): VoteStatus {
  const hasVoted = !!userVote;
  const votingOpen = isVotingOpen(debate);

  return {
    hasVoted,
    votedSide: userVote?.side,
    votedAt: userVote?.voted_at,
    canVote: votingOpen && (!hasVoted || (allowVoteChange && votingOpen)),
    canChangeVote: canChangeVote(debate, userVote),
    votingOpen,
    votingDeadline: debate.voting_deadline || undefined,
    timeRemaining: getVotingTimeRemaining(debate) || undefined,
  };
}

// ============================================================================
// VOTING RESTRICTIONS
// ============================================================================

/**
 * Get default voting restrictions
 */
export function getDefaultVotingRestrictions(): VotingRestrictions {
  return {
    oneVotePerDebate: true,
    votingOnlyDuringOpenPhase: true,
    cannotVoteAfterCompletion: true,
    allowVoteChange: true,
    allowAnonymousVoting: true,
    anonymousVotesPerSession: 10,
    rateLimitPerMinute: 10,
    ipBasedRestrictions: true,
  };
}

/**
 * Validate voting restrictions
 */
export function validateVotingRestrictions(
  restrictions: Partial<VotingRestrictions>
): VotingRestrictions {
  const defaults = getDefaultVotingRestrictions();

  return {
    oneVotePerDebate: restrictions.oneVotePerDebate ?? defaults.oneVotePerDebate,
    votingOnlyDuringOpenPhase: restrictions.votingOnlyDuringOpenPhase ?? defaults.votingOnlyDuringOpenPhase,
    cannotVoteAfterCompletion: restrictions.cannotVoteAfterCompletion ?? defaults.cannotVoteAfterCompletion,
    allowVoteChange: restrictions.allowVoteChange ?? defaults.allowVoteChange,
    allowAnonymousVoting: restrictions.allowAnonymousVoting ?? defaults.allowAnonymousVoting,
    anonymousVotesPerSession: restrictions.anonymousVotesPerSession ?? defaults.anonymousVotesPerSession,
    rateLimitPerMinute: restrictions.rateLimitPerMinute ?? defaults.rateLimitPerMinute,
    ipBasedRestrictions: restrictions.ipBasedRestrictions ?? defaults.ipBasedRestrictions,
  };
}
