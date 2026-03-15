"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Target, Flame, Quote } from "lucide-react";

interface AboutClientProps {
    founderImg?: string | null;
    coFounderImg?: string | null;
}

export default function AboutClient({ founderImg, coFounderImg }: AboutClientProps) {
    return (
        <div className="bg-black min-h-screen text-white pt-20 pb-16 selection:bg-primary selection:text-black">

            {/* Page Header */}
            <section className="relative py-14 bg-[#050505] border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-10 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                </div>
                <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
                    <span className="text-primary font-bold tracking-[0.4em] text-[10px] uppercase mb-3 block">Academy Genesis</span>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight mb-2">
                        The <span className="text-gradient">Vision</span> Paradigm
                    </h1>
                    <p className="text-gray-500 text-sm italic mt-2 max-w-xl">Who we are, where we come from, and why we dance.</p>
                </div>
            </section>

            {/* Story Content - Founder */}
            <section className="py-16 border-b border-white/5">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative h-[460px] w-full rounded-2xl overflow-hidden border border-white/10"
                        >
                            <Image
                                src={founderImg || "/dance_studio_about.png"}
                                alt="Founder"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute bottom-5 left-5 bg-primary text-black px-5 py-2.5 rounded-lg shadow-xl">
                                <h4 className="font-bold text-xs uppercase tracking-widest">Est. 2012</h4>
                            </div>
                        </motion.div>

                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2">
                                <div className="w-6 h-[1px] bg-primary" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Chief Visionary</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                                Built for <span className="text-secondary italic">Greatness.</span>
                            </h2>
                            <div className="space-y-3 text-gray-400 text-sm leading-relaxed max-w-lg">
                                <p>
                                    What started as a basement crew has evolved into a powerhouse. We believe dance is movement made fire.
                                </p>
                                <p>
                                    We don&apos;t just teach choreography; we instill discipline and raw artistry. We&apos;ve trained champions and creators who seek their own rhythm.
                                </p>
                            </div>

                            <div className="pt-5 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center hover:border-primary/20 transition-colors">
                                    <div className="text-2xl font-bold text-primary">50+</div>
                                    <div className="text-[8px] uppercase tracking-widest font-black text-gray-500 mt-1">Awards</div>
                                </div>
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center hover:border-primary/20 transition-colors">
                                    <div className="text-2xl font-bold text-primary">10k+</div>
                                    <div className="text-[8px] uppercase tracking-widest font-black text-gray-500 mt-1">Artists</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Co-Founder Section */}
            <section className="py-16 bg-[#050505] relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1 space-y-5"
                        >
                            <div className="inline-flex items-center gap-2">
                                <div className="w-6 h-[1px] bg-secondary" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary">Creative Directrix</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                                The Mastermind of <span className="text-primary italic">Detail</span>
                            </h2>

                            <div className="relative p-6 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                                <Quote className="absolute -top-3 -left-3 w-14 h-14 text-white/5" />
                                <p className="text-sm md:text-base font-serif italic text-white/70 leading-relaxed mb-3">
                                    &quot;Movement is our language. We become the symphony. Every isolation is a story waiting to be told.&quot;
                                </p>
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-secondary">Leadership Protocol</span>
                            </div>

                            <p className="text-gray-500 text-xs leading-relaxed max-w-md italic">
                                Fusing classical precision with street innovation.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2 relative"
                        >
                            <div className="aspect-[4/5] relative rounded-3xl overflow-hidden border border-white/10 group">
                                <Image
                                    src={coFounderImg || "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1974&auto=format&fit=crop"}
                                    alt="Co-Founder"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="py-16 bg-black">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="mb-10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-3 block">Our Foundation</span>
                        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                            Core <span className="text-primary italic">Philosophy</span>
                        </h2>
                        <p className="text-gray-500 text-xs italic tracking-wide mt-2">Bridging street rawness with studio precision.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: Target, title: "Precision", desc: "Body control isolation." },
                            { icon: Flame, title: "Intensity", desc: "Explosive physical energy." },
                            { icon: Award, title: "Artistry", desc: "Storytelling through flow." }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#050505] border border-white/5 p-7 rounded-2xl hover:border-primary/30 transition-all group">
                                <item.icon className="w-7 h-7 text-primary mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-sm font-black uppercase tracking-widest mb-2">{item.title}</h3>
                                <p className="text-xs text-gray-500 italic">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
