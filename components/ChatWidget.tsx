'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, MoreVertical } from 'lucide-react';
import { FAQ_CONTENT, type FaqSection, type FaqItem } from '@/lib/faq-content';
import type { FlowPhase, FaqView, Message, StoredUserData } from '@/lib/chat/types';
import {
  STORAGE_KEY,
  PARAM_ORDER,
  QUICK_REPLIES,
  TOOLTIPS,
  PARAM_QUESTION_MESSAGES,
  PARAM_TO_FAQ,
  MAX_PREFERENCE_SELECTION,
} from '@/lib/chat/constants';
import {
  extractOutOfRangeParams,
  computeClientMissingParams,
  sapaan,
  ringkasanMessage,
} from '@/lib/chat/helpers';
import WelcomeForm from '@/components/chat/WelcomeForm';
import MessageList from '@/components/chat/MessageList';
import QuickReplyBar from '@/components/chat/QuickReplyBar';
import ConfirmingCard from '@/components/chat/ConfirmingCard';
import DetailCard from '@/components/chat/DetailCard';
import CollectingView from '@/components/chat/CollectingView';
import PreferenceView from '@/components/chat/PreferenceView';
import DetailQuickReplies from '@/components/chat/DetailQuickReplies';
import ClosingQuickReplies from '@/components/chat/ClosingQuickReplies';
import FaqViewComponent from '@/components/chat/FaqView';
import EliminatedFaqLinks from '@/components/chat/EliminatedFaqLinks';
import DoneView from '@/components/chat/DoneView';

