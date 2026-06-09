import { useState, useEffect } from 'react';
import { PARAM_ORDER } from './constants';

/**
 * Compute which parameters are still missing from collected state.
 * Used by Bug 1 fix: client-side guard against API parser contamination.
 */
export function computeClientMissingParams(
  collectedParams: Record<string, unknown> | null
): string[] {
  if (!collectedParams) return [...PARAM_ORDER];
  return PARAM_ORDER.filter(
    (p) => collectedParams[p] == null || collectedParams[p] === ''
  );
}

/**
 * Extract out-of-range parameters from eliminated crops.
 * Used for "Pelajari [param]" FAQ links in all-eliminated flow.
 */
export function extractOutOfRangeParams(
  eliminatedCrops: Array<{ name: string; reasons: string[] }>
): string[] {
  const params = new Set<string>();
  const paramKeywords: Record<string, string[]> = {
    'pH tanah': ['pH', 'asam', 'basa'],
    'ketinggian': ['ketinggian', 'mdpl', 'dataran'],
    'curah hujan': ['curah hujan', 'hujan', 'air'],
    'tekstur tanah': ['tekstur', 'tanah', 'lempung', 'liat', 'pasir'],
    'intensitas cahaya': ['cahaya', 'matahari', 'jam/hari'],
  };
  for (const crop of eliminatedCrops) {
    for (const reason of crop.reasons) {
      const lower = reason.toLowerCase();
      for (const [param, keywords] of Object.entries(paramKeywords)) {
        if (keywords.some((kw) => lower.includes(kw))) {
          params.add(param);
        }
      }
    }
  }
  return Array.from(params);
}

/**
 * Animated dots component for loading indicator.
 */
export function AnimatedDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-6 text-left">{dots}</span>;
}
