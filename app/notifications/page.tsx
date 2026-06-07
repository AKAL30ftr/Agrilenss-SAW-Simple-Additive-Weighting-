import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="max-w-[700px] mx-auto px-6 pt-24 space-y-8">
      <div className="glass-plate rounded-xl p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-400/10 border-2 border-emerald-400/30 flex flex-col items-center justify-center mb-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
          <Bell className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white font-heading">Notifikasi</h1>
        <p className="text-white/60 mt-2">Fitur notifikasi akan tersedia pada Phase 3.</p>
      </div>
    </div>
  );
}
