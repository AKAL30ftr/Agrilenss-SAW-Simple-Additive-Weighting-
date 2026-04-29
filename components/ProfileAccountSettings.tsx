"use client";
import { UserCog, ShieldCheck, Globe, ChevronRight } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function ProfileAccountSettings() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-plate rounded-xl p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-white/10 pb-4 font-heading">
        <UserCog className="text-emerald-400 w-6 h-6" />
        Account Settings
      </h2>
      <div className="space-y-2 pt-2">
        {[
          { icon: UserCog, label: "Personal Information" },
          { icon: ShieldCheck, label: "Security & Password" },
          { icon: Globe, label: "Region & Language" }
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center group hover:bg-white/5 p-3 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <item.icon className="text-white/50 group-hover:text-emerald-400 transition-colors w-5 h-5" />
              <span className="text-white group-hover:text-emerald-400 transition-colors font-medium">{item.label}</span>
            </div>
            <ChevronRight className="text-white/30 group-hover:text-white transition-colors w-5 h-5" />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
