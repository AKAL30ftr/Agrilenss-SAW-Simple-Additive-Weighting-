/**
 * Chat widget constants — structural only.
 * Content (messages, quick replies) moved to lib/chat/content/.
 */
import type { PreferenceOption } from './types';
// ─── localStorage key ─────────────────────────────────────────────────────────
export const STORAGE_KEY = 'agri-saw-user';
// ─── Canonical parameter order (source of truth) ─────────────────────────────
export const PARAM_ORDER: string[] = [
  'ketinggian',
  'curah hujan',
  'pH tanah',
  'tekstur tanah',
  'intensitas cahaya',
];
// ─── Parameter labels for display ────────────────────────────────────────────
export const PARAM_LABELS: Record<string, { label: string; emoji: string; format: (v: unknown) => string }> = {
  'ketinggian':        { label: 'Ketinggian',        emoji: '📍', format: (v) => `${v} mdpl` },
  'curah hujan':       { label: 'Curah hujan',       emoji: '🌧️', format: (v) => `${v} mm/tahun` },
  'pH tanah':          { label: 'pH tanah',          emoji: '🔬', format: (v) => `pH ${v}` },
  'tekstur tanah':     { label: 'Tekstur tanah',     emoji: '🤲', format: (v) => `${v}` },
  'intensitas cahaya': { label: 'Intensitas cahaya', emoji: '☀️', format: (v) => `${v} jam/hari` },
};
// ─── ECONOMIC DATA (Ground Truth dari dasar knowledge base.md) ───────────────
export interface EconomicData {
  biaya: number;        // Rp/ha
  harga: number;        // Rp/kg
  produktivitas: number; // ton/ha
  risiko: number;        // 1-3
  permintaan: number;    // 1-5
}
export const ECONOMIC_DATA: Record<string, EconomicData> = {
  'Padi':           { biaya: 7207932,  harga: 10022, produktivitas: 5.28,  risiko: 2, permintaan: 5 },
  'Jagung':         { biaya: 6158477,  harga: 8438,  produktivitas: 5.57,  risiko: 2, permintaan: 4 },
  'Kedelai':        { biaya: 5370000,  harga: 16459, produktivitas: 1.62,  risiko: 3, permintaan: 4 },
  'Cabai Merah':    { biaya: 48500000, harga: 52001, produktivitas: 8.60,  risiko: 3, permintaan: 4 },
  'Bawang Merah':   { biaya: 58500000, harga: 37304, produktivitas: 10.05, risiko: 3, permintaan: 5 },
  'Bawang Putih':   { biaya: 91587000, harga: 39064, produktivitas: 8.50,  risiko: 3, permintaan: 5 },
};
// ─── ENVIRONMENT SCORES (Filter 1 breakdown per parameter per komoditas) ─────
export interface ScoreDetail {
  score: number;   // 1-5
  label: string;   // "Sangat cocok", "Cocok", "Kurang cocok", dll.
  detail: string;  // Penjelasan singkat
}
export const ENVIRONMENT_SCORES: Record<string, Record<string, ScoreDetail>> = {
  'Padi': {
    'ketinggian':  { score: 5, label: 'Sangat cocok', detail: 'Dataran rendah sangat ideal' },
    'curah hujan': { score: 4, label: 'Cocok',        detail: 'Curah hujan tinggi mendekati optimal' },
    'pH tanah':    { score: 4, label: 'Cocok',        detail: 'pH netral dalam range optimal' },
    'tekstur':     { score: 5, label: 'Sangat cocok', detail: 'Tekstur liat sangat ideal untuk Padi' },
    'cahaya':      { score: 4, label: 'Cocok',        detail: '8-10 jam cahaya dalam range optimal' },
  },
  'Jagung': {
    'ketinggian':  { score: 5, label: 'Sangat cocok', detail: 'Dataran rendah dalam range 0-900 mdpl' },
    'curah hujan': { score: 3, label: 'Cukup cocok',   detail: 'Curah hujan cukup, mendekati range optimal' },
    'pH tanah':    { score: 4, label: 'Cocok',        detail: 'pH netral dalam range 5.6-7.5' },
    'tekstur':     { score: 3, label: 'Cukup cocok',   detail: 'Tekstur liat kurang ideal (butuh lempung berpasir)' },
    'cahaya':      { score: 4, label: 'Cocok',        detail: '8-10 jam cahaya dalam range optimal' },
  },
  'Kedelai': {
    'ketinggian':  { score: 5, label: 'Sangat cocok', detail: 'Dataran rendah dalam range 0-900 mdpl' },
    'curah hujan': { score: 3, label: 'Cukup cocok',   detail: 'Curah hujan cukup, mendekati range 350-600 mm/musim' },
    'pH tanah':    { score: 4, label: 'Cocok',        detail: 'pH netral dalam range 6.0-7.0' },
    'tekstur':     { score: 3, label: 'Cukup cocok',   detail: 'Tekstur liat butuh drainase baik' },
    'cahaya':      { score: 3, label: 'Cukup cocok',   detail: '9 jam sedikit di bawah ideal 10-12 jam' },
  },
  'Cabai Merah': {
    'ketinggian':  { score: 5, label: 'Sangat cocok', detail: 'Dataran rendah dalam range 0-1.400 mdpl' },
    'curah hujan': { score: 3, label: 'Cukup cocok',   detail: 'Curah hujan cukup, mendekati range 600-1.250' },
    'pH tanah':    { score: 4, label: 'Cocok',        detail: 'pH netral dalam range 6.0-7.0' },
    'tekstur':     { score: 2, label: 'Kurang cocok',  detail: 'Tekstur liat tidak cocok (butuh lempung berpasir)' },
    'cahaya':      { score: 3, label: 'Cukup cocok',   detail: '9 jam sedikit di bawah ideal 10-12 jam' },
  },
  'Bawang Merah': {
    'ketinggian':  { score: 4, label: 'Cocok',        detail: 'Dataran rendah dalam range 0-800 mdpl' },
    'curah hujan': { score: 2, label: 'Kurang cocok',  detail: 'Curah hujan terlalu tinggi (butuh 300-400 mm/musim)' },
    'pH tanah':    { score: 4, label: 'Cocok',        detail: 'pH netral dalam range 5.6-6.5' },
    'tekstur':     { score: 2, label: 'Kurang cocok',  detail: 'Tekstur liat tidak cocok (butuh lempung berpasir)' },
    'cahaya':      { score: 3, label: 'Cukup cocok',   detail: '9 jam di bawah ideal 12+ jam' },
  },
  'Bawang Putih': {
    'ketinggian':  { score: 2, label: 'Kurang cocok',  detail: 'Dataran rendah (butuh 700-1.100 mdpl)' },
    'curah hujan': { score: 1, label: 'Tidak cocok',   detail: 'Curah hujan terlalu tinggi (butuh 110-200 mm/bulan)' },
    'pH tanah':    { score: 4, label: 'Cocok',        detail: 'pH netral dalam range 6.0-7.0' },
    'tekstur':     { score: 2, label: 'Kurang cocok',  detail: 'Tekstur liat tidak cocok (butuh lempung berpasir)' },
    'cahaya':      { score: 3, label: 'Cukup cocok',   detail: '9 jam di bawah ideal 12+ jam' },
  },
};
// ─── FILTER 2 WEIGHTS (Default bobot SAW keuntungan) ─────────────────────────
export const FILTER2_WEIGHTS_DEFAULT: Record<string, number> = {
  'biaya': 0.20,
  'harga': 0.25,
  'produktivitas': 0.25,
  'risiko': 0.15,
  'permintaan': 0.15,
};
// ─── Preference options ───────────────────────────────────────────────────────
export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: 'pref_biaya',         label: 'Biaya produksi rendah',   criterionId: 'biaya_produksi' },
  { id: 'pref_harga',         label: 'Harga jual tinggi',       criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: 'Produktivitas tinggi',    criterionId: 'produktivitas' },
  { id: 'pref_risiko',        label: 'Risiko rendah',           criterionId: 'risiko' },
  { id: 'pref_permintaan',    label: 'Permintaan pasar tinggi', criterionId: 'permintaan' },
];
// ─── Max preference selection ─────────────────────────────────────────────────
export const MAX_PREFERENCE_SELECTION = 3; // Maksimal 3 preferensi
// ─── Parameter → FAQ mapping (for all-crops-eliminated flow) ─────────────────
export const PARAM_TO_FAQ: Record<string, { sectionId: string; itemId: string; label: string }> = {
  'pH tanah':            { sectionId: 'faq-params', itemId: 'param-ph',              label: 'Pelajari cara memperbaiki pH tanah' },
  'ketinggian':          { sectionId: 'faq-params', itemId: 'param-ketinggian',       label: 'Pelajari soal ketinggian tempat' },
  'curah hujan':         { sectionId: 'faq-params', itemId: 'param-curah-hujan',      label: 'Pelajari soal curah hujan' },
  'tekstur tanah':       { sectionId: 'faq-params', itemId: 'param-tekstur-tanah',    label: 'Pelajari soal tekstur tanah' },
  'intensitas cahaya':   { sectionId: 'faq-params', itemId: 'param-cahaya',           label: 'Pelajari soal intensitas cahaya' },
};
