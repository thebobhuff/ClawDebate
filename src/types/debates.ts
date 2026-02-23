/**
 * Debate Types
 * Type definitions for debate-related operations
 */

import type { Database } from './supabase';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type Debate = Database['public']['Tables']['debates']['Row'];
export type DebateInsert = Database['public']['Tables']['debates']['Insert'];
export type DebateUpdate = Database['public']['Tables']['debates']['Update'];

export type DebateParticipant = Database['public']['Tables']['debate_participants']['Row'];
export type DebateParticipantInsert = Database['public']['Tables']['debate_participants']['Insert'];
export type DebateParticipantUpdate = Database['public']['Tables']['debate_participants']['Update'];

export type Argument = Database['public']['Tables']['arguments']['Row'];
export type ArgumentInsert = Database['public']['Tables']['arguments']['Insert'];
export type ArgumentUpdate = Database['public']['Tables']['arguments']['Update'];

export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];
export type VoteUpdate = Database['public']['Tables']['votes']['Update'];

export type DebateStats = Database['public']['Tables']['debate_stats']['Row'];

// ============================================================================
// ENHANCED TYPES WITH RELATIONS
// ============================================================================

export type DebateWithPrompt = Debate & {
  prompt: {
    id: string;
    title: string;
    category: string;
    description: string;
    tags: string[];
  };
};

export type DebateWithStats = Debate & {
  stats: DebateStats | null;
};

export type DebateWithDetails = Debate & {
  prompt: {
    id: string;
    title: string;
    category: string;
    description: string;
    tags: string[];
    status: string;
  };
  stats: DebateStats | null;
  participants: Array<DebateParticipant & {
    agent: {
      id: string;
      display_name: string;
      avatar_url: string | null;
      bio: string | null;
    };
  }>;
  arguments: Array<Argument & {
    agent: {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };
  }>;
};

export type ArgumentWithAgent = Argument & {
  agent: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type DebateParticipantWithAgent = DebateParticipant & {
  agent: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
};

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateDebateForm {
  promptId: string;
  title: string;
  description: string;
  maxArgumentsPerSide?: number;
  argumentSubmissionDeadline?: Date | null;
  votingDeadline?: Date | null;
}

export interface UpdateDebateForm {
  title?: string;
  description?: string;
  status?: 'pending' | 'active' | 'voting' | 'completed';
  maxArgumentsPerSide?: number;
  argumentSubmissionDeadline?: Date | null;
  votingDeadline?: Date | null;
  winnerSide?: 'for' | 'against' | null;
  winnerAgentId?: string | null;
}

export interface JoinDebateForm {
  debateId: string;
  side: 'for' | 'against';
}

export interface SubmitArgumentForm {
  debateId: string;
  content: string;
}

export interface CastVoteForm {
  debateId: string;
  side: 'for' | 'against';
}

export interface UpdateDebateStatusForm {
  debateId: string;
  status: 'pending' | 'active' | 'voting' | 'completed';
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface DebateFilters {
  status?: 'pending' | 'active' | 'voting' | 'completed' | 'all';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'title' | 'status' | 'total_votes';
  sortOrder?: 'asc' | 'desc';
}

export interface AgentDebateFilters {
  status?: 'available' | 'participating' | 'completed';
  page?: number;
  limit?: number;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface DebateStatistics {
  totalDebates: number;
  activeDebates: number;
  completedDebates: number;
  totalVotes: number;
  totalArguments: number;
  avgArgumentsPerDebate: number;
  mostVotedDebates: Array<{
    debateId: string;
    title: string;
    totalVotes: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
}

export interface AgentDebateStatistics {
  totalDebates: number;
  activeDebates: number;
  completedDebates: number;
  wins: number;
  losses: number;
  winRate: number;
  totalArgumentsSubmitted: number;
  avgWordCount: number;
}

export interface VoteCounts {
  for: number;
  against: number;
  total: number;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface DebateCardData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'voting' | 'completed';
  category: string;
  createdAt: string;
  totalVotes: number;
  forVotes: number;
  againstVotes: number;
  totalArguments: number;
  forArguments: number;
  againstArguments: number;
  participants: number;
}

export interface DebateViewData {
  debate: DebateWithDetails;
  userVote?: 'for' | 'against' | null;
  canVote: boolean;
  canSubmitArgument: boolean;
  timeRemaining?: {
    argumentSubmission?: number;
    voting?: number;
  };
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface DebateUpdatePayload {
  debateId: string;
  type: 'status' | 'vote' | 'argument' | 'participant';
  data: any;
}

export interface VoteUpdatePayload {
  debateId: string;
  side: 'for' | 'against';
  counts: VoteCounts;
}

export interface ArgumentUpdatePayload {
  debateId: string;
  argument: ArgumentWithAgent;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface DebateError {
  code: string;
  message: string;
  details?: any;
}

export type DebateErrorCode =
  | 'DEBATE_NOT_FOUND'
  | 'DEBATE_ALREADY_JOINED'
  | 'DEBATE_FULL'
  | 'DEBATE_NOT_ACTIVE'
  | 'ARGUMENT_LIMIT_EXCEEDED'
  | 'ALREADY_VOTED'
  | 'VOTING_NOT_OPEN'
  | 'INVALID_SIDE'
  | 'INVALID_STATUS'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface DebateResponse<T = any> {
  success: boolean;
  data?: T;
  error?: DebateError;
}

export interface DebateListResponse {
  debates: DebateWithStats[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
