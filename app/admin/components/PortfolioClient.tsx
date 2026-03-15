'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Upload, Loader2, Film, Image as ImageIcon, UserCircle, PenSquare, FolderOpen, Search, Filter, Sparkles, Zap, ShieldAlert, Activity, ChevronRight, Play, Calendar, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadAsset, deleteAsset, updateAsset, toggleAssetStatus } from '../actions'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { toast } from 'sonner'

interface Asset {
    id: string
    name: string
    type: string
    url: string
    storage_path: string
    admin_id: string | null
    is_active: boolean
    admins?: { first_name: string | null; last_name: string | null } | null
    created_at: string
}

const typeIcon = (type: string) => {
    if (type === 'video') return <Film className="w-4 h-4 text-blue-400" />
    if (type === 'owner') return <UserCircle className="w-4 h-4 text-purple-400" />
    if (type === 'photos') return <ImageIcon className="w-4 h-4 text-orange-400" />
    return <ImageIcon className="w-4 h-4 text-green-400" />
}

export function PortfolioClient({ initialAssets }: { initialAssets: Asset[] }) {
    const [assets, setAssets] = useState(initialAssets)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'video' | 'icon' | 'owner' | 'photos'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('admin-portfolio-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'portfolio_assets'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newAsset = payload.new as Asset;
                        setAssets(prev => [newAsset, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedAsset = payload.new as Asset;
                        setAssets(prev => prev.map(a => a.id === updatedAsset.id ? { ...a, ...updatedAsset } : a));
                    } else if (payload.eventType === 'DELETE') {
                        setAssets(prev => prev.filter(a => a.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploading(true)
        setUploadError(null)
        const formData = new FormData(e.currentTarget)
        const result = await uploadAsset(formData)
        if (result?.error) {
            setUploadError(result.error)
            toast.error(result.error)
            setIsUploading(false)
        } else {
            (e.target as HTMLFormElement).reset()
            setIsUploading(false)
            toast.success('Asset uploaded successfully')
            // Realtime will handle the update
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        // Optimistic update
        setAssets(prev => prev.map(a => a.id === id ? { ...a, is_active: newStatus } : a))
        const res = await toggleAssetStatus(id, newStatus)
        if (res?.error) {
            toast.error(res.error)
            // Revert on error
            setAssets(prev => prev.map(a => a.id === id ? { ...a, is_active: currentStatus } : a))
        } else {
            toast.success(`Asset visibility updated`)
        }
    }

    const filteredAssets = assets.filter(a => {
        const matchesFilter = filter === 'all' || a.type === filter
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <div className="space-y-12 pb-24">
            {/* Gallery Header */}
            <div className="relative p-10 rounded-[40px] border border-white/5 bg-[#080808] overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 blur-md group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                    <FolderOpen className="w-64 h-64 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-12 h-1 bg-primary rounded-full" />
                            <span className="text-primary font-bold text-[8px] tracking-[0.4em] uppercase">Visual Assets</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-serif tracking-tighter text-white leading-none">
                            Portfolio <span className="text-primary italic">Hub</span>
                        </h1>
                        <p className="text-gray-500 text-xs mt-4 font-light max-w-lg italic">
                            Manage your dance videos, icons, and team photos here.
                            Currently indexing <span className="text-white font-serif">{assets.length}</span> unique resources.
                        </p>
                    </div>

                    <Sheet>
                        <SheetTrigger
                            render={
                                <button className="group relative bg-white text-black font-bold h-10 px-6 rounded-lg shadow-md hover:bg-primary transition-all duration-300 active:scale-95 uppercase tracking-wider text-[10px] overflow-hidden flex items-center gap-2">
                                    <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> Add New Item
                                    </span>
                                </button>
                            }
                        />
                        <SheetContent className="bg-[#050505] border-white/10 sm:max-w-md p-0 flex flex-col h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <SheetHeader className="p-5 border-b border-white/5 bg-white/[0.01]">
                                <SheetTitle className="text-xl font-serif text-white tracking-tight">New <span className="text-primary italic">Media</span></SheetTitle>
                                <SheetDescription className="text-gray-500 font-light mt-1 uppercase tracking-widest text-[8px]">Add photos or videos to your website.</SheetDescription>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <form id="upload-form" onSubmit={handleUpload} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Item Name</Label>
                                        <Input name="name" placeholder="E.g. Performance Video" required className="bg-white/[0.03] h-10 rounded-lg border-white/5 focus:border-primary/50 text-white text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Category</Label>
                                        <Select name="type" required defaultValue="video">
                                            <SelectTrigger className="bg-white/[0.03] h-10 rounded-lg border-white/5 uppercase tracking-wider text-[9px] font-bold text-white px-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 rounded-xl">
                                                <SelectItem value="icon">Icon / Graphic</SelectItem>
                                                <SelectItem value="owner">Profile Photo</SelectItem>
                                                <SelectItem value="video">Dance Video</SelectItem>
                                                <SelectItem value="photos">Portfolio Photo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase text-gray-500 ml-1">Select File</Label>
                                        <Input
                                            name="file"
                                            type="file"
                                            required
                                            className="bg-white/[0.03] h-10 rounded-lg border-white/5 focus:border-primary/50 text-white text-[10px] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80"
                                        />
                                    </div>
                                    {uploadError && (
                                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{uploadError}</p>
                                        </div>
                                    )}
                                </form>
                            </div>
                            <SheetFooter className="p-5 border-t border-white/5">
                                <button type="submit" form="upload-form" disabled={isUploading}
                                    className="w-full bg-white text-black font-bold h-11 rounded-lg uppercase tracking-widest text-[10px] hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 group">
                                    {isUploading ? <><Loader2 className="animate-spin w-4 h-4" /> Uploading...</> : <>Upload Now <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                                </button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Hub Filters */}
            <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-primary transition-colors" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for files..."
                        className="w-full h-12 pl-12 pr-5 bg-[#080808] border border-white/5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.01] transition-all"
                    />
                </div>
                <div className="flex bg-[#080808] p-1.5 rounded-2xl border border-white/5 shadow-xl overflow-x-auto scrollbar-hide max-w-full">
                    {(['all', 'video', 'icon', 'owner', 'photos'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`h-9 px-6 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 min-w-max ${filter === f
                                ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assets Table */}
            <div className="bg-[#080808] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Resource</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Metadata</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Visibility</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Uploader</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Timestamp</th>
                                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {filteredAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-32 text-center">
                                            <Activity className="w-12 h-12 text-gray-800 mx-auto mb-4 animate-pulse" />
                                            <p className="text-gray-600 uppercase tracking-[0.4em] text-[10px] font-bold italic">No matches found in visual matrix</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssets.map((asset, i) => (
                                        <motion.tr
                                            key={asset.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group hover:bg-white/[0.01] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative group/thumb">
                                                        <div className="w-16 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors">
                                                            {asset.type === 'video' ? (
                                                                <div className="relative w-full h-full">
                                                                    <video src={asset.url} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                                        <Play className="w-3 h-3 text-white fill-white" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative w-full h-full">
                                                                    <Image src={asset.url} alt="" fill className="object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <a href={asset.url} target="_blank" className="absolute -top-1 -right-1 bg-black border border-white/10 p-1 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                            <ExternalLink className="w-2.5 h-2.5 text-primary" />
                                                        </a>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-serif text-base text-white group-hover:text-primary transition-colors">
                                                            {asset.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${asset.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                            <span className="text-[8px] font-bold uppercase tracking-widest italic">{asset.is_active ? 'Publicly Visible' : 'Hidden from Gallery'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-xl">
                                                    {typeIcon(asset.type)}
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{asset.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleToggleStatus(asset.id, !!asset.is_active)}
                                                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ${asset.is_active ? 'bg-primary' : 'bg-white/10'}`}
                                                >
                                                    <span className={`text-[7px] font-bold absolute ${asset.is_active ? 'left-2 text-black' : 'right-2 text-gray-500'}`}>
                                                        {asset.is_active ? 'ON' : 'OFF'}
                                                    </span>
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${asset.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                                                </button>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    <UserCircle className="w-3.5 h-3.5 text-primary/60" />
                                                    {asset.admins ? `${asset.admins.first_name}` : 'System Core'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(asset.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {/* Rename Tool */}
                                                    <Sheet>
                                                        <SheetTrigger
                                                            render={
                                                                <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                                                                    <PenSquare className="w-4 h-4" />
                                                                </button>
                                                            }
                                                        />
                                                        <SheetContent className="bg-[#050505] border-white/10 sm:max-w-md p-0 flex flex-col h-full overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                                            <SheetHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                                                                <SheetTitle className="text-xl font-serif text-white">Modify <span className="text-primary italic">Metadata</span></SheetTitle>
                                                            </SheetHeader>
                                                            <div className="flex-1 p-8 overflow-y-auto">
                                                                <form id={`edit-asset-${asset.id}`} onSubmit={async (e) => {
                                                                    e.preventDefault()
                                                                    const name = new FormData(e.currentTarget).get('editName') as string
                                                                    const res = await updateAsset(asset.id, name)
                                                                    if (res.error) {
                                                                        toast.error(res.error)
                                                                    } else {
                                                                        toast.success('Asset name updated')
                                                                        window.location.reload()
                                                                    }
                                                                }} className="space-y-6">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[9px] font-bold uppercase text-gray-500 ml-1">Asset Name</Label>
                                                                        <Input name="editName" defaultValue={asset.name} className="bg-white/[0.03] h-12 rounded-xl border-white/5 focus:border-primary/50 text-white text-sm" />
                                                                    </div>
                                                                </form>
                                                            </div>
                                                            <SheetFooter className="p-8 border-t border-white/5 mt-auto">
                                                                <button type="submit" form={`edit-asset-${asset.id}`}
                                                                    className="w-full bg-white text-black font-bold h-12 rounded-lg uppercase tracking-[0.2em] text-[10px] hover:bg-primary transition-all">
                                                                    Sync Changes
                                                                </button>
                                                            </SheetFooter>
                                                        </SheetContent>
                                                    </Sheet>

                                                    <Dialog>
                                                        <DialogTrigger
                                                            render={
                                                                <button className="w-9 h-9 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/50 hover:bg-red-500 hover:text-white transition-all duration-300">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            }
                                                        />
                                                        <DialogContent className="bg-[#080808] border-white/10 rounded-[40px] p-8">
                                                            <DialogHeader className="mb-6">
                                                                <DialogTitle className="font-serif text-3xl text-white tracking-tight">Are You Sure to <span className="text-red-500 italic">Delete?</span></DialogTitle>
                                                                <DialogDescription className="text-gray-500 mt-4 leading-relaxed font-light italic text-xs uppercase tracking-widest">
                                                                    Permanently erase &ldquo;{asset.name}&rdquo; from cloud vaults.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="gap-4">
                                                                <button className="flex-1 h-12 rounded-xl border border-white/10 text-gray-500 font-bold text-[9px] uppercase tracking-[0.3em] hover:bg-white/5 transition-all">
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const res = await deleteAsset(asset.id, asset.storage_path)
                                                                        if (res?.error) {
                                                                            toast.error(res.error)
                                                                        } else {
                                                                            toast.success('Asset deleted permanently')
                                                                            setAssets(prev => prev.filter(a => a.id !== asset.id))
                                                                        }
                                                                    }}
                                                                    className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold text-[9px] uppercase tracking-[0.3em] hover:bg-red-500 shadow-xl transition-all"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
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
