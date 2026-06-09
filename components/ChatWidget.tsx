'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot } from 'lucide-react';
import type { FlowPhase, FaqView, Message, StoredUserData } from '@/lib/chat/types';
import { STORAGE_KEY, PARAM_ORDER, PARAM_LABELS } from '@/lib/chat/constants';
import { extractOutOfRangeParams, AnimatedDots } from '@/lib/chat/helpers';
import { welcomeMessage, ringkasanMessage, preferenceMessage, closingMessage, errorMessage, confirmingMessage } from '@/lib/chat/content/messages';
import { getQuickReplies } from '@/lib/chat/content/quick-replies';
import { PREFERENCE_OPTIONS, MAX_PREFERENCE_SELECTION, handleTogglePreference } from '@/lib/chat/phases/preference';
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
    addMessages([{ role: 'assistant', content: 'Baik, apa yang ingin ditanyakan?\n\n• Tentang cara kerja sistem\n• Tentang jenis tanaman\n• Tentang kondisi lahan\n• Kembali ke konsultasi' }]);
  };

  // ── PHASE 2A: FAQ ─────────────────────────────────────────────────────────────
  const handleFaqAction = (value: string) => {
    if (value === '__FAQ_KEMBALI__') { setPhase('ringkasan'); addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]); return; }
    const faqContent: Record<string, string> = {
      'faq_sistem': 'Sistem Agri-SAW Pro menggunakan metode Simple Additive Weighting (SAW) untuk menganalisis kesesuaian lahan dan keuntungan ekonomi tanaman. Prosesnya: (1) Anda masukkan 5 kondisi lahan, (2) Sistem cocokkan dengan 6 jenis tanaman, (3) Tanaman yang cocok dihitung rankingnya berdasarkan prioritas Anda.',
      'faq_tanaman': '6 jenis tanaman yang didukung: Padi, Jagung, Kedelai, Cabai Merah, Bawang Merah, dan Bawang Putih. Masing-masing punya karakteristik berbeda — ada yang cocok di dataran rendah, ada di dataran tinggi. Tergantung kondisi lahan Anda.',
      'faq_lahan': '5 kondisi lahan yang ditanyakan: (1) Ketinggian — menentukan suhu dan jenis tanaman, (2) Curah hujan — sumber air utama, (3) pH tanah — tingkat keasaman tanah, (4) Tekstur tanah — struktur tanah, (5) Intensitas cahaya — lama paparan sinar matahari.',
    };
    addMessages([{ role: 'assistant', content: faqContent[value] || 'Maaf, konten FAQ untuk topik ini belum tersedia.' }]);
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

  // ── PHASE 5-6: PREFERENCE → LOADING → RESULT ─────────────────────────────────
  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setIsLoading(true); setShowPreferences(false);
    addMessages([{ role: 'assistant', content: 'Terima kasih atas kesabarannya. Hasil perhitungan sedang disusun...' }]);
    try {
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collectedParams: params, preferences }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses');
      setSurvivingCrops(data.surviving || []); setEliminatedCrops(data.eliminated || []);
      setOutOfRangeParams(extractOutOfRangeParams(data.eliminated || [])); setDarkHorse(data.darkHorse || []);
      if (data.allEliminated) { addMessages([{ role: 'assistant', content: data.message }]); setPhase('done'); }
      else if (data.surviving?.length > 0) {
        if (preferences && preferences.length > 0) {
          setPhase('done');
          const s = userGender === 'perempuan' ? 'Ibu' : 'Pak';
          const rankedList = data.surviving.map((c: { name: string; score: string }, i: number) => `${i + 1}. ${c.name}: ${c.score}`).join('\n');
          addMessages([{ role: 'assistant', content: `${s} ${userName}, berikut hasil rekomendasi saya:\n\n${rankedList}` }]);
        } else {
          setShowPreferences(true); setPhase('preference');
          const cropList = data.surviving.map((c: { name: string }) => c.name).join(', ');
          addMessages([{ role: 'assistant', content: preferenceMessage(userName, userGender, data.surviving.length, cropList) }]);
        }
      }
    } catch { addMessages([{ role: 'assistant', content: errorMessage(userName, userGender) }]); }
    finally { setIsLoading(false); }
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
    if (crop) { setSelectedCropDetail(crop); setPhase('detail'); addMessages([{ role: 'user', content: `Lihat detail ${cropName}` }, { role: 'assistant', content: `${crop.name} — Detail Analisis\n\nSkor: ${crop.score}\n\n${crop.explanation || 'Detail analisis untuk tanaman ini.'}` }]); }
  };
  const handleKembaliKeHasil = () => { setSelectedCropDetail(null); setPhase('done'); };
  const handleUlangi = () => {
    setCollectionState(createInitialCollectionState()); setCollectedParams(null); setSurvivingCrops([]); setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedPreferences([]); setSelectedCropDetail(null); setDarkHorse([]); setFaqView('none'); setPhase('ringkasan');
    addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]);
  };
  const handleSelesai = () => { addMessages([{ role: 'user', content: 'Selesai' }, { role: 'assistant', content: closingMessage(userName, userGender) }]); setPhase('closing'); };

  // ── MASTER QUICK REPLY HANDLER ────────────────────────────────────────────────
  const handleQuickReply = (value: string) => {
    if (isLoading) return;
    if (phase === 'ringkasan') { if (value === '__RINGKASAN_LANJUT__') handleRingkasanLanjut(); else if (value === '__RINGKASAN_FAQ__') handleShowFaqCategories(); }
    else if (phase === 'faq') handleFaqAction(value);
    else if (phase === 'confirming') { if (value === '__CONFIRM_HITUNG__') handleHitungRekomendasi(); else if (value === '__CONFIRM_ULANGI__') handleUlangi(); }
    else if (phase === 'collecting') handleCollectingQuickReply(value);
    else if (phase === 'preference') { if (value === '__PREF_HITUNG_RANKING__') handlePreferenceSubmit(); else handlePreferenceToggle(value); }
    else if (phase === 'done') { if (value.startsWith('__DETAIL__')) handleLihatDetail(value.replace('__DETAIL__', '')); else if (value === '__ULANGI_KONSULTASI__') handleUlangi(); else if (value === '__SELESAI__') handleSelesai(); }
    else if (phase === 'detail') { if (value === '__DETAIL_KEMBALI__') handleKembaliKeHasil(); else if (value === '__DETAIL_ULANGI__') handleUlangi(); else if (value === '__DETAIL_SELESAI__') handleSelesai(); }
    else if (phase === 'closing') { if (value === '__CLOSING_ULANGI__') handleUlangi(); else if (value === '__CLOSING_BERANDA__') { setPhase('welcome'); setMessages([{ id: nextMsgId(), role: 'assistant', content: welcomeMessage() }]); setUserName(''); setUserGender('laki'); setCollectedParams(null); setSurvivingCrops([]); setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedCropDetail(null); setFaqView('none'); setFormName(''); setFormGender(''); }
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#0b141a]">
      <div className={`overflow-y-auto p-3 space-y-2 ${phase === 'welcome' ? 'flex-none' : 'flex-1'}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <Bot className="w-5 h-5 text-emerald-400 shrink-0 mt-1 mr-2" />}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-[#1f2c33] text-white/90 rounded-tl-none'}`}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (<div className="flex justify-start"><Bot className="w-5 h-5 text-emerald-400 shrink-0 mt-1 mr-2" /><div className="bg-[#1f2c33] rounded-lg rounded-tl-none px-3 py-2 text-sm text-white/50"><AnimatedDots /></div></div>)}
        <div ref={messagesEndRef} />
      </div>
      {phase !== 'welcome' && quickReplies.length > 0 && (
        <div className="shrink-0 px-3 py-2 bg-[#1f2c33] border-t border-white/5 flex flex-wrap gap-2">
          {quickReplies.map((reply) => {
            const isPrefSelected = phase === 'preference' && selectedPreferences.includes(reply.value);
            const isPrefDisabled = phase === 'preference' && !selectedPreferences.includes(reply.value) && selectedPreferences.length >= MAX_PREFERENCE_SELECTION && reply.value !== '__PREF_HITUNG_RANKING__';
            return (<button key={reply.value} onClick={() => handleQuickReply(reply.value)} disabled={isLoading || isPrefDisabled} className={`px-3 py-1.5 text-xs rounded-full border ${isPrefSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-[#3b4a54] text-[#8696a0] hover:bg-[#2a3942] hover:border-emerald-500/50 hover:text-white'} disabled:opacity-30`}>{reply.label}</button>);
          })}
        </div>
      )}
      {phase === 'welcome' && (
        <div className="shrink-0 p-3 bg-[#1f2c33] border-t border-white/5">
          <div className="space-y-2">
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Masukkan nama Anda..." className="w-full bg-[#2a3942] border border-[#3b4a54] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8696a0] focus:outline-none focus:border-emerald-500" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setFormGender('laki')} className={`flex-1 py-2.5 text-sm rounded-lg border ${formGender === 'laki' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#2a3942] border-[#3b4a54] text-[#8696a0]'}`}>Laki-laki</button>
              <button type="button" onClick={() => setFormGender('perempuan')} className={`flex-1 py-2.5 text-sm rounded-lg border ${formGender === 'perempuan' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#2a3942] border-[#3b4a54] text-[#8696a0]'}`}>Perempuan</button>
            </div>
            <button type="button" onClick={handleFormSubmit} disabled={!formName.trim()} className="w-full py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white">Mulai Konsultasi</button>
          </div>
        </div>
      )}
    </div>
  );
}
