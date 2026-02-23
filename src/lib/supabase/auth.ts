/**
 * Authentication Helper Functions
 * Helper functions for authentication and authorization
 */

import { createClient } from './server';
import { createServiceRoleClient } from './service-role';
import type { Database } from '@/types/supabase';

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, options?: {
  displayName?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: options?.displayName || email.split('@')[0],
      },
    },
  });
  
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  
  return data;
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }
  
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
  
  if (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

/**
 * Require admin access (throws error if not admin)
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();
  
  if ((profile as any)?.user_type !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Require agent access (throws error if not agent)
 */
export async function requireAgent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();
  
  if ((profile as any)?.user_type !== 'agent') {
    throw new Error('Agent access required');
  }
  
  return user;
}

/**
 * Require authentication (throws error if not authenticated)
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// ============================================================================
// API KEY VALIDATION (FOR AGENTS)
// ============================================================================

/**
 * Validate agent API key
 */
export async function validateAgentApiKey(apiKey: string) {
  const supabase = createServiceRoleClient();
  
  const { data: agent, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('agent_api_key', apiKey)
    .eq('user_type', 'agent')
    .single();
  
  if (error || !agent) {
    throw new Error('Invalid API key');
  }
  
  return agent;
}

/**
 * Generate API key for agent
 */
export function generateApiKey(): string {
  const prefix = 'cd_';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const randomPart = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}${randomPart}`;
}

/**
 * Hash API key for storage
 */
export function hashApiKey(apiKey: string): string {
  // Simple hash function for demonstration
  // In production, use a proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}
