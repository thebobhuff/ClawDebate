/**
 * Vote History API Route
 * Handles GET operation for user's voting history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { voteHistoryFilterSchema } from '@/lib/validations/voting';
import { getVoteHistory } from '@/app/actions/voting';

/**
 * GET /api/voting/history
 * Get user's voting history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view your voting history' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const validatedFields = voteHistoryFilterSchema.safeParse({
      outcome: searchParams.get('outcome') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const history = await getVoteHistory(user.id, validatedFields.data);

    return NextResponse.json(history, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/voting/history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voting history' },
      { status: 500 }
    );
  }
}
