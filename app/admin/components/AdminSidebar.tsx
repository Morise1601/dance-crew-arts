'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FolderOpen, Users, LayoutDashboard, Home, LogOut, Menu, X, Settings, UserCircle, Shield, Mail } from 'lucide-react'
import { logout } from '../actions'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Logo from '@/public/D_arts_crew.png'
import { createClient } from '@/lib/supabase/client'
import { getAppSettings } from '../actions'

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [adminProfile, setAdminProfile] = useState<any>(null)
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function getInitialData() {
            // Get Profile
            const { data: userData } = await supabase.auth.getUser()
            const user = userData?.user
            if (user) {
                const { data: profile } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('email', user.email)
                    .maybeSingle()

                if (profile) {
                    setAdminProfile(profile)
                }

                // Redirect member to profile settings if on restricted page
                const userRole = (profile?.Role || '').toLowerCase()
                if (userRole === 'member') {
                    const restrictedPaths = ['/admin/dashboard', '/admin/team', '/admin/portfolio', '/admin/settings/app', '/admin/messages']
                    if (restrictedPaths.some(p => pathname.startsWith(p))) {
                        router.push('/admin/settings/profile')
                    }
                }
            }

            // Get Settings for Logo
            const { data: appSettings } = await getAppSettings()
            if (appSettings) {
                setSettings(appSettings)
            }

            setLoading(false)
        }
        getInitialData()
    }, [pathname])

    const isAdmin = (adminProfile?.Role || '').toLowerCase() === 'admin'

    const navItems = [
        ...(isAdmin ? [
            { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
            { href: '/admin/messages', label: 'Messages', icon: Mail },
            { href: '/admin/team', label: 'Team Members', icon: Users },
            { href: '/admin/portfolio', label: 'My Portfolio', icon: FolderOpen },
        ] : []),
        { href: '/admin/settings/profile', label: 'Profile Settings', icon: UserCircle },
        ...(isAdmin ? [{ href: '/admin/settings/app', label: 'App Settings', icon: Settings }] : []),
    ]

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#080808] border-r border-white/5 h-screen sticky top-0 shrink-0 shadow-2xl">
                {/* Logo Section */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
                    <Link href="/" className="flex flex-col items-center gap-3 text-center group">
                        <div className="bg-white rounded-full p-2 shadow-md transition-all duration-500 scale-90 group-hover:scale-95">
                            {settings?.logo_url ? (
                                <Image src={settings.logo_url} alt="Logo" width={45} height={45} className="h-[45px] w-[45px] object-contain" />
                            ) : (
                                <Image src={Logo} alt="Logo" width={45} height={45} />
                            )}
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-tight text-white tracking-tighter">
                                Dance <span className="text-primary italic">Arts</span> Crew
                            </h2>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-1">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                    {loading ? (
                        <div className="space-y-4 px-3">
                            <div className="h-4 bg-white/5 rounded-full animate-pulse w-2/3" />
                            <div className="space-y-2">
                                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-3 px-3">Main Menu</p>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden ${isActive
                                            ? 'bg-primary text-black shadow-md'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-primary"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={`w-3.5 h-3.5 shrink-0 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary'}`} />
                                        <span className="relative z-10">{item.label}</span>
                                    </Link>
                                )
                            })}

                            <div className="pt-6 mt-4 border-t border-white/5">
                                <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-3 px-3">Site Links</p>
                                <Link
                                    href="/"
                                    className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
                                >
                                    <Home className="w-3.5 h-3.5 shrink-0" />
                                    <span>View Website</span>
                                </Link>
                            </div>
                        </>
                    )}
                </nav>

                {/* Logout Section */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => logout()}
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                    >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span>Log Out</span>
                    </button>

                    <div className="mt-4 px-3 flex items-center justify-between text-[8px] uppercase tracking-widest text-gray-700 font-bold">
                        <span>v1.2.5</span>
                        <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-green-500/50" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50">
                <Link href="/" className="flex items-center gap-3 transition-transform active:scale-95">
                    <div className="bg-white rounded-full p-1 shadow-sm h-10 w-10 flex items-center justify-center overflow-hidden">
                        {settings?.logo_url ? (
                            <Image src={settings.logo_url} alt="Logo" width={30} height={30} className="h-[30px] w-[30px] object-contain" />
                        ) : (
                            <Image src={Logo} alt="Logo" width={30} height={30} />
                        )}
                    </div>
                    <span className="font-serif text-base text-white">Dance <span className="text-primary italic">Arts</span></span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 bg-white/5 rounded-lg border border-white/10"
                >
                    {mobileOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-20 p-6 flex flex-col"
                    >
                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-primary text-black' : 'text-gray-400 border border-white/5 bg-white/5'}`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                        <button
                            onClick={() => logout()}
                            className="flex items-center justify-center gap-3 h-12 rounded-xl font-bold uppercase tracking-widest text-red-500 border border-red-500/20 bg-red-500/5 text-xs mt-6"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
