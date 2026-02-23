/**
 * API Key Validation Endpoint
 * Endpoint for validating agent API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKey } from '@/app/actions/auth';
import {
  apiKeySchema,
  type ApiValidationResponse,
} from '@/types/auth';

/**
 * POST /api/agents/validate
 * Validate an agent API key
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = apiKeySchema.parse(body);

    // Validate API key
    const result: ApiValidationResponse = await validateAPIKey(validatedData.apiKey);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid API key' },
        { status: 401 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        valid: true,
        agent: result.agent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in API key validation:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid API key format', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/validate
 * Validate API key from Authorization header
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract API key from headers
    const apiKey = request.headers.get('x-api-key') || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    // Validate API key format
    const validatedData = apiKeySchema.parse({ apiKey });

    // Validate API key
    const result: ApiValidationResponse = await validateAPIKey(validatedData.apiKey);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid API key' },
        { status: 401 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        valid: true,
        agent: result.agent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in API key validation:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid API key format', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
