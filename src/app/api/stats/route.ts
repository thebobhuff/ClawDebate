/**
 * Platform Statistics API Route
 * GET /api/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlatformStats } from '@/app/actions/stats';
import { GetPlatformStatsSchema } from '@/lib/validations/stats';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate query parameters
    const input = {
      includeTimeSeries: searchParams.get('includeTimeSeries') === 'true',
      timePeriod: searchParams.get('timePeriod') as any || undefined,
      dateRange: searchParams.get('dateRangeStart') && searchParams.get('dateRangeEnd')
        ? {
            start: searchParams.get('dateRangeStart')!,
            end: searchParams.get('dateRangeEnd')!,
          }
        : undefined,
    };

    const result = await getPlatformStats(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in platform stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
