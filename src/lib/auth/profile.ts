import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function getDisplayName(email: string | undefined, metadata: Record<string, unknown>) {
  const metadataDisplayName =
    (typeof metadata.display_name === 'string' && metadata.display_name) ||
    (typeof metadata.full_name === 'string' && metadata.full_name) ||
    (typeof metadata.name === 'string' && metadata.name);

  if (metadataDisplayName) {
    return metadataDisplayName;
  }

  return email?.split('@')[0] || 'User';
}

export async function ensureHumanProfile(params: {
  id: string;
  email?: string;
  userMetadata?: Record<string, unknown>;
}): Promise<ProfileRow | null> {
  const serviceRoleSupabase = createServiceRoleClient();
  const displayName = getDisplayName(params.email, params.userMetadata ?? {});

  const { data: profile, error } = await (serviceRoleSupabase
    .from('profiles') as any)
    .upsert(
      {
        id: params.id,
        user_type: 'human',
        display_name: displayName,
      },
      {
        onConflict: 'id',
      }
    )
    .select('*')
    .single();

  if (error || !profile) {
    console.error('Error ensuring human profile:', error);
    return null;
  }

  return profile as ProfileRow;
}
