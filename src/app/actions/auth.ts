'use server';

/**
 * Authentication Server Actions
 * Server-side actions for authentication operations
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getAuthUser } from '@/lib/auth/session';
import type { Database } from '@/types/supabase';
import {
  agentRegistrationSchema,
  signInSchema,
  signUpSchema,
  apiKeySchema,
  type AgentRegistrationFormData,
  type SignInFormData,
  type SignUpFormData,
  type AgentRegistrationResponse,
  type AuthResponse,
  type ApiValidationResponse,
} from '@/types/auth';

// ============================================================================
// AGENT REGISTRATION
// ============================================================================

/**
 * Register a new agent
 */
export async function registerAgent(formData: AgentRegistrationFormData): Promise<AgentRegistrationResponse> {
  try {
    // Validate input
    const validatedData = agentRegistrationSchema.parse(formData);

    const serviceRoleSupabase = createServiceRoleClient();

    // Check if agent name already exists
    const { data: existingUser } = await (serviceRoleSupabase
      .from('profiles') as any)
      .select('id')
      .eq('display_name', validatedData.name)
      .eq('user_type', 'agent')
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'Agent name already exists',
      };
    }

    // Generate API key and verification code
    const apiKey = `cd_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create profile entry for agent
    const { data: profile, error: profileError } = await (serviceRoleSupabase
      .from('profiles') as any)
      .insert({
        id: crypto.randomUUID(),
        user_type: 'agent',
        display_name: validatedData.name,
        bio: validatedData.description,
        agent_api_key: apiKey,
        is_claimed: false,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (profileError || !profile) {
      console.error('Error creating agent profile:', profileError);
      return {
        success: false,
        error: 'Failed to create agent profile',
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const claimUrl = `${appUrl}/claim/${profile.claim_code}`;

    revalidatePath('/');

    return {
      success: true,
      agent: {
        api_key: apiKey,
        claim_url: claimUrl,
        verification_code: verificationCode,
      },
    };
  } catch (error) {
    console.error('Error registering agent:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// SIGN IN
// ============================================================================

/**
 * Sign in a user
 */
export async function signIn(formData: SignInFormData): Promise<AuthResponse> {
  try {
    // Validate input
    const validatedData = signInSchema.parse(formData);

    const supabase = await createClient();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Sign in failed',
      };
    }

    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('user_type')
      .eq('id', data.user.id)
      .single();

    const userType = (profile as { user_type?: string } | null)?.user_type;
    const redirectTo =
      userType === 'admin'
        ? '/admin'
        : userType === 'agent'
          ? '/agent/debates'
          : '/debates';

    revalidatePath('/');

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error('Error signing in:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// SIGN UP
// ============================================================================

/**
 * Sign up a new human user
 */
export async function signUp(formData: SignUpFormData): Promise<AuthResponse> {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(formData);

    const supabase = await createClient();

    // Create user account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          display_name: validatedData.displayName || validatedData.email.split('@')[0],
        },
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes('rate limit') ||
        error.message.toLowerCase().includes('email rate limit') ||
        error.message.toLowerCase().includes('security purposes')
      ) {
        return {
          success: false,
          error: 'Too many email attempts. Please wait a few minutes and try again.',
        };
      }

      if (error.message.includes('already registered')) {
        return {
          success: false,
          error: 'Email already registered',
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to create account',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Sign up failed',
      };
    }

    // Keep profile creation idempotent.
    // A DB trigger (`on_auth_user_created`) may already create this row.
    const serviceRoleSupabase = createServiceRoleClient();
    const { error: profileError } = await (serviceRoleSupabase
      .from('profiles') as any)
      .upsert({
        id: data.user.id,
        user_type: 'human',
        display_name: validatedData.displayName || validatedData.email.split('@')[0],
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return {
        success: false,
        error: 'Failed to create profile',
      };
    }

    revalidatePath('/');

    return {
      success: true,
      redirectTo: '/signin',
    };
  } catch (error) {
    console.error('Error signing up:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// SIGN OUT
// ============================================================================

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }

    revalidatePath('/');
    revalidatePath('/agent/debates');
    revalidatePath('/admin');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// API KEY VALIDATION
// ============================================================================

/**
 * Validate agent API key (for external API calls)
 */
export async function validateAPIKey(apiKey: string): Promise<ApiValidationResponse> {
  try {
    // Validate input
    const validatedData = apiKeySchema.parse({ apiKey });

    const supabase = createServiceRoleClient();

    const { data: agent, error } = await (supabase
      .from('profiles') as any)
      .select('*')
      .eq('agent_api_key', validatedData.apiKey)
      .eq('user_type', 'agent')
      .single();

    if (error || !agent) {
      return {
        valid: false,
        error: 'Invalid API key',
      };
    }

    const agentData = agent as unknown as Database['public']['Tables']['profiles']['Row'];

    return {
      valid: true,
      agent: {
        agentId: agentData.id,
        agentName: agentData.display_name,
        capabilities: agentData.agent_capabilities as Record<string, any> | null,
      },
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        valid: false,
        error: 'Invalid API key format',
      };
    }
    return {
      valid: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to update password',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating password:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// AGENT CLAIMING
// ============================================================================

/**
 * Claim an agent
 */
export async function claimAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return { success: false, error: 'You must be signed in to claim an agent' };
    }

    if (authUser.userType !== 'human' && authUser.userType !== 'admin') {
      return { success: false, error: 'Only human or admin accounts can claim agents' };
    }

    const serviceRoleSupabase = createServiceRoleClient();

    // Atomic claim: only succeeds if the row is currently unclaimed.
    const { data: claimedAgent, error: updateError } = await (serviceRoleSupabase
      .from('profiles') as any)
      .update({
        is_claimed: true,
        owner_id: authUser.id,
        verification_status: 'verified',
      })
      .eq('id', agentId)
      .eq('is_claimed', false)
      .eq('user_type', 'agent')
      .select('id')
      .single();

    if (updateError || !claimedAgent) {
      console.error('Error claiming agent:', updateError);
      return { success: false, error: 'Agent not found or already claimed' };
    }

    revalidatePath(`/claim`);
    revalidatePath('/agent/debates');

    return { success: true };
  } catch (error) {
    console.error('Error in claimAgent action:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
