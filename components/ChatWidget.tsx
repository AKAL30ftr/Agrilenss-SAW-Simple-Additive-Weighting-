'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send } from 'lucide-react';
import { FAQ_CONTENT, type FaqSection, type FaqItem } from '@/lib/faq-content';
import type { FlowPhase, FaqView, Message, StoredUserData } from '@/lib/chat/types';
import { STORAGE_KEY, PARAM_ORDER, PARAM_TO_FAQ } from '@/lib/chat/constants';
import { computeClientMissingParams, extractOutOfRangeParams, AnimatedDots } from '@/lib/chat/helpers';
import { welcomeMessage, ringkasanMessage, preferenceMessage, closingMessage, errorMessage } from '@/lib/chat/content/messages';
import { QUICK_REPLIES } from '@/lib/chat/content/quick-replies';
import { TOOLTIPS } from '@/lib/chat/content/tooltips';
import { PREFERENCE_OPTIONS, MAX_PREFERENCE_SELECTION, handleTogglePreference } from '@/lib/chat/phases/preference';
import type { CollectionState } from '@/lib/chat/phases/types';
import {
  handleQuickReply as collectingHandleReply,
  handleFreeText as collectingHandleText,
  getCurrentQuestion,
  isCollectionComplete,
  createInitialCollectionState,
} from '@/lib/chat/phases/collecting';

