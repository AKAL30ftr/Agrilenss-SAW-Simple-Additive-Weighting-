/**
 * Tooltip content per parameter.
 * Source: dasar knowledge base.md — Bab 4 (Parameter Agroklimat)
 * Bahasa:通俗易懂, hindari jargon teknis.
 */

export const TOOLTIPS: Record<string, string> = {
  'ketinggian': [
    'Ketinggian mempengaruhi suhu udara di lahan.',
    '',
    '• **Dataran rendah** (0-400 mdpl): Lebih panas, cocok untuk Padi dan Jagung',
    '• **Dataran sedang** (400-700 mdpl): Suhu sejuk, cocok untuk banyak tanaman',
    '• **Pegunungan** (700+ mdpl): Udara dingin, cocok untuk Bawang Putih',
    '',
    'Setiap tanaman punya range ketinggian optimal masing-masing.',
  ].join('\n'),

  'curah hujan': [
    'Air hujan adalah sumber air utama untuk tanaman.',
    '',
    '• Terlalu **banyak** → Akar bisa busuk, tanaman mati',
    '• Terlalu **sedikit** → Tanaman kering, hasil panen rendah',
    '',
    'Setiap tanaman punya kebutuhan air yang berbeda. Misalnya Bawang Merah butuh curah hujan rendah (300-400 mm/musim), sementara Padi butuh tinggi (1.500-2.000 mm/tahun).',
  ].join('\n'),

  'pH tanah': [
    'pH tanah menunjukkan tingkat keasaman tanah.',
    '',
    '• **Asam** (pH < 5,5): Banyak tanaman sulit tumbuh',
    '• **Netral** (pH 6,0-7,0): Paling cocok untuk kebanyakan tanaman',
    '• **Basa** (pH > 7,0): Bisa hambat penyerapan nutrisi',
    '',
    'Cara sederhana: Kalau tanaman sering menguning dan kerdil meskipun sudah dipupuk, kemungkinan tanah terlalu asam.',
  ].join('\n'),

  'tekstur tanah': [
    'Tekstur tanah menentukan kemampuan tanah menahan air dan nutrisi.',
    '',
    '• **Liat**: Sangat menahan air, tapi bisa becek dan susah drainase',
    '• **Lempung**: Seimbang, cocok untuk banyak tanaman',
    '• **Berpasir**: Air cepat kering, tapi drainase sangat baik',
    '',
    'Cara sederhana: Ambil tanah, basahi, lalu remas. Kalau lengket dan bisa dibentuk → liat. Kalau halus dan gembur → lempung. Kalau kasar dan mudah hancur → berpasir.',
  ].join('\n'),

  'intensitas cahaya': [
    'Sinar matahari dibutuhkan tanaman untuk fotosintesis (membuat makanan).',
    '',
    '• **6-8 jam**: Cukup untuk Padi dan Jagung',
    '• **8-10 jam**: Ideal untuk kebanyakan tanaman',
    '• **12+ jam**: Dibutuhkan Bawang Merah dan Bawang Putih',
    '',
    'Cara sederhana: Hitung berapa jam lahan Anda terkena sinar matahari langsung tanpa terhalang pohon besar atau bangunan.',
  ].join('\n'),
};
