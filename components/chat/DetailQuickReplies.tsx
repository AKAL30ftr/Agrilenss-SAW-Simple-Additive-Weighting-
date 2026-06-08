'use client';

interface DetailQuickRepliesProps {
  onReply: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, value: string) => void;
}

export default function DetailQuickReplies({ onReply, onKeyDown }: DetailQuickRepliesProps) {
  return (
    <div className="pl-8 space-y-2" role="group" aria-label="Detail tanaman">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <button
          onClick={() => onReply('__DETAIL_KEMBALI__')}
          onKeyDown={(e) => onKeyDown(e, '__DETAIL_KEMBALI__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          Kembali ke hasil
        </button>
        <button
          onClick={() => onReply('__DETAIL_ULANGI__')}
          onKeyDown={(e) => onKeyDown(e, '__DETAIL_ULANGI__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          Ulangi konsultasi
        </button>
        <button
          onClick={() => onReply('__DETAIL_SELESAI__')}
          onKeyDown={(e) => onKeyDown(e, '__DETAIL_SELESAI__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
