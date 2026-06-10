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
    'Halo, selamat datang di Agri-SAW Pro! 🌾',
    '',
    'Saya asisten virtual yang dibuat khusus untuk membantu petani memilih tanaman terbaik sesuai kondisi lahan masing-masing.',
    '',
    'Saya diharapkan bisa jadi teman diskusi Bapak/Ibu dalam mengambil keputusan: **tanaman apa yang paling cocok dan menguntungkan** untuk ditanam.',
    '',
    'Sebelum mulai, silakan isi data diri dulu ya.',
  ].join('\n');
}

// ─── Phase 2: Ringkasan ───────────────────────────────────────────────────────

export function ringkasanMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return [
    `Terima kasih, ${s} ${name}! 🌾`,
    '',
    'Saya akan membantu memilih tanaman terbaik menggunakan **2 tahap perhitungan**:',
    '',
    '**Tahap 1 — Kesesuaian Lahan**',
    '',
    'Saya akan tanyakan 5 kondisi lahan:',
    '',
    '• Ketinggian tempat',
    '• Curah hujan',
    '• Kondisi tanah (keasaman)',
    '• Tekstur tanah',
    '• Sinar matahari',
    '',
    'Dari 6 jenis tanaman:',
    '',
    '• 🌾 Padi',
    '• 🌽 Jagung',
    '• 🫘 Kedelai',
    '• 🌶️ Cabai Merah',
    '• 🧅 Bawang Merah',
    '• 🧄 Bawang Putih',
    '',
    'Saya akan saring mana yang cocok dengan lahan Anda. Misalnya, kalau lahan ${s} di dataran rendah dengan curah hujan tinggi, kemungkinan besar Padi dan Jagung akan lolos.',
    '',
    '**Tahap 2 — Perhitungan Keuntungan**',
    '',
    'Tanaman yang cocok akan dihitung keuntungannya berdasarkan:',
    '',
    '• Biaya produksi',
    '• Harga jual',
    '• Hasil panen per hektar',
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
      `Baik, ${s} ${name}. Sekarang saya ingin tahu soal **ketinggian lahan**.`,
      '',
      'Ini penting karena beda ketinggian, beda juga suhu udaranya. Tanaman yang cocok di dataran rendah belum tentu cocok di pegunungan.',
      '',
      `Kira-kira lahan ${s} di dataran rendah, sedang, atau pegunungan?`,
    ].join('\n'),
    'curah hujan': [
      `Oke, selanjutnya soal **curah hujan** di sekitar lahan ${s}.`,
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
      `Selanjutnya, saya ingin tahu **tekstur tanah** di lahan ${s}.`,
      '',
      `Cara mudahnya: ambil tanah, basahi sedikit, lalu remas. Tanah ${s} terasa lengket, gembur, atau kasar seperti pasir?`,
    ].join('\n'),
    'intensitas cahaya': [
      `Terakhir, saya ingin tahu soal **sinar matahari** di lahan ${s}.`,
      '',
      `Kira-kira berapa jam lahan ${s} terkena sinar matahari langsung setiap harinya?`,
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
      '• Kalau **terik dan panas**, biasanya dataran rendah (0-400 meter)',
      '• Kalau **agak sejuk**, dataran sedang (400-700 meter)',
      '• Kalau **dingin dan berembus angin**, biasanya pegunungan (700 meter ke atas)',
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
      `Tidak masalah, ${s} ${name}. Coba perhatikan, dari pagi sampai sore:`,
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
    '',
    'Kalau ada yang belum sesuai, silakan pilih **Ubah Data** untuk memperbaiki.',
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
  const c = config[param] || { emoji: '-', label: param };
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
    `Berdasarkan kondisi lahan ${s}, berikut tanaman yang **paling cocok**: 🌿`,
    '',
  ];

  surviving.forEach(crop => {
    const emoji = EMOJI[crop.name] || '🌱';
    const scoreNum = parseInt(crop.score, 10) || 0;
    lines.push(`${emoji} **${crop.name}** — ${crop.score} (Skor: ${scoreNum}/100)`);
    lines.push(crop.matchDetails);
    lines.push('');
  });

  if (eliminated.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push(`Sayangnya, **${eliminated.length} tanaman tidak cocok** dengan kondisi lahan:`);
    lines.push('');
    eliminated.forEach(crop => {
      lines.push(`• **${crop.name}**: ${crop.reasons[0] || 'Kondisi lahan kurang cocok'}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`Selanjutnya, saya bisa menghitung **ranking keuntungan** untuk ${surviving.length} tanaman yang cocok ini.`);
  lines.push('');
  lines.push('Dengan mempertimbangkan biaya produksi, harga jual, hasil panen, risiko gagal, dan permintaan pasar.');
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
    'Angka-angka berikut akan menentukan **ranking keuntungan** masing-masing tanaman.',
    '',
    `Semakin tinggi skor di setiap kriteria, semakin menguntungkan tanaman tersebut untuk ${s} tanam.`,
    '',
  ];

  surviving.forEach(crop => {
    const emoji = EMOJI[crop.name] || '🌱';
    lines.push(`${emoji} **${crop.name}**`);
    lines.push('');
    lines.push(`• Biaya Produksi: ${crop.biaya}`);
    lines.push(`• Harga Jual: ${crop.harga}`);
    lines.push(`• Produktivitas: ${crop.produktivitas}`);
    lines.push(`• Risiko: ${crop.risiko}`);
    lines.push(`• Permintaan: ${crop.permintaan}`);
    lines.push('');
  });

  lines.push('---');
  lines.push('');
  lines.push(`Untuk menentukan ranking, saya perlu tahu **prioritas** ${s}.`);
  lines.push('');
  lines.push(`Mana yang lebih penting? ${s} bisa pilih **sampai 3**.`);
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
    `${s} ${name}, berikut **ranking keuntungan** dari tanaman yang cocok dengan lahan ${s}:`,
    '',
  ];
  const labels = ['**Paling cocok** 🏆', '**Tidak kalah bagus** 👍', '**Dapat dipertimbangkan** 🤔'];
  surviving.slice(0, 3).forEach((crop, i) => {
    const emoji = EMOJI[crop.name] || '🌱';
    const label = labels[i] || `**Peringkat ${i + 1}**`;
    const scoreNum = parseInt(crop.score, 10) || 0;
    lines.push(`${emoji} **${crop.name}** — ${label}`);
    lines.push(`Skor: ${crop.score} dari 100`);
    lines.push('');
    lines.push('**Rincian Skor:**');
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
    lines.push(`• **Total Skor: ${crop.score} dari 100**`);
    lines.push('');

    // Generate brief interpretation based on breakdown
    const topCriteria = Object.entries(crop.breakdown)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 2)
      .map(([key]) => {
        const criterionLabels: Record<string, string> = {
          'biaya': 'biaya produksi rendah',
          'harga': 'harga jual tinggi',
          'produktivitas': 'produktivitas tinggi',
          'risiko': 'risiko gagal panen rendah',
          'permintaan': 'permintaan pasar tinggi',
        };
        return criterionLabels[key] || key;
      });
    if (topCriteria.length > 0) {
      lines.push(`*Tanaman ini unggul karena ${topCriteria.join(' dan ')}.*`);
      lines.push('');
    }
  });
  if (eliminated.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push(`Sayangnya, **${eliminated.length} tanaman** tidak cocok dengan lahan:`);
    lines.push('');
    eliminated.forEach(c => { lines.push(`• **${c.name}**: ${c.reasons[0] || 'Kondisi lahan kurang cocok'}`); });
    lines.push('');
  }
  if (preferences.length > 0) {
    const prefLabels: Record<string, string> = {
      'pref_biaya': 'Biaya produksi rendah',
      'pref_harga': 'Harga jual tinggi',
      'pref_produktivitas': 'Produktivitas tinggi',
      'pref_risiko': 'Risiko rendah',
      'pref_permintaan': 'Permintaan pasar tinggi',
    };
    lines.push('---');
    lines.push('');
    lines.push(`**Prioritas Anda:** ${preferences.map(p => prefLabels[p] || p).join(', ')}`);
    lines.push('Perhitungan disesuaikan berdasarkan pilihan Bapak/Ibu.');
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
    'Berdasarkan kondisi yang diberikan, **semua tanaman tidak cocok**:',
    '',
  ];
  eliminated.forEach(c => { lines.push(`• **${c.name}**: ${c.reasons[0] || 'Kondisi lahan kurang cocok'}`); });
  lines.push('');
  lines.push('**Saran:** Perbaiki drainase, lakukan pengapuran jika tanah terlalu asam, atau konsultasikan dengan penyuluh setempat.');
  lines.push('');
  lines.push(`Jangan berkecil hati, ${s}. Kondisi lahan bisa diperbaiki. Mau coba dengan kondisi lain?`);
  return lines.join('\n');
}

export function detailMessage(cropName: string, score: string, explanation?: string, breakdown?: Record<string, { score: number; label: string }>): string {
  const emoji = EMOJI[cropName] || '🌱';
  const lines: string[] = [
    `${emoji} **${cropName}** — Detail Analisis`,
    '',
    `**Skor**: ${score} dari 100`,
  ];

  // Only show explanation if it's user-friendly (not API internal text)
  const isApiInternal = explanation && (
    explanation.includes('relevansi') ||
    explanation.includes('NLP') ||
    explanation.includes('skor SAW')
  );
  if (explanation && !isApiInternal) {
    lines.push('');
    lines.push(explanation);
  }
  if (breakdown && Object.keys(breakdown).length > 0) {
    const criterionLabels: Record<string, string> = {
      'biaya': 'Biaya Produksi',
      'harga': 'Harga Jual',
      'produktivitas': 'Produktivitas',
      'risiko': 'Risiko',
      'permintaan': 'Permintaan',
    };
    lines.push('');
    lines.push('**Rincian Skor:**');
    Object.entries(breakdown).forEach(([key, val]) => {
      lines.push(`• ${criterionLabels[key] || key}: ${val.score}/5 (${val.label})`);
    });

    // Generate recommendation based on breakdown
    const topCriterion = Object.entries(breakdown)
      .sort(([, a], [, b]) => b.score - a.score)[0];
    if (topCriterion) {
      const [topKey] = topCriterion;
      const recommendations: Record<string, string> = {
        'biaya': 'Cocok untuk Anda yang mengutamakan biaya rendah',
        'harga': 'Pilihan baik jika Anda mengutamakan harga jual tinggi',
        'produktivitas': 'Ideal untuk Anda yang menginginkan hasil panen melimpah',
        'risiko': 'Cocok untuk Anda yang lebih memilih keamanan dari gagal panen',
        'permintaan': 'Bagus untuk Anda yang mengutamakan kemudahan menjual hasil panen',
      };
      const rec = recommendations[topKey];
      if (rec) {
        lines.push('');
        lines.push(`*${rec}.*`);
      }
    }
  }
  return lines.join('\n');
}

// ─── Phase 7: Closing ─────────────────────────────────────────────────────────

export function closingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return [
    `Terima kasih, ${s} ${name}, sudah menggunakan Agri-SAW Pro! 🙏`,
    '',
    `Semoga rekomendasi ini membantu ${s} menentukan tanaman terbaik untuk lahan.`,
    '',
    'Ingat, ini baru langkah awal. Keputusan tetap di tangan Bapak/Ibu yang lebih memahami kondisi lapangan.',
    '',
    `Kalau hasil ini dirasa kurang sesuai, ${s} bisa coba lagi dengan data yang berbeda, atau konsultasikan dengan penyuluh pertanian di daerah ${s} untuk pendalaman lebih lanjut.`,
    '',
    `Sampai jumpa lagi, ${s}. Selamat bertani! 🌱`,
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
