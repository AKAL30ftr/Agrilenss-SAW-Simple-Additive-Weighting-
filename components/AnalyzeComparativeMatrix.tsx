"use client";
import React from 'react';
import { motion } from 'motion/react';
import { useSAW } from '@/hooks/useSAW';

export default function AnalyzeComparativeMatrix() {
  const { results } = useSAW();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 md:p-8 rounded-2xl"
    >
       <h3 className="text-xl font-bold text-white mb-8 font-heading">Comparative Score Matrix</h3>
      <div className="space-y-8 px-2">
          {results.length === 0 ? (
            <div className="text-white/40 text-sm text-center py-10 font-medium">No alternatives added yet.</div>
          ) : (
            results.map((item, i) => {
              const isTop = i === 0;
              const color = isTop ? "bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.3)]" : (i === 1 ? "bg-emerald-400/70" : "bg-emerald-400/40");
              const textC = isTop ? "text-emerald-400" : (i === 1 ? "text-white/80" : "text-white/60");
              
              return (
                <div key={item.alternativeId}>
                  <div className="flex justify-between items-end mb-3">
                     <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{item.name}</span>
                     <span className={`text-sm font-mono font-bold ${textC}`}>{item.preferenceScore.toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-sm h-6 overflow-hidden">
                    <motion.div 
                      className={`h-full ${color} rounded-sm`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(item.preferenceScore * 100, 2)}%` }}
                      viewport={{ once: false }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.15 }}
                    />
                  </div>
                </div>
              );
            })
          )}
       </div>
    </motion.section>
  );
}
