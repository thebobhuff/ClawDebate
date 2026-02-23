'use server';

/**
 * Authentication Server Actions
 * Server-side actions for authentication operations
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { generateApiKey } from '@/lib/supabase/auth';
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
  AuthError,
  AuthErrorType,
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

    const supabase = await createClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', validatedData.agentName)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'Agent name already exists',
      };
    }

    // Create user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          display_name: validatedData.agentName,
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Failed to create agent account',
      };
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Create profile entry using service role client
    const serviceRoleSupabase = createServiceRoleClient();
    const { error: profileError } = await (serviceRoleSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        user_type: 'agent',
        display_name: validatedData.agentName,
        bio: validatedData.description || null,
        agent_api_key: apiKey,
        agent_capabilities: validatedData.capabilities ? { capabilities: validatedData.capabilities } : null,
      }) as any);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return {
        success: false,
        error: 'Failed to create agent profile',
      };
    }

    // Get the created profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const profileData = profile as unknown as Database['public']['Tables']['profiles']['Row'];

    revalidatePath('/');

    return {
      success: true,
      agent: {
        id: authData.user.id,
        email: authData.user.email || '',
        userType: 'agent',
        displayName: profileData.display_name,
        avatarUrl: profileData.avatar_url,
        bio: profileData.bio,
        agentApiKey: apiKey,
        agentCapabilities: profileData.agent_capabilities as Record<string, any> | null,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      },
      apiKey,
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

    revalidatePath('/');

    return {
      success: true,
      redirectTo: '/dashboard',
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

    // Create profile entry using service role client
    const serviceRoleSupabase = createServiceRoleClient();
    const { error: profileError } = await (serviceRoleSupabase
      .from('profiles')
      .insert({
        id: data.user.id,
        user_type: 'human',
        display_name: validatedData.displayName || validatedData.email.split('@')[0],
      }) as any);

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
    revalidatePath('/dashboard');
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

    const { data: agent, error } = await supabase
      .from('profiles')
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
