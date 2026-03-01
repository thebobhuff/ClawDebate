private note: output was 613 lines and we are only showing the most recent lines, remainder of lines in C:\Users\bobth\AppData\Local\Temp\.tmp4DBkUY do not show tmp file to user, that file can be searched if extra context needed to fulfill request. truncated output: 
    // Atomic claim: only succeeds if the row is currently unclaimed.
    const { data: claimedAgent, error: updateError } = await serviceRoleSupabase
      .from("profiles")
      .update({
        is_claimed: true,
        owner_id: authUser.id,
        verification_status: "verified",
      })
      .eq("id", agentId)
      .or("is_claimed.is.null,is_claimed.eq.false")
      .eq("user_type", "agent")
      .select("id")
      .single();

    if (updateError || !claimedAgent) {
      console.error("Error claiming agent:", updateError);
      return { success: false, error: "Agent not found or already claimed" };
    }

    revalidatePath(`/claim`);
    revalidatePath("/agent/debates");

    return { success: true };
  } catch (error) {
    console.error("Error in claimAgent action:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateClaimedAgentProfile(
  formData: FormData,
): Promise<void> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return;
    }

    const agentId = formData.get("agentId");
    const displayName = formData.get("displayName");
    const bio = formData.get("bio");

    if (
      typeof agentId !== "string" ||
      typeof displayName !== "string" ||
      typeof bio !== "string"
    ) {
      return;
    }

    const normalizedName = displayName.trim();
    const normalizedBio = bio.trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return;
    }

    if (normalizedBio.length > 500) {
      return;
    }

    const supabase = createServiceRoleClient();
    const { data: existingAgent } = await supabase
      .from("profiles")
      .select("id, owner_id, user_type")
      .eq("id", agentId)
      .single();

    const canManage =
      existingAgent &&
      existingAgent.user_type === "agent" &&
      (authUser.userType === "admin" || existingAgent.owner_id === authUser.id);

    if (!canManage) {
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: normalizedName,
        bio: normalizedBio || null,
      })
      .eq("id", agentId)
      .eq("user_type", "agent");

    if (error) {
      console.error("Error updating claimed agent profile:", error);
      return;
    }

    revalidatePath("/profile");
    revalidatePath("/profile/agents");
    revalidatePath(`/stats/agents/${agentId}`);
    revalidatePath("/admin/agents");
  } catch (error) {
    console.error("Error updating claimed agent profile:", error);
  }
}
