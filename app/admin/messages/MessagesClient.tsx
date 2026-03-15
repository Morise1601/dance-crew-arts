'use client';

import React, { useState } from 'react';
import { Mail, Trash2, Calendar, User, Mail as MailIcon, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteContactSubmission } from '../actions';
import { Button } from "@/components/ui/button";

export default function MessagesClient({ messages: initialMessages }: { messages: any[] }) {
    const [messages, setMessages] = useState(initialMessages);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const formatDate = (dateStr: string, formatType: 'date' | 'full' | 'time') => {
        const date = new Date(dateStr);
        if (formatType === 'date') {
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
        }
        if (formatType === 'full') {
            return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
        }
        return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        setIsDeleting(id);
        const result = await deleteContactSubmission(id);
        if (result.success) {
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } else {
            alert('Failed to delete message: ' + result.error);
        }
        setIsDeleting(null);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
            {/* Messages List */}
            <div className="w-full lg:w-1/3 bg-[#080808] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-xl text-white uppercase tracking-wider">Inbox</h2>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{messages.length} Submissions</p>
                    </div>
                    <Mail className="text-primary w-5 h-5 opacity-50" />
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-2">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <MailIcon className="text-gray-600 w-8 h-8" />
                            </div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest leading-loose">No messages yet</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <button
                                key={message.id}
                                onClick={() => setSelectedMessage(message)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 relative group border ${
                                    selectedMessage?.id === message.id 
                                    ? 'bg-primary border-primary text-black' 
                                    : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:border-primary/30 hover:bg-white/5'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-sm truncate pr-4 ${selectedMessage?.id === message.id ? 'text-black' : 'text-white'}`}>
                                        {message.first_name} {message.last_name}
                                    </h3>
                                    <span className={`text-[10px] whitespace-nowrap opacity-60 font-bold ${selectedMessage?.id === message.id ? 'text-black' : 'text-gray-500'}`}>
                                        {formatDate(message.created_at, 'date')}
                                    </span>
                                </div>
                                <p className={`text-xs line-clamp-1 opacity-70 ${selectedMessage?.id === message.id ? 'text-black' : ''}`}>
                                    {message.message}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Message Detail */}
            <div className="flex-1 bg-[#080808] border border-white/5 rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                    {selectedMessage ? (
                        <motion.div 
                            key={selectedMessage.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            {/* Detail Header */}
                            <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-primary text-black flex items-center justify-center rounded-2xl font-serif text-2xl font-bold shadow-lg shadow-primary/20">
                                            {selectedMessage.first_name[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
                                                {selectedMessage.first_name} {selectedMessage.last_name}
                                            </h2>
                                            <div className="flex items-center gap-3 mt-1.5 text-gray-400">
                                                <a href={`mailto:${selectedMessage.email}`} className="text-xs hover:text-primary transition-colors flex items-center gap-2">
                                                    <MailIcon size={12} className="text-primary" />
                                                    {selectedMessage.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            disabled={isDeleting === selectedMessage.id}
                                        >
                                            <Trash2 size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Bar */}
                            <div className="px-8 py-4 bg-white/[0.01] border-b border-white/5 flex flex-wrap gap-8">
                                <div className="flex items-center gap-2.5">
                                    <Calendar size={14} className="text-primary" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Received:</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-white">
                                        {formatDate(selectedMessage.created_at, 'full')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Clock size={14} className="text-primary" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Time:</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-white">
                                        {formatDate(selectedMessage.created_at, 'time')}
                                    </span>
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
                                <div className="flex items-start gap-4 mb-6">
                                    <MessageSquare size={16} className="text-primary mt-1" />
                                    <span className="text-xs uppercase font-bold tracking-widest text-primary">Message Content</span>
                                </div>
                                <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-2xl shadow-inner">
                                    <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                                
                                <div className="mt-12 flex justify-end">
                                    <a 
                                        href={`mailto:${selectedMessage.email}`}
                                        className="bg-primary text-black px-8 py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg shadow-primary/10"
                                    >
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 relative">
                                <MailIcon className="text-gray-700 w-12 h-12" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-4">Select a message</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed font-medium">
                                Choose a submission from the list on the left to view the full details and respond.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
