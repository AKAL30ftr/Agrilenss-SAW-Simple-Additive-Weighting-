/**
 * All bot messages — humanizer version
 * Source of truth: VOICE-AND-TONE-FINDINGS.md
 * Every message function receives (name, gender) for proper sapaan.
 */

export type Sapaan = 'laki' | 'perempuan';

function sap(gender: Sapaan | ''): string {
  return gender === 'perempuan' ? 'Ibu' : 'Pak';
}

// ─── Phase 1: Welcome ─────────────────────────────────────────────────────────

export function welcomeMessage(): string {
  return 'Halo! Selamat datang di Agri-SAW Pro. 🌾\n\nSaya adalah asisten virtual yang akan membantu merekomendasikan komoditas pertanian terbaik untuk lahan Bapak/Ibu.\n\nSebelum mulai, silakan isi data diri dulu ya:';
}

// ─── Phase 2: Ringkasan ───────────────────────────────────────────────────────

export function ringkasanMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Terima kasih, ${s} ${name}! Sebelum kita mulai, izinkan saya menjelaskan singkat cara kerja sistem ini.\n\nSaya akan membantu ${s} ${name} memilih komoditas terbaik untuk lahan ${s}. Caranya begini:\n\nPertama, saya akan menanyakan 5 kondisi lahan — seperti ketinggian, curah hujan, dan kondisi tanah. Nanti saya cocokkan dengan 6 jenis tanaman: Padi, Jagung, Kedelai, Cabai, Bawang Merah, dan Bawang Putih.\n\nTanaman yang cocok dengan lahan, kemudian saya hitung mana yang paling menguntungkan — dilihat dari biaya tanam, harga jual, sampai risikonya.\n\nGampangnya begitu, ${s}. Ada yang ingin ditanyakan dulu, atau langsung mulai?`;
}

// ─── Phase 3: Collecting ──────────────────────────────────────────────────────

export function collectingQuestion(param: string, name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  const questions: Record<string, string> = {
    'ketinggian': `Baik, ${s} ${name}. Selanjutnya saya ingin tahu soal ketinggian lahan ${s}. Ini penting karena beda ketinggian, beda juga suhu dan jenis tanaman yang bisa tumbuh. Kira-kira lahan ${s} di dataran rendah, sedang, atau pegunungan?`,
    'curah hujan': `Oke, selanjutnya saya ingin menanyakan terkait curah hujan di lingkungan lokasi ${s}. Air adalah kebutuhan utama tanaman, jadi ini salah satu hal yang paling penting. Kira-kira seberapa sering hujannya, ${s}?`,
    'pH tanah': `Baik, selanjutnya soal kondisi tanah. Ini agak sulit diamati langsung, tapi ${s} pernah tidak melihat tanaman di lahan ${s} sering menguning atau kerdil? Atau tumbuh biasa saja?`,
    'tekstur tanah': `Selanjutnya, saya ingin menanyakan tentang tekstur tanah di lahan ${s}. Cara mudahnya, kalau diambil dan dibasahi, tanah ${s} terasa lengket, gembur, atau kasar seperti pasir?`,
    'intensitas cahaya': `Terakhir, saya ingin menanyakan tentang paparan sinar matahari di lahan ${s}. Kira-kira seberapa lama lahan ${s} terkena sinar matahari langsung setiap harinya?`,
  };
  return questions[param] || '';
}

export function kurangYakinFallback(param: string, name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  const fallbacks: Record<string, string> = {
    'ketinggian': `Tidak masalah, ${s} ${name}. Coba perhatikan suhu di lahan ${s}. Kalau terik dan panas, biasanya dataran rendah (0-400 meter). Kalau agak sejuk, dataran sedang (400-700 meter). Kalau dingin dan berembus angin, biasanya pegunungan (700+ meter). Perkiraan kasar sudah cukup, ${s}.`,
    'curah hujan': `Tidak masalah, ${s} ${name}. Coba ingat-ingat, dalam sebulan terakhir, kira-kira berapa kali hujan deras? Kalau hampir setiap hari, berarti curah hujan tinggi. Kalau seminggu sekali atau kurang, berarti rendah. Perkiraan kasar sudah cukup, ${s}.`,
    'pH tanah': `Tidak masalah, ${s} ${name}. Coba perhatikan tanaman di lahan ${s}. Kalau daun sering menguning atau tanaman kerdil, kemungkinan tanah asam. Kalau tumbuh hijau dan subur, kemungkinan tanah netral. Perkiraan kasar sudah cukup, ${s}.`,
    'tekstur tanah': `Tidak masalah, ${s} ${name}. Coba ambil tanah di lahan ${s}, lalu basahi sedikit. Kalau terasa lengket dan bisa dibentuk, berarti tanah liat. Kalau terasa halus dan gembur, berarti lempung. Kalau terasa kasar seperti pasir, berarti tanah berpasir. Perkiraan kasar sudah cukup, ${s}.`,
    'intensitas cahaya': `Tidak masalah, ${s} ${name}. Coba perhatikan, pagi sampai sore, kira-kira berapa jam lahan ${s} terkena sinar matahari langsung? Kalau ada pohon besar atau bangunan yang menghalangi, biasanya 6-8 jam. Kalau terbuka, bisa 10-12 jam. Perkiraan kasar sudah cukup, ${s}.`,
  };
  return fallbacks[param] || `Silakan ketik perkiraan ${param} ${s}. Perkiraan kasar sudah cukup.`;
}

// ─── Phase 4: Confirming ──────────────────────────────────────────────────────

export function confirmingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Baik, ${s} ${name}! Semua data lahan sudah terkumpul. Silakan periksa dulu, apakah data di bawah ini sudah benar:\n\nKalau ada yang salah, saya bisa ulangi dari awal.`;
}

