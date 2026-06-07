import { Alternative, Criterion, SAWResult } from './saw/types';
import { SAWEngine } from './saw/engine';

// =============================================================================
// INTERFACES
// =============================================================================

export interface KnowledgeNode {
  id: string;
  type: 'crop' | 'criterion' | 'condition' | 'practice' | 'constraint';
  label: string;
  description: string;
  aliases: string[];
  tags: string[];
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relation: 'requires' | 'prefers' | 'tolerates' | 'supports' | 'risks';
  weight: number;
  note: string;
}

export interface RagDocument {
  id: string;
  title: string;
  category: 'persona' | 'guardrail' | 'script' | 'rule' | 'crop_profile' | 'method';
  content: string;
  tags: string[];
}

export interface RetrievedDocument extends RagDocument {
  relevanceScore: number;
}

export interface KnowledgeRetrieval {
  inferredCriteria: Record<string, number>;
  retrievedDocuments: RetrievedDocument[];
  matchedNodes: KnowledgeNode[];
  queryTokens: string[];
}

export interface RecommendationResult extends SAWResult {
  contentRelevance: number;
  explanation: string;
}

/** Parsed user input from NLP */
export interface ParsedUserInput {
  pH: number | null;           // 0-14 or null
  texture: string | null;      // e.g. "liat", "lempung", "pasir"
  elevation: number | null;    // mdpl or null
  light: number | null;        // jam/hari or null
  rainfall: number | null;     // mm/tahun or null
  budget: number | null;       // Rp (total modal) or null
  landArea: number | null;     // hektar or null
  rawKeywords: string[];       // matched keywords for context
}

/** Filter 1 result for a single crop */
export interface Filter1Result {
  cropId: string;
  cropName: string;
  eliminated: boolean;
  failReasons: string[];       // human-readable elimination reasons
  soilScore: number;           // 0-1 normalized suitability
  rainfallScore: number;       // 0-1 normalized suitability
}

/** Filter 1 output */
export interface Filter1Output {
  results: Filter1Result[];
  surviving: Filter1Result[];
  eliminated: Filter1Result[];
  allEliminated: boolean;
}

export interface FullRecommendationResult {
  message: string;
  mode: string;
  eliminated: Array<{ name: string; reasons: string[] }>;
  surviving: RecommendationResult[];
  missingParams: string[];
  followUpQuestion: string | null;
  userValues: ParsedUserInput;
  retrievedContext: Array<{ id: string; title: string; category: string; relevanceScore: number }>;
  budgetWarning: string | null;
}

/** Agroklimat parameters per crop */
interface AgroklimatParams {
  phMin: number;
  phMax: number;
  textures: string[];          // accepted texture keywords
  elevationMin: number;        // mdpl
  elevationMax: number;        // mdpl
  lightMin: number;            // jam/hari
  lightMax: number;            // jam/hari (use 999 for "12+")
  rainfallMin: number;         // mm/tahun (normalized)
  rainfallMax: number;         // mm/tahun (normalized)
}

/** Economic parameters per crop */
interface EconomicParams {
  biayaProduksi: number;       // Rp/ha
  hargaJual: number;           // Rp/kg
  produktivitas: number;       // ton/ha
  risiko: number;              // 1-3 (1=rendah, 3=tinggi)
  permintaan: number;          // 1-5 (5=sangat tinggi)
}

/** Full crop profile */
interface CropProfile {
  id: string;
  name: string;
  aliases: string[];
  agroklimat: AgroklimatParams;
  economic: EconomicParams;
}

// =============================================================================
// CROP PROFILES — 6 komoditas lengkap (Ground Truth from knowledge base)
// =============================================================================

export const cropProfiles: Record<string, CropProfile> = {
  rice: {
    id: 'rice',
    name: 'Padi',
    aliases: ['padi', 'beras', 'rice', 'sawah'],
    agroklimat: {
      phMin: 5.5, phMax: 6.5,
      textures: ['liat', 'liat berlempung', 'lempung', 'lempung berliat'],
      elevationMin: 0, elevationMax: 650,
      lightMin: 8, lightMax: 10,
      rainfallMin: 1500, rainfallMax: 2000,
    },
    economic: {
      biayaProduksi: 7207932,
      hargaJual: 10022,
      produktivitas: 5.28,
      risiko: 2,
      permintaan: 5,
    },
  },
  corn: {
    id: 'corn',
    name: 'Jagung',
    aliases: ['jagung', 'corn'],
    agroklimat: {
      phMin: 5.6, phMax: 7.5,
      textures: ['lempung berpasir', 'lempung berliat', 'lempung', 'berliat', 'berpasir'],
      elevationMin: 0, elevationMax: 900,
      lightMin: 8, lightMax: 10,
      // 500-1200mm/musim × 2 musim = 1000-2400mm/tahun
      rainfallMin: 1000, rainfallMax: 2400,
    },
    economic: {
      biayaProduksi: 6158477,
      hargaJual: 8438,
      produktivitas: 5.57,
      risiko: 2,
      permintaan: 4,
    },
  },
  soybean: {
    id: 'soybean',
    name: 'Kedelai',
    aliases: ['kedelai', 'soybean', 'kacang kedelai'],
    agroklimat: {
      phMin: 6.0, phMax: 7.0,
      textures: ['lempung berliat', 'lempung', 'liat', 'berliat'],
      elevationMin: 0, elevationMax: 900,
      lightMin: 10, lightMax: 12,
      // 350-600mm/musim × 2 musim = 700-1200mm/tahun
      rainfallMin: 700, rainfallMax: 1200,
    },
    economic: {
      biayaProduksi: 5370000,
      hargaJual: 16459,
      produktivitas: 1.62,
      risiko: 3,
      permintaan: 4,
    },
  },
  chili: {
    id: 'chili',
    name: 'Cabai Merah',
    aliases: ['cabai merah', 'cabai', 'cabe', 'cabe merah', 'chili'],
    agroklimat: {
      phMin: 6.0, phMax: 7.0,
      textures: ['lempung berpasir', 'lempung', 'berpasir'],
      elevationMin: 0, elevationMax: 1400,
      lightMin: 10, lightMax: 12,
      rainfallMin: 600, rainfallMax: 1250,
    },
    economic: {
      biayaProduksi: 48500000,
      hargaJual: 52001,
      produktivitas: 8.60,
      risiko: 3,
      permintaan: 4,
    },
  },
  shallot: {
    id: 'shallot',
    name: 'Bawang Merah',
    aliases: ['bawang merah', 'shallot', 'brambang'],
    agroklimat: {
      phMin: 5.6, phMax: 6.5,
      textures: ['lempung berpasir', 'lempung', 'berpasir'],
      elevationMin: 0, elevationMax: 800,
      lightMin: 12, lightMax: 999,
      // 300-400mm/musim × 2 musim = 600-800mm/tahun
      rainfallMin: 600, rainfallMax: 800,
    },
    economic: {
      biayaProduksi: 58500000,
      hargaJual: 37304,
      produktivitas: 10.05,
      risiko: 3,
      permintaan: 5,
    },
  },
  garlic: {
    id: 'garlic',
    name: 'Bawang Putih',
    aliases: ['bawang putih', 'garlic'],
    agroklimat: {
      phMin: 6.0, phMax: 7.0,
      textures: ['lempung berpasir', 'lempung', 'berpasir'],
      elevationMin: 700, elevationMax: 1100,
      lightMin: 12, lightMax: 999,
      // 110-200mm/bulan × 5 bulan = 550-1000mm/tahun
      rainfallMin: 550, rainfallMax: 1000,
    },
    economic: {
      biayaProduksi: 91587000,
      hargaJual: 39064,
      produktivitas: 8.50,
      risiko: 3,
      permintaan: 5,
    },
  },
};

