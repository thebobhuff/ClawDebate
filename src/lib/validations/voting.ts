/**
 * Voting Validation Schemas using Zod
 * Provides validation for all voting-related operations
 */

import { z } from 'zod';

// ============================================================================
// ENUM VALUES
// ============================================================================

const VOTE_SIDE_VALUES = ['for', 'against'] as const;
const VOTE_OUTCOME_VALUES = ['won', 'lost', 'all'] as const;
const VOTE_STATUS_VALUES = ['voting', 'completed', 'all'] as const;
const SORT_BY_VALUES = ['voted_at', 'title'] as const;
const SORT_ORDER_VALUES = ['asc', 'desc'] as const;

// ============================================================================
// VOTE VALIDATION SCHEMAS
// ============================================================================

/**
 * Cast vote schema
 */
export const castVoteSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  side: z.enum(VOTE_SIDE_VALUES, {
    invalid_type_error: 'Invalid vote side',
    required_error: 'Vote side is required',
  }),
  sessionId: z.string().min(1, 'Session ID is required for anonymous voting').optional(),
});

/**
 * Change vote schema
 */
export const changeVoteSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  newSide: z.enum(VOTE_SIDE_VALUES, {
    invalid_type_error: 'Invalid vote side',
    required_error: 'New vote side is required',
  }),
});

/**
 * Vote history filter schema
 */
export const voteHistoryFilterSchema = z.object({
  outcome: z.enum(VOTE_OUTCOME_VALUES, {
    invalid_type_error: 'Invalid outcome filter',
  }).default('all').optional(),
  status: z.enum(VOTE_STATUS_VALUES, {
    invalid_type_error: 'Invalid status filter',
  }).default('all').optional(),
  page: z.coerce.number().int('Page must be a whole number').min(1, 'Page must be at least 1').default(1).optional(),
  limit: z.coerce.number().int('Limit must be a whole number').min(1, 'Limit must be at least 1').max(100, 'Limit must be 100 or less').default(20).optional(),
  sortBy: z.enum(SORT_BY_VALUES, {
    invalid_type_error: 'Invalid sort by value',
  }).default('voted_at').optional(),
  sortOrder: z.enum(SORT_ORDER_VALUES, {
    invalid_type_error: 'Invalid sort order',
  }).default('desc').optional(),
});

/**
 * Vote status schema
 */
export const voteStatusSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
});

/**
 * Vote results schema
 */
export const voteResultsSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
});

/**
 * Can vote schema
 */
export const canVoteSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  sessionId: z.string().min(1, 'Session ID is required for anonymous voting').optional(),
});

// ============================================================================
// ANONYMOUS VOTING SCHEMAS
// ============================================================================

/**
 * Anonymous vote request schema
 */
export const anonymousVoteSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  side: z.enum(VOTE_SIDE_VALUES, {
    invalid_type_error: 'Invalid vote side',
    required_error: 'Vote side is required',
  }),
  sessionId: z.string().min(1, 'Session ID is required'),
  ipAddress: z.string().ip('Invalid IP address').optional(),
});

/**
 * Session validation schema
 */
export const sessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

// ============================================================================
// VOTING RESTRICTIONS SCHEMAS
// ============================================================================

/**
 * Voting restrictions schema
 */
export const votingRestrictionsSchema = z.object({
  oneVotePerDebate: z.boolean().default(true),
  votingOnlyDuringOpenPhase: z.boolean().default(true),
  cannotVoteAfterCompletion: z.boolean().default(true),
  allowVoteChange: z.boolean().default(true),
  allowAnonymousVoting: z.boolean().default(true),
  anonymousVotesPerSession: z.number().int().min(1).max(100).default(10),
  rateLimitPerMinute: z.number().int().min(1).max(60).default(10),
  ipBasedRestrictions: z.boolean().default(true),
});

// ============================================================================
// HELPER TYPES
// ============================================================================

export type CastVoteInput = z.infer<typeof castVoteSchema>;
export type ChangeVoteInput = z.infer<typeof changeVoteSchema>;
export type VoteHistoryFilterInput = z.infer<typeof voteHistoryFilterSchema>;
export type VoteStatusInput = z.infer<typeof voteStatusSchema>;
export type VoteResultsInput = z.infer<typeof voteResultsSchema>;
export type CanVoteInput = z.infer<typeof canVoteSchema>;
export type AnonymousVoteInput = z.infer<typeof anonymousVoteSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type VotingRestrictionsInput = z.infer<typeof votingRestrictionsSchema>;
