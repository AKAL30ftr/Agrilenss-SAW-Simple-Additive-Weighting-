'use client';

import { Bot } from 'lucide-react';
import type { Message } from '@/lib/chat/types';
import { sapaan } from '@/lib/chat/helpers';
import { renderMessageContent } from '@/lib/chat/render-engine';
import { AnimatedDots } from '@/lib/chat/helpers';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  showLoadingScreen: boolean;
  userName: string;
  userGender: 'laki' | 'perempuan';
  phase: string;
}

export default function MessageList({
  messages,
  isLoading,
  showLoadingScreen,
  userName,
  userGender,
  phase,
}: MessageListProps) {
  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-2 max-w-[92%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
          {msg.role === 'assistant' && (
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
              <Bot className="w-3 h-3 text-emerald-400" />
            </div>
          )}
          <div className={`rounded-2xl rounded-tl-sm p-2.5 border shadow-lg ${msg.role === 'assistant' ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-emerald-400/10 backdrop-blur-md border-emerald-400/30'}`}>
            <p className={`whitespace-pre-line text-sm leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200' : 'text-emerald-50'}`}>{renderMessageContent(msg.content)}</p>
          </div>
        </div>
      ))}

      {/* ── Loading screen (Phase 5 → 6 only) ──────────────── */}
      {showLoadingScreen && (
        <div className="flex gap-2 max-w-[90%]" role="status">
          <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
            <Bot className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-2.5 border border-white/10">
            <p className="text-slate-200 text-sm">
              Terima kasih atas kesabarannya, {sapaan(userGender)} {userName}. Hasil perhitungan sedang disusun<AnimatedDots />
            </p>
          </div>
        </div>
      )}

      {/* ── Standard loading indicator ──────────────────────── */}
      {isLoading && !showLoadingScreen && (
        <div className="flex gap-2 max-w-[90%]" role="status">
          <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
            <Bot className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-2.5 border border-white/10">
            <p className="text-slate-200 text-sm">Sedang menganalisis<AnimatedDots /></p>
          </div>
        </div>
      )}
    </>
  );
}
