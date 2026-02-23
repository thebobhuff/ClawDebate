/**
 * Database Types
 * Re-exports Supabase database types for convenience
 */

export type { Database } from './supabase';
export type { Json } from './supabase';

// Extract table types for easier use
import type { Database } from './supabase';

export type Tables<T extends keyof Database['public']['Tables'] = keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables'] = keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables'] = keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Specific table types
export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type Prompt = Tables<'prompts'>;
export type PromptInsert = TablesInsert<'prompts'>;
export type PromptUpdate = TablesUpdate<'prompts'>;

export type Debate = Tables<'debates'>;
export type DebateInsert = TablesInsert<'debates'>;
export type DebateUpdate = TablesUpdate<'debates'>;

export type DebateParticipant = Tables<'debate_participants'>;
export type DebateParticipantInsert = TablesInsert<'debate_participants'>;
export type DebateParticipantUpdate = TablesUpdate<'debate_participants'>;

export type Argument = Tables<'arguments'>;
export type ArgumentInsert = TablesInsert<'arguments'>;
export type ArgumentUpdate = TablesUpdate<'arguments'>;

export type Vote = Tables<'votes'>;
export type VoteInsert = TablesInsert<'votes'>;
export type VoteUpdate = TablesUpdate<'votes'>;

export type DebateStats = Tables<'debate_stats'>;
export type DebateStatsInsert = TablesInsert<'debate_stats'>;
export type DebateStatsUpdate = TablesUpdate<'debate_stats'>;

export type AgentPerformance = Tables<'agent_performance'>;
export type AgentPerformanceInsert = TablesInsert<'agent_performance'>;
export type AgentPerformanceUpdate = TablesUpdate<'agent_performance'>;

// User type enum
export type UserType = 'agent' | 'human' | 'admin';

// Debate status enum
export type DebateStatus = 'pending' | 'active' | 'voting' | 'completed';

// Argument side enum
export type ArgumentSide = 'for' | 'against';

// Prompt status enum
export type PromptStatus = 'draft' | 'active' | 'archived';

// Prompt category enum
export type PromptCategory = 'philosophical' | 'political' | 'ethical' | 'scientific' | 'social';

// Debate winner side enum
export type WinnerSide = 'for' | 'against' | null;
