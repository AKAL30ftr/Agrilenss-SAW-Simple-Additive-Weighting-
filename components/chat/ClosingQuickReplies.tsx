'use client';

interface ClosingQuickRepliesProps {
  onReply: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, value: string) => void;
}

export default function ClosingQuickReplies({ onReply, onKeyDown }: ClosingQuickRepliesProps) {
  return (
    <div className="pl-8 space-y-2" role="group" aria-label="Penutup">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <button
          onClick={() => onReply('__CLOSING_ULANGI__')}
          onKeyDown={(e) => onKeyDown(e, '__CLOSING_ULANGI__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          Konsultasi ulang
        </button>
        <button
          onClick={() => onReply('__CLOSING_BERANDA__')}
          onKeyDown={(e) => onKeyDown(e, '__CLOSING_BERANDA__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
        >
          Kembali ke beranda
        </button>
      </div>
    </div>
  );
}
