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
    'ketinggian': (n, sap) => [
      `Baik, ${sap} ${n}. Sekarang saya ingin tahu soal **ketinggian lahan**.`,
      '',
      '**Kenapa ketinggian penting?** Setiap kenaikan 100 meter, suhu udara turun sekitar 0,6 derajat. Artinya, tanaman yang tumbuh baik di dataran rendah — seperti padi atau jagung — belum tentu cocok ditanam di pegunungan yang lebih dingin.',
      '',
      `Kira-kira lahan ${sap} berada di dataran rendah, sedang, atau pegunungan?`,
    ].join('\n'),
    'curah hujan': (n, sap) => [
      `Oke, selanjutnya soal **curah hujan** di sekitar lahan ${sap}.`,
      '',
      '**Kenapa curah hujan penting?** Air adalah kebutuhan utama tanaman. Tanaman yang butuh banyak air — seperti padi — tidak akan tumbuh maksimal di daerah kering, dan sebaliknya, tanaman yang tidak tahan genangan bisa busuk di daerah sangat basah.',
      '',
      `Kira-kira seberapa sering hujannya, ${sap}?`,
    ].join('\n'),
    'pH tanah': (n, sap) => [
      `Baik, selanjutnya soal **kondisi tanah**.`,
      '',
      '**Kenapa pH tanah penting?** pH tanah menentukan seberapa baik akar tanaman bisa menyerap **nutrisi** dari tanah. Tanah yang terlalu asam atau terlalu basa bisa membuat pupuk sebaik apa pun menjadi tidak terserap tanaman.',
      '',
      `Ini agak sulit diamati langsung, tapi ${sap} pernah tidak melihat tanaman di lahan ${sap} sering menguning atau kerdil? Atau tumbuh biasa saja?`,
    ].join('\n'),
    'tekstur tanah': (n, sap) => [
      `Selanjutnya, saya ingin tahu **tekstur tanah** di lahan ${sap}.`,
      '',
      '**Kenapa tekstur tanah penting?** Tekstur tanah menentukan **daya tampung air dan nutrisi**. Tanah liat menahan air tapi bisa tergenang, tanah pasir cepat kering, sedangkan lempung paling seimbang untuk kebanyakan tanaman.',
      '',
      `Cara mudahnya: ambil tanah, basahi sedikit, lalu remas. Tanah ${sap} terasa lengket, gembur, atau kasar seperti pasir?`,
    ].join('\n'),
    'intensitas cahaya': (n, sap) => [
      `Terakhir, saya ingin tahu soal **sinar matahari** di lahan ${sap}.`,
      '',
      '**Kenapa cahaya penting?** Sinar matahari adalah bahan bakar **fotosintesis** — proses di mana tanaman membuat makanannya sendiri. Tanaman yang butuh banyak cahaya tidak akan tumbuh maksimal di tempat teduh.',
      '',
      `Kira-kira berapa jam lahan ${sap} terkena sinar matahari langsung setiap harinya?`,
    ].join('\n'),
  };
  return questions[param]?.(name, s) || '';
}

export function getKurangYakinFallback(param: string, name: string, gender: Sapaan | ''): string {
  const s = gender === 'perempuan' ? 'Ibu' : 'Pak';
  const fallbacks: Record<string, string> = {
    'ketinggian': [
      `Tidak masalah, ${s} ${name}. Coba perhatikan suhu di lahan ${s}.`,
      '',
      '- Kalau **terik dan panas**, biasanya dataran rendah (0-400 meter)',
      '- Kalau **agak sejuk**, dataran sedang (400-700 meter)',
      '- Kalau **dingin dan berembus angin**, biasanya pegunungan (700 meter ke atas)',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'curah hujan': [
      `Tidak masalah, ${s} ${name}. Coba ingat-ingat, dalam sebulan terakhir:`,
      '',
      '- Kalau **hampir setiap hari** hujan, berarti curah hujan tinggi',
      '- Kalau **kadang-kadang** hujan (sekali-sekali), berarti sedang',
      '- Kalau **seminggu sekali atau kurang**, berarti rendah',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'pH tanah': [
      `Tidak masalah, ${s} ${name}. Coba perhatikan tanaman di lahan ${s}:`,
      '',
      '- Kalau **daun sering menguning** atau tanaman kerdil, kemungkinan tanah asam',
      '- Kalau **tumbuh hijau dan subur**, kemungkinan tanah netral',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'tekstur tanah': [
      `Tidak masalah, ${s} ${name}. Coba ambil tanah di lahan ${s}, lalu basahi sedikit:`,
      '',
      '- Kalau terasa **lengket dan bisa dibentuk**, berarti tanah liat',
      '- Kalau terasa **halus dan gembur**, berarti lempung',
      '- Kalau terasa **kasar seperti pasir**, berarti tanah berpasir',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'intensitas cahaya': [
      `Tidak masalah, ${s} ${name}. Coba perhatikan, dari pagi sampai sore:`,
      '',
      '- Kalau ada **pohon besar atau bangunan** yang menghalangi, biasanya 6-8 jam',
      '- Kalau **terbuka sepenuhnya**, bisa 10-12 jam',
      '',
      `Coba hitung kira-kira berapa jam lahan ${s} kena matahari langsung. Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
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