// Convert cropProfiles to SAW Alternative format using 7 economic criteria
export function getCropsAsAlternatives(): Alternative[] {
  return Object.values(cropProfiles).map((crop) => ({
    id: crop.id,
    name: crop.name,
    values: {
      kondisi_tanah: 8, // placeholder, recalculated per-user in Filter 1
      curah_hujan: 8,   // placeholder, recalculated per-user in Filter 1
      biaya_produksi: crop.economic.biayaProduksi,
      harga_jual: crop.economic.hargaJual,
      produktivitas: crop.economic.produktivitas,
      risiko: crop.economic.risiko,
      permintaan: crop.economic.permintaan,
    },
  }));
}

// =============================================================================
// SAW CRITERIA — 7 kriteria berbobot (Filter 2)
// =============================================================================

export const sawCriteria: Criterion[] = [
  { id: 'kondisi_tanah', name: 'Kondisi Tanah', type: 'benefit', weight: 0.20 },
  { id: 'curah_hujan', name: 'Curah Hujan', type: 'benefit', weight: 0.15 },
  { id: 'biaya_produksi', name: 'Biaya Produksi', type: 'cost', weight: 0.20 },
  { id: 'harga_jual', name: 'Harga Jual', type: 'benefit', weight: 0.15 },
  { id: 'produktivitas', name: 'Produktivitas', type: 'benefit', weight: 0.10 },
  { id: 'risiko', name: 'Risiko Gagal Panen', type: 'cost', weight: 0.10 },
  { id: 'permintaan', name: 'Permintaan Pasar', type: 'benefit', weight: 0.10 },
];

// =============================================================================
// NLP PARSER — Observational input mapping
// =============================================================================

/** pH keyword mapping → numerical pH estimate */
const phKeywords: Record<string, number> = {
  // masam
  'sangat masam': 4.0,
  'asam banget': 4.0,
  'masam': 5.0,
  'kerdil': 5.0,
  'menguning': 5.0,
  'kuning': 5.0,
  // agak masam
  'agak masam': 5.7,
  'lumayan asam': 5.7,
  // netral
  'netral': 6.5,
  'biasa saja': 6.5,
  'tumbuh biasa': 6.5,
  'subur': 6.5,
  'hijau subur': 6.5,
  'hijau': 6.5,
  // alkalis
  'alkali': 7.5,
  'basa': 7.5,
};

/** Texture keyword mapping → texture category */
const textureKeywords: Record<string, string> = {
  // liat
  'lengket': 'liat',
  'liat': 'liat',
  'lekat': 'liat',
  'sulit lepas': 'liat',
  'keras kering': 'liat',
  // lempung
  'lempung': 'lempung',
  'gembur': 'lempung',
  'seperti tepung': 'lempung',
  'berdebu': 'lempung',
  // pasir / berpasir
  'pasir': 'berpasir',
  'kasar': 'berpasir',
  'berpasir': 'berpasir',
  'lalu air': 'berpasir',
  // humus
  'humus': 'lempung',
  'subur': 'lempung',
  'hitam': 'lempung',
};

/** Elevation keyword mapping → elevation estimate (mdpl) */
const elevationKeywords: Record<string, number> = {
  'dataran rendah': 200,
  'rendah': 200,
  'pantai': 50,
  'panas': 200,
  'terik': 200,
  // sedang
  'sedang': 500,
  'dataran sedang': 500,
  // tinggi
  'dataran tinggi': 800,
  'tinggi': 800,
  'pegunungan': 900,
  'gunung': 1000,
  'sejuk': 800,
  'dingin': 900,
  'hawa dingin': 1000,
};

/** Light keyword mapping → hours */
const lightKeywords: Record<string, number> = {
  // rendah / teduh
  'teduh': 6,
  'terhalang': 6,
  'pohon besar': 6,
  'bangunan': 6,
  'awan': 7,
  // sedang
  'sedang': 9,
  'lumayan': 9,
  // tinggi
  'sinar matahari': 12,
  'panas banget': 12,
  'cerah': 11,
  'cerah sekali': 12,
  'terik': 12,
  'langit cerah': 12,
};

/** Rainfall keyword mapping → mm/tahun estimate */
const rainfallKeywords: Record<string, number> = {
  // sangat rendah (< 300mm/tahun)
  'kemarau': 250,
  'kering': 250,
  // rendah (300-600mm/tahun)
  'jarang hujan': 400,
  'hujan jarang': 400,
  'jarang': 400,
  'rendah': 500,
  'sedikit hujan': 500,
  // sedang (600-1200mm/tahun)
  'cukup': 900,
  'cukup sering': 900,
  'lumayan': 1000,
  'kadang hujan': 900,
  '3-4x': 900,
  // tinggi (1200-2000mm/tahun)
  'sering': 1500,
  'hujan sering': 1500,
  'sering hujan': 1500,
  'hampir tiap hari': 1800,
  'tiap hari': 2000,
  'sangat sering': 2200,
  'basah': 1800,
  // sangat tinggi (> 2000mm/tahun)
  'banjir': 3000,
};

/** Budget/modal keyword mapping → qualitative score */
const budgetKeywords: Record<string, number> = {
  'modal mepet': 2,
  'terbatas': 3,
  'cukup': 5,
  'lumayan': 6,
  'banyak': 8,
  'besar': 9,
  'mengecil': 2,
  'mahal': 2,
  'murah': 8,
  'gratis': 10,
  'kurang': 3,
};

/** Land area keyword mapping → hectares estimate */
const areaKeywords: Record<string, number> = {
  'pekarangan': 0.05,
  'sempit': 0.1,
  'kecil': 0.25,
  '250m': 0.025,
  '500m': 0.05,
  '1000m': 0.1,
  'sedang': 1,
  '1ha': 1,
  '1 hektar': 1,
  '2ha': 2,
  '2 hektar': 2,
  'luas': 3,
  'besar': 5,
  'sangat luas': 10,
};

