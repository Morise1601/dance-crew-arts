"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Target, Flame } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-20">

            {/* Header */}
            <section className="relative py-20 bg-[#050505] border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 blur-[100px] rounded-full" />
                </div>
                <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-5xl text-center">
                    <span className="text-primary font-bold tracking-[0.3em] text-sm uppercase mb-4 block">Our Story</span>
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter drop-shadow-lg">
                        The <span className="text-gradient">Vision</span> Behind The Movement
                    </h1>
                </div>
            </section>

            {/* Story Content */}
            <section className="py-24">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative h-[700px] w-full border border-white/10 p-2"
                        >
                            <div className="relative h-full w-full bg-zinc-900 overflow-hidden">
                                <Image
                                    src="/dance_studio_about.png"
                                    alt="Academy Training"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>

                            <div className="absolute top-10 -right-10 bg-primary text-black p-8 shadow-2xl z-20 max-w-xs hidden md:block">
                                <h4 className="font-bold text-2xl uppercase mb-2">Since 2012</h4>
                                <p className="font-medium">Redefining the standard of dance education globally.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl font-bold uppercase tracking-tight">
                                Forged in <span className="text-secondary">Passion</span>. Built for Greatness.
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                                <p>
                                    What started as a small basement crew has evolved into the city's most prestigious dance academy. We believed in one simple truth: dance is not just movement, it is fire made visible.
                                </p>
                                <p>
                                    Our instructors don't just teach choreography; they instill discipline, confidence, and raw artistry. We've trained national champions, background dancers for A-list artists, and ordinary people who just wanted to find their rhythm.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-4xl font-bold text-primary mb-2">50+</div>
                                    <div className="text-sm uppercase tracking-widest font-bold text-gray-500">Global Awards</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                                    <div className="text-sm uppercase tracking-widest font-bold text-gray-500">Students Trained</div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="py-24 bg-[#050505]">
                <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center mb-16">
                    <h2 className="text-4xl font-bold uppercase tracking-tight mb-6">Our Training <span className="text-primary">Philosophy</span></h2>
                    <p className="text-gray-400 text-lg">We bridge the gap between street culture rawness and studio precision.</p>
                </div>

                <div className="container mx-auto px-4 md:px-8 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Target, title: "Precision", desc: "Mastering the absolute fundamentals of body control and isolation." },
                        { icon: Flame, title: "Intensity", desc: "Pushing physical boundaries to perform with explosive energy." },
                        { icon: Award, title: "Artistry", desc: "Finding your unique voice and storytelling through movement." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-black border border-white/5 p-10 hover:border-primary/50 transition-colors group"
                        >
                            <item.icon className="w-12 h-12 text-primary mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold uppercase tracking-wide mb-4">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

        </div>
    );
}
