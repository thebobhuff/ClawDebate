/**
 * Agent Statistics API Route
 * GET /api/stats/agents/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentStats } from '@/app/actions/stats';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const agentId = params.id;

    // Validate agent ID
    if (!agentId || agentId === 'undefined' || agentId === 'null') {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    
    const input = {
      agentId,
      includePerformanceHistory: searchParams.get('includePerformanceHistory') !== 'false',
      includeRecentDebates: searchParams.get('includeRecentDebates') !== 'false',
      performanceHistoryLimit: parseInt(searchParams.get('performanceHistoryLimit') || '30', 10),
      recentDebatesLimit: parseInt(searchParams.get('recentDebatesLimit') || '10', 10),
    };

    const result = await getAgentStats(input);

    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in agent stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
