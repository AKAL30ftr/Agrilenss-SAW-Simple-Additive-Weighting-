'use client';

import type { QuickReply } from '@/lib/chat/types';
import QuickReplyBar from '@/components/chat/QuickReplyBar';

interface CollectingViewProps {
  currentParam: string;
  currentTooltip: string | undefined;
  activeTooltip: string | null;
  quickReplies: QuickReply[];
  onReply: (value: string) => void;
  onTooltipToggle: (param: string | null) => void;
  isLoading: boolean;
}

export default function CollectingView({
  currentParam,
  currentTooltip,
  activeTooltip,
  quickReplies,
  onReply,
  onTooltipToggle,
  isLoading,
}: CollectingViewProps) {
  return (
    <div className="pl-8 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50 font-medium">
          Mengapa saya menanyakan <span className="text-emerald-400/70">{currentParam}</span>?
        </span>
        {currentTooltip && (
          <button
            onClick={() => onTooltipToggle(activeTooltip === currentParam ? null : currentParam)}
            className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center cursor-pointer ${activeTooltip === currentParam ? 'bg-emerald-400/30 border-emerald-400/60 text-emerald-300' : 'bg-white/5 border-white/20 text-white/40'}`}
            aria-label={`Penjelasan ${currentParam}`}
          >
            ⓘ
          </button>
        )}
      </div>
      {activeTooltip === currentParam && currentTooltip && (
        <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed">
          {currentTooltip}
        </div>
      )}
      <QuickReplyBar
        replies={quickReplies}
        onReply={onReply}
        disabled={isLoading}
        ariaLabel="Pilihan jawaban"
      />
    </div>
  );
}
