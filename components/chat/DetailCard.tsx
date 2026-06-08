'use client';

import { Bot } from 'lucide-react';

interface DetailCardProps {
  crop: {
    name: string;
    score: string;
    normalizedValues?: Record<string, number>;
    explanation?: string;
  };
}

export default function DetailCard({ crop }: DetailCardProps) {
  const nv = crop.normalizedValues || {};
  const criteriaLabels: Record<string, string> = {
    biaya_produksi: 'Biaya Produksi',
    harga_jual: 'Harga Jual',
    produktivitas: 'Produktivitas',
    risiko: 'Risiko',
    permintaan: 'Permintaan Pasar',
  };

  return (
    <div className="flex gap-2 max-w-[92%]">
      <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
        <Bot className="w-3 h-3 text-emerald-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
        <p className="text-slate-200 text-sm font-semibold mb-2">Detail penilaian: {crop.name}</p>
        <p className="text-white/50 text-xs mb-2">Berikut rincian penilaian untuk {crop.name}:</p>
        <div className="space-y-1.5">
          {Object.entries(nv).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-white/60">{criteriaLabels[key] || key}:</span>
              <span className="text-emerald-300 font-medium">{typeof val === 'number' ? val.toFixed(3) : val}</span>
            </div>
          ))}
        </div>
        {crop.explanation && (
          <p className="text-white/50 text-xs mt-2 pt-2 border-t border-white/10">{crop.explanation}</p>
        )}
      </div>
    </div>
  );
}
