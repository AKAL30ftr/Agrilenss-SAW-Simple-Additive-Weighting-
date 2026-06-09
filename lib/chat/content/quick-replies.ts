import type { QuickReply } from '../types';

// ── Phase 2: Ringkasan ────────────────────────────────────────────────────────
export const RINGKASAN_REPLIES: QuickReply[] = [
  { label: 'Mengerti, lanjut konsultasi', value: '__RINGKASAN_LANJUT__' },
  { label: 'Ada pertanyaan dulu', value: '__RINGKASAN_FAQ__' },
];

// ── Phase 4: Confirming ────────────────────────────────────────────────────────
export const CONFIRMING_REPLIES: QuickReply[] = [
  { label: 'Hitung Rekomendasi', value: '__CONFIRM_HITUNG__' },
  { label: 'Ulangi dari awal', value: '__CONFIRM_ULANGI__' },
];

// ── Phase 5: Preference ────────────────────────────────────────────────────────
export const PREFERENCE_REPLIES: QuickReply[] = [
  { label: 'Biaya produksi rendah', value: 'pref_biaya' },
  { label: 'Harga jual tinggi', value: 'pref_harga' },
  { label: 'Produktivitas tinggi', value: 'pref_produktivitas' },
  { label: 'Risiko rendah', value: 'pref_risiko' },
  { label: 'Permintaan pasar tinggi', value: 'pref_permintaan' },
  { label: 'Hitung Ranking', value: '__PREF_HITUNG_RANKING__' },
];

// ── Phase 3: Collecting (per parameter) ────────────────────────────────────────
export const PARAM_REPLIES: Record<string, QuickReply[]> = {
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

// ── Helper: get quick replies for any phase ────────────────────────────────────
export function getQuickReplies(phase: string, collectionState?: { currentParamIndex: number }): QuickReply[] {
  if (phase === 'ringkasan') return RINGKASAN_REPLIES;
  if (phase === 'confirming') return CONFIRMING_REPLIES;
  if (phase === 'preference') return PREFERENCE_REPLIES;
  if (phase === 'collecting' && collectionState) {
    const paramOrder = ['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah', 'intensitas cahaya'];
    const currentParam = paramOrder[collectionState.currentParamIndex];
    return currentParam ? (PARAM_REPLIES[currentParam] || []) : [];
  }
  return [];
}