// Sentiment → dynamic weight extraction
export const sentimentToWeightKeywords: Record<string, string[]> = {
  biaya_produksi: ['modal mepet', 'terbatas', 'mahal', 'murah', 'modal', 'biaya', 'ongkos', 'budget'],
  harga_jual: ['untung', 'laku', 'laris', 'profit', 'keuntungan', 'harga', 'jual'],
  produktivitas: ['hasil', 'panen', 'produksi', 'tonase', 'banyak hasil'],
  risiko: ['takut rugi', 'cuaca buruk', 'banyak hama', 'risiko', 'gagal', 'rugi', 'aman', 'stabil'],
  permintaan: ['cepat laku', 'banyak yang cari', 'pasar luas', 'permintaan', 'laris', 'serap pasar'],
};

/** Parse user free-text input into structured parameters */
export function parseUserInput(input: string): ParsedUserInput {
  const lower = normalizeText(input);
  const result: ParsedUserInput = {
    pH: null,
    texture: null,
    elevation: null,
    light: null,
    rainfall: null,
    budget: null,
    landArea: null,
    rawKeywords: [],
  };
  // pH — try explicit numeric first (e.g. "pH 6.5", "ph6.5")
  {
    const phMatch = lower.match(/(?:ph|pH)\s*(\d+(?:\.\d+)?)/);
    if (phMatch) {
      result.pH = parseFloat(phMatch[1]);
      result.rawKeywords.push(`pH${result.pH}`);
    }
  }
  // Fall back to qualitative keywords
  if (result.pH === null) {
    for (const [kw, val] of Object.entries(phKeywords)) {
      if (lower.includes(kw)) { result.pH = val; result.rawKeywords.push(kw); break; }
    }
  }
  // Texture
  for (const [kw, val] of Object.entries(textureKeywords)) {
    if (lower.includes(kw)) { result.texture = val; result.rawKeywords.push(kw); break; }
  }
  // Elevation — try explicit numeric first
  {
    const elevMatch = lower.match(/(\d+)\s*(?:mdpl|meter|m\s*d\s*p\s*l)/);
    if (elevMatch) {
      result.elevation = parseInt(elevMatch[1], 10);
      result.rawKeywords.push(`${result.elevation}mdpl`);
    }
  }
  // Fall back to qualitative keywords
  if (result.elevation === null) {
    for (const [kw, val] of Object.entries(elevationKeywords)) {
      if (lower.includes(kw)) { result.elevation = val; result.rawKeywords.push(kw); break; }
    }
  }
  // Light — try explicit numeric first
  {
    const lightMatch = lower.match(/(\d+)\s*(?:jam|hour)/);
    if (lightMatch) {
      result.light = parseInt(lightMatch[1], 10);
      result.rawKeywords.push(`${result.light}jam`);
    }
  }
  // Fall back to qualitative keywords
  if (result.light === null) {
    for (const [kw, val] of Object.entries(lightKeywords)) {
      if (lower.includes(kw)) { result.light = val; result.rawKeywords.push(kw); break; }
    }
  }
  // Rainfall — try explicit numeric first
  {
    const rainMatch = lower.match(/(\d+)\s*(?:mm)/);
    if (rainMatch) {
      result.rainfall = parseInt(rainMatch[1], 10);
      result.rawKeywords.push(`${result.rainfall}mm`);
    }
  }
  // Fall back to qualitative keywords
  if (result.rainfall === null) {
    for (const [kw, val] of Object.entries(rainfallKeywords)) {
      if (lower.includes(kw)) { result.rainfall = val; result.rawKeywords.push(kw); break; }
    }
  }
  // Budget
  for (const [kw, val] of Object.entries(budgetKeywords)) {
    if (lower.includes(kw)) { result.budget = val; result.rawKeywords.push(kw); break; }
  }
  // Land area — try explicit numeric first
  {
    const haMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:ha|hektar)/);
    if (haMatch) {
      result.landArea = parseFloat(haMatch[1]);
      result.rawKeywords.push(`${result.landArea}ha`);
    } else {
      const m2Match = lower.match(/(\d+)\s*(?:m2|m²|meter persegi|meter)/);
      if (m2Match) {
        result.landArea = parseInt(m2Match[1], 10) / 10000;
        result.rawKeywords.push(`${m2Match[1]}m2`);
      }
    }
  }
  // Fall back to qualitative keywords
  if (result.landArea === null) {
    for (const [kw, val] of Object.entries(areaKeywords)) {
      if (lower.includes(kw)) { result.landArea = val; result.rawKeywords.push(kw); break; }
    }
  }
  return result;
}

/** Detect which critical params are missing */
export function detectMissingParams(parsed: ParsedUserInput): string[] {
  const missing: string[] = [];
  if (parsed.elevation === null) missing.push('ketinggian');
  if (parsed.rainfall === null) missing.push('curah hujan');
  if (parsed.pH === null) missing.push('pH tanah');
  if (parsed.texture === null) missing.push('tekstur tanah');
  if (parsed.light === null) missing.push('intensitas cahaya');
  return missing;
}

/** Generate follow-up question based on missing params */
export function generateFollowUpQuestion(missingParams: string[]): string | null {
  if (missingParams.length === 0) return null;

  const questions: Record<string, string> = {
    'ketinggian': '📍 Berapa ketinggian lahan Anda? (contoh: 200 mdpl untuk dataran rendah, 800+ mdpl untuk pegunungan, atau bilang "dataran rendah"/"pegunungan")',
    'curah hujan': '🌧️ Bagaimana curah hujan di wilayah Anda? (hampir tiap hari / sering / cukup / jarang)',
    'pH tanah': '🔬 Bagaimana kondisi tanah Anda? (tanaman sering menguning/kerdil = asam, tumbuh subur = netral, atau sebutkan pH jika tahu)',
    'tekstur tanah': '🤲 Bagaimana tekstur tanah Anda saat basah? (lengket/liat, gembur/lempung, atau kasar/berpasir)',
    'intensitas cahaya': '☀️ Berapa jam lahan Anda terpapar sinar matahari langsung per hari?',
  };

  // Ask highest priority missing param first
  const top = missingParams[0];
  return questions[top] || null;
}

// =============================================================================
// FILTER 1 — Boolean Elimination Engine (Hard Gate)
// =============================================================================

