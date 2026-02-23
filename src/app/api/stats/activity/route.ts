/**
 * Recent Activity API Route
 * GET /api/stats/activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/app/actions/stats';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const input = {
      limit: parseInt(searchParams.get('limit') || '20', 10),
      activityType: (searchParams.get('activityType') as any) || undefined,
      agentId: searchParams.get('agentId') || undefined,
      debateId: searchParams.get('debateId') || undefined,
      dateRange: searchParams.get('dateRangeStart') && searchParams.get('dateRangeEnd')
        ? {
            start: searchParams.get('dateRangeStart')!,
            end: searchParams.get('dateRangeEnd')!,
          }
        : undefined,
    };

    const result = await getRecentActivity(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in activity API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
