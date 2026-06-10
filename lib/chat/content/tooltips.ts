/**
 * Tooltip content per parameter.
 * Source: dasar knowledge base.md — Bab 4 (Parameter Agroklimat)
 * Bahasa: mudah dipahami, tanpa jargon teknis.
 */

export const TOOLTIPS: Record<string, string> = {
  'ketinggian': [
    'Ketinggian mempengaruhi suhu udara di lahan.',
    '',
    '• **Dataran rendah** (0-400 meter): Lebih panas, cocok untuk Padi dan Jagung',
    '• **Dataran sedang** (400-700 meter): Suhu sejuk, cocok untuk banyak tanaman',
    '• **Pegunungan** (700 meter ke atas): Udara dingin, cocok untuk Bawang Putih',
    '',
    'Setiap tanaman punya ketinggian optimal masing-masing.',
  ].join('\n'),

  'curah hujan': [
    'Air hujan adalah sumber air utama untuk tanaman.',
    '',
    '• Terlalu **banyak** → Akar bisa busuk, tanaman mati',
    '• Terlalu **sedikit** → Tanaman kering, hasil panen rendah',
    '',
    'Setiap tanaman butuh air yang berbeda. Misalnya Bawang Merah butuh curah hujan rendah, sementara Padi butuh tinggi.',
  ].join('\n'),

  'pH tanah': [
    'pH tanah menunjukkan tingkat keasaman tanah.',
    '',
    '• **Asam** (pH di bawah 5,5): Banyak tanaman sulit tumbuh',
    '• **Netral** (pH 6,0-7,0): Paling cocok untuk kebanyakan tanaman',
    '• **Basa** (pH di atas 7,0): Bisa menghambat penyerapan nutrisi',
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
    'Cara sederhana: Ambil tanah, basahi, lalu remas. Kalau lengket dan bisa dibentuk, berarti liat. Kalau halus dan gembur, berarti lempung. Kalau kasar dan mudah hancur, berarti berpasir.',
  ].join('\n'),

  'intensitas cahaya': [
    'Sinar matahari dibutuhkan tanaman untuk membuat makanan (fotosintesis).',
    '',
    '• **6-8 jam**: Cukup untuk Padi dan Jagung',
    '• **8-10 jam**: Ideal untuk kebanyakan tanaman',
    '• **12+ jam**: Dibutuhkan Bawang Merah dan Bawang Putih',
    '',
    'Cara sederhana: Hitung berapa jam lahan Anda terkena sinar matahari langsung tanpa terhalang pohon besar atau bangunan.',
  ].join('\n'),
};
