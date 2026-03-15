"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

export default function TestimonialsPage() {
    const reviews = [
        { name: "Michael T.", role: "Advanced Student", desc: "The intensity and passion at this academy completely transformed my approach to dance. The instructors are world-class." },
        { name: "Sarah L.", role: "Professional Dancer", desc: "I trained here for 3 years before booking my first international tour. They prepare you for the real industry, both mentally and physically." },
        { name: "Jessica M.", role: "Beginner", desc: "I walked in with zero rhythm. The environment was welcoming but pushed me. Now I can't imagine a week without classes." },
        { name: "David K.", role: "Competition Team", desc: "We took gold at nationals because of the relentless precision taught here. The best training ground in the city." },
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-24 pb-16 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-40 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-40 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

            {/* Page Header */}
            <div className="border-b border-white/5 pb-10 mb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <span className="text-secondary font-bold tracking-[0.3em] text-[10px] uppercase mb-3 block">Student Success</span>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight mb-3">
                        Words From Our <span className="text-gradient">Community</span>
                    </h1>
                    <p className="text-gray-500 text-sm max-w-xl leading-relaxed">Real stories from real dancers who trained with us.</p>
                </div>
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="bg-[#050505] border border-white/5 p-8 hover:border-primary/40 transition-colors relative group rounded-xl"
                        >
                            <Quote className="absolute top-7 right-7 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
                            <div className="flex text-primary mb-5">
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                            </div>
                            <p className="text-sm md:text-base text-gray-300 font-medium leading-relaxed mb-7 italic">
                                &quot;{review.desc}&quot;
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/10 rounded-full mr-3.5 flex items-center justify-center font-bold text-base text-primary">{review.name[0]}</div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">{review.name}</h4>
                                    <p className="text-xs text-secondary uppercase tracking-widest font-bold mt-0.5">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
