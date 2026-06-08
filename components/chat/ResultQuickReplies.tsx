'use client';

interface SurvivingCrop {
  name: string;
  score: string;
  normalizedValues?: Record<string, number>;
  explanation?: string;
}

interface ResultQuickRepliesProps {
  survivingCrops: SurvivingCrop[];
  onReply: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, value: string) => void;
}

export default function ResultQuickReplies({ survivingCrops, onReply, onKeyDown }: ResultQuickRepliesProps) {
  return (
    <div className="pl-8 space-y-2" role="group" aria-label="Hasil rekomendasi">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {survivingCrops.map((crop) => (
          <button
            key={crop.name}
            onClick={() => onReply(`__DETAIL__${crop.name}`)}
            onKeyDown={(e) => onKeyDown(e, `__DETAIL__${crop.name}`)}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Lihat detail {crop.name}
          </button>
        ))}
        <button
          onClick={() => onReply('__ULANGI_KONSULTASI__')}
          onKeyDown={(e) => onKeyDown(e, '__ULANGI_KONSULTASI__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          Ulangi konsultasi
        </button>
        <button
          onClick={() => onReply('__SELESAI__')}
          onKeyDown={(e) => onKeyDown(e, '__SELESAI__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
