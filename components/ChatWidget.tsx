'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { FlowPhase, FaqView, Message, StoredUserData } from '@/lib/chat/types';
import { STORAGE_KEY, PARAM_ORDER, PARAM_LABELS, ECONOMIC_DATA, MAX_PREFERENCE_SELECTION } from '@/lib/chat/constants';
import { TOOLTIPS } from '@/lib/chat/content/tooltips';
import { extractOutOfRangeParams, AnimatedDots, handleTogglePreference } from '@/lib/chat/helpers';
import {
  welcomeMessage, ringkasanMessage, closingMessage, errorMessage,
  confirmingMessage, allEliminatedMessage, detailMessage, loadingMessage,
  filter1ResultMessage, filter2PrefMessage, paramRecapLine, sap, filter2ResultMessage,
} from '@/lib/chat/content/messages';
import { getQuickReplies } from '@/lib/chat/content/quick-replies';
import { FAQ_CONTENT } from '@/lib/chat/content/faq-content';

import type { CollectionState } from '@/lib/chat/phases/types';
import {
  handleQuickReply as collectingHandleReply,
  getCurrentQuestion,
  isCollectionComplete,
  createInitialCollectionState,
} from '@/lib/chat/phases/collecting';

export default function ChatWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [isOpen, setIsOpen] = useState(fullPage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<FlowPhase>('welcome');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'laki' | 'perempuan' | ''>('');
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<'laki' | 'perempuan'>('laki');
  const [collectionState, setCollectionState] = useState<CollectionState>(createInitialCollectionState);
  const [collectedParams, setCollectedParams] = useState<Record<string, unknown> | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [eliminatedCrops, setEliminatedCrops] = useState<Array<{ name: string; reasons: string[] }>>([]);
  const [outOfRangeParams, setOutOfRangeParams] = useState<string[]>([]);
  const [survivingCrops, setSurvivingCrops] = useState<Array<{ name: string; score: string; normalizedValues?: Record<string, number>; breakdown?: Record<string, { score: number; label: string }>; explanation?: string }>>([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState<{ name: string; score: string } | null>(null);
  const [darkHorse, setDarkHorse] = useState<Array<{ cropName: string; totalProximity: number; failReasons: string[]; advice: string }>>([]);
  const [faqSection, setFaqSection] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdCounter = useRef(0);
  const nextMsgId = () => { msgIdCounter.current += 1; return `msg-${msgIdCounter.current}`; };

  const saveToStorage = useCallback((name: string, gender: 'laki' | 'perempuan', lastParams?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try { const data: StoredUserData = { name, gender }; if (lastParams) data.lastParams = lastParams; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* */ }
  }, []);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([{ id: 'welcome-1', role: 'assistant', content: welcomeMessage() }]);
      setPhase('welcome');
    }
  }, [isOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!isOpen || fullPage) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, fullPage]);

  // Update tooltip when collecting parameter changes
  useEffect(() => {
    if (phase !== 'collecting') { setActiveTooltip(null); return; }
    const param = PARAM_ORDER[collectionState.currentParamIndex];
    if (param && TOOLTIPS[param]) {
      setActiveTooltip(TOOLTIPS[param]);
    }
  }, [phase, collectionState.currentParamIndex]);

  const addMessages = useCallback((msgs: Array<{ role: 'user' | 'assistant'; content: string }>) => {
    setMessages((p) => [...p, ...msgs.map((m) => ({ ...m, id: nextMsgId() }))]);
  }, []);

  const quickReplies = getQuickReplies(
    phase === 'faq' ? 'faq' : phase,
    collectionState,
    survivingCrops,
    faqSection
  );

  // ── PHASE 1: FORM SUBMIT ─────────────────────────────────────────────────────
  const handleFormSubmit = () => {
    const name = formName.trim() || 'Petani';
    const gender = formGender || 'laki';
    setUserName(name); setUserGender(gender as 'laki' | 'perempuan');
    saveToStorage(name, gender as 'laki' | 'perempuan');
    addMessages([
      { role: 'user', content: `Nama: ${name}\nJenis Kelamin: ${gender === 'laki' ? 'Laki-laki' : 'Perempuan'}` },
      { role: 'assistant', content: ringkasanMessage(name, gender) },
    ]);
    setPhase('ringkasan'); setFaqSection(null);
  };

  // ── PHASE 2: RINGKASAN ───────────────────────────────────────────────────────
  const handleRingkasanLanjut = () => {
    setCollectionState(createInitialCollectionState()); setPhase('collecting'); setFaqSection(null);
    setActiveTooltip(TOOLTIPS['ketinggian'] || null);
    addMessages([
      { role: 'user', content: 'Mengerti, lanjut konsultasi' },
      { role: 'assistant', content: getCurrentQuestion(createInitialCollectionState(), userName, userGender) },
    ]);
  };

  const handleShowFaqCategories = () => {
    setPhase('faq');
    setFaqSection(null);
    const sections = FAQ_CONTENT.map(s => `• ${s.title}`);
    addMessages([{ role: 'assistant', content: `Baik, apa yang ingin ditanyakan?\n\n${sections.join('\n')}` }]);
  };
  const handleFaqAction = (value: string) => {
    if (value === '__FAQ_KEMBALI__') {
      setPhase('ringkasan');
      setFaqSection(null);
      addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]);
      return;
    }
    if (value === '__FAQ_BACK__') {
      setFaqSection(null);
      const sections = FAQ_CONTENT.map(s => `• ${s.title}`);
      addMessages([{ role: 'assistant', content: `Baik, apa yang ingin ditanyakan?\n\n${sections.join('\n')}` }]);
      return;
    }
    // Check if it's a category selection
    const section = FAQ_CONTENT.find(s => s.id === value);
    if (section) {
      setFaqSection(value);
      const items = section.items.map(i => `• ${i.question}`);
      addMessages([{ role: 'assistant', content: `**${section.title}**\n\nSilakan pilih pertanyaan di bawah ini:\n\n${items.join('\n')}` }]);
      return;
    }
    // Check if it's a question selection
    if (faqSection) {
      const section = FAQ_CONTENT.find(s => s.id === faqSection);
      const item = section?.items.find(i => i.id === value);
      if (item) {
        addMessages([{ role: 'assistant', content: `**${item.question}**\n\n${item.answer}` }]);
        return;
      }
    }
    addMessages([{ role: 'assistant', content: 'Maaf, konten FAQ untuk topik ini belum tersedia. Silakan pilih topik lain.' }]);
  };

  // ── PHASE 3: COLLECTING ──────────────────────────────────────────────────────
  const handleCollectingQuickReply = (value: string) => {
    if (isLoading) return;
    const result = collectingHandleReply(collectionState, value, userName, userGender);
    setCollectionState(result.collectionState);
    addMessages(result.messagesToAdd);
    if (result.isComplete) {
      setPhase('confirming');
      const recapLines = PARAM_ORDER.map(param => {
        const label = PARAM_LABELS[param]?.label || param;
        const emoji = PARAM_LABELS[param]?.emoji || '';
        const answer = result.collectionState.answers[param] || '(tidak dijawab)';
        return `${emoji} ${label}: ${answer}`;
      });
      addMessages([{ role: 'assistant', content: confirmingMessage(userName, userGender) + '\n\n' + recapLines.join('\n') + '\n\nKalau ada yang salah, saya bisa ulangi dari awal.' }]);
    }
  };

  // ── PHASE 4: CONFIRMING ──────────────────────────────────────────────────────
  const handleHitungRekomendasi = () => {
    const apiParams: Record<string, unknown> = {};
    for (const [param, answer] of Object.entries(collectionState.answers)) apiParams[param] = answer;
    setCollectedParams(apiParams);
    addMessages([{ role: 'user', content: 'Hitung Rekomendasi' }]);
    proceedWithCalculation(apiParams);
  };

  // ── PHASE: API Call Handler ───────────────────────────────────────────────────
  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setIsLoading(true);
    addMessages([{ role: 'assistant', content: loadingMessage(userName, userGender) }]);
    try {
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collectedParams: params, preferences }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses');
      setSurvivingCrops(data.surviving || []); setEliminatedCrops(data.eliminated || []);
      setOutOfRangeParams(extractOutOfRangeParams(data.eliminated || [])); setDarkHorse(data.darkHorse || []);
      if (data.allEliminated) {
        addMessages([{ role: 'assistant', content: allEliminatedMessage(userName, userGender, data.eliminated.map((e: { name: string; reasons: string[] }) => ({ name: e.name, reasons: e.reasons }))) }]);
        setPhase('done');
      } else if (data.surviving?.length > 0) {
        if (preferences && preferences.length > 0) {
          // Second call: show Filter 2 result with breakdown
          setPhase('done');
          const surviving = data.surviving.map((c: { name: string; score: string; breakdown?: Record<string, { score: number; label: string }> }) => ({
            name: c.name, score: c.score, breakdown: c.breakdown || {},
          }));
          const eliminated = data.eliminated.map((e: { name: string; reasons: string[] }) => ({ name: e.name, reasons: e.reasons }));
          addMessages([{ role: 'assistant', content: filter2ResultMessage(userName, userGender, surviving, eliminated, preferences) }]);
        } else {
          // First call: show Filter 1 result (bridging to Filter 2)
          setPhase('filter1_result');
          const survivingData = data.surviving.map((c: { name: string; score: string; explanation?: string }) => ({
            name: c.name, score: c.score || 'Cocok', matchDetails: c.explanation || 'Sesuai dengan kondisi lahan Anda.',
          }));
          const eliminated = data.eliminated.map((e: { name: string; reasons: string[] }) => ({ name: e.name, reasons: e.reasons }));
          addMessages([{ role: 'assistant', content: filter1ResultMessage(userName, userGender, survivingData, eliminated) }]);
        }
      }
    } catch { addMessages([{ role: 'assistant', content: errorMessage(userName, userGender) }]); }
    finally { setIsLoading(false); }
  };
  // ── Filter 1 Result Handler ────────────────────────────────────────────────────
  const handleFilter1Lanjut = () => {
    setPhase('filter2_summary');
    const surviving = survivingCrops.map((c: { name: string }) => {
      const econ = ECONOMIC_DATA[c.name];
      if (!econ) {
        return { name: c.name, biaya: '—', harga: '—', produktivitas: '—', risiko: '—', permintaan: '—' };
      }
      return { 
        name: c.name, 
        biaya: `Rp ${(econ.biaya / 1000000).toFixed(1)} juta/ha`, 
        harga: `Rp ${econ.harga.toLocaleString('id-ID')}/kg`, 
        produktivitas: `${econ.produktivitas} ton/ha`, 
        risiko: econ.risiko === 3 ? 'Tinggi (3/3)' : econ.risiko === 2 ? 'Sedang (2/3)' : 'Rendah (1/3)', 
        permintaan: econ.permintaan === 5 ? 'Sangat Tinggi (5/5)' : econ.permintaan === 4 ? 'Tinggi (4/5)' : 'Sedang (3/5)' 
      };
    });
    addMessages([{ role: 'assistant', content: filter2PrefMessage(userName, userGender, surviving) }]);
  };
  const handleFilter1Cukup = () => {
    setPhase('done');
    addMessages([{ role: 'assistant', content: `Baik, ${userName}! Berdasarkan analisis kesesuaian lingkungan, berikut rekomendasi saya:\n\n${survivingCrops.map((c: { name: string }, i: number) => `${i + 1}. **${c.name}**`).join('\n')}\n\nSemoga rekomendasi ini membantu, ${sap(userGender)}!` }]);
  };
  // ── Filter 2 Summary Handlers ─────────────────────────────────────────────────
  const handleFilter2SummaryLanjut = () => {
    setPhase('filter2_pref');
    addMessages([{ role: 'user', content: 'Lanjut hitung ranking' }, { role: 'assistant', content: `Baik, ${userName}! Sekarang saya perlu tahu prioritas ${sap(userGender)} untuk menentukan ranking.\n\nMana yang lebih penting? ${sap(userGender)} bisa pilih sampai 3.` }]);
  };
  const handleFilter2SummaryCukup = () => {
    setPhase('done');
    addMessages([{ role: 'assistant', content: `Baik, ${userName}! Berdasarkan analisis kesesuaian lingkungan, berikut rekomendasi saya:\n\n${survivingCrops.map((c: { name: string }, i: number) => `${i + 1}. **${c.name}**`).join('\n')}\n\nSemoga rekomendasi ini membantu, ${sap(userGender)}!` }]);
  };
  const handleFilter2SummaryUlangi = () => {
    handleUlangi();
  };
  // ── Filter 2 Preference Handler ───────────────────────────────────────────────
  const handleFilter2PrefSubmit = () => {
    if (selectedPreferences.length === 0) return;
    addMessages([{ role: 'user', content: 'Hitung Ranking' }]);
    proceedWithCalculation(collectedParams || {}, selectedPreferences);
  };

  const handlePreferenceToggle = (prefId: string) => {
    setSelectedPreferences(prev => {
      const result = handleTogglePreference(prev, prefId, MAX_PREFERENCE_SELECTION);
      return result.changed ? result.selectedIds : prev;
    });
  };

  // ── PHASE 6: RESULT ──────────────────────────────────────────────────────────
  const handleLihatDetail = (cropName: string) => {
    const crop = survivingCrops.find((c) => c.name === cropName);
    if (crop) { setSelectedCropDetail(crop); setPhase('detail'); addMessages([{ role: 'user', content: `Lihat detail ${cropName}` }, { role: 'assistant', content: detailMessage(crop.name, crop.score, crop.explanation, crop.breakdown) }]); }
  };
  const handleKembaliKeHasil = () => { setSelectedCropDetail(null); setPhase('done'); };
  const handleUlangi = () => {
    setCollectionState(createInitialCollectionState()); setCollectedParams(null); setSurvivingCrops([]); setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedPreferences([]); setSelectedCropDetail(null); setDarkHorse([]); setFaqSection(null); setPhase('ringkasan');
    addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]);
  };
  const handleSelesai = () => { addMessages([{ role: 'user', content: 'Selesai' }, { role: 'assistant', content: closingMessage(userName, userGender) }]); setPhase('closing'); };

  // ── MASTER QUICK REPLY HANDLER ────────────────────────────────────────────────
  const handleQuickReply = (value: string, label?: string) => {
    if (isLoading) return;
    if (label && (phase === 'collecting' || phase === 'faq' || phase === 'filter1_result' || phase === 'filter2_summary')) {
      addMessages([{ role: 'user', content: label }]);
    }
    if (phase === 'ringkasan') { if (value === '__RINGKASAN_LANJUT__') handleRingkasanLanjut(); else if (value === '__RINGKASAN_FAQ__') handleShowFaqCategories(); }
    else if (phase === 'faq') handleFaqAction(value);
    else if (phase === 'confirming') { if (value === '__CONFIRM_HITUNG__') handleHitungRekomendasi(); else if (value === '__CONFIRM_ULANGI__') handleUlangi(); }
    else if (phase === 'collecting') handleCollectingQuickReply(value);
    else if (phase === 'filter1_result') {
      if (value === '__FILTER1_LANJUT__') handleFilter1Lanjut();
      else if (value === '__FILTER1_CUKUP__') handleFilter1Cukup();
      else if (value === '__FILTER1_ULANGI__') handleUlangi();
    }
    else if (phase === 'filter2_summary') {
      if (value === '__FILTER2_LANJUT__') handleFilter2SummaryLanjut();
      else if (value === '__FILTER2_CUKUP__') handleFilter2SummaryCukup();
      else if (value === '__FILTER2_ULANGI__') handleFilter2SummaryUlangi();
    }
    else if (phase === 'filter2_pref') {
      if (value === '__PREF_HITUNG_RANKING__') handleFilter2PrefSubmit();
      else handlePreferenceToggle(value);
    }
    else if (phase === 'done') { if (value.startsWith('__DETAIL__')) handleLihatDetail(value.replace('__DETAIL__', '')); else if (value === '__ULANGI_KONSULTASI__') handleUlangi(); else if (value === '__SELESAI__') handleSelesai(); }
    else if (phase === 'detail') { if (value === '__DETAIL_KEMBALI__') handleKembaliKeHasil(); else if (value === '__DETAIL_ULANGI__') handleUlangi(); else if (value === '__DETAIL_SELESAI__') handleSelesai(); }
    else if (phase === 'closing') { if (value === '__CLOSING_ULANGI__') handleUlangi(); else if (value === '__CLOSING_BERANDA__') { setPhase('welcome'); setMessages([{ id: nextMsgId(), role: 'assistant', content: welcomeMessage() }]); setUserName(''); setUserGender('laki'); setCollectedParams(null); setSurvivingCrops([]); setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedCropDetail(null); setFaqSection(null); setFormName(''); setFormGender(''); }
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#0b141a]">
      {/* Messages + Quick Replies — single scrollable area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <Bot className="w-5 h-5 text-emerald-400 shrink-0 mt-1 mr-2" />}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-[#1f2c33] text-white/90 rounded-tl-none'}`}>
              {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
            </div>
          </div>
        ))}
        {isLoading && (<div className="flex justify-start"><Bot className="w-5 h-5 text-emerald-400 shrink-0 mt-1 mr-2" /><div className="bg-[#1f2c33] rounded-lg rounded-tl-none px-3 py-2 text-sm text-white/50"><AnimatedDots /></div></div>)}
        {/* Quick Replies — INSIDE scroll area, directly after last bubble */}
        {phase !== 'welcome' && quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-3 items-center">
            {/* Tooltip info button for collecting phase */}
            {phase === 'collecting' && activeTooltip && (
              <button
                onClick={() => setActiveTooltip(activeTooltip ? null : TOOLTIPS[PARAM_ORDER[collectionState.currentParamIndex]] || null)}
                className={`px-2.5 py-2 text-sm rounded-full border transition-all duration-150 cursor-pointer ${activeTooltip ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-transparent border-[#3b4a54] text-[#8696a0] hover:bg-[#2a3942] hover:text-white'}`}
                title="Kenapa parameter ini ditanyakan?"
              >
                ℹ️
              </button>
            )}
            {quickReplies.map((reply) => {
              const isPrefSelected = phase === 'filter2_pref' && selectedPreferences.includes(reply.value);
              const isPrefDisabled = phase === 'filter2_pref' && !selectedPreferences.includes(reply.value) && selectedPreferences.length >= MAX_PREFERENCE_SELECTION && reply.value !== '__PREF_HITUNG_RANKING__';
              const isSubmit = reply.value.includes('HITUNG') || reply.value === '__PREF_HITUNG_RANKING__';
              const isEscape = reply.value === '__ESCAPE_KURANG_YAKIN__';
              const isSecondary = reply.value.includes('ULANGI') || reply.value.includes('KEMBALI') || reply.value.includes('BERANDA') || reply.value.includes('SELESAI') || reply.value === '__FAQ_BACK__';
              let btnClass = 'px-3 py-2 text-sm rounded-full border transition-all duration-150 cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95 ';
              if (isPrefSelected) btnClass += 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 ';
              else if (isSubmit) btnClass += 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:shadow-blue-500/30 ';
              else if (isEscape) btnClass += 'bg-amber-600/20 border-amber-500 text-amber-300 hover:bg-amber-600/30 ';
              else if (isSecondary) btnClass += 'bg-transparent border-[#3b4a54] text-[#8696a0] hover:bg-[#2a3942] hover:text-white ';
              else btnClass += 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-400 ';
              return (<button key={reply.value} onClick={() => handleQuickReply(reply.value, reply.label)} disabled={isLoading || isPrefDisabled} className={btnClass + 'disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed'}>{reply.label}</button>);
            })}
          </div>
        )}
        {/* Tooltip — shows info about the current collecting parameter */}
        {phase === 'collecting' && activeTooltip && (
          <div className="mx-3 mb-2 p-3 bg-[#1a2332] border border-[#2a3942] rounded-lg text-sm text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 shrink-0 mt-0.5">💡</span>
              <div>
                <p className="font-medium text-amber-300 text-xs mb-1 uppercase tracking-wide">Kenapa ditanyakan?</p>
                <p className="whitespace-pre-line">{activeTooltip}</p>
              </div>
              <button onClick={() => setActiveTooltip(null)} className="text-slate-500 hover:text-white shrink-0 ml-auto text-lg leading-none">&times;</button>
            </div>
          </div>
        )}
        {/* Spacer — always 15% of viewport height, stays when scrolling up */}
        <div className="shrink-0" style={{ height: '15vh' }} />
        <div ref={messagesEndRef} />
      </div>
      {/* Phase 1: Welcome Form — BOTTOM */}
      {phase === 'welcome' && (
        <div className="shrink-0 p-3 bg-[#1f2c33] border-t border-white/5">
          <div className="space-y-2">
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Masukkan nama Anda..." className="w-full bg-[#2a3942] border border-[#3b4a54] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8696a0] focus:outline-none focus:border-emerald-500" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setFormGender('laki')} className={`flex-1 py-2.5 text-sm rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95 ${formGender === 'laki' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#2a3942] border-[#3b4a54] text-[#8696a0] hover:bg-[#3b4a54]'}`}>Laki-laki</button>
              <button type="button" onClick={() => setFormGender('perempuan')} className={`flex-1 py-2.5 text-sm rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95 ${formGender === 'perempuan' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#2a3942] border-[#3b4a54] text-[#8696a0] hover:bg-[#3b4a54]'}`}>Perempuan</button>
            </div>
            <button type="button" onClick={handleFormSubmit} disabled={!formName.trim()} className="w-full py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 text-white transition-all duration-150">Mulai Konsultasi</button>
          </div>
        </div>
      )}
    </div>
  );
}
