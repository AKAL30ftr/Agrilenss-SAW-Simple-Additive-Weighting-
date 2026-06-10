/**
 * FAQ Content — Agri-SAW Pro Chatbot
 * Source: SPK.md, dasar knowledge base.md
 * 5 Kategori, 21 Pertanyaan
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
  // Kategori 1: Tentang Sistem — 4 pertanyaan
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'cat_sistem',
    title: 'Tentang Sistem',
    items: [
      {
        id: 'faq_sistem_apa',
        question: 'Apa itu Agri-SAW Pro?',
        answer: [
          'Agri-SAW Pro adalah **sistem pendukung keputusan** yang dirancang untuk membantu petani memilih tanaman terbaik berdasarkan **kondisi lahan** dan **analisis keuntungan**.',
          '',
          'Sistem ini menggunakan **2 tahap perhitungan**:',
          '',
          '• **Tahap 1 — Kesesuaian Lahan:** Menyaring tanaman yang secara alami cocok dengan lahan Anda (pH tanah, tekstur tanah, ketinggian, sinar matahari, curah hujan).',
          '• **Tahap 2 — Analisis Keuntungan:** Meranking tanaman yang lolos berdasarkan data ekonomi (biaya produksi, harga jual, hasil panen, risiko gagal, permintaan pasar).',
          '',
          'Hasil akhirnya adalah rekomendasi tanaman yang tidak hanya **cocok dengan lahan** Anda, tetapi juga **menguntungkan secara ekonomi**.',
        ].join('\n'),
      },
      {
        id: 'faq_sistem_komoditas',
        question: 'Tanaman apa saja yang bisa dianalisis?',
        answer: [
          'Saat ini Agri-SAW Pro mendukung **6 tanaman utama** yang paling banyak dibudidayakan di Indonesia:',
          '',
          '• 🌾 **Padi** — Tanaman pangan pokok, cocok di dataran rendah-sedang, butuh banyak air',
          '• 🌽 **Jagung** — Tanaman pangan serbaguna, cocok di berbagai ketinggian, tahan kering',
          '• 🫘 **Kedelai** — Tanaman perbaik tanah, cocok di dataran rendah-sedang, butuh air sedang',
          '• 🌶️ **Cabai Merah** — Sayuran bernilai tinggi, cocok di dataran rendah-tinggi, butuh sinar matahari cukup',
          '• 🧅 **Bawang Merah** — Sayuran permintaan tinggi, cocok di dataran rendah-sedang, butuh sinar matahari penuh',
          '• 🧄 **Bawang Putih** — Sayuran dataran tinggi, cocok di pegunungan, butuh sinar matahari penuh',
          '',
          'Keenam tanaman ini dipilih karena memiliki **nilai ekonomi tinggi** dan **kebutuhan lahan yang berbeda-beda**, sehingga sistem bisa memberikan perbandingan yang jelas.',
        ].join('\n'),
      },
      {
        id: 'faq_sistem_cara',
        question: 'Bagaimana cara kerja sistem?',
        answer: [
          'Agri-SAW Pro bekerja dalam **2 tahap perhitungan berurutan**:',
          '',
          '**Tahap 1 — Kesesuaian Lahan**',
          'Anda akan diminta menjawab pertanyaan tentang kondisi lahan: keasaman tanah, tekstur tanah, ketinggian, sinar matahari, dan curah hujan. Jawaban bisa dalam bahasa sehari-hari — tidak perlu angka teknis. Sistem kemudian mencocokkan dengan data setiap tanaman. Jika **satu saja** kondisi lahan di luar batas, tanaman tersebut **langsung dikeluarkan**.',
          '',
          '**Tahap 2 — Perhitungan Keuntungan**',
          'Tanaman yang lolos Tahap 1 kemudian dihitung keuntungannya berdasarkan 5 hal: biaya produksi, harga jual, hasil panen, risiko gagal, dan permintaan pasar. Anda bisa memilih **prioritas** untuk menentukan hal yang lebih penting bagi Anda.',
          '',
          '**Hasil Akhir**',
          'Sistem menampilkan **ranking tanaman** yang paling cocok dan menguntungkan untuk lahan Anda, lengkap dengan penjelasannya.',
        ].join('\n'),
      },
      {
        id: 'faq_sistem_filter',
        question: 'Apa perbedaan Tahap 1 dan Tahap 2?',
        answer: [
          'Kedua tahap ini memiliki **fungsi yang berbeda**, namun saling melengkapi:',
          '',
          '**Tahap 1 — Kesesuaian Lahan**',
          '• **Fungsi:** Menentukan apakah tanaman **bisa tumbuh** di lahan Anda',
          '• **Cara kerja:** Mengecek setiap kondisi lahan dengan batas yang sudah ditentukan',
          '• **Sifat:** Batas keras — jika satu kondisi di luar batas, tanaman langsung dikeluarkan',
          '• **Yang dicek:** Keasaman tanah, tekstur tanah, ketinggian, sinar matahari, curah hujan',
          '',
          '**Tahap 2 — Perhitungan Keuntungan**',
          '• **Fungsi:** Menentukan tanaman mana yang **paling menguntungkan** dari yang lolos Tahap 1',
          '• **Cara kerja:** Menghitung skor berdasarkan data ekonomi dengan metode perhitungan tertimbang',
          '• **Sifat:** Semua faktor ekonomi ditimbang bersama untuk menghasilkan ranking',
          '• **Yang dicek:** Biaya produksi, harga jual, hasil panen, risiko gagal, permintaan pasar',
          '',
          '**Analogi sederhana:** Tahap 1 memastikan tanaman **bisa hidup**, Tahap 2 memastikan tanaman **menguntungkan**.',
        ].join('\n'),
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 2: Tentang Komoditas — 3 pertanyaan
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'cat_komoditas',
    title: 'Tentang Komoditas',
    items: [
      {
        id: 'faq_komoditas_daftar',
        question: 'Tanaman apa saja yang bisa dianalisis?',
        answer: [
          'Agri-SAW Pro saat ini mendukung **6 tanaman** yang merupakan tanaman pangan dan sayuran utama di Indonesia:',
          '',
          '• 🌾 **Padi** — Tanaman pangan pokok, permintaan pasar paling tinggi. Biaya Rp 7,2 juta/ha, hasil 5,28 ton/ha.',
          '• 🌽 **Jagung** — Tanaman pangan serbaguna, biaya produksi rendah (Rp 6,2 juta/ha), hasil 5,57 ton/ha.',
          '• 🫘 **Kedelai** — Tanaman yang bisa menyuburkan tanah, biaya produksi paling rendah (Rp 5,4 juta/ha), harga jual tinggi (Rp 16.459/kg).',
          '• 🌶️ **Cabai Merah** — Sayuran dengan harga jual tertinggi (Rp 52.001/kg), namun biaya produksi juga tinggi (Rp 48,5 juta/ha).',
          '• 🧅 **Bawang Merah** — Sayuran dengan hasil panen tertinggi (10,05 ton/ha) dan permintaan sangat tinggi.',
          '• 🧄 **Bawang Putih** — Sayuran dataran tinggi, biaya produksi tertinggi (Rp 91,6 juta/ha), namun harga jual dan permintaan juga tinggi.',
          '',
          'Masing-masing tanaman memiliki **kebutuhan lahan yang berbeda**, sehingga tidak semua tanaman cocok untuk setiap lahan.',
        ].join('\n'),
      },
      {
        id: 'faq_komoditas_mengapa',
        question: 'Mengapa hanya 6 tanaman?',
        answer: [
          'Pemilihan 6 tanaman ini didasarkan pada **pertimbangan penelitian**:',
          '',
          '• **Tanaman pangan utama:** Padi, jagung, dan kedelai adalah tanaman pangan penyumbang ketahanan pangan nasional.',
          '• **Nilai ekonomi tinggi:** Cabai merah, bawang merah, dan bawang putih adalah sayuran dengan harga jual dan permintaan pasar yang besar.',
          '• **Kebutuhan lahan beragam:** Keenam tanaman ini memiliki karakteristik kebutuhan lingkungan yang **berbeda-beda** — dari dataran rendah hingga pegunungan, dari tanah lembab hingga tanah kering.',
          '• **Data tersedia:** Data agroklimat dan ekonomi untuk 6 tanaman ini tersedia dari sumber resmi (BPS, Kementerian Pertanian) yang memadai untuk perhitungan.',
          '',
          'Penelitian ini difokuskan pada **kedalaman analisis** agar rekomendasi yang dihasilkan benar-benar akurat.',
        ].join('\n'),
      },
      {
        id: 'faq_komoditas_tidakada',
        question: 'Bagaimana jika tanaman saya tidak ada di daftar?',
        answer: [
          'Jika tanaman yang Anda inginkan tidak termasuk dalam 6 tanaman yang didukung, berikut beberapa hal yang perlu diketahui:',
          '',
          '• Sistem hanya bisa menganalisis tanaman yang ada dalam database. Ini karena setiap tanaman memiliki data kebutuhan lahan dan data ekonomi spesifik yang sudah diteliti.',
          '',
          '• Anda tetap bisa menggunakan sistem untuk melihat dari 6 tanaman yang ada, mana yang paling cocok dengan lahan Anda.',
          '',
          '• **Alternatif lain:** Anda bisa berkonsultasi dengan **penyuluh pertanian setempat** atau **Dinas Pertanian** untuk rekomendasi tanaman di luar daftar.',
          '',
          '• **Ke depan:** Pengembangan sistem selanjutnya dapat menambahkan lebih banyak tanaman.',
          '',
          'Meskipun tanaman Anda tidak ada di daftar, sistem tetap bisa membantu Anda memilih **tanaman terbaik dari yang tersedia** untuk kondisi lahan Anda.',
        ].join('\n'),
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 3: Tentang Kondisi Lingkungan — 4 pertanyaan
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'cat_lingkungan',
    title: 'Tentang Kondisi Lingkungan',
    items: [
      {
        id: 'faq_lingkungan_ph',
        question: 'Bagaimana cara mengetahui keasaman tanah?',
        answer: [
          '**Keasaman tanah (pH)** menunjukkan tingkat asam atau basa pada tanah. pH 7 bersifat netral, di bawah 7 bersifat asam, di atas 7 bersifat basa.',
          '',
          '**Cara sederhana memperkirakan keasaman tanah:**',
          '• **Tanaman sering menguning dan kerdil** meskipun sudah dipupuk → kemungkinan tanah **asam**',
          '• **Tanaman tumbuh hijau subur** → kemungkinan tanah **netral**',
          '',
          '**Cara mengukur lebih akurat:**',
          '• Gunakan **kertas lakmus** atau **alat ukur pH** yang tersedia di toko pertanian',
          '• Ambil sampel tanah dari kedalaman 15-20 cm, keringkan, lalu larutkan dalam air',
          '• Ukur larutan tersebut dengan alat ukur pH',
          '',
          '**Tips:** Jika tanah terlalu asam, lakukan **pengapuran** menggunakan dolomit atau kapur pertanian. Jika terlalu basa, tambahkan **kompos** atau pupuk kandang.',
        ].join('\n'),
      },
      {
        id: 'faq_lingkungan_tekstur',
        question: 'Bagaimana cara mengetahui tekstur tanah?',
        answer: [
          '**Tekstur tanah** adalah komposisi partikel pasir, debu, dan lempung dalam tanah. Tekstur menentukan kemampuan tanah menahan air dan nutrisi.',
          '',
          '**Cara sederhana mengetahui tekstur tanah:**',
          '• Ambil segenggam tanah basah, lalu remas:',
          '  - **Terasa sangat lengket dan sulit lepas** → Tanah **liat** (cocok untuk Padi)',
          '  - **Terasa kasar seperti pasir, mudah hancur** → Tanah **berpasir** (cocok untuk Bawang)',
          '  - **Terasa sedikit lengket, bisa dibentuk** → Tanah **lempung** (cocok untuk Jagung, Kedelai)',
          '',
          '**Karakteristik masing-masing tekstur:**',
          '• **Liat:** Mentahan air dengan baik, subur tapi sulit diolah saat kering',
          '• **Berpasir:** Air cepat kering, tapi drainase sangat baik',
          '• **Lempung:** Keseimbangan antara drainase dan retensi air, paling serbaguna',
        ].join('\n'),
      },
      {
        id: 'faq_lingkungan_hujan',
        question: 'Bagaimana cara memperkirakan curah hujan?',
        answer: [
          '**Curah hujan** adalah jumlah air hujan yang jatuh di suatu area dalam peri tertentu, biasanya dinyatakan dalam milimeter (mm).',
          '',
          '**Cara sederhana memperkirakan curah hujan:**',
          '• **Hampir tiap hari hujan** → Curah hujan **tinggi** (800-1.500 mm/tahun)',
          '• **Sering hujan** (beberapa kali seminggu) → Curah hujan **sedang** (400-800 mm/musim)',
          '• **Hanya sesekali hujan** → Curah hujan **rendah** (200-400 mm/musim)',
          '',
          '**Cara mengukur lebih akurat:**',
          '• Gunakan **penakar hujan** — wadah silinder yang diletakkan di area terbuka',
          '• Ukur tinggi air yang terkumpul setelah hujan dalam milimeter',
          '• Lakukan pengukuran setiap hari selama minimal 1 bulan',
          '',
          '**Kebutuhan air masing-masing tanaman:**',
          '• Padi: butuh banyak air (1.500-2.000 mm/tahun)',
          '• Jagung: sedang (500-1.200 mm/musim)',
          '• Kedelai: sedang (350-600 mm/musim)',
          '• Cabai Merah: sedang (600-1.250 mm/tahun)',
          '• Bawang Merah: rendah (300-400 mm/musim)',
          '• Bawang Putih: rendah (110-200 mm/bulan)',
        ].join('\n'),
      },
      {
        id: 'faq_lingkungan_cahaya',
        question: 'Bagaimana cara memperkirakan sinar matahari?',
        answer: [
          '**Intensitas cahaya** dalam pertanian mengacu pada **lama paparan sinar matahari langsung** yang diterima lahan setiap hari, diukur dalam jam per hari.',
          '',
          '**Cara sederhana memperkirakan sinar matahari:**',
          '• Hitung berapa jam lahan Anda terpapar sinar matahari **tanpa terhalang** pohon besar, bangunan, atau atap',
          '• **6-8 jam** → cocok untuk Padi dan Jagung',
          '• **8-10 jam** → cocok untuk Kedelai dan Cabai Merah',
          '• **12+ jam** → cocok untuk Bawang Merah dan Bawang Putih',
          '',
          '**Tips:**',
          '• Lahan yang teduh karena pohon besar atau bangunan akan mengurangi sinar matahari',
          '• Bawang Putih dan Bawang Merah **sangat butuh** sinar matahari penuh (12+ jam) untuk menghasilkan umbi yang baik',
          '• Kalau lahan Anda teduh, pertimbangkan untuk memangkas pohon peneduh atau memilih tanaman yang tahan naungan',
        ].join('\n'),
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 4: Tentang Filter 1 — Kesesuaian Lingkungan — 5 pertanyaan
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'cat_filter1',
    title: 'Tentang Filter 1 — Kesesuaian Lingkungan',
    items: [
      {
        id: 'faq_filter1_apa',
        question: 'Apa itu Tahap 1 (Kesesuaian Lahan)?',
        answer: [
          '**Tahap 1** adalah tahap pertama dalam sistem Agri-SAW Pro yang berfungsi sebagai **penyaring awal** untuk menentukan apakah suatu tanaman **secara alami bisa tumbuh** di lahan Anda.',
          '',
          '**Cara kerja Tahap 1:**',
          '• Sistem menerima data kondisi lahan Anda: keasaman tanah, tekstur tanah, ketinggian, sinar matahari, dan curah hujan',
          '• Setiap kondisi dicek terhadap **batas optimal** yang sudah ditentukan untuk masing-masing tanaman',
          '• Jika **satu saja** kondisi di luar batas yang diizinkan, tanaman tersebut **langsung dikeluarkan**',
          '',
          '**Mengapa Tahap 1 penting?**',
          'Tanpa tahap ini, sistem bisa saja merekomendasikan tanaman dengan keuntungan tinggi pada lahan yang secara alami **tidak mendukung** pertumbuhannya. Tahap 1 mencegah rekomendasi yang menguntungkan di kertas tapi mustahil di lapangan.',
          '',
          '**Hasil Tahap 1:** Daftar tanaman yang secara agronomis "Layak Tanam", yang kemudian diteruskan ke Tahap 2 untuk perhitungan keuntungan.',
        ].join('\n'),
      },
      {
        id: 'faq_filter1_param',
        question: 'Kondisi lahan apa saja yang ditanyakan?',
        answer: [
          'Tahap 1 memeriksa **5 kondisi lahan** yang menentukan kesesuaian tanaman:',
          '',
          '• **Keasaman Tanah (pH)** — Tingkat asam atau basa tanah. Contoh: Padi butuh pH 5,5-6,5, Bawang Putih butuh pH 6,0-7,0.',
          '',
          '• **Tekstur Tanah** — Komposisi tanah: liat, lempung, atau berpasir. Contoh: Padi cocok di tanah liat, Bawang Merah di tanah berpasir.',
          '',
          '• **Ketinggian Lokasi** — Ketinggian lahan di atas permukaan laut. Contoh: Bawang Putih butuh ketinggian 700-1.100 meter, Padi maksimal 650 meter.',
          '',
          '• **Sinar Matahari (jam/hari)** — Lama paparan sinar matahari langsung. Contoh: Bawang Merah butuh 12+ jam, Padi cukup 8-10 jam.',
          '',
          '• **Curah Hujan** — Jumlah air hujan di wilayah Anda. Contoh: Padi butuh banyak air (1.500-2.000 mm/tahun), Kedelai cukup sedang (350-600 mm/musim).',
          '',
          '**Yang perlu diingat:** Anda **tidak perlu** memberikan angka pasti. Sistem akan bertanya dalam bahasa sehari-hari dan mengkonversi jawaban Anda.',
        ].join('\n'),
      },
      {
        id: 'faq_filter1_eliminasi',
        question: 'Mengapa ada tanaman yang dikeluarkan?',
        answer: [
          'Tanaman dikeluarkan dari daftar ketika **kondisi lahan tidak memenuhi syarat minimum** untuk pertumbuhan optimal tanaman tersebut.',
          '',
          '**Contoh sederhana:**',
          '• Kalau lahan Anda di ketinggian **200 meter**, maka **Bawang Putih** (butuh 700-1.100 meter) langsung dikeluarkan karena butuh udara pegunungan yang dingin.',
          '• Kalau tanah Anda sangat asam (pH **4,0**), maka **Kedelai** (butuh pH 6,0-7,0) dikeluarkan karena tidak bisa tumbuh optimal di tanah terlalu asam.',
          '• Kalau lahan Anda hanya dapat sinar matahari **5 jam/hari**, maka **Bawang Merah** (butuh 12+ jam) dikeluarkan.',
          '',
          '**Tujuannya:** Mencegah Anda menanam tanaman yang secara alami **tidak akan tumbuh meskipun** potensi ekonominya menjanjikan.',
        ].join('\n'),
      },
      {
        id: 'faq_filter1_semua',
        question: 'Bagaimana jika semua tanaman dikeluarkan?',
        answer: [
          'Jika **semua 6 tanaman** dikeluarkan, artinya kondisi lahan Anda berada di luar batas optimal untuk semua tanaman yang didukung.',
          '',
          '**Yang bisa Anda lakukan:**',
          '• Perbaiki **drainase** jika tanah terlalu basah atau tergenang',
          '• Lakukan **pengapuran** jika tanah terlalu asam',
          '• Tambah **mulsa** atau bahan organik jika tanah terlalu kering',
          '• Pertimbangkan **sistem irigasi** jika curah hujan rendah',
          '',
          '**Langkah selanjutnya:**',
          '• Anda bisa **mencoba kembali** setelah melakukan perbaikan lahan',
          '• Konsultasikan dengan **penyuluh pertanian** atau **Dinas Pertanian setempat** untuk rekomendasi tanaman lain',
          '',
          '**Catatan:** Kondisi ini jarang terjadi, karena setidaknya beberapa dari 6 tanaman biasanya cocok untuk sebagian besar lahan di Indonesia.',
        ].join('\n'),
      },
      {
        id: 'faq_filter1_kurangyakin',
        question: 'Apa artinya "kurang yakin"?',
        answer: [
          'Pesan "kurang yakin" muncul ketika sistem **tidak bisa menentukan** kondisi lahan Anda secara pasti berdasarkan jawaban yang diberikan.',
          '',
          '**Penyebab munculnya pesan ini:**',
          '• Jawaban Anda **tidak cukup spesifik** untuk dikonversi ke data yang dibutuhkan',
          '• Jawaban Anda **ambigu** atau bisa diinterpretasikan ke beberapa kategori sekaligus',
          '',
          '**Contoh situasi:**',
          '• Kalau Anda menjawab "tanah saya normal" untuk keasaman tanah — sistem tidak tahu persis maksudnya',
          '• Kalau Anda menjawab "kadang hujan kadang tidak" — sistem perlu informasi lebih spesifik',
          '',
          '**Cara mengatasinya:**',
          '• Berikan jawaban yang **lebih detail** dan **spesifik**',
          '• Kalau tidak tahu angka pastinya, deskripsikan kondisi Anda sedetail mungkin',
          '• Sistem akan membantu **mengklarifikasi** jawaban Anda',
          '',
          '**Tujuannya:** Memastikan rekomendasi yang diberikan **seakurat mungkin** berdasarkan data yang valid.',
        ].join('\n'),
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // Kategori 5: Tentang Filter 2 — Analisis Keuntungan — 4 pertanyaan
  // ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'cat_filter2',
    title: 'Tentang Filter 2 — Analisis Keuntungan',
    items: [
      {
        id: 'faq_filter2_apa',
        question: 'Apa itu Tahap 2 (Perhitungan Keuntungan)?',
        answer: [
          '**Tahap 2** adalah tahap kedua dalam sistem Agri-SAW Pro yang berfungsi untuk **meranking tanaman** yang telah lolos Tahap 1 berdasarkan **keuntungan ekonomi**.',
          '',
          '**Cara kerja Tahap 2:**',
          '• Tanaman yang lolos Tahap 1 dievaluasi berdasarkan **5 faktor ekonomi**',
          '• Setiap faktor dinilai dan ditimbang sesuai tingkat kepentingannya',
          '• Hasil penimbangan menghasilkan **skor akhir** untuk masing-masing tanaman',
          '• Tanaman dengan skor **paling tinggi** adalah yang paling direkomendasikan',
          '',
          '**Mengapa Tahap 2 diperlukan?**',
          'Karena tidak ada gunanya menanam tanaman yang cocok dengan lahan tapi **tidak menguntungkan secara ekonomi**. Tahap 2 memastikan rekomendasi akhir adalah tanaman yang **cocok DAN menguntungkan**.',
          '',
          '**Contoh:** Bawang Merah dan Bawang Putih sama-sama lolos Tahap 1. Tapi Tahap 2 akan menghitung mana yang lebih menguntungkan berdasarkan biaya, harga, hasil panen, risiko, dan permintaan — dan menghasilkan ranking yang objektif.',
        ].join('\n'),
      },
      {
        id: 'faq_filter2_kriteria',
        question: 'Faktor ekonomi apa saja yang dihitung?',
        answer: [
          'Tahap 2 menggunakan **5 faktor ekonomi** yang menggambarkan modal, hasil, dan risiko:',
          '',
          '**Faktor yang semakin kecil semakin baik:**',
          '• **Biaya Produksi (Rp/ha)** — Total modal per hektar (benih, pupuk, pestisida, tenaga kerja).',
          '  - Contoh: Kedelai paling rendah (Rp 5,4 juta/ha), Bawang Putih paling tinggi (Rp 91,6 juta/ha)',
          '',
          '• **Risiko Gagal Panen (Skala 1-3)** — Tingkat kerentanan terhadap cuaca, hama, dan penyakit.',
          '  - Padi dan Jagung: risiko sedang, Kedelai dan Bawang Merah: risiko tinggi',
          '',
          '**Faktor yang semakin besar semakin baik:**',
          '• **Harga Jual (Rp/kg)** — Rata-rata harga pasar nasional.',
          '  - Cabai Merah tertinggi (Rp 52.001/kg), Jagung terendah (Rp 8.438/kg)',
          '',
          '• **Hasil Panen (ton/ha)** — Jumlah hasil per hektar.',
          '  - Bawang Merah tertinggi (10,05 ton/ha), Kedelai terendah (1,62 ton/ha)',
          '',
          '• **Permintaan Pasar (Skala 1-5)** — Kapasitas serap pasar.',
          '  - Padi dan Bawang Merah tertinggi (5), Jagung dan Kedelai (4)',
        ].join('\n'),
      },
      {
        id: 'faq_filter2_pref',
        question: 'Bagaimana cara memilih prioritas?',
        answer: [
          'Di Tahap 2, Anda bisa memilih **prioritas ekonomi** yang paling penting bagi Anda. Prioritas ini akan mempengaruhi perhitungan ranking.',
          '',
          '**Cara kerja prioritas:**',
          '• Anda memilih hal yang paling penting, misalnya:',
          '  - "Modal terbatas" → bobot **Biaya Produksi** lebih besar',
          '  - "Takut rugi" → bobot **Risiko Gagal Panen** lebih besar',
          '  - "Cepat laku" → bobot **Permintaan Pasar** lebih besar',
          '',
          '• Sistem akan menghitung ulang bobot berdasarkan pilihan Anda',
          '• Total semua bobot tetap 100%',
          '',
          '**Tips:** Pilih prioritas yang **benar-benar sesuai** dengan kondisi nyata Anda. Jangan memilih semua faktor sebagai prioritas tertinggi karena akan mengurangi perbedaan hasil.',
        ].join('\n'),
      },
      {
        id: 'faq_filter2_hasil',
        question: 'Bagaimana cara membaca hasil ranking?',
        answer: [
          'Setelah perhitungan selesai, sistem akan menampilkan **ranking tanaman** dari yang paling direkomendasikan.',
          '',
          '**Cara membaca hasil:**',
          '• **Peringkat 1** adalah tanaman yang paling direkomendasikan — memiliki keseimbangan terbaik antara kesesuaian lahan dan keuntungan ekonomi',
          '• **Skor** menunjukkan nilai tanaman (dari 100). Semakin tinggi, semakin optimal',
          '• Sistem juga menampilkan **data ekonomi** setiap tanaman: biaya, harga, hasil panen, risiko, dan permintaan',
          '',
          '**Contoh interpretasi:**',
          '• Kalau **Padi** di peringkat 1 dengan skor 78 dari 100, artinya Padi paling optimal untuk lahan Anda — biaya rendah, risiko sedang, dan permintaan sangat tinggi',
          '• Kalau **Bawang Merah** di peringkat 2 dengan skor 65 dari 100, artinya Bawang Merah juga cocok tapi biaya produksinya yang tinggi mengurangi skor akhirnya',
          '',
          '**Hal yang perlu diperhatikan:**',
          '• Ranking hanya berlaku untuk tanaman yang **lolos Tahap 1**',
          '• Kalau hanya 1 tanaman yang lolos, sistem tetap menampilkan data ekonominya sebagai referensi',
        ].join('\n'),
      },
    ],
  },
];
