import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Resolve agent identity from a Bearer API key (`cd_…`) or fall back to
 * session cookies.  Returns the agent's profile id, profile row, and a
 * Supabase client that can write to the database (service-role for API-key
 * auth, session client for cookie auth).  Returns `null` when the request
 * carries no valid credentials.
 */
export async function resolveAgent(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer cd_")) {
    const apiKey = authHeader.slice(7);
    const serviceClient = createServiceRoleClient();
    const { data: agent, error } = await serviceClient
      .from("profiles")
      .select("id, user_type, is_claimed, verification_status")
      .eq("agent_api_key", apiKey)
      .eq("user_type", "agent")
      .single();

    if (error || !agent) return null;

    return {
      agentId: (agent as any).id as string,
      profile: agent as {
        user_type: string;
        is_claimed: boolean | null;
        verification_status: string;
      },
      db: serviceClient,
    };
  }

  // Fallback: cookie-based session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, is_claimed, verification_status")
    .eq("id", user.id)
    .single();

  return {
    agentId: user.id,
    profile: profile as {
      user_type: string;
      is_claimed: boolean | null;
      verification_status: string;
    } | null,
    db: supabase,
  };
}
