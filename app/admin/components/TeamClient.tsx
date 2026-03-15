'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Trash2, Plus, Loader2, Mail, Phone, Lock, Search, ShieldCheck, ChevronRight, Fingerprint, Calendar, Users, PenSquare, Shield, Power } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signup, deleteAdmin, updateAdmin, toggleAdminStatus } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AdminProfile {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    role?: 'admin' | 'member'
    Role?: 'admin' | 'member'
    avatar_url: string | null
    is_active: boolean
    created_at: string
}

export function TeamClient({ initialAdmins }: { initialAdmins: AdminProfile[] }) {
    const [admins, setAdmins] = useState(initialAdmins)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('admins_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'admins' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setAdmins(prev => [payload.new as AdminProfile, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setAdmins(prev => prev.map(a => a.id === payload.new.id ? payload.new as AdminProfile : a))
                    } else if (payload.eventType === 'DELETE') {
                        setAdmins(prev => prev.filter(a => a.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsCreating(true)
        setCreateError(null)
        const formData = new FormData(e.currentTarget)
        const result = await signup(formData)
        if (result?.error) {
            setCreateError(result.error)
            setIsCreating(false)
        } else {
            (e.target as HTMLFormElement).reset()
            setIsCreating(false)
        }
    }

    const filteredAdmins = admins.filter(admin => 
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (`${admin.first_name || ''} ${admin.last_name || ''}`).toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-10">
            {/* Compact Header Section */}
            <div className="relative p-6 rounded-[30px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-0.5 bg-primary rounded-full" />
                            <span className="text-primary font-black text-[8px] tracking-[0.3em] uppercase">HR Dashboard</span>
                        </div>
                        <h1 className="text-2xl font-serif tracking-tighter text-white leading-none">
                            Crew <span className="text-primary italic">Personnel</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] mt-2 font-light italic">
                            Currently maintaining <span className="text-white font-serif">{admins.length}</span> authorized personnel.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="relative group w-48 lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                            <Input 
                                placeholder="Quick Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[10px] text-white placeholder:text-gray-700" 
                            />
                        </div>

                        <Sheet>
                            <SheetTrigger
                                render={
                                    <button className="group relative bg-white text-black font-bold h-9 px-4 rounded-lg shadow-md hover:bg-primary transition-all duration-300 active:scale-95 uppercase tracking-wider text-[9px] overflow-hidden flex items-center gap-2">
                                        <Plus className="w-3 h-3" /> Add Admin
                                    </button>
                                }
                            />
                            <SheetContent className="bg-[#050505] border-white/10 sm:max-w-sm p-0 flex flex-col h-full overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                <SheetHeader className="p-5 border-b border-white/5 bg-white/[0.01]">
                                    <SheetTitle className="text-lg font-serif text-white tracking-tight">New <span className="text-primary italic">Account</span></SheetTitle>
                                    <SheetDescription className="text-gray-500 font-light mt-1 uppercase tracking-widest text-[7px]">System Ingestion Protocol</SheetDescription>
                                </SheetHeader>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <form id="add-admin-form" onSubmit={handleCreate} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">First Name</Label>
                                                <Input name="firstName" placeholder="First Name" required className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[10px] text-white placeholder:text-gray-700" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Last Name</Label>
                                                <Input name="lastName" placeholder="Last Name" required className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[10px] text-white placeholder:text-gray-700" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</Label>
                                            <Input name="email" type="email" placeholder="admin@danceartscrew.com" required className="bg-white/[0.03] h-10 rounded-lg border-white/5 focus:border-primary/50 text-[10px] text-white placeholder:text-gray-700" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Role</Label>
                                                <select name="role" required className="w-full bg-white/[0.03] h-9 rounded-lg border border-white/5 focus:border-primary/50 text-[10px] text-white px-2 outline-none">
                                                    <option value="admin" className="bg-[#111]">Admin</option>
                                                    <option value="member" className="bg-[#111]">Member</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Avatar Image</Label>
                                                <Input name="avatar" type="file" accept="image/*" className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[8px] text-white p-2" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</Label>
                                                <Input name="phone" placeholder="+91..." className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[10px] text-white placeholder:text-gray-700" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</Label>
                                                <Input name="password" type="password" required className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[10px] text-white placeholder:text-gray-700" />
                                            </div>
                                        </div>
                                        {createError && (
                                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                                                <p className="text-primary text-[8px] font-black uppercase tracking-widest leading-relaxed">{createError}</p>
                                            </div>
                                        )}
                                    </form>
                                </div>
                                <SheetFooter className="p-5 border-t border-white/5 bg-white/[0.01]">
                                    <button type="submit" form="add-admin-form" disabled={isCreating}
                                        className="w-full bg-white text-black font-bold h-10 rounded-lg uppercase tracking-widest text-[9px] hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isCreating ? <Loader2 className="animate-spin w-3 h-3" /> : 'Instantiate Personnel'}
                                    </button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            {/* Compact Admin List */}
            <div className="bg-[#080808] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.01]">
                                <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 w-[30%]">Personnel</th>
                                <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Contact Detail</th>
                                <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Classification</th>
                                <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">System Visibility</th>
                                <th className="px-6 py-4 text-right text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredAdmins.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-gray-600 uppercase tracking-widest text-[9px] font-black">No personnel matching search criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAdmins.map((admin, i) => (
                                        <motion.tr
                                            key={admin.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-white/[0.01] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                        {admin.avatar_url ? (
                                                            <img src={admin.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-serif text-sm text-white">{admin.first_name?.[0]}{admin.last_name?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-serif text-sm text-white truncate">{admin.first_name} {admin.last_name}</h3>
                                                        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">{new Date(admin.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white transition-colors">
                                                        <Mail className="w-2.5 h-2.5 text-primary/40" />
                                                        <span className="text-[9px] font-medium truncate">{admin.email}</span>
                                                    </div>
                                                    {admin.phone && (
                                                        <div className="flex items-center gap-1.5 text-gray-500 transition-colors">
                                                            <Phone className="w-2.5 h-2.5 text-primary/40" />
                                                            <span className="text-[9px] font-medium tracking-tight whitespace-nowrap">{admin.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-lg">
                                                    <Shield className="w-2 h-2 text-primary" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">{admin.Role || admin.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={async () => {
                                                        const newStatus = !admin.is_active;
                                                        setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: newStatus } : a));
                                                        await toggleAdminStatus(admin.id, newStatus);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300",
                                                        admin.is_active 
                                                            ? "bg-primary/10 border-primary/40 text-primary" 
                                                            : "bg-white/[0.02] border-white/5 text-gray-600"
                                                    )}
                                                >
                                                    <Power className={cn("w-3 h-3", admin.is_active && "animate-pulse")} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">{admin.is_active ? 'ACTIVE' : 'OFFLINE'}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Sheet>
                                                        <SheetTrigger
                                                            render={
                                                                <button className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-black hover:border-primary transition-all">
                                                                    <PenSquare className="w-3 h-3" />
                                                                </button>
                                                            }
                                                        />
                                                        <SheetContent className="bg-[#050505] border-white/10 sm:max-w-sm p-0 flex flex-col h-full overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                                            <SheetHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                                                                <SheetTitle className="text-lg font-serif text-white">Modify <span className="text-primary italic">Record</span></SheetTitle>
                                                            </SheetHeader>
                                                            <div className="flex-1 p-6 overflow-y-auto">
                                                                <form id={`edit-admin-${admin.id}`} onSubmit={async (e) => {
                                                                    e.preventDefault()
                                                                    const formData = new FormData(e.currentTarget)
                                                                    const res = await updateAdmin(admin.id, formData)
                                                                    if (res.error) alert(res.error)
                                                                }} className="space-y-4">
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">First Name</Label>
                                                                            <Input name="firstName" required defaultValue={admin.first_name || ''} className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-white text-[10px]" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">Last Name</Label>
                                                                            <Input name="lastName" required defaultValue={admin.last_name || ''} className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-white text-[10px]" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">Role</Label>
                                                                            <select name="role" required defaultValue={admin.role || admin.Role} className="w-full bg-white/[0.03] h-9 rounded-lg border border-white/5 focus:border-primary/50 text-[10px] text-white px-2 outline-none">
                                                                                <option value="admin" className="bg-[#111]">Admin</option>
                                                                                <option value="member" className="bg-[#111]">Member</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">Avatar Update</Label>
                                                                            <Input name="avatar" type="file" accept="image/*" className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-[8px] text-white p-2" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">Phone Line</Label>
                                                                        <Input name="phone" defaultValue={admin.phone || ''} className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-white text-[10px]" />
                                                                    </div>
                                                                    <div className="pt-3 border-t border-white/5 space-y-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">Email</Label>
                                                                            <Input name="email" type="email" required defaultValue={admin.email} className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-white text-[10px]" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[8px] font-bold uppercase text-gray-500 ml-1">Update Password</Label>
                                                                            <Input name="password" type="password" required className="bg-white/[0.03] h-9 rounded-lg border-white/5 focus:border-primary/50 text-white text-[10px]" />
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                            <SheetFooter className="p-6 border-t border-white/5 mt-auto">
                                                                <button type="submit" form={`edit-admin-${admin.id}`}
                                                                    className="w-full bg-white text-black font-black h-10 rounded-lg uppercase tracking-[0.2em] text-[8px] hover:bg-primary transition-all">
                                                                    Apply Profile Changes
                                                                </button>
                                                            </SheetFooter>
                                                        </SheetContent>
                                                    </Sheet>

                                                    <button
                                                        onClick={async () => {
                                                            if (confirm(`Revoke access for ${admin.email}?`)) {
                                                                await deleteAdmin(admin.id)
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/40 hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 className="w-3 w-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
