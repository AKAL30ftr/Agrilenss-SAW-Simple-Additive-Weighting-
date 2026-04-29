"use client";
import { BadgeCheck } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function MethodologyValidation() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="glass-plate rounded-xl p-8 mt-4 border-l-4 border-l-emerald-500 flex flex-col md:flex-row gap-8 items-start md:items-center shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]"
    >
      <div className="flex-shrink-0 bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.2)]">
        <BadgeCheck className="text-emerald-400 w-10 h-10" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 font-heading">Agronomic Validation</h3>
        <p className="text-base text-white/70 leading-relaxed font-body">
          The weight matrices applied in our SAW calculations are subject to continuous review by a panel of certified agronomists and regional extension specialists. Adjustments are made seasonally to account for shifting macro-climate trends and emerging soil science methodologies.
        </p>
      </div>
    </motion.section>
  );
}
