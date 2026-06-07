import { describe, it, expect } from 'vitest';
import { SAWEngine } from '@/lib/saw/engine';
import { Alternative, Criterion, SAWResult } from '@/lib/saw/types';
import { sawCriteria, cropProfiles, getCropsAsAlternatives } from '@/lib/knowledge-base';

/**
 * SAW Accuracy Tests — Reference values computed manually via spreadsheet.
 *
 * Ground truth data (from knowledge-base.ts cropProfiles):
 *  - kondisi_tanah: 8.0 (placeholder, benefit, weight 0.20)
 *  - curah_hujan:    8.0 (placeholder, benefit, weight 0.15)
 *  - biaya_produksi: cost,    weight 0.20
 *  - harga_jual:     benefit, weight 0.15
 *  - produktivitas:  benefit, weight 0.10
 *  - risiko:         cost,    weight 0.10
 *  - permintaan:     benefit, weight 0.10
 *
 * SAW formula:
 *   benefit: norm = value / max
 *   cost:    norm = min / value
 *   score = Σ(norm × weight)
 *
 * Expected ranking (descending):
 *   1. Jagung       0.7842
 *   2. Padi         0.7804
 *   3. Kedelai      0.7603
 *   4. Cabai Merah  0.7544
 *   5. Bawang Merah 0.7426
 *   6. Bawang Putih 0.7257
 */

// Build alternatives from real cropProfiles data (mirrors getCropsAsAlternatives)
function buildCropAlternatives(): Alternative[] {
  return Object.values(cropProfiles).map((crop) => ({
    id: crop.id,
    name: crop.name,
    values: {
      kondisi_tanah: 8,
      curah_hujan: 8,
      biaya_produksi: crop.economic.biayaProduksi,
      harga_jual: crop.economic.hargaJual,
      produktivitas: crop.economic.produktivitas,
      risiko: crop.economic.risiko,
      permintaan: crop.economic.permintaan,
    },
  }));
}

