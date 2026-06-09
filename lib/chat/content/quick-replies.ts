/**
 * Quick reply options per parameter.
 * Source: constants.ts (moved here for content separation).
 * NOTE: "Tidak tahu" option has been removed per user request.
 * Only "Kurang yakin" escape remains.
 */

import type { QuickReply } from '../types';

export const QUICK_REPLIES: Record<string, QuickReply[]> = {
  'ketinggian': [
    { label: 'Dataran rendah', value: 'lahan saya di dataran rendah 200 mdpl' },
    { label: 'Dataran sedang', value: 'lahan saya di dataran sedang 500 mdpl' },
    { label: 'Pegunungan', value: 'lahan saya di pegunungan 900 mdpl' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'curah hujan': [
    { label: 'Hampir setiap hari', value: 'hujan hampir tiap hari' },
    { label: 'Sering (4-5x seminggu)', value: 'hujan sering' },
    { label: 'Cukup (2-3x seminggu)', value: 'curah hujan cukup' },
    { label: 'Jarang (kurang dari 1x seminggu)', value: 'hujan jarang' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'pH tanah': [
    { label: 'Tanaman sering menguning/kerdil', value: 'tanah asam tanaman sering menguning' },
    { label: 'Tumbuh biasa saja', value: 'tanah netral tumbuh biasa' },
    { label: 'Hijau dan subur', value: 'tanah subur hijau' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'tekstur tanah': [
    { label: 'Lengket/liat saat basah', value: 'tanah liat lengket' },
    { label: 'Gembur/lempung', value: 'tanah gembur lempung' },
    { label: 'Kasar/berpasir', value: 'tanah berpasir kasar' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
  'intensitas cahaya': [
    { label: 'Teduh (6-8 jam)', value: 'cahaya teduh 7 jam' },
    { label: 'Sedang (8-10 jam)', value: 'cahaya 9 jam' },
    { label: 'Penuh (12+ jam)', value: 'cahaya penuh 12 jam' },
    { label: 'Saya kurang yakin', value: '__ESCAPE_KURANG_YAKIN__' },
  ],
};
