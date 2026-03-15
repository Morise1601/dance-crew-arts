import { getContactSubmissions } from "../actions";
import MessagesClient from "./MessagesClient";
import { Mail, Sparkles } from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminMessagesPage() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) redirect('/admin');

    const { data: adminProfile } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

    if (((adminProfile as any)?.Role || (adminProfile as any)?.role || '').toLowerCase() !== 'admin') {
        redirect('/admin/settings/profile');
    }

    const { data: messages, error } = await getContactSubmissions();

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#050505] text-white">
                <AdminSidebar />
                <main className="flex-1 p-8 pt-24 lg:pt-8 overflow-x-hidden text-center">
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-red-500 font-bold uppercase tracking-widest text-xs max-w-2xl mx-auto shadow-2xl">
                        Error loading messages: {error}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <AdminSidebar />

            <main className="flex-1 pt-24 lg:pt-0 overflow-x-hidden">
                {/* Background Decor */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 left-[20%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="p-6 lg:p-12 max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="relative mb-12 p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-primary font-bold text-[9px] tracking-widest uppercase">Inbox System</span>
                                </div>
                                <h1 className="font-serif text-3xl lg:text-4xl tracking-tighter leading-none text-white">
                                    Client <span className="text-primary italic">Inquiries</span>
                                </h1>
                                <p className="text-gray-400 text-xs mt-3 font-light max-w-lg">
                                    Review and manage messages sent through the official contact form.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur-xl">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Inbox</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">{messages?.length || 0} Submissions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <MessagesClient messages={messages || []} />
                </div>
            </main>
        </div>
    );
}
