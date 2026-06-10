import type { MessageWithoutId, PhaseResult } from './types';

export function handleLanjut(): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: 'Mengerti, lanjut konsultasi' }], nextPhase: 'collecting' };
}

export function handleShowFaqCategories(): PhaseResult {
  return { messagesToAdd: [{ role: 'assistant', content: 'Baik, apa yang ingin ditanyakan?\n\n- Tentang Sistem\n- Tentang Tanaman\n- Tentang Kondisi Lahan\n- Tentang Tahap 1 — Kesesuaian Lahan\n- Tentang Tahap 2 — Keuntungan\n\nAtau kembali ke konsultasi' }], nextPhase: 'faq' };
}

export function handleBackToRingkasan(): PhaseResult {
  return { messagesToAdd: [], nextPhase: 'ringkasan' };
}
