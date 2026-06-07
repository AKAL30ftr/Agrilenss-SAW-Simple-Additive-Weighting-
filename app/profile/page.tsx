import { Sprout, Github, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-24 pb-12">
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/20">
          <Sprout className="text-emerald-400 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 font-heading">Agri-SAW Pro</h1>
        <p className="text-slate-400 mb-2 text-sm">Sistem Pendukung Keputusan Pemilihan Komoditas Pertanian</p>
        <p className="text-slate-500 mb-8 text-xs">Menggunakan Metode Simple Additive Weighting (SAW)</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/analyze" className="px-6 py-3 bg-emerald-400 text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-300 transition-all">
            Mulai Konsultasi
          </Link>
          <Link href="/methodology" className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
            Metode SAW
          </Link>
        </div>

        <div className="border-t border-white/10 pt-6 mt-6">
          <p className="text-slate-500 text-xs mb-4">Fitur Auth & Persistence (Phase 3) — Coming Soon</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Supabase Auth', 'Simpan Riwayat', 'Profil Pengguna', 'Statistik'].map((f) => (
              <span key={f} className="px-3 py-1 bg-white/5 rounded-full text-slate-500 text-xs border border-white/5">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tim Pengembang */}
      <div className="glass-card rounded-xl p-8 mt-8">
        <h2 className="text-xl font-bold text-white mb-4 text-center font-heading">Tim Pengembang</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { nama: 'Aisyah Ayudia Inara', nim: '23106050020' },
            { nama: 'Ihwanika Fazli Pratama', nim: '23106050048' },
            { nama: 'Athalia Evelina Maharani', nim: '23106050085' },
            { nama: 'Aqib Khoiruzaman', nim: '23106050069' },
          ].map((m) => (
            <div key={m.nim} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-white text-sm font-medium">{m.nama}</div>
              <div className="text-slate-500 text-xs mt-1">NIM: {m.nim}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs text-center mt-4">Program Studi Informatika • Fakultas Sains dan Teknologi • 2026</p>
      </div>
    </div>
  );
}
