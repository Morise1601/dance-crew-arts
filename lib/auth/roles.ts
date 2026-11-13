export type AdminRole = 'admin' | 'member' | null

export interface AdminProfile {
    id: string
    email?: string | null
    Role?: string | null
    role?: string | null
    is_active?: boolean | null
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    avatar_url?: string | null
    created_at?: string
    [key: string]: unknown
}

export function normalizeAdminRole(profile: unknown): AdminRole {
    if (!profile || typeof profile !== 'object') return null
    const record = profile as Record<string, unknown>
    if (record.is_active === false) return null
    const rawRole = record.Role ?? record.role
    if (typeof rawRole !== 'string') return null
    const role = rawRole.trim().toLowerCase()
    return role === 'admin' || role === 'member' ? role : null
}
