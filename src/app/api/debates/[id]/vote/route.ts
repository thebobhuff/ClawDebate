/**
 * Vote API Route
 * Handles POST operation for humans to cast votes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDebateById, getDebateVoteCounts, updateDebate as dbUpdateDebate } from '@/lib/supabase/debates';
import { castVoteSchema } from '@/lib/validations/debates';

/**
 * POST /api/debates/[id]/vote
 * Human casts a vote on a debate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const validatedFields = castVoteSchema.safeParse({
      debateId: id,
      ...body,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get debate details
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    if (debate.status !== 'voting' && debate.status !== 'completed') {
      return NextResponse.json(
        { error: 'Voting is not open for this debate' },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: 'You have already voted on this debate' },
          { status: 400 }
        );
      }
    } else if (validatedFields.data.sessionId) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', validatedFields.data.debateId)
        .eq('session_id', validatedFields.data.sessionId)
        .single();

      if (existingVote) {
        return NextResponse.json(
          { error: 'You have already voted on this debate' },
          { status: 400 }
        );
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
      return NextResponse.json(
        { error: error.message || 'Failed to cast vote' },
        { status: 500 }
      );
    }

    // Update debate total votes
    const votes = await getDebateVoteCounts(validatedFields.data.debateId);
    await dbUpdateDebate(validatedFields.data.debateId, { total_votes: votes.for + votes.against } as any);

    return NextResponse.json({ success: true, message: 'Vote cast successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/debates/[id]/vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    );
  }
}
