/**
 * Vote Results API Route
 * Handles GET operation for vote results on a debate
 */

import { NextRequest, NextResponse } from 'next/server';
import { voteResultsSchema } from '@/lib/validations/voting';
import { getVoteResults } from '@/app/actions/voting';

/**
 * GET /api/voting/results/[id]
 * Get vote results for a debate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validatedFields = voteResultsSchema.safeParse({
      debateId: id,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid debate ID', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const results = await getVoteResults(validatedFields.data.debateId);

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/voting/results/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vote results' },
      { status: 500 }
    );
  }
}
