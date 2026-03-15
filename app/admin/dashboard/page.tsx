import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../components/AdminSidebar'
import { FolderOpen, Users, Film, Image as ImageIcon, UserCircle, TrendingUp, Clock, Activity, Zap, ShieldAlert, Sparkles, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) redirect('/admin')

    const { data: adminProfile } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
    console.log('adminProfile', adminProfile)
    if (((adminProfile as any)?.Role || (adminProfile as any)?.role || '').toLowerCase() !== 'admin') {
        redirect('/admin/settings/profile')
    }

    const { data: assets } = await supabase
        .from('portfolio_assets')
        .select('*')
        .order('created_at', { ascending: false })

    const { data: admins } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

    const totalAssets = assets?.length || 0
    const totalAdmins = admins?.length || 0
    const videoCount = assets?.filter(a => a.type === 'video').length || 0
    const iconCount = assets?.filter(a => a.type === 'icon').length || 0
    const ownerCount = assets?.filter(a => a.type === 'owner').length || 0

    const recentAssets = assets?.slice(0, 5) || []

    const stats = [
        { label: 'Studio Portfolio', value: totalAssets, icon: FolderOpen, trend: '+12%', color: '#E39D1C' },
        { label: 'Crew Personnel', value: totalAdmins, icon: Users, trend: 'Stable', color: '#6366f1' },
        { label: 'Video Releases', value: videoCount, icon: Film, trend: '+5', color: '#a855f7' },
        { label: 'Media Assets', value: iconCount + ownerCount, icon: ImageIcon, trend: 'Active', color: '#10b981' },
    ]

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <AdminSidebar />

            <main className="flex-1 pt-24 lg:pt-0 overflow-x-hidden">
                {/* Background Decor */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 left-[20%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="p-6 lg:p-12 max-w-7xl mx-auto">
                    {/* Header with Glassmorphism */}
                    <div className="relative mb-12 p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-primary font-bold text-[9px] tracking-widest uppercase">System Status</span>
                                </div>
                                <h1 className="font-serif text-3xl lg:text-4xl tracking-tighter leading-none text-white">
                                    Welcome, <span className="text-primary italic">{adminProfile?.first_name || 'Administrator'}</span>
                                </h1>
                                <p className="text-gray-400 text-xs mt-3 font-light max-w-lg">
                                    All systems are running smoothly. You can manage your studio content below.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[100px] backdrop-blur-xl">
                                    <Zap className="w-5 h-5 text-primary mb-1" />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Uptime</span>
                                    <span className="text-sm font-serif font-bold">99.9%</span>
                                </div>
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[100px] backdrop-blur-xl">
                                    <ShieldAlert className="w-5 h-5 text-green-500 mb-1" />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Security</span>
                                    <span className="text-sm font-serif font-bold">Encrypted</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Telemetry Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="relative bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 overflow-hidden group hover:border-primary/30 transition-all duration-500"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-all duration-700" />

                                <div className="flex flex-col justify-between h-full relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/20 transition-colors">
                                            <stat.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-[10px] font-black tracking-widest px-2 py-1 rounded bg-white/5 text-gray-400 group-hover:text-primary transition-colors">
                                            {stat.trend}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-serif text-white group-hover:scale-105 transition-transform origin-left duration-500">{stat.value}</span>
                                            <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    {/* Mini Waveform Decor */}
                                    <div className="flex gap-1 h-3 mt-6 items-end">
                                        {[...Array(12)].map((_, j) => (
                                            <div
                                                key={j}
                                                className="w-1 bg-white/5 rounded-full group-hover:bg-primary/20 transition-all duration-500"
                                                style={{ height: `${Math.random() * 100}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Data Stream / Recent Activity */}
                        <div className="xl:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Activity className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="font-serif text-base uppercase tracking-widest text-white">Media Feed</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Connected</span>
                                    </div>
                                    <a href="/admin/portfolio" className="text-primary text-[8px] font-bold uppercase tracking-widest hover:text-white transition-colors bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/20">
                                        View All
                                    </a>
                                </div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {recentAssets.length === 0 ? (
                                    <div className="py-24 text-center text-gray-600 font-serif italic text-lg">Empty transmission queue</div>
                                ) : (
                                    recentAssets.map((asset, i) => (
                                        <div key={asset.id} className="group flex items-center gap-6 px-8 py-6 hover:bg-white/[0.02] transition-all duration-300">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 group-hover:border-primary/40 transition-all overflow-hidden flex items-center justify-center shadow-2xl">
                                                    {asset.type === 'video' ? <Film className="w-6 h-6 text-primary" /> :
                                                        asset.type === 'owner' ? <UserCircle className="w-6 h-6 text-primary" /> :
                                                            <ImageIcon className="w-6 h-6 text-primary" />}
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-black flex items-center justify-center text-[7px] text-black font-black">
                                                    {i + 1}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="font-serif text-lg tracking-tight text-white group-hover:text-primary transition-colors truncate">{asset.name}</p>
                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded text-gray-500 border border-white/5">{asset.type}</span>
                                                </div>
                                                <p className="text-[9px] font-bold uppercase text-gray-700 flex items-center gap-2">
                                                    Status: Active
                                                </p>
                                            </div>

                                            <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary italic">
                                                    <Zap className="w-3 h-3" />
                                                    Live
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(asset.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Control Side Panel */}
                        <div className="space-y-8">
                            {/* Command Links */}
                            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-serif text-base uppercase tracking-widest">Quick Actions</span>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { href: '/admin/portfolio', label: 'Upload File', icon: FolderOpen, desc: 'Add photos or videos' },
                                        { href: '/admin/team', label: 'Add Member', icon: Users, desc: 'Add a new admin' },
                                        { href: '/', label: 'Go to Site', icon: LayoutDashboard, desc: 'View your website' },
                                    ].map((action) => (
                                        <a
                                            key={action.href}
                                            href={action.href}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/50 hover:bg-primary transition-all duration-300 group/btn"
                                        >
                                            <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 group-hover/btn:bg-white group-hover/btn:border-white transition-colors">
                                                <action.icon className="w-4 h-4 text-primary group-hover/btn:text-black group-hover/btn:scale-110 transition-all" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white group-hover/btn:text-black">{action.label}</p>
                                                <p className="text-[9px] text-gray-600 font-bold group-hover/btn:text-black/60 italic">{action.desc}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Signal Breakdown */}
                            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Activity className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-serif text-base uppercase tracking-widest">Content Mix</span>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Videos', count: videoCount, total: totalAssets, color: '#E39D1C' },
                                        { label: 'Graphic Icons', count: iconCount, total: totalAssets, color: '#A42018' },
                                        { label: 'Artist Profiles', count: ownerCount, total: totalAssets, color: '#6366F1' },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] mb-2.5">
                                                <span className="text-gray-500 italic">{item.label}</span>
                                                <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.count}</span>
                                            </div>
                                            <div className="h-2.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-[2px]">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(227,157,28,0.3)]"
                                                    style={{
                                                        width: totalAssets ? `${(item.count / totalAssets) * 100}%` : '0%',
                                                        background: `linear-gradient(to right, ${item.color}, #fff)`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