/** Normalize rainfall from various input units to mm/tahun for comparison */
function normalizeRainfallToYearly(valueMm: number, inputText: string): number {
  const lower = normalizeText(inputText);
  // If the raw input mentioned "per bulan" or "bulan", multiply by 12
  if (lower.includes('bulan') || lower.includes('/b')) return valueMm * 12;
  // If the raw input mentioned "per musim" or "musim", multiply by 4 (4 musim/tahun)
  if (lower.includes('musim') || lower.includes('/m')) return valueMm * 4;
  // Otherwise assume yearly or already normalized
  return valueMm;
}

/** Check if texture matches any of the crop's accepted textures */
function textureMatches(userTexture: string, cropTextures: string[]): boolean {
  const normalized = normalizeText(userTexture);
  return cropTextures.some((ct) => normalized.includes(normalizeText(ct)) || normalizeText(ct).includes(normalized));
}

export function filterByAgroklimat(parsed: ParsedUserInput, rawInput?: string): Filter1Output {
  const results: Filter1Result[] = [];
  const crops = Object.values(cropProfiles);

  for (const crop of crops) {
    const reasons: string[] = [];
    const agri = crop.agroklimat;

    // pH check
    if (parsed.pH !== null) {
      if (parsed.pH < agri.phMin) {
        reasons.push(`pH tanah ${parsed.pH} terlalu rendah (butuh ${agri.phMin}–${agri.phMax})`);
      } else if (parsed.pH > agri.phMax) {
        reasons.push(`pH tanah ${parsed.pH} terlalu tinggi (butuh ${agri.phMin}–${agri.phMax})`);
      }
    }

    // Texture check
    if (parsed.texture !== null) {
      if (!textureMatches(parsed.texture, agri.textures)) {
        reasons.push(`tekstur tanah "${parsed.texture}" tidak cocok (${crop.name} butuh: ${agri.textures.join(', ')})`);
      }
    }

    // Elevation check
    if (parsed.elevation !== null) {
      if (parsed.elevation < agri.elevationMin) {
        reasons.push(`ketinggian ${parsed.elevation} mdpl terlalu rendah (${crop.name} butuh ${agri.elevationMin}–${agri.elevationMax} mdpl)`);
      } else if (parsed.elevation > agri.elevationMax) {
        reasons.push(`ketinggian ${parsed.elevation} mdpl terlalu tinggi (${crop.name} butuh ${agri.elevationMin}–${agri.elevationMax} mdpl)`);
      }
    }

    // Light check
    if (parsed.light !== null) {
      if (parsed.light < agri.lightMin) {
        reasons.push(`cahaya ${parsed.light} jam/hari terlalu rendah (${crop.name} butuh min ${agri.lightMin} jam/hari)`);
      }
    }

    // Rainfall check
    if (parsed.rainfall !== null) {
      const yearlyRain = normalizeRainfallToYearly(parsed.rainfall, rawInput || '');
      if (yearlyRain < agri.rainfallMin) {
        reasons.push(`curah hujan ${yearlyRain} mm/tahun terlalu rendah (${crop.name} butuh ${agri.rainfallMin}–${agri.rainfallMax} mm/tahun)`);
      } else if (yearlyRain > agri.rainfallMax) {
        reasons.push(`curah hujan ${yearlyRain} mm/tahun terlalu tinggi (${crop.name} butuh ${agri.rainfallMin}–${agri.rainfallMax} mm/tahun)`);
      }
    }

    const eliminated = reasons.length > 0;
    let soilScore = 0.0;
    let rainfallScore = 0.0;

    if (!eliminated) {
      // Soil score: proximity to optimal pH range
      if (parsed.pH !== null) {
        const rangeWidth = agri.phMax - agri.phMin;
        if (parsed.pH >= agri.phMin && parsed.pH <= agri.phMax) {
          soilScore = 1.0;
        } else if (parsed.pH < agri.phMin) {
          const distance = agri.phMin - parsed.pH;
          soilScore = rangeWidth > 0 ? Math.max(0, 1 - distance / rangeWidth) : 0;
        } else {
          const distance = parsed.pH - agri.phMax;
          soilScore = rangeWidth > 0 ? Math.max(0, 1 - distance / rangeWidth) : 0;
        }
      } else {
        soilScore = 1.0; // no user input → assume perfect match
      }

      // Rainfall score: proximity to optimal rainfall range
      if (parsed.rainfall !== null) {
        const yearlyRain = normalizeRainfallToYearly(parsed.rainfall, '');
        const rangeWidth = agri.rainfallMax - agri.rainfallMin;
        if (yearlyRain >= agri.rainfallMin && yearlyRain <= agri.rainfallMax) {
          rainfallScore = 1.0;
        } else if (yearlyRain < agri.rainfallMin) {
          const distance = agri.rainfallMin - yearlyRain;
          rainfallScore = rangeWidth > 0 ? Math.max(0, 1 - distance / rangeWidth) : 0;
        } else {
          const distance = yearlyRain - agri.rainfallMax;
          rainfallScore = rangeWidth > 0 ? Math.max(0, 1 - distance / rangeWidth) : 0;
        }
      } else {
        rainfallScore = 1.0; // no user input → assume perfect match
      }
    }

    results.push({
      cropId: crop.id,
      cropName: crop.name,
      eliminated,
      failReasons: reasons,
      soilScore,
      rainfallScore,
    });
  }

  const eliminatedCrops = results.filter((r) => r.eliminated);
  const surviving = results.filter((r) => !r.eliminated);
  const allEliminated = surviving.length === 0;

  return { results, surviving, eliminated: eliminatedCrops, allEliminated };
}

// =============================================================================
// FILTER 2 — SAW Economic Ranking
// =============================================================================

