/**
 * Join Debate API Route
 * Handles POST operation for an agent to join a debate
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveAgent } from "@/lib/auth/resolve-agent";
import {
  getDebateById,
  getDebateParticipants,
  updateDebate as dbUpdateDebate,
} from "@/lib/supabase/debates";
import { joinDebateSchema } from "@/lib/validations/debates";

/**
 * POST /api/debates/[id]/join
 * Agent joins a debate with a specified side
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const resolved = await resolveAgent(request);

    if (!resolved) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { agentId, profile, db } = resolved;

    if (!profile || (profile as any).user_type !== "agent") {
      return NextResponse.json(
        { error: "Only agents can join debates" },
        { status: 403 },
      );
    }

    if ((profile as any).verification_status === "flagged") {
      return NextResponse.json(
        { error: "This agent is banned from participating" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedFields = joinDebateSchema.safeParse({
      debateId: id,
      ...body,
    });

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Check if debate exists and is accepting participants
    const debate = await getDebateById(validatedFields.data.debateId);

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (debate.status !== "pending" && debate.status !== "active") {
      return NextResponse.json(
        { error: "This debate is not accepting new participants" },
        { status: 400 },
      );
    }

    // Check if user is already participating
    const participants = await getDebateParticipants(
      validatedFields.data.debateId,
    );
    const existingParticipant = participants.find(
      (p: any) => p.agent_id === agentId,
    );

    if (existingParticipant) {
      return NextResponse.json(
        { error: "You are already participating in this debate" },
        { status: 400 },
      );
    }

    // Check if side is full
    const sideParticipants = participants.filter(
      (p: any) => p.side === validatedFields.data.side,
    );

    if (sideParticipants.length >= 1) {
      return NextResponse.json(
        { error: "This side is already full" },
        { status: 400 },
      );
    }

    // Join debate — use the resolved db client (service-role for API key,
    // session client for cookie auth) so the insert succeeds regardless of
    // which auth method was used.
    const { error } = await db.from("debate_participants").insert({
      debate_id: validatedFields.data.debateId,
      agent_id: agentId,
      side: validatedFields.data.side,
    } as any);

    if (error) {
      console.error("Error joining debate:", error);
      return NextResponse.json(
        { error: error.message || "Failed to join debate" },
        { status: 500 },
      );
    }

    // Update debate status to active if this is the first participant
    if (debate.status === "pending") {
      await dbUpdateDebate(validatedFields.data.debateId, {
        status: "active",
      } as any);
    }

    return NextResponse.json(
      { success: true, message: "Successfully joined debate" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/debates/[id]/join:", error);
    return NextResponse.json(
      { error: error.message || "Failed to join debate" },
      { status: 500 },
    );
  }
}
