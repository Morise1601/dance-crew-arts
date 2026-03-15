'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Upload, Loader2, LogOut, Film, Image as ImageIcon, UserCircle, UserPlus, ShieldCheck, LayoutDashboard, Users, FolderOpen, PenSquare, Menu, X, Home } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { uploadAsset, deleteAsset, logout, signup, deleteAdmin, updateAsset, updateAdmin } from '../actions'

interface Asset {
    id: string
    name: string
    type: string
    url: string
    storage_path: string
    admin_id: string | null
    admins?: {
        first_name: string | null
        last_name: string | null
    } | null
    created_at: string
}

interface AdminProfile {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    address: string | null
    created_at: string
}

export function AdminDashboard({ assets, initialAdmins }: { assets: Asset[], initialAdmins: AdminProfile[] }) {
    const [currentTab, setCurrentTab] = useState<'portfolio' | 'admins'>('portfolio')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deletePath, setDeletePath] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [adminError, setAdminError] = useState<string | null>(null)
    const [admins, setAdmins] = useState(initialAdmins)

    const menuItems = [
        { id: 'portfolio', label: 'Portfolio Hub', icon: FolderOpen },
        { id: 'admins', label: 'Team Management', icon: Users },
    ]

    const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsCreatingAdmin(true)
        setAdminError(null)

        const formData = new FormData(e.currentTarget)
        const result = await signup(formData)

        if (result?.error) {
            setAdminError(result.error)
        } else {
            alert('Admin created successfully!')
                ; (e.target as HTMLFormElement).reset()
        }
        setIsCreatingAdmin(false)
    }

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploading(true)
        setUploadError(null)

        const formData = new FormData(e.currentTarget)
        const result = await uploadAsset(formData)

        if (result?.error) {
            setUploadError(result.error)
        } else {
            ; (e.target as HTMLFormElement).reset()
        }
        setIsUploading(false)
    }

    const handleDelete = async () => {
        if (!deleteId || !deletePath) return

        const result = await deleteAsset(deleteId, deletePath)
        if (result?.error) {
            alert(result.error)
        }
        setDeleteId(null)
        setDeletePath(null)
    }

    const handleDeleteAdmin = async (id: string, email: string) => {
        if (!confirm(`Revoke access for ${email}?`)) return
        const res = await deleteAdmin(id)
        if (res.error) {
            alert(res.error)
        } else {
            setAdmins(prev => prev.filter(a => a.id !== id))
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white relative">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#050505] border-r border-white/5 p-4 h-screen sticky top-0">
                <div className="flex items-center gap-3 mb-8 px-2 py-4 border-b border-white/5">
                    <div className="p-1 px-1.5 bg-primary/20 rounded-lg border border-primary/20">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-serif text-lg tracking-tight">Admin<span className="text-primary">Portal</span></h2>
                        <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">D'Art Crew v1.0</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${currentTab === item.id
                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                    <Link
                        href="/"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300"
                    >
                        <Home className="w-4 h-4" />
                        Main Site
                    </Link>
                </nav>

                <div className="border-t border-white/5 pt-4 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => logout()}
                        className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive px-3 py-5 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 w-full h-16 bg-[#050505] border-b border-white/5 flex items-center justify-between px-6 z-40">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <span className="font-serif text-lg tracking-tight">Portal</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
                </button>
            </header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="lg:hidden fixed inset-0 z-30 bg-[#050505] pt-20 p-6 flex flex-col"
                    >
                        <nav className="flex-1 space-y-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setCurrentTab(item.id as any);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-bold uppercase tracking-widest transition-all ${currentTab === item.id
                                        ? 'bg-primary text-black'
                                        : 'text-gray-400 border border-white/5'
                                        }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                        <Button
                            variant="outline"
                            onClick={() => logout()}
                            className="h-12 font-bold uppercase tracking-widest text-destructive mb-10 text-[10px]"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-12 pt-24 lg:pt-12 max-w-full overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {currentTab === 'portfolio' ? (
                        <motion.div
                            key="portfolio-tab"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="space-y-10"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                                <div>
                                    <span className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-1 block">Content Studio</span>
                                    <h1 className="text-3xl md:text-4xl font-serif tracking-tight">Portfolio <span className="text-gray-500">Hub</span></h1>
                                </div>
                                <Sheet>
                                    <SheetTrigger
                                        render={
                                            <Button className="bg-primary text-black hover:bg-white font-bold h-11 px-6 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <Upload className="w-3.5 h-3.5" /> Add Asset
                                            </Button>
                                        }
                                    />
                                    <SheetContent className="bg-[#0A0A0A] border-white/10 sm:max-w-md p-0 flex flex-col h-full">
                                        <SheetHeader className="p-6 border-b border-white/5">
                                            <SheetTitle className="text-2xl font-serif">Upload Resource</SheetTitle>
                                            <SheetDescription>Add a high-quality icon, owner portrait, or dance video.</SheetDescription>
                                        </SheetHeader>

                                        <div className="flex-1 overflow-y-auto p-6">
                                            <form id="upload-form" onSubmit={handleUpload} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Asset Name</Label>
                                                    <Input name="name" placeholder="E.g. Workshop Highlights" required className="bg-white/5 h-12 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Type</Label>
                                                    <Select name="type" required defaultValue="icon">
                                                        <SelectTrigger className="bg-white/5 h-12 rounded-xl border-white/10 uppercase tracking-widest text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#111] border-white/10">
                                                            <SelectItem value="icon">Icon / Graphic</SelectItem>
                                                            <SelectItem value="owner">Owner Portrait</SelectItem>
                                                            <SelectItem value="video">Showcase Video</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">File Source</Label>
                                                    <Input name="file" type="file" required className="bg-white/5 h-12 rounded-xl border-white/10 pt-3" />
                                                </div>
                                                {uploadError && <p className="text-destructive text-xs font-medium bg-destructive/10 p-3 rounded-lg">{uploadError}</p>}
                                            </form>
                                        </div>

                                        <SheetFooter className="p-6 border-t border-white/5 mt-auto">
                                            <Button type="submit" form="upload-form" className="w-full bg-primary text-black font-bold h-11 uppercase tracking-widest text-[10px]" disabled={isUploading}>
                                                {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Start Public Upload'}
                                            </Button>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {assets.length === 0 ? (
                                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                        <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Your gallery is empty</p>
                                    </div>
                                ) : (
                                    assets.map((asset) => (
                                        <motion.div
                                            key={asset.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 transition-all hover:border-primary/40 hover:bg-white/[0.02]"
                                        >
                                            <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5 mb-4">
                                                {asset.type === 'video' ? (
                                                    <video src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <Sheet>
                                                        <SheetTrigger
                                                            render={
                                                                <Button size="icon" className="w-8 h-8 bg-black/60 backdrop-blur-md text-primary hover:bg-primary hover:text-black transition-all">
                                                                    <PenSquare className="w-4 h-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <SheetContent className="bg-[#0A0A0A] border-white/10 sm:max-w-md p-0 flex flex-col h-full">
                                                            <SheetHeader className="p-6 border-b border-white/5">
                                                                <SheetTitle>Update Asset Name</SheetTitle>
                                                            </SheetHeader>
                                                            <div className="flex-1 overflow-y-auto p-6">
                                                                <form id={`edit-asset-${asset.id}`} onSubmit={async (e) => {
                                                                    e.preventDefault();
                                                                    const name = new FormData(e.currentTarget).get('editName') as string;
                                                                    const res = await updateAsset(asset.id, name);
                                                                    if (res.error) alert(res.error);
                                                                    else window.location.reload();
                                                                }} className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-[10px] font-bold uppercase text-gray-400">Display Title</Label>
                                                                        <Input name="editName" defaultValue={asset.name} className="bg-white/5 h-12 rounded-xl" />
                                                                    </div>
                                                                </form>
                                                            </div>
                                                            <SheetFooter className="p-6 border-t border-white/5">
                                                                <Button type="submit" form={`edit-asset-${asset.id}`} className="w-full bg-primary text-black font-bold h-11 uppercase tracking-widest text-[10px]">Save Changes</Button>
                                                            </SheetFooter>
                                                        </SheetContent>
                                                    </Sheet>
                                                    <Dialog>
                                                        <DialogTrigger
                                                            render={
                                                                <Button size="icon" className="w-8 h-8 bg-black/60 backdrop-blur-md text-destructive hover:bg-destructive hover:text-white transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <DialogContent className="bg-[#0A0A0A] border-white/10">
                                                            <DialogHeader>
                                                                <DialogTitle>Permanent Deletion</DialogTitle>
                                                                <DialogDescription>This will remove "{asset.name}" from servers and the database.</DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="gap-2">
                                                                <Button variant="outline" onClick={() => { setDeleteId(null); setDeletePath(null); }}>Abort</Button>
                                                                <Button variant="destructive" className="px-8" onClick={() => {
                                                                    setDeleteId(asset.id);
                                                                    setDeletePath(asset.storage_path);
                                                                    handleDelete();
                                                                }}>Delete Forever</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] uppercase tracking-widest font-bold text-primary border border-primary/20 flex items-center gap-1.5">
                                                    {asset.type === 'video' ? <Film className="w-3 h-3" /> : asset.type === 'owner' ? <UserCircle className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                                    {asset.type}
                                                </div>
                                            </div>
                                            <div className="px-1">
                                                <h3 className="font-bold text-sm uppercase tracking-wider mb-1 truncate">{asset.name}</h3>
                                                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                                                    <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                                                    {asset.admins && (
                                                        <span className="text-primary/70">By {asset.admins.first_name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="admins-tab"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="space-y-10"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                                <div>
                                    <span className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-1 block">Personnel</span>
                                    <h1 className="text-3xl md:text-4xl font-serif tracking-tight">Team <span className="text-gray-500">Management</span></h1>
                                </div>
                                <Sheet>
                                    <SheetTrigger
                                        render={
                                            <Button className="bg-primary text-black hover:bg-white font-bold h-11 px-6 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <UserPlus className="w-3.5 h-3.5" /> Add Admin
                                            </Button>
                                        }
                                    />
                                    <SheetContent className="bg-[#0A0A0A] border-white/10 sm:max-w-md p-0 flex flex-col h-full">
                                        <SheetHeader className="p-6 border-b border-white/5">
                                            <SheetTitle className="text-2xl font-serif">Provision New Admin</SheetTitle>
                                            <SheetDescription>Access will be granted immediately. Credentials are required.</SheetDescription>
                                        </SheetHeader>
                                        <div className="flex-1 overflow-y-auto p-6">
                                            <form id="add-admin-form" onSubmit={handleCreateAdmin} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">First Name</Label>
                                                        <Input name="firstName" placeholder="John" required className="bg-white/5 h-12 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Last Name</Label>
                                                        <Input name="lastName" placeholder="Doe" required className="bg-white/5 h-12 rounded-xl" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Email</Label>
                                                    <Input name="email" type="email" placeholder="admin@dartcrew.com" required className="bg-white/5 h-12 rounded-xl" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Phone</Label>
                                                        <Input name="phone" placeholder="+1..." className="bg-white/5 h-12 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Password</Label>
                                                        <Input name="password" type="password" required className="bg-white/5 h-12 rounded-xl" />
                                                    </div>
                                                </div>
                                                {adminError && <p className="text-destructive text-xs font-medium bg-destructive/10 p-4 rounded-xl">{adminError}</p>}
                                            </form>
                                        </div>
                                        <SheetFooter className="p-6 border-t border-white/5">
                                            <Button type="submit" form="add-admin-form" className="w-full bg-primary text-black font-bold h-12 uppercase tracking-widest text-xs" disabled={isCreatingAdmin}>
                                                {isCreatingAdmin ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Registration'}
                                            </Button>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0A0A0A]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5">
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">FullName</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {admins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-sm tracking-wide">{admin.first_name} {admin.last_name}</div>
                                                    <div className="text-[10px] text-gray-500 font-medium">Joined {new Date(admin.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-400 font-mono">{admin.email}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <Sheet>
                                                            <SheetTrigger
                                                                render={
                                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/20">
                                                                        <PenSquare className="w-5 h-5" />
                                                                    </Button>
                                                                }
                                                            />
                                                            <SheetContent className="bg-[#0A0A0A] border-white/10 sm:max-w-md p-0 flex flex-col h-full">
                                                                <SheetHeader className="p-6 border-b border-white/5">
                                                                    <SheetTitle>Modify Admin Data</SheetTitle>
                                                                </SheetHeader>
                                                                <div className="flex-1 overflow-y-auto p-6">
                                                                    <form id={`edit-admin-${admin.id}`} onSubmit={async (e) => {
                                                                        e.preventDefault();
                                                                        const formData = new FormData(e.currentTarget);
                                                                        const res = await updateAdmin(admin.id, formData);
                                                                        if (res.error) alert(res.error);
                                                                        else window.location.reload();
                                                                    }} className="space-y-4">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="space-y-2">
                                                                                <Label className="text-[10px] font-bold uppercase text-gray-400">First Name</Label>
                                                                                <Input name="firstName" defaultValue={admin.first_name || ''} className="bg-white/5 h-12 rounded-xl" />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-[10px] font-bold uppercase text-gray-400">Last Name</Label>
                                                                                <Input name="lastName" defaultValue={admin.last_name || ''} className="bg-white/5 h-12 rounded-xl" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] font-bold uppercase text-gray-400">Phone</Label>
                                                                            <Input name="phone" defaultValue={admin.phone || ''} className="bg-white/5 h-12 rounded-xl" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] font-bold uppercase text-gray-400">Address</Label>
                                                                            <Input name="address" defaultValue={admin.address || ''} className="bg-white/5 h-12 rounded-xl" />
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                                <SheetFooter className="p-6 border-t border-white/5">
                                                                    <Button type="submit" form={`edit-admin-${admin.id}`} className="w-full bg-primary text-black font-bold h-11 uppercase tracking-widest text-[10px]">Update Profile</Button>
                                                                </SheetFooter>
                                                            </SheetContent>
                                                        </Sheet>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={async () => {
                                                                if (confirm(`Revoke access for ${admin.email}?`)) {
                                                                    const res = await deleteAdmin(admin.id);
                                                                    if (res.error) alert(res.error);
                                                                }
                                                            }}
                                                            className="h-10 w-10 text-destructive hover:bg-destructive/20"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