export function rankBySAW(
  survivingCrops: Filter1Result[],
  preferences?: string[]
): RecommendationResult[] {
  if (survivingCrops.length === 0) return [];
  const alternatives: Alternative[] = survivingCrops.map((sr) => {
    const profile = cropProfiles[sr.cropId];
    return {
      id: sr.cropId,
      name: sr.cropName,
      values: {
        kondisi_tanah: sr.soilScore * 10,
        curah_hujan: sr.rainfallScore * 10,
        biaya_produksi: profile.economic.biayaProduksi,
        harga_jual: profile.economic.hargaJual,
        produktivitas: profile.economic.produktivitas,
        risiko: profile.economic.risiko,
        permintaan: profile.economic.permintaan,
      },
    };
  });
  // ── Dynamic weight adjustment based on user preferences ──
  // Preference label → SAW criterion id mapping
  const preferenceToCriterion: Record<string, string> = {
    'biaya_produksi': 'biaya_produksi',
    'harga_jual': 'harga_jual',
    'produktivitas': 'produktivitas',
    'risiko': 'risiko',
    'permintaan': 'permintaan',
  };
  const adjustableCriterionIds = Object.values(preferenceToCriterion);
  const adjustedCriteria: Criterion[] = sawCriteria.map((c) => ({ ...c }));
  if (preferences && preferences.length > 0) {
    const selectedIds = preferences
      .map((p) => preferenceToCriterion[p])
      .filter((id): id is string => id !== undefined);
    if (selectedIds.length > 0) {
      const nonSelectedIds = adjustableCriterionIds.filter((id) => !selectedIds.includes(id));
      const bonusPerSelected = 0.05 * selectedIds.length;
      const totalReduction = bonusPerSelected;
      const reductionPerNonSelected = nonSelectedIds.length > 0
        ? totalReduction / nonSelectedIds.length
        : 0;
      for (const c of adjustedCriteria) {
        if (selectedIds.includes(c.id)) {
          c.weight += 0.05;
        } else if (nonSelectedIds.includes(c.id)) {
          c.weight = Math.max(0.01, c.weight - reductionPerNonSelected);
        }
      }
      // Renormalize to ensure weights sum to 1.0
      const totalWeight = adjustedCriteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight > 0) {
        for (const c of adjustedCriteria) {
          c.weight = c.weight / totalWeight;
        }
      }
    }
  }
  // Compute global min/max for static economic criteria from ALL 6 crops
  // so that normalized scores are comparable across different Filter 1 outcomes
  const staticEconomicCriteria = ['biaya_produksi', 'harga_jual', 'produktivitas', 'risiko', 'permintaan'];
  const globalMinMax: Record<string, { min: number; max: number }> = {};
  for (const critId of staticEconomicCriteria) {
    const allValues = Object.values(cropProfiles).map((cp) => {
      const econ = cp.economic;
      switch (critId) {
        case 'biaya_produksi': return econ.biayaProduksi;
        case 'harga_jual': return econ.hargaJual;
        case 'produktivitas': return econ.produktivitas;
        case 'risiko': return econ.risiko;
        case 'permintaan': return econ.permintaan;
        default: return 0;
      }
    });
    globalMinMax[critId] = {
      min: Math.min(...allValues),
      max: Math.max(...allValues),
    };
  }
  const sawResults: SAWResult[] = SAWEngine.calculate(adjustedCriteria, alternatives, globalMinMax);

  return sawResults.map((result) => {
    const alt = alternatives.find((a) => a.id === result.alternativeId);
    const contentRelevance = alt?.values?.content_relevance ?? 0;
    return {
      ...result,
      contentRelevance,
      explanation: buildRecommendationExplanation(result, contentRelevance),
    };
  });
}

// Full pipeline
export function runFullPipeline(input: string): FullRecommendationResult {
  const parsed = parseUserInput(input);
  const missingParams = detectMissingParams(parsed);
  const followUpQuestion = generateFollowUpQuestion(missingParams);

  // Run Filter 1
  const filter1 = filterByAgroklimat(parsed, input);

  // Run Filter 2 on survivors
  const sawResults = rankBySAW(filter1.surviving);

  // Budget filtering (soft warning — never eliminates crops)
  let budgetWarning: string | null = null;
  if (parsed.budget !== null && parsed.landArea !== null && sawResults.length > 0) {
    const insufficientCrops: string[] = [];
    const scaleRecommendations: string[] = [];
    for (const r of sawResults) {
      const profile = cropProfiles[r.alternativeId];
      if (!profile) continue;
      const requiredModal = parsed.landArea * profile.economic.biayaProduksi;
      if (parsed.budget < requiredModal) {
        insufficientCrops.push(r.name);
        const recommendedArea = parsed.budget / profile.economic.biayaProduksi;
        scaleRecommendations.push(
          `${r.name}: luas maksimal ${recommendedArea.toFixed(2)} ha (biaya Rp ${profile.economic.biayaProduksi.toLocaleString('id-ID')}/ha)`
        );
      }
    }
    if (insufficientCrops.length === sawResults.length) {
      // All surviving crops exceed budget
      const cheapest = sawResults.reduce((best, r) => {
        const p = cropProfiles[r.alternativeId];
        const bestP = cropProfiles[best.alternativeId];
        return p && bestP && p.economic.biayaProduksi < bestP.economic.biayaProduksi ? r : best;
      }, sawResults[0]);
      const cheapestProfile = cropProfiles[cheapest.alternativeId];
      const maxArea = cheapestProfile ? parsed.budget / cheapestProfile.economic.biayaProduksi : 0;
      budgetWarning =
        `⚠️ **Peringatan Modal:** Modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk luas ${parsed.landArea} ha pada semua komoditas yang direkomendasikan.\n\n` +
        `💡 **Saran:** Kurangi luas lahan atau tambah modal. Untuk komoditas paling terjangkau (${cheapest.name}), luas maksimal yang disarankan: **${maxArea.toFixed(2)} ha**.`;
    } else if (insufficientCrops.length > 0) {
      budgetWarning =
        `⚠️ **Peringatan Modal:** Untuk luas ${parsed.landArea} ha, modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk: ${insufficientCrops.join(', ')}.\n\n` +
        `💡 **Rekomendasi skala lahan:**\n${scaleRecommendations.map((s) => `- ${s}`).join('\n')}`;
    }
  } else if (parsed.budget !== null && parsed.landArea === null && sawResults.length > 0) {
    // Budget provided but no landArea — give per-hectare warnings
    const insufficientCrops: string[] = [];
    for (const r of sawResults) {
      const profile = cropProfiles[r.alternativeId];
      if (!profile) continue;
      if (parsed.budget < profile.economic.biayaProduksi) {
        insufficientCrops.push(r.name);
      }
    }
    if (insufficientCrops.length === sawResults.length) {
      budgetWarning =
        `⚠️ **Peringatan Modal:** Modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk biaya produksi per hektar pada semua komoditas yang direkomendasikan.\n\n` +
        `💡 **Saran:** Tambah modal atau pertimbangkan komoditas dengan biaya produksi lebih rendah.`;
    } else if (insufficientCrops.length > 0) {
      budgetWarning =
        `⚠️ **Peringatan Modal:** Modal Anda (Rp ${parsed.budget.toLocaleString('id-ID')}) belum mencukupi untuk biaya produksi per hektar: ${insufficientCrops.join(', ')}.\n\n` +
        `💡 Komoditas lain dalam ranking tetap layak dipertimbangkan.`;
    }
  }

  // Build message
  let message: string;
  if (filter1.allEliminated) {
    message =
      '😔 Berdasarkan kondisi yang Anda berikan, sayangnya tidak ada komoditas dari daftar kami yang cocok.\n\nSaran: coba perbaiki drainase atau pertimbangkan jenis tanah lain.';
  } else {
    const top = sawResults[0];
    const eliminatedNames = filter1.eliminated.map(
      (e) => `${e.cropName} (${e.failReasons[0]})`
    );
    message = `🌾 Rekomendasi utama: **${top.name}** (skor SAW: ${top.preferenceScore.toFixed(3)})\n\n`;

    if (eliminatedNames.length > 0) {
      message += `❌ **Dieliminasikan:**\n${eliminatedNames.map((n) => `- ${n}`).join('\n')}\n\n`;
    }

    message += `📊 **Ranking:**\n${sawResults.map((r, i) => `${i + 1}. ${r.name}: ${r.preferenceScore.toFixed(3)}`).join('\n')}\n\n`;

    if (budgetWarning) {
      message += `\n${budgetWarning}\n\n`;
    }

    message += '\n⚠️ Ini rekomendasi awal berdasarkan knowledge base. Validasi dengan penyuluh setempat sebelum keputusan tanam.';
  }

  // RAG retrieval
  const retrieval = retrieveKnowledge(input);

  return {
    message,
    mode: filter1.allEliminated ? 'all-eliminated' : 'local-double-filter',
    eliminated: filter1.eliminated.map((e) => ({ name: e.cropName, reasons: e.failReasons })),
    surviving: sawResults,
    missingParams,
    followUpQuestion,
    userValues: parsed,
    retrievedContext: retrieval.retrievedDocuments.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      relevanceScore: d.relevanceScore,
    })),
    budgetWarning,
  };
}

