import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

export default function BlogPage() {
    const posts = [
        { date: "OCT 12", category: "Training", title: "5 Drills to Improve Your Grooves and Musicality", desc: "Understanding the pocket is everything in urban dance. Try these exercises to lock into any beat." },
        { date: "SEP 28", category: "News", title: "Announcing Our Annual Autumn Showcase", desc: "Get ready for a night of breathtaking performances as our top teams take the main stage." },
        { date: "SEP 10", category: "Health", title: "Recovery Basics for High-Intensity Choreography", desc: "Your training is only as good as your recovery. Here is how our pros handle muscle fatigue." },
        { date: "AUG 22", category: "Training", title: "Breaking Down the Pirouette: Classical Technique", desc: "A strong foundation makes everything else look effortless. We break down the absolute basics." },
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-24 pb-16">

            {/* Page Header */}
            <div className="border-b border-white/5 pb-10 mb-12">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <span className="text-secondary font-bold tracking-[0.3em] text-[10px] uppercase mb-3 block">Studio Insights</span>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight mb-3">
                        The <span className="text-gradient">Pulse</span> Blog
                    </h1>
                    <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                        Dance tips, training advice, health guidelines, and latest news from the Academy.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {posts.map((post, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="h-[220px] bg-[#111] border border-white/5 mb-5 overflow-hidden relative rounded-xl">
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-500 z-10 mix-blend-color" />
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
                                <div className="absolute top-4 left-4 bg-primary text-black font-bold uppercase tracking-widest text-[10px] px-3 py-1 z-20 rounded">
                                    {post.category}
                                </div>
                            </div>
                            <div className="flex items-center text-secondary text-xs font-bold uppercase tracking-widest mb-2.5">
                                <CalendarDays size={14} className="mr-2" /> {post.date}
                            </div>
                            <h3 className="text-base font-bold uppercase tracking-wide leading-tight mb-3 group-hover:text-primary transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-5 line-clamp-2 leading-relaxed">
                                {post.desc}
                            </p>
                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors">
                                Read Article <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
