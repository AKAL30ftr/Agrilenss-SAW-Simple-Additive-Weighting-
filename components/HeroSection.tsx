"use client";
import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[520px] flex items-center justify-center overflow-hidden">
      <Image 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSC6SoldAHyq6IdlaeMv9ciDRdr6Pzwsa2Zk3guZEanBYeF2Oc1LvlEc3ZLU5Fa6OB1Ig54MAgIMrZ5KJ44lUqWj4WxVtzA5pZh93iMik49lFxWaaIgc3rTRXEKSRmmeTPpYfJEe1LUQDgBdU3Rb8gfgoApyg9lSEja-ZQY5AGao6ZGu-x-Z53AgwOP_av0tJ6O8tqY3hC-Ns3X_0x6nKeHzOrQg0BQ9Gn44XLD9ikBSQwxQ6McinKoUx41Y04D8fkK8uvJK3AhuK2"
        alt="Lahan Pertanian"
        fill
        className="object-cover mix-blend-screen opacity-30 z-[-2]"
        unoptimized
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-[#0b0f10]/80 to-[#0b0f10] z-[-1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f10] via-transparent to-transparent z-[1]" />
      <div className="text-center px-6 max-w-4xl mx-auto relative z-10 w-full mb-10 mt-8 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Sistem Pendukung Keputusan • 2026</span>
        </motion.div>
        <motion.h1 
          className="text-white text-[36px] md:text-[68px] font-light leading-[1.1] mb-6 tracking-tight font-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Pemilihan Komoditas <br /> 
          <span className="text-emerald-400">Pertanian Terbaik.</span>
        </motion.h1>
        <motion.p 
          className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Rekomendasi tanaman berdasarkan kesesuaian lingkungan lahan dan analisis keuntungan ekonomi menggunakan metode <strong className="text-emerald-400">Simple Additive Weighting</strong> (SAW).
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/analyze" className="px-8 py-4 bg-emerald-400 text-black rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] text-sm">
            Mulai Konsultasi
          </Link>
          <Link href="/methodology" className="px-8 py-4 bg-white/5 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 text-sm">
            Lihat Metode SAW
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
