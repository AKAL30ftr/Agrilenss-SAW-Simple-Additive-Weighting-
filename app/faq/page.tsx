import { FAQ_CONTENT } from '@/lib/faq-content';

export default function FAQ() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-10 flex flex-col gap-8 pt-24 pb-12">
      <div className="glass-plate rounded-xl p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight font-heading">Pertanyaan Umum</h2>
        <p className="text-lg text-slate-300">Jawaban atas pertanyaan seputar metode SAW, komoditas pertanian, dan parameter lahan.</p>
      </div>

      {FAQ_CONTENT.map((section) => (
        <div key={section.id} className="glass-plate rounded-xl p-6">
          <h3 className="text-xl font-bold text-emerald-400 mb-4 font-heading">{section.title}</h3>
          <div className="space-y-4">
            {section.items.map((item) => (
              <details key={item.id} className="group">
                <summary className="cursor-pointer text-white font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors list-none flex justify-between items-center">
                  <span>{item.question}</span>
                  <span className="text-emerald-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 pl-3 pr-3 pb-3">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">{item.answer}</p>
                  {item.fixSuggestion && (
                    <div className="mt-3 p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                      <p className="text-emerald-300 text-sm font-medium">💡 Saran perbaikan:</p>
                      <p className="text-slate-300 text-sm mt-1">{item.fixSuggestion}</p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
