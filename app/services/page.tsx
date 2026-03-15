import { Play } from "lucide-react";

export default function ServicesPage() {
    const styles = [
        { title: "School Annual Day Choreography", level: "All Grades", desc: "Creative choreography planning and training for school annual day performances with unique themes and formations.", tag: "Most Popular" },
        { title: "Cultural Event Choreography", level: "SCHOOL / COLLEGE", desc: "High-energy performances designed for culturals, competitions, and stage shows." },
        { title: "Theme Based Dance Concepts", level: "Custom", desc: "Special theme performances like Retro, Folk, Patriotic, Bollywood, and Fusion concepts." },
        { title: "Dance Costume & Props Design", level: "Custom", desc: "Creative dance costumes and stage props designed according to the performance theme." },
        { title: "Kids Dance Training", level: "Beginner", desc: "Fun and engaging dance training sessions for students to build confidence and stage presence." },
        { title: "Stage Performance Planning", level: "PROFESSIONAL", desc: "Complete guidance for stage entry, formations, expressions, and final performance presentation.", tag: "Elite" }
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-24 pb-16">

            {/* Page Header */}
            <div className="border-b border-white/5 pb-10 mb-12">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight mb-3">
                        Our <span className="text-gradient">Services</span>
                    </h1>
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
                            <h3 className="text-base font-bold uppercase tracking-wide mb-1.5">{style.title}</h3>
                            <div className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Level: {style.level}</div>

                            <p className="text-gray-400 text-sm mb-7 flex-1 leading-relaxed">{style.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
