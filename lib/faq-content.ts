// =============================================================================
// FAQ CONTENT — Agri-SAW Pro Chatbot
// =============================================================================
// Structured FAQ data for the chatbot knowledge base.
// Tone: Helpful extension officer (penyuluh pertanian). No jargon.
// Language: Bahasa Indonesia
// =============================================================================

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  fixSuggestion?: string;
}

export interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_CONTENT: FaqSection[] = [
  // ===========================================================================
  // SECTION 1: Tentang Metode SAW
  // ===========================================================================
  {
    id: 'faq-saw',
    title: 'Tentang Metode SAW',
    items: [
      {
        id: 'saw-apa-itu',
        question: 'Apa itu metode SAW?',
        answer:
          'SAW adalah singkatan dari Simple Additive Weighting, yaitu suatu metode pengambilan keputusan yang membantu memilih alternatif terbaik dari beberapa pilihan. Dalam konteks Agri-SAW Pro, metode ini digunakan untuk menentukan tanaman paling cocok berdasarkan kondisi lahan dan kebutuhan Anda.\n\nCara kerjanya sederhana: setiap tanaman diberi skor berdasarkan seberapa cocoknya dengan kondisi tanah, iklim, dan preferensi Anda. Tanaman dengan skor tertinggi adalah rekomendasi utama. Metode ini transparan — Anda bisa melihat mengapa suatu tanaman direkomendasikan.',
      },
      {
        id: 'saw-cara-kerja',
        question: 'Bagaimana cara kerja SAW dalam Agri-SAW Pro?',
        answer:
          'Agri-SAW Pro menggunakan dua tahap penyaringan. Tahap pertama (Filter 1) adalah penyaringan agroklimat — sistem mengecek apakah kondisi lahan Anda memenuhi syarat minimum untuk setiap tanaman. Tanaman yang tidak lolos syarat ini langsung dikeluarkan.\n\nTahap kedua (Filter 2) adalah perhitungan SAW berbobot. Tanaman yang lolos tahap pertama kemudian dinilai berdasarkan kriteria ekonomi seperti harga jual, biaya produksi, dan potensi pasar. Hasil akhirnya adalah peringkat tanaman dari yang paling cocok hingga yang paling tidak cocok untuk lahan Anda.',
      },
      {
        id: 'saw-mengapa-andal',
        question: 'Mengapa metode SAW bisa diandalkan untuk rekomendasi tanaman?',
        answer:
          'Metode SAW andal karena dua alasan utama. Pertama, metode ini menggunakan data nyata — bukan tebakan. Setiap keputusan didasarkan pada parameter terukur seperti pH tanah, curah hujan, dan ketinggian tempat.\n\nKedua, SAW bersifat transparan. Berbeda dengan sistem "kotak hitam" yang langsung memberikan jawaban tanpa penjelasan, SAW menunjukkan skor dan perhitungannya. Anda bisa memahami mengapa padi direkomendasikan di atas jagung, misalnya. Ini membuat keputusan lebih bisa dipercaya dan bisa didiskusikan dengan penyuluh pertanian.',
      },
    ],
  },

  // ===========================================================================
  // SECTION 2: Tentang Tanaman
  // ===========================================================================
  {
    id: 'faq-crops',
    title: 'Tentang Tanaman',
    items: [
      {
        id: 'crop-padi',
        question: 'Apa yang dibutuhkan tanaman padi untuk tumbuh optimal?',
        answer:
          'Padi membutuhkan tanah dengan pH antara 5,5 hingga 6,5, yang bersifat sedikit asam. Tekstur tanah yang paling cocok adalah liat atau liat berlempung — jenis tanah ini mampu menahan air dengan baik, yang sangat dibutuhkan padi.\n\nPadi tumbuh dataran rendah hingga ketinggian 650 meter di atas permukaan laut (mdpl). Curah hujan yang ideal adalah 1.500–2.000 mm per tahun, dan tanaman ini membutuhkan penyinaran matahari selama 8–10 jam per hari.\n\nKesalahan yang sering terjadi adalah menanam padi di tanah yang terlalu berpasir sehingga air cepat meresap, atau di daerah yang terlalu tinggi dan dingin. Pastikan juga pH tanah tidak terlalu asam (di bawah 5,5) karena bisa menghambat penyerapan nutrisi.',
        fixSuggestion:
          'Jika pH tanah terlalu asam, tambahkan kapur pertanian (dolomit). Jika tanah terlalu berpasir, tambahkan tanah liat dan pupuk organik untuk meningkatkan daya tampung air.',
      },
      {
        id: 'crop-jagung',
        question: 'Apa yang dibutuhkan tanaman jagung untuk tumbuh optimal?',
        answer:
          'Jagung cukup fleksibel terhadap pH tanah, yaitu antara 5,6 hingga 7,5 (dari sedikit asam hingga netral). Tekstur tanah yang cocok adalah lempung berpasir hingga berliat — tanah yang gembur tapi tetap mampu menahan kelembaban.\n\nJagung dapat tumbuh hingga ketinggian 900 mdpl dengan kebutuhan curah hujan 500–1.200 mm per musim tanam. Penyinaran matahari yang dibutuhkan adalah 8–10 jam per hari.\n\nKesalahan yang sering terjadi adalah menanam jagung di tanah yang terlalu padat atau tergenang air. Akar jagung membutuhkan sirkulasi udara yang baik di dalam tanah. Drainase yang buruk bisa menyebabkan busuk akar.',
        fixSuggestion:
          'Jika tanah terlalu padat atau liat, tambahkan pasir dan pupuk organik untuk memperbaiki struktur. Jika curah hujan berlebihan, buat saluran drainase dan gunakan bedengan tinggi.',
      },
      {
        id: 'crop-kedelai',
        question: 'Apa yang dibutuhkan tanaman kedelai untuk tumbuh optimal?',
        answer:
          'Kedelai membutuhkan tanah dengan pH 6,0–7,0 (netral). Tekstur tanah yang ideal adalah lempung berliat — cukup gembur untuk perakaran tapi mampu menahan nutrisi dan kelembaban.\n\nKedelai tumbuh baik di ketinggian 0–900 mdpl. Curah hujan yang dibutuhkan adalah 350–600 mm per musim tanam, dan tanaman ini membutuhkan penyinaran matahari lebih lama, yaitu 10–12 jam per hari.\n\nKesalahan yang sering terjadi adalah menanam kedelai di tanah yang terlalu asam (pH di bawah 6,0). Kedelai sangat sensitif terhadap keasaman tanah karena mempengaruhi kemampuan bakteri Rhizobium dalam mengikat nitrogen. Jangan lupa juga bahwa kedelai butuh sinar matahari lebih banyak dibanding tanaman lain.',
        fixSuggestion:
          'Jika pH tanah terlalu asam, tambahkan kapur pertanian (dolomit) 2–3 minggu sebelum tanam. Jika cahaya kurang, pangkas pohon penghalang di sekitar lahan atau pilih varietas kedelai yang toleran teduh.',
      },
      {
        id: 'crop-cabai-merah',
        question: 'Apa yang dibutuhkan tanaman cabai merah untuk tumbuh optimal?',
        answer:
          'Cabai merah membutuhkan tanah dengan pH 6,0–7,0 (netral). Tekstur tanah yang paling cocok adalah lempung berpasir — gembur, kaya bahan organik, dan memiliki drainase yang baik.\n\nCabai merah dapat tumbuh di ketinggian 0–1.400 mdpl, sehingga cukup fleksibel untuk dataran rendah maupun sedang. Curah hujan ideal adalah 600–1.250 mm per tahun, dan tanaman ini membutuhkan penyinaran matahari 10–12 jam per hari.\n\nKesalahan yang sering terjadi adalah menyiram cabai terlalu banyak sehingga tanah selalu becek. Akar cabai sangat rentan terhadap busuk akar jika tergenang. Selain itu, menanam cabai di tanah yang terlalu padat juga menghambat pertumbuhan.',
        fixSuggestion:
          'Jika tanah terlalu liat dan mudah becek, tambahkan pasir dan kompos untuk memperbaiki drainase. Jika curah hujan terlalu tinggi, buat saluran drainase dan gunakan bedengan tinggi.',
      },
      {
        id: 'crop-bawang-merah',
        question: 'Apa yang dibutuhkan tanaman bawang merah untuk tumbuh optimal?',
        answer:
          'Bawang merah membutuhkan tanah dengan pH 5,6–6,5 (sedikit asam). Tekstur tanah yang ideal adalah lempung berpasir — gembur dan mudah ditembus umbi untuk berkembang.\n\nBawang merah tumbuh baik di ketinggian 0–800 mdpl. Curah hujan yang dibutuhkan relatif rendah, yaitu 300–400 mm per musim tanam. Yang penting adalah tanaman ini membutuhkan penyinaran matahari minimal 12 jam per hari — lebih banyak dari tanaman lainnya.\n\nKesalahan yang sering terjadi adalah menanam bawang merah saat musim hujan dengan curah hujan tinggi. Kelembaban berlebihan menyebabkan umbi mudah busuk dan terserang jamur. Pastikan juga tanah tidak terlalu padat agar umbi bisa mengembang dengan baik.',
        fixSuggestion:
          'Jika curah hujan terlalu tinggi, buat saluran drainase dan gunakan bedengan tinggi. Jika tanah terlalu padat, tambahkan pasir dan pupuk organik. Jika cahaya kurang dari 12 jam, pangkas pohon penghalang di sekitar lahan.',
      },
      {
        id: 'crop-bawang-putih',
        question: 'Apa yang dibutuhkan tanaman bawang putih untuk tumbuh optimal?',
        answer:
          'Bawang putih membutuhkan tanah dengan pH 6,0–7,0 (netral). Tekstur tanah yang cocok adalah lempung berpasir — gembur, kaya bahan organik, dan memiliki drainase baik.\n\nBawang putih berbeda dari bawang merah dalam hal ketinggian: tanaman ini membutuhkan ketinggian 700–1.100 mdpl, artinya lebih cocok untuk dataran agak tinggi. Curah hujan yang dibutuhkan adalah 110–200 mm per bulan, dan penyinaran matahari minimal 12 jam per hari.\n\nKesalahan yang sering terjadi adalah menanam bawang putih di dataran rendah yang terlalu panas. Suhu yang terlalu tinggi menghambat pembentukan siung. Selain itu, tanah yang terlalu basah juga menyebabkan umbi busuk.',
        fixSuggestion:
          'Jika lahan Anda di dataran rendah, pertimbangkan menanam di musim kemarau atau gunakan naungan paranet. Jika tanah terlalu basah, perbaiki drainase dan tambahkan pasir ke dalam tanah.',
      },
    ],
  },

  // ===========================================================================
  // SECTION 3: Tentang Parameter
  // ===========================================================================
  {
    id: 'faq-params',
    title: 'Tentang Parameter',
    items: [
      {
        id: 'param-ph',
        question: 'Apa itu pH tanah dan mengapa penting?',
        answer:
          'pH tanah adalah tingkat keasaman atau kebasaan tanah, diukur pada skala 0–14. Tanah dengan pH 7 disebut netral. Di bawah 7 berarti asam, dan di atas 7 berarti basa. Kebanyakan tanaman pangan tumbuh optimal pada pH 5,5–7,0.\n\npH tanah penting karena langsung mempengaruhi ketersediaan nutrisi. Tanah yang terlalu asam atau terlalu basa membuat nutrisi penting seperti nitrogen, fosfor, dan kalium menjadi tidak bisa diserap oleh akar tanaman, meskipun jumlahnya cukup di dalam tanah.\n\nAnda bisa mengukur pH tanah menggunakan pH meter sederhana atau kit uji tanah yang tersedia di toko pertanian. Lakukan pengukuran di beberapa titik lahan dan ambil nilai rata-ratanya.',
        fixSuggestion:
          'Jika pH tanah terlalu asam (di bawah 5,5), tambahkan kapur pertanian (dolomit) sesuai dosis anjuran. Jika pH terlalu basa (di atas 7,5), tambahkan belerang atau pupuk organik asam seperti pupuk kandang yang sudah matang.',
      },
      {
        id: 'param-ketinggian',
        question: 'Apa itu ketinggian tempat dan mengapa penting?',
        answer:
          'Ketinggian tempat adalah posisi lahan dari permukaan laut, diukur dalam meter di atas permukaan laut (mdpl). Ketinggian mempengaruhi suhu udara, kelembaban, dan intensitas cahaya matahari.\n\nSecara umum, setiap kenaikan 100 mdpl, suhu udara turun sekitar 0,6°C. Inilah sebabnya tanaman tertentu hanya bisa tumbuh di ketinggian tertentu. Misalnya, bawang putih membutuhkan ketinggian 700–1.100 mdpl karena butuh suhu yang lebih dingin untuk membentuk siung.\n\nAnda bisa mengetahui ketinggian lahan melalui aplikasi GPS di smartphone atau peta topografi daerah Anda.',
        fixSuggestion:
          'Ketinggian tidak bisa diubah, jadi solusinya adalah memilih tanaman yang cocok dengan ketinggian lahan Anda. Jika lahan Anda rendah (0–300 mdpl), padi, jagung, dan cabai merah adalah pilihan yang baik. Jika lahan tinggi (700+ mdpl), bawang putih bisa menjadi alternatif.',
      },
      {
        id: 'param-curah-hujan',
        question: 'Apa itu curah hujan dan mengapa penting?',
        answer:
          'Curah hujan adalah jumlah air hujan yang turun di suatu daerah dalam periode tertentu, diukur dalam milimeter (mm). Dalam Agri-SAW Pro, curah hujan dinyatakan per musim tanam atau per tahun, tergantung jenis tanamannya.\n\nCurah hujan penting karena menentukan ketersediaan air untuk tanaman. Terlalu banyak air menyebabkan akar busuk dan penyakit jamur. Terlalu sedikit air menyebabkan tanaman layu dan gagal panen. Setiap tanaman memiliki rentang curah hujan optimalnya masing-masing.\n\nData curah hujan bisa diperoleh dari stasiun meteorologi terdekat atau dinas pertanian kabupaten Anda.',
        fixSuggestion:
          'Jika curah hujan terlalu tinggi, buat saluran drainase di sekitar lahan dan gunakan bedengan tinggi agar air tidak menggenang. Jika curah hujan terlalu rendah, pasang sistem irigasi tetes dan gunakan mulsa (jerami atau plastik) untuk menjaga kelembaban tanah.',
      },
      {
        id: 'param-tekstur-tanah',
        question: 'Apa itu tekstur tanah dan mengapa penting?',
        answer:
          'Tekstur tanah adalah perbandingan proporsi pasir, debu, dan liat di dalam tanah. Berdasarkan tekstur, tanah dikategorikan menjadi beberapa jenis: berpasir (pasir dominan), berliat (liat dominan), dan lempung (campuran seimbang).\n\nTekstur tanah menentukan kemampuan tanah menahan air dan nutrisi. Tanah berpasir sangat gembur tapi air cepat meresap sehingga nutrisi mudah hilang. Tanah berliat menahan air dengan baik tapi bisa menjadi padat dan sulit ditembus akar. Tanah lempung adalah keseimbangan terbaik untuk kebanyakan tanaman.\n\nAnda bisa menguji tekstur tanah secara sederhana: ambil tanah basah, lalu bentuk menjadi bola. Jika mudah hancur, tanah cenderung berpasir. Jika lengket dan mudah dibentuk, tanah cenderung berliat.',
        fixSuggestion:
          'Jika tanah terlalu liat dan padat, tambahkan pasir kasar dan pupuk organik untuk membuatnya lebih gembur. Jika tanah terlalu berpasir, tambahkan tanah liat dan kompos untuk meningkatkan daya tampung air dan nutrisi.',
      },
      {
        id: 'param-cahaya',
        question: 'Apa itu intensitas cahaya dan mengapa penting?',
        answer:
          'Intensitas cahaya dalam konteks pertanian diukur dari durasi penyinaran matahari per hari, dinyatakan dalam jam. Ini bukan tentang seberapa terang cahayanya, tapi berapa lama tanaman terpapar sinar matahari langsung.\n\nCahaya matahari bertenaga proses fotosintesis — proses di mana tanaman mengubah air dan CO₂ menjadi gula untuk tumbuh. Semakin lama penyinaran (dalam batas wajar), semakin banyak energi yang bisa diolah tanaman. Namun, setiap tanaman memiliki kebutuhan yang berbeda.\n\nMisalnya, bawang merah dan bawang putih membutuhkan minimal 12 jam penyinaran per hari untuk membentuk umbi dengan baik. Sementara padi dan jagung cukup dengan 8–10 jam per hari.',
        fixSuggestion:
          'Jika penyinaran matahari terlalu kurang, pangkas pohon-pohon besar yang menaungi lahan atau pilih varietas tanaman yang toleran terhadap teduh. Jika penyinaran terlalu intens (misalnya di dataran rendah yang sangat panas), gunakan naungan paranet untuk melindungi tanaman.',
      },
    ],
  },
];
