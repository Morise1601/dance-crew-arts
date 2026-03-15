"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Instagram, ArrowUpRight, Play, Info, ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CrewMember {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    Role: string;
    avatar_url: string | null;
    is_active: boolean;
}

interface HomeClientProps {
    founderImg?: string | null;
    members: CrewMember[];
}

export default function HomeClient({ founderImg, members: initialMembers }: HomeClientProps) {
    const [members, setMembers] = useState(initialMembers);
    const { scrollY } = useScroll();
    const containerRef = useRef<HTMLDivElement>(null);

    // Hero Parallax
    const yHero = useTransform(scrollY, [0, 800], [0, 200]);
    const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);
    const scaleHero = useTransform(scrollY, [0, 600], [1, 1.08]);

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('public_admins_realtime_v3')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'admins' },
                (payload) => {
                    const eventType = payload.eventType;
                    if (eventType === 'INSERT') {
                        const newPayload = payload.new as CrewMember;
                        if (newPayload.Role === 'member' && newPayload.is_active) {
                            setMembers(prev => [newPayload, ...prev]);
                        }
                    } else if (eventType === 'UPDATE') {
                        const newPayload = payload.new as CrewMember;
                        if (newPayload.Role === 'member' && newPayload.is_active) {
                            setMembers(prev => {
                                const exists = prev.some(m => m.id === newPayload.id);
                                if (exists) {
                                    return prev.map(m => m.id === newPayload.id ? newPayload : m);
                                } else {
                                    return [newPayload, ...prev].sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
                                }
                            });
                        } else {
                            setMembers(prev => prev.filter(m => m.id !== newPayload.id));
                        }
                    } else if (eventType === 'DELETE') {
                        const oldPayload = payload.old as { id: string };
                        setMembers(prev => prev.filter(m => m.id !== oldPayload.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col min-h-screen bg-[#020202] text-white selection:bg-primary/30 selection:text-white overflow-hidden">

            {/* ─── HERO BANNER ─── */}
            <section className="relative w-full h-screen min-h-[600px] flex items-center overflow-hidden">
                {/* Parallax background */}
                <motion.div
                    style={{ y: yHero, scale: scaleHero }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src="https://rolytezucilbvtcbrjbx.supabase.co/storage/v1/object/public/Others/Banner.png"
                        alt="D'Art Crew Hero"
                        fill
                        className="object-contain object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020202]/60 via-transparent to-transparent" />
                </motion.div>

                {/* Decorative accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent z-10" />

                {/* Hero Content */}
                <motion.div
                    style={{ opacity: opacityHero }}
                    className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl w-full"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
                    >
                        {/* Left: Brand + Heading */}
                        <div className="max-w-xl">
                            {/* Badge */}
                            {/* <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.15 }}
                                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-5"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(227,157,28,0.8)]" />
                                <span className="text-primary font-bold tracking-[0.35em] text-[10px] uppercase">Rhythmic Elite Academy</span>
                            </motion.div> */}

                            {/* Main Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, delay: 0.25 }}
                                className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-[1.05] mb-4"
                            >
                                D ART{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-primary/70">
                                    CREW
                                </span>
                                <br />
                                <span className="text-white/60 italic font-light text-2xl md:text-3xl">Dance • Artistic • Rhythm • Technique</span>
                            </motion.h1>

                            {/* Sub line */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-sm text-gray-400 font-light leading-relaxed border-l-2 border-primary/40 pl-4 max-w-md"
                            >
                                Where Passion Meets Performance
                            </motion.p>
                        </div>

                        {/* Right: CTA Buttons */}
                        {/* <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-col sm:flex-row lg:flex-col gap-3 items-start lg:items-end"
                        >
                            <Link href="/booking">
                                <Button className="relative group overflow-hidden bg-primary hover:bg-white text-black px-7 h-11 text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_0_20px_rgba(227,157,28,0.25)]">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Book a Class <ArrowUpRight className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" />
                                    </span>
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" className="group bg-transparent border-white/15 text-white hover:border-primary hover:bg-primary/8 px-7 h-11 text-xs font-black uppercase tracking-[0.2em] transition-all duration-500">
                                    Discover Us
                                </Button>
                            </Link>
                        </motion.div> */}
                    </motion.div>

                    {/* Stats bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.65 }}
                        className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
                    >
                        {[
                            { value: "500+", label: "Students Trained" },
                            { value: "100+", label: "Choreographies" },
                            { value: "5+", label: "Years of Experience" },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-lg font-bold text-primary">{stat.value}</span>
                                <span className="text-[11px] text-white uppercase tracking-wider">{stat.label}</span>
                                {i < 2 && <span className="hidden sm:block w-px h-5 bg-white/10 ml-1" />}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ─── MANIFESTO / ABOUT PREVIEW ─── */}
            <section className="py-20 bg-[#020202] relative z-20">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
                        {/* Image */}
                        <div className="lg:col-span-5 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-primary/15 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-700" />
                                <Image
                                    src={founderImg || "/dance_studio_about.png"}
                                    alt="Founder Visionary"
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.8s]"
                                />
                                <div className="absolute bottom-5 left-5 z-20">
                                    <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-3.5 flex items-center gap-3 group-hover:border-primary/40 transition-colors duration-500">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Anto Reny</p>
                                            <p className="text-[9px] text-gray-400 mt-0.5">Founder</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            {/* Decorative border */}
                            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border border-primary/15 rounded-2xl" />
                        </div>

                        {/* Text */}
                        <div className="lg:col-span-7 space-y-8 lg:pl-6">
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.8, delay: 0.15 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-[1px] bg-primary" />
                                    <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">The Philosophy</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight">
                                    About the{" "}
                                    <span className="text-white/30 italic font-serif">Founder.</span>
                                </h2>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="space-y-5 text-gray-400 text-sm leading-relaxed font-light"
                            >
                                <p>
                                    Anto Reny is the founder and choreographer of D Art Crew Dance Academy. With a deep passion for dance and stage performance, he has been training students and creating energetic choreographies for school annual days, cultural programs, and stage shows.
                                    He specializes in Hip Hop, Freestyle, Folk, and Stage Choreography, focusing on helping students build confidence, rhythm, and strong stage presence. Through D Art Crew, his mission is to inspire young dancers to express themselves through movement and perform with passion.
                                </p>

                                <Link href="/about" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-primary transition-colors group">
                                    Learn More About Us
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── THE CREW ─── */}
            <section className="py-20 bg-black relative overflow-hidden border-t border-white/5">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#020202] to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-3 block">The Syndicate</span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-white tracking-tight leading-none">
                                Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Roster</span>
                            </h2>
                        </div>
                        <Link href="/about" className="group flex items-center gap-2.5 w-fit">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">View All Members</span>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-black transition-all">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                        </Link>
                    </div>

                    {members.length === 0 ? (
                        <div className="w-full py-24 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
                            <Info className="w-7 h-7 text-white/20 mx-auto mb-4" />
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">No personnel currently deployed</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            <AnimatePresence mode="popLayout">
                                {members.map((member, i) => (
                                    <motion.div
                                        key={member.id}
                                        layout
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-40px" }}
                                        transition={{ duration: 0.6, delay: i * 0.08 }}
                                        className="group relative rounded-xl overflow-hidden bg-[#050505] border border-white/5 aspect-[3/4]"
                                    >
                                        <Image
                                            src={member.avatar_url || "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1974&auto=format&fit=crop"}
                                            alt={member.first_name}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.2s]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                                        <div className="absolute inset-x-0 bottom-0 p-5 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-0.5">{member.first_name}</h3>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">{member.Role}</p>
                                                </div>
                                                <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:scale-110 transition-all">
                                                    <Instagram size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── IMMERSIVE CTA ─── */}
            <section className="py-20 relative bg-[#020202] overflow-hidden border-t border-white/5">
                <div className="absolute inset-0 z-0 opacity-15">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/40 blur-[130px] rounded-full mix-blend-screen" />
                </div>

                <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 mb-6">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Start Your Journey</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6 leading-tight">
                            Enter The{" "}
                            <span className="font-serif italic text-primary">Sequence.</span>
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                            Secure your spot in an upcoming session and begin your transformation with D&apos;Art Crew today.
                        </p>
                        <Link href="/booking">
                            <Button className="bg-white text-black hover:bg-primary hover:text-black px-10 h-12 text-xs font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_rgba(227,157,28,0.35)]">
                                Initiate Booking
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
