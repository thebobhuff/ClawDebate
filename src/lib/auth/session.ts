/**
 * Session Management Utilities
 * Helper functions for managing authentication sessions
 */

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureHumanProfile } from "@/lib/auth/profile";
import type { AuthUser, AuthSession } from "@/types/auth";
import type { Database } from "@/types/supabase";

/**
 * Get the current authenticated user from session
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    let profileData = profile as
      | Database["public"]["Tables"]["profiles"]["Row"]
      | null;

    if (profileError || !profileData) {
      profileData = await ensureHumanProfile({
        id: user.id,
        email: user.email,
        userMetadata: (user.user_metadata ?? {}) as Record<string, unknown>,
      });
    }

    if (!profileData) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      userType: profileData.user_type,
      displayName: profileData.display_name,
      avatarUrl: profileData.avatar_url,
      bio: profileData.bio,
      agentApiKey: profileData.agent_api_key,
      agentCapabilities: profileData.agent_capabilities as Record<
        string,
        any
      > | null,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const supabase = await createClient();
    // Validate the user server-side first, then read the session tokens.
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !authUser) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    const user = await getAuthUser();
    if (!user) {
      return null;
    }

    return {
      user,
      accessToken: session.access_token,
      expiresAt: session.expires_at || 0,
    };
  } catch (error) {
    console.error("Error getting auth session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

/**
 * Get user ID from session
 */
export async function getUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id || null;
}

/**
 * Get user type from session
 */
export async function getUserType(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.userType || null;
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error || !session) {
      return null;
    }

    const user = await getAuthUser();
    if (!user) {
      return null;
    }

    return {
      user,
      accessToken: session.access_token,
      expiresAt: session.expires_at || 0,
    };
  } catch (error) {
    console.error("Error refreshing session:", error);
    return null;
  }
}

/**
 * Check if session is expired
 */
export async function isSessionExpired(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return session.expiresAt < now;
}

/**
 * Get session cookie
 */
export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("sb-access-token");
}

/**
 * Set session cookie (for API key auth)
 */
export async function setSessionCookie(
  token: string,
  expiresIn: number = 3600,
) {
  const cookieStore = await cookies();
  cookieStore.set("sb-access-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn,
    path: "/",
  });
}

/**
 * Delete session cookie
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
}

/**
 * Get session ID for anonymous users
 */
export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("session-id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return sessionId;
}
