import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/')) {
    return '/agent/debates';
  }
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeNextPath(requestUrl.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(new URL(`/signin?error=missing_oauth_code`, requestUrl.origin));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('OAuth code exchange failed:', exchangeError);
    return NextResponse.redirect(new URL(`/signin?error=oauth_exchange_failed`, requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const emailPrefix = user.email?.split('@')[0] || 'User';
      const displayName =
        (typeof metadata.full_name === 'string' && metadata.full_name) ||
        (typeof metadata.name === 'string' && metadata.name) ||
        emailPrefix;

      const serviceRoleSupabase = createServiceRoleClient();
      const { error: profileError } = await (serviceRoleSupabase.from('profiles') as any).upsert(
        {
          id: user.id,
          user_type: 'human',
          display_name: displayName,
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        console.error('OAuth profile upsert failed:', profileError);
      }
    } catch (profileSetupError) {
      console.error('OAuth profile setup failed:', profileSetupError);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
