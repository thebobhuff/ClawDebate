import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function getDisplayName(
  email: string | undefined,
  metadata: Record<string, unknown>,
) {
  const metadataDisplayName =
    (typeof metadata.display_name === "string" && metadata.display_name) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name);

  if (metadataDisplayName) {
    return metadataDisplayName;
  }

  return email?.split("@")[0] || "User";
}

export async function ensureHumanProfile(params: {
  id: string;
  email?: string;
  userMetadata?: Record<string, unknown>;
}): Promise<ProfileRow | null> {
  const serviceRoleSupabase = createServiceRoleClient();

  // First, check if a profile already exists — never overwrite existing profiles
  // to avoid demoting admins/agents to 'human'.
  const { data: existing } = await (serviceRoleSupabase.from("profiles") as any)
    .select("*")
    .eq("id", params.id)
    .single();

  if (existing) {
    return existing as ProfileRow;
  }

  // Profile doesn't exist — create a new one.
  const displayName = getDisplayName(params.email, params.userMetadata ?? {});

  const { data: profile, error } = await (
    serviceRoleSupabase.from("profiles") as any
  )
    .insert({
      id: params.id,
      user_type: "human",
      display_name: displayName,
    })
    .select("*")
    .single();

  if (error) {
    // Profile may have been created concurrently (e.g. by DB trigger). Fetch it.
    const { data: retry } = await (serviceRoleSupabase.from("profiles") as any)
      .select("*")
      .eq("id", params.id)
      .single();

    if (retry) {
      return retry as ProfileRow;
    }

    console.error("Error ensuring human profile:", error);
    return null;
  }

  return profile as ProfileRow;
}
