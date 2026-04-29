'use client';

import { Brain, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => 
      prev.includes(index) 
        ? prev.filter((i) => i !== index) 
        : [...prev, index]
    );
  };

  const faqs = [
    {
      q: "What are the primary benefits of the SAW method for crop selection?",
      a: "The Simple Additive Weighting (SAW) method provides a transparent, proportional evaluation of multiple criteria. Its primary benefit is simplicity and ease of interpretation. It allows agricultural planners to assign clear weights to vital factors like soil pH, expected yield, and water requirements, generating a straightforward ranked list of viable crops."
    },
    {
      q: "What are the trade-offs or limitations of using SAW?",
      a: "One limitation of SAW is that it relies heavily on the accuracy of the assigned weights and normalization techniques. Poorly weighted criteria or non-linear relationships might not be captured perfectly. However, our system uses validated agronomic weights to mitigate this."
    },
    {
      q: "How is data sourced and normalized for the SAW calculations?",
      a: "Metrics like soil quality, rainfall, and market price are normalized into a comparable 0-1 scale using linear scale transformation, allowing qualitative and quantitative variables to be processed together smoothly."
    },
    {
      q: "Can I adjust the weights assigned to different criteria?",
      a: "Depending on your user role and profile settings, you can customize criteria weights to prioritize specific goals for your unique agricultural scenario."
    }
  ];

  return (
    <section className="glass-plate rounded-xl p-8 flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.15)]">
          <Brain className="text-emerald-400 w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-white font-heading">SAW Method FAQ</h3>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-black/40 rounded-lg p-5 border border-white/5 hover:border-emerald-400/30 transition-colors">
            <button 
              onClick={() => toggleItem(index)}
              className="w-full flex justify-between items-center text-left focus:outline-none"
            >
               <h4 className={`font-semibold ${openItems.includes(index) ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'text-white'}`}>
                {faq.q}
              </h4>
              <ChevronDown className={`text-slate-400 w-5 h-5 shrink-0 transition-transform ${openItems.includes(index) ? 'rotate-180' : ''}`} />
            </button>
            {openItems.includes(index) && (
              <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                <p className="text-slate-300 leading-relaxed font-body text-sm md:text-base">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
