'use client';

import { Bot } from 'lucide-react';
import { PARAM_ORDER, PARAM_LABELS } from '@/lib/chat/constants';
import { sapaan } from '@/lib/chat/helpers';

interface ConfirmingCardProps {
  collectedParams: Record<string, unknown>;
  userName: string;
  userGender: 'laki' | 'perempuan';
}

export default function ConfirmingCard({
  collectedParams,
  userName,
  userGender,
}: ConfirmingCardProps) {
  return (
    <div className="flex gap-2 max-w-[92%]">
      <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
        <Bot className="w-3 h-3 text-emerald-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
        <p className="text-slate-200 text-sm font-semibold mb-2">Baik, {sapaan(userGender)}! Semua data lahan sudah terkumpul. Silakan periksa dulu, apakah data di bawah ini sudah benar:</p>
        <div className="space-y-1.5 mb-3">
          {PARAM_ORDER.map((key) => {
            const val = collectedParams[key];
            if (val == null) return null;
            const meta = PARAM_LABELS[key];
            if (!meta) return null;
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span>{meta.emoji}</span>
                <span className="text-white/60">{meta.label}:</span>
                <span className="text-emerald-300 font-medium">{meta.format(val)}</span>
              </div>
            );
          })}
        </div>
        <p className="text-white/50 text-xs">Kalau ada yang salah, saya bisa ulangi dari awal.</p>
      </div>
    </div>
  );
}
