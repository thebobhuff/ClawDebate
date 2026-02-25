/**
 * Prompt Helper Functions
 * Prompt management database operations
 */

import { createClient } from './server';
import type { Database } from '@/types/supabase';

type Prompt = Database['public']['Tables']['prompts']['Row'];
type Debate = Database['public']['Tables']['debates']['Row'];

// ============================================================================
// PROMPT OPERATIONS
// ============================================================================

/**
 * Get all prompts
 */
export async function getAllPrompts(filters?: {
  status?: 'draft' | 'active' | 'archived';
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles (display_name, avatar_url),
      _count:debates (id)
    `)
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get prompt by ID
 */
export async function getPromptById(promptId: string): Promise<Prompt | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles (display_name, avatar_url)
    `)
    .eq('id', promptId)
    .single();
  
  if (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
  
  return data;
}

/**
 * Get active prompts
 */
export async function getActivePrompts(limit: number = 20) {
  return getAllPrompts({ status: 'active', limit });
}

/**
 * Get prompts by category
 */
export async function getPromptsByCategory(category: string, limit: number = 20) {
  return getAllPrompts({ category, status: 'active', limit });
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('prompts')
    .select('category')
    .eq('status', 'active');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  // Get unique categories
  const categories = [...new Set((data as any)?.map((p: any) => p.category) || [])] as string[];
  
  return categories;
}

// ============================================================================
// PROMPT CRUD OPERATIONS
// ============================================================================

/**
 * Create prompt (admin only)
 */
export async function createPrompt(promptData: {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { data, error } = await (supabase
    .from('prompts') as any)
    .insert({
      title: promptData.title,
      description: promptData.description,
      category: promptData.category,
      tags: promptData.tags || [],
      status: promptData.status || 'draft',
      created_by: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update prompt
 */
export async function updatePrompt(promptId: string, updates: Partial<{
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'active' | 'archived';
}>) {
  const supabase = await createClient();
  
  const { data, error } = await (supabase
    .from('prompts') as any)
    .update(updates)
    .eq('id', promptId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
  
  return data;
}

/**
 * Delete prompt (admin only)
 */
export async function deletePrompt(promptId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId);
  
  if (error) {
    console.error('Error deleting prompt:', error);
    return false;
  }
  
  return true;
}

/**
 * Activate prompt (change status to active)
 */
export async function activatePrompt(promptId: string) {
  return updatePrompt(promptId, { status: 'active' });
}

/**
 * Archive prompt
 */
export async function archivePrompt(promptId: string) {
  return updatePrompt(promptId, { status: 'archived' });
}

// ============================================================================
// PROMPT DEBATES
// ============================================================================

/**
 * Get debates for a prompt
 */
export async function getPromptDebates(promptId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('debates')
    .select(`
      *,
      stats:debate_stats (for_votes, against_votes, total_arguments)
    `)
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching prompt debates:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Count debates for a prompt
 */
export async function countPromptDebates(promptId: string): Promise<number> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .eq('prompt_id', promptId);
  
  if (error) {
    console.error('Error counting prompt debates:', error);
    return 0;
  }
  
  return count || 0;
}
