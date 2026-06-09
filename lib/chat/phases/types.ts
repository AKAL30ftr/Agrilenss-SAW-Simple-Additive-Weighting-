/**
 * Shared types for phase modules.
 */
import type { Message, MessageWithoutId } from '../types';
export type { MessageWithoutId };
export type Sapaan = 'laki' | 'perempuan';
/**
 * Result returned by every phase handler.
 */
export interface PhaseResult {
  messagesToAdd: MessageWithoutId[];
  nextPhase?: string;
  updateState?: Record<string, unknown>;
}

/**
 * Collection state for Phase 3 (collecting).
 * Enforces sequential parameter collection.
 */
export interface CollectionState {
  currentParamIndex: number;       // 0-4, enforced sequential
  answers: Record<string, string>; // { ketinggian: 'Dataran rendah', ... }
}

/**
 * Preference state for Phase 5.
 */
export interface PreferenceState {
  selectedIds: string[];
  maxSelection: number;
}

/**
 * Result state for Phase 6.
 */
export interface ResultState {
  survivingCrops: Array<{
    name: string;
    score: string;
    normalizedValues?: Record<string, number>;
    explanation?: string;
  }>;
  eliminatedCrops: Array<{
    name: string;
    reasons: string[];
  }>;
  darkHorse: Array<{
    cropName: string;
    totalProximity: number;
    failReasons: string[];
    advice: string;
  }>;
  selectedCropDetail: { name: string; score: string } | null;
}
