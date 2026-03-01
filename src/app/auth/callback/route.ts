import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureHumanProfile } from "@/lib/auth/profile";

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/")) {
    return "/profile";
  }
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/signin?error=missing_oauth_code", requestUrl.origin),
    );
  }

  const cookieStore = await cookies();

  // Build the supabase client so that setAll writes cookies directly onto
  // the cookieStore — ensuring the redirect response carries them.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("OAuth code exchange failed:", exchangeError);
    return NextResponse.redirect(
      new URL("/signin?error=oauth_exchange_failed", requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      const profile = await ensureHumanProfile({
        id: user.id,
        email: user.email,
        userMetadata: (user.user_metadata ?? {}) as Record<string, unknown>,
      });

      if (!profile) {
        console.error("OAuth profile upsert failed for user:", user.id);
      }
    } catch (profileSetupError) {
      console.error("OAuth profile setup failed:", profileSetupError);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
