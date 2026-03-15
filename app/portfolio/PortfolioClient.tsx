"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Film, Calendar, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface PortfolioAsset {
    id: string;
    name: string;
    url: string;
    type: string;
    created_at: string;
    is_active: boolean;
}

export default function PortfolioClient({ initialAssets }: { initialAssets: PortfolioAsset[] }) {
    const [assets, setAssets] = useState<PortfolioAsset[]>(initialAssets);
    const [filter, setFilter] = useState("All");
    const [activeAsset, setActiveAsset] = useState<PortfolioAsset | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('portfolio-realtime-v3')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'portfolio_assets'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newAsset = payload.new as PortfolioAsset;
                        if (newAsset.is_active && (newAsset.type === 'video' || newAsset.type === 'photos')) {
                            setAssets(prev => [newAsset, ...prev]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedAsset = payload.new as PortfolioAsset;
                        setAssets(prev => {
                            const exists = prev.find(v => v.id === updatedAsset.id);
                            if (exists) {
                                if (!updatedAsset.is_active) {
                                    return prev.filter(v => v.id !== updatedAsset.id);
                                }
                                return prev.map(v => v.id === updatedAsset.id ? updatedAsset : v);
                            } else {
                                if (updatedAsset.is_active && (updatedAsset.type === 'video' || updatedAsset.type === 'photos')) {
                                    return [updatedAsset, ...prev].sort((a, b) =>
                                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                                    );
                                }
                                return prev;
                            }
                        });
                    } else if (payload.eventType === 'DELETE') {
                        const oldId = (payload.old as { id: string }).id;
                        setAssets(prev => prev.filter(v => v.id !== oldId));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const categories = ["All", "Videos", "Photos", "Recent"];

    const filteredItems = assets.filter(item => {
        if (filter === "All") return true;
        if (filter === "Videos") return item.type === "video";
        if (filter === "Photos") return item.type === "photos";
        return true; // Recent is just default All for now
    });

    return (
        <div className="bg-[#020202] text-white min-h-screen pt-24 pb-16 selection:bg-primary/20 relative overflow-hidden">
            {/* Cinematic Ambience */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* Page Header */}
            <div className="border-b border-white/5 pb-10 mb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(227,157,28,0.8)]" />
                                <span className="text-primary font-bold tracking-[0.3em] text-[9px] uppercase">Archive MXXVI</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight">
                                Visual{" "}
                                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">Archive.</span>
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-wrap gap-2"
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-md transition-all duration-500 ${filter === cat
                                        ? "bg-primary text-black shadow-[0_0_20px_rgba(227,157,28,0.3)]"
                                        : "bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">

                {/* Attractive Uniform Gallery Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full py-32 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
                                <Film className="w-12 h-12 text-white/20 mx-auto mb-6" />
                                <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold">
                                    No Visual Data Available
                                </p>
                            </div>
                        ) : (
                            filteredItems.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6, delay: (i % 4) * 0.1 }}
                                    className="group relative bg-[#080808] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/5 aspect-square lg:aspect-[4/5]"
                                    onClick={() => setActiveAsset(item)}
                                >
                                    <div className="absolute inset-0 z-0">
                                        {item.type === 'video' ? (
                                            <video
                                                src={item.url}
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                                muted
                                                playsInline
                                                loop
                                                onMouseOver={(e) => e.currentTarget.play()}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.pause();
                                                }}
                                            />
                                        ) : (
                                            <Image
                                                src={item.url}
                                                alt={item.name}
                                                fill
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                            />
                                        )}
                                        {/* Advanced Overlay Gradients */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                                        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>

                                    {/* Minimalist Play Indicator in Center */}
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100">
                                        <div className="w-20 h-20 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center">
                                            {item.type === 'video' ? <Play className="w-8 h-8 text-white fill-white ml-1" /> : <ImageIcon className="w-8 h-8 text-white" />}
                                        </div>
                                    </div>

                                    {/* Typography & Context overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center gap-3 mb-3 text-[9px] font-bold uppercase tracking-widest text-primary/80">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            <span className="w-1 h-1 bg-white/30 rounded-full mx-1" />
                                            <span className="text-white/50">HQ File</span>
                                        </div>
                                        <h3 className="text-lg md:text-2xl font-bold uppercase tracking-tight text-white leading-none">
                                            {item.name}
                                        </h3>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Cinematic Modal Player */}
            <AnimatePresence>
                {activeAsset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-12"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-7xl shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="absolute -top-16 left-0 right-0 flex justify-between items-end">
                                <div>
                                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Currently Viewing</p>
                                    <h2 className="text-xl md:text-2xl font-bold uppercase text-white tracking-widest">{activeAsset.name}</h2>
                                </div>
                                <button
                                    onClick={() => setActiveAsset(null)}
                                    className="group w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:border-primary hover:text-black transition-all duration-300"
                                >
                                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            <div className={`w-full rounded-2xl overflow-hidden border border-white/10 bg-black relative ${activeAsset.type === 'video' ? 'aspect-video' : 'max-h-[80vh] flex items-center justify-center'}`}>
                                {activeAsset.type === 'video' ? (
                                    <video
                                        src={activeAsset.url}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        controlsList="nodownload"
                                    />
                                ) : (
                                    <div className="relative w-full h-[80vh]">
                                        <Image
                                            src={activeAsset.url}
                                            alt={activeAsset.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 -z-10 cursor-pointer"
                            onClick={() => setActiveAsset(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
