'use client'

import React, { useState } from 'react'
import { login } from '../actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail, LogIn, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Logo from '@/public/D_arts_crew.png'

export function AuthForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex relative overflow-hidden bg-[#050505]">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E39D1C]/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A42018]/15 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#E39D1C]/10 rounded-full blur-[100px] animate-pulse [animation-delay:4s]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            {/* Left Branding Panel */}
            <div className="hidden lg:flex flex-col justify-between w-[40%] p-12 relative z-10 border-r border-white/5">
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="bg-white rounded-full p-1.5 shadow-[0_0_15px_rgba(227,157,28,0.2)]">
                        <Image src={Logo} alt="Dance Arts Crew Logo" width={40} height={40} className="object-contain" />
                    </div>
                    <span className="font-serif text-xl tracking-tighter text-white">Dance <span className="text-primary italic">Arts</span> Crew</span>
                </motion.div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-primary font-bold text-[9px] tracking-[0.4em] uppercase mb-3 block opacity-70">Administrator Portal</span>
                        <h1 className="font-serif text-5xl xl:text-6xl leading-[0.95] tracking-tighter text-white">
                            Studio<br />
                            <span className="text-primary italic">Admin</span><br />
                            Portal
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 text-sm leading-relaxed max-w-[280px] font-light italic"
                    >
                        Manage your studio artists, portfolio, and website content in one place.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-8"
                    >
                        {[
                            { value: '3', label: 'Systems' },
                            { value: 'PRO', label: 'Access' },
                            { value: 'SEC', label: 'Lock' },
                        ].map((stat) => (
                            <div key={stat.label} className="relative group">
                                <div className="text-xl font-serif text-white group-hover:text-primary transition-colors cursor-default">{stat.value}</div>
                                <div className="text-[8px] uppercase tracking-[0.2em] text-gray-600 font-bold border-t border-white/10 pt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="flex items-center gap-2 text-[8px] text-gray-700 uppercase tracking-[0.25em]">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    © 2026 Dance Arts Crew
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[360px]"
                >
                    {/* Mobile Branding */}
                    <div className="flex flex-col items-center gap-3 mb-10 lg:hidden">
                        <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <Image src={Logo} alt="Dance Arts Crew Logo" width={50} height={50} />
                        </div>
                        <h2 className="font-serif text-xl text-white">Dance <span className="text-primary italic">Arts</span> Crew</h2>
                    </div>

                    <div className="mb-6 text-center lg:text-left">
                        <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                            <h2 className="font-serif text-2xl text-white tracking-tight">Admin <span className="text-primary italic">Login</span></h2>
                        </div>
                        <p className="text-gray-500 text-xs font-light">
                            Please enter your details to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-gray-600 ml-1">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-700 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="yourname@gmail.com"
                                    required
                                    className="pl-9 h-10 bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] rounded-lg transition-all text-xs text-white placeholder:text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-gray-600 ml-1">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-700 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    className="pl-9 pr-9 h-10 bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] rounded-lg transition-all text-xs text-white placeholder:text-gray-800 tracking-widest"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-primary text-[9px] font-bold bg-primary/5 p-3 rounded-lg border border-primary/20 flex items-center gap-2 uppercase tracking-wider"
                                >
                                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full h-11 bg-white text-black font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all duration-300 hover:bg-primary active:scale-[0.98] overflow-hidden disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                                        <span>Login to Dashboard</span>
                                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <p className="text-center text-[8px] text-gray-700 uppercase tracking-[0.3em] font-bold mt-10">
                        Secure Authentication Pipeline
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
