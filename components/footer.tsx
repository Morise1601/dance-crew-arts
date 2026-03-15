"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/D_arts_crew.png";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Golden Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="bg-white rounded-full p-2 w-fit shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 duration-300">
                                <Image src={Logo} alt="D'Art Crew Logo" width={110} height={110} />
                            </div>
                        </Link>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Unleash your passion, master the rhythm, and elevate your art. We are the premier destination for professional dance training.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary text-white transition-colors">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary text-white transition-colors">
                                <Youtube size={18} />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary text-white transition-colors">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary text-white transition-colors">
                                <Twitter size={18} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-lg mb-6 tracking-wide">STUDIO</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
                            <li><Link href="/services" className="hover:text-primary transition-colors">Classes & Programs</Link></li>
                            <li><Link href="/instructors" className="hover:text-primary transition-colors">Instructors</Link></li>
                            <li><Link href="/testimonials" className="hover:text-primary transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-lg mb-6 tracking-wide">SUPPORT</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-lg mb-6 tracking-wide">NEWSLETTER</h4>
                        <p className="text-gray-400 text-sm mb-4">Subscribe for the latest workshops, events, and dance tips.</p>
                        <form className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors rounded-sm"
                            />
                            <button
                                type="button"
                                className="bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider py-3 transition-colors rounded-sm"
                            >
                                SUBSCRIBE
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-gray-500 text-[10px] md:text-sm text-center md:text-left space-y-4 md:space-y-0">
                    <p>&copy; {new Date().getFullYear()} D'Art Crew. All rights reserved.</p>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span>Built with passion & precision.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
