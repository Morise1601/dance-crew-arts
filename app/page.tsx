"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CalendarDays, Music } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* 1. Hero Section */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/fire_dance_hero.png"
            alt="Dynamic Fire Dancer"
            fill
            className="object-cover object-center opacity-50 mix-blend-screen scale-105 animate-[pulse_20s_ease-in-out_infinite]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center justify-center text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 px-6 py-2 border border-primary/50 bg-primary/10 rounded-full"
            >
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase">Dance • Rhythm • Technique</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1] mb-8 uppercase drop-shadow-2xl">
              Unleash the <br />
              <span className="text-gradient drop-shadow-[0_0_20px_rgba(227,157,28,0.3)]">Artistic Rhythm</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mb-12 leading-relaxed">
              Experience the power, rhythm, and passion of premium dance performances. Elevate your skills with elite instructors in a world-class environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Link href="/booking">
                <Button size="lg" className="rounded-full bg-primary hover:bg-white text-black px-10 h-16 text-lg font-bold tracking-widest uppercase transition-all duration-300 w-full hover:shadow-[0_0_30px_-5px_var(--color-primary)]">
                  Book a Class
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white hover:text-black px-10 h-16 text-lg font-bold tracking-widest uppercase transition-all duration-300 w-full">
                  Join Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 text-white/50"
        >
          <span className="text-xs uppercase tracking-[0.3em] mb-2 font-bold">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* 2. Short Academy Introduction */}
      <section className="py-24 bg-black relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-8">
              More than a <span className="text-primary">Studio.</span>
              <br /> It's a Movement.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Founded on the principles of artistic excellence and relentless passion, our academy shapes raw talent into breathtaking performances. We don't just teach steps; we cultivate presence, fire, and emotion.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              Whether you're stepping onto the floor for the first time or training for national competitions, our elite instructors provide personalized guidance to unlock your true rhythmic potential.
            </p>
            <Link href="/about" className="group flex items-center font-bold text-primary tracking-widest uppercase hover:text-white transition-colors">
              Discover Our Story
              <div className="ml-4 w-12 h-[1px] bg-primary group-hover:w-20 group-hover:bg-white transition-all duration-300" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] w-full"
          >
            <div className="absolute inset-0 border border-primary/20 translate-x-4 translate-y-4 z-0" />
            <div className="absolute inset-0 z-10 overflow-hidden">
              <Image
                src="/dance_studio_about.png"
                alt="Dance Studio Training"
                fill
                className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-8 -left-8 bg-black p-6 border-l-2 border-t-2 border-primary z-20">
              <div className="text-5xl font-bold text-white">10+</div>
              <div className="text-sm text-primary uppercase tracking-widest font-bold mt-2">Years of Excellence</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Dance Styles Preview */}
      <section className="py-32 bg-[#050505] relative border-t border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase block mb-4">Our Disciplines</span>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Master The <span className="text-gradient">Rhythm</span></h2>
            </div>
            <Link href="/services" className="hidden md:flex items-center text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors mt-6 md:mt-0">
              View All Styles <ArrowRight className="ml-2 w-5 h-5 text-primary" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Hip Hop", desc: "Urban grooves, popping, and intricate choreography." },
              { name: "Contemporary", desc: "Fluid motion, emotion, and technical modern grace." },
              { name: "Classical", desc: "The foundation of technique, precision, and form." },
              { name: "Freestyle", desc: "Unleash your raw instinct and musicality." }
            ].map((style, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative h-[450px] overflow-hidden bg-black border border-white/5 cursor-pointer"
              >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 z-30 transform group-hover:-translate-y-4 transition-transform duration-500">
                  <div className="w-12 h-12 mb-6 rounded-full border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                    <Music size={20} />
                  </div>
                  <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">{style.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto">
                    {style.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link href="/services" className="md:hidden flex items-center justify-center text-sm font-bold uppercase tracking-widest mt-10 hover:text-primary transition-colors">
            View All Styles <ArrowRight className="ml-2 w-5 h-5 text-primary" />
          </Link>
        </div>
      </section>

      {/* 4. Upcoming Events & Workshops */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-[0.2em] text-sm uppercase block mb-4">Join The Action</span>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Upcoming <span className="text-white">Events</span></h2>
          </div>

          <div className="space-y-6">
            {[
              { date: "15", month: "OCT", title: "Masterclass: Urban Choreography with T-Bone", type: "Workshop", time: "18:00 - 20:00" },
              { date: "28", month: "OCT", title: "Autumn Showcase: Fire & Grace", type: "Performance", time: "19:30 - 22:00" },
              { date: "05", month: "NOV", title: "Beginner's Bootcamp: Foundational Grooves", type: "Training", time: "10:00 - 15:00" }
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 border border-white/10 bg-[#050505] hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-8 w-full md:w-auto mb-6 md:mb-0">
                  <div className="text-center px-6 py-4 bg-white/5 border border-white/10 group-hover:bg-primary/10 transition-colors">
                    <div className="text-3xl font-bold text-primary">{event.date}</div>
                    <div className="text-xs font-bold tracking-widest text-gray-400">{event.month}</div>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-secondary tracking-widest mb-2 block">{event.type}</span>
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide">{event.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm mt-2">
                      <CalendarDays size={16} className="mr-2" /> {event.time}
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full md:w-auto rounded-full border-primary text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-widest">
                  Reserve Spot
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Booking CTA Section */}
      <section className="relative py-32 bg-secondary/10 overflow-hidden border-t-2 border-primary">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />

        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-4xl text-center">
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 leading-none">
            Ready to <span className="text-primary">Dance?</span>
          </h2>
          <p className="text-xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto">
            Spaces in our elite classes fill up quickly. Secure your spot today and start your journey towards mastery.
          </p>

          <div className="flex justify-center">
            <Link href="/booking">
              <Button size="lg" className="rounded-full bg-primary hover:bg-white text-black px-16 h-20 text-xl font-bold tracking-widest uppercase shadow-[0_0_40px_-10px_var(--color-primary)] hover:shadow-white transition-all duration-300">
                Secure Your Spot Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
