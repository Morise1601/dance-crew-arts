import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the SERVICE_ROLE_KEY.
 * This client bypasses Row Level Security (RLS).
 * ONLY use this in Server Actions or API routes after verifying the user's authorization.
 */
export async function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) throw new Error('Supabase service role key is not configured.')

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        }
    )
}
