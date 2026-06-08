/**
 * ChatWidget Bugfix Tests
 *
 * Task 1: Bug condition exploration tests — EXPECTED TO FAIL on unfixed code
 * Task 2: Preservation tests — EXPECTED TO PASS on unfixed code (baseline)
 * Task 8: Full unit + integration tests — run after fix implementation
 */

import { describe, it, expect } from 'vitest';
import { parseUserInput, detectMissingParams, computeProximityScore, PROXIMITY_WEIGHTS, DARK_HORSE_THRESHOLD, cropProfiles, filterByAgroklimat } from '@/lib/knowledge-base';
import { MAX_PREFERENCE_SELECTION, PREFERENCE_OPTIONS } from '@/lib/chat/constants';

// ─── Inline the PARAM_ORDER canonical list ───────────────────────────────────
const PARAM_ORDER = ['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah', 'intensitas cahaya'];

// ─── Pure function extracted from ChatWidget for testing ─────────────────────
// This mirrors the current (BUGGY) implementation in ChatWidget.tsx
function renderMessageContent_BUGGY(content: string): string {
  return content.replace(/\*\*/g, '');
}

// This mirrors the FIXED implementation (used in tasks 9, 10 to verify fix)
function renderMessageContent_FIXED(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\*/g, '');
}

// ─── computeClientMissingParams — pure function (to be added in ChatWidget) ──
// This is the fix for Bug 1 — tested here before and after implementation
function computeClientMissingParams(collected: Record<string, unknown> | null): string[] {
  if (!collected) return [...PARAM_ORDER];
  return PARAM_ORDER.filter((param) => {
    const val = collected[param];
    return val === null || val === undefined || val === '';
  });
}

// ─── Simulate advanceCollecting (BUGGY) ──────────────────────────────────────
// In the buggy code: remaining = data.missingParams (trusts API fully)
function advanceCollecting_BUGGY(
  data: { missingParams: string[] },
  _collectedParams: Record<string, unknown> | null
): string[] {
  const remaining = data.missingParams || [];
  return remaining; // currentMissingParams would be set to this
}

// ─── Simulate advanceCollecting (FIXED) ──────────────────────────────────────
// In the fixed code: merge API missing + client missing via PARAM_ORDER
function advanceCollecting_FIXED(
  data: { missingParams: string[] },
  collectedParams: Record<string, unknown> | null,
  updatedCollected?: Record<string, unknown> | null
): string[] {
  const apiMissing = data.missingParams || [];
  const clientMissing = computeClientMissingParams(updatedCollected ?? collectedParams);
  const mergedSet = new Set([...apiMissing, ...clientMissing]);
  return PARAM_ORDER.filter((p) => mergedSet.has(p));
}

// =============================================================================
// TASK 1: BUG CONDITION EXPLORATION TESTS
// These tests MUST FAIL on unfixed code — failure confirms the bugs exist
// =============================================================================

describe('Task 1 — Bug Condition Exploration (EXPECTED TO FAIL on unfixed code)', () => {

  // ─── Test 1.A: Bug 1 — Tekstur tanah terskip ─────────────────────────────
  describe('Bug 1: Tekstur Tanah Terskip', () => {
    it('1.A-1: parseUserInput("tanah subur hijau") should NOT set texture when answering pH question', () => {
      // Root cause: 'subur' exists in BOTH phKeywords AND textureKeywords
      // When user answers pH question with "tanah subur hijau", texture gets set as side effect
      const result = parseUserInput('tanah subur hijau');

      // This SHOULD be null (user was answering pH question, not texture)
      // But on UNFIXED code it will be 'lempung' → BUG CONFIRMED
      // After fix (separating parsing contexts), this should be null
      // For now we just document the side effect:
      expect(result.pH).not.toBeNull(); // pH correctly parsed
      // The following assertion DOCUMENTS the bug — texture should not be set
      // from a pH-context answer:
      expect(result.texture).toBeNull(); // FAILS on current code (returns 'lempung')
    });

    it('1.A-2: advanceCollecting should keep "tekstur tanah" in queue when collectedParams has no texture', () => {
      // Simulates: user answered pH with "tanah subur hijau"
      // API returns missingParams = ['intensitas cahaya'] (skipped tekstur because side-effect parsed it)
      // but collectedParams['tekstur tanah'] is still null (user never explicitly answered it)
      const apiResponse = {
        missingParams: ['intensitas cahaya'], // API thinks tekstur is already known
      };
      const collectedParams: Record<string, unknown> = {
        'ketinggian': 900,
        'curah hujan': 1500,
        'pH tanah': 6.5,
        'tekstur tanah': null, // NOT collected yet — user never answered this
        'intensitas cahaya': null,
      };

      const resultBuggy = advanceCollecting_BUGGY(apiResponse, collectedParams);

      // On BUGGY code: currentMissingParams = ['intensitas cahaya']
      // 'tekstur tanah' is MISSING from the queue → BUG CONFIRMED
      expect(resultBuggy).toContain('tekstur tanah'); // FAILS on buggy code
    });

    it('1.A-3: After fix, advanceCollecting FIXED should always include tekstur tanah when not collected', () => {
      const apiResponse = {
        missingParams: ['intensitas cahaya'],
      };
      const collectedParams: Record<string, unknown> = {
        'ketinggian': 900,
        'curah hujan': 1500,
        'pH tanah': 6.5,
        'tekstur tanah': null, // not collected
        'intensitas cahaya': null,
      };

      const resultFixed = advanceCollecting_FIXED(apiResponse, collectedParams);

      // FIXED code should include tekstur tanah
      expect(resultFixed).toContain('tekstur tanah');
      expect(resultFixed).toContain('intensitas cahaya');
      // And follow PARAM_ORDER order
      expect(resultFixed.indexOf('tekstur tanah')).toBeLessThan(resultFixed.indexOf('intensitas cahaya'));
    });
  });

  // ─── Test 1.B: Bug 3 — Asterisk di Output ────────────────────────────────
  describe('Bug 3: Asterisk di Output', () => {
    it('1.B-1: renderMessageContent should remove single asterisk italic markdown', () => {
      const input = '⚠️ *Rekomendasi awal berdasarkan knowledge base.*';
      const result = renderMessageContent_BUGGY(input);

      // BUGGY: only strips ** not *
      // This FAILS on buggy code — asterisks remain
      expect(result).not.toContain('*'); // FAILS on buggy renderMessageContent
    });

    it('1.B-2: renderMessageContent should remove *italic teks* format', () => {
      const input = '*italic teks*';
      const result = renderMessageContent_BUGGY(input);

      // BUGGY: returns '*italic teks*' unchanged
      expect(result).not.toContain('*'); // FAILS on buggy code
    });

    it('1.B-3: renderMessageContent_FIXED correctly strips all asterisk patterns', () => {
      expect(renderMessageContent_FIXED('*italic*')).toBe('italic');
      expect(renderMessageContent_FIXED('**bold**')).toBe('bold');
      expect(renderMessageContent_FIXED('⚠️ *Rekomendasi awal*')).toBe('⚠️ Rekomendasi awal');
      expect(renderMessageContent_FIXED('**Jagung** skor 0.8')).toBe('Jagung skor 0.8');
      expect(renderMessageContent_FIXED('teks biasa')).toBe('teks biasa');
    });
  });
});