// =============================================================================
// RAG + KNOWLEDGE GRAPH (updated for 6 crops)
// =============================================================================

export const recommendationGraph = {
  nodes: [
    node('crop:rice', 'crop', 'Padi', 'Tanaman pangan utama untuk wilayah basah, akses air kuat, curah hujan tinggi, pH 5.5–6.5.', ['padi', 'beras', 'rice', 'sawah'], ['tanaman pangan', 'sawah', 'air tinggi', 'curah hujan tinggi', 'pH asam']),
    node('crop:corn', 'crop', 'Jagung', 'Tanaman pangan adaptif untuk lahan luas, pH 5.6–7.5, curah hujan moderat.', ['jagung', 'corn'], ['tanaman pangan', 'palawija', 'lahan luas', 'irigasi sedang']),
    node('crop:soybean', 'crop', 'Kedelai', 'Palawija legum untuk rotasi, pH 6.0–7.0, curah hujan rendah–sedang.', ['kedelai', 'soybean', 'kacang kedelai'], ['palawija', 'rotasi', 'air sedang', 'legum']),
    node('crop:chili', 'crop', 'Cabai Merah', 'Hortikultura intensif bernilai tinggi, pH 6.0–7.0, butuh cahaya penuh.', ['cabai merah', 'cabai', 'cabe', 'cabe merah', 'chili'], ['hortikultura', 'nilai tinggi', 'lahan kecil', 'air terkontrol', 'cahaya penuh']),
    node('crop:shallot', 'crop', 'Bawang Merah', 'Hortikultura dataran rendah–sedang, pH 5.6–6.5, butuh cahaya 12+ jam.', ['bawang merah', 'shallot', 'brambang'], ['hortikultura', 'drainase', 'lahan sempit', 'curah hujan rendah', 'cahaya 12 jam']),
    node('crop:garlic', 'crop', 'Bawang Putih', 'Hortikultura dataran tinggi 700–1100 mdpl, pH 6.0–7.0, butuh udara dingin.', ['bawang putih', 'garlic'], ['hortikultura', 'dataran tinggi', 'dingin', 'pegunungan', '700 mdpl']),
    node('criterion:soil', 'criterion', 'Jenis & pH Tanah', 'Kualitas tekstur dan keasaman tanah untuk akar tanaman.', ['tanah', 'gembur', 'liat', 'pasir', 'subur', 'pH', 'asam', 'netral'], ['soil', 'pH']),
    node('criterion:rainfall', 'criterion', 'Curah Hujan', 'Intensitas hujan tahunan yang memengaruhi kelayakan tanaman.', ['hujan', 'curah', 'kering', 'basah', 'kemarau'], ['rainfall']),
    node('criterion:elevation', 'criterion', 'Ketinggian', 'Ketinggian lahan mempengaruhi suhu udara dan jenis tanaman.', ['ketinggian', 'mdpl', 'pegunungan', 'dataran', 'dingin', 'panas'], ['elevation']),
    node('criterion:light', 'criterion', 'Intensitas Cahaya', 'Jam penyinaran matahari per hari.', ['cahaya', 'sinar matahari', 'jam', 'cerah', 'teduh'], ['light']),
    node('criterion:budget', 'criterion', 'Modal / Biaya Produksi', 'Total modal tersedia vs kebutuhan biaya produksi per hektar.', ['modal', 'biaya', 'ongkos', 'modal mepet', 'budget'], ['economics']),
  ],
  edges: [
    edge('crop:rice', 'criterion:rainfall', 'requires', 0.95, 'Padi membutuhkan curah hujan tinggi 1500–2000 mm/tahun.'),
    edge('crop:rice', 'criterion:soil', 'prefers', 0.8, 'Padi cocok tanah liat/liat berlempung, pH 5.5–6.5.'),
    edge('crop:garlic', 'criterion:elevation', 'requires', 0.95, 'Bawang Putih MENGAKAM di ketinggian 700–1100 mdpl.'),
    edge('crop:garlic', 'criterion:light', 'requires', 0.9, 'Bawang Putih butuh cahaya 12+ jam/hari.'),
    edge('crop:shallot', 'criterion:light', 'requires', 0.85, 'Bawang Merah butuh cahaya 12+ jam/hari.'),
    edge('crop:soybean', 'criterion:soil', 'prefers', 0.75, 'Kedelai toleran pada tanah lempung berliat.'),
    edge('crop:chili', 'criterion:budget', 'risks', 0.8, 'Cabai butuh modal besar (>Rp48 juta/ha).'),
    edge('crop:garlic', 'criterion:budget', 'risks', 0.9, 'Bawang Putih butuh modal sangat besar (>Rp91 juta/ha).'),
  ],
} satisfies { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };

