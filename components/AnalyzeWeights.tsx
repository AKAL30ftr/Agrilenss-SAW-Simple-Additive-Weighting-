"use client";
import React from 'react';
import { Settings2 } from 'lucide-react';
import { useSAW } from '@/hooks/useSAW';

export default function AnalyzeWeights() {
  const { criteria } = useSAW();
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-lg font-bold text-white font-heading">SAW Weights Configuration</h3>
        <button className="text-xs font-bold bg-white/5 text-white/70 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 flex items-center gap-1 transition-colors">
          <Settings2 className="w-3 h-3" /> ADJUST
        </button>
      </div>
      
      <div className="flex-1 border border-white/5 rounded-xl overflow-hidden bg-black/20 flex flex-col justify-center">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
             <tr>
                <th className="px-6 py-4 border-b border-white/5">Criterion</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">Weight (SAW)</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium text-white/80">
            {criteria.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 text-base font-semibold">{item.name}</td>
                <td className="px-6 py-5 text-right text-emerald-400 font-mono text-base">{item.weight.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
