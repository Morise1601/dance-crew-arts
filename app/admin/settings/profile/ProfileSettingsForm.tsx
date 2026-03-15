'use client'

import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, ChevronRight, Upload, Phone, User, Fingerprint } from 'lucide-react'
import { updateAdmin } from '../../actions'

interface ProfileSettingsFormProps {
    profile: any
}

export default function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUpdating(true)
        setError(null)
        setSuccess(false)

        const formData = new FormData(e.currentTarget)
        const profileId = profile?.id

        if (!profileId) {
            setError("Profile data is missing. Please try logging in again.")
            setIsUpdating(false)
            return
        }

        // Ensure role is preserved
        formData.append('role', profile?.Role || profile?.role || 'member')

        const result = await updateAdmin(profileId, formData)

        if (result?.error) {
            setError(result.error)
            setIsUpdating(false)
        } else {
            setSuccess(true)
            setIsUpdating(false)
            setTimeout(() => setSuccess(false), 3000)
            window.location.reload()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Personnel Data</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">First Name</Label>
                    <Input name="firstName" defaultValue={profile?.first_name || ''} className="bg-white/[0.03] h-11 rounded-xl border-white/5 focus:border-primary/50 text-white text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Last Name</Label>
                    <Input name="lastName" defaultValue={profile?.last_name || ''} className="bg-white/[0.03] h-11 rounded-xl border-white/5 focus:border-primary/50 text-white text-xs" />
                </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Secure Access</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Phone Link</Label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                            <Input name="phone" defaultValue={profile?.phone || ''} className="pl-12 bg-white/[0.03] h-12 rounded-xl border-white/5 focus:border-primary/50 text-white text-xs" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Avatar Update</Label>
                        <div className="relative group">
                            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                            <Input name="avatar" type="file" accept="image/*" className="pl-12 bg-white/[0.03] h-12 rounded-xl border-white/5 focus:border-primary/50 text-[10px] text-white p-3" />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Profile Successfully Updated
                </div>
            )}

            <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-white text-black font-bold h-12 uppercase tracking-widest text-[10px] hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50 group shadow-lg"
            >
                {isUpdating ? (
                    <>
                        <Loader2 className="animate-spin w-4 h-4" /> Updating Record...
                    </>
                ) : (
                    <>
                        Apply Changes <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    )
}
