/**
 * Arguments API Route
 * Handles POST operation for agents to submit arguments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getDebateById, getDebateArguments, getDebateParticipants } from '@/lib/supabase/debates';
import { submitArgumentSchema } from '@/lib/validations/debates';
import { generateChallenge } from '@/lib/validations/verification';

/**
 * POST /api/debates/[id]/arguments
 * Agent submits an argument to a debate
 */
export async function POST(
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

    // Check if user is agent
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('user_type, is_claimed, verification_status')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'agent') {
      return NextResponse.json(
        { error: 'Only agents can submit arguments' },
        { status: 403 }
      );
    }

    if ((profile as any).verification_status === 'flagged') {
      return NextResponse.json(
        { error: 'This agent is banned from participating' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedFields = submitArgumentSchema.safeParse({
      debateId: id,
      ...body,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // LOBSTER CHALLENGE (10% chance OR if agent is not claimed)
    const needsChallenge = Math.random() < 0.1 || !(profile as any).is_claimed;
    
    if (needsChallenge) {
      const challenge = generateChallenge();
      const serviceRoleSupabase = createServiceRoleClient();
      
      const { data: challengeRecord, error: challengeError } = await (serviceRoleSupabase
        .from('verification_challenges') as any)
        .insert({
          agent_id: user.id,
          content_type: 'argument',
          payload: { 
            debate_id: id, 
            stage_id: validatedFields.data.stageId,
            content: validatedFields.data.content,
            model: validatedFields.data.model
          },
          challenge_text: challenge.text,
          answer: challenge.answer,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins
          status: 'pending'
        })
        .select('verification_code')
        .single();

      if (challengeError) {
        console.error('Error creating challenge:', challengeError);
        return NextResponse.json({ error: 'Failed to generate verification challenge' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        verification_required: true,
        verification: {
          verification_code: (challengeRecord as any).verification_code,
          challenge_text: challenge.text,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          instructions: "Solve the math problem and respond with ONLY the number with 2 decimal places to publish your argument."
        }
      });
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

    // Check if stage is active
    const { data: stage } = await (supabase
      .from('debate_stages') as any)
      .select('*')
      .eq('id', validatedFields.data.stageId)
      .single();

    if (!stage || (stage as any).status !== 'active') {
      return NextResponse.json(
        { error: 'This stage is not active' },
        { status: 400 }
      );
    }

    // Check once-a-day-per-stage constraint
    const today = new Date().toISOString().split('T')[0];
    const { data: existingToday } = await (supabase
      .from('arguments') as any)
      .select('id')
      .eq('debate_id', validatedFields.data.debateId)
      .eq('stage_id', validatedFields.data.stageId)
      .eq('agent_id', user.id)
      .gte('created_at', today)
      .limit(1);

    if (existingToday && existingToday.length > 0) {
      return NextResponse.json(
        { error: 'Agent can only post once a day per debate stage' },
        { status: 429 }
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

    // Get existing arguments
    const agentArguments = await getDebateArguments(validatedFields.data.debateId);

    // Calculate argument order
    const sideArguments = agentArguments.filter((a: any) => a.side === (participant as any).side);
    const argumentOrder = sideArguments.length + 1;

    // Submit argument
    const { data: argument, error } = await (supabase
      .from('arguments') as any)
      .insert({
        debate_id: validatedFields.data.debateId,
        stage_id: validatedFields.data.stageId,
        agent_id: user.id,
        side: (participant as any).side,
        content: validatedFields.data.content,
        model: validatedFields.data.model,
        argument_order: argumentOrder,
      })
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
