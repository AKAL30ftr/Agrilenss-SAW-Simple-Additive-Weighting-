import HeroSection from '@/components/HeroSection';
import SAWMethodology from '@/components/SAWMethodology';

export default function Home() {
  return (
    <div className="space-y-16 pb-10 w-full">
      <HeroSection />

      {/* SAW Formula Section */}
      <div className="max-w-[1200px] mx-auto px-6">
        <SAWMethodology />
      </div>

      {/* Komoditas Section */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="glass-card p-6 md:p-8 rounded-xl">
          <h2 className="text-2xl text-white font-bold mb-2">Komoditas yang Didukung</h2>
          <p className="text-slate-400 mb-6 text-sm">Enam komoditas utama yang menjadi fokus sistem rekomendasi ini</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { emoji: '🌾', name: 'Padi' },
              { emoji: '🌽', name: 'Jagung' },
              { emoji: '🫘', name: 'Kedelai' },
              { emoji: '🌶️', name: 'Cabai' },
              { emoji: '🧅', name: 'Bawang Merah' },
              { emoji: '🧄', name: 'Bawang Putih' },
            ].map((c) => (
              <div key={c.name} className="p-4 bg-white/5 rounded-xl border border-white/10 text-center hover:border-emerald-400/30 transition-colors">
                <div className="text-3xl mb-2">{c.emoji}</div>
                <div className="text-white text-sm font-medium">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tahapan Sistem */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="glass-card p-6 md:p-8 rounded-xl">
          <h2 className="text-2xl text-white font-bold mb-2">Alur Kerja Sistem</h2>
          <p className="text-slate-400 mb-6 text-sm">Dua tahap filter untuk menghasilkan rekomendasi terbaik</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Input Kondisi Lahan', desc: 'Petani memasukkan data ketinggian, curah hujan, pH, tekstur tanah, dan intensitas cahaya melalui chat interaktif.' },
              { step: '02', title: 'Filter 1 — Kesesuaian Lingkungan', desc: 'Sistem mengeliminasi komoditas yang tidak cocok secara agroklimat menggunakan Rule Based + SAW berbobot tanah (45%) dan curah hujan (55%).' },
              { step: '03', title: 'Filter 2 — Analisis Keuntungan', desc: 'Komoditas yang lolos dihitung keuntungannya berdasarkan biaya produksi, harga jual, produktivitas, risiko, dan permintaan pasar.' },
              { step: '04', title: 'Rekomendasi', desc: 'Hasil akhir berupa ranking komodasi terbaik: Winner, Runner-up, dan Dark Horse beserta penjelasan alasan.' },
            ].map((s) => (
              <div key={s.step} className="p-5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-emerald-400 font-black text-2xl mb-2 opacity-50">{s.step}</div>
                <h4 className="text-white mb-2 font-heading font-bold">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
