'use client';

import { PREFERENCE_OPTIONS } from '@/lib/chat/constants';

interface PreferenceViewProps {
  selectedPreferences: string[];
  onToggle: (criterionId: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function PreferenceView({
  selectedPreferences,
  onToggle,
  onSubmit,
  isLoading,
}: PreferenceViewProps) {
  return (
    <div className="pl-8 space-y-2" role="group" aria-label="Preferensi">
      <div className="flex flex-col gap-2">
        {PREFERENCE_OPTIONS.map((opt) => {
          const sel = selectedPreferences.includes(opt.criterionId);
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.criterionId)}
              role="checkbox"
              aria-checked={sel}
              className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all cursor-pointer min-h-[44px] ${sel ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
            >
              <span className="mr-2">{sel ? '✅' : '⬜'}</span>{opt.label}
            </button>
          );
        })}
        <button
          onClick={onSubmit}
          disabled={isLoading}
          tabIndex={0}
          className="w-full text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px] font-bold disabled:opacity-50"
        >
          Hitung Ranking
        </button>
      </div>
    </div>
  );
}