// =====================================================================
// ─── MAIN COMPONENT ──────────────────────────────────────────────────
// =====================================================================
export default function ChatWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<FlowPhase>('welcome');
  const [formName, setFormName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { const d = JSON.parse(stored); if (d.name) return d.name; }
    } catch { /* ignore */ }
    return '';
  });
  const [formGender, setFormGender] = useState<'laki' | 'perempuan' | ''>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { const d = JSON.parse(stored); if (d.gender) return d.gender; }
    } catch { /* ignore */ }
    return '';
  });
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<'laki' | 'perempuan'>('laki');
  const [previousParams, setPreviousParams] = useState<Record<string, unknown> | undefined>(undefined);
  const [currentMissingParams, setCurrentMissingParams] = useState<string[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [collectedParams, setCollectedParams] = useState<Record<string, unknown> | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [uncertainParams, setUncertainParams] = useState<Set<string>>(new Set);
  const [eliminatedCrops, setEliminatedCrops] = useState<Array<{ name: string; reasons: string[] }>>([]);
  const [outOfRangeParams, setOutOfRangeParams] = useState<string[]>([]);
  const [survivingCrops, setSurvivingCrops] = useState<Array<{ name: string; score: string; normalizedValues?: Record<string, number>; explanation?: string }>>([]);
  const [selectedCropDetail, setSelectedCropDetail] = useState<{ name: string; score: string; normalizedValues?: Record<string, number>; explanation?: string } | null>(null);
  const [darkHorse, setDarkHorse] = useState<Array<{ cropName: string; totalProximity: number; failReasons: string[]; advice: string }>>([]);

  // FAQ state
  const [faqView, setFaqView] = useState<FaqView>('none');
  const [faqSelectedSection, setFaqSelectedSection] = useState<FaqSection | null>(null);
  const [faqSelectedItem, setFaqSelectedItem] = useState<FaqItem | null>(null);

  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  // Flag: input is temporarily enabled after "Kurang yakin" escape
  const [escapeKurangYakinActive, setEscapeKurangYakinActive] = useState(false);

  // "Kembali ke ringkasan" flag: after FAQ answer, show ringkasan again
  const [returningToRingkasan, setReturningToRingkasan] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdCounter = useRef(0);
  const nextMsgId = () => { msgIdCounter.current += 1; return `msg-${msgIdCounter.current}`; };

  // ─── Input lock ────────────────────────────────────────────────────
  const isInputDisabled = !escapeKurangYakinActive;


  // ─── localStorage: save helper ─────────────────────────────────────
  const saveToStorage = useCallback((name: string, gender: 'laki' | 'perempuan', lastParams?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try {
      const data: StoredUserData = { name, gender };
      if (lastParams) data.lastParams = lastParams;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
  }, []);
  // ─── Initialize on open ───────────────────────────────────────────
  const initializedRef = useRef(false);
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([{
        id: 'welcome-1',
        role: 'assistant',
        content: 'Halo! Selamat datang di Agri-SAW Pro. 🌾\n\nSaya adalah asisten virtual yang akan membantu merekomendasikan komoditas pertanian terbaik untuk lahan Bapak/Ibu.\n\nSebelum mulai, silakan isi data diri dulu ya:',
      }]);
      setPhase('welcome');
    }
  }, [isOpen]);

  // ─── Scroll to bottom ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showLoadingScreen]);

  // ─── Escape to close (popup mode) ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || fullPage) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fullPage]);

  // ─── Quick replies for current collecting param ────────────────────
  const quickReplies = (phase === 'collecting' && currentMissingParams.length > 0)
    ? (QUICK_REPLIES[currentMissingParams[0]] || [])
    : [];
  const currentParam = currentMissingParams[0] || '';
  const currentTooltip = currentParam ? TOOLTIPS[currentParam] : undefined;

  // ════════════════════════════════════════════════════════════════════
  // PHASE 1: FORM SUBMIT → PHASE 2 (RINGKASAN)
  // ════════════════════════════════════════════════════════════════════
  const handleFormSubmit = () => {
    const name = formName.trim() || 'Petani';
    const gender = formGender || 'laki';
    setUserName(name);
    setUserGender(gender as 'laki' | 'perempuan');
    saveToStorage(name, gender as 'laki' | 'perempuan');

    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: `Nama: ${name}\nJenis Kelamin: ${gender === 'laki' ? 'Laki-laki' : 'Perempuan'}` },
      { id: nextMsgId(), role: 'assistant', content: ringkasanMessage(name, gender) },
    ]);
    setPhase('ringkasan');
    setFaqView('none');
  };

  // ════════════════════════════════════════════════════════════════════
  // PHASE 2: RINGKASAN — "Mengerti" → PHASE 3, "Ada pertanyaan" → FAQ
  // ════════════════════════════════════════════════════════════════════
  const handleRingkasanLanjut = () => {
    setCurrentMissingParams([...PARAM_ORDER]);
    setPhase('collecting');
    setFaqView('none');
    const param = PARAM_ORDER[0];
    const questionFn = PARAM_QUESTION_MESSAGES[param];
    const questionText = questionFn ? questionFn(userName, userGender) : '';
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: 'Mengerti, lanjut konsultasi' },
      { id: nextMsgId(), role: 'assistant', content: questionText },
    ]);
  };

  // ════════════════════════════════════════════════════════════════════
  // PHASE 3: COLLECTING — quick reply handler
  // ════════════════════════════════════════════════════════════════════
  const advanceCollecting = useCallback((data: { userValues?: Record<string, unknown>; missingParams?: string[]; message: string }) => {
    let updatedCollected: Record<string, unknown> | null = null;
    if (data.userValues) {
      setPreviousParams(data.userValues);
      const idParams: Record<string, unknown> = {};
      const keyMap: Record<string, string> = { elevation: 'ketinggian', rainfall: 'curah hujan', pH: 'pH tanah', texture: 'tekstur tanah', light: 'intensitas cahaya' };
      for (const [eng, id] of Object.entries(keyMap)) {
        if (data.userValues[eng] != null) idParams[id] = data.userValues[eng];
      }
      updatedCollected = idParams;
      setCollectedParams(idParams);
    }

    const apiMissing = data.missingParams || [];
    const clientMissing = computeClientMissingParams(updatedCollected ?? collectedParams);
    const mergedSet = new Set([...apiMissing, ...clientMissing]);
    const remaining = PARAM_ORDER.filter((p) => mergedSet.has(p));

    setCurrentMissingParams(remaining);
    if (remaining.length === 0) {
      setPhase('confirming');
    } else {
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'assistant', content: data.message },
      ]);
    }
  }, [collectedParams]);

  const callCollectingAPI = useCallback(async (messageBody: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageBody,
          previousParams,
          uncertainParams: Array.from(uncertainParams),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses');
      advanceCollecting(data);
    } catch (error) {
      const sal = sapaan(userGender);
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: `Maaf, ${sal} ${userName}, ada kendala teknis. Silakan coba lagi nanti, atau hubungi penyuluh pertanian setempat untuk konsultasi langsung.` }]);
    } finally {
      setIsLoading(false);
    }
  }, [previousParams, uncertainParams, advanceCollecting, userGender, userName]);

  const handleQuickReply = (value: string) => {
    if (isLoading) return;

    // ── Ringkasan quick replies ──
    if (phase === 'ringkasan') {
      if (value === '__RINGKASAN_LANJUT__') {
        handleRingkasanLanjut();
        return;
      }
      if (value === '__RINGKASAN_FAQ__') {
        handleShowFaqCategories();
        return;
      }
      if (value === '__KEMBALI_RINGKASAN__') {
        setFaqView('none');
        setFaqSelectedSection(null);
        setFaqSelectedItem(null);
        setReturningToRingkasan(true);
        return;
      }
      return;
    }

    // ── Confirming quick replies ──
    if (phase === 'confirming') {
      if (value === '__CONFIRM_HITUNG__') {
        handleHitungRekomendasi();
        return;
      }
      if (value === '__CONFIRM_ULANGI__') {
        handleUlangiFromRingkasan();
        return;
      }
      return;
    }

    // ── Preference quick replies ──
    if (phase === 'preference') {
      if (value === '__PREF_HITUNG_RANKING__') {
        handlePreferenceSubmit();
        return;
      }
      return;
    }

    // ── Detail quick replies ──
    if (phase === 'detail') {
      if (value === '__DETAIL_KEMBALI__') {
        setSelectedCropDetail(null);
        setPhase('done');
        return;
      }
      if (value === '__DETAIL_ULANGI__') {
        handleUlangiFromRingkasan();
        return;
      }
      if (value === '__DETAIL_SELESAI__') {
        handleSelesai();
        return;
      }
      return;
    }

    // ── Done quick replies ──
    if (phase === 'done') {
      if (value.startsWith('__DETAIL__')) {
        const cropName = value.replace('__DETAIL__', '');
        const crop = survivingCrops.find((c) => c.name === cropName);
        if (crop) {
          setSelectedCropDetail(crop);
          setPhase('detail');
        }
        return;
      }
      if (value === '__ULANGI_KONSULTASI__') {
        handleUlangiFromRingkasan();
        return;
      }
      if (value === '__SELESAI__') {
        handleSelesai();
        return;
      }
      if (value.startsWith('__PELAJARI__')) {
        const param = value.replace('__PELAJARI__', '');
        handleOutOfRangeFaqClick(param);
        return;
      }
      if (value === '__ELIMINASI_KEMBALI__') {
        handleUlangiFromRingkasan();
        return;
      }
      if (value === '__CLOSING_ULANGI__') {
        handleUlangiFromRingkasan();
        return;
      }
      if (value === '__CLOSING_BERANDA__') {
        setPhase('welcome');
        setMessages([{
          id: nextMsgId(),
          role: 'assistant',
          content: 'Halo! Selamat datang di Agri-SAW Pro. 🌾\n\nSaya adalah asisten virtual yang akan membantu merekomendasikan komoditas pertanian terbaik untuk lahan Bapak/Ibu.\n\nSebelum mulai, silakan isi data diri dulu ya:',
        }]);
        setUserName('');
        setUserGender('laki');
        setCollectedParams(null);
        setSurvivingCrops([]);
        setEliminatedCrops([]);
        setOutOfRangeParams([]);
        setSelectedCropDetail(null);
        setFaqView('none');
        return;
      }
      return;
    }

    // ── Collecting quick replies ──
    if (phase !== 'collecting') return;

    if (value === '__ESCAPE_KURANG_YAKIN__') {
      const paramName = currentMissingParams[0] || 'parameter ini';
      setEscapeKurangYakinActive(true);
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: `Saya kurang yakin soal ${paramName}, tapi saya coba jawab.` }]);
      const fallbackQuestions: Record<string, string> = {
        'ketinggian': `Tidak masalah, ${sapaan(userGender)} ${userName}. Coba perhatikan suhu di lahan ${sapaan(userGender)}. Kalau terik dan panas, biasanya dataran rendah (0-400 meter). Kalau agak sejuk, dataran sedang (400-700 meter). Kalau dingin dan berembus angin, biasanya pegunungan (700+ meter). Perkiraan kasar sudah cukup, ${sapaan(userGender)}.`,
        'curah hujan': `Tidak masalah, ${sapaan(userGender)} ${userName}. Coba ingat-ingat, dalam sebulan terakhir, kira-kira berapa kali hujan deras? Kalau hampir setiap hari, berarti curah hujan tinggi. Kalau seminggu sekali atau kurang, berarti rendah. Perkiraan kasar sudah cukup, ${sapaan(userGender)}.`,
        'pH tanah': `Tidak masalah, ${sapaan(userGender)} ${userName}. Coba perhatikan tanaman di lahan ${sapaan(userGender)}. Kalau daun sering menguning atau tanaman kerdil, kemungkinan tanah asam. Kalau tumbuh hijau dan subur, kemungkinan tanah netral. Perkiraan kasar sudah cukup, ${sapaan(userGender)}.`,
        'tekstur tanah': `Tidak masalah, ${sapaan(userGender)} ${userName}. Coba ambil tanah di lahan ${sapaan(userGender)}, lalu basahi sedikit. Kalau terasa lengket dan bisa dibentuk, berarti tanah liat. Kalau terasa halus dan gembur, berarti lempung. Kalau terasa kasar seperti pasir, berarti tanah berpasir. Perkiraan kasar sudah cukup, ${sapaan(userGender)}.`,
        'intensitas cahaya': `Tidak masalah, ${sapaan(userGender)} ${userName}. Coba perhatikan, pagi sampai sore, kira-kira berapa jam lahan ${sapaan(userGender)} terkena sinar matahari langsung? Kalau ada pohon besar atau bangunan yang menghalangi, biasanya 6-8 jam. Kalau terbuka, bisa 10-12 jam. Perkiraan kasar sudah cukup, ${sapaan(userGender)}.`,
      };
      const fallbackMsg = fallbackQuestions[paramName] || `Silakan ketik perkiraan ${paramName} ${sapaan(userGender)}. Perkiraan kasar sudah cukup.`;
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: fallbackMsg }]);
      return;
    }
    // Normal reply
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: value }]);
    callCollectingAPI(value);
  };

  // ════════════════════════════════════════════════════════════════════
  // TEXT INPUT (Enabled when escapeKurangYakinActive)
  // ════════════════════════════════════════════════════════════════════
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue.trim();
    setInputValue('');
    setEscapeKurangYakinActive(false);
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: text }]);
    callCollectingAPI(text);
  };

  // ════════════════════════════════════════════════════════════════════
  // PHASE 4: CONFIRMATION → "Hitung Rekomendasi"
  // ════════════════════════════════════════════════════════════════════
  const handleHitungRekomendasi = () => {
    if (!collectedParams) return;
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: 'Hitung Rekomendasi' }]);
    proceedWithCalculation(collectedParams);
  };

  // ════════════════════════════════════════════════════════════════════
  // PHASE 5: PREFERENCE → "Hitung Ranking" → LOADING → PHASE 6
  // ════════════════════════════════════════════════════════════════════
  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setShowLoadingScreen(true);
    setIsLoading(true);
    setShowPreferences(false);
    let resolveDelay: () => void;
    const minDelay = new Promise<void>((resolve) => { resolveDelay = resolve; });
    setTimeout(() => resolveDelay!(), 3000);
    try {
      const engParams: Record<string, unknown> = {};
      const idToEng: Record<string, string> = { 'ketinggian': 'elevation', 'curah hujan': 'rainfall', 'pH tanah': 'pH', 'tekstur tanah': 'texture', 'intensitas cahaya': 'light' };
      for (const [id, eng] of Object.entries(idToEng)) {
        if (params[id] != null) engParams[eng] = params[id];
      }
      const body: Record<string, unknown> = { message: 'Hitung rekomendasi', previousParams: engParams };
      if (preferences && preferences.length > 0) body.preferences = preferences;
      const apiData = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => res.json());
      await minDelay;
      if (apiData.userValues) {
        setPreviousParams(apiData.userValues);
        saveToStorage(userName, userGender, apiData.userValues);
      }
      if (apiData.missingParams) setCurrentMissingParams(apiData.missingParams);
      // Handle all-crops-eliminated
      if (apiData.mode === 'all-eliminated' || (apiData.eliminated && apiData.eliminated.length > 0 && (!apiData.surviving || apiData.surviving.length === 0))) {
        const eliminated = apiData.eliminated || [];
        setEliminatedCrops(eliminated);
        const oorParams = extractOutOfRangeParams(eliminated);
        setOutOfRangeParams(oorParams);
        const sal = sapaan(userGender);
        const paramIssues: string[] = [];
        if (oorParams.includes('ketinggian')) paramIssues.push('ketinggian lahan ' + sal + ' terlalu tinggi untuk semua komoditas');
        if (oorParams.includes('curah hujan')) paramIssues.push('curah hujan terlalu rendah untuk semua komoditas');
        if (oorParams.includes('pH tanah')) paramIssues.push('kondisi tanah kurang sesuai');
        if (oorParams.includes('tekstur tanah')) paramIssues.push('tekstur tanah kurang sesuai');
        if (oorParams.includes('intensitas cahaya')) paramIssues.push('intensitas cahaya kurang sesuai');
        const issueText = paramIssues.length > 0
          ? paramIssues.join('. ') + '.'
          : 'kondisi lahan ' + sal + ' belum sesuai dengan kebutuhan tanaman yang tersedia.';
        const message = [
          'Maaf, ' + sal + ' ' + userName + '. Berdasarkan data yang ' + sal + ' masukkan, semua tanaman belum cocok karena ' + issueText,
          '',
          'Tapi jangan khawatir, ' + sal + '. Saya bisa bantu ' + sal + ' mempelajari cara memperbaiki kondisi lahan. Silakan pilih topik di bawah ini, ' + sal + '.',
        ].join('\n');
        setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: message }]);
        setPhase('done');
        return;
      }
      // Filter 1 done, show preference selection
      if (!preferences && apiData.surviving && apiData.surviving.length > 0) {
        const surviving = apiData.surviving;
        setSurvivingCrops(surviving);
        setEliminatedCrops(apiData.eliminated || []);
        setShowPreferences(true);
        setPhase('preference');
        const sal2 = sapaan(userGender);
        const cropList = surviving.map((s: { name: string }) => s.name).join(', ');
        setMessages((prev) => [...prev, {
          id: nextMsgId(),
          role: 'assistant',
          content: 'Bagus, ' + sal2 + ' ' + userName + '! Dari 6 jenis tanaman, ada ' + surviving.length + ' yang cocok dengan lahan ' + sal2 + ': ' + cropList + '.\n\nSekarang, untuk menentukan ranking terbaik, saya perlu tahu prioritas ' + sal2 + '. Mana yang lebih penting?\n\n• Biaya tanam yang murah?\n• Harga jual yang tinggi?\n• Hasil panen yang banyak?\n• Risiko yang rendah?\n• Permintaan pasar yang tinggi?\n\nMaksimal bisa pilih 3, ' + sal2 + '.',
        }]);
        return;
      }
      // Final result (after preference submit)
      if (apiData.surviving && apiData.surviving.length > 0) {
        const surviving = apiData.surviving;
        setSurvivingCrops(surviving);
        setEliminatedCrops(apiData.eliminated || []);
        setDarkHorse(apiData.darkHorse || []);
      }
      const cleanMessage = apiData.message ? apiData.message.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '') : '';
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: cleanMessage }]);
      setPhase('done');
    } catch (error) {
      const sal = sapaan(userGender);
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: 'Maaf, ' + sal + ' ' + userName + ', ada kendala teknis. Silakan coba lagi nanti, atau hubungi penyuluh pertanian setempat untuk konsultasi langsung.' }]);
    } finally {
      setIsLoading(false);
      setShowLoadingScreen(false);
    }
  };

  const handlePreferenceSubmit = () => {
    if (collectedParams) proceedWithCalculation(collectedParams, selectedPreferences);
  };

  const handleTogglePreference = (criterionId: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(criterionId)
        ? prev.filter((id) => id !== criterionId)
        : prev.length >= MAX_PREFERENCE_SELECTION
          ? prev
          : [...prev, criterionId]
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // PHASE 6: RESULT — "Ulangi" / "Selesai" / "Lihat detail"
  // ════════════════════════════════════════════════════════════════════
  const handleUlangiFromRingkasan = () => {
    setCollectedParams(null);
    setPreviousParams(undefined);
    setEliminatedCrops([]);
    setOutOfRangeParams([]);
    setSurvivingCrops([]);
    setSelectedCropDetail(null);
    setDarkHorse([]);
    setFaqView('none');
    setFaqSelectedSection(null);
    setFaqSelectedItem(null);
    setSelectedPreferences([]);
    setShowPreferences(false);
    setReturningToRingkasan(false);
    setCurrentMissingParams([]);
    setEscapeKurangYakinActive(false);
    setPhase('ringkasan');
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: 'Ulangi konsultasi' },
      { id: nextMsgId(), role: 'assistant', content: `Baik, ${sapaan(userGender)} ${userName}. Kita ulang dari awal ya. Silakan isi ulang data lahan ${sapaan(userGender)}.` },
    ]);
  };

  const handleSelesai = () => {
    const sal = sapaan(userGender);
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: 'Selesai' },
      { id: nextMsgId(), role: 'assistant', content: `Terima kasih, ${sal} ${userName}, sudah menggunakan Agri-SAW Pro! 🙏\n\nSemoga rekomendasi ini membantu ${sal} menentukan tanaman yang terbaik untuk lahan. Kalau ada pertanyaan lain atau mau konsultasi ulang, jangan sungkan ya, ${sal.split(' ')[0]}.\n\nKalau hasil ini dirasa kurang sesuai, ${sal} juga bisa konsultasikan dengan penyuluh pertanian di daerah ${sal} untuk pendalaman lebih lanjut.\n\nMau konsultasi ulang atau ada pertanyaan lain, ${sal.split(' ')[0]}?` },
    ]);
    setPhase('done');
  };

  // ════════════════════════════════════════════════════════════════════
  // FAQ HANDLERS
  // ════════════════════════════════════════════════════════════════════
  const handleShowFaqCategories = () => {
    setFaqView('categories');
    setFaqSelectedSection(null);
    setFaqSelectedItem(null);
    setReturningToRingkasan(false);
  };

  const handleFaqCategorySelect = (section: FaqSection) => {
    setFaqSelectedSection(section);
    setFaqView('items');
  };

  const handleFaqItemSelect = (item: FaqItem) => {
    setFaqSelectedItem(item);
    setFaqView('answer');
  };

  const handleFaqBack = () => {
    if (faqView === 'answer') {
      setFaqView('items');
      setFaqSelectedItem(null);
    } else if (faqView === 'items') {
      setFaqView('categories');
      setFaqSelectedSection(null);
    } else {
      setFaqView('none');
    }
  };

  const handleOutOfRangeFaqClick = (param: string) => {
    const mapping = PARAM_TO_FAQ[param];
    if (!mapping) return;
    const section = FAQ_CONTENT.find((s) => s.id === mapping.sectionId);
    if (!section) return;
    const item = section.items.find((i) => i.id === mapping.itemId);
    if (!item) return;
    setFaqSelectedSection(section);
    setFaqSelectedItem(item);
    setFaqView('answer');
  };

  const handleQuickReplyKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickReply(value); }
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Ringkasan actions — Bug 4 Fix: merged into single function
  // INVARIANT: renderRingkasanActions adalah SATU-SATUNYA render function
  // untuk tombol ringkasan. Jangan buat renderRingkasanQuickReplies atau
  // renderReturnToRingkasan yang terpisah — itu menyebabkan Bug 4 (double button).
  // ════════════════════════════════════════════════════════════════════
  const renderRingkasanActions = () => {
    if (phase !== 'ringkasan' || faqView !== 'none') return null;
    const secondButtonLabel = returningToRingkasan
      ? 'Ada pertanyaan lain'
      : 'Ada pertanyaan dulu';
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Opsi ringkasan">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            onClick={() => handleQuickReply('__RINGKASAN_LANJUT__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__RINGKASAN_LANJUT__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Mengerti, lanjut konsultasi
          </button>
          <button
            onClick={() => handleQuickReply('__RINGKASAN_FAQ__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__RINGKASAN_FAQ__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            {secondButtonLabel}
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Confirmation quick replies (Phase 4)
  // ════════════════════════════════════════════════════════════════════
  const renderConfirmingQuickReplies = () => {
    if (phase !== 'confirming' || !collectedParams || isLoading) return null;
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Konfirmasi">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            onClick={() => handleQuickReply('__CONFIRM_HITUNG__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__CONFIRM_HITUNG__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Hitung Rekomendasi
          </button>
          <button
            onClick={() => handleQuickReply('__CONFIRM_ULANGI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__CONFIRM_ULANGI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Ulangi dari awal
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════

  const chatContent = (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center">
              <Bot className="text-black w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b0f10]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-heading">Agri-SAW Advisor</h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online</span>
          </div>
        </div>
        {!fullPage && (
          <div className="flex items-center gap-1">
            <button className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5" aria-label="Opsi">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Progress bar ───────────────────────────────────────── */}
      {(phase === 'collecting' || phase === 'confirming' || phase === 'preference') && collectedParams && (
        <div className="shrink-0 border-b border-white/10 bg-black/40">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-bold text-emerald-400">
                {PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length}/{PARAM_ORDER.length} terisi
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                role="progressbar"
                style={{ width: `${(PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length / PARAM_ORDER.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="flex-grow p-3 overflow-y-auto flex flex-col gap-3 bg-black/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" role="log" aria-label="Percakapan" aria-live="polite">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          showLoadingScreen={showLoadingScreen}
          userName={userName}
          userGender={userGender}
          phase={phase}
        />

        {/* ── Phase 1: Welcome form ───────────────────────────── */}
          <WelcomeForm
            formName={formName}
            formGender={formGender}
            onFormNameChange={setFormName}
            onFormGenderChange={setFormGender}
            onSubmit={handleFormSubmit}
          />

        {phase === 'confirming' && !isLoading && collectedParams && (
          <ConfirmingCard
            collectedParams={collectedParams}
            userName={userName}
            userGender={userGender}
          />
        )}

        {/* ── Phase 6.x: Detail card ──────────────────────────── */}
        {phase === 'detail' && selectedCropDetail && (
          <DetailCard crop={selectedCropDetail} />
        )}

        {/* ── Phase 3: Collecting ──────────────────────────────── */}
        {phase === 'collecting' && !isLoading && quickReplies.length > 0 && (
          <CollectingView
            currentParam={currentParam}
            currentTooltip={currentTooltip}
            activeTooltip={activeTooltip}
            quickReplies={quickReplies}
            onReply={handleQuickReply}
            onTooltipToggle={setActiveTooltip}
            isLoading={isLoading}
          />
        )}

        {/* ── Phase 2: Ringkasan actions (merged — Bug 4 fix) ──── */}
        {renderRingkasanActions()}

        {/* ── Phase 4: Confirming quick replies ────────────────── */}
        {renderConfirmingQuickReplies()}

        {/* ── Phase 5: Preference quick replies ────────────────── */}
        {phase === 'preference' && showPreferences && !isLoading && (
          <PreferenceView
            selectedPreferences={selectedPreferences}
            onToggle={handleTogglePreference}
            onSubmit={handlePreferenceSubmit}
            isLoading={isLoading}
          />
        )}

        {/* ── Phase 6: Done view (recommendation + dark horse + eliminated + quick replies) ── */}
        {phase === 'done' && survivingCrops.length > 0 && (
          <DoneView
            survivingCrops={survivingCrops}
            eliminatedCrops={eliminatedCrops}
            darkHorse={darkHorse}
            selectedCropDetail={selectedCropDetail}
            onReply={handleQuickReply}
          />
        )}

        {/* ── Phase 6.x: Detail quick replies ──────────────────── */}
        {phase === 'detail' && selectedCropDetail && (
          <DetailQuickReplies
            onReply={handleQuickReply}
            onKeyDown={handleQuickReplyKeyDown}
          />
        )}

        {/* ── Closing quick replies ────────────────────────────── */}
        {phase === 'done' && (() => {
          const lastMsg = messages[messages.length - 1];
          if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.content.includes('Terima kasih')) return null;
          return (
            <ClosingQuickReplies
              onReply={handleQuickReply}
              onKeyDown={handleQuickReplyKeyDown}
            />
          );
        })()}

        {/* ── FAQ quick replies ────────────────────────────────── */}
        <FaqViewComponent
          faqView={faqView}
          faqSelectedSection={faqSelectedSection}
          faqSelectedItem={faqSelectedItem}
          onCategorySelect={handleFaqCategorySelect}
          onItemSelect={handleFaqItemSelect}
          onBack={handleFaqBack}
        />

        {/* ── All-crops-eliminated FAQ links ───────────────────── */}
        {phase === 'done' && eliminatedCrops.length > 0 && outOfRangeParams.length > 0 && (
          <EliminatedFaqLinks
            outOfRangeParams={outOfRangeParams}
            onFaqClick={handleOutOfRangeFaqClick}
            onReply={handleQuickReply}
          />
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Input area ────────────────────────────────────────── */}
      <div className="p-2.5 border-t border-white/10 bg-black/60 shrink-0">
        {!isInputDisabled && (
          <form onSubmit={handleTextSubmit} className="relative flex items-center mb-1">
            <input
              className="w-full bg-[#0b0f10] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-all"
              placeholder="Ketik perkiraan Anda di sini..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors disabled:opacity-50"
              aria-label="Kirim"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        )}
        <div className="text-center">
          <span className="text-[9px] text-white/30">AI dapat membuat kesalahan. Verifikasi hasil dengan penyuluh pertanian setempat.</span>
        </div>
      </div>
    </>
  );

  if (fullPage) {
    return (
      <div className="fixed top-20 left-0 right-0 bottom-0 z-30">
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#0b0f10]" role="region" aria-label="Agri-SAW Chat">
          {chatContent}
        </div>
      </div>
    );
  }

  return (
    <>
      {!isOpen && !fullPage && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9998] flex flex-col items-end" role="region" aria-label="Widget percakapan">
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.5)] border-2 border-[#0b0f10] hover:scale-105 active:scale-95"
            aria-label="Buka percakapan"
            aria-expanded={isOpen}
          >
            <Bot className="w-7 h-7" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b0f10]" />
          </button>
        </div>
      )}
      {isOpen && !fullPage && (
        <div className="fixed top-20 left-0 right-0 bottom-0 z-[9999] flex flex-col bg-[#0b0f10] animate-in slide-in-from-bottom-4 fade-in duration-300" role="region" aria-label="Percakapan Agri-SAW">
          {chatContent}
        </div>
      )}
    </>
  );
}
