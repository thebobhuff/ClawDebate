/**
 * Debate Server Actions
 * Server-side actions for debate operations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  getAllDebates,
  getDebateById,
  getDebateWithDetails,
  createDebate as dbCreateDebate,
  updateDebate as dbUpdateDebate,
  deleteDebate as dbDeleteDebate,
  getDebateArguments,
  getDebateParticipants,
  getDebateStats,
  getDebateVoteCounts,
  openVoting as dbOpenVoting,
  completeDebate as dbCompleteDebate,
} from '@/lib/supabase/debates';
import {
  createDebateSchema,
  updateDebateSchema,
  deleteDebateSchema,
  getDebateByIdSchema,
  joinDebateSchema,
  leaveDebateSchema,
  submitArgumentSchema,
  updateArgumentSchema,
  deleteArgumentSchema,
  castVoteSchema,
  updateDebateStatusSchema,
  openVotingSchema,
  completeDebateSchema,
  getDebatesFilterSchema,
} from '@/lib/validations/debates';
import type { DebateResponse } from '@/types/debates';

// ============================================================================
// DEBATE ACTIONS
// ============================================================================

/**
 * Create a new debate from a prompt
 */
export async function createDebate(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to create a debate',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins can create debates',
        },
      };
    }

    const validatedFields = createDebateSchema.safeParse({
      promptId: formData.get('promptId'),
      title: formData.get('title'),
      description: formData.get('description'),
      maxArgumentsPerSide: formData.get('maxArgumentsPerSide')
        ? parseInt(formData.get('maxArgumentsPerSide') as string)
        : undefined,
      argumentSubmissionDeadline: formData.get('argumentSubmissionDeadline') as string,
      votingDeadline: formData.get('votingDeadline') as string,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const debate = await dbCreateDebate({
      promptId: validatedFields.data.promptId,
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      maxArgumentsPerSide: validatedFields.data.maxArgumentsPerSide || 5,
      argumentSubmissionDeadline: validatedFields.data.argumentSubmissionDeadline
        ? new Date(validatedFields.data.argumentSubmissionDeadline)
        : undefined,
      votingDeadline: validatedFields.data.votingDeadline
        ? new Date(validatedFields.data.votingDeadline)
        : undefined,
    });

    revalidatePath('/debates');
    revalidatePath('/admin/debates');

    return { success: true, data: debate };
  } catch (error: any) {
    console.error('Error in createDebate:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Update a debate
 */
export async function updateDebate(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to update a debate',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to update a debate',
        },
      };
    }

    const validatedFields = updateDebateSchema.safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      maxArgumentsPerSide: formData.get('maxArgumentsPerSide')
        ? parseInt(formData.get('maxArgumentsPerSide') as string)
        : undefined,
      argumentSubmissionDeadline: formData.get('argumentSubmissionDeadline') as string,
      votingDeadline: formData.get('votingDeadline') as string,
      winnerSide: formData.get('winnerSide'),
      winnerAgentId: formData.get('winnerAgentId'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const debate = await dbUpdateDebate(validatedFields.data.id, {
      ...(validatedFields.data.title && { title: validatedFields.data.title }),
      ...(validatedFields.data.description && { description: validatedFields.data.description }),
      ...(validatedFields.data.status && { status: validatedFields.data.status }),
      ...(validatedFields.data.maxArgumentsPerSide && { max_arguments_per_side: validatedFields.data.maxArgumentsPerSide }),
      ...(validatedFields.data.argumentSubmissionDeadline !== undefined && {
        argument_submission_deadline: validatedFields.data.argumentSubmissionDeadline
          ? new Date(validatedFields.data.argumentSubmissionDeadline).toISOString()
          : null,
      }),
      ...(validatedFields.data.votingDeadline !== undefined && {
        voting_deadline: validatedFields.data.votingDeadline
          ? new Date(validatedFields.data.votingDeadline).toISOString()
          : null,
      }),
      ...(validatedFields.data.winnerSide !== undefined && { winner_side: validatedFields.data.winnerSide }),
      ...(validatedFields.data.winnerAgentId !== undefined && { winner_agent_id: validatedFields.data.winnerAgentId }),
    } as any);

    revalidatePath(`/debates/${validatedFields.data.id}`);
    revalidatePath('/debates');
    revalidatePath('/admin/debates');

    return { success: true, data: debate };
  } catch (error: any) {
    console.error('Error in updateDebate:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Delete a debate
 */
export async function deleteDebate(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to delete a debate',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins can delete debates',
        },
      };
    }

    const validatedFields = deleteDebateSchema.safeParse({
      id: formData.get('id'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid debate ID',
        },
      };
    }

    await dbDeleteDebate(validatedFields.data.id);

    revalidatePath('/debates');
    revalidatePath('/admin/debates');

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteDebate:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Get debate by ID
 */
export async function getDebateByIdAction(debateId: string): Promise<DebateResponse> {
  try {
    const validatedFields = getDebateByIdSchema.safeParse({ id: debateId });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid debate ID',
        },
      };
    }

    const debate = await getDebateWithDetails(validatedFields.data.id);

    if (!debate) {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: 'Debate not found',
        },
      };
    }

    return { success: true, data: debate };
  } catch (error: any) {
    console.error('Error in getDebateByIdAction:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// DEBATE PARTICIPANT ACTIONS
// ============================================================================

/**
 * Join a debate
 */
export async function joinDebate(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to join a debate',
        },
      };
    }

    // Check if user is agent
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'agent') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only agents can join debates',
        },
      };
    }

    const validatedFields = joinDebateSchema.safeParse({
      debateId: formData.get('debateId'),
      side: formData.get('side'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    // Check if debate exists and is accepting participants
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: 'Debate not found',
        },
      };
    }

    if (debate.status !== 'pending' && debate.status !== 'active') {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_ACTIVE',
          message: 'This debate is not accepting new participants',
        },
      };
    }

    // Check if user is already participating
    const participants = await getDebateParticipants(validatedFields.data.debateId);
    const existingParticipant = participants.find((p: any) => p.agent_id === user.id);

    if (existingParticipant) {
      return {
        success: false,
        error: {
          code: 'DEBATE_ALREADY_JOINED',
          message: 'You are already participating in this debate',
        },
      };
    }

    // Check if side is full
    const sideParticipants = participants.filter((p: any) => p.side === validatedFields.data.side);

    if (sideParticipants.length >= 1) {
      return {
        success: false,
        error: {
          code: 'DEBATE_FULL',
          message: 'This side is already full',
        },
      };
    }

    // Join debate
    const { error } = await supabase
      .from('debate_participants')
      .insert({
        debate_id: validatedFields.data.debateId,
        agent_id: user.id,
        side: validatedFields.data.side,
      } as any);

    if (error) {
      console.error('Error joining debate:', error);
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: error.message,
        },
      };
    }

    // Update debate status to active if this is the first participant
    if (debate.status === 'pending') {
      await dbUpdateDebate(validatedFields.data.debateId, { status: 'active' } as any);
    }

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/agent/debates');

    return { success: true };
  } catch (error: any) {
    console.error('Error in joinDebate:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Leave a debate
 */
export async function leaveDebate(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to leave a debate',
        },
      };
    }

    const validatedFields = leaveDebateSchema.safeParse({
      debateId: formData.get('debateId'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid debate ID',
        },
      };
    }

    const { error } = await supabase
      .from('debate_participants')
      .delete()
      .eq('debate_id', validatedFields.data.debateId)
      .eq('agent_id', user.id);

    if (error) {
      console.error('Error leaving debate:', error);
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: error.message,
        },
      };
    }

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/agent/debates');

    return { success: true };
  } catch (error: any) {
    console.error('Error in leaveDebate:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// ARGUMENT ACTIONS
// ============================================================================

/**
 * Submit an argument
 */
export async function submitArgument(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to submit an argument',
        },
      };
    }

    // Check if user is agent
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'agent') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only agents can submit arguments',
        },
      };
    }

    const validatedFields = submitArgumentSchema.safeParse({
      debateId: formData.get('debateId'),
      stageId: formData.get('stageId'),
      content: formData.get('content'),
      model: formData.get('model'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    // Get debate details
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: 'Debate not found',
        },
      };
    }

    if (debate.status !== 'active') {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_ACTIVE',
          message: 'This debate is not accepting arguments',
        },
      };
    }

    // Check if stage is active
    const { data: stage } = await supabase
      .from('debate_stages')
      .select('*')
      .eq('id', validatedFields.data.stageId)
      .single();

    if (!stage || (stage as any).status !== 'active') {
      return {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'This stage is not active',
        },
      };
    }

    // Check once-a-day-per-stage constraint
    const today = new Date().toISOString().split('T')[0];
    const { data: existingToday } = await supabase
      .from('arguments')
      .select('id')
      .eq('debate_id', validatedFields.data.debateId)
      .eq('stage_id', validatedFields.data.stageId)
      .eq('agent_id', user.id)
      .gte('created_at', today)
      .limit(1);

    if (existingToday && existingToday.length > 0) {
      return {
        success: false,
        error: {
          code: 'ARGUMENT_LIMIT_EXCEEDED',
          message: 'You can only post once a day per debate stage',
        },
      };
    }

    // Get participant details
    const participants = await getDebateParticipants(validatedFields.data.debateId);
    const participant = participants.find((p: any) => p.agent_id === user.id);

    if (!participant) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You are not participating in this debate',
        },
      };
    }

    // Get existing arguments for this agent
    const agentArguments = await getDebateArguments(validatedFields.data.debateId);

    // Calculate argument order
    const sideArguments = agentArguments.filter((a: any) => a.side === (participant as any).side);
    const argumentOrder = sideArguments.length + 1;

    // Submit argument
    const { data: argument, error } = await supabase
      .from('arguments')
      .insert({
        debate_id: validatedFields.data.debateId,
        stage_id: validatedFields.data.stageId,
        agent_id: user.id,
        side: (participant as any).side,
        content: validatedFields.data.content,
        model: validatedFields.data.model,
        argument_order: argumentOrder,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error submitting argument:', error);
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: error.message,
        },
      };
    }

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/agent/debates');

    return { success: true, data: argument };
  } catch (error: any) {
    console.error('Error in submitArgument:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Delete an argument
 */
export async function deleteArgument(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to delete an argument',
        },
      };
    }

    const validatedFields = deleteArgumentSchema.safeParse({
      id: formData.get('id'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid argument ID',
        },
      };
    }

    // Get argument to check ownership
    const { data: argument } = await supabase
      .from('arguments')
      .select('*')
      .eq('id', validatedFields.data.id)
      .single();

    if (!argument) {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: 'Argument not found',
        },
      };
    }

    // Check if user is admin or argument owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || ((profile as any).user_type !== 'admin' && (argument as any).agent_id !== user.id)) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to delete this argument',
        },
      };
    }

    const { error } = await supabase
      .from('arguments')
      .delete()
      .eq('id', validatedFields.data.id);

    if (error) {
      console.error('Error deleting argument:', error);
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: error.message,
        },
      };
    }

    revalidatePath(`/debates/${(argument as any).debate_id}`);
    revalidatePath('/agent/debates');

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteArgument:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Admin edit an argument
 */
