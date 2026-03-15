import { Play } from "lucide-react";

export default function ServicesPage() {
    const styles = [
        { title: "Hip Hop", price: "$25", level: "All Levels", desc: "Foundational grooves, combinations, and performance prep.", tag: "Most Popular" },
        { title: "Contemporary", price: "$25", level: "Int / Adv", desc: "Fluid motion focusing on emotion, technique, and artistry." },
        { title: "Classical Ballet", price: "$30", level: "All Levels", desc: "The core technique behind all great movements." },
        { title: "Freestyle / Battle", price: "$20", level: "Open", desc: "Learn to freestyle, understand musicality, and battle tactics." },
        { title: "Kids Classes", price: "$15", level: "Beginner", desc: "Fun, engaging classes focusing on rhythm and basics." },
        { title: "Private Training", price: "$80", level: "Custom", desc: "1-on-1 coaching to quickly elevate your specific goals.", tag: "Elite" }
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-24 pb-16">

            {/* Page Header */}
            <div className="border-b border-white/5 pb-10 mb-12">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <span className="text-secondary font-bold tracking-[0.3em] text-[10px] uppercase mb-3 block">Programs &amp; Pricing</span>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight mb-3">
                        Find Your <span className="text-gradient">Style</span>
                    </h1>
                    <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                        From absolute beginners to elite industry professionals, we have a program designed to push your limits.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {styles.map((style, i) => (
                        <div key={i} className="bg-[#050505] border border-white/5 hover:border-primary/40 transition-colors p-7 relative flex flex-col group rounded-xl">
                            {style.tag && (
                                <div className="absolute top-0 right-0 bg-primary text-black font-bold uppercase tracking-widest text-[10px] px-4 py-1 rounded-tr-xl">
                                    {style.tag}
                                </div>
                            )}
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-colors">
                                <Play size={14} className="ml-0.5" />
                            </div>

                            <h3 className="text-base font-bold uppercase tracking-wide mb-1.5">{style.title}</h3>
                            <div className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Level: {style.level}</div>

                            <p className="text-gray-400 text-sm mb-7 flex-1 leading-relaxed">{style.desc}</p>

                            <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
                                <div className="text-xl font-bold">{style.price}<span className="text-xs text-gray-500 font-medium">/class</span></div>
                                <button className="text-xs uppercase font-bold tracking-widest text-white hover:text-primary transition-colors">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