// ─── Phase 5: Preference ──────────────────────────────────────────────────────

export function preferenceMessage(name: string, gender: Sapaan | '', survivingCount: number, cropList: string): string {
  const s = sap(gender);
  return `Bagus, ${s} ${name}! Dari 6 jenis tanaman, ada ${survivingCount} yang cocok dengan lahan ${s}: ${cropList}.\n\nSekarang, untuk menentukan ranking terbaik, saya perlu tahu prioritas ${s}. Mana yang lebih penting? ${s} bisa pilih sampai 3.`;
}

// ─── Phase 6: Result ──────────────────────────────────────────────────────────

export function resultMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `${s} ${name}, berikut hasil rekomendasi saya berdasarkan kondisi lahan ${s}:`;
}

export function singleCropResultMessage(name: string, gender: Sapaan | '', cropName: string): string {
  const s = sap(gender);
  return `${s} ${name}, berdasarkan kondisi lahan ${s}, ${cropName} adalah tanaman yang paling cocok. Sayangnya, dari 6 jenis tanaman lainnya tidak lolos karena kondisi lahan yang kurang cocok.`;
}

export function eliminatedSectionHeader(count: number): string {
  return `Dari 6 jenis tanaman, ${count} tidak lolos karena kondisi lahan yang kurang cocok:`;
}

export function allEliminatedMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Maaf, ${s} ${name}, berdasarkan kondisi yang diberikan, semua komoditas dieliminasikan. Tapi jangan khawatir, saya bisa bantu ${s} mempelajari cara memperbaiki kondisi lahan.`;
}

// ─── Phase 7: Closing ─────────────────────────────────────────────────────────

export function closingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Terima kasih, ${s} ${name}, sudah menggunakan Agri-SAW Pro! 🙏\n\nSemoga rekomendasi ini membantu ${s} menentukan tanaman yang terbaik untuk lahan. Kalau ada pertanyaan lain atau mau konsultasi ulang, jangan sungkan ya, ${s}.\n\nKalau hasil ini dirasa kurang sesuai, ${s} juga bisa konsultasikan dengan penyuluh pertanian di daerah ${s} untuk pendalaman lebih lanjut.\n\nMau konsultasi ulang atau ada pertanyaan lain, ${s}?`;
}

// ─── Error messages ───────────────────────────────────────────────────────────

export function errorMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Maaf, ${s} ${name}, ada kendala teknis. Silakan coba lagi nanti, atau hubungi penyuluh pertanian setempat untuk konsultasi langsung.`;
}

// ─── Loading screen ───────────────────────────────────────────────────────────

export function loadingMessage(name: string, gender: Sapaan | ''): string {
  const s = sap(gender);
  return `Terima kasih atas kesabarannya, ${s} ${name}.\nHasil perhitungan sedang disusun...`;
}
