'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, ChevronRight, Upload, Image as ImageIcon, User, Info, FileWarning, Mail, Phone, MapPin, Plus, Trash2 } from 'lucide-react'
import { getAppSettings, updateAppSettings } from '../../actions'
import ImageCropModal from './ImageCropModal'
import { cn } from '@/lib/utils'

interface AppSettingsFormProps {
    initialSettings: any
}

export default function AppSettingsForm({ initialSettings }: AppSettingsFormProps) {
    const [appSettings, setAppSettings] = useState(initialSettings)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [previews, setPreviews] = useState<{ [key: string]: string }>({})
    const [croppedFiles, setCroppedFiles] = useState<{ [key: string]: File | Blob }>({})

    // Dynamic list states
    const [emailInputs, setEmailInputs] = useState<string[]>(initialSettings?.founder_email || [''])
    const [contactInputs, setContactInputs] = useState<string[]>(initialSettings?.founder_contact || [''])
    const [address, setAddress] = useState(initialSettings?.founder_address || '')

    useEffect(() => {
        async function fetchSettings() {
            setIsSyncing(true)
            try {
                const { data, error: fetchError } = await getAppSettings()
                if (fetchError) {
                    setError(fetchError)
                } else {
                    setAppSettings(data)
                    if (data) {
                        setEmailInputs(data.founder_email?.length ? data.founder_email : [''])
                        setContactInputs(data.founder_contact?.length ? data.founder_contact : [''])
                        setAddress(data.founder_address || '')
                    }
                }
            } catch (err: any) {
                setError("Failed to synchronize settings.")
            } finally {
                setIsSyncing(false)
            }
        }
        fetchSettings()
    }, [])
    // Crop state
    const [cropModal, setCropModal] = useState<{
        open: boolean;
        image: string | null;
        fieldName: string;
        aspect: number;
    }>({
        open: false,
        image: null,
        fieldName: '',
        aspect: 1
    })

    const validateFile = (file: File, maxSizeMB: number, allowedTypes: string[]) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
            throw new Error(`File size exceeds ${maxSizeMB}MB limit.`)
        }
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const file = e.target.files?.[0]

        if (file) {
            try {
                setError(null)
                const config = name === 'logo'
                    ? { size: 2, types: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'], aspect: 1 }
                    : { size: 5, types: ['image/png', 'image/jpeg', 'image/webp'], aspect: 1 }

                validateFile(file, config.size, config.types)

                const url = URL.createObjectURL(file)
                setCropModal({
                    open: true,
                    image: url,
                    fieldName: name,
                    aspect: config.aspect
                })
            } catch (err: any) {
                setError(err.message)
                e.target.value = '' // Reset input
            }
        }
    }

    const onCropComplete = (blob: Blob) => {
        const fieldName = cropModal.fieldName
        const previewUrl = URL.createObjectURL(blob)

        setPreviews(prev => ({ ...prev, [fieldName]: previewUrl }))
        setCroppedFiles(prev => ({ ...prev, [fieldName]: blob }))
    }

    const validateEmails = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailInputs.every(email => !email || emailRegex.test(email))
    }

    const validateContacts = () => {
        // Simple 10 digit check as requested
        const contactRegex = /^\d{10}$/
        return contactInputs.every(contact => !contact || contactRegex.test(contact))
    }

    const formatContact = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 10)
        return cleaned
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateEmails()) {
            setError("One or more email addresses are invalid.")
            return
        }
        if (!validateContacts()) {
            setError("Phone numbers must be exactly 10 digits.")
            return
        }

        setIsUpdating(true)
        setError(null)
        setSuccess(false)

        try {
            const formData = new FormData(e.currentTarget)

            // Dynamic fields are automatically in formData if they have the same name, 
            // but we ensure they are clean.
            formData.delete('founder_email')
            formData.delete('founder_contact')
            emailInputs.filter(e => e.trim()).forEach(email => formData.append('founder_email', email))
            contactInputs.filter(c => c.trim()).forEach(contact => formData.append('founder_contact', contact))

            // Override with cropped files
            Object.entries(croppedFiles).forEach(([name, blob]) => {
                const extension = blob.type.split('/')[1] || 'jpg'
                formData.set(name, blob, `${name}_cropped.${extension}`)
            })

            const result = await updateAppSettings(formData)

            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                setCroppedFiles({}) // Clear pending crops

                // Refresh local state
                const { data } = await getAppSettings()
                if (data) {
                    setAppSettings(data)
                    setEmailInputs(data.founder_email?.length ? data.founder_email : [''])
                    setContactInputs(data.founder_contact?.length ? data.founder_contact : [''])
                    setAddress(data.founder_address || '')
                }

                setTimeout(() => setSuccess(false), 3000)
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 relative">
            {isSyncing && (
                <div className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm z-20">
                    <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-primary">System Syncing...</span>
                </div>
            )}

            {/* Logo Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Branding Identity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    <div className="space-y-4">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Application Logo</Label>
                        <div className="aspect-square w-full max-w-[200px] bg-white/[0.02] border border-dashed border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group">
                            {(previews.logo || appSettings?.logo_url) ? (
                                <img src={previews.logo || appSettings.logo_url} alt="Logo" className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-white/10" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-center">
                                    <Upload className="w-5 h-5 text-primary mx-auto mb-1" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Click to Change</span>
                                </div>
                            </div>
                            <input name="logo" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Application Logo" />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02] border border-white/5">
                                <Info className="w-2.5 h-2.5 text-primary/60" />
                                <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tighter">1:1 Ratio</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02] border border-white/5">
                                <ImageIcon className="w-2.5 h-2.5 text-primary/60" />
                                <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tighter">Max 2MB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Founders Section */}
            <div className="space-y-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Leadership Visuals</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Founder */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Founder Identity</Label>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="aspect-square w-full max-w-[160px] bg-white/[0.02] border border-dashed border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group shrink-0">
                                {(previews.founder || appSettings?.founder_img) ? (
                                    <img src={previews.founder || appSettings.founder_img} alt="Founder" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <User className="w-8 h-8 text-white/10" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-center">
                                        <Upload className="w-5 h-5 text-primary mx-auto mb-1" />
                                        <span className="text-[8px] font-bold text-white uppercase tracking-widest">Update</span>
                                    </div>
                                </div>
                                <input name="founder" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Founder Image" />
                            </div>

                            <div className="flex-1 space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", previews.founder ? "bg-primary animate-pulse" : "bg-gray-600")} />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                                        {previews.founder ? 'Ready to Sync' : 'Currently Active'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Info className="w-2.5 h-2.5 text-primary/60" />
                                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tighter">1:1 • max 5mb</span>
                                </div>
                                <p className="text-[8px] text-gray-600 italic leading-relaxed">This visual represents the primary founder on the public discovery pages.</p>
                            </div>
                        </div>
                    </div>

                    {/* Co-Founder */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Co-Founder Identity</Label>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="aspect-square w-full max-w-[160px] bg-white/[0.02] border border-dashed border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group shrink-0">
                                {(previews.coFounder || appSettings?.co_founder_img) ? (
                                    <img src={previews.coFounder || appSettings.co_founder_img} alt="Co-Founder" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <User className="w-8 h-8 text-white/10" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-center">
                                        <Upload className="w-5 h-5 text-primary mx-auto mb-1" />
                                        <span className="text-[8px] font-bold text-white uppercase tracking-widest">Update</span>
                                    </div>
                                </div>
                                <input name="coFounder" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Co-Founder Image" />
                            </div>

                            <div className="flex-1 space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", previews.coFounder ? "bg-primary animate-pulse" : "bg-gray-600")} />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                                        {previews.coFounder ? 'Ready to Sync' : 'Currently Active'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Info className="w-2.5 h-2.5 text-primary/60" />
                                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tighter">1:1 • max 5mb</span>
                                </div>
                                <p className="text-[8px] text-gray-600 italic leading-relaxed">Secondary leadership visual for team sections.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Discovery Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {/* Address */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Foundation Address</Label>
                        <div className="relative group max-w-2xl">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <Input
                                name="founder_address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="HQ - Studio Address"
                                className="bg-white/[0.02] border-white/10 pl-12 h-12 rounded-xl text-[11px] focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Emails */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between ml-1">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Official Emails</Label>
                                <button
                                    type="button"
                                    onClick={() => setEmailInputs([...emailInputs, ''])}
                                    className="p-1 hover:bg-primary/10 rounded-md transition-colors text-primary"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {emailInputs.map((email, idx) => (
                                    <div key={idx} className="flex gap-2 group">
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                value={email}
                                                onChange={(e) => {
                                                    const newEmails = [...emailInputs]
                                                    newEmails[idx] = e.target.value
                                                    setEmailInputs(newEmails)
                                                }}
                                                placeholder="official@dancecrew.com"
                                                className="bg-white/[0.02] border-white/10 pl-11 h-11 rounded-xl text-[10px] focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        {emailInputs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setEmailInputs(emailInputs.filter((_, i) => i !== idx))}
                                                className="p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contacts */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between ml-1">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Public Contacts</Label>
                                <button
                                    type="button"
                                    onClick={() => setContactInputs([...contactInputs, ''])}
                                    className="p-1 hover:bg-primary/10 rounded-md transition-colors text-primary"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {contactInputs.map((contact, idx) => (
                                    <div key={idx} className="flex gap-2 group">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                                <Phone className="w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <span className="text-[9px] font-bold text-gray-600">+91</span>
                                            </div>
                                            <Input
                                                value={contact}
                                                maxLength={10}
                                                onChange={(e) => {
                                                    const newContacts = [...contactInputs]
                                                    newContacts[idx] = formatContact(e.target.value)
                                                    setContactInputs(newContacts)
                                                }}
                                                placeholder="98765 43210"
                                                className="bg-white/[0.02] border-white/10 pl-16 h-11 rounded-xl text-[10px] focus:ring-primary/20 transition-all tracking-[0.1em]"
                                            />
                                        </div>
                                        {contactInputs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setContactInputs(contactInputs.filter((_, i) => i !== idx))}
                                                className="p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[8px] text-gray-600 italic ml-1">Auto-formatted to Indian Mobile standard (10 digits).</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                    <FileWarning className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Settings Synchronized Successfully
                </div>
            )}

            <button
                type="submit"
                disabled={isUpdating}
                className={cn(
                    "w-full lg:w-max min-w-[200px] text-black font-bold h-12 px-10 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 group shadow-lg",
                    Object.keys(croppedFiles).length > 0
                        ? "bg-primary hover:bg-white"
                        : "bg-white hover:bg-primary",
                    isUpdating && "opacity-50 cursor-not-allowed"
                )}
            >
                {isUpdating ? (
                    <>
                        <Loader2 className="animate-spin w-4 h-4" /> Updating System...
                    </>
                ) : (
                    <>
                        {Object.keys(croppedFiles).length > 0 ? "Save Cropped Changes" : "Update Settings"}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <ImageCropModal
                isOpen={cropModal.open}
                image={cropModal.image}
                title={`Crop ${cropModal.fieldName.charAt(0).toUpperCase() + cropModal.fieldName.slice(1)}`}
                aspectRatio={cropModal.aspect}
                onClose={() => setCropModal(prev => ({ ...prev, open: false }))}
                onCropComplete={onCropComplete}
            />
        </form>
    )
}
