"use client";
import { Target } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function OurMission() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "-50px" }}
      className="md:col-span-8 glass-card p-6 md:p-8 rounded-xl"
    >
      <motion.div variants={item} className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center border border-emerald-400/30">
          <Target className="text-emerald-400 w-6 h-6" />
        </div>
        <h2 className="text-2xl text-white font-bold">Our Mission</h2>
      </motion.div>
      <motion.p variants={item} className="text-slate-400 mb-8 leading-relaxed text-lg font-body">
        Agri-SAW Pro bridges the gap between traditional agricultural expertise and high-tech computational intelligence. Our mission is to provide an authoritative decision-support platform that optimizes crop selection for farmers and agribusiness stakeholders.
      </motion.p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div variants={item} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-400/40 transition-colors">
          <h4 className="font-heading text-emerald-400 mb-2 font-bold">Precision Choice</h4>
          <p className="text-slate-400 text-sm">Minimizing risk through multi-criteria attribute analysis.</p>
        </motion.div>
        <motion.div variants={item} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-400/40 transition-colors">
          <h4 className="font-heading text-emerald-400 mb-2 font-bold">Scale Analytics</h4>
          <p className="text-slate-400 text-sm">Adapting local farm data to global market requirements.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
