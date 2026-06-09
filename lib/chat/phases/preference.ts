import type { MessageWithoutId, PhaseResult, Sapaan } from './types';
import { PREFERENCE_OPTIONS, MAX_PREFERENCE_SELECTION } from '../constants';
import { preferenceMessage } from '../content/messages';

export { PREFERENCE_OPTIONS, MAX_PREFERENCE_SELECTION };

export function getPreferenceMessage(name: string, gender: Sapaan | '', survivingCount: number, cropList: string): string {
  return preferenceMessage(name, gender, survivingCount, cropList);
}

export function handleTogglePreference(selectedIds: string[], prefId: string): { selectedIds: string[]; changed: boolean } {
  const idx = selectedIds.indexOf(prefId);
  if (idx >= 0) return { selectedIds: selectedIds.filter((id) => id !== prefId), changed: true };
  if (selectedIds.length >= MAX_PREFERENCE_SELECTION) return { selectedIds, changed: false };
  return { selectedIds: [...selectedIds, prefId], changed: true };
}

export function handleSubmitPreference(): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: 'Hitung Ranking' }], nextPhase: 'loading_result' };
}
