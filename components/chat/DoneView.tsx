'use client';
// Crop name → emoji mapping (matches page.tsx)
const CROP_EMOJI: Record<string, string> = {
  'Padi': '🌾',
  'Jagung': '🌽',
  'Kedelai': '🫘',
  'Cabai Merah': '🌶️',
  'Bawang Merah': '🧅',
  'Bawang Putih': '🧄',
};

import { Bot } from 'lucide-react';

interface SurvivingCrop {
  name: string;
  score: string;
  normalizedValues?: Record<string, number>;
  explanation?: string;
}

interface EliminatedCrop {
  name: string;
  reasons: string[];
}

interface DarkHorseCrop {
  cropName: string;
  totalProximity: number;
  failReasons: string[];
  advice: string;
}

interface DoneViewProps {
  survivingCrops: SurvivingCrop[];
  eliminatedCrops: EliminatedCrop[];
  darkHorse: DarkHorseCrop[];
  selectedCropDetail: { name: string; score: string } | null;
  onReply: (value: string) => void;
}

/** Ranking label per rank (1-indexed) */
function getRankingLabel(rank: number, total: number): string {
  if (total === 1) return 'Paling cocok';
  switch (rank) {
    case 1: return 'Paling cocok';
    case 2: return 'Tidak kalah bagus';
    case 3: return 'Dapat dipertimbangkan';
    default: return 'Dapat dipertimbangkan';
  }
}

/** Get the top N crops from the surviving list */
function topNCrops(crops: SurvivingCrop[], n: number): SurvivingCrop[] {
  return crops.slice(0, n);
}

export default function DoneView({
  survivingCrops,
  eliminatedCrops,
  darkHorse,
  onReply,
}: DoneViewProps) {
  const totalSurviving = survivingCrops.length;
  const displayCrops = topNCrops(survivingCrops, 3);
  const hasMore = totalSurviving > 3;

  return (
    <>
      {/* ── Top 3 Ranking section ── */}
      {survivingCrops.length > 0 && (
        <div className="flex gap-2 max-w-[92%]">
          <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
            <Bot className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-emerald-400/5 backdrop-blur-md border-emerald-400/20 w-full">
            <p className="text-emerald-300 text-xs font-semibold mb-2">
              🏆 Rekomendasi terbaik untuk lahan Bapak:
            </p>
            <div className="space-y-3">
              {displayCrops.map((crop, i) => {
                const rank = i + 1;
                const label = getRankingLabel(rank, totalSurviving);
                const emoji = CROP_EMOJI[crop.name] ?? '🌱';
                return (
                  <div key={crop.name} className="text-xs">
                    <div className="text-white/90 font-medium">
                      {emoji} {crop.name}: {label}
                    </div>
                    {crop.explanation && (
                      <p className="text-white/60 mt-0.5 ml-5 leading-relaxed">
                        {crop.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {hasMore && (
              <p className="text-white/40 text-xs mt-2 italic">
                Ada {totalSurviving - 3} tanaman lain yang juga lolos tapi skornya lebih rendah.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Eliminated section (only when 1 surviving) ── */}
      {totalSurviving === 1 && eliminatedCrops.length > 0 && (
        <div className="flex gap-2 max-w-[92%]">
          <div className="w-6 h-6 rounded-full bg-red-400/20 flex-shrink-0 flex items-center justify-center border border-red-400/30 mt-1">
            <Bot className="w-3 h-3 text-red-400" />
          </div>
          <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-red-400/5 backdrop-blur-md border-red-400/20 w-full">
            <p className="text-red-300 text-xs font-semibold mb-2">
              ❌ Tidak lolos ({eliminatedCrops.length} tanaman):
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
      )}

      {/* ── Quick replies ── */}
      {survivingCrops.length > 0 && (
        <div className="pl-8 space-y-2" role="group" aria-label="Hasil rekomendasi">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {displayCrops.map((crop) => (
              <button
                key={crop.name}
                onClick={() => onReply(`__DETAIL__${crop.name}`)}
                tabIndex={0}
                className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
              >
                Lihat detail {crop.name}
              </button>
            ))}
            <button
              onClick={() => onReply('__ULANGI_KONSULTASI__')}
              tabIndex={0}
              className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
            >
              Ulangi konsultasi
            </button>
            <button
              onClick={() => onReply('__SELESAI__')}
              tabIndex={0}
              className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}
