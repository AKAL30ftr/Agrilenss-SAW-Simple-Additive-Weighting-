'use client';

import { PARAM_TO_FAQ } from '@/lib/chat/constants';

interface EliminatedFaqLinksProps {
  outOfRangeParams: string[];
  onFaqClick: (param: string) => void;
  onReply: (value: string) => void;
}

export default function EliminatedFaqLinks({ outOfRangeParams, onFaqClick, onReply }: EliminatedFaqLinksProps) {
  return (
    <div className="pl-8 space-y-2" role="group" aria-label="FAQ untuk parameter bermasalah">
      <p className="text-xs text-white/50 font-medium mb-2">Pelajari cara memperbaiki kondisi lahan Bapak/Ibu:</p>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {outOfRangeParams.map((param) => {
          const mapping = PARAM_TO_FAQ[param];
          if (!mapping) return null;
          return (
            <button
              key={param}
              onClick={() => onFaqClick(param)}
              className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
            >
              {mapping.label}
            </button>
          );
        })}
        <button
          onClick={() => onReply('__ELIMINASI_KEMBALI__')}
          className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