export const ragDocuments: RagDocument[] = [
  {
    id: 'persona:advisor',
    title: 'Persona AgriLens Advisor',
    category: 'persona',
    content: 'Bertindak sebagai advisor pertanian praktis berbahasa Indonesia. Gunakan sistem Double Filter: Filter 1 eliminasi mutlak berbasis agroklimat, Filter 2 ranking SAW berbasis ekonomi. Jelaskan alasan eliminasi dan rekomendasi dengan bahasa sederhana.',
    tags: ['persona', 'bahasa indonesia', 'advisor'],
  },
  {
    id: 'guardrail:safety',
    title: 'Guardrail Keamanan dan Batasan',
    category: 'guardrail',
    content: 'JANGAN mengklaim kepastian panen. JANGAN merekomendasikan komoditas yang sudah dieliminasikan oleh Filter 1. JANGAN membuat data harga/produktivitas sendiri. Rekomendasi adalah dukungan keputusan awal. Selalu sarankan verifikasi dengan penyuluh lokal.',
    tags: ['guardrail', 'safety', 'batasan'],
  },
  {
    id: 'script:answer',
    title: 'Script Jawaban Chatbot',
    category: 'script',
    content: 'Format jawaban: (1) Ringkasan kondisi yang terdeteksi, (2) Komoditas yang dieliminasikan + alasan, (3) Rekomendasi utama + skor SAW, (4) Alternatif ranking, (5) Risiko yang perlu dicek, (6) Disclaimer. Jika parameter kurang, ajukan pertanyaan lanjutan yang tepat sasaran.',
    tags: ['script', 'format jawaban'],
  },
  {
    id: 'rule:filter1',
    title: 'Rule Filter 1 — Boolean Elimination',
    category: 'rule',
    content: 'FILTER 1 (Hard Gate Agroklimat): Untuk setiap komoditas, cek semua parameter agroklimat: pH tanah harus dalam range [min, max], tekstur harus cocok, ketinggian dalam range, cahaya dalam range, curah hujan dalam range. JIKA SATU parameter pun GAGAL → ELIMINASI. Jangan rekomendasikan yang sudah dieliminasikan. Berikan alasan eliminasi dalam bahasa sederhana.',
    tags: ['filter1', 'eliminasi', 'agroklimat', 'hard gate'],
  },
  {
    id: 'rule:filter2',
    title: 'Rule Filter 2 — SAW Economic Ranking',
    category: 'rule',
    content: 'FILTER 2 (Ranking Ekonomi SAW): Komoditas yang lolos Filter 1 diurutkan menggunakan 7 kriteria berbobot: Kondisi Tanah (20%), Curah Hujan (15%), Biaya Produksi (20%, cost), Harga Jual (15%, benefit), Produktivitas (10%, benefit), Risiko Gagal Panen (10%, cost), Permintaan Pasar (10%, benefit). Benefit: val/max. Cost: min/val. Skor akhir = Σ(Wj × rij). Ranking tertinggi = rekomendasi utama.',
    tags: ['filter2', 'saw', 'ranking', 'ekonomi'],
  },
  {
    id: 'method:saw',
    title: 'Metode SAW',
    category: 'method',
    content: 'Simple Additive Weighting (SAW): (1) Bentuk matriks keputusan, (2) Normalisasi: benefit = x/max(x), cost = min(x)/x, (3) Kalikan nilai ternormalisasi dengan bobot kriteria, (4) Jumlahkan → skor preferensi Vi, (5) Ranking menurun. Vi mendekati 1 = paling optimal.',
    tags: ['saw', 'ranking', 'metode'],
  },
  {
    id: 'crop:rice',
    title: 'Profil Padi',
    category: 'crop_profile',
    content: 'Padi: pH 5.5–6.5, tekstur liat/liat berlempung, ketinggian 0–650 mdpl, cahaya 8–10 jam/hari, curah hujan 1500–2000 mm/th. Biaya Rp7.2 juta/ha, harga Rp10.022/kg, produktivitas 5.28 ton/ha, risiko 2, permintaan 5.',
    tags: ['padi', 'sawah', 'air tinggi', 'curah hujan tinggi'],
  },
  {
    id: 'crop:corn',
    title: 'Profil Jagung',
    category: 'crop_profile',
    content: 'Jagung: pH 5.6–7.5, tekstur lempung berpasir–berliat, ketinggian 0–900 mdpl, cahaya 8–10 jam/hari, curah hujan 500–1200 mm/musim. Biaya Rp6.2 juta/ha, harga Rp8.438/kg, produktivitas 5.57 ton/ha, risiko 2, permintaan 4.',
    tags: ['jagung', 'palawija', 'lahan luas', 'air sedang'],
  },
  {
    id: 'crop:soybean',
    title: 'Profil Kedelai',
    category: 'crop_profile',
    content: 'Kedelai: pH 6.0–7.0, tekstur lempung berliat, ketinggian 0–900 mdpl, cahaya 10–12 jam/hari, curah hujan 350–600 mm/musim. Biaya Rp5.4 juta/ha, harga Rp16.459/kg, produktivitas 1.62 ton/ha, risiko 3, permintaan 4.',
    tags: ['kedelai', 'palawija', 'rotasi', 'air sedang', 'legum'],
  },
  {
    id: 'crop:chili',
    title: 'Profil Cabai Merah',
    category: 'crop_profile',
    content: 'Cabai Merah: pH 6.0–7.0, tekstur lempung berpasir, ketinggian 0–1400 mdpl, cahaya 10–12 jam/hari, curah hujan 600–1250 mm/th. Biaya Rp48.5 juta/ha, harga Rp52.001/kg, produktivitas 8.60 ton/ha, risiko 3, permintaan 4.',
    tags: ['cabai merah', 'cabai', 'hortikultura', 'nilai tinggi', 'modal besar'],
  },
  {
    id: 'crop:shallot',
    title: 'Profil Bawang Merah',
    category: 'crop_profile',
    content: 'Bawang Merah: pH 5.6–6.5, tekstur lempung berpasir, ketinggian 0–800 mdpl, cahaya 12+ jam/hari, curah hujan 300–400 mm/musim. Biaya Rp58.5 juta/ha, harga Rp37.304/kg, produktivitas 10.05 ton/ha, risiko 3, permintaan 5.',
    tags: ['bawang merah', 'drainase', 'cahaya 12 jam', 'dataran rendah'],
  },
  {
    id: 'crop:garlic',
    title: 'Profil Bawang Putih',
    category: 'crop_profile',
    content: 'Bawang Putih: pH 6.0–7.0, tekstur lempung berpasir, ketinggian 700–1100 mdpl, cahaya 12+ jam/hari, curah hujan 110–200 mm/bulan. Biaya Rp91.6 juta/ha, harga Rp39.064/kg, produktivitas 8.50 ton/ha, risiko 3, permintaan 5. Bawang Putih TIDAK cocok untuk dataran rendah <700 mdpl.',
    tags: ['bawang putih', 'dataran tinggi', 'pegunungan', '700 mdpl', 'modal sangat besar'],
  },
];

// =============================================================================
// HELPER FUNCTIONS (updated)
// =============================================================================

