'use client';

import type { QuickReply } from '@/lib/chat/types';

interface QuickReplyBarProps {
  replies: QuickReply[];
  onReply: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  variantStyle?: 'default' | 'faq';
}

export default function QuickReplyBar({
  replies,
  onReply,
  onKeyDown,
  disabled = false,
  ariaLabel = 'Pilihan jawaban',
  variantStyle = 'default',
}: QuickReplyBarProps) {
  const handleKeyDown = onKeyDown || ((e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReply(value); }
  });

  return (
    <div className="pl-8 space-y-2">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {replies.map((qr) => {
          const isEscape = qr.value.startsWith('__ESCAPE');
          const baseClass = variantStyle === 'faq'
            ? 'border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20'
            : isEscape
              ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
              : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20';
          return (
            <button
              key={qr.value}
              onClick={() => onReply(qr.value)}
              onKeyDown={(e) => handleKeyDown(e, qr.value)}
              tabIndex={0}
              role="button"
              aria-label={qr.label}
              disabled={disabled}
              className={`text-xs px-3 py-2.5 rounded-full border transition-all cursor-pointer disabled:opacity-50 min-h-[44px] ${baseClass}`}
            >
              {qr.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
