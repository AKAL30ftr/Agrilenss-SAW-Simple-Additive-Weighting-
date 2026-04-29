"use client";
import { Rocket, Upload, Bot } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { useSAW } from '@/hooks/useSAW';

export default function AnalyzeInput() {
  const { criteria, draftAlternative, setDraftAlternative, addAlternative } = useSAW();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftAlternative(prev => ({ ...prev, name: e.target.value }));
  };

  const handleValueChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setDraftAlternative(prev => ({
      ...prev,
      values: {
        ...(prev.values || {}),
        [id]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleSubmit = () => {
    if (!draftAlternative.name) {
      alert("Please enter a name for the alternative");
      return;
    }

    addAlternative({
      name: draftAlternative.name,
      values: draftAlternative.values || {},
    });

    // Reset the draft after submitting
    setDraftAlternative({ name: '', values: {} });
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-12 lg:col-span-5 glass-card p-6 md:p-8 rounded-2xl flex flex-col"
    >
       <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-heading">Input Parameters</h2>
          <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-400/20">NEW ANALYSIS</span>
       </div>
       
       <div className="space-y-8">
         <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 font-heading">Nama Tanaman</label>
            <input 
              value={draftAlternative.name || ''}
              onChange={handleNameChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 outline-none transition-all placeholder:text-white/20" 
              placeholder="e.g. Winter Wheat - Northern Cape" 
              type="text"
            />
         </div>
         
         <div className="pt-6 border-t border-white/10">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 font-heading">Criteria Values</label>
            
            <div className="grid grid-cols-2 gap-4">
              {criteria.map((item, i) => {
                const isLastAndOdd = i === criteria.length - 1 && criteria.length % 2 !== 0;
                const spanClass = isLastAndOdd ? "col-span-2" : "col-span-1";
                
                return (
                  <div key={item.id} className={`flex flex-col gap-2 ${spanClass}`}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <label className="text-sm font-semibold text-white/80">{item.name}</label>
                      <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        {Math.round(item.weight * 100)}% ({item.type === 'benefit' ? 'B' : 'C'})
                      </span>
                    </div>
                    <input 
                      value={draftAlternative.values?.[item.id] || ''}
                      onChange={(e) => handleValueChange(item.id, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 outline-none transition-all placeholder:text-white/20 text-sm" 
                      placeholder="Enter value" 
                      type="number"
                    />
                  </div>
                );
              })}
            </div>
            
         </div>
       </div>
       
       <div className="mt-auto pt-8 flex flex-col gap-6">
          {/* AI Helper Card */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
            <div className="p-2 bg-emerald-400/10 rounded-lg shrink-0">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-400 mb-0.5">Need help?</h4>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Stuck with parameters? Ask our <button className="text-emerald-400 hover:underline font-semibold cursor-pointer">AI Assistant</button> for guidance.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
            <button 
              onClick={handleSubmit}
              className="w-full bg-emerald-400 text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-300 transition-all active:scale-[0.98]"
            >
               Submit & Rank
               <Rocket className="w-5 h-5" />
            </button>
            <button className="w-full bg-white/5 text-white/70 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all">
              <Upload className="w-5 h-5" />
              Bulk Import CSV
            </button>
          </div>
       </div>
    </motion.section>
  );
}