export default function ChatWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<FlowPhase>('welcome');
  const [formName, setFormName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const d = JSON.parse(s); if (d.name) return d.name; } } catch { /* */ }
    return '';
  });
  const [formGender, setFormGender] = useState<'laki' | 'perempuan' | ''>(() => {
    if (typeof window === 'undefined') return '';
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const d = JSON.parse(s); if (d.gender) return d.gender; } } catch { /* */ }
    return '';
  });
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<'laki' | 'perempuan'>('laki');
  const [collectionState, setCollectionState] = useState<CollectionState>(createInitialCollectionState);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [collectedParams, setCollectedParams] = useState<Record<string, unknown> | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [eliminatedCrops, setEliminatedCrops] = useState<Array<{ name: string; reasons: string[] }>>([]);
  const [outOfRangeParams, setOutOfRangeParams] = useState<string[]>([]);
  const [survivingCrops, setSurvivingCrops] = useState<Array<{ name: string; score: string; normalizedValues?: Record<string, number>; explanation?: string }>>([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState<{ name: string; score: string } | null>(null);
  const [darkHorse, setDarkHorse] = useState<Array<{ cropName: string; totalProximity: number; failReasons: string[]; advice: string }>>([]);
  const [faqView, setFaqView] = useState<FaqView>('none');
  const [faqSelectedSection, setFaqSelectedSection] = useState<FaqSection | null>(null);
  const [faqSelectedItem, setFaqSelectedItem] = useState<FaqItem | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [escapeKurangYakinActive, setEscapeKurangYakinActive] = useState(false);
  const [returningToRingkasan, setReturningToRingkasan] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdCounter = useRef(0);
  const nextMsgId = () => { msgIdCounter.current += 1; return `msg-${msgIdCounter.current}`; };
  const isInputDisabled = !escapeKurangYakinActive;

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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showLoadingScreen]);

  useEffect(() => {
    if (!isOpen || fullPage) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, fullPage]);

  // Helper: add messages with auto-generated IDs
  const addMessages = (msgs: Array<{ role: 'user' | 'assistant'; content: string }>) => {
    setMessages((p) => [...p, ...msgs.map((m) => ({ ...m, id: nextMsgId() }))]);
  };

  const quickReplies = (phase === 'collecting' && !isCollectionComplete(collectionState))
    ? (QUICK_REPLIES[PARAM_ORDER[collectionState.currentParamIndex]] || []) : [];
  const currentParam = PARAM_ORDER[collectionState.currentParamIndex] || '';
  const currentTooltip = currentParam ? TOOLTIPS[currentParam] : undefined;

  // ── PHASE 1: FORM SUBMIT ──
  const handleFormSubmit = () => {
    const name = formName.trim() || 'Petani';
    const gender = formGender || 'laki';
    setUserName(name); setUserGender(gender as 'laki' | 'perempuan'); saveToStorage(name, gender as 'laki' | 'perempuan');
    addMessages([
      { role: 'user', content: `Nama: ${name}\nJenis Kelamin: ${gender === 'laki' ? 'Laki-laki' : 'Perempuan'}` },
      { role: 'assistant', content: ringkasanMessage(name, gender) },
    ]);
    setPhase('ringkasan'); setFaqView('none');
  };

  // ── PHASE 2: RINGKASAN ──
  const handleRingkasanLanjut = () => {
    setCollectionState(createInitialCollectionState()); setPhase('collecting'); setFaqView('none');
    addMessages([{ role: 'user', content: 'Mengerti, lanjut konsultasi' }]);
    const q = getCurrentQuestion(createInitialCollectionState(), userName, userGender);
    addMessages([{ role: 'assistant', content: q }]);
  };
  const handleShowFaqCategories = () => setFaqView('categories');
  const handleBackFromFaq = () => { setFaqView('none'); setFaqSelectedSection(null); setFaqSelectedItem(null); setReturningToRingkasan(true); };

  // ── PHASE 3: COLLECTING (batch, forced sequence) ──
  const handleCollectingQuickReply = (value: string) => {
    if (isLoading) return;
    const result = collectingHandleReply(collectionState, value, userName, userGender);
    setCollectionState(result.collectionState);
    addMessages(result.messagesToAdd);
    if (result.isKurangYakin) { setEscapeKurangYakinActive(true); return; }
    if (result.isComplete) setPhase('confirming');
  };

  const handleCollectingTextSubmit = (text: string) => {
    setEscapeKurangYakinActive(false);
    const result = collectingHandleText(collectionState, text, userName, userGender);
    setCollectionState(result.collectionState);
    addMessages(result.messagesToAdd);
    if (result.isComplete) setPhase('confirming');
  };

  // ── PHASE 4: CONFIRMING ──
  const handleHitungRekomendasi = () => {
    const apiParams: Record<string, unknown> = {};
    for (const [param, answer] of Object.entries(collectionState.answers)) apiParams[param] = answer;
    setCollectedParams(apiParams);
    addMessages([{ role: 'user', content: 'Hitung Rekomendasi' }]);
    proceedWithCalculation(apiParams);
  };

  // ── PHASE 5-6: PREFERENCE → LOADING → RESULT ──
  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setShowLoadingScreen(true); setIsLoading(true); setShowPreferences(false);
    let resolveDelay: () => void;
    const minDelay = new Promise<void>((r) => { resolveDelay = r; });
    setTimeout(() => resolveDelay!(), 3000);
    try {
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collectedParams: params, preferences }) });
      await minDelay;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses');
      setSurvivingCrops(data.surviving || []);
      setEliminatedCrops(data.eliminated || []);
      setOutOfRangeParams(extractOutOfRangeParams(data.eliminated || []));
      setDarkHorse(data.darkHorse || []);
      if (data.allEliminated) {
        addMessages([{ role: 'assistant', content: data.message }]);
        setPhase('done');
      } else if (data.surviving?.length > 0) {
        setShowPreferences(true); setPhase('preference');
        const cropList = data.surviving.map((c: { name: string }) => c.name).join(', ');
        addMessages([{ role: 'assistant', content: preferenceMessage(userName, userGender, data.surviving.length, cropList) }]);
      }
    } catch {
      addMessages([{ role: 'assistant', content: errorMessage(userName, userGender) }]);
    } finally { setShowLoadingScreen(false); setIsLoading(false); }
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

  // ── PHASE 6: RESULT ──
  const handleLihatDetail = (cropName: string) => {
    const crop = survivingCrops.find((c) => c.name === cropName);
    if (crop) { setSelectedCropDetail(crop); setPhase('detail'); }
  };
  const handleKembaliKeHasil = () => { setSelectedCropDetail(null); setPhase('done'); };

  const handleUlangi = () => {
    setCollectionState(createInitialCollectionState()); setCollectedParams(null); setSurvivingCrops([]);
    setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedPreferences([]); setSelectedCropDetail(null);
    setDarkHorse([]); setFaqView('none'); setPhase('ringkasan');
    addMessages([{ role: 'assistant', content: ringkasanMessage(userName, userGender) }]);
  };

  const handleSelesai = () => {
    addMessages([{ role: 'user', content: 'Selesai' }, { role: 'assistant', content: closingMessage(userName, userGender) }]);
    setPhase('closing');
  };

  // ── MASTER QUICK REPLY HANDLER ──
  const handleQuickReply = (value: string) => {
    if (isLoading) return;
    if (phase === 'ringkasan') {
      if (value === '__RINGKASAN_LANJUT__') handleRingkasanLanjut();
      else if (value === '__RINGKASAN_FAQ__') handleShowFaqCategories();
      else if (value === '__KEMBALI_RINGKASAN__') handleBackFromFaq();
      return;
    }
    if (phase === 'confirming') {
      if (value === '__CONFIRM_HITUNG__') handleHitungRekomendasi();
      else if (value === '__CONFIRM_ULANGI__') handleUlangi();
      return;
    }
    if (phase === 'collecting') { handleCollectingQuickReply(value); return; }
    if (phase === 'preference') {
      if (value === '__PREF_HITUNG_RANKING__') handlePreferenceSubmit();
      else handlePreferenceToggle(value);
      return;
    }
    if (phase === 'done') {
      if (value.startsWith('__DETAIL__')) handleLihatDetail(value.replace('__DETAIL__', ''));
      else if (value === '__ULANGI_KONSULTASI__') handleUlangi();
      else if (value === '__SELESAI__') handleSelesai();
      return;
    }
    if (phase === 'detail') {
      if (value === '__DETAIL_KEMBALI__') handleKembaliKeHasil();
      else if (value === '__DETAIL_ULANGI__') handleUlangi();
      else if (value === '__DETAIL_SELESAI__') handleSelesai();
      return;
    }
    if (phase === 'closing') {
      if (value === '__CLOSING_ULANGI__') handleUlangi();
      else if (value === '__CLOSING_BERANDA__') {
        setPhase('welcome');
        setMessages([{ id: nextMsgId(), role: 'assistant', content: welcomeMessage() }]);
        setUserName(''); setUserGender('laki'); setCollectedParams(null); setSurvivingCrops([]);
        setEliminatedCrops([]); setOutOfRangeParams([]); setSelectedCropDetail(null); setFaqView('none');
      }
      return;
    }
  };

  // ── TEXT INPUT ──
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue.trim(); setInputValue('');
    addMessages([{ role: 'user', content: text }]);
    if (phase === 'collecting' && escapeKurangYakinActive) handleCollectingTextSubmit(text);
  };

  // ── RENDER ──
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <Bot className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white/10 text-white/90 rounded-bl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <Bot className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-white/70">
              <AnimatedDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button key={reply.value} onClick={() => handleQuickReply(reply.value)} disabled={isLoading}
              className="px-3 py-1.5 text-xs rounded-full border border-white/20 text-white/80 hover:bg-white/10 hover:border-emerald-400/50 transition-colors disabled:opacity-40">
              {reply.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleTextSubmit} className="p-4 border-t border-white/10 flex gap-2">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          disabled={isInputDisabled} placeholder={isInputDisabled ? 'Pilih jawaban di atas' : 'Ketik jawaban...'}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 disabled:opacity-40" />
        <button type="submit" disabled={isInputDisabled || !inputValue.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
