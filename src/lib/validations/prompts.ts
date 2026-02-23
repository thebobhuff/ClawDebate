/**
 * Prompt Validation Schemas using Zod
 * Provides validation for all prompt-related operations
 */

import { z } from 'zod';

/**
 * Enum values for prompt status
 */
const PROMPT_STATUS_VALUES = ['draft', 'active', 'archived'] as const;

/**
 * Enum values for prompt category
 */
const PROMPT_CATEGORY_VALUES = ['philosophical', 'political', 'ethical', 'scientific', 'social'] as const;

/**
 * Tag validation schema
 * Tags must be 1-50 characters, alphanumeric with hyphens and underscores
 */
export const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag must be 50 characters or less')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Tag must contain only letters, numbers, hyphens, and underscores')
  .transform((val) => val.toLowerCase().trim());

/**
 * Tags array validation schema
 * Must have 1-10 unique tags
 */
export const tagsArraySchema = z
  .array(tagSchema)
  .min(1, 'At least one tag is required')
  .max(10, 'Maximum 10 tags allowed')
  .refine((tags) => new Set(tags).size === tags.length, {
    message: 'Tags must be unique',
  });

/**
 * Create prompt schema
 */
export const createPromptSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  category: z.enum(PROMPT_CATEGORY_VALUES, {
    required_error: 'Category is required',
    invalid_type_error: 'Invalid category',
  }),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be 2000 characters or less')
    .trim(),
  tags: tagsArraySchema,
  word_limit: z
    .number()
    .int('Word limit must be a whole number')
    .min(50, 'Word limit must be at least 50')
    .max(5000, 'Word limit must be 5000 or less'),
  time_limit: z
    .number()
    .int('Time limit must be a whole number')
    .min(1, 'Time limit must be at least 1 minute')
    .max(1440, 'Time limit must be 1440 minutes or less (24 hours)')
    .nullable()
    .optional(),
  status: z
    .enum(PROMPT_STATUS_VALUES)
    .default('draft')
    .optional(),
});

/**
 * Update prompt schema
 * All fields are optional for updates
 */
export const updatePromptSchema = z.object({
  id: z.string().uuid('Invalid prompt ID'),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  category: z
    .enum(PROMPT_CATEGORY_VALUES, {
      invalid_type_error: 'Invalid category',
    })
    .optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be 2000 characters or less')
    .trim()
    .optional(),
  tags: tagsArraySchema.optional(),
  word_limit: z
    .number()
    .int('Word limit must be a whole number')
    .min(50, 'Word limit must be at least 50')
    .max(5000, 'Word limit must be 5000 or less')
    .optional(),
  time_limit: z
    .number()
    .int('Time limit must be a whole number')
    .min(1, 'Time limit must be at least 1 minute')
    .max(1440, 'Time limit must be 1440 minutes or less (24 hours)')
    .nullable()
    .optional(),
  status: z
    .enum(PROMPT_STATUS_VALUES)
    .optional(),
});

/**
 * Delete prompt schema
 */
export const deletePromptSchema = z.object({
  id: z.string().uuid('Invalid prompt ID'),
});

/**
 * Publish prompt schema
 */
export const publishPromptSchema = z.object({
  id: z.string().uuid('Invalid prompt ID'),
});

/**
 * Archive prompt schema
 */
export const archivePromptSchema = z.object({
  id: z.string().uuid('Invalid prompt ID'),
});

/**
 * Get prompt by ID schema
 */
export const getPromptByIdSchema = z.object({
  id: z.string().uuid('Invalid prompt ID'),
});

/**
 * Get prompts filter schema
 */
export const getPromptsFilterSchema = z.object({
  status: z
    .enum([...PROMPT_STATUS_VALUES, 'all'] as const)
    .default('all')
    .optional(),
  category: z
    .enum([...PROMPT_CATEGORY_VALUES, 'all'] as const)
    .default('all')
    .optional(),
  search: z
    .string()
    .max(100, 'Search term must be 100 characters or less')
    .trim()
    .optional(),
  tags: z.array(tagSchema).optional(),
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
    .enum(['created_at', 'title', 'status', 'category'] as const)
    .default('created_at')
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'] as const)
    .default('desc')
    .optional(),
});

/**
 * Type exports
 */
export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type DeletePromptInput = z.infer<typeof deletePromptSchema>;
export type PublishPromptInput = z.infer<typeof publishPromptSchema>;
export type ArchivePromptInput = z.infer<typeof archivePromptSchema>;
export type GetPromptByIdInput = z.infer<typeof getPromptByIdSchema>;
export type GetPromptsFilterInput = z.infer<typeof getPromptsFilterSchema>;
