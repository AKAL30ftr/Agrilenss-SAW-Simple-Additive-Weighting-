'use client';

import { useState } from 'react';
import { Bot, X, Send, Paperclip, MoreVertical } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="!fixed !bottom-4 !right-4 md:!bottom-6 md:!right-6 !z-[9999] flex flex-col items-end" style={{ position: 'fixed' }}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.5)] border-2 border-[#0b0f10] hover:scale-105 active:scale-95"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b0f10]"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-6rem)] glass-plate rounded-2xl flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-emerald-400/30 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 origin-bottom-right">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                  <Bot className="text-black w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b0f10] shadow-[0_0_10px_rgba(74,222,128,1)]"></span>
              </div>
              <div>
                <h3 className="font-bold text-white tracking-wide text-sm font-heading">AgriLens AI</h3>
                <span className="text-[10px] font-bold text-emerald-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)] uppercase tracking-widest block leading-none mt-1">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <MoreVertical className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-5 bg-black/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="text-center">
              <span className="text-[10px] font-bold text-white/40 bg-black/60 px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider">Today, 09:41 AM</span>
            </div>

            {/* AI Message */}
            <div className="flex gap-2.5 max-w-[90%]">
              <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)] mt-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-3 border border-white/10 shadow-lg">
                <p className="text-slate-200 text-sm leading-relaxed">Hello! I&apos;m your AgriLens Advisor. I can help you interpret the SAW analysis results or answer questions about crop suitability. What would you like to know today?</p>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-2.5 max-w-[90%] self-end flex-row-reverse">
              <div className="bg-emerald-400/10 backdrop-blur-md rounded-2xl rounded-tr-sm p-3 border border-emerald-400/30 shadow-[0_4px_15px_rgba(74,222,128,0.1)]">
                <p className="text-emerald-50 text-sm leading-relaxed">Can you explain why Sorghum scored higher than Maize in the Northern sector analysis?</p>
              </div>
            </div>

            {/* AI Message */}
            <div className="flex gap-2.5 max-w-[90%]">
              <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)] mt-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-3 border border-white/10 shadow-lg flex flex-col gap-3">
                <p className="text-slate-200 text-sm leading-relaxed">Based on the current SAW model for the Northern sector, Sorghum outscored Maize primarily due to its higher weight in the <strong className="text-emerald-400 font-bold drop-shadow-[0_0_4px_rgba(74,222,128,0.3)]">Drought Tolerance</strong> criterion (Weight: 0.35).</p>
                <div className="bg-black/60 rounded-lg p-2.5 border border-white/5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/60">Sorghum Total Score:</span>
                    <span className="text-emerald-400 font-bold drop-shadow-[0_0_4px_rgba(74,222,128,0.4)]">0.82</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Maize Total Score:</span>
                    <span className="text-white font-medium">0.68</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Replies */}
            <div className="flex flex-wrap gap-2 mt-1">
              <button className="bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]">Yes, show breakdown</button>
              <button className="bg-black/40 hover:bg-black/60 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors">Adjust weights</button>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-white/10 bg-black/60 shrink-0">
            <div className="relative flex items-center mb-2">
              <button className="absolute left-2 text-white/40 hover:text-emerald-400 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <input 
                className="w-full bg-[#0b0f10] border border-white/10 rounded-full py-2.5 pl-9 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all font-body shadow-inner" 
                placeholder="Message AgriLens AI..." 
                type="text"
              />
              <button className="absolute right-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(74,222,128,0.4)]">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-white/30 tracking-wide font-medium">AgriLens AI can make mistakes. Consider verifying critical data.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
