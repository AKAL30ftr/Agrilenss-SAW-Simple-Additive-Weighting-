import type { QuickReply } from '../types';

// ── Phase 2: Ringkasan ────────────────────────────────────────────────────────
export const RINGKASAN_REPLIES: QuickReply[] = [
  { label: 'Mengerti, lanjut konsultasi', value: '__RINGKASAN_LANJUT__' },
  { label: 'Ada pertanyaan dulu', value: '__RINGKASAN_FAQ__' },
];

export const FAQ_REPLIES: QuickReply[] = [
  { label: 'Tentang cara kerja sistem', value: 'faq-sistem' },
  { label: 'Tentang jenis tanaman', value: 'faq-crops' },
  { label: 'Tentang kondisi lahan', value: 'faq-params' },
  { label: 'Tentang Filter 1 (lingkungan)', value: 'faq-filter1' },
  { label: 'Tentang Filter 2 (keuntungan)', value: 'faq-filter2' },
  { label: 'Kembali ke konsultasi', value: '__FAQ_KEMBALI__' },
];

// ── Phase 3: Collecting (per parameter) ────────────────────────────────────────
export const PARAM_REPLIES: Record<string, QuickReply[]> = {
  'ketinggian': [
    { label: 'Dataran rendah (0-400 mdpl)', value: 'ketinggian rendah' },
    { label: 'Dataran sedang (400-700 mdpl)', value: 'ketinggian sedang' },
    { label: 'Pegunungan (700+ mdpl)', value: 'ketinggian tinggi' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'curah hujan': [
    { label: 'Hampir setiap hari', value: 'hujan hampir tiap hari' },
    { label: 'Sering (4-5x seminggu)', value: 'hujan sering' },
    { label: 'Cukup (2-3x seminggu)', value: 'hujan cukup' },
    { label: 'Jarang (kurang dari 1x seminggu)', value: 'hujan jarang' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'pH tanah': [
    { label: 'Tanaman sering menguning/kerdil', value: 'tanah asam' },
    { label: 'Tumbuh biasa saja', value: 'tanah netral' },
    { label: 'Hijau dan subur', value: 'tanah subur' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'tekstur tanah': [
    { label: 'Lengket/liat saat basah', value: 'tanah liat' },
    { label: 'Gembur/lempung', value: 'tanah lempung' },
    { label: 'Kasar/berpasir', value: 'tanah berpasir' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'intensitas cahaya': [
    { label: 'Teduh (6-8 jam)', value: 'cahaya teduh' },
    { label: 'Sedang (8-10 jam)', value: 'cahaya sedang' },
    { label: 'Penuh (12+ jam)', value: 'cahaya penuh' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
};

// ── Phase 4: Confirming ────────────────────────────────────────────────────────
export const CONFIRMING_REPLIES: QuickReply[] = [
  { label: 'Hitung Rekomendasi', value: '__CONFIRM_HITUNG__' },
  { label: 'Ulangi dari awal', value: '__CONFIRM_ULANGI__' },
];

// ── Phase: filter1_result ──────────────────────────────────────────────────────
export const FILTER1_RESULT_REPLIES: QuickReply[] = [
  { label: 'Lanjut analisis keuntungan', value: '__FILTER1_LANJUT__' },
  { label: 'Cukup, tampilkan rekomendasi', value: '__FILTER1_CUKUP__' },
  { label: 'Konsultasi ulang', value: '__FILTER1_ULANGI__' },
];

// ── Phase: filter2_pref ────────────────────────────────────────────────────────
export const FILTER2_PREF_REPLIES: QuickReply[] = [
  { label: 'Biaya produksi rendah', value: 'pref_biaya' },
  { label: 'Harga jual tinggi', value: 'pref_harga' },
  { label: 'Produktivitas tinggi', value: 'pref_produktivitas' },
  { label: 'Risiko rendah', value: 'pref_risiko' },
  { label: 'Permintaan pasar tinggi', value: 'pref_permintaan' },
  { label: 'Hitung Ranking', value: '__PREF_HITUNG_RANKING__' },
];

// ── Phase 6: Result ────────────────────────────────────────────────────────────
export function getResultReplies(survivingCrops: Array<{ name: string }>): QuickReply[] {
  const detailReplies = survivingCrops.map(crop => ({
    label: `Lihat detail ${crop.name}`,
    value: `__DETAIL__${crop.name}`,
  }));
  return [
    ...detailReplies,
    { label: 'Ulangi konsultasi', value: '__ULANGI_KONSULTASI__' },
    { label: 'Selesai', value: '__SELESAI__' },
  ];
}

// ── Phase 6.x: Detail ──────────────────────────────────────────────────────────
export const DETAIL_REPLIES: QuickReply[] = [
  { label: 'Kembali ke hasil', value: '__DETAIL_KEMBALI__' },
  { label: 'Ulangi konsultasi', value: '__DETAIL_ULANGI__' },
  { label: 'Selesai', value: '__DETAIL_SELESAI__' },
];

// ── Phase 7: Closing ───────────────────────────────────────────────────────────
export const CLOSING_REPLIES: QuickReply[] = [
  { label: 'Konsultasi ulang', value: '__CLOSING_ULANGI__' },
  { label: 'Kembali ke beranda', value: '__CLOSING_BERANDA__' },
];

// ── Helper: get quick replies for any phase ────────────────────────────────────
export function getQuickReplies(phase: string, collectionState?: { currentParamIndex: number }, survivingCrops?: Array<{ name: string }>): QuickReply[] {
  if (phase === 'ringkasan') return RINGKASAN_REPLIES;
  if (phase === 'faq') return FAQ_REPLIES;
  if (phase === 'filter1_result') return FILTER1_RESULT_REPLIES;
  if (phase === 'filter2_pref') return FILTER2_PREF_REPLIES;
  if (phase === 'confirming') return CONFIRMING_REPLIES;
  if (phase === 'done') return survivingCrops ? getResultReplies(survivingCrops) : [];
  if (phase === 'detail') return DETAIL_REPLIES;
  if (phase === 'closing') return CLOSING_REPLIES;
  if (phase === 'collecting' && collectionState) {
    const paramOrder = ['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah', 'intensitas cahaya'];
    const currentParam = paramOrder[collectionState.currentParamIndex];
    return currentParam ? (PARAM_REPLIES[currentParam] || []) : [];
  }
  return [];
}
