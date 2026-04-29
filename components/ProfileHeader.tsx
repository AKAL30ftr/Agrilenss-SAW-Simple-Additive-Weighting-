"use client";
import Image from 'next/image';
import React from 'react';
import { motion } from 'motion/react';

export default function ProfileHeader() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-plate rounded-xl p-8 flex flex-col md:flex-row items-center gap-8"
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0">
        <Image 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDmTnV5vgbPSu7vmLuhpw7gIOFi8Jxtei5_fKreIbG0z8O00MLZsvTBGfrHEBNohQchx0JsVUJ98_4-mp55TMGEAefM9Ebm8SjAIowkdXDRyTJjXbrr6IrH7hq7VekUGuFyYFUjvJryZdEjfP_tF7INsostEWIasH5HwgTwwJSa_Z6LYlC4x3HJvR0qhBdGEWQWgiAwkyAg3ZlkQWCxrY68cr6rMIrHgcKfNSci4y_VcdnEsCpqqVfw2GGZivRJddIDvl2_1VWlGuR" 
          alt="Profile Picture" 
          fill 
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1 text-center md:text-left space-y-2">
        <h1 className="text-4xl font-extrabold text-white font-heading">Dr. Elias Vance</h1>
        <p className="text-lg text-emerald-300">Lead Agronomist • Midwest Region</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
          <span className="bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">Corn Specialist</span>
          <span className="bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">Soybean Analyst</span>
        </div>
      </div>
      <button className="bg-transparent border-2 border-emerald-400/50 text-emerald-400 px-6 py-3 rounded-lg font-bold hover:bg-emerald-400/10 transition-colors shadow-[0_5px_15px_rgba(0,0,0,0.3)] whitespace-nowrap">
        Edit Profile
      </button>
    </motion.section>
  );
}
