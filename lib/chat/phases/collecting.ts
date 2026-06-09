import type { CollectionState, MessageWithoutId, PhaseResult, Sapaan } from './types';
import { PARAM_ORDER } from '../constants';

export function createInitialCollectionState(): CollectionState {
  return { currentParamIndex: 0, answers: {} };
}

export function getCurrentParam(state: CollectionState): string {
  return PARAM_ORDER[state.currentParamIndex] || '';
}

export function isCollectionComplete(state: CollectionState): boolean {
  return state.currentParamIndex >= PARAM_ORDER.length;
}

export function getCurrentQuestion(state: CollectionState, name: string, gender: Sapaan | ''): string {
  const param = getCurrentParam(state);
  if (!param) return '';
  const s = gender === 'perempuan' ? 'Ibu' : 'Pak';
  const questions: Record<string, (n: string, sap: string) => string> = {
    'ketinggian': (n, sap) => `Baik, ${sap} ${n}. Selanjutnya saya ingin tahu soal ketinggian lahan ${sap}. Ini penting karena beda ketinggian, beda juga suhu dan jenis tanaman yang bisa tumbuh. Kira-kira lahan ${sap} di dataran rendah, sedang, atau pegunungan?`,
    'curah hujan': (n, sap) => `Oke, selanjutnya saya ingin menanyakan terkait curah hujan di lingkungan lokasi ${sap}. Air adalah kebutuhan utama tanaman, jadi ini salah satu hal yang paling penting. Kira-kira seberapa sering hujannya, ${sap}?`,
    'pH tanah': (n, sap) => `Baik, selanjutnya soal kondisi tanah. Ini agak sulit diamati langsung, tapi ${sap} pernah tidak melihat tanaman di lahan ${sap} sering menguning atau kerdil? Atau tumbuh biasa saja?`,
    'tekstur tanah': (n, sap) => `Selanjutnya, saya ingin menanyakan tentang tekstur tanah di lahan ${sap}. Cara mudahnya, kalau diambil dan dibasahi, tanah ${sap} terasa lengket, gembur, atau kasar seperti pasir?`,
    'intensitas cahaya': (n, sap) => `Terakhir, saya ingin menanyakan tentang paparan sinar matahari di lahan ${sap}. Kira-kira seberapa lama lahan ${sap} terkena sinar matahari langsung setiap harinya?`,
  };
  return questions[param]?.(name, s) || '';
}

export function getKurangYakinFallback(param: string, name: string, gender: Sapaan | ''): string {
  const s = gender === 'perempuan' ? 'Ibu' : 'Pak';
  const fallbacks: Record<string, string> = {
    'ketinggian': `Tidak masalah, ${s} ${name}. Coba perhatikan suhu di lahan ${s}. Kalau terik dan panas, biasanya dataran rendah (0-400 meter). Kalau agak sejuk, dataran sedang (400-700 meter). Kalau dingin dan berembus angin, biasanya pegunungan (700+ meter). Perkiraan kasar sudah cukup, ${s}.`,
    'curah hujan': `Tidak masalah, ${s} ${name}. Coba ingat-ingat, dalam sebulan terakhir, kira-kira berapa kali hujan deras? Kalau hampir setiap hari, berarti curah hujan tinggi. Kalau seminggu sekali atau kurang, berarti rendah. Perkiraan kasar sudah cukup, ${s}.`,
    'pH tanah': `Tidak masalah, ${s} ${name}. Coba perhatikan tanaman di lahan ${s}. Kalau daun sering menguning atau tanaman kerdil, kemungkinan tanah asam. Kalau tumbuh hijau dan subur, kemungkinan tanah netral. Perkiraan kasar sudah cukup, ${s}.`,
    'tekstur tanah': `Tidak masalah, ${s} ${name}. Coba ambil tanah di lahan ${s}, lalu basahi sedikit. Kalau terasa lengket dan bisa dibentuk, berarti tanah liat. Kalau terasa halus dan gembur, berarti lempung. Kalau terasa kasar seperti pasir, berarti tanah berpasir. Perkiraan kasar sudah cukup, ${s}.`,
    'intensitas cahaya': `Tidak masalah, ${s} ${name}. Coba perhatikan, pagi sampai sore, kira-kira berapa jam lahan ${s} terkena sinar matahari langsung? Kalau ada pohon besar atau bangunan yang menghalangi, biasanya 6-8 jam. Kalau terbuka, bisa 10-12 jam. Perkiraan kasar sudah cukup, ${s}.`,
  };
  return fallbacks[param] || `Silakan pilih perkiraan ${param} ${s}. Perkiraan kasar sudah cukup.`;
}

export function handleQuickReply(
  state: CollectionState, value: string, userName: string, userGender: Sapaan | ''
): { collectionState: CollectionState; messagesToAdd: MessageWithoutId[]; isComplete: boolean } {
  const param = getCurrentParam(state);
  const isKurangYakin = value === '__ESCAPE_KURANG_YAKIN__';

  if (isKurangYakin) {
    const fallbackMsg = getKurangYakinFallback(param, userName, userGender);
    return {
      collectionState: state,
      messagesToAdd: [
        { role: 'assistant', content: fallbackMsg },
      ],
      isComplete: false,
    };
  }

  // Normal answer — store and advance
  const newAnswers = { ...state.answers, [param]: value };
  const nextIndex = state.currentParamIndex + 1;
  const complete = nextIndex >= PARAM_ORDER.length;
  if (complete) {
    return {
      collectionState: { currentParamIndex: nextIndex, answers: newAnswers },
      messagesToAdd: [],
      isComplete: true,
    };
  }
  const nextParam = PARAM_ORDER[nextIndex];
  const nextQuestion = getCurrentQuestion({ ...state, currentParamIndex: nextIndex }, userName, userGender);
  return {
    collectionState: { currentParamIndex: nextIndex, answers: newAnswers },
    messagesToAdd: [{ role: 'assistant', content: nextQuestion }],
    isComplete: false,
  };
}
