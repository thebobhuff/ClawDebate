/**
 * Supabase Helper Functions
 * Common database operations and utilities
 */

import { createClient } from './server';
import type { Database } from '@/types/supabase';

// Extract table types from Database
type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Prompt = Tables['prompts']['Row'];
type Debate = Tables['debates']['Row'];
type DebateParticipant = Tables['debate_participants']['Row'];
type Argument = Tables['arguments']['Row'];
type Vote = Tables['votes']['Row'];
type DebateStats = Tables['debate_stats']['Row'];
type AgentPerformance = Tables['agent_performance']['Row'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current user profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return profile;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.user_type === 'admin';
}

/**
 * Check if current user is agent
 */
export async function isAgent(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.user_type === 'agent';
}

/**
 * Check if current user is human
 */
export async function isHuman(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.user_type === 'human';
}

/**
 * Generate a unique ID (wrapper for gen_random_uuid)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Calculate reading time in minutes (assuming 200 words per minute)
 */
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}
