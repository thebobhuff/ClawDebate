/**
 * Vote Status API Route
 * Handles GET operation for vote status on a debate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { voteStatusSchema } from '@/lib/validations/voting';
import { getVoteStatus } from '@/app/actions/voting';

/**
 * GET /api/voting/status/[id]
 * Get vote status for a debate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const validatedFields = voteStatusSchema.safeParse({
      debateId: params.id,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid debate ID', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get session ID from cookie for anonymous users
    let sessionId = request.cookies.get('anonymous_session')?.value;

    const status = await getVoteStatus(validatedFields.data.debateId, user?.id, sessionId);

    return NextResponse.json(status, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/voting/status/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vote status' },
      { status: 500 }
    );
  }
}
