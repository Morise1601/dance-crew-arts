import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../../components/AdminSidebar'
import { UserCircle, Shield, Mail, Phone, Calendar, Fingerprint } from 'lucide-react'
import ProfileSettingsForm from './ProfileSettingsForm'

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    console.log('user', user)
    if (!user) redirect('/admin')

    const { data: adminProfile } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
    console.log('adminProfile', adminProfile)
    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <AdminSidebar />

            <main className="flex-1 pt-24 lg:pt-0 overflow-x-hidden">
                <div className="p-6 lg:p-12 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="relative mb-12 p-8 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <UserCircle className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-1 bg-primary rounded-full" />
                                <span className="text-primary font-black text-[10px] tracking-[0.4em] uppercase">User Profile</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-serif tracking-tighter text-white leading-none">
                                My <span className="text-primary italic">Profile</span>
                            </h1>
                            <p className="text-gray-500 text-xs mt-4 font-light max-w-lg italic">
                                Manage your personal identification and secure access credentials.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Card */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-[#080808] border border-white/5 rounded-[40px] p-8 text-center shadow-xl">
                                <div className="relative inline-block mb-6">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center overflow-hidden shadow-inner mx-auto group">
                                        {adminProfile?.avatar_url ? (
                                            <img src={adminProfile.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <span className="font-serif text-3xl text-white group-hover:text-primary transition-colors">
                                                {adminProfile?.first_name?.[0]}{adminProfile?.last_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 p-2 rounded-xl">
                                        <Shield className="w-4 h-4 text-primary" />
                                    </div>
                                </div>

                                <h3 className="font-serif text-2xl text-white tracking-tight leading-none mb-2">
                                    {adminProfile?.first_name} {adminProfile?.last_name}
                                </h3>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">{(adminProfile?.Role || adminProfile?.role)}</span>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Mail className="w-4 h-4 text-primary/40 shrink-0" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{adminProfile?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Calendar className="w-4 h-4 text-primary/40 shrink-0" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Joined {new Date(adminProfile?.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Form */}
                        <div className="lg:col-span-2 bg-[#080808] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl">
                            <ProfileSettingsForm profile={adminProfile} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