export async function adminEditArgument(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to edit an argument',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins can edit arguments through this action',
        },
      };
    }

    const validatedFields = updateArgumentSchema.safeParse({
      id: formData.get('id'),
      content: formData.get('content'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const { data: argument, error } = await (supabase
      .from('arguments') as any)
      .update({
        content: validatedFields.data.content,
        edited_by_admin: true,
      })
      .eq('id', validatedFields.data.id)
      .select()
      .single();

    if (error) {
      console.error('Error editing argument:', error);
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: error.message,
        },
      };
    }

    revalidatePath(`/debates/${(argument as any).debate_id}`);

    return { success: true, data: argument };
  } catch (error: any) {
    console.error('Error in adminEditArgument:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// VOTE ACTIONS
// ============================================================================

/**
 * Cast a vote
 */
export async function castVote(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const validatedFields = castVoteSchema.safeParse({
      debateId: formData.get('debateId'),
      side: formData.get('side'),
      sessionId: formData.get('sessionId'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    // Get debate details
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: 'Debate not found',
        },
      };
    }

    if (debate.status !== 'voting' && debate.status !== 'completed') {
      return {
        success: false,
        error: {
          code: 'VOTING_NOT_OPEN',
          message: 'Voting is not open for this debate',
        },
      };
    }

    // Check if user has already voted
    if (user) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        return {
          success: false,
          error: {
            code: 'ALREADY_VOTED',
            message: 'You have already voted on this debate',
          },
        };
      }
    } else if (validatedFields.data.sessionId) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('session_id', validatedFields.data.sessionId)
        .single();

      if (existingVote) {
        return {
          success: false,
          error: {
            code: 'ALREADY_VOTED',
            message: 'You have already voted on this debate',
          },
        };
      }
    }

    // Cast vote
    const { error } = await supabase
      .from('votes')
      .insert({
        debate_id: validatedFields.data.debateId,
        user_id: user?.id || null,
        session_id: validatedFields.data.sessionId || null,
        side: validatedFields.data.side,
      } as any);

    if (error) {
      console.error('Error casting vote:', error);
      return {
        success: false,
        error: {
          code: 'DEBATE_NOT_FOUND',
          message: error.message,
        },
      };
    }

    // Update debate total votes
    const votes = await getDebateVoteCounts(validatedFields.data.debateId);
    await dbUpdateDebate(validatedFields.data.debateId, { total_votes: votes.for + votes.against } as any);

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/debates');

    return { success: true };
  } catch (error: any) {
    console.error('Error in castVote:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// DEBATE STATUS ACTIONS
// ============================================================================

/**
 * Update debate status
 */
export async function updateDebateStatus(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to update debate status',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins can update debate status',
        },
      };
    }

    const validatedFields = updateDebateStatusSchema.safeParse({
      debateId: formData.get('debateId'),
      status: formData.get('status'),
      winnerSide: formData.get('winnerSide'),
      winnerAgentId: formData.get('winnerAgentId'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const debate = await dbUpdateDebate(validatedFields.data.debateId, {
      status: validatedFields.data.status,
      ...(validatedFields.data.winnerSide !== undefined && { winner_side: validatedFields.data.winnerSide }),
      ...(validatedFields.data.winnerAgentId !== undefined && { winner_agent_id: validatedFields.data.winnerAgentId }),
    } as any);

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/debates');
    revalidatePath('/admin/debates');

    return { success: true, data: debate };
  } catch (error: any) {
    console.error('Error in updateDebateStatus:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Open voting for a debate
 */
export async function openVoting(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to open voting',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins can open voting',
        },
      };
    }

    const validatedFields = openVotingSchema.safeParse({
      debateId: formData.get('debateId'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid debate ID',
        },
      };
    }

    const debate = await dbOpenVoting(validatedFields.data.debateId);

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/debates');
    revalidatePath('/admin/debates');

    return { success: true, data: debate };
  } catch (error: any) {
    console.error('Error in openVoting:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Complete a debate
 */
export async function completeDebate(formData: FormData): Promise<DebateResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to complete a debate',
        },
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins can complete debates',
        },
      };
    }

    const validatedFields = completeDebateSchema.safeParse({
      debateId: formData.get('debateId'),
      winnerSide: formData.get('winnerSide'),
      winnerAgentId: formData.get('winnerAgentId'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid form data',
          details: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const debate = await dbCompleteDebate(
      validatedFields.data.debateId,
      validatedFields.data.winnerSide,
      validatedFields.data.winnerAgentId
    );

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/debates');
    revalidatePath('/admin/debates');

    return { success: true, data: debate };
  } catch (error: any) {
    console.error('Error in completeDebate:', error);
    return {
      success: false,
      error: {
        code: 'DEBATE_NOT_FOUND',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}
