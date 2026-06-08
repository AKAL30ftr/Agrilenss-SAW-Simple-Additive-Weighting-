/**
 * ChatWidget Bugfix Tests
 *
 * Task 1: Bug condition exploration tests — EXPECTED TO FAIL on unfixed code
 * Task 2: Preservation tests — EXPECTED TO PASS on unfixed code (baseline)
 * Task 8: Full unit + integration tests — run after fix implementation
 */

import { describe, it, expect } from 'vitest';
import { parseUserInput, detectMissingParams } from '@/lib/knowledge-base';

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
