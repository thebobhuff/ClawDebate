/**
 * Prompt Utility Functions
 * High-level utility functions for prompt management
 */

import { Prompt, PromptCategory, PromptStatus } from '@/types/database';
import { PromptStats, PromptFormData, PromptFilters, PromptListResponse, CategoryCount } from '@/types/prompts';

/**
 * Format prompt data for display
 */
export function formatPromptData(prompt: Prompt, wordLimit?: number, timeLimit?: number | null): PromptFormData {
  return {
    title: prompt.title,
    category: prompt.category as PromptCategory,
    description: prompt.description,
    tags: prompt.tags || [],
    word_limit: wordLimit || 500, // Default word limit
    time_limit: timeLimit,
    status: prompt.status as PromptStatus,
  };
}

/**
 * Calculate prompt statistics
 */
export function calculatePromptStats(prompt: Prompt, debates: any[]): PromptStats {
  const totalDebates = debates.length;
  const activeDebates = debates.filter((d) => d.status === 'active').length;
  const completedDebates = debates.filter((d) => d.status === 'completed').length;
  
  // Calculate total arguments from debate stats
  let totalArguments = 0;
  let totalVotes = 0;
  
  debates.forEach((debate) => {
    if (debate.stats) {
      totalArguments += debate.stats.total_arguments || 0;
      totalVotes += (debate.stats.for_votes || 0) + (debate.stats.against_votes || 0);
    }
  });
  
  return {
    id: prompt.id,
    totalDebates,
    activeDebates,
    completedDebates,
    totalArguments,
    totalVotes,
  };
}

/**
 * Validate tags
 */
export function validateTags(tags: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (tags.length === 0) {
    errors.push('At least one tag is required');
  }
  
  if (tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }
  
  const tagRegex = /^[a-zA-Z0-9_-]+$/;
  
  tags.forEach((tag, index) => {
    if (tag.length === 0) {
      errors.push(`Tag ${index + 1} cannot be empty`);
    } else if (tag.length > 50) {
      errors.push(`Tag ${index + 1} must be 50 characters or less`);
    } else if (!tagRegex.test(tag)) {
      errors.push(`Tag "${tag}" must contain only letters, numbers, hyphens, and underscores`);
    }
  });
  
  // Check for duplicates
  const uniqueTags = new Set(tags.map((t) => t.toLowerCase()));
  if (uniqueTags.size !== tags.length) {
    errors.push('Tags must be unique');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format category for display
 */
export function formatCategory(category: PromptCategory): string {
  const categoryMap: Record<PromptCategory, string> = {
    philosophical: 'Philosophical',
    political: 'Political',
    ethical: 'Ethical',
    scientific: 'Scientific',
    social: 'Social',
  };
  
  return categoryMap[category] || category;
}

/**
 * Format status for display
 */
export function formatStatus(status: PromptStatus): string {
  const statusMap: Record<PromptStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    archived: 'Archived',
  };
  
  return statusMap[status] || status;
}

/**
 * Get category color for UI
 */
export function getCategoryColor(category: PromptCategory): string {
  const colorMap: Record<PromptCategory, string> = {
    philosophical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    political: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    ethical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    scientific: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    social: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };
  
  return colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: PromptStatus): string {
  const colorMap: Record<PromptStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    archived: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

/**
 * Calculate pagination info
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): { totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return { totalPages, hasNextPage, hasPrevPage };
}

/**
 * Build prompt list response
 */
export function buildPromptListResponse(
  prompts: Prompt[],
  total: number,
  page: number,
  limit: number
): PromptListResponse {
  const { totalPages } = calculatePagination(total, page, limit);
  
  return {
    prompts,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Format time limit for display
 */
export function formatTimeLimit(minutes: number | null | undefined): string {
  if (!minutes) return 'No time limit';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  
  return `${mins}m`;
}

/**
 * Format word limit for display
 */
export function formatWordLimit(words: number): string {
  return `${words.toLocaleString()} words`;
}

/**
 * Sort prompts by various criteria
 */
export function sortPrompts(
  prompts: Prompt[],
  sortBy: 'created_at' | 'title' | 'status' | 'category',
  sortOrder: 'asc' | 'desc'
): Prompt[] {
  return [...prompts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter prompts by search term
 */
export function filterPromptsBySearch(prompts: Prompt[], searchTerm: string): Prompt[] {
  if (!searchTerm) return prompts;
  
  const term = searchTerm.toLowerCase();
  
  return prompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(term) ||
      prompt.description.toLowerCase().includes(term) ||
      prompt.tags?.some((tag) => tag.toLowerCase().includes(term))
  );
}

/**
 * Get category counts from prompts
 */
export function getCategoryCounts(prompts: Prompt[]): CategoryCount[] {
  const counts: Record<PromptCategory, number> = {
    philosophical: 0,
    political: 0,
    ethical: 0,
    scientific: 0,
    social: 0,
  };
  
  prompts.forEach((prompt) => {
    if (prompt.category in counts) {
      counts[prompt.category as PromptCategory]++;
    }
  });
  
  return Object.entries(counts)
    .map(([category, count]) => ({ category: category as PromptCategory, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all categories
 */
export function getAllCategories(): PromptCategory[] {
  return ['philosophical', 'political', 'ethical', 'scientific', 'social'];
}

/**
 * Get all statuses
 */
export function getAllStatuses(): PromptStatus[] {
  return ['draft', 'active', 'archived'];
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Validate prompt form data
 */
export function validatePromptFormData(data: Partial<PromptFormData>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  if (!data.title || data.title.length < 10) {
    errors.title = 'Title must be at least 10 characters';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }
  
  if (!data.description || data.description.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or less';
  }
  
  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  if (!data.word_limit || data.word_limit < 50) {
    errors.word_limit = 'Word limit must be at least 50';
  } else if (data.word_limit > 5000) {
    errors.word_limit = 'Word limit must be 5000 or less';
  }
  
  if (data.time_limit !== undefined && data.time_limit !== null) {
    if (data.time_limit < 1) {
      errors.time_limit = 'Time limit must be at least 1 minute';
    } else if (data.time_limit > 1440) {
      errors.time_limit = 'Time limit must be 1440 minutes or less (24 hours)';
    }
  }
  
  if (!data.tags || data.tags.length === 0) {
    errors.tags = 'At least one tag is required';
  } else {
    const tagValidation = validateTags(data.tags);
    if (!tagValidation.valid) {
      errors.tags = tagValidation.errors.join(', ');
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
