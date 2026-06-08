'use client';

import type { FaqView } from '@/lib/chat/types';
import type { FaqSection, FaqItem } from '@/lib/faq-content';
import { FAQ_CONTENT } from '@/lib/faq-content';
import { PARAM_TO_FAQ } from '@/lib/chat/constants';

interface FaqViewProps {
  faqView: FaqView;
  faqSelectedSection: FaqSection | null;
  faqSelectedItem: FaqItem | null;
  onCategorySelect: (section: FaqSection) => void;
  onItemSelect: (item: FaqItem) => void;
  onBack: () => void;
}

export default function FaqViewComponent({
  faqView,
  faqSelectedSection,
  faqSelectedItem,
  onCategorySelect,
  onItemSelect,
  onBack,
}: FaqViewProps) {
  if (faqView === 'none') return null;

  if (faqView === 'categories') {
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Kategori FAQ">
        <p className="text-xs text-white/50 font-medium mb-2">Silakan pilih topik yang ingin dipelajari:</p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          {FAQ_CONTENT.map((section) => (
            <button
              key={section.id}
              onClick={() => onCategorySelect(section)}
              className="text-xs px-3 py-2.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all cursor-pointer min-h-[44px]"
            >
              {section.title}
            </button>
          ))}
          <button
            onClick={() => { onBack(); }}
            className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
          >
            ← Kembali ke ringkasan
          </button>
        </div>
      </div>
    );
  }

  if (faqView === 'items' && faqSelectedSection) {
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Item FAQ">
        <p className="text-xs text-white/50 font-medium mb-2">Pilih pertanyaan tentang {faqSelectedSection.title.toLowerCase()}:</p>
        <div className="flex flex-col gap-2">
          {faqSelectedSection.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemSelect(item)}
              className="text-left text-xs px-3 py-2.5 rounded-lg border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all cursor-pointer"
            >
              {item.question}
            </button>
          ))}
          <button
            onClick={onBack}
            className="text-xs px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer self-start"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  if (faqView === 'answer' && faqSelectedItem) {
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Jawaban FAQ">
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
          <p className="text-xs text-blue-300 font-semibold mb-1">{faqSelectedItem.question}</p>
          <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed">{faqSelectedItem.answer}</p>
          {faqSelectedItem.fixSuggestion && (
            <div className="mt-2 pt-2 border-t border-blue-400/20">
              <p className="text-xs text-emerald-300 font-medium">💡 Cara mengatasi:</p>
              <p className="text-xs text-white/60 whitespace-pre-line">{faqSelectedItem.fixSuggestion}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => { onBack(); }}
          className="text-xs px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer"
        >
          ← Kembali ke ringkasan
        </button>
      </div>
    );
  }

  return null;
}
