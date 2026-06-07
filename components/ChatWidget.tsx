'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Paperclip, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isQuickReply?: boolean;
}

interface QuickReply {
  label: string;
  value: string;
}

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
  'ketinggian':
    'Ketinggian menentukan suhu udara dan tekanan atmosfer, yang sangat memengaruhi jenis tanaman yang bisa tumbuh.',
  'curah hujan':
    'Curah hujan menentukan ketersediaan air untuk tanaman. Terlalu banyak atau terlalu sedikit bisa merusak tanaman.',
  'pH tanah':
    'pH tanah menentukan nutrisi yang tersedia bagi tanaman. Tanah terlalu asam atau basah bisa menghambat pertumbuhan.',
  'tekstur tanah':
    'Tekstur tanah menentukan drainase dan kemampuan menahan air. Berbeda tekstur, berbeda jenis tanaman yang cocok.',
  'intensitas cahaya':
    'Cahaya matahari dibutuhkan untuk fotosintesis. Kebutuhan cahaya berbeda untuk setiap jenis tanaman.',
};

const PARAM_LABELS: Record<string, { label: string; emoji: string; format: (v: unknown) => string }> = {
  elevation:     { label: 'Ketinggian',        emoji: '📍', format: (v) => `${v} mdpl` },
  rainfall:      { label: 'Curah hujan',       emoji: '🌧️', format: (v) => `${v} mm/tahun` },
  pH:            { label: 'pH tanah',          emoji: '🔬', format: (v) => `pH ${v}` },
  texture:       { label: 'Tekstur tanah',     emoji: '🤲', format: (v) => `${v}` },
  light:         { label: 'Intensitas cahaya', emoji: '☀️', format: (v) => `${v} jam/hari` },
};
const PARAM_ORDER: string[] = ['elevation', 'rainfall', 'pH', 'texture', 'light'];
// ─── Preference options for dynamic weight adjustment ───
interface PreferenceOption {
  id: string;
  label: string;
  criterionId: string;
}
const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: 'pref_biaya',       label: '💰 Biaya produksi rendah',  criterionId: 'biaya_produksi' },
  { id: 'pref_harga',       label: '📈 Harga jual tinggi',      criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: '🌾 Produktivitas tinggi', criterionId: 'produktivitas' },
  { id: 'pref_risiko',      label: '🛡️ Risiko rendah',         criterionId: 'risiko' },
  { id: 'pref_permintaan',  label: '📊 Permintaan pasar tinggi', criterionId: 'permintaan' },
];
function getQuickReplies(missingParams: string[]): QuickReply[] {
  if (missingParams.length === 0) return [];
  const top = missingParams[0];
  return QUICK_REPLIES[top] || [];
}

