import { createServerClient } from '@supabase/ssr'

/**
 * Creates a Supabase client with the SERVICE_ROLE_KEY.
 * This client bypasses Row Level Security (RLS).
 * ONLY use this in Server Actions or API routes after verifying the user's authorization.
 */
export async function createAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return []
                },
                setAll() {
                    // Service role client doesn't need to set cookies for auth persistence
                    // as it uses the secret key directly.
                },
            },
        }
    )
}
