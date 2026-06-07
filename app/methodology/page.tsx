import MethodologyFoundation from '@/components/MethodologyFoundation';
import MethodologyCalculation from '@/components/MethodologyCalculation';
import MethodologyValidation from '@/components/MethodologyValidation';

export default function Methodology() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-12 pt-24">
      <section className="flex flex-col gap-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)] tracking-tight font-heading">Simple Additive Weighting</h2>
        <p className="text-lg text-white/70 max-w-3xl leading-relaxed">
          Metode SAW (Simple Additive Weighting) adalah metode penjumlahan terbobot yang digunakan untuk menentukan alternatif terbaik berdasarkan beberapa kriteria. Metode ini menjadi inti dari sistem pendukung keputusan pemilihan komoditas pertanian.
        </p>
      </section>

      <MethodologyFoundation />
      <MethodologyCalculation />
      <MethodologyValidation />
    </div>
  );
}
