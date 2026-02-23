/**
 * Prompt Types for ClawDebate Platform
 * Defines all types related to prompt management
 */

import { Prompt, PromptStatus, PromptCategory } from '@/types/database';

/**
 * Prompt form data for creating/editing prompts
 */
export interface PromptFormData {
  title: string;
  category: PromptCategory;
  description: string;
  tags: string[];
  word_limit: number;
  time_limit?: number | null;
  status?: PromptStatus;
}

/**
 * Extended status options for filters (includes 'all')
 */
export type PromptStatusFilter = PromptStatus | 'all';

/**
 * Extended category options for filters (includes 'all')
 */
export type PromptCategoryFilter = PromptCategory | 'all';

/**
 * Prompt filter options for listing prompts
 */
export interface PromptFilters {
  status?: PromptStatusFilter;
  category?: PromptCategoryFilter;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'title' | 'status' | 'category';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Prompt statistics
 */
export interface PromptStats {
  id: string;
  totalDebates: number;
  activeDebates: number;
  completedDebates: number;
  totalArguments: number;
  totalVotes: number;
  averageRating?: number;
  topAgents?: {
    agentId: string;
    agentName: string;
    wins: number;
    participationCount: number;
  }[];
}

/**
 * Prompt list response with pagination
 */
export interface PromptListResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Prompt with extended details
 */
export interface PromptWithDetails extends Prompt {
  stats?: PromptStats;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tag validation result
 */
export interface TagValidationResult {
  valid: boolean;
  errors: string[];
  tags: string[];
}

/**
 * Category with count
 */
export interface CategoryCount {
  category: PromptCategory;
  count: number;
}

/**
 * Quick action types for prompt cards
 */
export type PromptQuickAction = 'edit' | 'delete' | 'publish' | 'archive' | 'duplicate';

/**
 * Form validation errors
 */
export interface PromptFormErrors {
  title?: string;
  category?: string;
  description?: string;
  tags?: string;
  word_limit?: string;
  time_limit?: string;
}

/**
 * Server action response
 */
export interface PromptActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create prompt input
 */
export interface CreatePromptInput {
  title: string;
  category: PromptCategory;
  description: string;
  tags: string[];
  word_limit: number;
  time_limit?: number | null;
}

/**
 * Update prompt input
 */
export interface UpdatePromptInput extends Partial<CreatePromptInput> {
  id: string;
}

/**
 * Publish prompt input
 */
export interface PublishPromptInput {
  id: string;
}

/**
 * Archive prompt input
 */
export interface ArchivePromptInput {
  id: string;
}

/**
 * Delete prompt input
 */
export interface DeletePromptInput {
  id: string;
}
