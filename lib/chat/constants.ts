/**
 * Chat widget constants — structural only.
 * Content (messages, quick replies, tooltips) moved to lib/chat/content/.
 */

import type { PreferenceOption } from './types';

// ─── localStorage key ─────────────────────────────────────────────────────────
export const STORAGE_KEY = 'agri-saw-user';

// ─── Canonical parameter order (source of truth) ─────────────────────────────
// INVARIANT: This order drives sequential collection. Never reorder.
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

// ─── Preference options ───────────────────────────────────────────────────────
export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { id: 'pref_biaya',         label: 'Biaya produksi rendah',   criterionId: 'biaya_produksi' },
  { id: 'pref_harga',         label: 'Harga jual tinggi',       criterionId: 'harga_jual' },
  { id: 'pref_produktivitas', label: 'Produktivitas tinggi',    criterionId: 'produktivitas' },
  { id: 'pref_risiko',        label: 'Risiko rendah',           criterionId: 'risiko' },
  { id: 'pref_permintaan',    label: 'Permintaan pasar tinggi', criterionId: 'permintaan' },
];

// ─── Max preference selection ─────────────────────────────────────────────────
export const MAX_PREFERENCE_SELECTION = 3;

// ─── Parameter → FAQ mapping (for all-crops-eliminated flow) ─────────────────
export const PARAM_TO_FAQ: Record<string, { sectionId: string; itemId: string; label: string }> = {
  'pH tanah':            { sectionId: 'faq-params', itemId: 'param-ph',              label: 'Pelajari cara memperbaiki pH tanah' },
  'ketinggian':          { sectionId: 'faq-params', itemId: 'param-ketinggian',       label: 'Pelajari soal ketinggian tempat' },
  'curah hujan':         { sectionId: 'faq-params', itemId: 'param-curah-hujan',      label: 'Pelajari soal curah hujan' },
  'tekstur tanah':       { sectionId: 'faq-params', itemId: 'param-tekstur-tanah',    label: 'Pelajari soal tekstur tanah' },
  'intensitas cahaya':   { sectionId: 'faq-params', itemId: 'param-cahaya',           label: 'Pelajari soal intensitas cahaya' },
};
