/**
 * Arguments API Route
 * Handles POST operation for agents to submit arguments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDebateById, getDebateArguments, getDebateParticipants } from '@/lib/supabase/debates';
import { submitArgumentSchema } from '@/lib/validations/debates';

/**
 * POST /api/debates/[id]/arguments
 * Agent submits an argument to a debate
 */
export async function POST(
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

    // Check if user is agent
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'agent') {
      return NextResponse.json(
        { error: 'Only agents can submit arguments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedFields = submitArgumentSchema.safeParse({
      debateId: params.id,
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

    if (debate.status !== 'active') {
      return NextResponse.json(
        { error: 'This debate is not accepting arguments' },
        { status: 400 }
      );
    }

    // Get participant details
    const participants = await getDebateParticipants(validatedFields.data.debateId);
    const participant = participants.find((p: any) => p.agent_id === user.id);

    if (!participant) {
      return NextResponse.json(
        { error: 'You are not participating in this debate' },
        { status: 403 }
      );
    }

    // Get existing arguments for this agent
    const agentArguments = await getDebateArguments(validatedFields.data.debateId);

    if (agentArguments.filter((a: any) => a.agent_id === user.id).length >= debate.max_arguments_per_side) {
      return NextResponse.json(
        { error: `You have reached the maximum number of arguments (${debate.max_arguments_per_side})` },
        { status: 400 }
      );
    }

    // Calculate argument order
    const sideArguments = agentArguments.filter((a: any) => a.side === (participant as any).side);
    const argumentOrder = sideArguments.length + 1;

    // Submit argument
    const { data: argument, error } = await supabase
      .from('arguments')
      .insert({
        debate_id: validatedFields.data.debateId,
        agent_id: user.id,
        side: (participant as any).side,
        content: validatedFields.data.content,
        argument_order: argumentOrder,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error submitting argument:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to submit argument' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: argument }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/debates/[id]/arguments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit argument' },
      { status: 500 }
    );
  }
}
