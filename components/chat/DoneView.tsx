'use client';

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

export default function DoneView({
  survivingCrops,
  eliminatedCrops,
  darkHorse,
  onReply,
}: DoneViewProps) {
  return (
    <>
      {/* ── Valid / Recommendation section ── */}
      {survivingCrops.length > 0 && (
        <div className="flex gap-2 max-w-[92%]">
          <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
            <Bot className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-emerald-400/5 backdrop-blur-md border-emerald-400/20 w-full">
            <p className="text-emerald-300 text-xs font-semibold mb-2">
              🏆 Rekomendasi (kondisi sesuai):
            </p>
            <div className="space-y-1.5">
              {survivingCrops.map((crop, i) => (
                <div key={crop.name} className="text-xs">
                  <span className="text-white/70 font-medium">
                    {i + 1}. {crop.name}
                  </span>{' '}
                  <span className="text-emerald-300">— skor SAW: {crop.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Dark Horse section ── */}
      {darkHorse.length > 0 && (
        <div className="flex gap-2 max-w-[92%]">
          <div className="w-6 h-6 rounded-full bg-amber-400/20 flex-shrink-0 flex items-center justify-center border border-amber-400/30 mt-1">
            <Bot className="w-3 h-3 text-amber-400" />
          </div>
          <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-amber-400/5 backdrop-blur-md border-amber-400/20 w-full">
            <p className="text-amber-300 text-xs font-semibold mb-2">
              🐴 Dark Horse (perlu perhatian tambahan)
            </p>
            <div className="space-y-2">
              {darkHorse.map((crop) => (
                <div key={crop.cropName} className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/70 font-medium">{crop.cropName}</span>
                    <span className="text-amber-300 font-mono">
                      kedekatan: {Math.round(crop.totalProximity * 100)}%
                    </span>
                  </div>
                  {crop.failReasons.length > 0 && (
                    <div className="ml-2 space-y-0.5">
                      {crop.failReasons.map((reason, j) => (
                        <div key={j} className="text-white/50">
                          ⚠️ {reason}
                        </div>
                      ))}
                    </div>
                  )}
                  {crop.advice && (
                    <div className="ml-2 mt-1 text-amber-200/70">
                      💡 {crop.advice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Eliminated section ── */}
      {eliminatedCrops.length > 0 && (
        <div className="flex gap-2 max-w-[92%]">
          <div className="w-6 h-6 rounded-full bg-red-400/20 flex-shrink-0 flex items-center justify-center border border-red-400/30 mt-1">
            <Bot className="w-3 h-3 text-red-400" />
          </div>
          <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-red-400/5 backdrop-blur-md border-red-400/20 w-full">
            <p className="text-red-300 text-xs font-semibold mb-2">
              ❌ Tidak disarankan:
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
            {survivingCrops.map((crop) => (
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
