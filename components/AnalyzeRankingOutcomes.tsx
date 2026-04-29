"use client";
import { Filter, Award } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { useSAW } from '@/hooks/useSAW';

export default function AnalyzeRankingOutcomes() {
  const { results } = useSAW();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
         <h3 className="text-xl font-bold text-white font-heading">Ranking Outcomes</h3>
         <Filter className="text-white/40 cursor-pointer w-5 h-5" />
      </div>
      <div className="w-full overflow-x-hidden">
        <table className="w-full text-left border-collapse table-auto sm:min-w-0">
          <thead>
            <tr className="bg-white/5 text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest">
              <th className="px-2 py-3 sm:px-4 w-10 sm:w-16 text-center">Rank</th>
              <th className="px-2 sm:px-4 py-3">Commodity</th>
              <th className="px-1 sm:px-4 py-3 text-center sm:text-left">Status</th>
              <th className="px-2 sm:px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 font-body text-xs sm:text-sm">
            {results.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/40 text-sm">No outcomes to display.</td>
              </tr>
            ) : (
              results.map((item, index) => {
                const rank = index + 1;
                const isTop = rank === 1;
                
                return (
                  <tr key={item.alternativeId} className={isTop ? "bg-emerald-400/5" : "hover:bg-white/5 transition-colors"}>
                    <td className={`px-2 sm:px-4 py-4 text-center ${!isTop ? "font-medium text-white/40" : ""}`}>
                      {isTop ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-black text-emerald-400">#1</span>
                          <Award className="text-emerald-400 w-4 h-4 hidden sm:block" />
                        </div>
                      ) : (
                        `#${rank}`
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-4">
                      <div className={`text-xs sm:text-sm ${isTop ? "font-bold text-white" : "text-white/80"}`}>{item.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-white/40 leading-tight mt-0.5 max-w-[100px] sm:max-w-none truncate sm:whitespace-normal">
                        Score breakdown available
                      </div>
                    </td>
                    <td className="px-1 sm:px-4 py-4 text-center sm:text-left">
                       <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-400/10 text-emerald-400 text-[8px] sm:text-[9px] font-black rounded-full border border-emerald-400/20">OPT</span>
                    </td>
                    <td className={`px-2 sm:px-4 py-4 text-right font-mono font-bold text-base sm:text-lg ${isTop ? "text-emerald-400" : "text-white/80"}`}>
                      {item.preferenceScore.toFixed(3)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
