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

type FlowPhase = 'welcome' | 'collecting' | 'confirming' | 'preference' | 'done';

const QUICK_REPLIES: Record<string, QuickReply[]> = {
  'ketinggian': [
    { label: 'Dataran rendah (0-400 mdpl)', value: 'lahan saya di dataran rendah 200 mdpl' },
    { label: 'Dataran sedang (400-700 mdpl)', value: 'lahan saya di dataran sedang 500 mdpl' },
    { label: 'Pegunungan (700+ mdpl)', value: 'lahan saya di pegunungan 900 mdpl' },
    { label: 'Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'curah hujan': [
    { label: 'Hampir tiap hari', value: 'hujan hampir tiap hari' },
    { label: 'Sering (5x/minggu)', value: 'hujan sering' },
    { label: 'Cukup (3-4x/minggu)', value: 'curah hujan cukup' },
    { label: 'Jarang (1-2x/minggu)', value: 'hujan jarang' },
    { label: 'Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'pH tanah': [
    { label: 'Tanaman sering menguning/kerdil', value: 'tanah asam tanaman sering menguning' },
    { label: 'Tumbuh biasa saja', value: 'tanah netral tumbuh biasa' },
    { label: 'Hijau dan subur', value: 'tanah subur hijau' },
    { label: 'Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'tekstur tanah': [
    { label: 'Lengket/liat saat basah', value: 'tanah liat lengket' },
    { label: 'Gembur/lempung', value: 'tanah gembur lempung' },
    { label: 'Kasar/berpasir', value: 'tanah berpasir kasar' },
    { label: 'Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'intensitas cahaya': [
    { label: 'Teduh (6-8 jam)', value: 'cahaya teduh 7 jam' },
    { label: 'Sedang (8-10 jam)', value: 'cahaya 9 jam' },
    { label: 'Penuh (12+ jam)', value: 'cahaya penuh 12 jam' },
    { label: 'Tidak tahu', value: '__ESCAPE_TIDAK_TAHU__' },
    { label: 'Kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
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
  { id: 'pref_biaya',         label: 'Biaya produksi rendah',   criterionId: 'biaya_produksi' },
  { id: 'pref_harga',         label: 'Harga jual tinggi',       criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: 'Produktivitas tinggi',  criterionId: 'produktivitas' },
  { id: 'pref_risiko',        label: 'Risiko rendah',          criterionId: 'risiko' },
  { id: 'pref_permintaan',    label: 'Permintaan pasar tinggi', criterionId: 'permintaan' },
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
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'laki' | 'perempuan' | ''>('');
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

  const isInputDisabled = phase === 'welcome' || phase === 'collecting' || phase === 'confirming' || phase === 'preference';

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: nextMsgId(),
        role: 'assistant',
        content: 'Halo! Selamat datang di Agri-SAW Pro\n\nSaya akan membantu merekomendasikan komoditas pertanian terbaik berdasarkan kondisi lahan Anda.\n\nSebelum mulai, silakan isi data diri Anda:',
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!isOpen || fullPage) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fullPage]);

  const handleFormSubmit = () => {
    const name = formName.trim() || 'Petani';
    setUserName(name);
    const details: string[] = [`Nama: ${name}`];
    if (formGender === 'laki') details.push('Sapaan: Bapak');
    else if (formGender === 'perempuan') details.push('Sapaan: Ibu');
    const greeting = formGender === 'perempuan' ? `Terima kasih, Ibu ${name}!` : `Terima kasih, Bapak ${name}!`;
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', content: details.join('\n') },
      { id: nextMsgId(), role: 'assistant', content: `${greeting}\n\nSekarang saya akan menanyakan kondisi lahan Anda. Silakan pilih jawaban di bawah ini.\n\nParameter: Ketinggian, Curah hujan, pH tanah, Tekstur tanah, Intensitas cahaya` },
    ]);
    setPhase('collecting');
    setCurrentMissingParams([...PARAM_ORDER]);
  };

  const proceedWithCalculation = async (params: Record<string, unknown>, preferences?: string[]) => {
    setIsLoading(true);
    setShowPreferences(false);
    try {
      const body: Record<string, unknown> = { message: 'Hitung rekomendasi', previousParams: params };
      if (preferences && preferences.length > 0) body.preferences = preferences;
      const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses rekomendasi');
      if (data.userValues) setPreviousParams(data.userValues);
      if (data.missingParams) setCurrentMissingParams(data.missingParams);
      if (!preferences && data.surviving && data.surviving.length > 0) {
        setCollectedParams(params);
        setShowPreferences(true);
        setPhase('preference');
        const sapaan = formGender === 'perempuan' ? 'Ibu' : 'Bapak';
        setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: `Filter 1 Selesai, ${sapaan} ${userName}!\n\n${data.surviving.length} komoditas lolos: ${data.surviving.map((s: { name: string }) => s.name).join(', ')}\n\nSebelum menghitung ranking akhir, apa yang paling penting untuk Anda?\n(Pilih satu atau lebih)` }]);
        return;
      }
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
      setPhase('done');
    } catch (error) {
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
    } finally {
      setIsLoading(false);
      setCollectedParams(null);
    }
  };

  const handleQuickReply = (value: string) => {
    if (isLoading) return;
    const currentParam = currentMissingParams[0];

    if (value === '__ESCAPE_TIDAK_TAHU__') {
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: `Saya tidak tahu ${currentParam || 'parameter ini'}.` }]);
      const remaining = currentMissingParams.slice(1);
      setCurrentMissingParams(remaining);
      setIsLoading(true);
      fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `[skip:${currentParam}]`, previousParams, uncertainParams: Array.from(uncertainParams) }) })
        .then((res) => res.json())
        .then((data) => {
          if (data.userValues) { setPreviousParams(data.userValues); setCollectedParams(data.userValues); }
          if (data.missingParams) setCurrentMissingParams(data.missingParams);
          setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
          if (data.missingParams && data.missingParams.length === 0) { setCollectedParams(data.userValues); setPhase('confirming'); }
        })
        .catch(() => { setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]); })
        .finally(() => setIsLoading(false));
      return;
    }

    if (value === '__ESCAPE_KURANG_YAKIN__') {
      if (currentParam) setUncertainParams((prev) => new Set(prev).add(currentParam));
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: `Saya kurang yakin soal ${currentParam || 'parameter ini'}.` }, { id: nextMsgId(), role: 'assistant', content: `Tidak masalah! Silakan ketik perkiraan ${currentParam || 'nilai'} Anda. Saya akan menggunakan rentang yang lebih fleksibel.` }]);
      return;
    }

    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: value }]);
    setIsLoading(true);
    fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: value, previousParams, uncertainParams: Array.from(uncertainParams) }) })
      .then((res) => res.json())
      .then((data) => {
        if (data.userValues) { setPreviousParams(data.userValues); setCollectedParams(data.userValues); }
        if (data.missingParams) setCurrentMissingParams(data.missingParams);
        setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
        if (data.missingParams && data.missingParams.length === 0) { setCollectedParams(data.userValues); setPhase('confirming'); }
      })
      .catch(() => { setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]); })
      .finally(() => setIsLoading(false));
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue('');
    setMessages((prev) => [...prev, { id: nextMsgId(), role: 'user', content: trimmed }]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: trimmed, previousParams, uncertainParams: Array.from(uncertainParams) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses');
      if (data.userValues) { setPreviousParams(data.userValues); setCollectedParams(data.userValues); }
      if (data.missingParams) setCurrentMissingParams(data.missingParams);
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: data.message }]);
      if (data.missingParams && data.missingParams.length === 0) { setCollectedParams(data.userValues); setPhase('confirming'); }
    } catch (error) {
      setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: `Maaf: ${error instanceof Error ? error.message : 'Unknown'}` }]);
    } finally { setIsLoading(false); }
  };

  const handleHitung = () => { if (collectedParams) { setPhase('collecting'); proceedWithCalculation(collectedParams); } };
  const handleUlangi = () => { setCollectedParams(null); setPreviousParams(undefined); setCurrentMissingParams([...PARAM_ORDER]); setPhase('collecting'); setMessages((prev) => [...prev, { id: nextMsgId(), role: 'assistant', content: 'Baik, mari kita ulangi. Silakan jawab pertanyaan berikut.' }]); };
  const handlePreferenceSubmit = () => { if (collectedParams) proceedWithCalculation(collectedParams, selectedPreferences); };
  const handleTogglePreference = (criterionId: string) => { setSelectedPreferences((prev) => prev.includes(criterionId) ? prev.filter((id) => id !== criterionId) : [...prev, criterionId]); };
  const handleQuickReplyKeyDown = (e: React.KeyboardEvent, value: string) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickReply(value); } };

  const quickReplies = getQuickReplies(currentMissingParams);
  const currentParam = currentMissingParams[0] || '';
  const currentTooltip = currentParam ? TOOLTIPS[currentParam] : undefined;

  const chatContent = (
    <>
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center"><Bot className="text-black w-4 h-4" /></div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b0f10]"></span>
          </div>
          <div><h3 className="font-bold text-white text-sm font-heading">Agri-SAW Advisor</h3><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online</span></div>
        </div>
        {!fullPage && (<div className="flex items-center gap-1"><button className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5" aria-label="Opsi"><MoreVertical className="w-5 h-5" /></button><button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5" aria-label="Tutup"><X className="w-5 h-5" /></button></div>)}
      </div>

      {(phase === 'collecting' || phase === 'confirming' || phase === 'preference') && collectedParams && (
        <div className="shrink-0 border-b border-white/10 bg-black/40"><div className="px-3 py-2"><div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Progress</span><span className="text-[10px] font-bold text-emerald-400">{PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length}/{PARAM_ORDER.length} terisi</span></div><div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-1.5"><div className="h-full bg-emerald-400 rounded-full transition-all duration-500" role="progressbar" style={{ width: `${(PARAM_ORDER.filter((p) => collectedParams[p] != null && collectedParams[p] !== '').length / PARAM_ORDER.length) * 100}%` }} /></div><div className="flex flex-wrap gap-1">{PARAM_ORDER.map((key) => { const p = PARAM_LABELS[key]; const v = collectedParams?.[key]; const ok = v != null && v !== ''; return (<span key={key} className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${ok ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/30'}`}>{p.emoji} {ok ? '✓' : '○'}</span>); })}</div></div></div>
      )}

      <div className="flex-grow p-3 overflow-y-auto flex flex-col gap-3 bg-black/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" role="log" aria-label="Percakapan" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 max-w-[92%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (<div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1"><Bot className="w-3 h-3 text-emerald-400" /></div>)}
            <div className={`rounded-2xl rounded-tl-sm p-2.5 border shadow-lg ${msg.role === 'assistant' ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-emerald-400/10 backdrop-blur-md border-emerald-400/30'}`}><p className={`whitespace-pre-line text-sm leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200' : 'text-emerald-50'}`}>{msg.content}</p></div>
          </div>
        ))}
        {isLoading && (<div className="flex gap-2 max-w-[90%]" role="status"><div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1"><Bot className="w-3 h-3 text-emerald-400" /></div><div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-2.5 border border-white/10"><p className="text-slate-200 text-sm">Sedang menganalisis...</p></div></div>)}

        {phase === 'welcome' && !isLoading && (
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1"><Bot className="w-3 h-3 text-emerald-400" /></div>
            <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full"><div className="space-y-3">
              <div><label htmlFor="form-nama" className="block text-xs text-white/60 mb-1 font-medium">Nama <span className="text-red-400">*</span></label><input id="form-nama" type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Masukkan nama Anda" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-all" /></div>
              <div><label className="block text-xs text-white/60 mb-2 font-medium">Jenis Kelamin</label><div className="flex gap-2"><button type="button" onClick={() => setFormGender('laki')} className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${formGender === 'laki' ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>Laki-laki</button><button type="button" onClick={() => setFormGender('perempuan')} className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${formGender === 'perempuan' ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>Perempuan</button></div></div>
              <button onClick={handleFormSubmit} disabled={!formName.trim()} className="w-full text-sm px-4 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Mulai Konsultasi</button>
            </div></div>
          </div>
        )}

        {phase === 'confirming' && collectedParams && !isLoading && (
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1"><Bot className="w-3 h-3 text-emerald-400" /></div>
            <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
              <p className="text-slate-200 text-sm font-semibold mb-2">Konfirmasi Data Lahan</p>
              <div className="space-y-1.5 mb-3">{PARAM_ORDER.map((key) => { const val = collectedParams[key]; if (val == null) return null; const meta = PARAM_LABELS[key]; if (!meta) return null; return (<div key={key} className="flex items-center gap-2 text-sm"><span>{meta.emoji}</span><span className="text-white/60">{meta.label}:</span><span className="text-emerald-300 font-medium">{meta.format(val)}</span></div>); })}</div>
              <div className="flex gap-2"><button onClick={handleHitung} className="flex-1 text-sm px-3 py-2.5 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer">Hitung Rekomendasi</button><button onClick={handleUlangi} className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-white/20 bg-white/5 text-slate-200 font-medium hover:bg-white/10 transition-all cursor-pointer">Ulangi</button></div>
            </div>
          </div>
        )}

        {phase === 'preference' && showPreferences && !isLoading && (
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex-shrink-0 flex items-center justify-center border border-emerald-400/30 mt-1"><Bot className="w-3 h-3 text-emerald-400" /></div>
            <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-white/10 backdrop-blur-md border-white/10 w-full">
              <p className="text-slate-200 text-sm font-semibold mb-1">Preferensi Bobot</p><p className="text-white/50 text-xs mb-3">Pilih satu atau lebih kriteria yang paling penting.</p>
              <div className="space-y-2 mb-3">{PREFERENCE_OPTIONS.map((opt) => { const sel = selectedPreferences.includes(opt.criterionId); return (<button key={opt.id} onClick={() => handleTogglePreference(opt.criterionId)} role="checkbox" aria-checked={sel} className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${sel ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}><span className="mr-2">{sel ? '✅' : '⬜'}</span>{opt.label}</button>); })}</div>
              <button onClick={handlePreferenceSubmit} className="w-full text-sm px-4 py-2.5 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-colors cursor-pointer">Hitung Ranking</button>
            </div>
          </div>
        )}

        {phase === 'collecting' && !isLoading && quickReplies.length > 0 && (
          <div className="pl-8 space-y-2">
            <div className="flex items-center gap-2"><span className="text-xs text-white/50 font-medium">Mengapa ditanya <span className="text-emerald-400/70">{currentParam}</span>?</span>{currentTooltip && (<button onClick={() => setActiveTooltip((prev) => prev === currentParam ? null : currentParam)} className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center cursor-pointer ${activeTooltip === currentParam ? 'bg-emerald-400/30 border-emerald-400/60 text-emerald-300' : 'bg-white/5 border-white/20 text-white/40'}`} aria-label={`Penjelasan ${currentParam}`}>ⓘ</button>)}</div>
            {activeTooltip === currentParam && currentTooltip && (<div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed">{currentTooltip}</div>)}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2" role="group" aria-label="Pilihan jawaban">{quickReplies.map((qr) => (<button key={qr.value} onClick={() => handleQuickReply(qr.value)} onKeyDown={(e) => handleQuickReplyKeyDown(e, qr.value)} tabIndex={0} role="button" aria-label={qr.label} disabled={isLoading} className={`text-xs px-3 py-2.5 rounded-full border transition-all cursor-pointer disabled:opacity-50 min-h-[44px] ${qr.value.startsWith('__ESCAPE') ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'}`}>{qr.label}</button>))}</div>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      <div className="p-2.5 border-t border-white/10 bg-black/60 shrink-0">
        {isInputDisabled ? (
          <div className="text-center py-2"><span className="text-xs text-white/30">{phase === 'welcome' && 'Silakan isi form di atas'}{phase === 'collecting' && 'Pilih jawaban di atas'}{phase === 'confirming' && 'Klik tombol Hitung atau Ulangi'}{phase === 'preference' && 'Pilih preferensi dan klik Hitung Ranking'}</span></div>
        ) : (
          <form onSubmit={handleTextSubmit} className="relative flex items-center mb-1"><input className="w-full bg-[#0b0f10] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-all" placeholder="Ketik pesan..." type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isLoading} /><button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors disabled:opacity-50" aria-label="Kirim"><Send className="w-3.5 h-3.5 ml-0.5" /></button></form>
        )}
        <div className="text-center"><span className="text-[9px] text-white/30">AI dapat membuat kesalahan. Verifikasi hasil dengan ahli pertanian.</span></div>
      </div>
    </>
  );

  if (fullPage) {
    return (<div className="fixed top-20 left-0 right-0 bottom-0 z-30"><div className="w-full h-full flex flex-col overflow-hidden bg-[#0b0f10]" role="region" aria-label="Agri-SAW Chat">{chatContent}</div></div>);
  }

  return (
    <>
      {!isOpen && !fullPage && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9998] flex flex-col items-end" role="region" aria-label="Widget percakapan">
          <button onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-black hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.5)] border-2 border-[#0b0f10] hover:scale-105 active:scale-95" aria-label="Buka percakapan" aria-expanded={isOpen}><Bot className="w-7 h-7" /><span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b0f10]"></span></button>
        </div>
      )}
      {isOpen && !fullPage && (
        <div className="fixed top-20 left-0 right-0 bottom-0 z-[9999] flex flex-col bg-[#0b0f10] animate-in slide-in-from-bottom-4 fade-in duration-300" role="region" aria-label="Percakapan Agri-SAW">{chatContent}</div>
      )}
    </>
  );
}
