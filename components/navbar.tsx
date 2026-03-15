"use client";
import Logo from "@/public/D_arts_crew.png"
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { usePathname } from "next/navigation";

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [mobileMenuOpen]);

    if (pathname?.startsWith('/admin')) return null;

    const links = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Services", path: "/services" },
        { name: "Portfolio", path: "/portfolio" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border/10" : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 md:px-8 max-w-7xl h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 z-50">
                    <div className="bg-white rounded-full p-1.5 shadow-[0_0_15px_rgba(227,157,28,0.4)] transition-transform hover:scale-105 duration-300">
                        {logoUrl ? (
                            <Image src={logoUrl} alt="D'Art Crew Logo" width={65} height={65} className="drop-shadow-sm h-[65px] w-[65px] object-contain" />
                        ) : (
                            <Image src={Logo} alt="D'Art Crew Logo" width={65} height={65} className="drop-shadow-sm" />
                        )}
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-8">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.path}
                            className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link href="/booking">
                        <Button className="bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider px-8 h-12">
                            Book a Class
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Nav Toggle */}
                <button
                    className="lg:hidden text-white z-50"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-0 left-0 w-full h-screen bg-black flex flex-col items-center justify-center space-y-8 z-40"
                        >
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-2xl font-bold uppercase tracking-widest text-white hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider px-12 h-14 mt-4">
                                    Book a Class
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
