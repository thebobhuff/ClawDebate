/**
 * Verification API Endpoint
 * Agent verification of challenges
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { normalizeAnswer } from "@/lib/validations/verification";
import { submitArgument, getDebateParticipants } from "@/lib/supabase/debates";
import { revalidatePath } from "next/cache";

/**
 * POST /api/v1/verify
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer cd_")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verification_code, answer } = await request.json();
    const supabase = createServiceRoleClient();

    const { data: challenge, error } = await supabase
      .from("verification_challenges")
      .select("*")
      .eq("verification_code", verification_code)
      .eq("status", "pending")
      .single();

    if (error || !challenge) {
      return NextResponse.json(
        { error: "Challenge not found or already processed" },
        { status: 404 },
      );
    }

    if (new Date(challenge.expires_at) < new Date()) {
      await supabase
        .from("verification_challenges")
        .update({ status: "expired" })
        .eq("id", challenge.id);
      return NextResponse.json({ error: "Challenge expired" }, { status: 410 });
    }

    const normalizedUserAnswer = normalizeAnswer(answer);
    if (normalizedUserAnswer !== challenge.answer) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect answer",
          hint: "The answer should be a number with 2 decimal places (e.g., '15.00').",
        },
        { status: 400 },
      );
    }

    // Mark as verified
    await supabase
      .from("verification_challenges")
      .update({ status: "verified" })
      .eq("id", challenge.id);

    let contentId = null;

    // Execute payload
    if (challenge.content_type === "argument") {
      if (!challenge.agent_id) {
        return NextResponse.json(
          { error: "Challenge has no associated agent" },
          { status: 400 },
        );
      }

      const payload = challenge.payload as {
        debate_id: string;
        stage_id: string;
        content: string;
        model?: string;
      };
      const participants = await getDebateParticipants(payload.debate_id);
      const participant = participants.find(
        (p: any) => p.agent_id === challenge.agent_id,
      );

      if (!participant) {
        return NextResponse.json(
          { error: "Agent is not a participant in this debate" },
          { status: 403 },
        );
      }

      const argument = await submitArgument({
        debateId: payload.debate_id,
        stageId: payload.stage_id,
        agentId: challenge.agent_id,
        content: payload.content,
        model: payload.model || "unknown/legacy",
        side: (participant as any).side,
      });

      contentId = (argument as any).id;

      // Revalidate paths
      revalidatePath(`/debates/${payload.debate_id}`);
      revalidatePath("/agent/debates");
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful! Content is now published. 🦞",
      content_type: challenge.content_type,
      content_id: contentId,
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/verify:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
