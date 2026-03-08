"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";

// Mock schedule data
const scheduleData = [
    {
        id: 1,
        time: "09:00 AM",
        duration: "60 min",
        name: "Morning Flow - Contemporary",
        instructor: "Sarah Jenkins",
        location: "Studio A",
        spotsLeft: 4,
        level: "All Levels",
    },
    {
        id: 2,
        time: "11:30 AM",
        duration: "90 min",
        name: "Urban Choreography",
        instructor: "Marcus 'T-Bone' Reed",
        location: "Studio B",
        spotsLeft: 12,
        level: "Intermediate",
    },
    {
        id: 3,
        time: "05:00 PM",
        duration: "60 min",
        name: "Hip Hop Foundations",
        instructor: "Elena Rodriguez",
        location: "Main Stage",
        spotsLeft: 2,
        level: "Beginner",
    },
    {
        id: 4,
        time: "07:30 PM",
        duration: "90 min",
        name: "Pro Masterclass - Jazz Funk",
        instructor: "David Kim",
        location: "Studio A",
        spotsLeft: 0,
        level: "Advanced",
    },
];

const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        days.push({
            date: nextDay.getDate(),
            dayName: nextDay.toLocaleDateString("en-US", { weekday: "short" }),
            fullDate: nextDay,
        });
    }
    return days;
};

export default function BookingPage() {
    const [selectedDay, setSelectedDay] = useState(0);
    const days = generateDays();

    return (
        <div className="flex-1 w-full bg-background min-h-screen py-10 md:py-20 flex justify-center">
            <div className="container px-4 md:px-8 max-w-5xl">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Book a Class</h1>
                    <p className="text-muted-foreground text-lg">Secure your spot in our upcoming sessions.</p>
                </div>

                {/* Date Selector */}
                <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-4 mb-8 scrollbar-hide py-2">
                    {days.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedDay(idx)}
                            className={`relative flex flex-col items-center min-w-[70px] md:min-w-[90px] p-3 md:p-4 rounded-2xl transition-all ${selectedDay === idx
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "bg-card hover:bg-card/80 border border-border"
                                }`}
                        >
                            <span className={`text-xs md:text-sm font-medium mb-1 ${selectedDay === idx ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                {day.dayName}
                            </span>
                            <span className="text-xl md:text-2xl font-bold">{day.date}</span>
                            {selectedDay === idx && (
                                <motion.div
                                    layoutId="activeDay"
                                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Schedule List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {scheduleData.map((session, idx) => (
                            <motion.div
                                key={`${selectedDay}-${session.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-start md:items-center gap-6 w-full md:w-auto">
                                    <div className="text-center min-w-[100px]">
                                        <h3 className="text-2xl font-bold">{session.time}</h3>
                                        <div className="flex items-center justify-center text-muted-foreground text-sm font-medium mt-1">
                                            <Clock className="w-4 h-4 mr-1" /> {session.duration}
                                        </div>
                                    </div>
                                    <div className="hidden md:block w-[2px] h-16 bg-border/50 rounded-full" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-accent-foreground tracking-wider uppercase">
                                                {session.level}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold mb-2">{session.name}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center">
                                                <User className="w-4 h-4 mr-1.5" />
                                                {session.instructor}
                                            </span>
                                            <span className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1.5" />
                                                {session.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row md:flex-col items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
                                    <div className={`text-sm font-semibold tracking-wide ${session.spotsLeft === 0 ? "text-destructive" : session.spotsLeft <= 5 ? "text-primary" : "text-green-500"}`}>
                                        {session.spotsLeft === 0 ? "WAITLIST ONLY" : `${session.spotsLeft} SPOTS LEFT`}
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto md:w-32 rounded-full font-bold"
                                        variant={session.spotsLeft === 0 ? "secondary" : "default"}
                                    >
                                        {session.spotsLeft === 0 ? "Join Waitlist" : "Book Slot"}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
