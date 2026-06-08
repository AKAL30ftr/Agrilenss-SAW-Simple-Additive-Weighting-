import { NextRequest, NextResponse } from 'next/server';
import {
  buildRagContext,
  detectMissingParams,
  filterByAgroklimat,
  formatUserValues,
  generateFollowUpQuestion,
  parseUserInput,
  rankBySAW,
  retrieveKnowledge,
  sawCriteria,
  cropProfiles,
  type Filter1Output,
  type ParsedUserInput,
  type RecommendationResult,
} from '@/lib/knowledge-base';
import { SAWEngine } from '@/lib/saw/engine';
import { generateAdvisorAnswer } from '@/lib/ai/advisor';

// ── Rate limiter (in-memory, 30 req/min per IP) ──────────────────────
interface RateEntry {
  count: number;
  resetTime: number;
}
const rateMap = new Map<string, RateEntry>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now >= entry.resetTime) {
    rateMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── CORS headers helper ──────────────────────────────────────────────
function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  if (!checkRateLimit(clientIp)) {
    return withCors(
      NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' }, { status: 429 })
    );
  }
  try {
    const body = await request.json();
    const userInput = typeof body.message === 'string' ? body.message.trim() : '';
    const previousParams = body.previousParams as ParsedUserInput | undefined;
    const preferences = Array.isArray(body.preferences) ? body.preferences as string[] : undefined;
    const uncertainParams = Array.isArray(body.uncertainParams) ? body.uncertainParams as string[] : [];
    if (userInput.length > 500) {
      return withCors(
        NextResponse.json({ error: 'Input terlalu panjang. Maksimal 500 karakter.' }, { status: 400 })
      );
    }
    if (!userInput.trim() && !body.uncertainParams) {
      return withCors(
        NextResponse.json(
          { error: 'Pesan tidak boleh kosong' },
          { status: 400 }
        )
      );
    }

    // Step 1: Parse user input (NLP extraction)
    const parsed = parseUserInput(userInput);

    // Merge with previous params if continuing conversation
    if (previousParams) {
      if (parsed.pH === null && previousParams.pH !== null) parsed.pH = previousParams.pH;
      if (parsed.texture === null && previousParams.texture !== null) parsed.texture = previousParams.texture;
      if (parsed.elevation === null && previousParams.elevation !== null) parsed.elevation = previousParams.elevation;
      if (parsed.light === null && previousParams.light !== null) parsed.light = previousParams.light;
      if (parsed.rainfall === null && previousParams.rainfall !== null) parsed.rainfall = previousParams.rainfall;
      if (parsed.budget === null && previousParams.budget !== null) parsed.budget = previousParams.budget;
      if (parsed.landArea === null && previousParams.landArea !== null) parsed.landArea = previousParams.landArea;
    }

    // Step 2: Detect missing params
    const missingParams = detectMissingParams(parsed, uncertainParams);
    const followUpQuestion = generateFollowUpQuestion(missingParams);

    // If critical params are missing, ask follow-up on every turn until all collected
    if (followUpQuestion) {
      return withCors(
        NextResponse.json({
          message: followUpQuestion,
          mode: 'follow-up',
          eliminated: [],
          surviving: [],
          missingParams,
          followUpQuestion,
          userValues: parsed,
          retrievedContext: [],
        })
      );
    }

    // Step 3: Filter 1 — Boolean Elimination
    const filter1 = filterByAgroklimat(parsed, userInput);

    // Step 4: If all eliminated, return early with explanation
    if (filter1.allEliminated) {
      const eliminationDetails = filter1.eliminated
        .map((e) => `- ${e.cropName}: ${e.failReasons.join('; ')}`)
        .join('\n');

      const message = [
        '😔 Berdasarkan kondisi yang Anda berikan, sayangnya semua komoditas dieliminasikan:',
        '',
        eliminationDetails,
        '',
        '💡 Saran: Perbaiki drainase, pertimbangkan pengapuran untuk tanah terlalu asam, atau konsultasikan dengan penyuluh setempat untuk opsi lain.',
      ].join('\n');

      return withCors(
        NextResponse.json({
          message,
          mode: 'all-eliminated',
          eliminated: filter1.eliminated.map((e) => ({ name: e.cropName, reasons: e.failReasons })),
          surviving: [],
          missingParams,
          followUpQuestion: null,
          userValues: parsed,
          retrievedContext: [],
          darkHorse: filter1.darkHorse.map((dh) => ({
            cropName: dh.cropName,
            totalProximity: dh.totalProximity,
            failReasons: dh.failReasons,
            advice: dh.advice,
          })),
        })
      );
    }

    // Step 5: Filter 2 — SAW Economic Ranking on survivors
    const sawResults = rankBySAW(filter1.surviving, preferences);

    // Step 5b: Budget warning (soft — never eliminates crops)
    let apiBudgetWarning: string | null = null;
    if (parsed.budget !== null && parsed.landArea !== null && sawResults.length > 0) {
      const insufficient: string[] = [];
      const scaleRecs: string[] = [];
      for (const r of sawResults) {
        const profile = cropProfiles[r.alternativeId];
        if (!profile) continue;
        const required = parsed.landArea * profile.economic.biayaProduksi;
        if (parsed.budget < required) {
          insufficient.push(r.name);
          const recArea = parsed.budget / profile.economic.biayaProduksi;
          scaleRecs.push(
            `${r.name}: luas maksimal ${recArea.toFixed(2)} ha (biaya Rp ${profile.economic.biayaProduksi.toLocaleString('id-ID')}/ha)`
          );
        }
      }
      if (insufficient.length === sawResults.length) {
        const cheapest = sawResults.reduce((best, r) => {
          const p = cropProfiles[r.alternativeId];
          const bestP = cropProfiles[best.alternativeId];
          return p && bestP && p.economic.biayaProduksi < bestP.economic.biayaProduksi ? r : best;
        }, sawResults[0]);
        const cheapestProfile = cropProfiles[cheapest.alternativeId];
        const maxArea = cheapestProfile ? parsed.budget / cheapestProfile.economic.biayaProduksi : 0;
        apiBudgetWarning =
          `⚠️ Peringatan Modal: Modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk luas ${parsed.landArea} ha pada semua komoditas.\n\n` +
          `💡 Saran: Kurangi luas lahan atau tambah modal. Untuk ${cheapest.name} (paling terjangkau), luas maksimal: ${maxArea.toFixed(2)} ha.`;
      } else if (insufficient.length > 0) {
        apiBudgetWarning =
          `⚠️ Peringatan Modal: Untuk luas ${parsed.landArea} ha, modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk: ${insufficient.join(', ')}.\n\n` +
          `💡 Rekomendasi skala lahan:\n${scaleRecs.map((s) => `- ${s}`).join('\n')}`;
      }
    } else if (parsed.budget !== null && parsed.landArea === null && sawResults.length > 0) {
      const insufficient: string[] = [];
      for (const r of sawResults) {
        const profile = cropProfiles[r.alternativeId];
        if (!profile) continue;
        if (parsed.budget < profile.economic.biayaProduksi) {
          insufficient.push(r.name);
        }
      }
      if (insufficient.length === sawResults.length) {
        apiBudgetWarning =
          `⚠️ Peringatan Modal: Modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk biaya produksi per hektar pada semua komoditas.\n\n` +
          `💡 Saran: Tambah modal atau pertimbangkan komoditas dengan biaya produksi lebih rendah.`;
      } else if (insufficient.length > 0) {
        apiBudgetWarning =
          `⚠️ Peringatan Modal: Modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk biaya produksi per hektar: ${insufficient.join(', ')}.\n\n` +
          `💡 Komoditas lain dalam ranking tetap layak dipertimbangkan.`;
      }
    }

    // Step 6: Build response message
    const topResult = sawResults[0];
    const eliminationSummary = filter1.eliminated
      .map((e) => `• ${e.cropName}: ${e.failReasons[0]}`)
      .join('\n');

    const rankingSummary = sawResults
      .map((r, i) => `${i + 1}. ${r.name} — skor SAW: ${r.preferenceScore.toFixed(3)}`)
      .join('\n');

    const fallbackMessage = [
      `🌾 Rekomendasi Utama: ${topResult.name} (skor: ${topResult.preferenceScore.toFixed(3)})`,
      '',
      filter1.eliminated.length > 0
        ? `❌ Dieliminasikan (${filter1.eliminated.length}):\n${eliminationSummary}`
        : '✅ Semua komoditas lolos Filter 1 (agroklimat).',
      '',
      `📊 Ranking SAW:\n${rankingSummary}`,
      ...(apiBudgetWarning ? ['', apiBudgetWarning] : []),
      '',
      '⚠️ Rekomendasi awal berdasarkan knowledge base. Validasi dengan penyuluh setempat dan data cuaca aktual sebelum keputusan tanam.',
    ].join('\n');

    // Step 7: Try AI generation if configured
    let aiMessage: string | null = null;
    let mode = 'local-double-filter';

    try {
      const retrieval = retrieveKnowledge(userInput);
      const userValuesSummary = formatUserValues({
        soil: parsed.texture ? 7 : 5,
        rainfall: parsed.rainfall ? 7 : 5,
        water_access: 6,
        land_area: parsed.landArea ? 7 : 5,
      });
      const ragContext = buildRagContext(retrieval, sawResults);

      aiMessage = await generateAdvisorAnswer({
        userMessage: userInput,
        ragContext,
        userValuesSummary,
        recommendations: sawResults,
      });

      if (aiMessage) {
        mode = 'ai-rag-double-filter';
      }
    } catch (aiError) {
      console.error('AI advisor fallback:', aiError instanceof Error ? aiError.message : 'Unknown AI error');
    }

    return withCors(
      NextResponse.json({
        message: aiMessage ?? fallbackMessage,
        mode,
        eliminated: filter1.eliminated.map((e) => ({ name: e.cropName, reasons: e.failReasons })),
        surviving: sawResults.map((r) => ({
          name: r.name,
          score: r.preferenceScore.toFixed(3),
          normalizedValues: r.normalizedValues,
          explanation: r.explanation,
        })),
        darkHorse: filter1.darkHorse.map((dh) => ({
          cropName: dh.cropName,
          totalProximity: dh.totalProximity,
          failReasons: dh.failReasons,
          advice: dh.advice,
        })),
        missingParams,
        followUpQuestion,
        userValues: parsed,
        retrievedContext: [],
        budgetWarning: apiBudgetWarning,
      })
    );
  } catch (error) {
    console.error('Recommendation error:', error);
    return withCors(
      NextResponse.json(
        { error: 'Terjadi kesalahan saat memproses rekomendasi' },
        { status: 500 }
      )
    );
  }
}