export function retrieveKnowledge(input: string, limit = 7): KnowledgeRetrieval {
  const queryTokens = tokenize(input);
  const parsedInput = parseUserInput(input);
  const inferredCriteria: Record<string, number> = {};
  if (parsedInput.pH !== null) inferredCriteria['pH'] = parsedInput.pH;
  if (parsedInput.texture !== null) inferredCriteria['texture'] = 1;
  if (parsedInput.elevation !== null) inferredCriteria['elevation'] = parsedInput.elevation;
  if (parsedInput.light !== null) inferredCriteria['light'] = parsedInput.light;
  if (parsedInput.rainfall !== null) inferredCriteria['rainfall'] = parsedInput.rainfall;

  const matchedNodes = recommendationGraph.nodes
    .map((knowledgeNode) => ({
      knowledgeNode,
      score: scoreTextMatch(queryTokens, [
        knowledgeNode.label,
        knowledgeNode.description,
        ...knowledgeNode.aliases,
        ...knowledgeNode.tags,
      ]),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ knowledgeNode }) => knowledgeNode);

  const retrievedDocuments = ragDocuments
    .map((document) => ({
      ...document,
      relevanceScore: scoreTextMatch(queryTokens, [
        document.title,
        document.content,
        document.category,
        ...document.tags,
      ]),
    }))
    .filter(
      (document) =>
        document.relevanceScore > 0 ||
        ['persona', 'guardrail', 'script', 'rule', 'method'].includes(document.category)
    )
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return {
    inferredCriteria,
    retrievedDocuments,
    matchedNodes,
    queryTokens,
  };
}

// Legacy: keep for backward compat
export const qualitativeInputMaps: Record<string, Record<string, number>> = {
  soil: { gembur: 10, subur: 10, humus: 10, liat: 5, lempung: 6, pasir: 2, tandus: 2 },
  rainfall: { tinggi: 10, basah: 10, sering: 8, sedang: 6, normal: 6, rendah: 2, kering: 2, kemarau: 2 },
  water_access: { mudah: 10, irigasi: 10, sungai: 8, sedang: 6, terbatas: 4, sulit: 2, tadah: 2 },
  land_area: { luas: 10, besar: 10, hektar: 9, sedang: 6, kecil: 3, sempit: 2, pekarangan: 2 },
};

export function enrichRecommendationResults(results: SAWResult[], alternatives: Alternative[]): RecommendationResult[] {
  return results.map((result) => {
    const alternative = alternatives.find((item) => item.id === result.alternativeId);
    const contentRelevance = alternative?.values.content_relevance ?? 0;
    return {
      ...result,
      contentRelevance,
      explanation: buildRecommendationExplanation(result, contentRelevance),
    };
  });
}

export function buildRagContext(retrieval: KnowledgeRetrieval, results: RecommendationResult[]): string {
  const graphFacts = retrieval.matchedNodes
    .map((knowledgeNode) => `- ${knowledgeNode.label}: ${knowledgeNode.description}`)
    .join('\n');
  const documents = retrieval.retrievedDocuments
    .map((document) => `- [${document.category}] ${document.title}: ${document.content}`)
    .join('\n');
  const rankings = results
    .slice(0, 5)
    .map((result, index) => `${index + 1}. ${result.name}: SAW ${result.preferenceScore.toFixed(3)}, relevansi NLP ${result.contentRelevance.toFixed(1)}. ${result.explanation}`)
    .join('\n');

  return [
    'KONTEKS RAG AGRILENS',
    'Graph facts:',
    graphFacts || '- Tidak ada node graph spesifik yang cocok.',
    'Retrieved documents:',
    documents || '- Tidak ada dokumen spesifik yang cocok.',
    'Ranking rekomendasi:',
    rankings,
  ].join('\n');
}

export function formatUserValues(userValues: Record<string, number>): string {
  const labels: Record<string, string> = {
    soil: 'Tanah',
    rainfall: 'Curah Hujan',
    water_access: 'Akses Air',
    land_area: 'Luas Lahan',
  };
  return Object.entries(userValues)
    .map(([key, val]) => `${labels[key] || key}: ${formatCriterionValue(key, val)}`)
    .join(', ');
}
function formatCriterionValue(criterionId: string, value: number): string {
  const entries = Object.entries(qualitativeInputMaps[criterionId] ?? {});
  const exactMatch = entries.find(([, mappedValue]) => mappedValue === value);
  if (exactMatch) return exactMatch[0];
  if (value >= 8) return 'tinggi/baik';
  if (value >= 5) return 'sedang';
  return 'rendah/terbatas';
}

// =============================================================================
// HELPERS
// =============================================================================

function node(id: string, type: KnowledgeNode['type'], label: string, description: string, aliases: string[], tags: string[]): KnowledgeNode {
  return { id, type, label, description, aliases, tags };
}

function edge(source: string, target: string, relation: KnowledgeEdge['relation'], weight: number, note: string): KnowledgeEdge {
  return { source, target, relation, weight, note };
}

function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

function tokenize(value: string): string[] {
  const stopwords = new Set(['dan', 'atau', 'yang', 'di', 'ke', 'dengan', 'untuk', 'saya', 'aku', 'punya', 'ingin', 'mau', 'tanam']);
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopwords.has(token));
}

function scoreTextMatch(queryTokens: string[], fields: string[]): number {
  const haystack = normalizeText(fields.join(' '));
  return queryTokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

function calculateCropRelevance(alternative: Alternative, input: string, retrieval: KnowledgeRetrieval): number {
  const cropNode = recommendationGraph.nodes.find((knowledgeNode) => knowledgeNode.id === `crop:${alternative.id}`);
  const cropDocuments = ragDocuments.filter((document) => document.id === `crop:${alternative.id}`);
  const queryTokens = retrieval.queryTokens.length > 0 ? retrieval.queryTokens : tokenize(input);
  const profileMatchScore = scoreTextMatch(queryTokens, [
    alternative.name,
    ...(cropNode?.aliases ?? []),
    ...(cropNode?.tags ?? []),
    ...cropDocuments.flatMap((document) => document.tags),
  ]);
  const directNameMatch = [alternative.name, ...(cropNode?.aliases ?? [])].some((alias) => {
    const normalizedAlias = normalizeText(alias);
    return normalizedAlias.length > 2 && normalizeText(input).includes(normalizedAlias);
  });
  const values = Object.values(alternative.values);
  const avgScore = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  const directBoost = directNameMatch ? 2.5 : 0;
  const profileBoost = Math.min(2, profileMatchScore * 0.5);
  return Math.min(10, Number((avgScore * 0.65 + profileBoost + directBoost).toFixed(2)));
}
function buildRecommendationExplanation(result: SAWResult, contentRelevance: number): string {
  const relevanceLabel = contentRelevance >= 8 ? 'sangat relevan' : contentRelevance >= 6 ? 'cukup relevan' : 'relevansi dasar';
  return `${result.name} memiliki ${relevanceLabel} dengan input NLP dan skor SAW ${result.preferenceScore.toFixed(2)}.`;
}