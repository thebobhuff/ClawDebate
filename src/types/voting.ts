/**
 * Voting Types
 * Type definitions for voting-related operations
 */

import type { Database } from './supabase';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];
export type VoteUpdate = Database['public']['Tables']['votes']['Update'];

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CastVoteForm {
  debateId: string;
  side: 'for' | 'against';
  sessionId?: string;
}

export interface ChangeVoteForm {
  debateId: string;
  newSide: 'for' | 'against';
}

export interface VoteHistoryFilters {
  outcome?: 'won' | 'lost' | 'all';
  status?: 'voting' | 'completed' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'voted_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface VoteResponse<T = any> {
  success: boolean;
  data?: T;
  error?: VoteError;
}

export interface VoteError {
  code: VoteErrorCode;
  message: string;
  details?: any;
}

export type VoteErrorCode =
  | 'ALREADY_VOTED'
  | 'VOTING_NOT_OPEN'
  | 'DEBATE_NOT_FOUND'
  | 'INVALID_SIDE'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'VOTE_NOT_FOUND'
  | 'CANNOT_CHANGE_VOTE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ANONYMOUS_LIMIT_EXCEEDED';

// ============================================================================
// VOTE HISTORY TYPES
// ============================================================================

export interface VoteHistoryEntry {
  id: string;
  debateId: string;
  debateTitle: string;
  debateDescription: string;
  debateStatus: 'pending' | 'active' | 'voting' | 'completed';
  side: 'for' | 'against';
  votedAt: string;
  outcome?: 'won' | 'lost' | 'pending';
  winnerSide?: 'for' | 'against' | null;
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  canChange: boolean;
}

export interface VoteHistoryResponse {
  votes: VoteHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  stats: {
    totalVotes: number;
    won: number;
    lost: number;
    pending: number;
    winRate: number;
  };
}

// ============================================================================
// VOTE STATUS TYPES
// ============================================================================

export interface VoteStatus {
  hasVoted: boolean;
  votedSide?: 'for' | 'against';
  votedAt?: string;
  canVote: boolean;
  canChangeVote: boolean;
  votingOpen: boolean;
  votingDeadline?: string;
  timeRemaining?: number;
}

export interface VoteResults {
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  forPercentage: number;
  againstPercentage: number;
  winner?: 'for' | 'against' | 'tie';
  margin: number;
}

// ============================================================================
// VOTING RESTRICTIONS TYPES
// ============================================================================

export interface VotingRestrictions {
  oneVotePerDebate: boolean;
  votingOnlyDuringOpenPhase: boolean;
  cannotVoteAfterCompletion: boolean;
  allowVoteChange: boolean;
  allowAnonymousVoting: boolean;
  anonymousVotesPerSession: number;
  rateLimitPerMinute: number;
  ipBasedRestrictions: boolean;
}

export interface VotingEligibility {
  canVote: boolean;
  reason?: string;
  restrictions: VotingRestrictions;
  userVoteCount: number;
  sessionVoteCount: number;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface VoteConfirmationData {
  debateId: string;
  debateTitle: string;
  debateDescription: string;
  selectedSide: 'for' | 'against';
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  isFinal: boolean;
  canChange: boolean;
}

export interface VoteNotification {
  type: 'success' | 'error' | 'info';
  message: string;
  debateId?: string;
  debateTitle?: string;
  timestamp: string;
}

// ============================================================================
// ANONYMOUS VOTING TYPES
// ============================================================================

export interface AnonymousVoteSession {
  sessionId: string;
  votesCast: number;
  maxVotes: number;
  ipAddress?: string;
  createdAt: string;
  lastActivityAt: string;
}

export interface AnonymousVoteRequest {
  debateId: string;
  side: 'for' | 'against';
  sessionId: string;
  ipAddress?: string;
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface VoteUpdatePayload {
  debateId: string;
  side: 'for' | 'against';
  counts: {
    for: number;
    against: number;
    total: number;
  };
  voterId?: string;
  timestamp: string;
}

export interface VotingStatusUpdate {
  debateId: string;
  status: 'voting' | 'completed';
  timestamp: string;
}
