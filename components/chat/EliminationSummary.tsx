'use client';

import { Bot } from 'lucide-react';
import { sapaan } from '@/lib/chat/helpers';

interface EliminatedCrop {
  name: string;
  reasons: string[];
}

interface EliminationSummaryProps {
  eliminatedCrops: EliminatedCrop[];
  userGender: 'laki' | 'perempuan';
}

export default function EliminationSummary({ eliminatedCrops, userGender }: EliminationSummaryProps) {
  return (
    <div className="flex gap-2 max-w-[92%]">
      <div className="w-6 h-6 rounded-full bg-amber-400/20 flex-shrink-0 flex items-center justify-center border border-amber-400/30 mt-1">
        <Bot className="w-3 h-3 text-amber-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-amber-400/5 backdrop-blur-md border-amber-400/20 w-full">
        <p className="text-amber-300 text-xs font-semibold mb-2">
          Tanaman yang tidak cocok dengan lahan {sapaan(userGender)}:
        </p>
        <div className="space-y-1.5">
          {eliminatedCrops.map((crop) => (
            <div key={crop.name} className="text-xs">
              <span className="text-white/70 font-medium">• {crop.name}:</span>{' '}
              <span className="text-white/50">{crop.reasons[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
