'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, MoreVertical } from 'lucide-react';
import { FAQ_CONTENT, type FaqSection, type FaqItem } from '@/lib/faq-content';

// ─── localStorage keys ───────────────────────────────────────────────
const STORAGE_KEY = 'agri-saw-user';

interface StoredUserData {
  name: string;
  gender: 'laki' | 'perempuan';
  lastParams?: Record<string, unknown>;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface QuickReply {
  label: string;
  value: string;
}

interface PreferenceOption {
  id: string;
  label: string;
  criterionId: string;
}

type FlowPhase = 'welcome' | 'ringkasan' | 'collecting' | 'confirming' | 'preference' | 'detail' | 'done';
type FaqView = 'none' | 'categories' | 'items' | 'answer';

// ─── Parameter → FAQ mapping for all-crops-eliminated flow ───────────
const PARAM_TO_FAQ: Record<string, { sectionId: string; itemId: string; label: string }> = {
  'pH tanah':            { sectionId: 'faq-params', itemId: 'param-ph',              label: 'Pelajari cara memperbaiki pH tanah' },
  'ketinggian':          { sectionId: 'faq-params', itemId: 'param-ketinggian',       label: 'Pelajari soal ketinggian tempat' },
  'curah hujan':         { sectionId: 'faq-params', itemId: 'param-curah-hujan',      label: 'Pelajari soal curah hujan' },
  'tekstur tanah':       { sectionId: 'faq-params', itemId: 'param-tekstur-tanah',    label: 'Pelajari soal tekstur tanah' },
  'intensitas cahaya':   { sectionId: 'faq-params', itemId: 'param-cahaya',           label: 'Pelajari soal intensitas cahaya' },
};

function extractOutOfRangeParams(eliminated: Array<{ name: string; reasons: string[] }>): string[] {
  const params = new Set<string>();
  for (const crop of eliminated) {
    for (const reason of crop.reasons) {
      const lower = reason.toLowerCase();
      if (lower.includes('ph')) params.add('pH tanah');
      if (lower.includes('ketinggian') || lower.includes('mdpl')) params.add('ketinggian');
      if (lower.includes('curah hujan') || lower.includes('hujan') || lower.includes('mm/tahun')) params.add('curah hujan');
      if (lower.includes('tekstur') || (lower.includes('tanah') && (lower.includes('liat') || lower.includes('pasir') || lower.includes('lempung')))) params.add('tekstur tanah');
      if (lower.includes('cahaya') || lower.includes('jam/hari')) params.add('intensitas cahaya');
    }
  }
  return Array.from(params);
}

// ─── Quick replies per parameter ─────────────────────────────────────
const QUICK_REPLIES: Record<string, QuickReply[]> = {
  'ketinggian': [
    { label: 'Dataran rendah', value: 'lahan saya di dataran rendah 200 mdpl' },
    { label: 'Dataran sedang', value: 'lahan saya di dataran sedang 500 mdpl' },
    { label: 'Pegunungan', value: 'lahan saya di pegunungan 900 mdpl' },
    { label: 'Saya tidak tahu persis', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'curah hujan': [
    { label: 'Hampir setiap hari hujan', value: 'hujan hampir tiap hari' },
    { label: 'Cukup sering', value: 'hujan sering' },
    { label: 'Cukup (beberapa kali seminggu)', value: 'curah hujan cukup' },
    { label: 'Jarang', value: 'hujan jarang' },
    { label: 'Saya tidak tahu persis', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'pH tanah': [
    { label: 'Tanaman sering menguning/kerdil', value: 'tanah asam tanaman sering menguning' },
    { label: 'Tumbuh biasa saja', value: 'tanah netral tumbuh biasa' },
    { label: 'Hijau dan subur', value: 'tanah subur hijau' },
    { label: 'Saya tidak tahu persis', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'tekstur tanah': [
    { label: 'Lengket/liat saat basah', value: 'tanah liat lengket' },
    { label: 'Gembur/lempung', value: 'tanah gembur lempung' },
    { label: 'Kasar/berpasir', value: 'tanah berpasir kasar' },
    { label: 'Saya tidak tahu persis', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'intensitas cahaya': [
    { label: 'Teduh (6-8 jam)', value: 'cahaya teduh 7 jam' },
    { label: 'Sedang (8-10 jam)', value: 'cahaya 9 jam' },
    { label: 'Penuh (12+ jam)', value: 'cahaya penuh 12 jam' },
    { label: 'Saya tidak tahu persis', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
};
const TOOLTIPS: Record<string, string> = {
  'ketinggian': 'Ketinggian menentukan suhu udara dan tekanan atmosfer, yang sangat memengaruhi jenis tanaman yang bisa tumbuh.',
  'curah hujan': 'Curah hujan menentukan ketersediaan air untuk tanaman. Terlalu banyak atau terlalu sedikit bisa merusak tanaman.',
  'pH tanah': 'pH tanah menentukan nutrisi yang tersedia bagi tanaman. Tanah terlalu asam atau basa bisa menghambat pertumbuhan.',
  'tekstur tanah': 'Tekstur tanah menentukan drainase dan kemampuan menahan air. Berbeda tekstur, berbeda jenis tanaman yang cocok.',
  'intensitas cahaya': 'Cahaya matahari dibutuhkan untuk fotosintesis. Kebutuhan cahaya berbeda untuk setiap jenis tanaman.',
};

const PARAM_LABELS: Record<string, { label: string; emoji: string; format: (v: unknown) => string }> = {
  'ketinggian':        { label: 'Ketinggian',        emoji: '📍', format: (v) => `${v} mdpl` },
  'curah hujan':       { label: 'Curah hujan',       emoji: '🌧️', format: (v) => `${v} mm/tahun` },
  'pH tanah':          { label: 'pH tanah',          emoji: '🔬', format: (v) => `pH ${v}` },
  'tekstur tanah':     { label: 'Tekstur tanah',     emoji: '🤲', format: (v) => `${v}` },
  'intensitas cahaya': { label: 'Intensitas cahaya', emoji: '☀️', format: (v) => `${v} jam/hari` },
};
const PARAM_ORDER: string[] = ['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah', 'intensitas cahaya'];

const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: 'pref_biaya',         label: 'Biaya produksi rendah',   criterionId: 'biaya_produksi' },
  { id: 'pref_harga',         label: 'Harga jual tinggi',       criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: 'Produktivitas tinggi',    criterionId: 'produktivitas' },
  { id: 'pref_risiko',        label: 'Risiko rendah',           criterionId: 'risiko' },
  { id: 'pref_permintaan',    label: 'Permintaan pasar tinggi', criterionId: 'permintaan' },
];

// ─── Animated dots component ─────────────────────────────────────────
function AnimatedDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
}

// ─── Sapaan helper ───────────────────────────────────────────────────
function sapaan(gender: 'laki' | 'perempuan' | ''): string {
  return gender === 'perempuan' ? 'Ibu' : 'Bapak';
}

// ─── Ringkasan message (Phase 2) ─────────────────────────────────────
function ringkasanMessage(name: string, gender: 'laki' | 'perempuan' | ''): string {
  const salam = gender === 'perempuan' ? `Ibu ${name}` : `Bapak ${name}`;
  return [
    `Terima kasih, ${salam}! Sebelum kita mulai, izinkan saya menjelaskan singkat cara kerja sistem ini.`,
    '',
    `Saya akan membantu ${salam} memilih komoditas terbaik untuk lahan ${salam}. Caranya begini:`,
    '',
    'Pertama, saya akan menanyakan 5 kondisi lahan, seperti ketinggian, curah hujan, dan kondisi tanah. Nanti saya cocokkan dengan 6 jenis tanaman: Padi, Jagung, Kedelai, Cabai, Bawang Merah, dan Bawang Putih.',
    '',
    'Tanaman yang cocok dengan lahan, kemudian saya hitung mana yang paling menguntungkan, dilihat dari biaya tanam, harga jual, sampai risikonya.',
    '',
    `Gampangnya begitu, ${salam.split(' ')[0]}. Ada yang ingin ditanyakan dulu, atau langsung mulai?`,
  ].join('\n');
}

// ─── Parameter question messages (conversational) ────────────────────
type ParamQuestionFn = (name: string, gender: 'laki' | 'perempuan' | '') => string;
const PARAM_QUESTION_MESSAGES: Record<string, ParamQuestionFn> = {
  'ketinggian': (name, gender) => {
    const s = sapaan(gender);
    return `Baik, ${s} ${name}. Selanjutnya saya ingin tahu soal ketinggian lahan ${s}. Ini penting karena beda ketinggian, beda juga suhu dan jenis tanaman yang bisa tumbuh. Kira-kira lahan ${s} di dataran rendah, sedang, atau pegunungan?`;
  },
  'curah hujan': (name, gender) => {
    const s = sapaan(gender);
    return `Oke, ${s} ${name}. Sekarang saya ingin menanyakan soal curah hujan di daerah ${s}. Air adalah kebutuhan utama tanaman, jadi ini salah satu hal yang paling penting. Kira-kira seberapa sering hujannya, ${s}? Hampir tiap hari, cukup sering, atau jarang?`;
  },
  'pH tanah': (name, gender) => {
    const s = sapaan(gender);
    return `Baik, ${s} ${name}. Selanjutnya soal kondisi tanah. Ini agak sulit diamati langsung, tapi ${s} pernah tidak melihat tanaman di lahan ${s} sering menguning atau kerdil? Atau tumbuh biasa saja?`;
  },
  'tekstur tanah': (name, gender) => {
    const s = sapaan(gender);
    return `Oke, ${s} ${name}. Coba ${s} perhatikan tanah di lahan ${s}. Kalau diambil dan dibasahi, terasa lengket tidak? Atau justru kasar seperti pasir? Ini akan membantu saya menentukan tanaman yang paling cocok.`;
  },
  'intensitas cahaya': (name, gender) => {
    const s = sapaan(gender);
    return `Baik, ${s} ${name}. Terakhir, saya ingin tahu soal sinar matahari. Kira-kira lahan ${s} terpapar matahari berapa jam sehari? Setiap tanaman butuh cahaya berbeda-beda, jadi informasi ini sangat membantu.`;
  },
};

// =====================================================================
// ─── MAIN COMPONENT ──────────────────────────────────────────────────
// =====================================================================
export default function ChatWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<FlowPhase>('welcome');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'laki' | 'perempuan' | ''>('');
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

  // FAQ state
  const [faqView, setFaqView] = useState<FaqView>('none');
  const [faqSelectedSection, setFaqSelectedSection] = useState<FaqSection | null>(null);
  const [faqSelectedItem, setFaqSelectedItem] = useState<FaqItem | null>(null);

  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  // Flag: input is temporarily enabled after "Kurang yakin" escape

  // "Kembali ke ringkasan" flag: after FAQ answer, show ringkasan again
  const [returningToRingkasan, setReturningToRingkasan] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdCounter = useRef(0);
  const nextMsgId = () => { msgIdCounter.current += 1; return `msg-${msgIdCounter.current}`; };

  // ─── Input lock ────────────────────────────────────────────────────
  const isInputDisabled = true; // completely locked to button UI

  // ─── localStorage: load on mount ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredUserData = JSON.parse(stored);
        if (data.name) setFormName(data.name);
        if (data.gender) setFormGender(data.gender);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

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
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: nextMsgId(),
        role: 'assistant',
        content: 'Halo! Selamat datang di Agri-SAW Pro. 🌾\n\nSaya adalah asisten virtual yang akan membantu merekomendasikan komoditas pertanian terbaik untuk lahan Anda.\n\nSebelum mulai, silakan isi data diri dulu ya:',
      }]);
      setPhase('welcome');
    }
  }, [isOpen, messages.length]);

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
    if (data.userValues) {
      setPreviousParams(data.userValues);
      setCollectedParams(data.userValues);
    }
    const remaining = data.missingParams || [];
    setCurrentMissingParams(remaining);

    if (remaining.length === 0) {
      // All params collected → go to confirmation
      setCollectedParams(data.userValues || null);
      setPhase('confirming');
    } else {
      // Ask next param — only push data.message (already contains the next question from API)
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'assistant', content: data.message },
      ]);
    }
  }, [userGender, userName]);

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
      // "Kembali ke ringkasan" after FAQ
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
      // "Lihat detail [crop]"
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
      // All-crops-eliminated: "Pelajari [param]"
      if (value.startsWith('__PELAJARI__')) {
        const param = value.replace('__PELAJARI__', '');
        handleOutOfRangeFaqClick(param);
        return;
      }
      if (value === '__ELIMINASI_KEMBALI__') {
        handleUlangiFromRingkasan();
        return;
      }
      // Closing: "Konsultasi ulang" / "Kembali ke beranda"
      if (value === '__CLOSING_ULANGI__') {
        handleUlangiFromRingkasan();
        return;
      }
      if (value === '__CLOSING_BERANDA__') {
        // Reset to welcome
        setPhase('welcome');
        setMessages([{
          id: nextMsgId(),
          role: 'assistant',
          content: 'Halo! Selamat datang di Agri-SAW Pro. 🌾\n\nSaya adalah asisten virtual yang akan membantu merekomendasikan komoditas pertanian terbaik untuk lahan Anda.\n\nSebelum mulai, silakan isi data diri dulu ya:',
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

    if (value === '__ESCAPE_TIDAK_TAHU__') {
      const paramName = currentMissingParams[0] || 'parameter ini';
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: `Saya tidak tahu persis soal ${paramName}.` }]);
      callCollectingAPI(`[skip:${paramName}]`);
      return;
    }



    // Normal reply
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: value }]);
    callCollectingAPI(value);
  };

  // ════════════════════════════════════════════════════════════════════
  // TEXT INPUT (Disabled, keeping handler just in case)
  // ════════════════════════════════════════════════════════════════════
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    // Minimum 3 second delay for loading screen
    const { promise: minDelay, resolve: resolveDelay } = Promise.withResolvers<void>();
    setTimeout(resolveDelay, 3000);

    try {
      const body: Record<string, unknown> = { message: 'Hitung rekomendasi', previousParams: params };
      if (preferences && preferences.length > 0) body.preferences = preferences;

      const { promise: apiCall, resolve: resolveApi, reject: rejectApi } = Promise.withResolvers<{
        message: string;
        userValues?: Record<string, unknown>;
        missingParams?: string[];
        surviving?: Array<{ name: string; score: string; normalizedValues?: Record<string, number>; explanation?: string }>;
        eliminated?: Array<{ name: string; reasons: string[] }>;
        mode?: string;
      }>();

      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then(resolveApi)
        .catch(rejectApi);

      // Wait for both API and minimum delay
      const data = await apiCall;
      await minDelay;

      if (data.userValues) {
        setPreviousParams(data.userValues);
        saveToStorage(userName, userGender, data.userValues);
      }
      if (data.missingParams) setCurrentMissingParams(data.missingParams);

      // Handle all-crops-eliminated
      if (data.mode === 'all-eliminated' || (data.eliminated && data.eliminated.length > 0 && (!data.surviving || data.surviving.length === 0))) {
        const eliminated = data.eliminated || [];
        setEliminatedCrops(eliminated);
        const oorParams = extractOutOfRangeParams(eliminated);
        setOutOfRangeParams(oorParams);
        const sal = sapaan(userGender);
        const eliminationList = eliminated
          .map((e: { name: string; reasons: string[] }) => `• ${e.name}: ${e.reasons.join('; ')}`)
          .join('\n');
        const message = [
          `Maaf, ${sal} ${userName}, sepertinya belum ada tanaman yang cocok dengan kondisi lahan ${sal} saat ini.`,
          '',
          'Berikut alasan mengapa masing-masing tanaman tidak cocok:',
          eliminationList,
          '',
          `Jangan berkecil hati, ${sal}. Saya bisa bantu ${sal} mempelajari cara memperbaiki kondisi lahan. Silakan pilih topik di bawah ini.`,
        ].join('\n');
        setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: message }]);
        setPhase('done');
        return;
      }
      // Filter 1 done, show preference selection
      if (!preferences && data.surviving && data.surviving.length > 0) {
        const surviving = data.surviving;
        setCollectedParams(params);
        setSurvivingCrops(surviving);
        setEliminatedCrops(data.eliminated || []);
        setShowPreferences(true);
        setPhase('preference');
        const sal = sapaan(userGender);
        const cropList = surviving.map((s: { name: string }) => s.name).join(', ');
        setMessages((prev) => [...prev, {
          id: nextMsgId(),
          role: 'assistant',
          content: `Bagus, ${sal} ${userName}! Dari 6 jenis tanaman, ada ${surviving.length} yang cocok dengan lahan ${sal}: ${cropList}.\n\nSekarang, untuk menentukan ranking terbaik, saya perlu tahu prioritas ${sal}. Mana yang lebih penting?\n\n• Biaya tanam yang murah?\n• Harga jual yang tinggi?\n• Hasil panen yang banyak?\n• Risiko yang rendah?\n• Permintaan pasar yang tinggi?\n\n${sal} bisa pilih satu atau lebih, ${sal.split(' ')[0]}.`,
        }]);
        return;
      }
      // Final result (after preference submit)
      if (data.surviving && data.surviving.length > 0) {
        const surviving = data.surviving;
        setSurvivingCrops(surviving);
        setEliminatedCrops(data.eliminated || []);
      }
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
      setPhase('done');
    } catch (error) {
      const sal = sapaan(userGender);
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: `Maaf, ${sal} ${userName}, ada kendala teknis. Silakan coba lagi nanti, atau hubungi penyuluh pertanian setempat untuk konsultasi langsung.` }]);
    } finally {
      setIsLoading(false);
      setShowLoadingScreen(false);
      setCollectedParams(null);
    }
  };

  const handlePreferenceSubmit = () => {
    if (collectedParams) proceedWithCalculation(collectedParams, selectedPreferences);
  };

  const handleTogglePreference = (criterionId: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(criterionId) ? prev.filter((id) => id !== criterionId) : [...prev, criterionId]
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // PHASE 6: RESULT — "Ulangi" / "Selesai" / "Lihat detail"
  // ════════════════════════════════════════════════════════════════════
  const handleUlangiFromRingkasan = () => {
    setCollectedParams(null);
    setEliminatedCrops([]);
    setOutOfRangeParams([]);
    setSurvivingCrops([]);
    setSelectedCropDetail(null);
    setFaqView('none');
    setFaqSelectedSection(null);
    setFaqSelectedItem(null);
    setSelectedPreferences([]);
    setShowPreferences(false);
    setReturningToRingkasan(false);

    // Go back to ringkasan (Phase 2)
    setPhase('ringkasan');
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: 'Ulangi konsultasi' },
      { id: nextMsgId(), role: 'assistant', content: `Baik, ${sapaan(userGender)} ${userName}. Kita ulang dari awal ya. Silakan periksa data lahan Anda lagi.` },
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
  // RENDER: FAQ quick replies
  // ════════════════════════════════════════════════════════════════════
  const renderFaqQuickReplies = () => {
    if (faqView === 'none') return null;

    if (faqView === 'categories') {
      return (
        <div className="pl-8 space-y-2" role="group" aria-label="Kategori FAQ">
          <p className="text-xs text-white/50 font-medium mb-2">Silakan pilih topik yang ingin dipelajari:</p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {FAQ_CONTENT.map((section) => (
              <button
                key={section.id}
                onClick={() => handleFaqCategorySelect(section)}
                className="text-xs px-3 py-2.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all cursor-pointer min-h-[44px]"
              >
                {section.title}
              </button>
            ))}
            <button
              onClick={() => { setFaqView('none'); setReturningToRingkasan(true); }}
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
                onClick={() => handleFaqItemSelect(item)}
                className="text-left text-xs px-3 py-2.5 rounded-lg border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all cursor-pointer"
              >
                {item.question}
              </button>
            ))}
            <button
              onClick={handleFaqBack}
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
            onClick={() => { handleFaqBack(); setReturningToRingkasan(true); }}
            className="text-xs px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer"
          >
            ← Kembali ke ringkasan
          </button>
        </div>
      );
    }

    return null;
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: All-crops-eliminated FAQ links
  // ════════════════════════════════════════════════════════════════════
  const renderEliminatedFaqLinks = () => {
    if (phase !== 'done' || eliminatedCrops.length === 0 || outOfRangeParams.length === 0) return null;

    return (
      <div className="pl-8 space-y-2" role="group" aria-label="FAQ untuk parameter bermasalah">
        <p className="text-xs text-white/50 font-medium mb-2">Pelajari cara memperbaiki kondisi lahan Anda:</p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          {outOfRangeParams.map((param) => {
            const mapping = PARAM_TO_FAQ[param];
            if (!mapping) return null;
            return (
              <button
                key={param}
                onClick={() => handleQuickReply(`__PELAJARI__${param}`)}
                className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
              >
                {mapping.label}
              </button>
            );
          })}
          <button
            onClick={() => handleQuickReply('__ELIMINASI_KEMBALI__')}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Ringkasan quick replies (Phase 2)
  // ════════════════════════════════════════════════════════════════════
const renderRingkasanQuickReplies = () => {
  if (phase !== 'ringkasan' || faqView !== 'none' || returningToRingkasan) return null;
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
          Ada pertanyaan dulu
        </button>
      </div>
    </div>
  );
};

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Returning to ringkasan after FAQ
  // ════════════════════════════════════════════════════════════════════
  const renderReturnToRingkasan = () => {
    if (!returningToRingkasan || faqView !== 'none') return null;
    // Only show in ringkasan phase
    if (phase !== 'ringkasan') return null;
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Kembali ke ringkasan">
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
            Ada pertanyaan lain
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
  // RENDER: Preference quick replies (Phase 5)
  // ════════════════════════════════════════════════════════════════════
  const renderPreferenceQuickReplies = () => {
    if (phase !== 'preference' || !showPreferences || isLoading) return null;
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Preferensi">
        <div className="flex flex-col gap-2">
          {PREFERENCE_OPTIONS.map((opt) => {
            const sel = selectedPreferences.includes(opt.criterionId);
            return (
              <button
                key={opt.id}
                onClick={() => handleTogglePreference(opt.criterionId)}
                role="checkbox"
                aria-checked={sel}
                className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all cursor-pointer min-h-[44px] ${sel ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                <span className="mr-2">{sel ? '✅' : '⬜'}</span>{opt.label}
              </button>
            );
          })}
          <button
            onClick={() => handleQuickReply('__PREF_HITUNG_RANKING__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__PREF_HITUNG_RANKING__')}
            tabIndex={0}
            className="w-full text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px] font-bold"
          >
            Hitung Ranking
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Result quick replies (Phase 6)
  // ════════════════════════════════════════════════════════════════════
  const renderResultQuickReplies = () => {
    if (phase !== 'done' || isLoading) return null;

    // All-crops-eliminated: show "Pelajari" + "Kembali" (handled by renderEliminatedFaqLinks)
    if (survivingCrops.length === 0) return null;

    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Hasil rekomendasi">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          {survivingCrops.map((crop) => (
            <button
              key={crop.name}
              onClick={() => handleQuickReply(`__DETAIL__${crop.name}`)}
              onKeyDown={(e) => handleQuickReplyKeyDown(e, `__DETAIL__${crop.name}`)}
              tabIndex={0}
              className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
            >
              Lihat detail {crop.name}
            </button>
          ))}
          <button
            onClick={() => handleQuickReply('__ULANGI_KONSULTASI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__ULANGI_KONSULTASI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Ulangi konsultasi
          </button>
          <button
            onClick={() => handleQuickReply('__SELESAI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__SELESAI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Detail quick replies (Phase 6.x)
  // ════════════════════════════════════════════════════════════════════
  const renderDetailQuickReplies = () => {
    if (phase !== 'detail' || !selectedCropDetail) return null;
    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Detail tanaman">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            onClick={() => handleQuickReply('__DETAIL_KEMBALI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__DETAIL_KEMBALI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Kembali ke hasil
          </button>
          <button
            onClick={() => handleQuickReply('__DETAIL_ULANGI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__DETAIL_ULANGI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Ulangi konsultasi
          </button>
          <button
            onClick={() => handleQuickReply('__DETAIL_SELESAI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__DETAIL_SELESAI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Closing quick replies (after "Selesai")
  // ════════════════════════════════════════════════════════════════════
  const renderClosingQuickReplies = () => {
    // Show closing options when in done phase and the last message is the closing message
    if (phase !== 'done') return null;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.content.includes('Terima kasih')) return null;

    return (
      <div className="pl-8 space-y-2" role="group" aria-label="Penutup">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            onClick={() => handleQuickReply('__CLOSING_ULANGI__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__CLOSING_ULANGI__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
          >
            Konsultasi ulang
          </button>
          <button
            onClick={() => handleQuickReply('__CLOSING_BERANDA__')}
            onKeyDown={(e) => handleQuickReplyKeyDown(e, '__CLOSING_BERANDA__')}
            tabIndex={0}
            className="text-xs px-3 py-2.5 rounded-full border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 transition-all cursor-pointer min-h-[44px]"
          >
            Kembali ke beranda
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Confirmation data recap card (Phase 4)
  // ════════════════════════════════════════════════════════════════════
  const renderConfirmingCard = () => {
    if (phase !== 'confirming' || !collectedParams || isLoading) return null;
    return (
      <div className="flex gap-2 max-w-[92%]">
        <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
          <Bot className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
          <p className="text-slate-200 text-sm font-semibold mb-2">Baik, {sapaan(userGender)}! Semua data lahan sudah terkumpul. Silakan periksa dulu, apakah data di bawah ini sudah benar:</p>
          <div className="space-y-1.5 mb-3">
            {PARAM_ORDER.map((key) => {
              const val = collectedParams[key];
              if (val == null) return null;
              const meta = PARAM_LABELS[key];
              if (!meta) return null;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span>{meta.emoji}</span>
                  <span className="text-white/60">{meta.label}:</span>
                  <span className="text-emerald-300 font-medium">{meta.format(val)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-white/50 text-xs">Kalau ada yang salah, saya bisa ulangi dari awal.</p>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Detail card (Phase 6.x)
  // ════════════════════════════════════════════════════════════════════
  const renderDetailCard = () => {
    if (phase !== 'detail' || !selectedCropDetail) return null;
    const nv = selectedCropDetail.normalizedValues || {};
    const criteriaLabels: Record<string, string> = {
      biaya_produksi: 'Biaya Produksi',
      harga_jual: 'Harga Jual',
      produktivitas: 'Produktivitas',
      risiko: 'Risiko',
      permintaan: 'Permintaan Pasar',
    };
    return (
      <div className="flex gap-2 max-w-[92%]">
        <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
          <Bot className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
          <p className="text-slate-200 text-sm font-semibold mb-2">Detail penilaian: {selectedCropDetail.name}</p>
          <p className="text-white/50 text-xs mb-2">Berikut rincian penilaian untuk {selectedCropDetail.name}:</p>
          <div className="space-y-1.5">
            {Object.entries(nv).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{criteriaLabels[key] || key}:</span>
                <span className="text-emerald-300 font-medium">{typeof val === 'number' ? val.toFixed(3) : val}</span>
              </div>
            ))}
          </div>
          {selectedCropDetail.explanation && (
            <p className="text-white/50 text-xs mt-2 pt-2 border-t border-white/10">{selectedCropDetail.explanation}</p>
          )}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER: Input hint text
  // ════════════════════════════════════════════════════════════════════
  const getInputHint = (): string => {
    if (phase === 'welcome') return 'Silakan isi form di atas';
    if (phase === 'ringkasan') return 'Pilih opsi di atas';
    if (phase === 'collecting') return 'Pilih jawaban di atas';
    if (phase === 'confirming') return 'Klik tombol di atas';
    if (phase === 'preference') return 'Pilih preferensi di atas';
    if (phase === 'detail') return 'Pilih opsi di atas';
    if (phase === 'done') return 'Pilih opsi di atas';
    return '';
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
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 max-w-[92%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
                <Bot className="w-3 h-3 text-emerald-400" />
              </div>
            )}
            <div className={`rounded-2xl rounded-tl-sm p-2.5 border shadow-lg ${msg.role === 'assistant' ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-emerald-400/10 backdrop-blur-md border-emerald-400/30'}`}>
              <p className={`whitespace-pre-line text-sm leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200' : 'text-emerald-50'}`}>{msg.content}</p>
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

        {/* ── Phase 1: Welcome form ───────────────────────────── */}
        {phase === 'welcome' && !isLoading && (
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
              <Bot className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
              <div className="space-y-3">
                <div>
                  <label htmlFor="form-nama" className="block text-xs text-white/60 mb-1 font-medium">Nama <span className="text-red-400">*</span></label>
                  <input
                    id="form-nama"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-2 font-medium">Jenis Kelamin</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormGender('laki')}
                      className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${formGender === 'laki' ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormGender('perempuan')}
                      className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${formGender === 'perempuan' ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleFormSubmit}
                  disabled={!formName.trim()}
                  className="w-full text-sm px-4 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Mulai Konsultasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 4: Confirmation card ──────────────────────── */}
        {renderConfirmingCard()}

        {/* ── Phase 6.x: Detail card ──────────────────────────── */}
        {renderDetailCard()}

        {/* ── Phase 3: Collecting quick replies + tooltip ──────── */}
        {phase === 'collecting' && !isLoading && quickReplies.length > 0 && (
          <div className="pl-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-medium">
                Mengapa saya menanyakan <span className="text-emerald-400/70">{currentParam}</span>?
              </span>
              {currentTooltip && (
                <button
                  onClick={() => setActiveTooltip((prev) => prev === currentParam ? null : currentParam)}
                  className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center cursor-pointer ${activeTooltip === currentParam ? 'bg-emerald-400/30 border-emerald-400/60 text-emerald-300' : 'bg-white/5 border-white/20 text-white/40'}`}
                  aria-label={`Penjelasan ${currentParam}`}
                >
                  ⓘ
                </button>
              )}
            </div>
            {activeTooltip === currentParam && currentTooltip && (
              <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed">
                {currentTooltip}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2" role="group" aria-label="Pilihan jawaban">
              {quickReplies.map((qr) => (
                <button
                  key={qr.value}
                  onClick={() => handleQuickReply(qr.value)}
                  onKeyDown={(e) => handleQuickReplyKeyDown(e, qr.value)}
                  tabIndex={0}
                  role="button"
                  aria-label={qr.label}
                  disabled={isLoading}
                  className={`text-xs px-3 py-2.5 rounded-full border transition-all cursor-pointer disabled:opacity-50 min-h-[44px] ${qr.value.startsWith('__ESCAPE') ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'}`}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Phase 2: Ringkasan quick replies ────────────────── */}
        {renderRingkasanQuickReplies()}

        {/* ── Return to ringkasan after FAQ ────────────────────── */}
        {renderReturnToRingkasan()}

        {/* ── Phase 4: Confirming quick replies ────────────────── */}
        {renderConfirmingQuickReplies()}

        {/* ── Phase 5: Preference quick replies ────────────────── */}
        {renderPreferenceQuickReplies()}

        {/* ── Phase 6: Result quick replies ────────────────────── */}
        {renderResultQuickReplies()}

        {/* ── Phase 6.x: Detail quick replies ──────────────────── */}
        {renderDetailQuickReplies()}

        {/* ── Closing quick replies ────────────────────────────── */}
        {renderClosingQuickReplies()}

        {/* ── FAQ quick replies ────────────────────────────────── */}
        {renderFaqQuickReplies()}

        {/* ── All-crops-eliminated FAQ links ───────────────────── */}
        {renderEliminatedFaqLinks()}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Input area ────────────────────────────────────────── */}
      <div className="p-2.5 border-t border-white/10 bg-black/60 shrink-0">
        {isInputDisabled ? (
          <div className="text-center py-2">
            <span className="text-xs text-white/30">{getInputHint()}</span>
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="relative flex items-center mb-1">
            <input
              className="w-full bg-[#0b0f10] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-all"
              placeholder="Ketik pesan..."
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
