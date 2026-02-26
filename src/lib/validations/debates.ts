/**
 * Debate Validation Schemas using Zod
 * Provides validation for all debate-related operations
 */

import { z } from 'zod';

// ============================================================================
// ENUM VALUES
// ============================================================================

const DEBATE_STATUS_VALUES = ['pending', 'active', 'voting', 'completed'] as const;
const DEBATE_SIDE_VALUES = ['for', 'against'] as const;

// ============================================================================
// DEBATE VALIDATION SCHEMAS
// ============================================================================

/**
 * Create debate schema
 */
export const createDebateSchema = z.object({
  promptId: z.string().uuid('Invalid prompt ID'),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be 2000 characters or less')
    .trim(),
  maxArgumentsPerSide: z
    .number()
    .int('Max arguments per side must be a whole number')
    .min(1, 'Max arguments per side must be at least 1')
    .max(10, 'Max arguments per side must be 10 or less')
    .default(5)
    .optional(),
  argumentSubmissionDeadline: z
    .string()
    .datetime('Invalid deadline format')
    .nullable()
    .optional(),
  votingDeadline: z
    .string()
    .datetime('Invalid deadline format')
    .nullable()
    .optional(),
});

/**
 * Update debate schema
 */
export const updateDebateSchema = z.object({
  id: z.string().uuid('Invalid debate ID'),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be 2000 characters or less')
    .trim()
    .optional(),
  status: z
    .enum(DEBATE_STATUS_VALUES, {
      invalid_type_error: 'Invalid debate status',
    })
    .optional(),
  maxArgumentsPerSide: z
    .number()
    .int('Max arguments per side must be a whole number')
    .min(1, 'Max arguments per side must be at least 1')
    .max(10, 'Max arguments per side must be 10 or less')
    .optional(),
  argumentSubmissionDeadline: z
    .string()
    .datetime('Invalid deadline format')
    .nullable()
    .optional(),
  votingDeadline: z
    .string()
    .datetime('Invalid deadline format')
    .nullable()
    .optional(),
  winnerSide: z
    .enum(DEBATE_SIDE_VALUES, {
      invalid_type_error: 'Invalid winner side',
    })
    .nullable()
    .optional(),
  winnerAgentId: z
    .string()
    .uuid('Invalid agent ID')
    .nullable()
    .optional(),
});

/**
 * Delete debate schema
 */
export const deleteDebateSchema = z.object({
  id: z.string().uuid('Invalid debate ID'),
});

/**
 * Get debate by ID schema
 */
export const getDebateByIdSchema = z.object({
  id: z.string().uuid('Invalid debate ID'),
});

// ============================================================================
// DEBATE PARTICIPANT VALIDATION SCHEMAS
// ============================================================================

/**
 * Join debate schema
 */
export const joinDebateSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  side: z.enum(DEBATE_SIDE_VALUES, {
    required_error: 'Side is required',
    invalid_type_error: 'Side must be either "for" or "against"',
  }),
});

/**
 * Leave debate schema
 */
export const leaveDebateSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
});

// ============================================================================
// ARGUMENT VALIDATION SCHEMAS
// ============================================================================

/**
 * Submit argument schema
 */
export const submitArgumentSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  stageId: z.string().uuid('Invalid stage ID'),
  content: z
    .string()
    .min(500, 'Argument must be at least 500 characters')
    .max(3000, 'Argument must be 3000 characters or less')
    .trim(),
  model: z
    .string()
    .trim()
    .min(2, 'Model is required')
    .max(120, 'Model must be 120 characters or less'),
});

/**
 * Update argument schema
 */
export const updateArgumentSchema = z.object({
  id: z.string().uuid('Invalid argument ID'),
  content: z
    .string()
    .min(500, 'Argument must be at least 500 characters')
    .max(3000, 'Argument must be 3000 characters or less')
    .trim()
    .optional(),
});

/**
 * Delete argument schema
 */
export const deleteArgumentSchema = z.object({
  id: z.string().uuid('Invalid argument ID'),
});

/**
 * Get arguments schema
 */
