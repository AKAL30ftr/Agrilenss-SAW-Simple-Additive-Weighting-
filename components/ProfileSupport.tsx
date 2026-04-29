"use client";
import { BookOpen, Headset } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function ProfileSupport() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-plate rounded-xl p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-white/10 pb-4 font-heading">
        <BookOpen className="text-emerald-400 w-6 h-6" />
        Support
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <button className="flex items-center gap-4 p-5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left">
          <BookOpen className="text-emerald-400 w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-white text-lg">Documentation</h3>
            <p className="text-white/50 text-sm">Read user guides</p>
          </div>
        </button>
        <button className="flex items-center gap-4 p-5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left">
          <Headset className="text-emerald-400 w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-white text-lg">Contact Help Desk</h3>
            <p className="text-white/50 text-sm">Open a support ticket</p>
          </div>
        </button>
      </div>
    </motion.section>
  );
}
