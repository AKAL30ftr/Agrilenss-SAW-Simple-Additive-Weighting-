import type { MessageWithoutId, PhaseResult } from './types';
import { confirmingMessage } from '../content/messages';

export function getConfirmingMessage(name: string, gender: 'laki' | 'perempuan' | ''): string {
  return confirmingMessage(name, gender);
}

export function handleHitungRekomendasi(): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: 'Hitung Rekomendasi' }], nextPhase: 'loading' };
}

export function handleUlangi(): PhaseResult {
  return { messagesToAdd: [], nextPhase: 'ringkasan' };
}
