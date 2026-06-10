export type Sapaan = 'laki' | 'perempuan';

export function sap(gender: Sapaan | ''): string {
  return gender === 'perempuan' ? 'Ibu' : 'Pak';
}

const EMOJI: Record<string, string> = {
  'Padi': '🌾', 'Jagung': '🌽', 'Kedelai': '🫘',
  'Cabai Merah': '🌶️', 'Bawang Merah': '🧅', 'Bawang Putih': '🧄',
};

// ─── Phase 1: Welcome ─────────────────────────────────────────────────────────

export function welcomeMessage(): string {
  return [
    'Halo! Selamat datang di Agri-SAW Pro. 🌾',
    '',
    'Saya adalah asisten virtual yang akan membantu merekomendasikan komoditas pertanian terbaik untuk lahan Bapak/Ibu.',
    '',
    'Sebelum mulai, silakan isi data diri dulu ya:',
  ].join('\n');
}

// ─── Phase 2: Ringkasan ───────────────────────────────────────────────────────

export function ringkasanMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return [
    `Terima kasih, ${s} ${name}! 🌾`,
    '',
    'Sistem ini menggunakan **2 tahap analisis** untuk memberikan rekomendasi terbaik:',
    '',
    '**Tahap 1 — Kesesuaian Lingkungan**',
    '',
    'Saya akan menanyakan 5 kondisi lahan:',
    '• Ketinggian tempat',
    '• Curah hujan',
    '• Kondisi tanah (pH)',
    '• Tekstur tanah',
    '• Intensitas cahaya',
    '',
    'Dari 6 komoditas — 🌾 Padi, 🌽 Jagung, 🫘 Kedelai, 🌶️ Cabai, 🧅 Bawang Merah, 🧄 Bawang Putih — saya akan saring mana yang cocok dengan lahan Anda.',
    '',
    '**Tahap 2 — Analisis Keuntungan**',
    '',
    'Untuk komoditas yang cocok, saya hitung ranking keuntungannya berdasarkan:',
    '• Biaya produksi',
    '• Harga jual',
    '• Produktivitas',
    '• Risiko gagal panen',
    '• Permintaan pasar',
    '',
    '---',
    '',
    `Ada yang ingin ditanyakan dulu, atau langsung mulai?`,
  ].join('\n');
}

// ─── Phase 3: Collecting ──────────────────────────────────────────────────────

export function collectingQuestion(param: string, name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  const questions: Record<string, string> = {
    'ketinggian': [
      `Baik, ${s} ${name}. Selanjutnya saya ingin tahu soal **ketinggian lahan** ${s}.`,
      '',
      'Ini penting karena beda ketinggian, beda juga suhu dan jenis tanaman yang bisa tumbuh.',
      '',
      `Kira-kira lahan ${s} di dataran rendah, sedang, atau pegunungan?`,
    ].join('\n'),
    'curah hujan': [
      `Oke, selanjutnya saya ingin menanyakan terkait **curah hujan** di lingkungan lokasi ${s}.`,
      '',
      'Air adalah kebutuhan utama tanaman, jadi ini salah satu hal yang paling penting.',
      '',
      `Kira-kira seberapa sering hujannya, ${s}?`,
    ].join('\n'),
    'pH tanah': [
      `Baik, selanjutnya soal **kondisi tanah**.`,
      '',
      `Ini agak sulit diamati langsung, tapi ${s} pernah tidak melihat tanaman di lahan ${s} sering menguning atau kerdil? Atau tumbuh biasa saja?`,
    ].join('\n'),
    'tekstur tanah': [
      `Selanjutnya, saya ingin menanyakan tentang **tekstur tanah** di lahan ${s}.`,
      '',
      `Cara mudahnya, kalau diambil dan dibasahi, tanah ${s} terasa lengket, gembur, atau kasar seperti pasir?`,
    ].join('\n'),
    'intensitas cahaya': [
      `Terakhir, saya ingin menanyakan tentang **paparan sinar matahari** di lahan ${s}.`,
      '',
      `Kira-kira seberapa lama lahan ${s} terkena sinar matahari langsung setiap harinya?`,
    ].join('\n'),
  };
  return questions[param] || '';
}

