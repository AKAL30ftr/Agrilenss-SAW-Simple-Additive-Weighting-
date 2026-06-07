import {
  parseUserInput,
  filterByAgroklimat,
  rankBySAW,
  runFullPipeline,
  cropProfiles,
  detectMissingParams,
  generateFollowUpQuestion,
} from '@/lib/knowledge-base';

describe('Knowledge Base - Core Logic', () => {
  describe('parseUserInput', () => {
    it('parses elevation from "200 mdpl"', () => {
      const result = parseUserInput('lahan 200 mdpl');
      expect(result.elevation).toBe(200);
    });

    it('parses pH from "tanah asam"', () => {
      const result = parseUserInput('tanah asam tanaman menguning');
      expect(result.pH).toBe(5.0);
    });

    it('parses texture from "tanah liat"', () => {
      const result = parseUserInput('tanah liat lengket');
      expect(result.texture).toBe('liat');
    });

    it('parses rainfall from "hujan sering"', () => {
      const result = parseUserInput('hujan sering');
      expect(result.rainfall).toBe(1500);
    });

    it('parses light from "cahaya penuh"', () => {
      const result = parseUserInput('cahaya penuh 12 jam');
      expect(result.light).toBe(12);
    });

    it('returns null for missing params', () => {
      const result = parseUserInput('hello world');
      expect(result.elevation).toBeNull();
      expect(result.pH).toBeNull();
      expect(result.texture).toBeNull();
      expect(result.rainfall).toBeNull();
      expect(result.light).toBeNull();
    });
  });

  describe('detectMissingParams', () => {
    it('detects all missing params', () => {
      const parsed = parseUserInput('');
      const missing = detectMissingParams(parsed);
      expect(missing).toContain('ketinggian');
      expect(missing).toContain('curah hujan');
      expect(missing).toContain('pH tanah');
      expect(missing).toContain('tekstur tanah');
      expect(missing).toContain('intensitas cahaya');
    });

    it('detects only missing params', () => {
      const parsed = parseUserInput('lahan 200 mdpl, tanah liat, hujan sering');
      const missing = detectMissingParams(parsed);
      expect(missing).not.toContain('ketinggian');
      expect(missing).not.toContain('tekstur tanah');
      expect(missing).not.toContain('curah hujan');
      expect(missing).toContain('pH tanah');
      expect(missing).toContain('intensitas cahaya');
    });
  });

  describe('filterByAgroklimat - Filter 1 Boolean Elimination', () => {
    it('eliminates Bawang Putih for lowland (200 mdpl) when elevation provided', () => {
      const parsed = parseUserInput('lahan dataran rendah 200 mdpl');
      const result = filterByAgroklimat(parsed, 'lahan dataran rendah 200 mdpl');

      const garlic = result.results.find(r => r.cropId === 'garlic');
      expect(garlic?.eliminated).toBe(true);
      expect(garlic?.failReasons.some(r => r.includes('ketinggian'))).toBe(true);
    });

    it('keeps Padi for lowland when all conditions provided and match', () => {
      const input = 'lahan 200 mdpl, tanah liat, hujan 1500 mm, pH 6.5, cahaya 9 jam';
      const parsed = parseUserInput(input);
      const result = filterByAgroklimat(parsed, input);

      const rice = result.results.find(r => r.cropId === 'rice');
      expect(rice?.eliminated).toBe(false);
    });

    it('eliminates all crops for extreme pH when pH provided', () => {
      const input = 'pH 4.0, lahan 200 mdpl, tanah liat, hujan 1500 mm';
      const parsed = parseUserInput(input);
      const result = filterByAgroklimat(parsed, input);

      expect(result.allEliminated).toBe(true);
      expect(result.surviving.length).toBe(0);
    });

    it('Bawang Putih survives at 900 mdpl with proper conditions', () => {
      const input = 'lahan 900 mdpl, tanah lempung berpasir, hujan 700 mm, pH 6.5, cahaya 12 jam';
      const parsed = parseUserInput(input);
      const result = filterByAgroklimat(parsed, input);

      const garlic = result.results.find(r => r.cropId === 'garlic');
      expect(garlic?.eliminated).toBe(false);
    });

    it('returns 6 crops total when no params provided (none eliminated)', () => {
      const parsed = parseUserInput('');
      const result = filterByAgroklimat(parsed, '');
      expect(result.results.length).toBe(6);
      expect(result.allEliminated).toBe(false);
      expect(result.surviving.length).toBe(6);
    });

    it('skips check for missing params - no elimination without data', () => {
      const parsed = parseUserInput('lahan 200 mdpl');
      const result = filterByAgroklimat(parsed, 'lahan 200 mdpl');

      const eliminated = result.eliminated.map(e => e.cropId);
      expect(eliminated).toContain('garlic'); // needs 700+
      expect(eliminated).not.toContain('rice'); // 0-650 OK
    });
  });

  describe('rankBySAW - Filter 2 Economic Ranking', () => {
    it('ranks surviving crops by SAW score when all params provided', () => {
      const input = 'lahan 200 mdpl, tanah liat, hujan 1500 mm, pH 6.5, cahaya 9 jam';
      const parsed = parseUserInput(input);
      const filter1 = filterByAgroklimat(parsed, input);
      const sawResults = rankBySAW(filter1.surviving);

      expect(sawResults.length).toBeGreaterThan(0);
      expect(sawResults[0].preferenceScore).toBeGreaterThan(0);
      expect(sawResults[0].name).toBeDefined();
    });

    it('returns empty array for no survivors when all eliminated', () => {
      const input = 'pH 4.0, lahan 200 mdpl, tanah liat, hujan 1500 mm';
      const parsed = parseUserInput(input);
      const filter1 = filterByAgroklimat(parsed, input);
      const sawResults = rankBySAW(filter1.surviving);
      expect(sawResults.length).toBe(0);
    });

    it('sorts by preferenceScore descending', () => {
      const input = 'lahan 200 mdpl, tanah liat, hujan 1500 mm, pH 6.5, cahaya 9 jam';
      const parsed = parseUserInput(input);
      const filter1 = filterByAgroklimat(parsed, input);
      const sawResults = rankBySAW(filter1.surviving);

      for (let i = 1; i < sawResults.length; i++) {
        expect(sawResults[i - 1].preferenceScore).toBeGreaterThanOrEqual(sawResults[i].preferenceScore);
      }
    });
  });

  describe('runFullPipeline - End-to-End', () => {
    it('produces full recommendation for valid input with all params', () => {
      const result = runFullPipeline('lahan 200 mdpl, tanah liat, hujan 1500 mm, pH 6.5, cahaya 9 jam');

      expect(result.mode).toBe('local-double-filter');
      expect(result.surviving.length).toBeGreaterThan(0);
      expect(result.eliminated.length).toBeGreaterThan(0);
      expect(result.message).toContain('Rekomendasi');
    });

    it('returns follow-up question for missing params', () => {
      const result = runFullPipeline('hello');
      expect(result.followUpQuestion).not.toBeNull();
    });

    it('handles all-eliminated case when all params provided and extreme', () => {
      const result = runFullPipeline('pH 4.0, lahan 200 mdpl, tanah liat, hujan 300 mm, cahaya 5 jam');

      expect(result.mode).toBe('all-eliminated');
      expect(result.surviving.length).toBe(0);
      expect(result.eliminated.length).toBeGreaterThan(0);
    });

    it('returns local-double-filter when some params missing (no elimination without data)', () => {
      const result = runFullPipeline('pH 6.5, lahan 200 mdpl');
      expect(result.mode).toBe('local-double-filter');
    });
  });

  describe('Crop Profiles - Data Integrity', () => {
    it('has all 6 crops', () => {
      expect(Object.keys(cropProfiles).length).toBe(6);
      expect(cropProfiles.rice).toBeDefined();
      expect(cropProfiles.corn).toBeDefined();
      expect(cropProfiles.soybean).toBeDefined();
      expect(cropProfiles.chili).toBeDefined();
      expect(cropProfiles.shallot).toBeDefined();
      expect(cropProfiles.garlic).toBeDefined();
    });

    it('each crop has agroklimat and economic data', () => {
      Object.values(cropProfiles).forEach(crop => {
        expect(crop.agroklimat).toBeDefined();
        expect(crop.economic).toBeDefined();
        expect(crop.agroklimat.phMin).toBeLessThan(crop.agroklimat.phMax);
        expect(crop.agroklimat.elevationMin).toBeLessThan(crop.agroklimat.elevationMax);
        expect(crop.economic.biayaProduksi).toBeGreaterThan(0);
        expect(crop.economic.hargaJual).toBeGreaterThan(0);
        expect(crop.economic.produktivitas).toBeGreaterThan(0);
        expect(crop.economic.risiko).toBeGreaterThanOrEqual(1);
        expect(crop.economic.risiko).toBeLessThanOrEqual(3);
        expect(crop.economic.permintaan).toBeGreaterThanOrEqual(1);
        expect(crop.economic.permintaan).toBeLessThanOrEqual(5);
      });
    });

    it('Bawang Putih requires 700-1100 mdpl', () => {
      expect(cropProfiles.garlic.agroklimat.elevationMin).toBe(700);
      expect(cropProfiles.garlic.agroklimat.elevationMax).toBe(1100);
    });

    it('Padi requires 0-650 mdpl', () => {
      expect(cropProfiles.rice.agroklimat.elevationMin).toBe(0);
      expect(cropProfiles.rice.agroklimat.elevationMax).toBe(650);
    });
  });
});
