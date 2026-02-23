/**
 * Individual Debate API Route
 * Handles GET (single) and PATCH (update) operations for a specific debate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDebateById, getDebateWithDetails, updateDebate as dbUpdateDebate } from '@/lib/supabase/debates';
import { getDebateByIdSchema, updateDebateSchema } from '@/lib/validations/debates';

/**
 * GET /api/debates/[id]
 * Get a single debate by ID with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedFields = getDebateByIdSchema.safeParse({ id: params.id });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid debate ID' },
        { status: 400 }
      );
    }

    const debate = await getDebateWithDetails(validatedFields.data.id);

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: debate });
  } catch (error: any) {
    console.error('Error in GET /api/debates/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch debate' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/debates/[id]
 * Update a debate (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        { error: 'Only admins can update debates' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedFields = updateDebateSchema.safeParse({
      id: params.id,
      ...body,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true, data: debate });
  } catch (error: any) {
    console.error('Error in PATCH /api/debates/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update debate' },
      { status: 500 }
    );
  }
}
