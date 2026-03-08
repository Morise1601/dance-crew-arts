import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter drop-shadow-lg mb-6">
                        Get In <span className="text-primary">Touch</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Ready to ignite your passion? Contact us for private lessons, event bookings, or general inquiries.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <div className="bg-[#050505] p-8 md:p-12 border border-white/10 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px]" />
                        <form className="relative z-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">First Name</label>
                                    <input type="text" className="w-full bg-black border border-white/20 p-4 text-white focus:border-primary focus:outline-none transition-colors" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                                    <input type="text" className="w-full bg-black border border-white/20 p-4 text-white focus:border-primary focus:outline-none transition-colors" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                                <input type="email" className="w-full bg-black border border-white/20 p-4 text-white focus:border-primary focus:outline-none transition-colors" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Message</label>
                                <textarea rows={5} className="w-full bg-black border border-white/20 p-4 text-white focus:border-primary focus:outline-none transition-colors" placeholder="Tell us how we can help..."></textarea>
                            </div>
                            <Button size="lg" className="w-full bg-primary hover:bg-white text-black font-bold uppercase tracking-widest text-lg h-16 transition-all duration-300">
                                Send Message
                            </Button>
                        </form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col items-start space-y-4">
                                <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-lg mb-2">Location</h3>
                                    <p className="text-gray-400">123 Rhythm Avenue<br />Dance District, NY 10001</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start space-y-4">
                                <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-lg mb-2">Phone</h3>
                                    <p className="text-gray-400">+1 (555) 123-4567<br />Mon-Fri, 9am - 8pm</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start space-y-4">
                                <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-lg mb-2">Email</h3>
                                    <p className="text-gray-400">booking@dancearts.com<br />info@dancearts.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 md:h-80 bg-[#111] border border-white/10 relative overflow-hidden flex items-center justify-center">
                            <span className="text-gray-500 font-bold uppercase tracking-widest">Map Placeholder</span>
                            {/* Optional: Embed real iframe map here */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
