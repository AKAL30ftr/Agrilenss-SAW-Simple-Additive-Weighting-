"use client";
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { motion } from 'motion/react';

export default function CoreIntelligence() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "-50px" }}
      className="md:col-span-4 glass-card-bright p-6 md:p-8 rounded-xl flex flex-col justify-between"
    >
      <div>
        <motion.h3 variants={item} className="text-emerald-400 text-xl mb-6 font-bold font-heading">Core Intelligence</motion.h3>
        <ul className="space-y-6">
          <motion.li variants={item} className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 shrink-0" />
            <span className="text-slate-200 text-sm">Dynamic weighting for soil pH and moisture.</span>
          </motion.li>
          <motion.li variants={item} className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 shrink-0" />
            <span className="text-slate-200 text-sm">Real-time market price sensitivity index.</span>
          </motion.li>
          <motion.li variants={item} className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-0.5 shrink-0" />
            <span className="text-slate-200 text-sm">Sustainability score calculation.</span>
          </motion.li>
        </ul>
      </div>
      <motion.div variants={item}>
        <Link href="/analyze" className="w-full mt-10 bg-emerald-400 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] text-center text-sm inline-block">
          View Live Reports
        </Link>
      </motion.div>
    </motion.div>
  );
}
