import { FunctionSquare } from 'lucide-react';
import React from 'react';

export default function SAWMethodology() {
  return (
    <div className="glass-card p-6 md:p-8 rounded-xl">
      <div className="flex flex-col lg:flex-row gap-12 items-stretch">
        <div className="lg:w-1/2">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center border border-emerald-400/30">
              <FunctionSquare className="text-emerald-400 w-6 h-6" />
            </div>
            <h2 className="text-2xl text-white font-bold">Metode SAW</h2>
          </div>
          <p className="text-slate-400 mb-8 leading-relaxed font-body">
            Simple Additive Weighting (SAW) adalah metode penjumlahan terbobot yang digunakan untuk menentukan alternatif terbaik berdasarkan beberapa kriteria. Nilai preferensi dihitung dengan menjumlahkan nilai setiap alternatif yang telah dinormalisasi dan dikalikan dengan bobot masing-masing kriteria.
          </p>
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-10 text-center border border-emerald-400/20 shadow-inner">
            <div className="text-emerald-400 tracking-[0.2em] text-3xl md:text-4xl mb-3 font-heading">V<sub>i</sub> = ∑ (w<sub>j</sub> × r<sub>ij</sub>)</div>
            <div className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold">Rumus Umum SAW</div>
          </div>
        </div>
        
        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full w-full">
          {[
            { step: "01", title: "Normalisasi", desc: "Mengubah nilai berbagai kriteria ke dalam skala yang sama (0-1) berdasarkan jenis atribut benefit atau cost." },
            { step: "02", title: "Pemberian Bobot", desc: "Menetapkan tingkat kepentingan setiap kriteria sesuai dengan tujuan keputusan." },
            { step: "03", title: "Agregasi", desc: "Menjumlahkan hasil perkalian bobot dan nilai ternormalisasi untuk mendapatkan skor akhir." },
            { step: "04", title: "Perangkingan", desc: "Mengurutkan alternatif berdasarkan skor tertinggi hingga terendah." }
          ].map((s, i) => (
            <div key={i} className="p-5 glass-card rounded-xl border border-white/5 flex flex-col justify-center">
              <div className="text-emerald-400 font-black text-2xl mb-2 opacity-50">{s.step}</div>
              <h4 className="text-white mb-2 font-heading font-bold">{s.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
