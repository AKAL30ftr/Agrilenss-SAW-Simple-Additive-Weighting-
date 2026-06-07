import FAQAccordion from '@/components/FAQAccordion';
import FAQEducationalCards from '@/components/FAQEducationalCards';

export default function FAQ() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-10 flex flex-col gap-8 pt-4">
      <div className="glass-plate rounded-xl p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md font-heading">Pertanyaan Umum</h2>
        <p className="text-lg text-slate-300">Jawaban atas pertanyaan seputar metode Simple Additive Weighting (SAW) dan cara kerja sistem rekomendasi komoditas pertanian.</p>
      </div>

      <FAQAccordion />
      <FAQEducationalCards />
    </div>
  );
}
