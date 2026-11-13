import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeAdminRole, type AdminProfile, type AdminRole } from './roles'

export type { AdminProfile, AdminRole } from './roles'

export async function getCurrentProfile(): Promise<{
    user: User | null
    profile: AdminProfile | null
    role: AdminRole
    error?: string
}> {
    const supabase = await createClient()
    const { data, error: authError } = await supabase.auth.getUser()
    const user = data?.user ?? null
    if (authError || !user) return { user: null, profile: null, role: null }

    // Auth is verified before using the service client to read the caller's profile.
    // This avoids an RLS-dependent role result differing between server and sidebar.
    const admin = await createAdminClient()
    const { data: byId, error: idError } = await admin
        .from('admins').select('*').eq('id', user.id).maybeSingle()
    if (idError) return { user, profile: null, role: null, error: 'Unable to load your profile.' }

    let profile = byId as AdminProfile | null
    if (!profile && user.email && user.email_confirmed_at) {
        // Older records may predate auth-linked ids. Only a verified, exact email
        // match may resolve those records; escape LIKE wildcards in email addresses.
        const email = user.email.replace(/[\\%_]/g, '\\$&')
        const { data: legacy, error: legacyError } = await admin
            .from('admins').select('*').ilike('email', email).maybeSingle()
        if (legacyError) return { user, profile: null, role: null, error: 'Unable to load your profile.' }
        if (legacy && typeof legacy.email === 'string' && legacy.email.toLowerCase() === user.email.toLowerCase()) {
            profile = legacy as AdminProfile
        }
    }

    return { user, profile, role: normalizeAdminRole(profile) }
}

export async function requireAdmin(): Promise<{ user: User, profile: AdminProfile }> {
    const { user, profile, role } = await getCurrentProfile()
    if (!user || !profile || role !== 'admin') throw new Error('Unauthorized')
    return { user, profile }
}
