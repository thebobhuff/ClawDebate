/**
 * Agent Helper Functions
 * Agent-specific database operations
 */

import { createClient } from './server';
import { createServiceRoleClient } from './service-role';
import { generateApiKey } from './auth';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AgentPerformance = Database['public']['Tables']['agent_performance']['Row'];
type DebateParticipant = Database['public']['Tables']['debate_participants']['Row'];
type Argument = Database['public']['Tables']['arguments']['Row'];

// ============================================================================
// AGENT PROFILE OPERATIONS
// ============================================================================

/**
 * Get all agents
 */
export async function getAllAgents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_type', 'agent')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get agent by ID
 */
export async function getAgentById(agentId: string): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', agentId)
    .eq('user_type', 'agent')
    .single();
  
  if (error) {
    console.error('Error fetching agent:', error);
    return null;
  }
  
  return data;
}

/**
 * Get agent by API key
 */
export async function getAgentByApiKey(apiKey: string): Promise<Profile | null> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('agent_api_key', apiKey)
    .eq('user_type', 'agent')
    .single();
  
  if (error) {
    console.error('Error fetching agent by API key:', error);
    return null;
  }
  
  return data;
}

/**
 * Create agent profile (admin only)
 */
export async function createAgent(data: {
  email: string;
  password: string;
  displayName: string;
  bio?: string;
  capabilities?: Record<string, unknown>;
}) {
  const supabase = createServiceRoleClient();
  
  // Create auth user
  const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });
  
  if (authError || !user) {
    console.error('Error creating agent auth user:', authError);
    throw authError || new Error('Failed to create agent');
  }
  
  // Generate API key
  const apiKey = generateApiKey();
  
  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      user_type: 'agent',
      display_name: data.displayName,
      bio: data.bio || null,
      agent_api_key: apiKey,
      agent_capabilities: data.capabilities || null,
    } as any)
    .eq('id', user.id);
  
  if (profileError) {
    console.error('Error updating agent profile:', profileError);
    // Rollback auth user creation
    await supabase.auth.admin.deleteUser(user.id);
    throw profileError;
  }
  
  return { user, apiKey };
}

/**
 * Update agent profile
 */
export async function updateAgent(agentId: string, updates: Partial<{
  display_name: string;
  bio: string;
  avatar_url: string;
  agent_capabilities: Record<string, unknown>;
}>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as any)
    .eq('id', agentId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
  
  return data;
}

/**
 * Regenerate agent API key
 */
export async function regenerateAgentApiKey(agentId: string): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const newApiKey = generateApiKey();
  
  const { error } = await supabase
    .from('profiles')
    .update({ agent_api_key: newApiKey } as any)
    .eq('id', agentId);
  
  if (error) {
    console.error('Error regenerating API key:', error);
    throw error;
  }
  
  return newApiKey;
}

// ============================================================================
// AGENT PERFORMANCE OPERATIONS
// ============================================================================

/**
 * Get agent performance
 */
export async function getAgentPerformance(agentId: string): Promise<AgentPerformance | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('agent_performance')
    .select('*')
    .eq('agent_id', agentId)
    .single();
  
  if (error) {
    console.error('Error fetching agent performance:', error);
    return null;
  }
  
  return data;
}

/**
 * Get all agents ranked by win rate
 */
export async function getAgentsByWinRate(limit: number = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('agent_performance')
    .select(`
      *,
      agent:profiles!agent_performance_agent_id_fkey (
        id,
        display_name,
        avatar_url,
        bio
      )
    `)
    .order('win_rate', { ascending: false, nullsFirst: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching agents by win rate:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get all agents ranked by total debates
 */
export async function getAgentsByTotalDebates(limit: number = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('agent_performance')
    .select(`
      *,
      agent:profiles!agent_performance_agent_id_fkey (
        id,
        display_name,
        avatar_url,
        bio
      )
    `)
    .order('total_debates', { ascending: false, nullsFirst: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching agents by total debates:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// AGENT DEBATE OPERATIONS
// ============================================================================

/**
 * Get debates agent is participating in
 */
export async function getAgentDebates(agentId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('debate_participants')
    .select(`
      *,
      debate:debates (
        *,
        prompt:prompts (title, category)
      )
    `)
    .eq('agent_id', agentId)
    .order('joined_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching agent debates:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get arguments submitted by agent
 */
export async function getAgentArguments(agentId: string, limit: number = 20) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('arguments')
    .select(`
      *,
      debate:debates (title, status)
    `)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching agent arguments:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Agent joins a debate
 */
export async function joinDebate(debateId: string, side: 'for' | 'against') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { data, error } = await supabase
    .from('debate_participants')
    .insert({
      debate_id: debateId,
      agent_id: user.id,
      side,
    } as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error joining debate:', error);
    throw error;
  }
  
  return data;
}

/**
 * Agent submits an argument
 */
export async function submitArgument(argumentData: {
  debateId: string;
  side: 'for' | 'against';
  content: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  // Get current argument count for this agent and side
  const { data: existingArgs } = await supabase
    .from('arguments')
    .select('id')
    .eq('debate_id', argumentData.debateId)
    .eq('agent_id', user.id)
    .eq('side', argumentData.side);
  
  const argumentOrder = (existingArgs?.length || 0) + 1;
  
  const { data, error } = await supabase
    .from('arguments')
    .insert({
      debate_id: argumentData.debateId,
      agent_id: user.id,
      side: argumentData.side,
      content: argumentData.content,
      argument_order: argumentOrder,
    } as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error submitting argument:', error);
    throw error;
  }
  
  return data;
}
