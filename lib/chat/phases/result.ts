import type { MessageWithoutId, PhaseResult, Sapaan } from './types';
import { closingMessage } from '../content/messages';

const RANK_LABELS = ['Paling cocok', 'Tidak kalah bagus', 'Dapat dipertimbangkan'];

export function formatResultMessage(name: string, gender: Sapaan | ''): string {
  return `${gender === 'perempuan' ? 'Ibu' : 'Pak'} ${name}, berikut hasil rekomendasi saya berdasarkan kondisi lahan ${gender === 'perempuan' ? 'Ibu' : 'Pak'}:`;
}

export function formatCropRanking(crops: Array<{ name: string; explanation?: string }>): string {
  const top3 = crops.slice(0, 3);
  const lines = top3.map((crop, i) => {
    let line = `${crop.name}: ${RANK_LABELS[i]}`;
    if (crop.explanation) line += `\n${crop.explanation}`;
    return line;
  });
  if (crops.length > 3) lines.push(`\nAda ${crops.length - 3} tanaman lain yang juga lolos tapi skornya lebih rendah.`);
  return lines.join('\n\n');
}

export function formatEliminatedSection(eliminated: Array<{ name: string; reasons: string[] }>): string {
  if (eliminated.length === 0) return '';
  const header = `Sayangnya, dari 6 jenis tanaman, ${eliminated.length} tidak lolos:`;
  const items = eliminated.map((e) => `- ${e.name}: ${e.reasons[0]}`).join('\n');
  return `${header}\n${items}`;
}

export function handleLihatDetail(cropName: string): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: `Lihat detail ${cropName}` }], nextPhase: 'detail' };
}

export function handleKembaliKeHasil(): PhaseResult {
  return { messagesToAdd: [], nextPhase: 'done' };
}

export function handleUlangi(): PhaseResult {
  return { messagesToAdd: [{ role: 'user', content: 'Ulangi konsultasi' }], nextPhase: 'ringkasan' };
}

export function handleSelesai(name: string, gender: Sapaan | ''): PhaseResult {
  const msgs: MessageWithoutId[] = [
    { role: 'user', content: 'Selesai' },
    { role: 'assistant', content: closingMessage(name, gender) },
  ];
  return { messagesToAdd: msgs, nextPhase: 'closing' };
}
