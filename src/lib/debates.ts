/**
 * Debate Utility Functions
 * Helper functions for debate operations, formatting, and calculations
 */

import type {
  Debate,
  DebateWithDetails,
  DebateStats,
  Argument,
  VoteCounts,
  DebateCardData,
  DebateViewData,
  AgentDebateStatistics,
  DebateStatistics,
} from '@/types/debates';

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format debate data for display
 */
export function formatDebateData(debate: DebateWithDetails): DebateCardData {
  const stats = debate.stats;
  
  return {
    id: debate.id,
    title: debate.title,
    description: debate.description,
    status: debate.status,
    category: debate.prompt?.category || 'general',
    createdAt: debate.created_at,
    totalVotes: stats?.total_arguments || 0,
    forVotes: stats?.for_votes || 0,
    againstVotes: stats?.against_votes || 0,
    totalArguments: stats?.total_arguments || 0,
    forArguments: stats?.for_arguments || 0,
    againstArguments: stats?.against_arguments || 0,
    participants: debate.participants?.length || 0,
  };
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Format timestamp to date string
 */
export function formatDate(timestamp: string, format: 'short' | 'long' | 'time' = 'short'): string {
  const date = new Date(timestamp);
  
  if (format === 'time') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format word count
 */
export function formatWordCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  
  return `${(count / 1000).toFixed(1)}k`;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate debate statistics
 */
export function calculateDebateStatistics(
  debate: DebateWithDetails
): Partial<DebateStatistics> {
  const stats = debate.stats;
  const argumentsList = debate.arguments || [];
  
  return {
    totalDebates: 1,
    activeDebates: debate.status === 'active' ? 1 : 0,
    completedDebates: debate.status === 'completed' ? 1 : 0,
    totalVotes: (stats?.for_votes || 0) + (stats?.against_votes || 0),
    totalArguments: stats?.total_arguments || argumentsList.length,
    avgArgumentsPerDebate: stats?.total_arguments || argumentsList.length,
  };
}

/**
 * Calculate vote counts
 */
export function calculateVoteCounts(votes: any[]): VoteCounts {
  const forVotes = votes.filter((v) => v.side === 'for').length;
  const againstVotes = votes.filter((v) => v.side === 'against').length;
  
  return {
    for: forVotes,
    against: againstVotes,
    total: forVotes + againstVotes,
  };
}

/**
 * Calculate vote percentage
 */
export function calculateVotePercentage(voteCount: number, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  return Math.round((voteCount / totalVotes) * 100);
}

/**
 * Determine debate winner
 */
export function determineDebateWinner(
  forVotes: number,
  againstVotes: number
): 'for' | 'against' | 'tie' {
  if (forVotes > againstVotes) return 'for';
  if (againstVotes > forVotes) return 'against';
  return 'tie';
}

/**
 * Calculate agent debate statistics
 */
export function calculateAgentStatistics(
  agentId: string,
  debates: DebateWithDetails[]
): AgentDebateStatistics {
  const agentDebates = debates.filter((d) =>
    d.participants?.some((p) => p.agent_id === agentId)
  );
  
  const completedDebates = agentDebates.filter((d) => d.status === 'completed');
  const wins = completedDebates.filter((d) => {
    const participant = d.participants?.find((p) => p.agent_id === agentId);
    return participant?.side === d.winner_side;
  }).length;
  
  const losses = completedDebates.length - wins;
  
  const allArguments = debates.flatMap((d) =>
    (d.arguments || []).filter((a) => a.agent_id === agentId)
  );
  
  const totalWordCount = allArguments.reduce((sum, a) => sum + (a.word_count || 0), 0);
  const avgWordCount = allArguments.length > 0 ? totalWordCount / allArguments.length : 0;
  
  return {
    totalDebates: agentDebates.length,
    activeDebates: agentDebates.filter((d) => d.status === 'active').length,
    completedDebates: completedDebates.length,
    wins,
    losses,
    winRate: completedDebates.length > 0 ? (wins / completedDebates.length) * 100 : 0,
    totalArgumentsSubmitted: allArguments.length,
    avgWordCount: Math.round(avgWordCount),
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate argument word count
 */
export function validateArgumentWordCount(
  content: string,
  minWords: number = 50,
  maxWords: number = 5000
): { valid: boolean; wordCount: number; error?: string } {
  const wordCount = content.trim().split(/\s+/).length;
  
  if (wordCount < minWords) {
    return {
      valid: false,
      wordCount,
      error: `Argument must be at least ${minWords} words. Current: ${wordCount}`,
    };
  }
  
  if (wordCount > maxWords) {
    return {
      valid: false,
      wordCount,
      error: `Argument must be ${maxWords} words or less. Current: ${wordCount}`,
    };
  }
  
  return { valid: true, wordCount };
}

/**
 * Check if debate is accepting arguments
 */
export function isDebateAcceptingArguments(debate: Debate): boolean {
  return debate.status === 'active';
}

/**
 * Check if debate is accepting votes
 */
export function isDebateAcceptingVotes(debate: Debate): boolean {
  return debate.status === 'voting' || debate.status === 'completed';
}

/**
 * Check if agent has reached argument limit
 */
export function hasAgentReachedArgumentLimit(
  debate: Debate,
  agentArguments: Argument[]
): boolean {
  const agentArgumentCount = agentArguments.length;
  return agentArgumentCount >= debate.max_arguments_per_side;
}

/**
 * Calculate time remaining until deadline
 */
export function calculateTimeRemaining(deadline: string | null): number | null {
  if (!deadline) return null;
  
  const now = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();
  const remaining = deadlineTime - now;
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'Expired';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  }
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
  
  return `${seconds} second${seconds > 1 ? 's' : ''} remaining`;
}

// ============================================================================
// DEBATE VIEW HELPERS
// ============================================================================

/**
 * Prepare debate view data
 */
export function prepareDebateViewData(
  debate: DebateWithDetails,
  userVote?: 'for' | 'against' | null,
  agentId?: string
): DebateViewData {
  const activeStage = (debate as any).stages?.find((s: any) => s.status === 'active');
  const canVote = isDebateAcceptingVotes(debate) && !userVote;
  const canSubmitArgument = isDebateAcceptingArguments(debate) && !!agentId && !!activeStage;
  
  const timeRemaining: any = {};
  
  if (debate.argument_submission_deadline) {
    const remaining = calculateTimeRemaining(debate.argument_submission_deadline);
    if (remaining !== null) {
      timeRemaining.argumentSubmission = remaining;
    }
  }
  
  if (debate.voting_deadline) {
    const remaining = calculateTimeRemaining(debate.voting_deadline);
    if (remaining !== null) {
      timeRemaining.voting = remaining;
    }
  }
  
  return {
    debate,
    userVote,
    canVote,
    canSubmitArgument,
    activeStageId: activeStage?.id,
    timeRemaining: Object.keys(timeRemaining).length > 0 ? timeRemaining : undefined,
  };
}

/**
 * Get arguments grouped by side
 */
export function getArgumentsBySide(
  argumentList: Argument[]
): { for: Argument[]; against: Argument[] } {
  return {
    for: argumentList.filter((a) => a.side === 'for'),
    against: argumentList.filter((a) => a.side === 'against'),
  };
}

/**
 * Get participant by side
 */
export function getParticipantBySide(
  participants: any[],
  side: 'for' | 'against'
): any | undefined {
  return participants.find((p) => p.side === side);
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    philosophical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    political: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ethical: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    scientific: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };
  
  return colors[category.toLowerCase()] || colors.general;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    voting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };
  
  return colors[status.toLowerCase()] || colors.pending;
}

/**
 * Get side color
 */
export function getSideColor(side: string): string {
  const colors: Record<string, string> = {
    for: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    against: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  
  return colors[side.toLowerCase()] || colors.for;
}

// ============================================================================
// SEARCH AND FILTER HELPERS
// ============================================================================

/**
 * Filter debates by search term
 */
export function filterDebatesBySearch(
  debates: Debate[],
  searchTerm: string
): Debate[] {
  if (!searchTerm.trim()) return debates;
  
  const term = searchTerm.toLowerCase();
  
  return debates.filter(
    (d) =>
      d.title.toLowerCase().includes(term) ||
      d.description.toLowerCase().includes(term)
  );
}

/**
 * Sort debates
 */
export function sortDebates(
  debates: Debate[],
  sortBy: 'created_at' | 'title' | 'status' | 'total_votes',
  sortOrder: 'asc' | 'desc'
): Debate[] {
  return [...debates].sort((a, b) => {
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
      case 'total_votes':
        comparison = a.total_votes - b.total_votes;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Paginate debates
 */
export function paginateDebates(
  debates: Debate[],
  page: number,
  limit: number
): { debates: Debate[]; total: number; hasMore: boolean } {
  const offset = (page - 1) * limit;
  const paginatedDebates = debates.slice(offset, offset + limit);
  
  return {
    debates: paginatedDebates,
    total: debates.length,
    hasMore: offset + limit < debates.length,
  };
}
