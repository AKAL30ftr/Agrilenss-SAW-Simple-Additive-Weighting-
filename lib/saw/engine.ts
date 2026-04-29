import { Alternative, Criterion, SAWResult } from './types';

export class SAWEngine {
  /**
   * Calculates the Simple Additive Weighting (SAW) ranking for a given set of criteria and alternatives.
   */
  static calculate(criteria: Criterion[], alternatives: Alternative[]): SAWResult[] {
    if (alternatives.length === 0 || criteria.length === 0) return [];

    // 1. Calculate min and max values for each criterion to build the decision matrix ranges
    const minMax: Record<string, { min: number; max: number }> = {};
    
    criteria.forEach((c) => {
      const values = alternatives.map((a) => a.values[c.id] || 0);
      minMax[c.id] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    // 2. Normalize values & calculate preference score
    const results: SAWResult[] = alternatives.map((alt) => {
      const normalizedValues: Record<string, number> = {};
      let preferenceScore = 0;

      criteria.forEach((c) => {
        const val = alt.values[c.id] || 0;
        let norm = 0;

        if (c.type === 'benefit') {
          // For benefit criteria: value / max
          norm = minMax[c.id].max !== 0 ? val / minMax[c.id].max : 0;
        } else {
          // For cost criteria: min / value
          norm = val !== 0 ? minMax[c.id].min / val : 0;
        }

        normalizedValues[c.id] = norm;
        preferenceScore += norm * c.weight;
      });

      return {
        alternativeId: alt.id,
        name: alt.name,
        preferenceScore,
        normalizedValues,
      };
    });

    // 3. Sort by preference score descending (highest rank first)
    return results.sort((a, b) => b.preferenceScore - a.preferenceScore);
  }
}
