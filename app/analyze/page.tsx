import ChatWidget from '@/components/ChatWidget';

export default function Analyze() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-emerald-400 mb-2 tracking-tight">Sistem Rekomendasi Tanaman</h1>
        <p className="text-white/60 font-medium">Masukkan kondisi lingkungan untuk mendapatkan rekomendasi tanaman terbaik.</p>
      </div>
      <div className="flex justify-center">
        <ChatWidget fullPage />
      </div>
    </div>
  );
}
