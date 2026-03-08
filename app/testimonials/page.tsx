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
        <div className="bg-black text-white min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-40 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-40 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

            <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
                <div className="text-center mb-20">
                    <span className="text-secondary font-bold tracking-[0.3em] text-sm uppercase mb-4 block">Student Success</span>
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter drop-shadow-lg mb-6">
                        Words From Our <span className="text-gradient">Community</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="bg-[#050505] border border-white/5 p-10 hover:border-primary/50 transition-colors relative group"
                        >
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
                            <div className="flex text-primary mb-6">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                            </div>
                            <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed mb-8 italic">
                                "{review.desc}"
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white/10 rounded-full mr-4 flex items-center justify-center font-bold text-xl text-primary">{review.name[0]}</div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-wider text-white">{review.name}</h4>
                                    <p className="text-sm text-secondary uppercase tracking-widest font-bold mt-1">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
