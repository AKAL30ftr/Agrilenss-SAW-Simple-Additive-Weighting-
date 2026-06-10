# FILTER 2 CONTENT DESIGN — Isi Konten & Flow

> **Dibuat:** 2026-06-09
> **Status:** DESIGN — menunggu review & approval

---

## 1. PHASE: filter1_result

### Bot Message (surviving >= 2):
```
Berdasarkan kondisi lingkungan lahan [Bapak/Ibu], berikut komoditas yang paling cocok secara agronomis: 🌿

{emoji} **{Crop Name}** — [Tingkat Kesesuaian]
[Pendek kenapa cocok]

---

Sayangnya, [X] tanaman tidak lolos:
• **{Crop}**: [Alasan eliminasi]
• **{Crop}**: [Alasan]

---

Mau saya hitungkan juga ranking keuntungan ekonomi untuk [X] komoditas yang cocok ini?
Dengan mempertimbangkan biaya produksi, harga jual, produktivitas, risiko gagal panen, dan permintaan pasar.
```

### Quick Replies
1. **[Lanjut analisis keuntungan]** → filter2_pref
2. **[Cukup, tampilkan rekomendasi saja]** → done
3. **[Konsultasi ulang]** → ringkasan

---

## 2. PHASE: filter2_pref

### Bot Message:
```
Baik! Berikut data ekonomi untuk masing-masing komoditas:

📊 **Perbandingan Ekonomi:**

🌾 **Padi**
• Biaya Produksi: Rp 7.2 juta/ha
• Harga Jual: Rp 10.000/kg
• Produktivitas: 5,28 ton/ha
• Risiko: Sedang
• Permintaan: Sangat Tinggi

🌽 **Jagung**
• Biaya Produksi: Rp 6.2 juta/ha
• Harga Jual: Rp 8.400/kg
• Produktivitas: 5,57 ton/ha
• Risiko: Sedang
• Permintaan: Tinggi

🫘 **Kedelai**
• Biaya Produksi: Rp 5.4 juta/ha
• Harga Jual: Rp 16.500/kg
• Produktivitas: 1,62 ton/ha
• Risiko: Tinggi
• Permintaan: Tinggi

---

Untuk menentukan ranking, saya perlu tahu prioritas [Bapak/Ibu]. Mana yang lebih penting? Bisa pilih sampai 3.
```

### Quick Replies (multi-select, max 3)
1. [Biaya produksi rendah]
2. [Harga jual tinggi]
3. [Produktivitas tinggi]
4. [Risiko rendah]
5. [Permintaan pasar tinggi]
6. [Hitung Ranking]

---

## 3. PHASE: done (Hasil Filter 2)

### Bot Message:
```
[Bapak/Ibu] [nama], berikut ranking keuntungan ekonomi:

1️⃣ 🌾 **[Crop 1]** — Paling cocok (Skor: X.XX)
   [Konteks]

2️⃣ 🌽 **[Crop 2]** — Tidak kalah bagus (Skor: X.XX)
   [Konteks]

3️⃣ 🫘 **[Crop 3]** — Dapat dipertimbangkan (Skor: X.XX)
   [Konteks]

---

📊 **Detail Skor:**

**{Crop Name}:**
• Biaya Produksi: X/5
• Harga Jual: X/5
• Produktivitas: X/5
• Risiko: X/5
• Permintaan: X/5
• **Total Skor SAW: X.XX**

---

Sayangnya, [X] tanaman tidak lolos Filter 1:
• **{Crop}**: [Alasan]

Mau detail tanaman / ulang konsultasi / selesai?
```

### Quick Replies
1. [Lihat detail {crop1}]
2. [Lihat detail {crop2}] (jika ada)
3. [Ulangi konsultasi]
4. [Selesai]

---

## 4. FAQ CONTENT ENRICHMENT

### FAQ Categories & Topics

**Kategori 1: Tentang Sistem**
- Apa itu Agri-SAW Pro?
- Bagaimana cara kerja sistem?
- Apa itu metode SAW?
- Perbedaan Filter 1 dan Filter 2?

**Kategori 2: Tentang Komoditas**
- Apa saja komoditas yang didukung?
- Mengapa hanya 6 komoditas?
- Bagaimana jika komoditas saya tidak ada?

**Kategori 3: Tentang Kondisi Lingkungan**
- Bagaimana mengukur pH tanah?
- Bagaimana mengetahui tekstur tanah?
- Bagaimana menghitung curah hujan?
- Bagaimana mengukur intensitas cahaya?

**Kategori 4: Tentang Filter 1**
- Apa itu kesesuaian lingkungan?
- Mengapa tanaman dieliminasi?
- Bagaimana jika semua tanaman dieliminasi?
- Apa artinya "kurang yakin"?

**Kategori 5: Tentang Filter 2**
- Apa itu analisis keuntungan?
- Bagaimana cara menghitung SAW?
- Apa itu bobot preferensi?
- Bagaimana jika hanya 1 yang cocok?

---

## 5. DATA EKONOMI (Ground Truth)

| Komoditas | Biaya (Rp/ha) | Harga (Rp/kg) | Prod (ton/ha) | Risiko | Permintaan |
|-----------|---------------|---------------|---------------|--------|------------|
| Padi | 7.207.932 | 10.022 | 5,28 | 2 | 5 |
| Jagung | 6.158.477 | 8.438 | 5,57 | 2 | 4 |
| Kedelai | 5.370.000 | 16.459 | 1,62 | 3 | 4 |
| Cabai Merah | 48.500.000 | 52.001 | 8,60 | 3 | 4 |
| Bawang Merah | 58.500.000 | 37.304 | 10,05 | 3 | 5 |
| Bawang Putih | 91.587.000 | 39.064 | 8,50 | 3 | 5 |

## 6. ELIMINATION REASONS (Template)

- ketinggian: "Ketinggian [X] mdpl di luar range optimal ([min]-[max] mdpl)"
- curah hujan: "Curah hujan [X] mm/tahun terlalu [tinggi/rendah] (optimal: [min]-[max])"
- pH: "pH [X] terlalu [asam/basa] (optimal: [min]-[max])"
- tekstur: "Tekstur [X] tidak cocok (butuh: [list])"
- cahaya: "Cahaya [X] jam/hari terlalu [sedikit/berlebihan] (butuh: [min]-[max])"
