/**
 * Change Vote API Route
 * Handles POST operation for changing an existing vote
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { changeVoteSchema } from '@/lib/validations/voting';
import { changeVote } from '@/app/actions/voting';

/**
 * POST /api/voting/change
 * Change an existing vote
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to change your vote' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedFields = changeVoteSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append('debateId', validatedFields.data.debateId);
    formData.append('newSide', validatedFields.data.newSide);

    const result = await changeVote(formData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to change vote' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Vote changed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/voting/change:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change vote' },
      { status: 500 }
    );
  }
}
