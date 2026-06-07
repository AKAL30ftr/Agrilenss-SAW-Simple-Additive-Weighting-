'use client';

import { Brain, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => 
      prev.includes(index) 
        ? prev.filter((i) => i !== index) 
        : [...prev, index]
    );
  };

  const faqs = [
    {
      q: "Apa keuntungan utama metode SAW untuk pemilihan komoditas?",
      a: "Metode Simple Additive Weighting (SAW) memberikan evaluasi yang transparan dan proporsional terhadap beberapa kriteria. Keuntungan utamanya adalah kesederhanaan dan kemudahan interpretasi. Metode ini memungkinkan perencana pertanian untuk menetapkan bobot yang jelas pada faktor-faktor vital seperti pH tanah, produktivitas, dan kebutuhan air, menghasilkan daftar tanaman yang layak secara terperinci."
    },
    {
      q: "Apa keterbatasan penggunaan metode SAW?",
      a: "Salah satu keterbatasan SAW adalah sangat bergantung pada akurasi bobot yang ditetapkan dan teknik normalisasi. Kriteria yang diberi bobot buruk atau hubungan non-linear mungkin tidak tertangkap dengan sempurna. Namun, sistem kami menggunakan bobot agronomi yang telah divalidasi dan diverifikasi dengan perhitungan spreadsheet manual."
    },
    {
      q: "Bagaimana data diperoleh dan dinormalisasi untuk perhitungan SAW?",
      a: "Metrik seperti kualitas tanah, curah hujan, biaya produksi, harga jual, produktivitas, risiko gagal panen, dan permintaan pasar dinormalisasi ke dalam skala 0-1 yang dapat dibandingkan menggunakan transformasi skala linear, memungkinkan variabel kualitatif dan kuantitatif diproses bersamaan."
    },
    {
      q: "Bagaimana cara kerja dua filter dalam sistem ini?",
      a: "Sistem menggunakan dua tahap filter. Filter 1 (Kesesuaian Lingkungan) menggunakan Rule Based + SAW untuk mengeliminasi komoditas yang tidak cocok secara agroklimat berdasarkan jenis tanah (bobot 45%) dan curah hujan (bobot 55%). Filter 2 (Analisis Keuntungan) meranking komoditas yang lolos berdasarkan biaya produksi, harga jual, produktivitas, risiko gagal panen, dan permintaan pasar."
    },
    {
      q: "Apa saja komoditas yang didukung sistem?",
      a: "Sistem mendukung enam komoditas utama: Padi, Jagung, Kedelai, Cabai Merah, Bawang Merah, dan Bawang Putih. Keenam komoditas ini merupakan tanaman pangan dan hortikultura yang banyak dibudidayakan di Indonesia."
    },
    {
      q: "Apakah sistem memerlukan koneksi internet?",
      a: "Perhitungan inti (Filter 1 + Filter 2) berjalan 100% lokal di browser tanpa memerlukan koneksi internet. fitur AI/RAG memerlukan koneksi internet dan API key, tetapi sistem tetap berfungsi tanpa AI menggunakan template respons bawaan."
    }
  ];

  return (
    <section className="glass-plate rounded-xl p-8 flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.15)]">
          <Brain className="text-emerald-400 w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-white font-heading">FAQ Metode SAW</h3>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-black/40 rounded-lg p-5 border border-white/5 hover:border-emerald-400/30 transition-colors">
            <button 
              onClick={() => toggleItem(index)}
              className="w-full flex justify-between items-center text-left focus:outline-none"
            >
               <h4 className={`font-semibold text-left ${openItems.includes(index) ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'text-white'}`}>
                {faq.q}
              </h4>
              <ChevronDown className={`text-slate-400 w-5 h-5 shrink-0 transition-transform ml-4 ${openItems.includes(index) ? 'rotate-180' : ''}`} />
            </button>
            {openItems.includes(index) && (
              <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                <p className="text-slate-300 leading-relaxed font-body text-sm md:text-base">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
