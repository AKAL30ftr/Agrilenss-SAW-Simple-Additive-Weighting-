import FAQAccordion from '@/components/FAQAccordion';
import FAQEducationalCards from '@/components/FAQEducationalCards';

export default function FAQ() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-10 flex flex-col gap-8 pt-24">
      {/* Page Header */}
      <div className="glass-plate rounded-xl p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md font-heading">Decision Support FAQ</h2>
        <p className="text-lg text-slate-300">Expert guidance and frequently asked questions regarding the Simple Additive Weighting (SAW) methodology used in AgriLens DSS recommendations.</p>
      </div>

      <FAQAccordion />
      <FAQEducationalCards />
    </div>
  );
}
