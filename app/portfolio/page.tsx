"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

export default function PortfolioPage() {
    const [filter, setFilter] = useState("All");

    const categories = ["All", "Events", "Competitions", "Classes"];
    const portfolioItems = [
        { title: "National Championship '26", category: "Competitions", type: "video" },
        { title: "Autumn Showcase", category: "Events", type: "photo" },
        { title: "Advanced Choreography", category: "Classes", type: "video" },
        { title: "Rhythm Festival", category: "Events", type: "photo" },
        { title: "Kids Winter Recital", category: "Classes", type: "photo" },
        { title: "Urban Dance Battle Finals", category: "Competitions", type: "photo" },
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="text-center mb-16">
                    <span className="text-secondary font-bold tracking-[0.3em] text-sm uppercase mb-4 block">Visual Archive</span>
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter drop-shadow-lg mb-6">
                        Our <span className="text-gradient">Portfolio</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
                        Explore the highlights from our premium performances, intensive classes, and competitive achievements.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-8 py-3 text-sm font-bold uppercase tracking-widest border transition-colors ${filter === cat
                                        ? "bg-primary text-black border-primary"
                                        : "border-white/20 text-white/70 hover:text-white hover:border-white/50"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {portfolioItems.filter(item => filter === "All" || item.category === filter).map((item, i) => (
                            <motion.div
                                key={item.title}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                className="group relative h-[300px] lg:h-[400px] overflow-hidden bg-[#111] border border-white/5 cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 mix-blend-color" />
                                <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

                                {/* Decorative Box matching theme */}
                                <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />

                                {item.type === "video" && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/90 text-black flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                                        <Play size={24} className="ml-1" />
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 p-8 z-20 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">{item.category}</div>
                                    <h3 className="text-2xl font-bold uppercase tracking-wide leading-tight">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