describe('SAW Accuracy — Reference Value Tests', () => {
  const criteria: Criterion[] = sawCriteria;
  const alternatives = buildCropAlternatives();

  describe('Full 6-crop ranking with static economic data', () => {
    const results: SAWResult[] = SAWEngine.calculate(criteria, alternatives);

    it('returns exactly 6 results', () => {
      expect(results).toHaveLength(6);
    });

    it('ranks Jagung (corn) first — lowest cost + low risk', () => {
      expect(results[0].alternativeId).toBe('corn');
      expect(results[0].name).toBe('Jagung');
    });

    it('ranks Padi (rice) second — low cost + highest demand', () => {
      expect(results[1].alternativeId).toBe('rice');
      expect(results[1].name).toBe('Padi');
    });

    it('ranks Kedelai (soybean) third — lowest production cost', () => {
      expect(results[2].alternativeId).toBe('soybean');
      expect(results[2].name).toBe('Kedelai');
    });

    it('ranks Cabai Merah (chili) fourth', () => {
      expect(results[3].alternativeId).toBe('chili');
      expect(results[3].name).toBe('Cabai Merah');
    });

    it('ranks Bawang Merah (shallot) fifth', () => {
      expect(results[4].alternativeId).toBe('shallot');
      expect(results[4].name).toBe('Bawang Merah');
    });

    it('ranks Bawang Putih (garlic) last — highest production cost', () => {
      expect(results[5].alternativeId).toBe('garlic');
      expect(results[5].name).toBe('Bawang Putih');
    });

    it('matches expected scores within ±0.001 tolerance', () => {
      const expectedScores: Record<string, number> = {
        corn: 0.7842,
        rice: 0.7804,
        soybean: 0.7603,
        chili: 0.7544,
        shallot: 0.7426,
        garlic: 0.7257,
      };

      for (const result of results) {
        const expected = expectedScores[result.alternativeId];
        expect(expected).toBeDefined();
        expect(result.preferenceScore).toBeCloseTo(expected, 3);
      }
    });

    it('all scores are between 0 and 1', () => {
      for (const result of results) {
        expect(result.preferenceScore).toBeGreaterThan(0);
        expect(result.preferenceScore).toBeLessThanOrEqual(1);
      }
    });

    it('scores are sorted in descending order', () => {
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].preferenceScore).toBeGreaterThanOrEqual(
          results[i].preferenceScore
        );
      }
    });
  });

  describe('Single crop scenario', () => {
    it('returns score of 1.0 when only one alternative exists', () => {
      const singleAlt: Alternative[] = [
        {
          id: 'rice',
          name: 'Padi',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 7207932,
            harga_jual: 10022,
            produktivitas: 5.28,
            risiko: 2,
            permintaan: 5,
          },
        },
      ];

      const results = SAWEngine.calculate(criteria, singleAlt);
      expect(results).toHaveLength(1);
      // With one alternative, min=max for all criteria, so all norms = 1.0
      // score = 1.0 × (0.20 + 0.15 + 0.20 + 0.15 + 0.10 + 0.10 + 0.10) = 1.0
      expect(results[0].preferenceScore).toBeCloseTo(1.0, 3);
    });
  });

  describe('Two identical crops', () => {
    it('returns equal scores for identical alternatives', () => {
      const identicalAlts: Alternative[] = [
        {
          id: 'crop-a',
          name: 'Crop A',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            harga_jual: 10000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
        {
          id: 'crop-b',
          name: 'Crop B',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            harga_jual: 10000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
      ];

      const results = SAWEngine.calculate(criteria, identicalAlts);
      expect(results).toHaveLength(2);
      expect(results[0].preferenceScore).toBeCloseTo(results[1].preferenceScore, 5);
    });
  });

  describe('Normalization correctness', () => {
    it('normalizes benefit criteria as value / max', () => {
      const alts: Alternative[] = [
        {
          id: 'low',
          name: 'Low Price',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            harga_jual: 10000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
        {
          id: 'high',
          name: 'High Price',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            harga_jual: 50000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
      ];

      const results = SAWEngine.calculate(criteria, alts);
      const lowResult = results.find((r) => r.alternativeId === 'low');
      const highResult = results.find((r) => r.alternativeId === 'high');

      expect(lowResult).toBeDefined();
      expect(highResult).toBeDefined();

      // harga_jual is benefit: low=10000/50000=0.2, high=50000/50000=1.0
      expect(lowResult!.normalizedValues['harga_jual']).toBeCloseTo(0.2, 3);
      expect(highResult!.normalizedValues['harga_jual']).toBeCloseTo(1.0, 3);

      // High price should rank higher
      expect(highResult!.preferenceScore).toBeGreaterThan(lowResult!.preferenceScore);
    });

    it('normalizes cost criteria as min / value', () => {
      const alts: Alternative[] = [
        {
          id: 'cheap',
          name: 'Cheap',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            harga_jual: 10000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
        {
          id: 'expensive',
          name: 'Expensive',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 50000000,
            harga_jual: 10000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
      ];

      const results = SAWEngine.calculate(criteria, alts);
      const cheapResult = results.find((r) => r.alternativeId === 'cheap');
      const expensiveResult = results.find((r) => r.alternativeId === 'expensive');

      expect(cheapResult).toBeDefined();
      expect(expensiveResult).toBeDefined();

      // biaya_produksi is cost: cheap=5000000/5000000=1.0, expensive=5000000/50000000=0.1
      expect(cheapResult!.normalizedValues['biaya_produksi']).toBeCloseTo(1.0, 3);
      expect(expensiveResult!.normalizedValues['biaya_produksi']).toBeCloseTo(0.1, 3);

      // Cheap should rank higher
      expect(cheapResult!.preferenceScore).toBeGreaterThan(
        expensiveResult!.preferenceScore
      );
    });
  });

  describe('Edge cases', () => {
    it('returns empty array for no alternatives', () => {
      const results = SAWEngine.calculate(criteria, []);
      expect(results).toEqual([]);
    });

    it('returns empty array for no criteria', () => {
      const results = SAWEngine.calculate([], alternatives);
      expect(results).toEqual([]);
    });

    it('handles missing criterion values as 0', () => {
      const alts: Alternative[] = [
        {
          id: 'complete',
          name: 'Complete',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            harga_jual: 10000,
            produktivitas: 5.0,
            risiko: 2,
            permintaan: 4,
          },
        },
        {
          id: 'incomplete',
          name: 'Incomplete',
          values: {
            kondisi_tanah: 8,
            curah_hujan: 8,
            biaya_produksi: 5000000,
            // missing harga_jual, produktivitas, risiko, permintaan
          },
        },
      ];

      const results = SAWEngine.calculate(criteria, alts);
      expect(results).toHaveLength(2);

      const completeResult = results.find((r) => r.alternativeId === 'complete');
      const incompleteResult = results.find((r) => r.alternativeId === 'incomplete');

      expect(completeResult).toBeDefined();
      expect(incompleteResult).toBeDefined();

      // Complete data should rank higher than incomplete (zeros for missing)
      expect(completeResult!.preferenceScore).toBeGreaterThan(
        incompleteResult!.preferenceScore
      );
    });
  });

  describe('Integration with getCropsAsAlternatives', () => {
    it('produces same ranking when using getCropsAsAlternatives()', () => {
      const kbAlternatives = getCropsAsAlternatives();
      const results = SAWEngine.calculate(criteria, kbAlternatives);

      expect(results).toHaveLength(6);
      expect(results[0].alternativeId).toBe('corn');
      expect(results[1].alternativeId).toBe('rice');
      expect(results[2].alternativeId).toBe('soybean');
      expect(results[3].alternativeId).toBe('chili');
      expect(results[4].alternativeId).toBe('shallot');
      expect(results[5].alternativeId).toBe('garlic');
    });
  });
});