export const getArgumentsSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  side: z.enum(DEBATE_SIDE_VALUES, {
    invalid_type_error: 'Side must be either "for" or "against"',
  }).optional(),
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be 100 or less')
    .optional(),
  offset: z
    .number()
    .int('Offset must be a whole number')
    .min(0, 'Offset must be 0 or greater')
    .optional(),
});

// ============================================================================
// VOTE VALIDATION SCHEMAS
// ============================================================================

/**
 * Cast vote schema
 */
export const castVoteSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  side: z.enum(DEBATE_SIDE_VALUES, {
    required_error: 'Side is required',
    invalid_type_error: 'Side must be either "for" or "against"',
  }),
  sessionId: z
    .string()
    .min(1, 'Session ID is required for anonymous voting')
    .max(100, 'Session ID must be 100 characters or less')
    .optional(),
});

/**
 * Get votes schema
 */
export const getVotesSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be 100 or less')
    .optional(),
  offset: z
    .number()
    .int('Offset must be a whole number')
    .min(0, 'Offset must be 0 or greater')
    .optional(),
});

// ============================================================================
// DEBATE STATUS VALIDATION SCHEMAS
// ============================================================================

/**
 * Update debate status schema
 */
export const updateDebateStatusSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  status: z.enum(DEBATE_STATUS_VALUES, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid debate status',
  }),
  winnerSide: z
    .enum(DEBATE_SIDE_VALUES, {
      invalid_type_error: 'Invalid winner side',
    })
    .nullable()
    .optional(),
  winnerAgentId: z
    .string()
    .uuid('Invalid agent ID')
    .nullable()
    .optional(),
});

/**
 * Open voting schema
 */
export const openVotingSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
});

/**
 * Complete debate schema
 */
export const completeDebateSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  winnerSide: z.enum(DEBATE_SIDE_VALUES, {
    required_error: 'Winner side is required',
    invalid_type_error: 'Invalid winner side',
  }),
  winnerAgentId: z
    .string()
    .uuid('Invalid agent ID')
    .optional(),
});

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Get debates filter schema
 */
export const getDebatesFilterSchema = z.object({
  status: z
    .enum([...DEBATE_STATUS_VALUES, 'all'] as const)
    .default('all')
    .optional(),
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category must be 50 characters or less')
    .trim()
    .optional(),
  search: z
    .string()
    .max(100, 'Search term must be 100 characters or less')
    .trim()
    .optional(),
  page: z
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional(),
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be 100 or less')
    .default(20)
    .optional(),
  sortBy: z
    .enum(['created_at', 'title', 'status', 'total_votes'] as const)
    .default('created_at')
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'] as const)
    .default('desc')
    .optional(),
});

/**
 * Get agent debates filter schema
 */
export const getAgentDebatesFilterSchema = z.object({
  status: z
    .enum(['available', 'participating', 'completed'] as const)
    .optional(),
  page: z
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional(),
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be 100 or less')
    .default(20)
    .optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateDebateInput = z.infer<typeof createDebateSchema>;
export type UpdateDebateInput = z.infer<typeof updateDebateSchema>;
export type DeleteDebateInput = z.infer<typeof deleteDebateSchema>;
export type GetDebateByIdInput = z.infer<typeof getDebateByIdSchema>;
export type JoinDebateInput = z.infer<typeof joinDebateSchema>;
export type LeaveDebateInput = z.infer<typeof leaveDebateSchema>;
export type SubmitArgumentInput = z.infer<typeof submitArgumentSchema>;
export type UpdateArgumentInput = z.infer<typeof updateArgumentSchema>;
export type DeleteArgumentInput = z.infer<typeof deleteArgumentSchema>;
export type GetArgumentsInput = z.infer<typeof getArgumentsSchema>;
export type CastVoteInput = z.infer<typeof castVoteSchema>;
export type GetVotesInput = z.infer<typeof getVotesSchema>;
export type UpdateDebateStatusInput = z.infer<typeof updateDebateStatusSchema>;
export type OpenVotingInput = z.infer<typeof openVotingSchema>;
export type CompleteDebateInput = z.infer<typeof completeDebateSchema>;
export type GetDebatesFilterInput = z.infer<typeof getDebatesFilterSchema>;
export type GetAgentDebatesFilterInput = z.infer<typeof getAgentDebatesFilterSchema>;
