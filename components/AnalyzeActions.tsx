"use client";

import React from 'react';
import { Rocket, Upload } from 'lucide-react';
import { useSAW } from '@/hooks/useSAW';

export default function AnalyzeActions() {
  const { draftAlternative, addAlternative, setDraftAlternative } = useSAW();

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
    <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-3">
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
  );
}
