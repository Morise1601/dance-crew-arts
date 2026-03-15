import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../components/AdminSidebar'
import { PortfolioClient } from '../components/PortfolioClient'

export default async function PortfolioPage() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) redirect('/admin')

    const { data: adminProfile } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()

    if (((adminProfile as any)?.Role || (adminProfile as any)?.role || '').toLowerCase() !== 'admin') {
        redirect('/admin/settings/profile')
    }

    const { data: assets } = await supabase
        .from('portfolio_assets')
        .select(`
            *,
            admins (
                first_name,
                last_name
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="flex min-h-screen bg-black text-white">
            <AdminSidebar />
            <main className="flex-1 pt-16 lg:pt-0 overflow-x-hidden">
                <div className="p-6 lg:p-10 max-w-7xl">
                    <PortfolioClient initialAssets={assets || []} />
                </div>
            </main>
        </div>
    )
}
