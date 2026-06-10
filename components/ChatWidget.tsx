'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { FlowPhase, FaqView, Message, StoredUserData } from '@/lib/chat/types';
import { STORAGE_KEY, PARAM_ORDER, PARAM_LABELS } from '@/lib/chat/constants';
import { extractOutOfRangeParams, AnimatedDots } from '@/lib/chat/helpers';
import {
  welcomeMessage, ringkasanMessage, preferenceMessage, closingMessage, errorMessage,
  confirmingMessage, resultMessage, allEliminatedMessage, detailMessage, loadingMessage,
  filter1ResultMessage, filter2PrefMessage, paramRecapLine, sap, filter2ResultMessage,
} from '@/lib/chat/content/messages';
import { getQuickReplies } from '@/lib/chat/content/quick-replies';
import { FAQ_CONTENT } from '@/lib/chat/content/faq-content';
import { MAX_PREFERENCE_SELECTION, handleTogglePreference } from '@/lib/chat/phases/preference';
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
  const [showPreferences, setShowPreferences] = useState(false);
  const [eliminatedCrops, setEliminatedCrops] = useState<Array<{ name: string; reasons: string[] }>>([]);
  const [outOfRangeParams, setOutOfRangeParams] = useState<string[]>([]);
  const [survivingCrops, setSurvivingCrops] = useState<Array<{ name: string; score: string; normalizedValues?: Record<string, number>; explanation?: string }>>([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState<{ name: string; score: string } | null>(null);
  const [darkHorse, setDarkHorse] = useState<Array<{ cropName: string; totalProximity: number; failReasons: string[]; advice: string }>>([]);
  const [faqView, setFaqView] = useState<FaqView>('none');

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

  const addMessages = useCallback((msgs: Array<{ role: 'user' | 'assistant'; content: string }>) => {
    setMessages((p) => [...p, ...msgs.map((m) => ({ ...m, id: nextMsgId() }))]);
  }, []);

  const quickReplies = getQuickReplies(
    phase === 'faq' ? 'faq' : phase,
    collectionState,
    survivingCrops
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
    setPhase('ringkasan'); setFaqView('none');
  };

  // ── PHASE 2: RINGKASAN ───────────────────────────────────────────────────────
  const handleRingkasanLanjut = () => {
    setCollectionState(createInitialCollectionState()); setPhase('collecting'); setFaqView('none');
    addMessages([
      { role: 'user', content: 'Mengerti, lanjut konsultasi' },
      { role: 'assistant', content: getCurrentQuestion(createInitialCollectionState(), userName, userGender) },
    ]);
  };

  const handleShowFaqCategories = () => {
    setPhase('faq');
    const sections = FAQ_CONTENT.map(s => `• ${s.title}`);
    addMessages([{ role: 'assistant', content: `Baik, apa yang ingin ditanyakan?\n\n${sections.join('\n')}\n\n• Kembali ke konsultasi` }]);
  };
  // ── PHASE 2A: FAQ ─────────────────────────────────────────────────────────────
  const handleFaqAction = (value: string) => {
    if (value === '__FAQ_KEMBALI__') { setPhase('ringkasan'); addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]); return; }
    // Check if it's a section selection
    const section = FAQ_CONTENT.find(s => s.id === value);
    if (section) {
      const items = section.items.map(i => `• ${i.question}`);
      addMessages([{ role: 'assistant', content: `**${section.title}**\n\n${items.join('\n')}\n\n• Kembali ke FAQ` }]);
      return;
    }
    // Check if it's a specific question
    for (const section of FAQ_CONTENT) {
      const item = section.items.find(i => i.id === value);
      if (item) {
        addMessages([{ role: 'assistant', content: `**${item.question}**\n\n${item.answer}\n\n• Kembali ke FAQ` }]);
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
    setIsLoading(true); setShowPreferences(false);
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
    setPhase('filter2_pref');
    // Build economic data from ECONOMIC_DATA constant
    const ECONOMIC_DATA: Record<string, { biaya: string; harga: string; produktivitas: string; risiko: string; permintaan: string }> = {
      'Padi':           { biaya: 'Rp 7.2 juta/ha',  harga: 'Rp 10.000/kg',  produktivitas: '5.28 ton/ha',  risiko: 'Sedang (2/3)',  permintaan: 'Sangat Tinggi (5/5)' },
      'Jagung':         { biaya: 'Rp 6.2 juta/ha',  harga: 'Rp 8.400/kg',   produktivitas: '5.57 ton/ha',  risiko: 'Sedang (2/3)',  permintaan: 'Tinggi (4/5)' },
      'Kedelai':        { biaya: 'Rp 5.4 juta/ha',  harga: 'Rp 16.500/kg',  produktivitas: '1.62 ton/ha',  risiko: 'Tinggi (3/3)',    permintaan: 'Tinggi (4/5)' },
      'Cabai Merah':    { biaya: 'Rp 48.5 juta/ha', harga: 'Rp 52.000/kg',  produktivitas: '8.60 ton/ha',  risiko: 'Tinggi (3/3)',    permintaan: 'Tinggi (4/5)' },
      'Bawang Merah':   { biaya: 'Rp 58.5 juta/ha', harga: 'Rp 37.300/kg',  produktivitas: '10.05 ton/ha', risiko: 'Tinggi (3/3)',    permintaan: 'Sangat Tinggi (5/5)' },
      'Bawang Putih':   { biaya: 'Rp 91.6 juta/ha', harga: 'Rp 39.100/kg',  produktivitas: '8.50 ton/ha',  risiko: 'Tinggi (3/3)',    permintaan: 'Sangat Tinggi (5/5)' },
    };
    const surviving = survivingCrops.map((c: { name: string }) => {
      const econ = ECONOMIC_DATA[c.name] || { biaya: '—', harga: '—', produktivitas: '—', risiko: '—', permintaan: '—' };
      return { name: c.name, ...econ };
    });
    addMessages([{ role: 'assistant', content: filter2PrefMessage(userName, userGender, surviving) }]);
  };
  const handleFilter1Cukup = () => {
    setPhase('done');
    addMessages([{ role: 'assistant', content: `Baik, ${userName}! Berdasarkan analisis kesesuaian lingkungan, berikut rekomendasi saya:\n\n${survivingCrops.map((c: { name: string }, i: number) => `${i + 1}. **${c.name}**`).join('\n')}\n\nSemoga rekomendasi ini membantu, ${sap(userGender)}!` }]);
  };
  // ── Filter 2 Preference Handler ───────────────────────────────────────────────
  const handleFilter2PrefSubmit = () => {
    if (selectedPreferences.length === 0) return;
    addMessages([{ role: 'user', content: 'Hitung Ranking' }]);
    proceedWithCalculation(collectedParams || {}, selectedPreferences);
  };

  const handlePreferenceToggle = (prefId: string) => {
    const result = handleTogglePreference(selectedPreferences, prefId);
    if (result.changed) setSelectedPreferences(result.selectedIds);
  };

  const handlePreferenceSubmit = () => {
    if (selectedPreferences.length === 0) return;
    addMessages([{ role: 'user', content: 'Hitung Ranking' }]);
    proceedWithCalculation(collectedParams || {}, selectedPreferences);
  };

  // ── PHASE 6: RESULT ──────────────────────────────────────────────────────────
  const handleLihatDetail = (cropName: string) => {
    const crop = survivingCrops.find((c) => c.name === cropName);
    if (crop) { setSelectedCropDetail(crop); setPhase('detail'); addMessages([{ role: 'user', content: `Lihat detail ${cropName}` }, { role: 'assistant', content: detailMessage(crop.name, crop.score, crop.explanation) }]); }
  };
  const handleKembaliKeHasil = () => { setSelectedCropDetail(null); setPhase('done'); };
  const handleUlangi = () => {
    setCollectionState(createInitialCollectionState()); setCollectedParams(null); setSurvivingCrops([]); setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedPreferences([]); setSelectedCropDetail(null); setDarkHorse([]); setFaqView('none'); setPhase('ringkasan');
    addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]);
  };
  const handleSelesai = () => { addMessages([{ role: 'user', content: 'Selesai' }, { role: 'assistant', content: closingMessage(userName, userGender) }]); setPhase('closing'); };

  // ── MASTER QUICK REPLY HANDLER ────────────────────────────────────────────────
  const handleQuickReply = (value: string, label?: string) => {
    if (isLoading) return;
    if (label && (phase === 'collecting' || phase === 'faq' || phase === 'filter1_result' || phase === 'filter2_pref')) {
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
    else if (phase === 'filter2_pref') {
      if (value === '__PREF_HITUNG_RANKING__') handleFilter2PrefSubmit();
      else handlePreferenceToggle(value);
    }
    else if (phase === 'done') { if (value.startsWith('__DETAIL__')) handleLihatDetail(value.replace('__DETAIL__', '')); else if (value === '__ULANGI_KONSULTASI__') handleUlangi(); else if (value === '__SELESAI__') handleSelesai(); }
    else if (phase === 'detail') { if (value === '__DETAIL_KEMBALI__') handleKembaliKeHasil(); else if (value === '__DETAIL_ULANGI__') handleUlangi(); else if (value === '__DETAIL_SELESAI__') handleSelesai(); }
    else if (phase === 'closing') { if (value === '__CLOSING_ULANGI__') handleUlangi(); else if (value === '__CLOSING_BERANDA__') { setPhase('welcome'); setMessages([{ id: nextMsgId(), role: 'assistant', content: welcomeMessage() }]); setUserName(''); setUserGender('laki'); setCollectedParams(null); setSurvivingCrops([]); setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedCropDetail(null); setFaqView('none'); setFormName(''); setFormGender(''); }
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
          <div className="flex flex-wrap gap-2 pt-1 pb-3">
            {quickReplies.map((reply) => {
              const isPrefSelected = phase === 'preference' && selectedPreferences.includes(reply.value);
              const isPrefDisabled = phase === 'preference' && !selectedPreferences.includes(reply.value) && selectedPreferences.length >= MAX_PREFERENCE_SELECTION && reply.value !== '__PREF_HITUNG_RANKING__';
              const isSubmit = reply.value.includes('HITUNG') || reply.value === '__PREF_HITUNG_RANKING__';
              const isEscape = reply.value === '__ESCAPE_KURANG_YAKIN__';
              const isSecondary = reply.value.includes('ULANGI') || reply.value.includes('KEMBALI') || reply.value.includes('BERANDA') || reply.value.includes('SELESAI');
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
