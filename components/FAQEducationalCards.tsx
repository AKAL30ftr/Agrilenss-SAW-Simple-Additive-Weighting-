"use client";
import { Leaf, Scale, ArrowRight } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function FAQEducationalCards() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-400/40 transition-all duration-300">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Leaf className="w-32 h-32 text-emerald-400" />
        </div>
        <h4 className="text-2xl font-bold text-white relative z-10 font-heading">Data Sourcing</h4>
        <p className="text-slate-300 relative z-10 flex-grow font-body">Learn about how we integrate satellite imagery, local soil sensors, and historical weather patterns.</p>
        <button className="text-emerald-400 font-bold flex items-center gap-2 w-fit hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all mt-auto relative z-10">
          Read Documentation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-400/40 transition-all duration-300">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Scale className="w-32 h-32 text-emerald-400" />
        </div>
        <h4 className="text-2xl font-bold text-white relative z-10 font-heading">Weighting Strategies</h4>
        <p className="text-slate-300 relative z-10 flex-grow font-body">Best practices for assigning weights to criteria based on specific regional goals (e.g., drought resistance vs. yield).</p>
        <button className="text-emerald-400 font-bold flex items-center gap-2 w-fit hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all mt-auto relative z-10">
          View Strategies <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
