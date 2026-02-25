/**
 * Debate Helper Functions
 * Debate-specific database operations
 */

import { createClient } from './server';
import { createServiceRoleClient } from './service-role';
import type { Database } from '@/types/supabase';

type Debate = Database['public']['Tables']['debates']['Row'];
type DebateStats = Database['public']['Tables']['debate_stats']['Row'];
type Argument = Database['public']['Tables']['arguments']['Row'];
type Vote = Database['public']['Tables']['votes']['Row'];
type DebateParticipant = Database['public']['Tables']['debate_participants']['Row'];

// ============================================================================
// DEBATE OPERATIONS
// ============================================================================

/**
 * Get all debates
 */
export async function getAllDebates(filters?: {
  status?: 'pending' | 'active' | 'voting' | 'completed';
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('debates')
    .select(`
      *,
      prompt:prompts (title, category, description),
      stats:debate_stats (for_votes, against_votes, total_arguments)
    `)
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching debates:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get debate by ID
 */
export async function getDebateById(debateId: string): Promise<Debate | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('debates')
    .select(`
      *,
      prompt:prompts (*),
      stats:debate_stats (*)
    `)
    .eq('id', debateId)
    .single();
  
  if (error) {
    console.error('Error fetching debate:', error);
    return null;
  }
  
  return data;
}

/**
 * Get debate with full details (arguments, participants, votes)
 */
export async function getDebateWithDetails(debate_id: string) {
  const supabase = await createClient();
  
  // Fetch debate with standard relationships
  const { data: debate, error: debateError } = await supabase
    .from('debates')
    .select(`
      *,
      prompt:prompts (*),
      stats:debate_stats (*),
      participants:debate_participants (
        *,
        agent:profiles (display_name, avatar_url, bio)
      ),
      arguments (
        *,
        agent:profiles (display_name, avatar_url)
      )
    `)
    .eq('id', debate_id)
    .single();
  
  if (debateError) {
    console.error('Error fetching debate details:', JSON.stringify(debateError, null, 2));
    return null;
  }

  // Fetch stages separately since PostgREST schema cache might not be updated
  let stages: any[] = [];
  try {
    const { data: stagesData, error: stagesError } = await (supabase
      .from('debate_stages') as any)
      .select('*')
      .eq('debate_id', debate_id)
      .order('stage_order', { ascending: true });

    if (stagesError) {
      console.error('Error fetching debate stages:', JSON.stringify(stagesError, null, 2));
    } else {
      stages = stagesData || [];
    }
  } catch (err) {
    console.error('Exception fetching debate stages:', err);
  }
  
  return {
    ...(debate as any),
    stages: stages
  };
}

/**
 * Create debate (admin only)
 */
export async function createDebate(debateData: {
  promptId: string;
  title: string;
  description: string;
  maxArgumentsPerSide?: number;
  argumentSubmissionDeadline?: Date;
  votingDeadline?: Date;
}) {
  const supabase = await createClient();
  
  const { data, error } = await (supabase
    .from('debates') as any)
    .insert({
      prompt_id: debateData.promptId,
      title: debateData.title,
      description: debateData.description,
      max_arguments_per_side: debateData.maxArgumentsPerSide || 5,
      argument_submission_deadline: debateData.argumentSubmissionDeadline?.toISOString() || null,
      voting_deadline: debateData.votingDeadline?.toISOString() || null,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating debate:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update debate
 */
export async function updateDebate(debateId: string, updates: Partial<{
  title: string;
  description: string;
  status: 'pending' | 'active' | 'voting' | 'completed';
  max_arguments_per_side: number;
  argument_submission_deadline: string;
  voting_deadline: string;
  winner_side: 'for' | 'against';
  winner_agent_id: string;
}>) {
  const supabase = await createClient();
  
  const { data, error } = await (supabase
    .from('debates') as any)
    .update(updates)
    .eq('id', debateId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating debate:', error);
    throw error;
  }
  
  return data;
}

/**
 * Delete debate (admin only)
 */
export async function deleteDebate(debateId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('debates')
    .delete()
    .eq('id', debateId);
  
  if (error) {
    console.error('Error deleting debate:', error);
    return false;
  }
  
  return true;
}

// ============================================================================
// DEBATE ARGUMENTS
// ============================================================================

/**
 * Get arguments for a debate
 */
export async function getDebateArguments(debateId: string, side?: 'for' | 'against') {
  const supabase = await createClient();
  
  let query = supabase
    .from('arguments')
    .select(`
      *,
      agent:profiles (display_name, avatar_url)
    `)
    .eq('debate_id', debateId)
    .order('argument_order', { ascending: true });
  
  if (side) {
    query = query.eq('side', side);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching arguments:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get debate participants
 */
export async function getDebateParticipants(debateId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('debate_participants')
    .select(`
      *,
      agent:profiles (display_name, avatar_url, bio)
    `)
    .eq('debate_id', debateId);
  
  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// DEBATE STATS
// ============================================================================

/**
 * Get debate statistics
 */
export async function getDebateStats(debateId: string): Promise<DebateStats | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('debate_stats')
    .select('*')
    .eq('debate_id', debateId)
    .single();
  
  if (error) {
    console.error('Error fetching debate stats:', error);
    return null;
  }
  
  return data;
}

/**
 * Get vote counts for a debate
 */
export async function getDebateVoteCounts(debateId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('votes')
    .select('side')
    .eq('debate_id', debateId);
  
  if (error) {
    console.error('Error fetching vote counts:', error);
    return { for: 0, against: 0 };
  }
  
  const votes = data || [];
  return {
    for: votes.filter((v: any) => v.side === 'for').length,
    against: votes.filter((v: any) => v.side === 'against').length,
  };
}

// ============================================================================
// DEBATE STATUS MANAGEMENT
// ============================================================================

/**
 * Submit an argument to a debate
 */
export async function submitArgument(data: {
  debateId: string;
  stageId: string;
  agentId: string;
  content: string;
  model: string;
  side: 'for' | 'against';
}) {
  const serviceRoleSupabase = createServiceRoleClient();
  
  // Double-check the daily limit (redundancy for verification flow)
  const today = new Date().toISOString().split('T')[0];
  const { data: existingToday } = await serviceRoleSupabase
    .from('arguments')
    .select('id')
    .eq('debate_id', data.debateId)
    .eq('stage_id', data.stageId)
    .eq('agent_id', data.agentId)
    .gte('created_at', today)
    .limit(1);

  if (existingToday && existingToday.length > 0) {
    throw new Error('Agent can only post once a day per debate stage');
  }

  // Get existing arguments for this side
  const { data: agentArguments } = await serviceRoleSupabase
    .from('arguments')
    .select('id')
    .eq('debate_id', data.debateId)
    .eq('side', data.side);

  const argumentOrder = (agentArguments?.length || 0) + 1;

  // Submit argument
  const { data: argument, error } = await (serviceRoleSupabase
    .from('arguments')
    .insert({
      debate_id: data.debateId,
      stage_id: data.stageId,
      agent_id: data.agentId,
      side: data.side,
      content: data.content,
      model: data.model,
      argument_order: argumentOrder,
    } as any)
    .select()
    .single());

  if (error) {
    throw error;
  }
  
  return argument;
}

/**
 * Start debate (change status to active)
 */
export async function startDebate(debateId: string) {
  return updateDebate(debateId, { status: 'active' });
}

/**
 * Open voting for debate
 */
export async function openVoting(debateId: string) {
  return updateDebate(debateId, { status: 'voting' });
}

/**
 * Complete debate
 */
export async function completeDebate(debateId: string, winnerSide: 'for' | 'against', winnerAgentId?: string) {
  return updateDebate(debateId, {
    status: 'completed',
    winner_side: winnerSide,
    winner_agent_id: winnerAgentId || undefined,
  });
}
