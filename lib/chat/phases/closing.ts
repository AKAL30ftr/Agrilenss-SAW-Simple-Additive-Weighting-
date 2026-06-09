import type { MessageWithoutId, PhaseResult } from './types';
import { closingMessage } from '../content/messages';

export function getClosingMessage(name: string, gender: 'laki' | 'perempuan' | ''): string {
  return closingMessage(name, gender);
}

export function handleUlangi(): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: 'Konsultasi ulang' }], nextPhase: 'ringkasan' };
}

export function handleBeranda(): PhaseResult {
  return { messagesToAdd: [], nextPhase: 'welcome' };
}
