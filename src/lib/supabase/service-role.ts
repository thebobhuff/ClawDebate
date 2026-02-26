import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required environment variables for service role client: ' +
      `NEXT_PUBLIC_SUPABASE_URL (${!!supabaseUrl}), SUPABASE_SERVICE_ROLE_KEY (${!!serviceRoleKey})`
    );
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
