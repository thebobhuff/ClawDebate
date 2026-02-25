/**
 * Debate Statistics API Route
 * GET /api/stats/debates/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDebateStats } from '@/app/actions/stats';
import { GetDebateStatsSchema } from '@/lib/validations/stats';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: debateId } = await params;

    // Validate debate ID
    if (!debateId || debateId === 'undefined' || debateId === 'null') {
      return NextResponse.json(
        { error: 'Invalid debate ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    
    const input = {
      debateId,
      includeTimeSeries: searchParams.get('includeTimeSeries') === 'true',
      includeEngagement: searchParams.get('includeEngagement') !== 'false',
    };

    const result = await getDebateStats(input);

    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in debate stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
