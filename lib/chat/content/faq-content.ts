/**
 * FAQ Content — Agri-SAW Pro Chatbot
 * Source: SPK.md, dasar knowledge base.md
 * Kategori: Sistem, Komoditas, Lingkungan, Filter 1, Filter 2
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_CONTENT: FaqSection[] = [
  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 1: Tentang Sistem
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'faq-sistem',
    title: 'Tentang Sistem',
    items: [
      {
        id: 'faq_sistem',
        question: 'Apa itu Agri-SAW Pro?',
        answer: [
          'Agri-SAW Pro adalah Sistem Pendukung Keputusan (SPK) yang membantu petani memilih komoditas pertanian terbaik berdasarkan kondisi lahan dan keuntungan ekonomi.',
          '',
          'Sistem ini menggunakan metode **Simple Additive Weighting (SAW)** dengan pendekatan **2 tahap analisis**:',
          '',
          '**Tahap 1 — Kesesuaian Lingkungan**: Menyaring komoditas yang cocok dengan kondisi lahan Anda (ketinggian, curah hujan, pH tanah, tekstur tanah, intensitas cahaya).',
          '',
          '**Tahap 2 — Analisis Keuntungan**: Meranking komoditas yang lolos berdasarkan data ekonomi (biaya produksi, harga jual, produktivitas, risiko, permintaan pasar).',
          '',
          'Hasil akhirnya adalah rekomendasi komoditas yang tidak hanya cocok dengan lahan Anda, tetapi juga menguntungkan secara ekonomi.',
        ].join('\n'),
      },
      {
        id: 'faq_tanaman',
        question: 'Apa saja komoditas yang didukung?',
        answer: [
          'Saat ini sistem mendukung **6 komoditas** utama:',
          '',
          '• 🌾 **Padi** — Tanaman pangan pokok, butuh banyak air',
          '• 🌽 **Jagung** — Tanaman pangan serba guna, cocok untuk berbagai kondisi',
          '• 🫘 **Kedelai** — Tanaman legum, bisa memperbaiki kesuburan tanah',
          '• 🌶️ **Cabai Merah** — Tanaman hortikultura, harga jual tinggi',
          '• 🧅 **Bawang Merah** — Tanaman sayur, permintaan pasar sangat tinggi',
          '• 🧄 **Bawang Putih** — Tanaman sayur, butuh spesifik kondisi dingin',
          '',
          'Enam komoditas ini dipilih karena merupakan tanaman yang paling banyak dibudidayakan di Indonesia dan memiliki nilai ekonomi yang signifikan.',
        ].join('\n'),
      },
      {
        id: 'faq_lahan',
        question: 'Bagaimana cara kerja sistem?',
        answer: [
          'Sistem bekerja dalam **4 langkah utama**:',
          '',
          '**Langkah 1 — Input Data Lahan**',
          'Anda menjawab 5 pertanyaan tentang kondisi lahan: ketinggian, curah hujan, pH tanah, tekstur tanah, dan intensitas cahaya. Jawaban dalam bahasa sehari-hari, tidak perlu angka teknis.',
          '',
          '**Langkah 2 — Filter 1 (Kesesuaian Lingkungan)**',
          'Sistem menyaring komoditas yang cocok dengan lahan Anda. Tanaman yang tidak cocok akan dieliminasikan dengan penjelasan alasannya.',
          '',
          '**Langkah 3 — Filter 2 (Analisis Keuntungan)**',
          'Untuk komoditas yang cocok, sistem menghitung ranking keuntungan berdasarkan data ekonomi yang Anda prioritaskan.',
          '',
          '**Langkah 4 — Rekomendasi Akhir**',
          'Sistem menampilkan ranking komoditas terbaik beserta penjelasan mengapa komoditas tersebut direkomendasikan.',
        ].join('\n'),
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 2: Tentang Filter 1 (Lingkungan)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'faq-filter1',
    title: 'Tentang Filter 1 — Kesesuaian Lingkungan',
    items: [
      {
        id: 'faq_filter1',
        question: 'Apa itu Filter 1?',
        answer: [
          '**Filter 1** adalah tahap pertama analisis yang menentukan apakah suatu komoditas **secara biologis cocok** dengan kondisi lahan Anda.',
          '',
          'Sistem memeriksa 5 parameter agroklimat:',
          '',
          '• **Ketinggian** — Mempengaruhi suhu udara',
          '• **Curah hujan** — Sumber air utama tanaman',
          '• **pH tanah** — Tingkat keasaman tanah',
          '• **Tekstur tanah** — Kemampuan tanah menahan air',
          '• **Intensitas cahaya** — Lama paparan sinar matahari',
          '',
          'Jika **satu saja** parameter di luar range optimal tanaman, maka tanaman tersebut **dieliminasikan**. Ini disebut *hard gate* — tidak ada toleransi.',
          '',
          'Contoh: Bawang Putih butuh ketinggian 700-1.100 mdpl. Jika lahan Anda di dataran rendah (200 mdpl), Bawang Putih langsung dieliminasikan.',
        ].join('\n'),
      },
      {
        id: 'faq_filter1_cek',
        question: 'Bagaimana jika semua tanaman dieliminasi?',
        answer: [
          'Jika semua 6 komoditas dieliminasikan, sistem akan menampilkan pesan:',
          '',
          '"Maaf, berdasarkan kondisi yang diberikan, semua komoditas dieliminasikan."',
          '',
          'Beserta **saran perbaikan**, misalnya:',
          '• Perbaiki drainase untuk tanah terlalu basah',
          '• Lakukan pengapuran untuk tanah terlalu asam',
          '• Konsultasikan dengan penyuluh pertanian setempat',
          '',
          'Anda bisa mencoba kembali dengan kondisi yang lebih spesifik.',
        ].join('\n'),
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 3: Tentang Filter 2 (Keuntungan)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'faq-filter2',
    title: 'Tentang Filter 2 — Analisis Keuntungan',
    items: [
      {
        id: 'faq_filter2',
        question: 'Apa itu Filter 2?',
        answer: [
          '**Filter 2** adalah tahap kedua analisis yang **meranking komoditas** yang lolos Filter 1 berdasarkan **keuntungan ekonomi**.',
          '',
          'Sistem menggunakan **5 kriteria ekonomi**:',
          '',
          '• **Biaya Produksi** (Cost): Semakin rendah, semakin baik',
          '• **Harga Jual** (Benefit): Semakin tinggi, semakin baik',
          '• **Produktivitas** (Benefit): Semakin tinggi, semakin baik',
          '• **Risiko Gagal Panen** (Cost): Semakin rendah, semakin baik',
          '• **Permintaan Pasar** (Benefit): Semakin tinggi, semakin baik',
          '',
          'Anda bisa memilih **prioritas** (sampai 3) untuk menentukan bobot kriteria. Misalnya, jika Anda pilih "Biaya produksi rendah", maka kriteria biaya akan mendapat bobot lebih tinggi.',
        ].join('\n'),
      },
      {
        id: 'faq_filter2_pref',
        question: 'Bagaimana jika hanya 1 tanaman yang cocok?',
        answer: [
          'Jika hanya 1 komoditas yang lolos Filter 1, sistem tetap bisa menghitung **estimasi keuntungan ekonominya**.',
          '',
          'Anda akan melihat:',
          '• Data ekonomi komoditas tersebut',
          '• Perbandingan dengan komoditas lain (untuk referensi)',
          '• Estimasi keuntungan berdasarkan luas lahan Anda',
          '',
          'Ini membantu Anda memahami potensi keuntungan meskipun hanya ada 1 pilihan.',
        ].join('\n'),
      },
    ],
  },
];
