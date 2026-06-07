import ChatWidget from '@/components/ChatWidget';

export default function Analyze() {
  return (
    <div className="w-full h-[100dvh] md:h-auto md:pt-24 md:pb-8">
      <div className="w-full h-full md:max-w-[1200px] md:px-6 md:mx-auto flex flex-col">
        <div className="hidden md:block mb-6">
          <h1 className="text-4xl font-extrabold text-emerald-400 mb-2 tracking-tight">Sistem Rekomendasi Tanaman</h1>
          <p className="text-white/60 font-medium">Masukkan kondisi lingkungan untuk mendapatkan rekomendasi tanaman terbaik.</p>
        </div>
        <div className="flex-1 flex justify-center">
          <ChatWidget fullPage />
        </div>
      </div>
    </div>
  );
}
