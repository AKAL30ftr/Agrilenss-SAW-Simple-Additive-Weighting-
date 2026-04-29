"use client";
import { Sliders, BellRing, Mail, Moon } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function ProfileAppPreferences() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-plate rounded-xl p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-white/10 pb-4 font-heading">
        <Sliders className="text-emerald-400 w-6 h-6" />
        App Preferences
      </h2>
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-4">
            <BellRing className="text-white/50 w-5 h-5" />
            <span className="text-white font-medium">Push Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400 border border-slate-600"></div>
          </label>
        </div>
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-4">
            <Mail className="text-white/50 w-5 h-5" />
            <span className="text-white font-medium">Email Digests</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400 border border-slate-600"></div>
          </label>
        </div>
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-4">
            <Moon className="text-white/50 w-5 h-5" />
            <span className="text-white font-medium">Dark Mode</span>
          </div>
          <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
            <input type="checkbox" className="sr-only peer" defaultChecked disabled />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400 border border-slate-600"></div>
          </label>
        </div>
      </div>
    </motion.section>
  );
}
