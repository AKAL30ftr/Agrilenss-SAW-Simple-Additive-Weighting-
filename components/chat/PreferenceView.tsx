'use client';

import { PREFERENCE_OPTIONS, MAX_PREFERENCE_SELECTION } from '@/lib/chat/constants';

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
  const hasMaxSelection = selectedPreferences.length >= MAX_PREFERENCE_SELECTION;
  return (
    <div className="pl-8 space-y-2" role="group" aria-label="Preferensi">
      <div className="flex flex-col gap-2">
        {PREFERENCE_OPTIONS.map((opt) => {
          const sel = selectedPreferences.includes(opt.criterionId);
          const disabled = !sel && hasMaxSelection;
          return (
            <button
              key={opt.id}
              onClick={() => !disabled && onToggle(opt.criterionId)}
              role="checkbox"
              aria-checked={sel}
              disabled={disabled}
              className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all min-h-[44px] ${sel ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200 cursor-pointer' : disabled ? 'bg-white/5 border-white/10 text-slate-300 opacity-50 cursor-not-allowed' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 cursor-pointer'}`}
            >
              <span className="mr-2">{sel ? '✅' : '⬜'}</span>{opt.label}
            </button>
          );
        })}
          <p className="text-xs text-slate-400 text-center pt-1">
            Pilih sampai {MAX_PREFERENCE_SELECTION} prioritas
          </p>
        <button
          onClick={onSubmit}
          disabled={isLoading || selectedPreferences.length === 0}
          tabIndex={0}
          className="w-full text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px] font-bold disabled:opacity-50"
        >
          Hitung Ranking
        </button>
      </div>
    </div>
  );
}
