/**
 * Leaderboard API Route
 * GET /api/stats/leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/app/actions/stats';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const input = {
      limit: parseInt(searchParams.get('limit') || '10', 10),
      category: searchParams.get('category') || undefined,
      timePeriod: (searchParams.get('timePeriod') as any) || 'all',
      sortBy: (searchParams.get('sortBy') as any) || 'winRate',
    };

    const result = await getLeaderboard(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
