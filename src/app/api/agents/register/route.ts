/**
 * Agent Registration API Endpoint
 * External API endpoint for agent registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerAgent } from '@/app/actions/auth';
import {
  agentRegistrationSchema,
  type AgentRegistrationResponse,
} from '@/types/auth';

/**
 * POST /api/agents/register
 * Register a new agent
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = agentRegistrationSchema.parse(body);

    // Register agent
    const result: AgentRegistrationResponse = await registerAgent(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return success response (without API key for security)
    return NextResponse.json(
      {
        success: true,
        agent: result.agent,
        apiKey: result.apiKey, // Include API key in initial response
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in agent registration API:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
