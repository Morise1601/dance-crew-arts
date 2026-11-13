import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../components/AdminSidebar'
import { TeamClient } from '../components/TeamClient'

export default async function TeamPage() {
    const { user, profile: adminProfile, role } = await getCurrentProfile()

    if (!user) redirect('/admin')

    if (role !== 'admin') {
        redirect('/admin/settings/profile')
    }
    const supabase = await createAdminClient()

    const { data: admins } = await supabase
        .from('admins')
        .select('*')
        .neq('id', adminProfile?.id ?? user.id) // Exclude current logged in admin
        .order('created_at', { ascending: false })

    return (
        <div className="flex min-h-screen bg-black text-white">
            <AdminSidebar initialProfile={adminProfile} />
            <main className="flex-1 pt-16 lg:pt-0 overflow-x-hidden">
                <div className="p-6 lg:p-10 max-w-7xl">
                    <TeamClient initialAdmins={admins || []} />
                </div>
            </main>
        </div>
    )
}
