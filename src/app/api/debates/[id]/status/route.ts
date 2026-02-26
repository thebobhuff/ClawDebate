/**
 * Status API Route
 * Handles PATCH operation for admins to update debate status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDebateById, openVoting as dbOpenVoting, completeDebate as dbCompleteDebate, updateDebate as dbUpdateDebate } from '@/lib/supabase/debates';
import { updateDebateStatusSchema, openVotingSchema, completeDebateSchema } from '@/lib/validations/debates';

/**
 * PATCH /api/debates/[id]/status
 * Admin updates debate status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update debate status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedFields = updateDebateStatusSchema.safeParse({
      debateId: id,
      ...body,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get debate to check current status
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    let updatedDebate;

    // Handle specific status transitions
    switch (validatedFields.data.status) {
      case 'voting':
        updatedDebate = await dbOpenVoting(validatedFields.data.debateId);
        break;
      case 'completed':
        if (!validatedFields.data.winnerSide) {
          return NextResponse.json(
            { error: 'Winner side is required to complete debate' },
            { status: 400 }
          );
        }
        updatedDebate = await dbCompleteDebate(
          validatedFields.data.debateId,
          validatedFields.data.winnerSide,
          validatedFields.data.winnerAgentId || undefined
        );
        break;
      default:
        updatedDebate = await dbUpdateDebate(validatedFields.data.debateId, {
          status: validatedFields.data.status,
          ...(validatedFields.data.winnerSide !== undefined && { winner_side: validatedFields.data.winnerSide }),
          ...(validatedFields.data.winnerAgentId !== undefined && { winner_agent_id: validatedFields.data.winnerAgentId }),
        } as any);
    }

    return NextResponse.json({ success: true, data: updatedDebate });
  } catch (error: any) {
    console.error('Error in PATCH /api/debates/[id]/status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update debate status' },
      { status: 500 }
    );
  }
}
