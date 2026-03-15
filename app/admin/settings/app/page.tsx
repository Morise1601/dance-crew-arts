import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../../components/AdminSidebar'
import { Settings, Upload, Image as ImageIcon, User, ChevronRight, Loader2 } from 'lucide-react'
import { getAppSettings, updateAppSettings } from '../../actions'
import AppSettingsForm from './AppSettingsForm'

export default async function AppSettingsPage() {
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

    const { data: settings } = await getAppSettings()

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <AdminSidebar />

            <main className="flex-1 pt-24 lg:pt-0 overflow-x-hidden">
                <div className="p-6 lg:p-12 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="relative mb-12 p-8 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Settings className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-1 bg-primary rounded-full" />
                                <span className="text-primary font-bold text-[10px] tracking-[0.4em] uppercase">Configuration</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-serif tracking-tighter text-white leading-none">
                                App <span className="text-primary italic">Settings</span>
                            </h1>
                            <p className="text-gray-500 text-xs mt-4 font-light max-w-lg italic">
                                Customize your application branding and founder information.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#080808] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl">
                        <AppSettingsForm initialSettings={settings} />
                    </div>
                </div>
            </main>
        </div>
    )
}