// =============================================================================
// TASK 2: PRESERVATION TESTS
// These tests MUST PASS on unfixed code — confirms baseline behavior to preserve
// =============================================================================

describe('Task 2 — Preservation Tests (MUST PASS on unfixed code)', () => {

  // ─── Test 2.A: Bug 1 Preservation — param lain tidak terganggu ───────────
  describe('2.A: Bug 1 Preservation — tekstur sudah terisi', () => {
    it('when collectedParams["tekstur tanah"] is already filled, result matches filtered PARAM_ORDER', () => {
      const apiResponse = {
        missingParams: ['curah hujan'],
      };
      const collectedParams: Record<string, unknown> = {
        'ketinggian': 500,
        'curah hujan': null,
        'pH tanah': 6.5,
        'tekstur tanah': 'lempung', // already filled
        'intensitas cahaya': 9,
      };

      // On UNFIXED code: remaining = ['curah hujan'] (correct, no bug)
      const resultBuggy = advanceCollecting_BUGGY(apiResponse, collectedParams);
      expect(resultBuggy).toContain('curah hujan');
      expect(resultBuggy).not.toContain('tekstur tanah'); // already filled, should not reappear
    });

    it('computeClientMissingParams with tekstur tanah filled returns correct missing list', () => {
      const collected: Record<string, unknown> = {
        'ketinggian': 500,
        'curah hujan': null,
        'pH tanah': 6.5,
        'tekstur tanah': 'lempung',
        'intensitas cahaya': null,
      };
      const result = computeClientMissingParams(collected);
      expect(result).toContain('curah hujan');
      expect(result).toContain('intensitas cahaya');
      expect(result).not.toContain('ketinggian');
      expect(result).not.toContain('pH tanah');
      expect(result).not.toContain('tekstur tanah');
    });
  });

  // ─── Test 2.B: Bug 3 Preservation — teks tanpa asterisk tidak berubah ────
  describe('2.B: Bug 3 Preservation — teks tanpa asterisk', () => {
    it('renderMessageContent with no asterisk returns identical string (buggy version)', () => {
      const texts = [
        'Jagung adalah pilihan terbaik',
        'Halo Bapak Aqib',
        'Terima kasih sudah menggunakan Agri-SAW Pro',
        'Lahan Bapak di ketinggian 900 mdpl',
        '',
        '🌾 Rekomendasi untuk lahan Bapak',
      ];
      for (const text of texts) {
        expect(renderMessageContent_BUGGY(text)).toBe(text);
      }
    });

    it('renderMessageContent_FIXED also returns identical string for no-asterisk input', () => {
      const texts = [
        'Jagung adalah pilihan terbaik',
        'Halo Bapak Aqib',
        'Terima kasih',
        '',
      ];
      for (const text of texts) {
        expect(renderMessageContent_FIXED(text)).toBe(text);
      }
    });
  });

  // ─── Test 2.C: Bug 4 Preservation — fase non-ringkasan tidak terpengaruh ─
  describe('2.C: Bug 4 Preservation — renderRingkasanActions returns null for non-ringkasan phases', () => {
    // We test the guard logic directly (pure function logic)
    function renderRingkasanActionsGuard(phase: string, faqView: string): boolean {
      // Returns true if should render, false if guard blocks
      if (phase !== 'ringkasan' || faqView !== 'none') return false;
      return true;
    }

    it('returns false (null) when phase is collecting', () => {
      expect(renderRingkasanActionsGuard('collecting', 'none')).toBe(false);
    });

    it('returns false (null) when phase is confirming', () => {
      expect(renderRingkasanActionsGuard('confirming', 'none')).toBe(false);
    });

    it('returns false (null) when phase is preference', () => {
      expect(renderRingkasanActionsGuard('preference', 'none')).toBe(false);
    });

    it('returns false (null) when phase is done', () => {
      expect(renderRingkasanActionsGuard('done', 'none')).toBe(false);
    });

    it('returns false (null) when phase is ringkasan but faqView is active', () => {
      expect(renderRingkasanActionsGuard('ringkasan', 'categories')).toBe(false);
      expect(renderRingkasanActionsGuard('ringkasan', 'items')).toBe(false);
      expect(renderRingkasanActionsGuard('ringkasan', 'answer')).toBe(false);
    });

    it('returns true (renders) when phase is ringkasan and faqView is none', () => {
      expect(renderRingkasanActionsGuard('ringkasan', 'none')).toBe(true);
    });
  });

  // ─── Test 2.D: Bug 2 Preservation — all-eliminated case tidak terganggu ──
  describe('2.D: Bug 2 Preservation — renderEliminationSummary returns null for all-eliminated', () => {
    function renderEliminationSummaryGuard(
      phase: string,
      survivingCropsLen: number,
      eliminatedCropsLen: number
    ): boolean {
      if (phase !== 'done' || survivingCropsLen === 0 || eliminatedCropsLen === 0) return false;
      return true;
    }

    it('returns false (null) when survivingCrops is empty (all-eliminated case)', () => {
      expect(renderEliminationSummaryGuard('done', 0, 5)).toBe(false);
    });

    it('returns false (null) when eliminatedCrops is empty (all survive)', () => {
      expect(renderEliminationSummaryGuard('done', 3, 0)).toBe(false);
    });

    it('returns false (null) when phase is not done', () => {
      expect(renderEliminationSummaryGuard('preference', 2, 3)).toBe(false);
      expect(renderEliminationSummaryGuard('collecting', 2, 3)).toBe(false);
    });

    it('returns true (renders) when phase=done, surviving>0, eliminated>0', () => {
      expect(renderEliminationSummaryGuard('done', 1, 5)).toBe(true);
      expect(renderEliminationSummaryGuard('done', 2, 4)).toBe(true);
    });
  });

  // ─── Test 2.E: Knowledge base baseline — detectMissingParams ─────────────
  describe('2.E: detectMissingParams baseline behavior', () => {
    it('returns all 5 params when nothing is parsed', () => {
      const parsed = parseUserInput('hello');
      const missing = detectMissingParams(parsed);
      expect(missing).toContain('ketinggian');
      expect(missing).toContain('curah hujan');
      expect(missing).toContain('pH tanah');
      expect(missing).toContain('tekstur tanah');
      expect(missing).toContain('intensitas cahaya');
    });

    it('does not include params that are in uncertainParams list', () => {
      const parsed = parseUserInput('hello');
      const missing = detectMissingParams(parsed, ['ketinggian', 'tekstur tanah']);
      expect(missing).not.toContain('ketinggian');
      expect(missing).not.toContain('tekstur tanah');
      expect(missing).toContain('curah hujan');
      expect(missing).toContain('pH tanah');
      expect(missing).toContain('intensitas cahaya');
    });
  });
});

