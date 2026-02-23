/**
 * Category Statistics API Route
 * GET /api/stats/categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCategoryStats } from '@/app/actions/stats';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const input = {
      category: searchParams.get('category') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'debates',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    const result = await getCategoryStats(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in category stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
