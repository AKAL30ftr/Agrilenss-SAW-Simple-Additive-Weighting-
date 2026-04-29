"use client";
import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[550px] flex items-center justify-center overflow-hidden pt-20 md:pt-10">
      <Image 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSC6SoldAHyq6IdlaeMv9ciDRdr6Pzwsa2Zk3guZEanBYeF2Oc1LvlEc3ZLU5Fa6OB1Ig54MAgIMrZ5KJ44lUqWj4WxVtzA5pZh93iMik49lFxWaaIgc3rTRXEKSRmmeTPpYfJEe1LUQDgBdU3Rb8gfgoApyg9lSEja-ZQY5AGao6ZGu-x-Z53AgwOP_av0tJ6O8tqY3hC-Ns3X_0x6nKeHzOrQg0BQ9Gn44XLD9ikBSQwxQ6McinKoUx41Y04D8fkK8uvJK3AhuK2"
        alt="Agriculture Field"
        fill
        className="object-cover mix-blend-screen opacity-40 z-[-2]"
        unoptimized
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f10] via-transparent to-transparent z-[-1]" />
      
      <div className="text-center px-6 max-w-4xl mx-auto relative z-10 w-full mb-10 mt-8 md:mt-0">
        <motion.h1 
          className="text-white text-[40px] md:text-[76px] font-light leading-[1.1] mb-12 md:mb-8 tracking-tight font-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Optimizing Agriculture <br /> <span className="text-emerald-400">Intelligently.</span>
        </motion.h1>
        <motion.p 
          className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          High-stakes computational intelligence for sustainable and profitable crop selection based on Simple Additive Weighting.
        </motion.p>
      </div>
    </section>
  );
}
