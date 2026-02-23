/**
 * Voting Server Actions
 * Server-side actions for voting operations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  getDebateById,
  getDebateVoteCounts,
  updateDebate as dbUpdateDebate,
} from '@/lib/supabase/debates';
import {
  castVoteSchema,
  changeVoteSchema,
  voteHistoryFilterSchema,
  voteStatusSchema,
  voteResultsSchema,
  canVoteSchema,
} from '@/lib/validations/voting';
import {
  isVotingOpen,
  calculateVoteResults,
  getVoteOutcome,
  getDefaultVotingRestrictions,
} from '@/lib/voting';
import type {
  VoteResponse,
  VoteHistoryResponse,
  VoteStatus,
  VoteResults,
  VotingEligibility,
} from '@/types/voting';

// ============================================================================
// VOTE ACTIONS
// ============================================================================

/**
 * Cast a vote on a debate
 */
export async function castVote(formData: FormData): Promise<VoteResponse> {
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

    // Check if voting is open
    if (!isVotingOpen(debate)) {
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
    revalidatePath('/voting');
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

/**
 * Change an existing vote
 */
export async function changeVote(formData: FormData): Promise<VoteResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You must be logged in to change your vote',
        },
      };
    }

    const validatedFields = changeVoteSchema.safeParse({
      debateId: formData.get('debateId'),
      newSide: formData.get('newSide'),
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

    // Check if voting is open
    if (!isVotingOpen(debate)) {
      return {
        success: false,
        error: {
          code: 'VOTING_NOT_OPEN',
          message: 'Voting is not open for this debate',
        },
      };
    }

    // Check if user has voted
    const { data: existingVote, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .eq('debate_id', validatedFields.data.debateId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingVote) {
      return {
        success: false,
        error: {
          code: 'VOTE_NOT_FOUND',
          message: 'You have not voted on this debate',
        },
      };
    }

    // Check if new side is the same as current
    if ((existingVote as any).side === validatedFields.data.newSide) {
      return {
        success: false,
        error: {
          code: 'CANNOT_CHANGE_VOTE',
          message: 'You have already voted for this side',
        },
      };
    }

    // Update vote
    const { error: updateError } = await supabase
      .from('votes')
      .update({ side: validatedFields.data.newSide } as any)
      .eq('id', (existingVote as any).id);

    if (updateError) {
      console.error('Error changing vote:', updateError);
      return {
        success: false,
        error: {
          code: 'CANNOT_CHANGE_VOTE',
          message: updateError.message,
        },
      };
    }

    revalidatePath(`/debates/${validatedFields.data.debateId}`);
    revalidatePath('/voting');
    revalidatePath('/debates');

    return { success: true };
  } catch (error: any) {
    console.error('Error in changeVote:', error);
    return {
      success: false,
      error: {
        code: 'CANNOT_CHANGE_VOTE',
        message: error.message || 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// VOTE HISTORY ACTIONS
// ============================================================================

/**
 * Get user's voting history
 */
export async function getVoteHistory(
  userId: string,
  filters: {
    outcome?: 'won' | 'lost' | 'all';
    status?: 'voting' | 'completed' | 'all';
    page?: number;
    limit?: number;
    sortBy?: 'voted_at' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<VoteHistoryResponse> {
  try {
    const validatedFields = voteHistoryFilterSchema.safeParse(filters);

    if (!validatedFields.success) {
      return {
        votes: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        stats: {
          totalVotes: 0,
          won: 0,
          lost: 0,
          pending: 0,
          winRate: 0,
        },
      };
    }

    const {
      outcome = 'all',
      status = 'all',
      page = 1,
      limit = 20,
      sortBy = 'voted_at',
      sortOrder = 'desc',
    } = validatedFields.data;

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('votes')
      .select(`
        *,
        debates!inner (
          id,
          title,
          description,
          status,
          winner_side
        )
      `)
      .eq('user_id', userId);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('debates.status', status);
    }

    // Apply sorting
    const column = sortBy === 'title' ? 'debates.title' : 'voted_at';
    query = query.order(column, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: votes, error, count } = await query;

    if (error) {
      console.error('Error fetching vote history:', error);
      return {
        votes: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        stats: {
          totalVotes: 0,
          won: 0,
          lost: 0,
          pending: 0,
          winRate: 0,
        },
      };
    }

    // Get vote counts for each debate
    const debateIds = votes?.map((v: any) => v.debate_id) || [];
    const { data: voteCounts } = await supabase
      .from('votes')
      .select('debate_id, side')
      .in('debate_id', debateIds);

    // Build vote count map
    const voteCountMap = new Map<string, { for: number; against: number }>();
    voteCounts?.forEach((vc: any) => {
      const current = voteCountMap.get(vc.debate_id) || { for: 0, against: 0 };
      if (vc.side === 'for') {
        current.for += 1;
      } else {
        current.against += 1;
      }
      voteCountMap.set(vc.debate_id, current);
    });

    // Transform and filter votes
    const transformedVotes = votes
      ?.map((vote: any) => {
        const counts = voteCountMap.get(vote.debate_id) || { for: 0, against: 0 };
        const outcome = getVoteOutcome(vote, vote.debates);

        return {
          id: vote.id,
          debateId: vote.debate_id,
          debateTitle: vote.debates.title,
          debateDescription: vote.debates.description,
          debateStatus: vote.debates.status,
          side: vote.side,
          votedAt: vote.voted_at,
          outcome,
          winnerSide: vote.debates.winner_side,
          forVotes: counts.for,
          againstVotes: counts.against,
          totalVotes: counts.for + counts.against,
          canChange: vote.debates.status === 'voting',
        };
      })
      .filter((vote: any) => {
        if (outcome === 'all') return true;
        return vote.outcome === outcome;
      }) || [];

    // Calculate stats
    const totalVotes = votes?.length || 0;
    const won = transformedVotes.filter((v: any) => v.outcome === 'won').length;
    const lost = transformedVotes.filter((v: any) => v.outcome === 'lost').length;
    const pending = transformedVotes.filter((v: any) => v.outcome === 'pending').length;
    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    return {
      votes: transformedVotes,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > to + 1,
      stats: {
        totalVotes,
        won,
        lost,
        pending,
        winRate,
      },
    };
  } catch (error: any) {
    console.error('Error in getVoteHistory:', error);
    return {
      votes: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
      stats: {
        totalVotes: 0,
        won: 0,
        lost: 0,
        pending: 0,
        winRate: 0,
      },
    };
  }
}

// ============================================================================
// VOTE STATUS ACTIONS
// ============================================================================

/**
 * Get vote status for a debate and user
 */
export async function getVoteStatus(
  debateId: string,
  userId?: string,
  sessionId?: string
): Promise<VoteStatus> {
  try {
    const validatedFields = voteStatusSchema.safeParse({ debateId });

    if (!validatedFields.success) {
      return {
        hasVoted: false,
        canVote: false,
        canChangeVote: false,
        votingOpen: false,
      };
    }

    const supabase = await createClient();

    // Get debate details
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return {
        hasVoted: false,
        canVote: false,
        canChangeVote: false,
        votingOpen: false,
      };
    }

    // Check if user has voted
    let userVote = null;
    if (userId) {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('user_id', userId)
        .single();

      userVote = data;
    } else if (sessionId) {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('session_id', sessionId)
        .single();

      userVote = data;
    }

    const restrictions = getDefaultVotingRestrictions();
    const votingOpen = isVotingOpen(debate);
    const hasVoted = !!userVote;

    return {
      hasVoted,
      votedSide: (userVote as any)?.side,
      votedAt: (userVote as any)?.voted_at,
      canVote: votingOpen && (!hasVoted || restrictions.allowVoteChange),
      canChangeVote: votingOpen && hasVoted && restrictions.allowVoteChange,
      votingOpen,
      votingDeadline: debate.voting_deadline || undefined,
      timeRemaining: isVotingOpen(debate) ? Date.now() - (debate.voting_deadline ? new Date(debate.voting_deadline).getTime() : Date.now()) : undefined,
    };
  } catch (error: any) {
    console.error('Error in getVoteStatus:', error);
    return {
      hasVoted: false,
      canVote: false,
      canChangeVote: false,
      votingOpen: false,
    };
  }
}

/**
 * Check if user can vote on a debate
 */
export async function canVote(
  debateId: string,
  userId?: string,
  sessionId?: string
): Promise<VotingEligibility> {
  try {
    const validatedFields = canVoteSchema.safeParse({ debateId, sessionId });

    if (!validatedFields.success) {
      return {
        canVote: false,
        reason: 'Invalid debate ID',
        restrictions: getDefaultVotingRestrictions(),
        userVoteCount: 0,
        sessionVoteCount: 0,
      };
    }

    const supabase = await createClient();

    // Get debate details
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return {
        canVote: false,
        reason: 'Debate not found',
        restrictions: getDefaultVotingRestrictions(),
        userVoteCount: 0,
        sessionVoteCount: 0,
      };
    }

    const restrictions = getDefaultVotingRestrictions();

    // Check if user has voted
    let userVote = null;
    if (userId) {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('user_id', userId)
        .single();

      userVote = data;
    } else if (sessionId) {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('session_id', sessionId)
        .single();

      userVote = data;
    }

    // Check if voting is open
    if (!isVotingOpen(debate)) {
      return {
        canVote: false,
        reason: 'Voting is not open for this debate',
        restrictions,
        userVoteCount: userVote ? 1 : 0,
        sessionVoteCount: 0,
      };
    }

    // Check if user has already voted
    if (userVote && !restrictions.allowVoteChange) {
      return {
        canVote: false,
        reason: 'You have already voted on this debate',
        restrictions,
        userVoteCount: 1,
        sessionVoteCount: 0,
      };
    }

    return {
      canVote: true,
      restrictions,
      userVoteCount: userVote ? 1 : 0,
      sessionVoteCount: 0,
    };
  } catch (error: any) {
    console.error('Error in canVote:', error);
    return {
      canVote: false,
      reason: error.message || 'An error occurred',
      restrictions: getDefaultVotingRestrictions(),
      userVoteCount: 0,
      sessionVoteCount: 0,
    };
  }
}

// ============================================================================
// VOTE RESULTS ACTIONS
// ============================================================================

/**
 * Get vote results for a debate
 */
export async function getVoteResults(debateId: string): Promise<VoteResults> {
  try {
    const validatedFields = voteResultsSchema.safeParse({ debateId });

    if (!validatedFields.success) {
      return {
        forVotes: 0,
        againstVotes: 0,
        totalVotes: 0,
        forPercentage: 0,
        againstPercentage: 0,
        margin: 0,
      };
    }

    const votes = await getDebateVoteCounts(validatedFields.data.debateId);

    return calculateVoteResults(votes.for, votes.against);
  } catch (error: any) {
    console.error('Error in getVoteResults:', error);
    return {
      forVotes: 0,
      againstVotes: 0,
      totalVotes: 0,
        forPercentage: 0,
        againstPercentage: 0,
        margin: 0,
      };
  }
}
