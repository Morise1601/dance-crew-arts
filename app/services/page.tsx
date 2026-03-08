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
        <div className="bg-black text-white min-h-screen pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="text-center mb-16">
                    <span className="text-secondary font-bold tracking-[0.3em] text-sm uppercase mb-4 block">Programs & Pricing</span>
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter drop-shadow-lg mb-6">
                        Find Your <span className="text-gradient">Style</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        From absolute beginners to elite industry professionals, we have a program designed to push your limits.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {styles.map((style, i) => (
                        <div key={i} className="bg-[#050505] border border-white/5 hover:border-primary/50 transition-colors p-8 relative flex flex-col group">
                            {style.tag && (
                                <div className="absolute top-0 right-0 bg-primary text-black font-bold uppercase tracking-widest text-xs px-4 py-1">
                                    {style.tag}
                                </div>
                            )}
                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-colors">
                                <Play size={16} className="ml-1" />
                            </div>

                            <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">{style.title}</h3>
                            <div className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Level: {style.level}</div>

                            <p className="text-gray-400 mb-8 flex-1">{style.desc}</p>

                            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                                <div className="text-2xl font-bold">{style.price}<span className="text-sm text-gray-500 font-medium">/class</span></div>
                                <button className="text-sm uppercase font-bold tracking-widest text-white hover:text-primary transition-colors">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
