import type { MessageWithoutId, PhaseResult } from './types';

export function handleLanjut(): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: 'Mengerti, lanjut konsultasi' }], nextPhase: 'collecting' };
}

export function handleShowFaqCategories(): PhaseResult {
  return { messagesToAdd: [{ role: 'assistant', content: 'Baik, apa yang ingin ditanyakan?\n\n• Tentang cara kerja sistem\n• Tentang jenis tanaman\n• Tentang kondisi lahan\n• Tentang tahap kesesuaian lahan\n• Tentang tahap perhitungan keuntungan\n\nAtau kembali ke konsultasi' }], nextPhase: 'faq' };
}

export function handleBackToRingkasan(): PhaseResult {
  return { messagesToAdd: [], nextPhase: 'ringkasan' };
}