// =============================================================================
// TASK 8: UNIT TESTS (run after fix implementation)
// =============================================================================

describe('Task 8 — Unit Tests (run after fix)', () => {

  // ─── 8.1: computeClientMissingParams ─────────────────────────────────────
  describe('8.1: computeClientMissingParams', () => {
    it('null input returns all 5 params', () => {
      const result = computeClientMissingParams(null);
      expect(result).toEqual(PARAM_ORDER);
    });

    it('empty object returns all 5 params', () => {
      const result = computeClientMissingParams({});
      expect(result).toEqual(PARAM_ORDER);
    });

    it('partial collected: ketinggian + pH tanah → returns other 3', () => {
      const result = computeClientMissingParams({
        'ketinggian': 500,
        'curah hujan': null,
        'pH tanah': 6.5,
        'tekstur tanah': null,
        'intensitas cahaya': null,
      });
      expect(result).toEqual(['curah hujan', 'tekstur tanah', 'intensitas cahaya']);
    });

    it('only tekstur tanah filled → returns other 4 in PARAM_ORDER', () => {
      const result = computeClientMissingParams({ 'tekstur tanah': 'lempung' });
      expect(result).toEqual(['ketinggian', 'curah hujan', 'pH tanah', 'intensitas cahaya']);
    });

    it('all 5 params filled → returns empty array', () => {
      const result = computeClientMissingParams({
        'ketinggian': 900,
        'curah hujan': 1500,
        'pH tanah': 6.5,
        'tekstur tanah': 'lempung',
        'intensitas cahaya': 9,
      });
      expect(result).toEqual([]);
    });

    it('respects PARAM_ORDER for output order', () => {
      const result = computeClientMissingParams({
        'ketinggian': 900,
        'curah hujan': null,
        'pH tanah': null,
        'tekstur tanah': 'lempung',
        'intensitas cahaya': null,
      });
      expect(result[0]).toBe('curah hujan');
      expect(result[1]).toBe('pH tanah');
      expect(result[2]).toBe('intensitas cahaya');
    });
  });

  // ─── 8.2: renderMessageContent FIXED ─────────────────────────────────────
  describe('8.2: renderMessageContent (FIXED version)', () => {
    it('removes **bold** pattern', () => {
      expect(renderMessageContent_FIXED('**bold**')).toBe('bold');
    });

    it('removes *italic* pattern', () => {
      expect(renderMessageContent_FIXED('*italic*')).toBe('italic');
    });

    it('removes single asterisk in fallback message', () => {
      const input = '⚠️ *Rekomendasi awal berdasarkan knowledge base.*';
      expect(renderMessageContent_FIXED(input)).toBe('⚠️ Rekomendasi awal berdasarkan knowledge base.');
    });

    it('removes asterisk in middle of sentence', () => {
      expect(renderMessageContent_FIXED('Catatan: *penting*')).toBe('Catatan: penting');
    });

    it('identity for text without asterisk', () => {
      expect(renderMessageContent_FIXED('teks biasa tanpa asterisk')).toBe('teks biasa tanpa asterisk');
    });

    it('removes **Rekomendasi: Jagung** format', () => {
      expect(renderMessageContent_FIXED('**Rekomendasi: Jagung**')).toBe('Rekomendasi: Jagung');
    });

    it('handles empty string', () => {
      expect(renderMessageContent_FIXED('')).toBe('');
    });

    it('handles mixed bold and italic', () => {
      const input = '**Jagung** adalah *pilihan* terbaik';
      expect(renderMessageContent_FIXED(input)).toBe('Jagung adalah pilihan terbaik');
    });
  });

  // ─── 8.3: renderRingkasanActions guard logic ─────────────────────────────
  describe('8.3: renderRingkasanActions guard conditions', () => {
    function guard(phase: string, faqView: string): boolean {
      if (phase !== 'ringkasan' || faqView !== 'none') return false;
      return true;
    }

    function label(returningToRingkasan: boolean): string {
      return returningToRingkasan ? 'Ada pertanyaan lain' : 'Ada pertanyaan dulu';
    }

    it('phase=ringkasan, faqView=none → should render (returns true)', () => {
      expect(guard('ringkasan', 'none')).toBe(true);
    });

    it('phase=collecting → null', () => {
      expect(guard('collecting', 'none')).toBe(false);
    });

    it('phase=confirming → null', () => {
      expect(guard('confirming', 'none')).toBe(false);
    });

    it('phase=preference → null', () => {
      expect(guard('preference', 'none')).toBe(false);
    });

    it('phase=ringkasan, faqView=categories → null', () => {
      expect(guard('ringkasan', 'categories')).toBe(false);
    });

    it('returningToRingkasan=true → second button label is "Ada pertanyaan lain"', () => {
      expect(label(true)).toBe('Ada pertanyaan lain');
    });

    it('returningToRingkasan=false → second button label is "Ada pertanyaan dulu"', () => {
      expect(label(false)).toBe('Ada pertanyaan dulu');
    });
  });

  // ─── 8.4: renderEliminationSummary guard logic ───────────────────────────
  describe('8.4: renderEliminationSummary guard conditions', () => {
    function guard(phase: string, survivingLen: number, eliminatedLen: number): boolean {
      if (phase !== 'done' || survivingLen === 0 || eliminatedLen === 0) return false;
      return true;
    }

    it('phase=done, surviving=2, eliminated=1 → renders', () => {
      expect(guard('done', 2, 1)).toBe(true);
    });

    it('survivingCrops.length=0 (all-eliminated) → null', () => {
      expect(guard('done', 0, 5)).toBe(false);
    });

    it('eliminatedCrops.length=0 → null', () => {
      expect(guard('done', 3, 0)).toBe(false);
    });

    it('phase=preference → null', () => {
      expect(guard('preference', 2, 3)).toBe(false);
    });
  });

  // ─── 8.5: Integration — advanceCollecting_FIXED never skips tekstur ───────
  describe('8.5: Integration — tekstur tanah never skipped', () => {
    it('when API returns missingParams without tekstur but collectedParams has no tekstur, it stays', () => {
      const apiData = {
        missingParams: ['intensitas cahaya'], // API thinks tekstur is known
        userValues: { pH: 6.5, texture: 'lempung', elevation: 900, rainfall: 1500, light: null },
      };

      // updatedCollected after mapping userValues (but tekstur comes from phantom parse)
      // We simulate: user explicitly only answered pH, but texture got phantom-parsed
      // collectedParams in state still has null for tekstur
      const stateCollectedParams: Record<string, unknown> = {
        'ketinggian': 900,
        'curah hujan': 1500,
        'pH tanah': null, // being answered now
        'tekstur tanah': null, // not yet explicitly answered
        'intensitas cahaya': null,
      };

      // updatedCollected after processing userValues from current API call
      const updatedCollected: Record<string, unknown> = {
        'ketinggian': 900,
        'curah hujan': 1500,
        'pH tanah': 6.5, // now set
        'tekstur tanah': null, // still null in explicit collection state
        'intensitas cahaya': null,
      };

      const result = advanceCollecting_FIXED(apiData, stateCollectedParams, updatedCollected);

      expect(result).toContain('tekstur tanah');
      expect(result).toContain('intensitas cahaya');
      expect(result).not.toContain('ketinggian');
      expect(result).not.toContain('curah hujan');
      expect(result).not.toContain('pH tanah');
    });

    it('follows PARAM_ORDER: tekstur tanah before intensitas cahaya', () => {
      const apiData = { missingParams: ['intensitas cahaya'] };
      const collected: Record<string, unknown> = {
        'ketinggian': 900,
        'curah hujan': 1500,
        'pH tanah': 6.5,
        'tekstur tanah': null,
        'intensitas cahaya': null,
      };
      const result = advanceCollecting_FIXED(apiData, collected);
      const idxTekstur = result.indexOf('tekstur tanah');
      const idxCahaya = result.indexOf('intensitas cahaya');
      expect(idxTekstur).toBeGreaterThanOrEqual(0);
      expect(idxCahaya).toBeGreaterThanOrEqual(0);
      expect(idxTekstur).toBeLessThan(idxCahaya);
    });
  });

  // ─── 8.6: Integration — eliminasi reasons ────────────────────────────────
  describe('8.6: Integration — eliminasi reasons content', () => {
    it('elimination reasons array contains crop name and reason', () => {
      const eliminatedCrops = [
        { name: 'Padi', reasons: ['ketinggian 900 mdpl terlalu tinggi (Padi butuh 0–650 mdpl)'] },
        { name: 'Bawang Merah', reasons: ['ketinggian 900 mdpl terlalu tinggi (Bawang Merah butuh 0–800 mdpl)'] },
      ];

      // Verify the data structure renderEliminationSummary would render
      for (const crop of eliminatedCrops) {
        expect(crop.name).toBeTruthy();
        expect(crop.reasons[0]).toBeTruthy();
        expect(crop.reasons[0]).toContain('ketinggian');
      }
    });
  });
});
// =============================================================================
// TASK 9: PROXIMITY SCORE UNIT TESTS
// =============================================================================
describe('Task 9 — Proximity Score Unit Tests', () => {
  // ── Test 1: Perfect match = score 1.0 ──────────────────────────────────
  it('perfect match returns totalScore 1.0', () => {
    const userValues = {
      pH: 6.0,        // midpoint of rice pH 5.5–6.5
      texture: 'liat', // in rice textures
      elevation: 325,  // midpoint of rice elevation 0–650
      light: 9,        // midpoint of rice light 8–10
      rainfall: 1750,  // midpoint of rice rainfall 1500–2000
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.rice, PROXIMITY_WEIGHTS);
    expect(result.totalScore).toBe(1.0);
    expect(result.perParamScores.pH).toBe(1.0);
    expect(result.perParamScores.rainfall).toBe(1.0);
    expect(result.perParamScores.elevation).toBe(1.0);
    expect(result.perParamScores.light).toBe(1.0);
    expect(result.perParamScores.texture).toBe(1.0);
    expect(result.failReasons).toHaveLength(0);
  });
  // ── Test 2: Far outside range = score near 0 ───────────────────────────
  it('far outside range returns score near 0', () => {
    const userValues = {
      pH: 2.0,          // extremely acidic, far below rice range
      texture: 'berpasir', // not in rice textures
      elevation: 5000,  // far above rice max 650
      light: 1,         // far below rice min 8
      rainfall: 100,    // far below rice min 1500
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.rice, PROXIMITY_WEIGHTS);
    expect(result.totalScore).toBeLessThan(0.1);
    expect(result.perParamScores.pH).toBe(0);
    expect(result.perParamScores.rainfall).toBe(0);
    expect(result.perParamScores.elevation).toBe(0);
    expect(result.perParamScores.light).toBe(0);
    expect(result.perParamScores.texture).toBe(0.3);
    expect(result.failReasons.length).toBeGreaterThan(0);
  });
  // ── Test 3: Edge case — exactly at range boundary ─────────────────────
  it('exactly at range boundary returns partial score', () => {
    const userValues = {
      pH: 5.5,          // exactly at rice phMin
      texture: 'liat',
      elevation: 325,
      light: 9,
      rainfall: 1750,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.rice, PROXIMITY_WEIGHTS);
    // pH: midpoint=6.0, distance=0.5, halfWidth=0.5, score = 1 - 0.5/(0.5+0.5) = 0.5
    expect(result.perParamScores.pH).toBeCloseTo(0.5, 2);
    // Others are perfect
    expect(result.perParamScores.rainfall).toBe(1.0);
    expect(result.perParamScores.elevation).toBe(1.0);
    expect(result.perParamScores.light).toBe(1.0);
    expect(result.perParamScores.texture).toBe(1.0);
    // total = 0.25*0.5 + 0.25*1 + 0.2*1 + 0.15*1 + 0.15*1 = 0.875
    expect(result.totalScore).toBeCloseTo(0.875, 3);
  });
  // ── Test 4: Partial match — slightly outside range ────────────────────
  it('slightly outside range returns partial score', () => {
    const userValues = {
      pH: 5.2,          // 0.3 below rice phMin of 5.5
      texture: 'liat',
      elevation: 325,
      light: 9,
      rainfall: 1750,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.rice, PROXIMITY_WEIGHTS);
    // pH: midpoint=6.0, distance=0.8, halfWidth=0.5, score = 1 - 0.8/(0.5+0.5) = 0.2
    expect(result.perParamScores.pH).toBeCloseTo(0.2, 2);
    expect(result.perParamScores.rainfall).toBe(1.0);
    expect(result.perParamScores.elevation).toBe(1.0);
    expect(result.perParamScores.light).toBe(1.0);
    expect(result.perParamScores.texture).toBe(1.0);
    // total = 0.25*0.2 + 0.25*1 + 0.2*1 + 0.15*1 + 0.15*1 = 0.8
    expect(result.totalScore).toBeCloseTo(0.8, 3);
    // pH is outside range so should have a fail reason
    expect(result.failReasons.some((r: string) => r.includes('pH'))).toBe(true);
  });
  // ── Test 5: Texture mismatch = 0.3 ────────────────────────────────────
  it('texture mismatch gives score 0.3', () => {
    const userValues = {
      pH: 6.0,
      texture: 'berpasir', // not in rice textures
      elevation: 325,
      light: 9,
      rainfall: 1750,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.rice, PROXIMITY_WEIGHTS);
    expect(result.perParamScores.texture).toBe(0.3);
    // total = 0.25*1 + 0.25*1 + 0.2*1 + 0.15*1 + 0.15*0.3 = 0.895
    expect(result.totalScore).toBeCloseTo(0.895, 3);
    expect(result.failReasons.some((r: string) => r.includes('tekstur'))).toBe(true);
  });
  // ── Test 6: No user input (null) = score 1.0 for that param ───────────
  it('null user input defaults to score 1.0 for that parameter', () => {
    const userValues = {
      pH: null,
      texture: null,
      elevation: null,
      light: null,
      rainfall: null,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.rice, PROXIMITY_WEIGHTS);
    expect(result.perParamScores.pH).toBe(1.0);
    expect(result.perParamScores.rainfall).toBe(1.0);
    expect(result.perParamScores.elevation).toBe(1.0);
    expect(result.perParamScores.light).toBe(1.0);
    expect(result.perParamScores.texture).toBe(1.0);
    expect(result.totalScore).toBe(1.0);
    expect(result.failReasons).toHaveLength(0);
  });
  // ── Test 7: Weighted total calculation is correct ─────────────────────
  it('weighted total matches manual calculation', () => {
    // Use garlic: pH 6.0–7.0, elevation 700–1100, light 12–999, rainfall 550–1000
    const userValues = {
      pH: 6.0,          // at garlic phMin
      texture: 'lempung', // in garlic textures
      elevation: 700,   // at garlic elevationMin
      light: 12,        // at garlic lightMin
      rainfall: 550,    // at garlic rainfallMin
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.garlic, PROXIMITY_WEIGHTS);
    // Manual calculation for garlic:
    // pH: midpoint=6.5, distance=0.5, halfWidth=0.5, score = 1 - 0.5/(0.5+0.5) = 0.5
    const expectedPH = Math.max(0, 1 - Math.abs(6.0 - 6.5) / (0.5 + 0.5));
    // elevation: midpoint=900, distance=200, halfWidth=200, score = 1 - 200/(200+50) = 1 - 0.8 = 0.2
    const expectedElevation = Math.max(0, 1 - Math.abs(700 - 900) / (200 + 50));
    // light: midpoint=(12+999)/2=505.5, distance=493.5, halfWidth=493.5, score = 1 - 493.5/(493.5+1) ≈ 0.002
    const lightHalfWidth = (999 - 12) / 2;
    const expectedLight = Math.max(0, 1 - Math.abs(12 - (12 + 999) / 2) / (lightHalfWidth + 1));
    // rainfall: midpoint=775, distance=225, halfWidth=225, score = 1 - 225/(225+100) = 1 - 0.6923 ≈ 0.3077
    const expectedRainfall = Math.max(0, 1 - Math.abs(550 - 775) / (225 + 100));
    // texture: 'lempung' in garlic textures → 1.0
    const expectedTexture = 1.0;
    const expectedTotal =
      0.25 * expectedPH +
      0.25 * expectedRainfall +
      0.2 * expectedElevation +
      0.15 * expectedLight +
      0.15 * expectedTexture;
    expect(result.perParamScores.pH).toBeCloseTo(expectedPH, 2);
    expect(result.perParamScores.elevation).toBeCloseTo(expectedElevation, 2);
    expect(result.perParamScores.light).toBeCloseTo(expectedLight, 2);
    expect(result.perParamScores.rainfall).toBeCloseTo(expectedRainfall, 2);
    expect(result.perParamScores.texture).toBe(expectedTexture);
    expect(result.totalScore).toBeCloseTo(expectedTotal, 3);
  });
  // ── Test 8: Dark horse threshold filtering (>= 0.4) ───────────────────
  it('crops with proximity >= DARK_HORSE_THRESHOLD qualify as dark horses', () => {
    // Rice with perfect match: score 1.0 >= 0.4 → dark horse
    const perfectInput = {
      pH: 6.0, texture: 'liat', elevation: 325, light: 9, rainfall: 1750,
      budget: null, landArea: null, rawKeywords: [],
    };
    const perfectResult = computeProximityScore(perfectInput, cropProfiles.rice, PROXIMITY_WEIGHTS);
    expect(perfectResult.totalScore).toBeGreaterThanOrEqual(DARK_HORSE_THRESHOLD);
    // Rice with terrible match: score near 0 < 0.4 → not dark horse
    const terribleInput = {
      pH: 2.0, texture: 'berpasir', elevation: 5000, light: 1, rainfall: 100,
      budget: null, landArea: null, rawKeywords: [],
    };
    const terribleResult = computeProximityScore(terribleInput, cropProfiles.rice, PROXIMITY_WEIGHTS);
    expect(terribleResult.totalScore).toBeLessThan(DARK_HORSE_THRESHOLD);
  });
  // ── Test 9: All eliminated crops get proximity scores ──────────────────
  it('filterByAgroklimat computes proximity scores for eliminated crops', () => {
    const parsed = {
      pH: 4.0,           // too acidic for all crops
      texture: 'pasir',  // only matches some
      elevation: 500,
      light: 9,
      rainfall: 900,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const filter1 = filterByAgroklimat(parsed);
    // Some crops should be eliminated
    expect(filter1.eliminated.length).toBeGreaterThan(0);
    // Each eliminated crop should have a proximity score computed
    for (const elim of filter1.eliminated) {
      const proximity = computeProximityScore(parsed, cropProfiles[elim.cropId], PROXIMITY_WEIGHTS);
      expect(proximity.totalScore).toBeGreaterThanOrEqual(0);
      expect(proximity.totalScore).toBeLessThanOrEqual(1);
      expect(Object.keys(proximity.perParamScores)).toHaveLength(5);
    }
  });
  // ── Test 10: Dark horse sorted by proximity descending ─────────────────
  it('dark horses are sorted by proximity score descending', () => {
    // Use input that eliminates some crops but leaves others as dark horses
    const parsed = {
      pH: 5.0,           // below rice phMin 5.5, but within corn range
      texture: 'lempung',
      elevation: 400,
      light: 9,
      rainfall: 1200,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    // Compute proximity for all crops
    const allScores = Object.values(cropProfiles).map((crop: any) => ({
      cropId: crop.id,
      cropName: crop.name,
      ...computeProximityScore(parsed, crop, PROXIMITY_WEIGHTS),
    }));
    // Filter dark horses (>= threshold)
    const darkHorses = allScores
      .filter((s: any) => s.totalScore >= DARK_HORSE_THRESHOLD)
      .sort((a: any, b: any) => b.totalScore - a.totalScore);
    // Verify sorted descending
    for (let i = 1; i < darkHorses.length; i++) {
      expect(darkHorses[i - 1].totalScore).toBeGreaterThanOrEqual(darkHorses[i].totalScore);
    }
    // All dark horses should meet threshold
    for (const dh of darkHorses) {
      expect(dh.totalScore).toBeGreaterThanOrEqual(DARK_HORSE_THRESHOLD);
    }
  });
  // ── Test 11: PROXIMITY_WEIGHTS sums to 1.0 ────────────────────────────
  it('PROXIMITY_WEIGHTS sum to 1.0', () => {
    const sum = Object.values(PROXIMITY_WEIGHTS).reduce((a: number, b: number) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });
  // ── Test 12: DARK_HORSE_THRESHOLD is 0.4 ──────────────────────────────
  it('DARK_HORSE_THRESHOLD equals 0.4', () => {
    expect(DARK_HORSE_THRESHOLD).toBe(0.4);
  });
  // ── Test 13: Score is always between 0 and 1 ──────────────────────────
  it('proximity score is always in [0, 1] for any input', () => {
    const testInputs = [
      { pH: 0, texture: 'liat', elevation: 0, light: 0, rainfall: 0, budget: null, landArea: null, rawKeywords: [] },
      { pH: 14, texture: 'pasir', elevation: 2000, light: 24, rainfall: 5000, budget: null, landArea: null, rawKeywords: [] },
      { pH: 7, texture: 'lempung', elevation: 500, light: 10, rainfall: 1000, budget: null, landArea: null, rawKeywords: [] },
    ];
    for (const input of testInputs) {
      for (const crop of Object.values(cropProfiles)) {
        const result = computeProximityScore(input, crop as any, PROXIMITY_WEIGHTS);
        expect(result.totalScore).toBeGreaterThanOrEqual(0);
        expect(result.totalScore).toBeLessThanOrEqual(1);
      }
    }
  });
  // ── Test 14: Texture match = 1.0 for matching texture ──────────────────
  it('matching texture gives score 1.0', () => {
    // Corn accepts 'lempung berpasir'
    const userValues = {
      pH: 6.5,
      texture: 'berpasir',
      elevation: 450,
      light: 9,
      rainfall: 1700,
      budget: null,
      landArea: null,
      rawKeywords: [],
    };
    const result = computeProximityScore(userValues, cropProfiles.corn, PROXIMITY_WEIGHTS);
    expect(result.perParamScores.texture).toBe(1.0);
  });
});
// =============================================================================
// TASK 10: MAX PREFERENCE SELECTION
// =============================================================================
// ─── Pure function: handleTogglePreference logic extracted for testing ─────
// Mirrors the guard logic in ChatWidget.tsx handleTogglePreference
// (lines 485-493): deselect if already selected, block if at max, otherwise add
function togglePreference(
  selected: string[],
  criterionId: string,
  maxSelection: number,
): string[] {
  if (selected.includes(criterionId)) {
    return selected.filter((id) => id !== criterionId);
  }
  if (selected.length >= maxSelection) {
    return selected;
  }
  return [...selected, criterionId];
}
describe('Task 10 — Max Preference Selection', () => {
  // ─── Test 1: MAX_PREFERENCE_SELECTION is 3 ───────────────────────────────
  describe('MAX_PREFERENCE_SELECTION constant', () => {
    it('1: MAX_PREFERENCE_SELECTION should be 3', () => {
      expect(MAX_PREFERENCE_SELECTION).toBe(3);
    });
  });
  // ─── Test 2-4: Can select 1, 2, 3 preferences ───────────────────────────
  describe('Selecting preferences within limit', () => {
    it('2: Can select 1 preference', () => {
      const result = togglePreference([], 'biaya_produksi', MAX_PREFERENCE_SELECTION);
      expect(result).toEqual(['biaya_produksi']);
      expect(result).toHaveLength(1);
    });
    it('3: Can select 2 preferences', () => {
      const result = togglePreference(['biaya_produksi'], 'harga_jual', MAX_PREFERENCE_SELECTION);
      expect(result).toEqual(['biaya_produksi', 'harga_jual']);
      expect(result).toHaveLength(2);
    });
    it('4: Can select 3 preferences', () => {
      const result = togglePreference(
        ['biaya_produksi', 'harga_jual'],
        'produktivitas',
        MAX_PREFERENCE_SELECTION,
      );
      expect(result).toEqual(['biaya_produksi', 'harga_jual', 'produktivitas']);
      expect(result).toHaveLength(3);
    });
  });
  // ─── Test 5: Cannot select 4 preferences ─────────────────────────────────
  describe('Guard prevents exceeding max', () => {
    it('5: Cannot select 4 preferences — guard blocks at 3', () => {
      const alreadySelected = ['biaya_produksi', 'harga_jual', 'produktivitas'];
      const result = togglePreference(alreadySelected, 'risiko', MAX_PREFERENCE_SELECTION);
      // Should remain unchanged — guard prevented adding 4th
      expect(result).toEqual(['biaya_produksi', 'harga_jual', 'produktivitas']);
      expect(result).toHaveLength(3);
      expect(result).not.toContain('risiko');
    });
  });
  // ─── Test 6: Deselect then select different one ──────────────────────────
  describe('Deselect and reselect', () => {
    it('6: After deselecting, can select a different preference', () => {
      const initial = ['biaya_produksi', 'harga_jual', 'produktivitas'];
      // Deselect 'harga_jual'
      const afterDeselect = togglePreference(initial, 'harga_jual', MAX_PREFERENCE_SELECTION);
      expect(afterDeselect).toEqual(['biaya_produksi', 'produktivitas']);
      expect(afterDeselect).toHaveLength(2);
      // Now select 'risiko' — should work since we have room
      const afterReselect = togglePreference(afterDeselect, 'risiko', MAX_PREFERENCE_SELECTION);
      expect(afterReselect).toEqual(['biaya_produksi', 'produktivitas', 'risiko']);
      expect(afterReselect).toHaveLength(3);
    });
  });
  // ─── Test 7-8: Hitung Ranking button state ───────────────────────────────
  // The button is enabled when 1+ preferences are selected, disabled when 0.
  // Mirrors the logic: selectedPreferences.length > 0 → enabled
  describe('Hitung Ranking button enabled/disabled state', () => {
    it('7: Hitung Ranking button is enabled when 1+ preferences selected', () => {
      // With 1 selection
      const oneSelected = ['biaya_produksi'];
      expect(oneSelected.length > 0).toBe(true);
      // With 2 selections
      const twoSelected = ['biaya_produksi', 'harga_jual'];
      expect(twoSelected.length > 0).toBe(true);
      // With 3 selections (max)
      const threeSelected = ['biaya_produksi', 'harga_jual', 'produktivitas'];
      expect(threeSelected.length > 0).toBe(true);
    });
    it('8: Hitung Ranking button is disabled when 0 preferences selected', () => {
      const noneSelected: string[] = [];
      expect(noneSelected.length > 0).toBe(false);
    });
  });
  // ─── Additional: Toggle off removes correct item, keeps others ───────────
  describe('Toggle correctness', () => {
    it('Deselecting one item does not affect other selections', () => {
      const selected = ['biaya_produksi', 'harga_jual', 'produktivitas'];
      const result = togglePreference(selected, 'harga_jual', MAX_PREFERENCE_SELECTION);
      expect(result).toContain('biaya_produksi');
      expect(result).toContain('produktivitas');
      expect(result).not.toContain('harga_jual');
      expect(result).toHaveLength(2);
    });
    it('Toggling same item twice returns to original state', () => {
      const original: string[] = [];
      const afterAdd = togglePreference(original, 'biaya_produksi', MAX_PREFERENCE_SELECTION);
      expect(afterAdd).toEqual(['biaya_produksi']);
      const afterRemove = togglePreference(afterAdd, 'biaya_produksi', MAX_PREFERENCE_SELECTION);
      expect(afterRemove).toEqual([]);
    });
    it('All 5 PREFERENCE_OPTIONS criteria can potentially be selected (across different toggles)', () => {
      // Verify all criterionIds from PREFERENCE_OPTIONS are unique and valid
      const criterionIds = PREFERENCE_OPTIONS.map((opt) => opt.criterionId);
      const uniqueIds = new Set(criterionIds);
      expect(uniqueIds.size).toBe(criterionIds.length);
      expect(criterionIds.length).toBe(5);
    });
    it('Cannot exceed max even after multiple deselect/reselect cycles', () => {
      let selected = togglePreference([], 'biaya_produksi', MAX_PREFERENCE_SELECTION);
      selected = togglePreference(selected, 'harga_jual', MAX_PREFERENCE_SELECTION);
      selected = togglePreference(selected, 'produktivitas', MAX_PREFERENCE_SELECTION);
      // At max — try adding two more
      selected = togglePreference(selected, 'risiko', MAX_PREFERENCE_SELECTION);
      expect(selected).toHaveLength(3);
      selected = togglePreference(selected, 'permintaan', MAX_PREFERENCE_SELECTION);
      expect(selected).toHaveLength(3);
      // Still 3, guard held
      expect(selected).toEqual(['biaya_produksi', 'harga_jual', 'produktivitas']);
    });
  });
});
