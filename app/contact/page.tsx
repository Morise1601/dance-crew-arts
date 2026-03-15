import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { getAppSettings } from "@/app/admin/actions";
import { ContactForm } from "./ContactForm";

export default async function ContactPage() {
    const { data: settings } = await getAppSettings();

    return (
        <div className="bg-[#020202] text-white min-h-screen selection:bg-primary/30 relative overflow-hidden pt-24 pb-16">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-overlay" />

            {/* Page Header */}
            <div className="border-b border-white/5 pb-10 mb-14 relative z-10">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md mb-5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-primary font-bold tracking-[0.4em] text-[10px] uppercase">Frequency Complete</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-tight mb-3">
                        Connect <span className="font-serif italic text-white/50">With Us.</span>
                    </h1>
                    <p className="text-gray-500 text-sm max-w-xl leading-relaxed">Reach out and let&apos;s start a conversation about your dance journey.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
                    {/* Information Module */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div className="space-y-12">
                            <div className="group relative">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
                                    <MapPin size={11} />
                                    Headquarters
                                </h4>
                                <p className="text-base font-light leading-relaxed text-gray-300 group-hover:text-white transition-colors duration-500 max-w-sm">
                                    {settings?.founder_address || "123 Rhythm Avenue, Dance District, NY 10001"}
                                </p>
                            </div>

                            <div className="group relative">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
                                    <Phone size={11} />
                                    Direct Line
                                </h4>
                                <div className="space-y-1.5">
                                    {settings?.founder_contact?.length ? (
                                        settings.founder_contact.map((phone: string, i: number) => (
                                            <p key={i} className="text-base font-light text-gray-300 group-hover:text-white transition-colors duration-500">
                                                +91 <span className="text-white font-bold">{phone.slice(0, 5)} {phone.slice(5)}</span>
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-base font-light text-gray-300 group-hover:text-white transition-colors duration-500">+91 <span className="text-white font-bold">98765 43210</span></p>
                                    )}
                                </div>
                            </div>

                            <div className="group relative">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
                                    <Mail size={11} />
                                    Digital Signal
                                </h4>
                                <div className="space-y-1.5">
                                    {settings?.founder_email?.length ? (
                                        settings.founder_email.map((email: string, i: number) => (
                                            <a key={i} href={`mailto:${email}`} className="text-sm font-light text-gray-300 hover:text-primary transition-colors duration-500 flex items-center gap-2.5 w-fit">
                                                {email} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300" />
                                            </a>
                                        ))
                                    ) : (
                                        <a href="mailto:info@dancearts.com" className="text-sm font-light text-gray-300 hover:text-primary transition-colors duration-500 flex items-center gap-2.5 w-fit">
                                            info@dancearts.com <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-12 pt-8 border-t border-white/10 flex gap-6">
                            {['Instagram', 'Twitter', 'YouTube'].map((social, idx) => (
                                <a key={idx} href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors relative group overflow-hidden">
                                    <span className="relative z-10">{social}</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
