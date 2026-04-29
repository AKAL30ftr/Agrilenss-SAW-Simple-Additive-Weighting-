"use client";
import { Sliders, ChevronDown } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function SystemCapabilities() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="md:col-span-6 glass-card rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="px-6 py-5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-4">
          <Sliders className="text-emerald-400 w-6 h-6" />
          <h3 className="text-white font-bold text-lg font-heading">System Capabilities</h3>
        </div>
        <ChevronDown className="text-slate-500" />
      </div>
      <div className="px-6 py-6 border-t border-white/10 bg-black/20">
        <motion.ul 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          className="space-y-4 font-body text-slate-400 text-sm"
        >
          <motion.li variants={item} className="flex items-center gap-3">
            <span className="w-2 h-2 shrink-0 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span>Multi-criteria sensitivity analysis simulations.</span>
          </motion.li>
          <motion.li variants={item} className="flex items-center gap-3">
            <span className="w-2 h-2 shrink-0 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span>Climate-adaptive weight recalibration.</span>
          </motion.li>
          <motion.li variants={item} className="flex items-center gap-3">
            <span className="w-2 h-2 shrink-0 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span>Comparative visualization of alternatives.</span>
          </motion.li>
        </motion.ul>
      </div>
    </motion.div>
  );
}