export default function ChatWidget({ fullPage = false }: { fullPage?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content:
        'Halo! Saya AgriLens Advisor 🌾\n\nSaya akan membantu merekomendasikan komoditas pertanian terbaik berdasarkan kondisi lahan Anda.\n\nSilakan ceritakan kondisi lahan Anda, misalnya:\n• Ketinggian lahan\n• Jenis dan tekstur tanah\n• Curah hujan di wilayah Anda\n• Intensitas cahaya matahari\n\nAtau ketik langsung: *"lahan saya di dataran rendah 200mdpl, tanah liat, hujan sering"*',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previousParams, setPreviousParams] = useState<Record<string, unknown> | undefined>(undefined);
  const [currentMissingParams, setCurrentMissingParams] = useState<string[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [collectedParams, setCollectedParams] = useState<Record<string, unknown> | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [uncertainParams, setUncertainParams] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickReplyRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const msgIdCounter = useRef(0);
  const nextMsgId = () => {
    msgIdCounter.current += 1;
    return `msg-${msgIdCounter.current}`;
  };

  // ─── Proceed with API call (used by confirmation "Hitung Rekomendasi") ───
  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setIsLoading(true);
    setShowConfirmation(false);
    setShowPreferences(false);
    try {
      const body: Record<string, unknown> = {
        message: 'Hitung rekomendasi',
        previousParams: params,
      };
      if (preferences && preferences.length > 0) {
        body.preferences = preferences;
      }
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses rekomendasi');
      }
      if (data.userValues) {
        setPreviousParams(data.userValues);
      }
      if (data.missingParams) {
        setCurrentMissingParams(data.missingParams);
      }
      // If we haven't collected preferences yet, show preference question
      if (!preferences && data.surviving && data.surviving.length > 0) {
        setCollectedParams(params);
        setShowPreferences(true);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMsgId(),
            role: 'assistant',
            content:
              `✅ **Filter 1 Selesai!** ${data.surviving.length} komoditas lolos: ${data.surviving.map((s: { name: string }) => s.name).join(', ')}` +
              '\n\nSebelum menghitung ranking akhir, apa yang paling penting untuk Anda?\n(Pilih satu atau lebih)',
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'assistant', content: data.message },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMsgId(),
          role: 'assistant',
          content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setCollectedParams(null);
    }
  };

  // Core send logic shared by form submit and quick replies
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: trimmed }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          previousParams,
          uncertainParams: Array.from(uncertainParams),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses rekomendasi');
      }

      if (data.userValues) {
        setPreviousParams(data.userValues);
        setCollectedParams(data.userValues);
      }

      if (data.missingParams) {
        setCurrentMissingParams(data.missingParams);
      }

      // Check if all critical params are collected (missingParams is empty)
      // and we're still in follow-up mode → show confirmation instead of result
      if (
        data.missingParams &&
        data.missingParams.length === 0 &&
        data.mode === 'follow-up'
      ) {
        setCollectedParams(data.userValues);
        setShowConfirmation(true);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMsgId(),
            role: 'assistant',
            content:
              'Semua parameter terkumpul! Silakan periksa data Anda sebelum menghitung rekomendasi.',
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'assistant', content: data.message },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMsgId(),
          role: 'assistant',
          content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputValue);
  };

  const handleQuickReply = (value: string) => {
    if (isLoading) return;
    const currentParam = currentMissingParams[0];
    // Escape hatch: Tidak tahu → skip this parameter
    if (value === '__ESCAPE_TIDAK_TAHU__') {
      const skipMessage = `Saya tidak tahu ${currentParam || 'parameter ini'}.`;
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'user', content: skipMessage },
      ]);
      const remaining = currentMissingParams.slice(1);
      setCurrentMissingParams(remaining);
      setIsLoading(true);
      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[skip:${currentParam}]`,
          previousParams,
          uncertainParams: Array.from(uncertainParams),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.userValues) setPreviousParams(data.userValues);
          if (data.missingParams) setCurrentMissingParams(data.missingParams);
          setMessages((prev) => [
            ...prev,
            { id: nextMsgId(), role: 'assistant', content: data.message },
          ]);
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: nextMsgId(),
              role: 'assistant',
              content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
            },
          ]);
        })
        .finally(() => setIsLoading(false));
      return;
    }
    // Escape hatch: Kurang yakin → mark param as uncertain, ask for approximate value
    if (value === '__ESCAPE_KURANG_YAKIN__') {
      if (currentParam) {
        setUncertainParams((prev) => new Set(prev).add(currentParam));
      }
      const uncertainMessage = `Saya kurang yakin soal ${currentParam || 'parameter ini'}, tapi saya akan coba jawab.`;
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: 'user', content: uncertainMessage },
      ]);
      setMessages((prev) => [
        ...prev,
        {
          id: nextMsgId(),
          role: 'assistant',
          content: `Tidak masalah! Silakan berikan perkiraan ${currentParam || 'nilai'} Anda. Saya akan menggunakan rentang yang lebih fleksibel (±15%) dalam perhitungan.`,
        },
      ]);
      return;
    }
    // Normal quick reply → send message
    setInputValue(value);
    sendMessage(value);
  };

  // Keyboard handler for Enter/Space on quick reply buttons
  const handleQuickReplyKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleQuickReply(value);
    }
  };

  // Escape key closes floating widget
  useEffect(() => {
    if (!isOpen || fullPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fullPage]);

  const handleConfirmCalculation = () => {
    if (collectedParams) {
      proceedWithCalculation(collectedParams);
    }
  };

  const handleChangeAnswers = () => {
    setShowConfirmation(false);
    setCollectedParams(null);
    // Reset to ask questions again — clear previous params so user can re-enter
    setPreviousParams(undefined);
    setCurrentMissingParams([]);
    setMessages((prev) => [
      ...prev,
      {
        id: nextMsgId(),
        role: 'assistant',
        content:
          'Baik, mari kita ulangi. Silakan ceritakan kondisi lahan Anda dari awal.\n\nMisalnya:\n• Ketinggian lahan\n• Jenis dan tekstur tanah\n• Curah hujan di wilayah Anda\n• Intensitas cahaya matahari',
      },
    ]);
  };
  // ─── Preference handlers ───
  const handleTogglePreference = (criterionId: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(criterionId)
        ? prev.filter((id) => id !== criterionId)
        : [...prev, criterionId]
    );
  };
  const handlePreferenceSubmit = () => {
    if (collectedParams) {
      proceedWithCalculation(collectedParams, selectedPreferences);
    }
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickReplies = getQuickReplies(currentMissingParams);
  const currentParam = currentMissingParams[0] || '';
  const currentTooltip = currentParam ? TOOLTIPS[currentParam] : undefined;


  // ─── Shared chat content ───
  const chatContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0" role="banner">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]">
              <Bot className="text-black w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b0f10] shadow-[0_0_10px_rgba(74,222,128,1)]"></span>
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide text-sm font-heading">AgriLens Advisor</h3>
            <span className="text-[10px] font-bold text-emerald-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)] uppercase tracking-widest block leading-none mt-1">Online</span>
          </div>
        </div>
        {!fullPage && (
          <div className="flex items-center gap-1">
            <button className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5" aria-label="Opsi lainnya" title="Opsi lainnya">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Tutup percakapan"
              title="Tutup percakapan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Progressive Parameter Summary */}
      <div className="shrink-0 border-b border-white/10 bg-black/40" role="region" aria-label="Progress parameter lahan">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <span id="progress-label" className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Progress Parameter</span>
            <span className="text-[10px] font-bold text-emerald-400" aria-live="polite">
              {collectedParams
                ? `${PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length}/${PARAM_ORDER.length} parameter terisi`
                : '0/5 parameter terisi'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
              role="progressbar"
              aria-valuenow={collectedParams ? PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length : 0}
              aria-valuemin={0}
              aria-valuemax={PARAM_ORDER.length}
              aria-labelledby="progress-label"
              style={{
                width: `${collectedParams
                  ? (PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length / PARAM_ORDER.length) * 100
                  : 0}%`,
              }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PARAM_ORDER.map((key) => {
              const param = PARAM_LABELS[key];
              const value = collectedParams?.[key];
              const isCollected = value != null && value !== '';
              return (
                <span
                  key={key}
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all ${
                    isCollected
                      ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/30'
                  }`}
                >
                  {param.emoji} {param.label}:{' '}
                  {isCollected ? (
                    <span className="font-bold">{param.format(value)} ✅</span>
                  ) : (
                    <span>belum diisi ⬜</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>


      {/* Chat History */}
      <div
        className="flex-grow p-4 overflow-y-auto flex flex-col gap-5 bg-black/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="log"
        aria-label="Percakapan rekomendasi tanaman"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            role="article"
            aria-label={`${msg.role === 'user' ? 'Pesan Anda' : 'Balasan AgriLens'}: ${msg.content.substring(0, 120)}${msg.content.length > 120 ? '…' : ''}`}
            className={`flex gap-2.5 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)] mt-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            )}
            <div
              className={`rounded-2xl rounded-tl-sm p-3 border shadow-lg ${
                msg.role === 'assistant'
                  ? 'bg-white/10 backdrop-blur-md border-white/10'
                  : 'bg-emerald-400/10 backdrop-blur-md border-emerald-400/30'
              }`}
            >
              <p className={`whitespace-pre-line text-sm leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200' : 'text-emerald-50'}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 max-w-[90%]" role="status" aria-label="Sedang menganalisis kondisi lahan">
            <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)] mt-1">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-3 border border-white/10 shadow-lg">
              <p className="text-slate-200 text-sm leading-relaxed">Sedang menganalisis kondisi lahan...</p>
            </div>
          </div>
        )}

        {/* Confirmation Screen */}
        {showConfirmation && collectedParams && !isLoading && (
          <div className="flex gap-2.5 max-w-[90%]" role="form" aria-label="Konfirmasi data lahan">
            <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)] mt-1">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-4 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full" role="group" aria-label="Detail data lahan">
              <p className="text-slate-200 text-sm font-semibold mb-3">📋 Konfirmasi Data Lahan</p>
              <div className="space-y-2 mb-4">
                {PARAM_ORDER.map((key) => {
                  const val = collectedParams[key];
                  if (val === null || val === undefined) return null;
                  const meta = PARAM_LABELS[key];
                  if (!meta) return null;
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm" role="listitem" aria-label={`${meta.label}: ${meta.format(val)}`}>
                      <span className="text-base">{meta.emoji}</span>
                      <span className="text-white/60">{meta.label}:</span>
                      <span className="text-emerald-300 font-medium">{meta.format(val)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmCalculation}
                  className="flex-1 text-sm px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(74,222,128,0.4)] cursor-pointer"
                  aria-label="Hitung rekomendasi berdasarkan data lahan"
                >
                  ✅ Hitung Rekomendasi
                </button>
                <button
                  onClick={handleChangeAnswers}
                  className="flex-1 text-sm px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-slate-200 font-medium hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer"
                  aria-label="Ubah jawaban dan ulangi dari awal"
                >
                  ✏️ Ubah Jawaban
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Preference Selection Screen */}
        {showPreferences && !isLoading && (
          <div className="flex gap-2.5 max-w-[90%]" role="form" aria-label="Pilih preferensi bobot">
            <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)] mt-1">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-4 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full" role="group" aria-label="Opsi preferensi kriteria">
              <p className="text-slate-200 text-sm font-semibold mb-1">⚖️ Preferensi Bobot</p>
              <p className="text-white/50 text-xs mb-3">Pilih satu atau lebih kriteria yang paling penting bagi Anda. Bobot SAW akan disesuaikan.</p>
              <div className="space-y-2 mb-4">
                {PREFERENCE_OPTIONS.map((opt) => {
                  const isSelected = selectedPreferences.includes(opt.criterionId);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleTogglePreference(opt.criterionId)}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={opt.label}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="mr-2">{isSelected ? '✅' : '⬜'}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handlePreferenceSubmit}
                className="w-full text-sm px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(74,222,128,0.4)] cursor-pointer"
                aria-label="Hitung ranking dengan preferensi yang dipilih"
              >
                🚀 Hitung Ranking dengan Preferensi
              </button>
            </div>
          </div>
        )}
        {/* Quick Reply Buttons */}
        {!isLoading && !showConfirmation && !showPreferences && quickReplies.length > 0 && (
          <div className="pl-9 space-y-2">
            {/* Question header with ⓘ button */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-medium">
                Mengapa ditanya{' '}
                <span className="text-emerald-400/70">{currentParam}</span>?
              </span>
              {currentTooltip && (
                <button
                  onClick={() =>
                    setActiveTooltip((prev) =>
                      prev === currentParam ? null : currentParam,
                    )
                  }
                  className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center transition-all cursor-pointer ${
                    activeTooltip === currentParam
                      ? 'bg-emerald-400/30 border-emerald-400/60 text-emerald-300'
                      : 'bg-white/5 border-white/20 text-white/40 hover:bg-emerald-400/10 hover:border-emerald-400/30 hover:text-emerald-400/70'
                  }`}
                  aria-label={`Penjelasan tentang ${currentParam}`}
                  aria-expanded={activeTooltip === currentParam}
                >
                  ⓘ
                </button>
              )}
            </div>

            {/* Expandable tooltip explanation */}
            {activeTooltip === currentParam && currentTooltip && (
              <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed" role="note">
                {currentTooltip}
              </div>
            )}

            {/* Quick reply buttons */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Pilihan jawaban cepat">
              {quickReplies.map((qr, i) => (
                <button
                  key={qr.value}
                  onClick={() => handleQuickReply(qr.value)}
                  onKeyDown={(e) => handleQuickReplyKeyDown(e, qr.value)}
                  ref={(el) => { quickReplyRefs.current[i] = el; }}
                  tabIndex={0}
                  role="button"
                  aria-label={qr.label}
                  disabled={isLoading}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${
                    qr.value.startsWith('__ESCAPE')
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/50'
                      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 hover:border-emerald-400/50'
                  }`}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          </div>
        )}


        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-black/60 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center mb-2" aria-label="Formulir pesan">
          <input
            className="w-full bg-[#0b0f10] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all font-body shadow-inner"
            placeholder="Masukkan kondisi lingkungan..."
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || showPreferences || showConfirmation}
            aria-label="Ketik pesan atau pilih opsi"
            aria-describedby="chat-input-hint"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || showPreferences || showConfirmation}
            className="absolute right-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(74,222,128,0.4)] disabled:opacity-50"
            aria-label="Kirim pesan"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>
        <div className="text-center">
          <span id="chat-input-hint" className="text-[9px] text-white/30 tracking-wide font-medium">
            AgriLens AI can make mistakes. Consider verifying critical data.
          </span>
        </div>
      </div>
    </>
  );

  // Full page mode
  if (fullPage) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full h-[700px] glass-plate rounded-2xl flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-emerald-400/30 overflow-hidden" role="region" aria-label="AgriLens Chat">
          {chatContent}
        </div>
      </div>
    );
  }

  // Floating widget mode
  return (
    <div
      className="!fixed !bottom-4 !right-4 md:!bottom-6 md:!right-6 !z-[9999] flex flex-col items-end"
      style={{ position: 'fixed' }}
      role="region"
      aria-label="Widget percakapan AgriLens"
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.5)] border-2 border-[#0b0f10] hover:scale-105 active:scale-95"
          aria-label="Buka percakapan rekomendasi tanaman"
          aria-expanded={isOpen}
          title="Buka percakapan rekomendasi tanaman"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b0f10]"></span>
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-6rem)] glass-plate rounded-2xl flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-emerald-400/30 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 origin-bottom-right" role="region" aria-label="Percakapan AgriLens — Tekan Escape untuk menutup">
          {chatContent}
        </div>
      )}
    </div>
  );
}