export function kurangYakinFallback(param: string, name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  const fallbacks: Record<string, string> = {
    'ketinggian': [
      `Tidak masalah, ${s} ${name}. Coba perhatikan suhu di lahan ${s}.`,
      '',
      '• Kalau **terik dan panas**, biasanya dataran rendah (0-400 mdpl)',
      '• Kalau **agak sejuk**, dataran sedang (400-700 mdpl)',
      '• Kalau **dingin dan berembus angin**, biasanya pegunungan (700+ mdpl)',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'curah hujan': [
      `Tidak masalah, ${s} ${name}. Coba ingat-ingat, dalam sebulan terakhir:`,
      '',
      '• Kalau **hampir setiap hari** hujan, berarti curah hujan tinggi',
      '• Kalau **seminggu sekali atau kurang**, berarti rendah',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'pH tanah': [
      `Tidak masalah, ${s} ${name}. Coba perhatikan tanaman di lahan ${s}:`,
      '',
      '• Kalau **daun sering menguning** atau tanaman kerdil, kemungkinan tanah asam',
      '• Kalau **tumbuh hijau dan subur**, kemungkinan tanah netral',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'tekstur tanah': [
      `Tidak masalah, ${s} ${name}. Coba ambil tanah di lahan ${s}, lalu basahi sedikit:`,
      '',
      '• Kalau terasa **lengket dan bisa dibentuk**, berarti tanah liat',
      '• Kalau terasa **halus dan gembur**, berarti lempung',
      '• Kalau terasa **kasar seperti pasir**, berarti tanah berpasir',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
    'intensitas cahaya': [
      `Tidak masalah, ${s} ${name}. Coba perhatikan, pagi sampai sore:`,
      '',
      '• Kalau ada **pohon besar atau bangunan** yang menghalangi, biasanya 6-8 jam',
      '• Kalau **terbuka**, bisa 10-12 jam',
      '',
      `Perkiraan kasar sudah cukup, ${s}.`,
    ].join('\n'),
  };
  return fallbacks[param] || `Silakan pilih perkiraan ${param} ${s}. Perkiraan kasar sudah cukup.`;
}

// ─── Phase 4: Confirming ──────────────────────────────────────────────────────

export function confirmingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return [
    `Baik, ${s} ${name}! Semua data lahan sudah terkumpul.`,
    '',
    'Silakan periksa dulu, apakah data di bawah ini sudah benar:',
  ].join('\n');
}

export function paramRecapLine(param: string, value: string): string {
  const config: Record<string, { emoji: string; label: string }> = {
    'ketinggian': { emoji: '📍', label: 'Ketinggian' },
    'curah hujan': { emoji: '🌧️', label: 'Curah hujan' },
    'pH tanah': { emoji: '🔬', label: 'pH tanah' },
    'tekstur tanah': { emoji: '🤲', label: 'Tekstur tanah' },
    'intensitas cahaya': { emoji: '☀️', label: 'Intensitas cahaya' },
  };
  const c = config[param] || { emoji: '•', label: param };
  return `${c.emoji} **${c.label}:** ${value}`;
}

// ─── Phase: filter1_result ────────────────────────────────────────────────────

export function filter1ResultMessage(
  name: string, gender: Sapaan | '',
  surviving: Array<{ name: string; score: string; matchDetails: string }>,
  eliminated: Array<{ name: string; reasons: string[] }>
): string {
  const s = sap(gender);
  const lines: string[] = [
    `Berdasarkan kondisi lingkungan lahan ${s}, berikut komoditas yang **paling cocok secara agronomis**: 🌿`,
    '',
  ];

  surviving.forEach(crop => {
    const emoji = EMOJI[crop.name] || '🌱';
    lines.push(`${emoji} **${crop.name}** — ${crop.score}`);
    lines.push(crop.matchDetails);
    lines.push('');
  });

  if (eliminated.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push(`Sayangnya, **${eliminated.length} tanaman tidak lolos** karena kondisi lingkungan:`);
    eliminated.forEach(crop => {
      lines.push(`• **${crop.name}**: ${crop.reasons[0] || 'Kondisi lahan kurang cocok'}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`Selanjutnya, saya bisa menghitung **ranking keuntungan ekonomi** untuk ${surviving.length} komoditas yang cocok ini.`);
  lines.push('');
  lines.push('Dengan mempertimbangkan biaya produksi, harga jual, produktivitas, risiko gagal panen, dan permintaan pasar.');
  lines.push('');
  lines.push(`Mau dilanjutkan, ${s}?`);
  return lines.join('\n');
}

// ─── Phase: filter2_pref ──────────────────────────────────────────────────────

export function filter2PrefMessage(
  name: string, gender: Sapaan | '',
  surviving: Array<{ name: string; biaya: string; harga: string; produktivitas: string; risiko: string; permintaan: string }>
): string {
  const s = sap(gender);
  const lines: string[] = [
    `Baik, ${s}! 📊`,
    '',
    'Berikut data ekonomi untuk masing-masing komoditas:',
    '',
  ];

  surviving.forEach(crop => {
    const emoji = EMOJI[crop.name] || '🌱';
    lines.push(`${emoji} **${crop.name}**`);
    lines.push(`• Biaya Produksi: ${crop.biaya}`);
    lines.push(`• Harga Jual: ${crop.harga}`);
    lines.push(`• Produktivitas: ${crop.produktivitas}`);
    lines.push(`• Risiko: ${crop.risiko}`);
    lines.push(`• Permintaan: ${crop.permintaan}`);
    lines.push('');
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`Untuk menentukan ranking, saya perlu tahu **prioritas** ${s}.`);
  lines.push('');
  lines.push(`_Mana yang lebih penting? ${s} bisa pilih **sampai 5**._`);
  return lines.join('\n');
}


// ─── Phase: filter2_result (hasil setelah Filter 2) ────────────────────────────
export function filter2ResultMessage(
  name: string, gender: Sapaan | '',
  surviving: Array<{ name: string; score: string; breakdown: Record<string, { score: number; label: string }> }>,
  eliminated: Array<{ name: string; reasons: string[] }>,
  preferences: string[]
): string {
  const s = sap(gender);
  const lines: string[] = [
    `${s} ${name}, berikut **ranking keuntungan ekonomi** dari komoditas yang cocok dengan lahan ${s}:`,
    '',
  ];
  const labels = ['**Paling cocok** 🏆', '**Tidak kalah bagus** 👍', '**Dapat dipertimbangkan** 🤔'];
  surviving.slice(0, 3).forEach((crop, i) => {
    const emoji = EMOJI[crop.name] || '🌱';
    const label = labels[i] || `**Peringkat ${i + 1}**`;
    lines.push(`${emoji} **${crop.name}** — ${label}`);
    lines.push(`Skor: ${crop.score}`);
    lines.push('');
    // Breakdown per kriteria
    lines.push('**Breakdown Skor:**');
    Object.entries(crop.breakdown).forEach(([key, val]) => {
      const criterionLabels: Record<string, string> = {
        'biaya': 'Biaya Produksi',
        'harga': 'Harga Jual',
        'produktivitas': 'Produktivitas',
        'risiko': 'Risiko',
        'permintaan': 'Permintaan',
      };
      lines.push(`• ${criterionLabels[key] || key}: ${val.score}/5 (${val.label})`);
    });
    lines.push(`• **Total Skor SAW: ${crop.score}**`);
    lines.push('');
  });
  if (eliminated.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push(`Sayangnya, **${eliminated.length} tanaman** tidak lolos Filter 1:`);
    eliminated.forEach(c => { lines.push(`• **${c.name}**: ${c.reasons[0] || 'Kondisi lahan kurang cocok'}`); });
    lines.push('');
  }
  if (preferences.length > 0) {
    const prefLabels: Record<string, string> = {
      'biaya': 'Biaya produksi rendah',
      'harga': 'Harga jual tinggi',
      'produktivitas': 'Produktivitas tinggi',
      'risiko': 'Risiko rendah',
      'permintaan': 'Permintaan pasar tinggi',
    };
    lines.push('---');
    lines.push('');
    lines.push(`**Preferensi Anda:** ${preferences.map(p => prefLabels[p] || p).join(', ')}`);
    lines.push('_Bobot SAW disesuaikan berdasarkan preferensi Anda._');
    lines.push('');
  }
  lines.push('Mau lihat detail salah satu tanaman, atau ada yang ingin ditanyakan?');
  return lines.join('\n');
}

// ─── Phase 6: Result ──────────────────────────────────────────────────────────



export function allEliminatedMessage(name: string, gender: Sapaan | '', eliminated: Array<{ name: string; reasons: string[] }>): string {
  const s = sap(gender);
  const lines: string[] = [
    `Maaf, ${s} ${name} 😔`,
    '',
    'Berdasarkan kondisi yang diberikan, **semua komoditas dieliminasikan**:',
    '',
  ];
  eliminated.forEach(c => { lines.push(`• **${c.name}**: ${c.reasons[0] || 'Kondisi lahan kurang cocok'}`); });
  lines.push('');
  lines.push('💡 **Saran**: Perbaiki drainase, pertimbangkan pengapuran untuk tanah terlalu asam, atau konsultasikan dengan penyuluh setempat.');
  lines.push('');
  lines.push(`Mau coba dengan kondisi lain, ${s}?`);
  return lines.join('\n');
}

export function detailMessage(cropName: string, score: string, explanation?: string): string {
  const emoji = EMOJI[cropName] || '🌱';
  return [
    `${emoji} **${cropName}** — Detail Analisis`,
    '',
    `**Skor**: ${score}`,
    '',
    explanation || 'Detail analisis untuk tanaman ini.',
  ].join('\n');
}

// ─── Phase 7: Closing ─────────────────────────────────────────────────────────

export function closingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return [
    `Terima kasih, ${s} ${name}, sudah menggunakan Agri-SAW Pro! 🙏`,
    '',
    `Semoga rekomendasi ini membantu ${s} menentukan tanaman yang terbaik untuk lahan.`,
    '',
    `Kalau ada pertanyaan lain atau mau konsultasi ulang, jangan sungkan ya, ${s}.`,
    '',
    `_Kalau hasil ini dirasa kurang sesuai, ${s} juga bisa konsultasikan dengan penyuluh pertanian di daerah ${s} untuk pendalaman lebih lanjut._`,
    '',
    `Mau konsultasi ulang atau ada pertanyaan lain, ${s}?`,
  ].join('\n');
}

// ─── Error messages ───────────────────────────────────────────────────────────

export function errorMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return [
    `Maaf, ${s} ${name}, ada kendala teknis. 😔`,
    '',
    'Silakan coba lagi nanti, atau hubungi penyuluh pertanian setempat untuk konsultasi langsung.',
  ].join('\n');
}

export function loadingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Terima kasih atas kesabarannya, ${s} ${name}.\n\n⏳ Hasil perhitungan sedang disusun...`;
}
