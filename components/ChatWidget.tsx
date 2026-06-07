'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MoreVertical } from 'lucide-react';

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

// ─── Flow phases ───
// 'welcome'   → show greeting + form, input disabled
// 'collecting'→ bot asks params via quick replies, input disabled
// 'confirming'→ show collected data + "Hitung" button
// 'preference'→ ask weight preferences
// 'done'      → result shown
type FlowPhase = 'welcome' | 'collecting' | 'confirming' | 'preference' | 'done';

// ─── Quick reply options per parameter ───
const QUICK_REPLIES: Record<string, QuickReply[]> = {
  'ketinggian': [
    { label: '🏖️ Dataran rendah (0–400 mdpl)', value: 'lahan saya di dataran rendah 200 mdpl' },
    { label: '⛰️ Dataran sedang (400–700 mdpl)', value: 'lahan saya di dataran sedang 500 mdpl' },
    { label: '🏔️ Pegunungan (700+ mdpl)', value: 'lahan saya di pegunungan 900 mdpl' },
    { label: '❓ Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: '🤔 Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'curah hujan': [
    { label: '🌧️ Hampir tiap hari', value: 'hujan hampir tiap hari' },
    { label: '🌦️ Sering (5x/minggu)', value: 'hujan sering' },
    { label: '⛅ Cukup (3-4x/minggu)', value: 'curah hujan cukup' },
    { label: '☀️ Jarang (1-2x/minggu)', value: 'hujan jarang' },
    { label: '❓ Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: '🤔 Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'pH tanah': [
    { label: '🟡 Tanaman sering menguning/kerdil', value: 'tanah asam tanaman sering menguning' },
    { label: '🟢 Tumbuh biasa saja', value: 'tanah netral tumbuh biasa' },
    { label: '🌿 Hijau dan subur', value: 'tanah subur hijau' },
    { label: '❓ Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: '🤔 Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'tekstur tanah': [
    { label: '🟤 Lengket/liat saat basah', value: 'tanah liat lengket' },
    { label: '🟠 Gembur/lempung', value: 'tanah gembur lempung' },
    { label: '⚪ Kasar/berpasir', value: 'tanah berpasir kasar' },
    { label: '❓ Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: '🤔 Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'intensitas cahaya': [
    { label: '☁️ Teduh (6-8 jam)', value: 'cahaya teduh 7 jam' },
    { label: '🌤️ Sedang (8-10 jam)', value: 'cahaya 9 jam' },
    { label: '☀️ Penuh (12+ jam)', value: 'cahaya penuh 12 jam' },
    { label: '❓ Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: '🤔 Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
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
  elevation:  { label: 'Ketinggian',        emoji: '📍', format: (v) => `${v} mdpl` },
  rainfall:   { label: 'Curah hujan',       emoji: '🌧️', format: (v) => `${v} mm/tahun` },
  pH:         { label: 'pH tanah',          emoji: '🔬', format: (v) => `pH ${v}` },
  texture:    { label: 'Tekstur tanah',     emoji: '🤲', format: (v) => `${v}` },
  light:      { label: 'Intensitas cahaya', emoji: '☀️', format: (v) => `${v} jam/hari` },
};
const PARAM_ORDER: string[] = ['elevation', 'rainfall', 'pH', 'texture', 'light'];

const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: 'pref_biaya',         label: '💰 Biaya produksi rendah',   criterionId: 'biaya_produksi' },
  { id: 'pref_harga',         label: '📈 Harga jual tinggi',       criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: '🌾 Produktivitas tinggi',  criterionId: 'produktivitas' },
  { id: 'pref_risiko',        label: '🛡️ Risiko rendah',          criterionId: 'risiko' },
  { id: 'pref_permintaan',    label: '📊 Permintaan pasar tinggi', criterionId: 'permintaan' },
];

function getQuickReplies(missingParams: string[]): QuickReply[] {
  if (missingParams.length === 0) return [];
  return QUICK_REPLIES[missingParams[0]] || [];
}

export default function ChatWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<FlowPhase>('welcome');

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [userName, setUserName] = useState('');

  const [previousParams, setPreviousParams] = useState<Record<string, unknown> | undefined>(undefined);
  const [currentMissingParams, setCurrentMissingParams] = useState<string[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [collectedParams, setCollectedParams] = useState<Record<string, unknown> | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [uncertainParams, setUncertainParams] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdCounter = useRef(0);
  const nextMsgId = () => { msgIdCounter.current += 1; return `msg-${msgIdCounter.current}`; };

  // ─── Is input box disabled? Yes during welcome (form), collecting (quick replies), confirming, preference ───
  const isInputDisabled = phase === 'welcome' || phase === 'collecting' || phase === 'confirming' || phase === 'preference';

  // ─── Send welcome on first open ───
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: nextMsgId(),
        role: 'assistant',
        content: 'Halo! Selamat datang di Agri-SAW Pro 🌾\n\nSaya akan membantu merekomendasikan komoditas pertanian terbaik berdasarkan kondisi lahan Anda.\n\nSebelum mulai, silakan isi data diri Anda:',
      }]);
    }
  }, [isOpen, messages.length]);

  // ─── Scroll to bottom ───
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ─── Escape key closes floating widget ───
  useEffect(() => {
    if (!isOpen || fullPage) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fullPage]);

  // ─── Form submit → start collecting ───
  const handleFormSubmit = () => {
    const name = formName.trim() || 'Petani';
    const email = formEmail.trim();
    const location = formLocation.trim();
    setUserName(name);

    const details: string[] = [`Nama: ${name}`];
    if (email) details.push(`Email: ${email}`);
    if (location) details.push(`Lokasi: ${location}`);

    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: details.join('\n') },
      {
        id: nextMsgId(),
        role: 'assistant',
        content: `Terima kasih, ${name}! 👋\n\nSekarang saya akan menanyakan kondisi lahan Anda. Silakan pilih jawaban di bawah ini.\n\nParameter yang akan ditanyakan:\n📍 Ketinggian\n🌧️ Curah hujan\n🔬 pH tanah\n🤲 Tekstur tanah\n☀️ Intensitas cahaya`,
      },
    ]);

    setPhase('collecting');
    setCurrentMissingParams([...PARAM_ORDER]);
  };

  // ─── API call to get recommendations ───
  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setIsLoading(true);
    setShowPreferences(false);
    try {
      const body: Record<string, unknown> = { message: 'Hitung rekomendasi', previousParams: params };
      if (preferences && preferences.length > 0) body.preferences = preferences;
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses rekomendasi');
      if (data.userValues) setPreviousParams(data.userValues);
      if (data.missingParams) setCurrentMissingParams(data.missingParams);

      if (!preferences && data.surviving && data.surviving.length > 0) {
        setCollectedParams(params);
        setShowPreferences(true);
        setPhase('preference');
        setMessages((prev) => [...prev, {
          id: nextMsgId(),
          role: 'assistant',
          content: `✅ Filter 1 Selesai, ${userName}!\n\n${data.surviving.length} komoditas lolos: ${data.surviving.map((s: { name: string }) => s.name).join(', ')}\n\nSebelum menghitung ranking akhir, apa yang paling penting untuk Anda?\n(Pilih satu atau lebih)`,
        }]);
        return;
      }
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
      setPhase('done');
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: nextMsgId(),
        role: 'assistant',
        content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }]);
    } finally {
      setIsLoading(false);
      setCollectedParams(null);
    }
  };

  // ─── Quick reply handler ───
  const handleQuickReply = (value: string) => {
    if (isLoading) return;
    const currentParam = currentMissingParams[0];

    // Escape: Tidak tahu → skip parameter
    if (value === '__ESCAPE_TIDAK_TAHU__') {
      const skipMsg = `Saya tidak tahu ${currentParam || 'parameter ini'}.`;
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: skipMsg }]);
      const remaining = currentMissingParams.slice(1);
      setCurrentMissingParams(remaining);
      setIsLoading(true);
      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `[skip:${currentParam}]`, previousParams, uncertainParams: Array.from(uncertainParams) }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.userValues) { setPreviousParams(data.userValues); setCollectedParams(data.userValues); }
          if (data.missingParams) setCurrentMissingParams(data.missingParams);
          setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
          // If no more missing params → go to confirmation
          if (data.missingParams && data.missingParams.length === 0) {
            setCollectedParams(data.userValues);
            setPhase('confirming');
          }
        })
        .catch(() => {
          setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    // Escape: Kurang yakin → mark uncertain, allow free text
    if (value === '__ESCAPE_KURANG_YAKIN__') {
      if (currentParam) setUncertainParams((prev) => new Set(prev).add(currentParam));
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'user', content: `Saya kurang yakin soal ${currentParam || 'parameter ini'}.` },
        { id: nextMsgId(), role: 'assistant', content: `Tidak masalah! Silakan ketik perkiraan ${currentParam || 'nilai'} Anda. Saya akan menggunakan rentang yang lebih fleksibel (±15%).` },
      ]);
      return;
    }

    // Normal quick reply → send to API
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: value }]);
    setIsLoading(true);

    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: value, previousParams, uncertainParams: Array.from(uncertainParams) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.userValues) { setPreviousParams(data.userValues); setCollectedParams(data.userValues); }
        if (data.missingParams) setCurrentMissingParams(data.missingParams);
        setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
        // If no more missing params → go to confirmation
        if (data.missingParams && data.missingParams.length === 0) {
          setCollectedParams(data.userValues);
          setPhase('confirming');
        }
      })
      .catch(() => {
        setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
      })
      .finally(() => setIsLoading(false));
  };

  // ─── Free text submit (only works during 'collecting' when user types manually, e.g. after "Kurang yakin") ───
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue('');
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: trimmed }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, previousParams, uncertainParams: Array.from(uncertainParams) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses');
      if (data.userValues) { setPreviousParams(data.userValues); setCollectedParams(data.userValues); }
      if (data.missingParams) setCurrentMissingParams(data.missingParams);
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
      if (data.missingParams && data.missingParams.length === 0) {
        setCollectedParams(data.userValues);
        setPhase('confirming');
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: `Maaf: ${error instanceof Error ? error.message : 'Unknown'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Confirmation: Hitung ───
  const handleHitung = () => {
    if (collectedParams) {
      setPhase('collecting'); // temporarily set so input stays disabled
      proceedWithCalculation(collectedParams);
    }
  };

  // ─── Confirmation: Ulangi ───
  const handleUlangi = () => {
    setCollectedParams(null);
    setPreviousParams(undefined);
    setCurrentMissingParams([...PARAM_ORDER]);
    setPhase('collecting');
    setMessages((prev) => [...prev, {
      id: nextMsgId(),
      role: 'assistant',
      content: 'Baik, mari kita ulangi. Silakan jawab pertanyaan berikut.',
    }]);
  };

  // ─── Preference submit ───
  const handlePreferenceSubmit = () => {
    if (collectedParams) proceedWithCalculation(collectedParams, selectedPreferences);
  };

  const handleTogglePreference = (criterionId: string) => {
    setSelectedPreferences((prev) => prev.includes(criterionId) ? prev.filter((id) => id !== criterionId) : [...prev, criterionId]);
  };

  const handleQuickReplyKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickReply(value); }
  };

  const quickReplies = getQuickReplies(currentMissingParams);
  const currentParam = currentMissingParams[0] || '';
  const currentTooltip = currentParam ? TOOLTIPS[currentParam] : undefined;

  // ═══════════════════════════════════════════════════════════════
  // ─── RENDER ───
  // ═══════════════════════════════════════════════════════════════

  const chatContent = (
    <>
      {/* ── Header ── */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]">
              <Bot className="text-black w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border-2 border-[#0b0f10]"></span>
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide text-sm font-heading">Agri-SAW Advisor</h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block leading-none mt-0.5">Online</span>
          </div>
        </div>
        {!fullPage && (
          <div className="flex items-center gap-1">
            <button className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5" aria-label="Opsi lainnya"><MoreVertical className="w-5 h-5" /></button>
            <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5" aria-label="Tutup percakapan"><X className="w-5 h-5" /></button>
          </div>
        )}
      </div>

      {/* ── Progress bar (only during collecting/confirming/preference) ── */}
      {(phase === 'collecting' || phase === 'confirming' || phase === 'preference') && collectedParams && (
        <div className="shrink-0 border-b border-white/10 bg-black/40">
          <div className="px-3 sm:px-4 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-bold text-emerald-400" aria-live="polite">
                {PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length}/{PARAM_ORDER.length} terisi
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
                role="progressbar"
                aria-valuenow={PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length}
                aria-valuemin={0} aria-valuemax={PARAM_ORDER.length}
                style={{ width: `${(PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length / PARAM_ORDER.length) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {PARAM_ORDER.map((key) => {
                const param = PARAM_LABELS[key];
                const value = collectedParams?.[key];
                const isCollected = value != null && value !== '';
                return (
                  <span key={key} className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border font-medium transition-all ${isCollected ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/30'}`}>
                    {param.emoji} {isCollected ? '✓' : '○'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat History ── */}
      <div className="flex-grow p-3 sm:p-4 overflow-y-auto flex flex-col gap-4 bg-black/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="log" aria-label="Percakapan rekomendasi tanaman" aria-live="polite" aria-relevant="additions">

        {messages.map((msg) => (
          <div key={msg.id} role="article" className={`flex gap-2 sm:gap-2.5 max-w-[92%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
                <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              </div>
            )}
            <div className={`rounded-2xl rounded-tl-sm p-2.5 sm:p-3 border shadow-lg ${msg.role === 'assistant' ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-emerald-400/10 backdrop-blur-md border-emerald-400/30'}`}>
              <p className={`whitespace-pre-line text-sm leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200' : 'text-emerald-50'}`}>{msg.content}</p>
            </div>
          </div>
        ))}

        {/* ── Loading indicator ── */}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[90%]" role="status" aria-label="Sedang menganalisis">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-3 border border-white/10 shadow-lg">
              <p className="text-slate-200 text-sm">Sedang menganalisis kondisi lahan...</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── WELPHASE: Form Card ── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === 'welcome' && !isLoading && (
          <div className="flex gap-2.5 max-w-[92%]">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-4 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
              <div className="space-y-3">
                <div>
                  <label htmlFor="form-nama" className="block text-xs text-white/60 mb-1 font-medium">Nama <span className="text-red-400">*</span></label>
                  <input id="form-nama" type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="form-email" className="block text-xs text-white/60 mb-1 font-medium">Email <span className="text-white/30">(opsional)</span></label>
                  <input id="form-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="form-lokasi" className="block text-xs text-white/60 mb-1 font-medium">Lokasi <span className="text-white/30">(opsional)</span></label>
                  <input id="form-lokasi" type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Kota/Kabupaten"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all"
                  />
                </div>
                <button onClick={handleFormSubmit}
                  disabled={!formName.trim()}
                  className="w-full text-sm px-4 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Mulai konsultasi">
                  🚀 Mulai Konsultasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── CONFIRMATION: Data recap + Hitung/Ulangi ── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === 'confirming' && collectedParams && !isLoading && (
          <div className="flex gap-2.5 max-w-[92%]" role="form" aria-label="Konfirmasi data lahan">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-3 sm:p-4 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
              <p className="text-slate-200 text-sm font-semibold mb-3">📋 Konfirmasi Data Lahan</p>
              <div className="space-y-1.5 sm:space-y-2 mb-4">
                {PARAM_ORDER.map((key) => {
                  const val = collectedParams[key];
                  if (val === null || val === undefined) return null;
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
              <div className="flex gap-2">
                <button onClick={handleHitung} className="flex-1 text-sm px-3 sm:px-4 py-2.5 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer" aria-label="Hitung rekomendasi">
                  ✅ Hitung Rekomendasi
                </button>
                <button onClick={handleUlangi} className="flex-1 text-sm px-3 sm:px-4 py-2.5 rounded-lg border border-white/20 bg-white/5 text-slate-200 font-medium hover:bg-white/10 transition-all cursor-pointer" aria-label="Ulangi dari awal">
                  ✏️ Ulangi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── PREFERENCE: Weight selection ── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === 'preference' && showPreferences && !isLoading && (
          <div className="flex gap-2.5 max-w-[92%]" role="form" aria-label="Pilih preferensi bobot">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1">
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-3 sm:p-4 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
              <p className="text-slate-200 text-sm font-semibold mb-1">⚖️ Preferensi Bobot</p>
              <p className="text-white/50 text-xs mb-3">Pilih satu atau lebih kriteria yang paling penting bagi Anda.</p>
              <div className="space-y-2 mb-4">
                {PREFERENCE_OPTIONS.map((opt) => {
                  const isSelected = selectedPreferences.includes(opt.criterionId);
                  return (
                    <button key={opt.id} onClick={() => handleTogglePreference(opt.criterionId)} role="checkbox" aria-checked={isSelected} aria-label={opt.label}
                      className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                      <span className="mr-2">{isSelected ? '✅' : '⬜'}</span>{opt.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={handlePreferenceSubmit} className="w-full text-sm px-4 py-2.5 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer" aria-label="Hitung ranking">
                🚀 Hitung Ranking
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── QUICK REPLIES: Bot-lead parameter questions ── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === 'collecting' && !isLoading && quickReplies.length > 0 && (
          <div className="pl-8 sm:pl-9 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-medium">Mengapa ditanya <span className="text-emerald-400/70">{currentParam}</span>?</span>
              {currentTooltip && (
                <button onClick={() => setActiveTooltip((prev) => prev === currentParam ? null : currentParam)}
                  className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center transition-all cursor-pointer ${activeTooltip === currentParam ? 'bg-emerald-400/30 border-emerald-400/60 text-emerald-300' : 'bg-white/5 border-white/20 text-white/40 hover:bg-emerald-400/10'}`}
                  aria-label={`Penjelasan tentang ${currentParam}`} aria-expanded={activeTooltip === currentParam}>
                  ⓘ
                </button>
              )}
            </div>
            {activeTooltip === currentParam && currentTooltip && (
              <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed" role="note">{currentTooltip}</div>
            )}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2" role="group" aria-label="Pilihan jawaban cepat">
              {quickReplies.map((qr) => (
                <button key={qr.value} onClick={() => handleQuickReply(qr.value)} onKeyDown={(e) => handleQuickReplyKeyDown(e, qr.value)}
                  tabIndex={0} role="button" aria-label={qr.label} disabled={isLoading}
                  className={`text-xs px-3 py-2.5 rounded-full border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400/50 min-h-[44px] ${qr.value.startsWith('__ESCAPE') ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'}`}>
                  {qr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Input Area (disabled during bot-lead phases) ── */}
      <div className="p-2.5 sm:p-3 border-t border-white/10 bg-black/60 shrink-0">
        {isInputDisabled ? (
          <div className="text-center py-2">
            <span className="text-xs text-white/30">
              {phase === 'welcome' && 'Silakan isi form di atas untuk memulai'}
              {phase === 'collecting' && 'Pilih jawaban di atas'}
              {phase === 'confirming' && 'Klik tombol "Hitung Rekomendasi" atau "Ulangi"'}
              {phase === 'preference' && 'Pilih preferensi dan klik "Hitung Ranking"'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="relative flex items-center mb-1.5" aria-label="Formulir pesan">
            <input className="w-full bg-[#0b0f10] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all font-body shadow-inner"
              placeholder="Ketik pesan..." type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading} aria-label="Ketik pesan"
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}
              className="absolute right-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(74,222,128,0.4)] disabled:opacity-50"
              aria-label="Kirim pesan">
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        )}
        <div className="text-center">
          <span className="text-[9px] text-white/30 tracking-wide font-medium">
            AI dapat membuat kesalahan. Verifikasi hasil dengan ahli pertanian.
          </span>
        </div>
      </div>
    </>
  );

  // ─── Full page: mobile = edge-to-edge, desktop = centered card ───
  if (fullPage) {
    return (
      <div className="fixed top-20 left-0 right-0 bottom-0 z-30">
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#0b0f10]" role="region" aria-label="Agri-SAW Chat">
          {chatContent}
        </div>
      </div>
    );
  }

  // ─── Floating widget: mobile = full screen, desktop = popup ───
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col items-end" role="region" aria-label="Widget percakapan Agri-SAW">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.5)] border-2 border-[#0b0f10] hover:scale-105 active:scale-95"
          aria-label="Buka percakapan rekomendasi tanaman" aria-expanded={isOpen}>
          <Bot className="w-7 h-7" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b0f10]"></span>
        </button>
      )}
      {isOpen && (
        <div className="fixed inset-0 md:static md:w-[380px] md:max-w-[calc(100vw-2rem)] md:h-[550px] md:max-h-[calc(100vh-6rem)] glass-plate rounded-none md:rounded-2xl flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-emerald-400/30 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
          role="region" aria-label="Percakapan Agri-SAW">
          {chatContent}
        </div>
      )}
    </div>
  );
}
