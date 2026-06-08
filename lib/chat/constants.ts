/**
 * Chat Widget constants & static data
 * Extracted from ChatWidget.tsx for modularity and testability.
 */

import type { QuickReply, PreferenceOption } from './types';

// ─── localStorage key ─────────────────────────────────────────────────────────
export const STORAGE_KEY = 'agri-saw-user';

// ─── Canonical parameter order (source of truth) ─────────────────────────────
// INVARIANT: This order drives sequential collection. Never reorder.
// Bug 1 fix depends on this being the single source of truth.
export const PARAM_ORDER: string[] = [
  'ketinggian',
  'curah hujan',
  'pH tanah',
  'tekstur tanah',
  'intensitas cahaya',
];

// ─── Quick replies per parameter ─────────────────────────────────────────────
export const QUICK_REPLIES: Record<string, QuickReply[]> = {
  'ketinggian': [
    { label: 'Dataran rendah', value: 'lahan saya di dataran rendah 200 mdpl' },
    { label: 'Dataran sedang', value: 'lahan saya di dataran sedang 500 mdpl' },
    { label: 'Pegunungan', value: 'lahan saya di pegunungan 900 mdpl' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'curah hujan': [
    { label: 'Hampir setiap hari', value: 'hujan hampir tiap hari' },
    { label: 'Sering (4-5x seminggu)', value: 'hujan sering' },
    { label: 'Cukup (2-3x seminggu)', value: 'curah hujan cukup' },
    { label: 'Jarang (kurang dari 1x seminggu)', value: 'hujan jarang' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'pH tanah': [
    { label: 'Tanaman sering menguning/kerdil', value: 'tanah asam tanaman sering menguning' },
    { label: 'Tumbuh biasa saja', value: 'tanah netral tumbuh biasa' },
    { label: 'Hijau dan subur', value: 'tanah subur hijau' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'tekstur tanah': [
    { label: 'Lengket/liat saat basah', value: 'tanah liat lengket' },
    { label: 'Gembur/lempung', value: 'tanah gembur lempung' },
    { label: 'Kasar/berpasir', value: 'tanah berpasir kasar' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'intensitas cahaya': [
    { label: 'Teduh (6-8 jam)', value: 'cahaya teduh 7 jam' },
    { label: 'Sedang (8-10 jam)', value: 'cahaya 9 jam' },
    { label: 'Penuh (12+ jam)', value: 'cahaya penuh 12 jam' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
};

// ─── Tooltips per parameter ───────────────────────────────────────────────────
export const TOOLTIPS: Record<string, string> = {
  'ketinggian': 'Kalau lahan di dataran tinggi, udaranya lebih dingin. Ada tanaman yang suka dingin, ada yang nggak. Makanya ketinggian perlu diperhatikan.',
  'curah hujan': 'Air hujan itu sumber utama kehidupan tanaman. Kalau kebanyakan, tanaman bisa busuk. Kalau kekurangan, tanaman bisa mati.',
  'pH tanah': 'Tanah yang terlalu asam atau terlalu basa bisa bikin tanaman nggak bisa makan dengan baik. Tanaman butuh tanah yang "pas" — nggak terlalu asam, nggak terlalu basa.',
  'tekstur tanah': 'Tanah yang terlalu lengket (liat) susah ngalirin air, akarnya bisa busuk. Tanah yang terlalu berpasir cepet kering, air susah ditahan. Keduanya perlu perhatian khusus.',
  'intensitas cahaya': 'Sinar matahari itu "makanan" tanaman. Kalau kurang, tanaman kurus. Kalau kebanyakan, bisa gosong. Setiap tanaman butuh porsi cahaya yang berbeda.',
};

// ─── Parameter labels for display ────────────────────────────────────────────
export const PARAM_LABELS: Record<string, { label: string; emoji: string; format: (v: unknown) => string }> = {
  'ketinggian':        { label: 'Ketinggian',        emoji: '📍', format: (v) => `${v} mdpl` },
  'curah hujan':       { label: 'Curah hujan',       emoji: '🌧️', format: (v) => `${v} mm/tahun` },
  'pH tanah':          { label: 'pH tanah',          emoji: '🔬', format: (v) => `pH ${v}` },
  'tekstur tanah':     { label: 'Tekstur tanah',     emoji: '🤲', format: (v) => `${v}` },
  'intensitas cahaya': { label: 'Intensitas cahaya', emoji: '☀️', format: (v) => `${v} jam/hari` },
};

// ─── Parameter question messages (conversational) ────────────────────────────
export type ParamQuestionFn = (name: string, gender: 'laki' | 'perempuan' | '') => string;

function sapaan(gender: 'laki' | 'perempuan' | ''): string {
  return gender === 'perempuan' ? 'Ibu' : 'Bapak';
}

export const PARAM_QUESTION_MESSAGES: Record<string, ParamQuestionFn> = {
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

// ─── Preference options ───────────────────────────────────────────────────────
export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: 'pref_biaya',         label: 'Biaya produksi rendah',   criterionId: 'biaya_produksi' },
  { id: 'pref_harga',         label: 'Harga jual tinggi',       criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: 'Produktivitas tinggi',    criterionId: 'produktivitas' },
  { id: 'pref_risiko',        label: 'Risiko rendah',           criterionId: 'risiko' },
  { id: 'pref_permintaan',    label: 'Permintaan pasar tinggi', criterionId: 'permintaan' },
];

// ─── Max preference selection ───────────────────────────────────────────────
export const MAX_PREFERENCE_SELECTION = 3;

// ─── Parameter → FAQ mapping (for all-crops-eliminated flow) ─────────────────
export const PARAM_TO_FAQ: Record<string, { sectionId: string; itemId: string; label: string }> = {
  'pH tanah':            { sectionId: 'faq-params', itemId: 'param-ph',              label: 'Pelajari cara memperbaiki pH tanah' },
  'ketinggian':          { sectionId: 'faq-params', itemId: 'param-ketinggian',       label: 'Pelajari soal ketinggian tempat' },
  'curah hujan':         { sectionId: 'faq-params', itemId: 'param-curah-hujan',      label: 'Pelajari soal curah hujan' },
  'tekstur tanah':       { sectionId: 'faq-params', itemId: 'param-tekstur-tanah',    label: 'Pelajari soal tekstur tanah' },
  'intensitas cahaya':   { sectionId: 'faq-params', itemId: 'param-cahaya',           label: 'Pelajari soal intensitas cahaya' },
};
