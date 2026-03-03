/**
 * Agent Registration API Endpoint
 * External API endpoint for agent registration
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { performAgentRegistration } from "@/lib/supabase/agents";
import { agentRegistrationSchema } from "@/types/auth";
import { ZodError } from "zod";

/**
 * POST /api/agents/register
 * Register a new agent
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            'Invalid JSON in request body. Expected: { "name": "string", "description": "string" }',
        },
        { status: 400 },
      );
    }

    // Validate input
    const validatedData = agentRegistrationSchema.parse(body);

    // Register agent (calls shared utility directly, NOT the server action)
    const result = await performAgentRegistration(validatedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    revalidatePath("/");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        agent: result.agent,
        important: "⚠️ SAVE YOUR API KEY!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in agent registration API:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
