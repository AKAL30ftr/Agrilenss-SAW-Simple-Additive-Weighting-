import { POST } from '@/app/api/recommend/route';
import { NextRequest } from 'next/server';

/**
 * Integration tests for POST /api/recommend
 *
 * Tests the full API route handler by constructing NextRequest objects
 * and verifying the NextResponse output covers all major branches.
 */

// Helper to create a NextRequest with a JSON body
function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/recommend — Integration Tests', () => {
  // ── Branch 1: Empty input → 400 ──────────────────────────────────
  describe('empty input', () => {
    it('returns 400 when message is empty string', async () => {
      const res = await POST(createRequest({ message: '' }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Pesan tidak boleh kosong');
    });

    it('returns 400 when message is whitespace only', async () => {
      const res = await POST(createRequest({ message: '   ' }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when message is missing', async () => {
      const res = await POST(createRequest({}));
      expect(res.status).toBe(400);
    });
  });

  // ── Branch 2: Missing params → follow-up question ─────────────────
  describe('missing params → follow-up', () => {
    it('returns follow-up question when only elevation is provided', async () => {
      const res = await POST(createRequest({ message: 'saya di dataran tinggi 1500 mdpl' }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBe('follow-up');
      expect(json.followUpQuestion).toBeTruthy();
      expect(json.missingParams.length).toBeGreaterThan(0);
      expect(json.surviving).toEqual([]);
      expect(json.eliminated).toEqual([]);
    });

    it('returns follow-up when only pH is provided', async () => {
      const res = await POST(createRequest({ message: 'tanah saya asam pH 5' }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBe('follow-up');
      expect(json.followUpQuestion).toBeTruthy();
    });

    it('returns follow-up when only texture is provided', async () => {
      const res = await POST(createRequest({ message: 'tanah liat' }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBe('follow-up');
      expect(json.followUpQuestion).toBeTruthy();
    });
  });

  // ── Branch 3: All crops eliminated → elimination explanation ──────
  describe('all crops eliminated', () => {
    it('returns all-eliminated when pH is extreme (4.0)', async () => {
      const res = await POST(createRequest({
        message: 'pH 4.0 tanah liat elevasi 100 mdpl cahaya 6 jam hujan 2000mm',
      }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBe('all-eliminated');
      expect(json.surviving).toEqual([]);
      expect(json.eliminated.length).toBeGreaterThan(0);
      expect(json.message).toContain('dieliminasikan');
    });

    it('includes elimination reasons for each crop', async () => {
      const res = await POST(createRequest({
        message: 'pH 4.0 tanah liat elevasi 100 mdpl cahaya 6 jam hujan 2000mm',
      }));
      const json = await res.json();
      for (const crop of json.eliminated) {
        expect(crop.name).toBeTruthy();
        expect(Array.isArray(crop.reasons)).toBe(true);
        expect(crop.reasons.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Branch 4: Normal flow → Filter 1 → Filter 2 → ranking ────────
  describe('normal recommendation flow', () => {
    it('returns ranking results with all 5 params provided', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 200 mdpl cahaya 8 jam hujan 1500mm',
      }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.surviving.length).toBeGreaterThan(0);
      expect(json.eliminated.length).toBeGreaterThanOrEqual(0);
    });

    it('response has correct structure: eliminated, surviving, winner', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 200 mdpl cahaya 8 jam hujan 1500mm',
      }));
      const json = await res.json();

      // eliminated is an array of { name, reasons }
      expect(Array.isArray(json.eliminated)).toBe(true);
      if (json.eliminated.length > 0) {
        expect(json.eliminated[0]).toHaveProperty('name');
        expect(json.eliminated[0]).toHaveProperty('reasons');
      }

      // surviving is an array of { name, score, normalizedValues, explanation }
      expect(Array.isArray(json.surviving)).toBe(true);
      expect(json.surviving.length).toBeGreaterThan(0);
      const first = json.surviving[0];
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('score');
      expect(first).toHaveProperty('normalizedValues');
      expect(first).toHaveProperty('explanation');

      // winner is the first surviving entry
      expect(first.name).toBeTruthy();
      expect(typeof first.score).toBe('string');
    });

    it('surviving crops are ranked by score descending', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 200 mdpl cahaya 8 jam hujan 1500mm',
      }));
      const json = await res.json();
      const scores = json.surviving.map((s: { score: string }) => parseFloat(s.score));
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
      }
    });

    it('mode is either local-double-filter or ai-rag-double-filter', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 200 mdpl cahaya 8 jam hujan 1500mm',
      }));
      const json = await res.json();
      expect(['local-double-filter', 'ai-rag-double-filter']).toContain(json.mode);
    });

    it('message field is a non-empty string', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 200 mdpl cahaya 8 jam hujan 1500mm',
      }));
      const json = await res.json();
      expect(typeof json.message).toBe('string');
      expect(json.message.length).toBeGreaterThan(0);
    });

    it('includes userValues in response', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 200 mdpl cahaya 8 jam hujan 1500mm',
      }));
      const json = await res.json();
      expect(json.userValues).toBeTruthy();
      expect(json.userValues.pH).not.toBeNull();
      expect(json.userValues.texture).not.toBeNull();
      expect(json.userValues.elevation).not.toBeNull();
      expect(json.userValues.light).not.toBeNull();
      expect(json.userValues.rainfall).not.toBeNull();
    });
  });

  // ── Branch 5: Multi-turn flow with previousParams ─────────────────
  describe('multi-turn flow (previousParams)', () => {
    it('uses previous params to fill missing values and returns follow-up', async () => {
      // First turn: get a follow-up response
      const firstRes = await POST(createRequest({ message: 'elevasi 200 mdpl' }));
      expect(firstRes.status).toBe(200);
      const firstJson = await firstRes.json();
      expect(firstJson.mode).toBe('follow-up');

      // Second turn: provide only new info + previousParams
      const secondRes = await POST(createRequest({
        message: 'pH 6.5 tanah lempung',
        previousParams: {
          pH: null,
          texture: null,
          elevation: 200,
          light: null,
          rainfall: null,
          budget: null,
          landArea: null,
          rawKeywords: [],
        },
      }));
      expect(secondRes.status).toBe(200);
      const secondJson = await secondRes.json();
      // Should still be follow-up since light and rainfall are missing
      expect(secondJson.mode).toBe('follow-up');
    });

    it('completes ranking when previousParams fills all gaps', async () => {
      const res = await POST(createRequest({
        message: 'cahaya 8 jam',
        previousParams: {
          pH: 6.5,
          texture: 'lempung',
          elevation: 200,
          light: null,
          rainfall: 1500,
          budget: null,
          landArea: null,
          rawKeywords: [],
        },
      }));
      expect(res.status).toBe(200);
      const json = await res.json();
      // With all critical params filled via merge, should get ranking
      expect(json.surviving.length).toBeGreaterThan(0);
    });

    it('previousParams merge does not overwrite newly parsed values', async () => {
      const res = await POST(createRequest({
        message: 'pH 7.0 tanah liat elevasi 300 mdpl cahaya 10 jam hujan 1200mm',
        previousParams: {
          pH: 5.0,
          texture: 'pasir',
          elevation: 50,
          light: 2,
          rainfall: 5000,
          budget: null,
          landArea: null,
          rawKeywords: [],
        },
      }));
      const json = await res.json();
      // The newly parsed values should take precedence
      expect(json.userValues.pH).toBe(7.0);
      expect(json.userValues.texture).toBe('liat');
      expect(json.userValues.elevation).toBe(300);
    });
  });
  // ── Branch 6: Partial elimination → some eliminated, some survive ─
  describe('partial elimination', () => {
    it('returns mix of eliminated and surviving crops', async () => {
      const res = await POST(createRequest({
        message: 'pH 6.5 tanah lempung elevasi 800 mdpl cahaya 10 jam hujan 1100mm',
      }));
      expect(res.status).toBe(200);
      const json = await res.json();
      // Should not be all-eliminated for this moderate input
      expect(json.mode).not.toBe('all-eliminated');
      expect(json.surviving.length).toBeGreaterThan(0);
      expect(json.eliminated.length).toBeGreaterThan(0);
    });
  });

  // ── Error handling ────────────────────────────────────────────────
  describe('error handling', () => {
    it('returns 500 for malformed JSON body', async () => {
      const req = new NextRequest('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json{{{',
      });
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBeTruthy();
    });
  });
});
