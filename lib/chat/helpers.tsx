/**
 * Chat Widget — Pure Helpers & Small Components
 * Extracted from ChatWidget.tsx for modularity and testability.
 *
 * Contains:
 *   - Pure utility functions (no React dependency)
 *   - AnimatedDots (small presentational React component)
 */

import { useState, useEffect } from 'react';
import { PARAM_ORDER } from './constants';

// ─── Pure Functions ─────────────────────────────────────────────────────────

/**
 * Extracts parameter names from elimination reasons of eliminated crops.
 * Scans each reason string for keyword matches to identify which
 * agroklimat parameters caused the elimination.
 *
 * @param eliminated - Array of eliminated crop objects with reasons
 * @returns Array of canonical parameter names found in the reasons
 */
export function extractOutOfRangeParams(
  eliminated: Array<{ name: string; reasons: string[] }>,
): string[] {
  const params = new Set<string>();
  for (const crop of eliminated) {
    for (const reason of crop.reasons) {
      const lower = reason.toLowerCase();
      if (lower.includes('ph')) params.add('pH tanah');
      if (lower.includes('ketinggian') || lower.includes('mdpl')) params.add('ketinggian');
      if (lower.includes('curah hujan') || lower.includes('hujan') || lower.includes('mm/tahun')) params.add('curah hujan');
      if (lower.includes('tekstur') || (lower.includes('tanah') && (lower.includes('liat') || lower.includes('pasir') || lower.includes('lempung')))) params.add('tekstur tanah');
      if (lower.includes('cahaya') || lower.includes('jam/hari')) params.add('intensitas cahaya');
    }
  }
  return Array.from(params);
}

/**
 * Computes which parameters are still missing from the collected state.
 * Bug 1 Fix: Never fully trust data.missingParams from the API.
 * Always merge with this function's result to ensure parameters not yet
 * collected in local state are still asked. See Bug 1 — Tekstur Tanah Terskip.
 *
 * @param collected - Current collected parameter values, or null if none
 * @returns Array of parameter names that still need to be collected
 */
export function computeClientMissingParams(
  collected: Record<string, unknown> | null,
): string[] {
  if (!collected) return [...PARAM_ORDER];
  return PARAM_ORDER.filter((param) => {
    const val = collected[param];
    return val === null || val === undefined || val === '';
  });
}

/**
 * Returns the appropriate honorific based on gender.
 *
 * @param gender - 'laki' | 'perempuan' | ''
 * @returns 'Ibu' for perempuan, 'Bapak' otherwise
 */
export function sapaan(gender: 'laki' | 'perempuan' | ''): string {
  return gender === 'perempuan' ? 'Ibu' : 'Bapak';
}

/**
 * Generates the ringkasan (summary) message shown during the 'ringkasan' phase.
 * Explains how the system works in a conversational tone.
 *
 * @param name - User's name
 * @param gender - 'laki' | 'perempuan' | ''
 * @returns Multi-line summary message string
 */
export function ringkasanMessage(name: string, gender: 'laki' | 'perempuan' | ''): string {
  const salam = gender === 'perempuan' ? `Ibu ${name}` : `Bapak ${name}`;
  return [
    `Terima kasih, ${salam}! Sebelum kita mulai, izinkan saya menjelaskan singkat cara kerja sistem ini.`,
    '',
    `Saya akan membantu ${salam} memilih komoditas terbaik untuk lahan ${salam}. Caranya begini:`,
    '',
    'Pertama, saya akan menanyakan 5 kondisi lahan, seperti ketinggian, curah hujan, dan kondisi tanah. Nanti saya cocokkan dengan 6 jenis tanaman: Padi, Jagung, Kedelai, Cabai, Bawang Merah, dan Bawang Putih.',
    '',
    'Tanaman yang cocok dengan lahan, kemudian saya hitung mana yang paling menguntungkan, dilihat dari biaya tanam, harga jual, sampai risikonya.',
    '',
    `Gampangnya begitu, ${salam.split(' ')[0]}. Ada yang ingin ditanyakan dulu, atau langsung mulai?`,
  ].join('\n');
}

// ─── React Component ────────────────────────────────────────────────────────

/**
 * AnimatedDots — Small presentational component that renders animated dots.
 * Used as a typing indicator in the chat interface.
 */
export function AnimatedDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
}
