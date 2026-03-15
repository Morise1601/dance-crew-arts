'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "@/app/admin/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await submitContactForm(formData);

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
        } else {
            setSuccess(true);
            setIsSubmitting(false);
            (e.target as HTMLFormElement).reset();
        }
    }

    return (
        <div className="relative w-full overflow-hidden bg-[#050505]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#050505] blur-[100px] pointer-events-none mix-blend-multiply" />

            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center justify-center text-center min-h-[400px] md:min-h-[500px]"
                    >
                        <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 rounded-full border-t border-primary animate-spin-slow" />
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Transmission <br /><span className="text-primary italic font-serif">Successful.</span></h2>
                        <p className="text-gray-400 font-light max-w-sm mb-12 text-sm md:text-base">We have received your coordinates. Our operatives will connect with you shortly.</p>
                        
                        <Button 
                            variant="outline" 
                            className="w-full max-w-xs border-white/10 text-white hover:bg-white hover:text-black h-14 uppercase tracking-[0.2em] font-bold text-[10px] transition-all duration-500"
                            onClick={() => setSuccess(false)}
                        >
                            Initiate New Signal
                        </Button>
                    </motion.div>
                ) : (
                    <motion.form 
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        onSubmit={handleSubmit} 
                        className="relative z-10 space-y-10"
                    >
                        <div className="space-y-2 mb-12">
                            <h3 className="text-2xl font-serif italic text-white/50">Send a</h3>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">Transmission.</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            <div className="relative group">
                                <Input 
                                    id="firstName" 
                                    name="firstName" 
                                    placeholder=" " 
                                    required 
                                    className="peer bg-transparent border-0 border-b border-white/20 rounded-none h-12 text-lg text-white font-light focus:ring-0 focus:border-primary px-0 transition-colors placeholder:text-transparent focus:placeholder:text-transparent" 
                                />
                                <Label 
                                    htmlFor="firstName" 
                                    className="absolute left-0 top-3 text-gray-500 text-xs font-bold uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-primary peer-valid:-top-4 peer-valid:text-[9px]"
                                >
                                    First Name
                                </Label>
                            </div>

                            <div className="relative group">
                                <Input 
                                    id="lastName" 
                                    name="lastName" 
                                    placeholder=" " 
                                    required 
                                    className="peer bg-transparent border-0 border-b border-white/20 rounded-none h-12 text-lg text-white font-light focus:ring-0 focus:border-primary px-0 transition-colors placeholder:text-transparent focus:placeholder:text-transparent" 
                                />
                                <Label 
                                    htmlFor="lastName" 
                                    className="absolute left-0 top-3 text-gray-500 text-xs font-bold uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-primary peer-valid:-top-4 peer-valid:text-[9px]"
                                >
                                    Last Name
                                </Label>
                            </div>
                        </div>

                        <div className="relative group">
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder=" " 
                                required 
                                className="peer bg-transparent border-0 border-b border-white/20 rounded-none h-12 text-lg text-white font-light focus:ring-0 focus:border-primary px-0 transition-colors placeholder:text-transparent focus:placeholder:text-transparent" 
                            />
                            <Label 
                                htmlFor="email" 
                                className="absolute left-0 top-3 text-gray-500 text-xs font-bold uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-primary peer-valid:-top-4 peer-valid:text-[9px]"
                            >
                                Electronic Mail Address
                            </Label>
                        </div>

                        <div className="relative group pt-6">
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={1}
                                className="peer w-full bg-transparent border-0 border-b border-white/20 rounded-none resize-none text-lg text-white font-light focus:ring-0 focus:outline-none focus:border-primary px-0 py-2 transition-all min-h-[40px] placeholder:text-transparent focus:placeholder:text-transparent"
                                placeholder=" "
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            ></textarea>
                            <Label 
                                htmlFor="message" 
                                className="absolute left-0 top-8 text-gray-500 text-xs font-bold uppercase tracking-widest transition-all peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-primary peer-valid:top-0 peer-valid:text-[9px]"
                            >
                                Your Message Payload
                            </Label>
                        </div>
                        
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] bg-red-500/10 p-4 border-l-2 border-red-500"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="pt-8 flex justify-end">
                            <Button 
                                disabled={isSubmitting}
                                type="submit" 
                                className="group relative w-full md:w-auto bg-white text-black hover:bg-primary hover:text-black font-black uppercase tracking-[0.3em] text-[10px] h-14 px-12 transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(227,157,28,0.3)]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isSubmitting ? 'Transmitting...' : 'Dispatch Signal'}
                                    <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                </span>
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
