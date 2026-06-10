# Panduan Uji Skenario — Agri-SAW Pro

> **Dibuat:** 2026-06-11
> **Tujuan:** Panduan lengkap untuk menguji setiap fungsi sistem
> **Untuk:** Anggota kelompok yang menyusun scenario uji implementasi

---

## 1. DATA REFERENSI

### 1.1 Bobot Kriteria Ekonomi (Filter 2)

| Kriteria | Tipe | Bobot Default |
|----------|------|--------------|
| Biaya Produksi | Cost (semakin kecil, semakin baik) | 0.20 |
| Harga Jual | Benefit (semakin besar, semakin baik) | 0.25 |
| Produktivitas | Benefit | 0.25 |
| Risiko Gagal Panen | Cost | 0.15 |
| Permintaan Pasar | Benefit | 0.15 |
| **Total** | | **1.00** |

### 1.2 Data Ekonomi Komoditas

| Komoditas | Biaya (Rp/ha) | Harga (Rp/kg) | Produktivitas (ton/ha) | Risiko (1-3) | Permintaan (1-5) |
|-----------|---------------|---------------|------------------------|--------------|------------------|
| 🌾 Padi | 7,2 juta | 10.022 | 5,28 | 2 (Sedang) | 5 (Sangat Tinggi) |
| 🌽 Jagung | 6,2 juta | 8.438 | 5,57 | 2 (Sedang) | 4 (Tinggi) |
| 🫘 Kedelai | 5,4 juta | 16.459 | 1,62 | 3 (Tinggi) | 4 (Tinggi) |
| 🌶️ Cabai Merah | 48,5 juta | 52.001 | 8,60 | 3 (Tinggi) | 4 (Tinggi) |
| 🧅 Bawang Merah | 58,5 juta | 37.304 | 10,05 | 3 (Tinggi) | 5 (Sangat Tinggi) |
| 🧄 Bawang Putih | 91,6 juta | 39.064 | 8,50 | 3 (Tinggi) | 5 (Sangat Tinggi) |

### 1.3 Parameter Agroklimat per Komoditas

| Komoditas | pH Optimal | Tekstur Tanah | Ketinggian (mdpl) | Cahaya (jam/hari) | Curah Hujan |
|-----------|-----------|-----------------|-------------------|-------------------|-------------|
| 🌾 Padi | 5,5–6,5 | Liat / Liat berlempung | 0–650 | 8–10 | 1.500–2.000 mm/tahun |
| 🌽 Jagung | 5,6–7,5 | Lempung berpasir–berliat | 0–900 | 8–10 | 500–1.200 mm/musim |
| 🫘 Kedelai | 6,0–7,0 | Lempung berliat | 0–900 | 10–12 | 350–600 mm/musim |
| 🌶️ Cabai Merah | 6,0–7,0 | Lempung berpasir | 0–1.400 | 10–12 | 600–1.250 mm/tahun |
| 🧅 Bawang Merah | 5,6–6,5 | Lempung berpasir | 0–800 | 12+ | 300–400 mm/musim |
| 🧄 Bawang Putih | 6,0–7,0 | Lempung berpasir | 700–1.100 | 12+ | 110–200 mm/bulan |

---

## 2. SKENARIO UJI PER FUNGSI

### 2.1 F1: Welcome & Form Input

**Fungsi:** `welcomeMessage()`, `handleFormSubmit()`

**Skenario 1.1 — Input nama valid**
- **Input:** Nama = "Pak Budi", Gender = Laki-laki
- **Expected:** Pesan sambutan → form muncul → setelah submit, ringkasan muncul dengan "Pak Budi"
- **Cek:** Nama muncul di ringkasan message

**Skenario 1.2 — Nama kosong**
- **Input:** Nama = "" (kosong), Gender = Laki-laki
- **Expected:** Tombol "Mulai Konsultasi" disabled
- **Cek:** Tidak bisa lanjut tanpa nama

**Skenario 1.3 — Gender default**
- **Input:** Nama = "Ibu Siti", Gender = (tidak dipilih)
- **Expected:** Default ke "Laki-laki" → "Pak Siti"
- **Cek:** Gender default adalah laki-laki

---

### 2.2 F2: Ringkasan & Navigasi

**Fungsi:** `ringkasanMessage()`, `handleRingkasanLanjut()`, `handleShowFaqCategories()`

**Skenario 2.1 — Lanjut konsultasi**
- **Input:** Klik "Mengerti, lanjut konsultasi"
- **Expected:** Phase berubah ke "collecting", pertanyaan pertama muncul
- **Cek:** `getCurrentQuestion('ketinggian', ...)` muncul

**Skenario 2.2 — Ada pertanyaan dulu**
- **Input:** Klik "Ada pertanyaan dulu"
- **Expected:** Phase berubah ke "faq", daftar 5 kategori FAQ muncul
- **Cek:** FAQ_REPLIES muncul sebagai quick reply buttons

---

### 2.3 F3: Collecting (5 Parameter)

**Fungsi:** `collectingQuestion()`, `handleCollectingQuickReply()`, `kurangYakinFallback()`

**Skenario 3.1 — Jawaban normal per parameter**
- **Input:** Ketinggian = "Dataran rendah (0-400 meter)"
- **Expected:** Pertanyaan berikutnya (curah hujan) muncul
- **Cek:** `currentParamIndex` bertambah 1

**Skenario 3.2 — Kurang yakin**
- **Input:** Klik "Saya kurang yakin" di parameter ketinggian
- **Expected:** Fallback message muncul + pertanyaan yang sama diulang
- **Cek:** `kurangYakinFallback('ketinggian', ...)` muncul, `currentParamIndex` tidak bertambah

**Skenario 3.3 — Semua parameter terisi**
- **Input:** Jawab 5 parameter lengkap
- **Expected:** Phase berubah ke "confirming", rekap data muncul
- **Cek:** `confirmingMessage()` + `paramRecapLine()` muncul

**Skenario 3.4 — Konfirmasi data**
- **Input:** Klik "Hitung Rekomendasi"
- **Expected:** API call terjadi, loading muncul, hasil Filter 1 muncul
- **Cek:** `proceedWithCalculation()` dipanggil → `filter1ResultMessage()` muncul

**Skenario 3.5 — Ulangi dari konfirmasi**
- **Input:** Klik "Ulangi dari awal"
- **Expected:** Reset ke ringkasan
- **Cek:** Phase berubah ke "ringkasan"

---

### 2.4 F4: Filter 1 — Kesesuaian Lingkungan

**Fungsi:** `filterByAgroklimat()`, `filter1ResultMessage()`, `allEliminatedMessage()`

**Skenario 4.1 — Beberapa lolos, beberapa dieliminasi**
- **Input:** Ketinggian=200, Curah hujan=tinggi, pH=6.5, Tekstur=Liat, Cahaya=9 jam
- **Expected:** Padi lolos, Jagung lolos, Kedelai lolos, Cabai lolos, Bawang Merah lolos, Bawang Putih dieliminasi (ketinggian < 700)
- **Cek:** 5 komoditas surviving, 1 eliminated

**Skenario 4.2 — Semua lolos**
- **Input:** Ketinggian=200, Curah hujan=tinggi, pH=6.5, Tekstur=Liat berpasir, Cahaya=10 jam
- **Expected:** Semua 6 komoditas lolos
- **Cek:** 6 surviving, 0 eliminated

**Skenario 4.3 — Semua dieliminasi**
- **Input:** Ketinggian=200, Curah hujan=tinggi, pH=4.0 (sangat asam), Tekstur=Liat, Cahaya=6 jam
- **Expected:** Semua dieliminasi → `allEliminatedMessage()` muncul
- **Cek:** Pesan "tidak ada yang cocok" + saran perbaikan

**Skenario 4.4 — Hanya 1 yang lolos**
- **Input:** Ketinggian=800, Curah hujan=sedang, pH=6.5, Tekstur=Lempung berpasir, Cahaya=12 jam
- **Expected:** Hanya Bawang Putih lolos
- **Cek:** 1 surviving, 5 eliminated

---

### 2.5 F5: Filter 1 → Filter 2 Transition

**Fungsi:** `handleFilter1Lanjut()`, `handleFilter1Cukup()`, `handleFilter1Ulangi()`

**Skenario 5.1 — Lanjut ke Filter 2**
- **Input:** Klik "Lanjut analisis keuntungan" dari filter1_result
- **Expected:** Phase berubah ke "filter2_summary", data ekonomi muncul
- **Cek:** `filter2PrefMessage()` muncul dengan tabel data ekonomi

**Skenario 5.2 — Cukup (tanpa Filter 2)**
- **Input:** Klik "Cukup, tampilkan rekomendasi" dari filter1_result
- **Expected:** Phase berubah ke "done", rekomendasi Filter 1 muncul
- **Cek:** Ranking berdasarkan kesesuaian lingkungan saja

**Skenario 5.3 — Konsultasi ulang**
- **Input:** Klik "Konsultasi ulang" dari filter1_result
- **Expected:** Reset ke ringkasan
- **Cek:** Phase berubah ke "ringkasan"

---

### 2.6 F6: Filter 2 — Data Ekonomi & Preferensi

**Fungsi:** `filter2PrefMessage()`, `handleFilter2SummaryLanjut()`, `handleFilter2SummaryCukup()`

**Skenario 6.1 — Data ekonomi muncul**
- **Input:** Masuk filter2_summary
- **Expected:** Tabel data ekonomi muncul (biaya, harga, produktivitas, risiko, permintaan) per komoditas
- **Cek:** Data sesuai dengan ECONOMIC_DATA di constants.ts

**Skenario 6.2 — Lanjut ke preferensi**
- **Input:** Klik "Lanjut hitung ranking"
- **Expected:** Phase berubah ke "filter2_pref", preference buttons muncul
- **Cek:** FILTER2_PREF_REPLIES muncul (5 preferensi + "Hitung Ranking")

**Skenario 6.3 — Cukup dari filter2_summary**
- **Input:** Klik "Cukup, tampilkan rekomendasi" dari filter2_summary
- **Expected:** Phase berubah ke "done", rekomendasi Filter 1 muncul
- **Cek:** Tidak ada perhitungan Filter 2

---

### 2.7 F7: Preference Selection

**Fungsi:** `handlePreferenceToggle()`, `handleFilter2PrefSubmit()`, `handleTogglePreference()`

**Skenario 7.1 — Pilih 1 preferensi**
- **Input:** Klik "Biaya produksi rendah"
- **Expected:** Tombol selected (hijau), `selectedPreferences = ['pref_biaya']`
- **Cek:** `isPrefSelected` = true untuk pref_biaya

**Skenario 7.2 — Pilih 3 preferensi (maksimal)**
- **Input:** Klik "Biaya", "Harga", "Produktivitas"
- **Expected:** 3 tombol selected, tombol ke-4 dan ke-5 disabled
- **Cek:** `isPrefDisabled` = true untuk pref_risiko dan pref_permintaan

**Skenario 7.3 — Deselect preferensi**
- **Input:** Klik "Biaya" lagi (sudah selected)
- **Expected:** Tombol kembali ke style default, `selectedPreferences` berkurang
- **Cek:** `isPrefSelected` = false

**Skenario 7.4 — Submit tanpa preferensi**
- **Input:** Klik "Hitung Ranking" tanpa pilih preferensi
- **Expected:** Tidak terjadi apa-apa (guard di `handleFilter2PrefSubmit`)
- **Cek:** `if (selectedPreferences.length === 0) return`

**Skenario 7.5 — Submit dengan preferensi**
- **Input:** Pilih "Biaya" + "Harga", klik "Hitung Ranking"
- **Expected:** API call dengan `preferences = ['pref_biaya', 'pref_harga']`
- **Cek:** `proceedWithCalculation(collectedParams, ['pref_biaya', 'pref_harga'])`

---

### 2.8 F8: Dynamic Weight Adjustment

**Fungsi:** `rankBySAW()` di knowledge-base.ts

**Skenario 8.1 — Tanpa preferensi (bobot default)**
- **Input:** `preferences = undefined`
- **Expected:** Bobot default (Biaya 0.20, Harga 0.25, Produktivitas 0.25, Risiko 0.15, Permintaan 0.15)
- **Cek:** `selectedIds` kosong → weight adjustment block tidak jalan

**Skenario 8.2 — 1 preferensi dipilih**
- **Input:** `preferences = ['pref_biaya']`
- **Expected:** Biaya ×1.5 = 0.30, lalu renormalisasi total = 1.00
- **Cek:** Biaya weight ≈ 0.273, total semua weight = 1.000

**Skenario 8.3 — 3 preferensi dipilih**
- **Input:** `preferences = ['pref_biaya', 'pref_harga', 'pref_produktivitas']`
- **Expected:** 3 kriteria ×1.5, 2 kriteria ×1.0, lalu renormalisasi
- **Cek:** Skor berubah signifikan vs tanpa preferensi

**Skenario 8.4 — Preferensi tidak dikenali**
- **Input:** `preferences = ['unknown_pref']`
- **Expected:** `preferenceToCriterion['unknown_pref']` = undefined → filtered out → default weights
- **Cek:** Tidak crash, fallback ke bobot default

---

### 2.9 F9: Hasil Filter 2 — Ranking + Breakdown

**Fungsi:** `filter2ResultMessage()`, `buildBreakdown()` di route.ts

**Skenario 9.1 — Ranking muncul**
- **Input:** Filter 2 selesai
- **Expected:** 3 tier muncul: Paling cocok, Tidak kalah bagus, Dapat dipertimbangkan
- **Cek:** `surviving.slice(0, 3)` muncul dengan label tier

**Skenario 9.2 — Breakdown per kriteria**
- **Input:** Filter 2 selesai
- **Expected:** Setiap crop menampilkan: Biaya: X/5, Harga: X/5, Produktivitas: X/5, Risiko: X/5, Permintaan: X/5
- **Cek:** `buildBreakdown()` menghasilkan 5 kriteria dengan score 1-5

**Skenario 9.3 — Eliminated crops ditampilkan**
- **Input:** Filter 1 mengeliminasi beberapa crop
- **Expected:** Section "X tanaman tidak lolos Filter 1" muncul dengan alasan
- **Cek:** `eliminated.length > 0` → section muncul

**Skenario 9.4 — Preferensi ditampilkan**
- **Input:** User pilih preferensi
- **Expected:** "Preferensi Anda: ..." muncul di hasil
- **Cek:** `preferences.length > 0` → section muncul

---

### 2.10 F10: Detail View

**Fungsi:** `detailMessage()`, `handleLihatDetail()`

**Skenario 10.1 — Lihat detail dari ranking**
- **Input:** Klik "Lihat detail [crop name]"
- **Expected:** Detail view muncul dengan skor + breakdown
- **Cek:** `detailMessage(crop.name, crop.score, crop.explanation, crop.breakdown)` dipanggil

**Skenario 10.2 — Breakdown muncul di detail**
- **Input:** Lihat detail crop yang lolos Filter 2
- **Expected:** Breakdown per kriteria muncul di detail view
- **Cek:** `breakdown && Object.keys(breakdown).length > 0` → section muncul

**Skenario 10.3 — Kembali ke hasil dari detail**
- **Input:** Klik "Kembali ke hasil"
- **Expected:** Phase berubah ke "done", ranking muncul kembali
- **Cek:** `handleKembaliKeHasil()` → `setPhase('done')`

**Skenario 10.4 — Selesai dari detail**
- **Input:** Klik "Selesai" dari detail
- **Expected:** Closing message muncul
- **Cek:** `closingMessage()` muncul

---

### 2.11 F11: FAQ 3-Level Navigation

**Fungsi:** `handleFaqAction()`, `handleShowFaqCategories()`, `getFaqQuestionReplies()`

**Skenario 11.1 — Buka FAQ dari ringkasan**
- **Input:** Klik "Ada pertanyaan dulu" → 5 kategori muncul
- **Expected:** FAQ_REPLIES muncul (5 kategori + Kembali)
- **Cek:** `FAQ_CONTENT.map(s => ...)` muncul sebagai quick reply

**Skenario 11.2 — Pilih kategori FAQ**
- **Input:** Klik "Tentang Sistem" (value: 'cat_sistem')
- **Expected:** Pertanyaan dalam kategori tersebut muncul
- **Cek:** `getFaqQuestionReplies('cat_sistem')` → 4 pertanyaan + "Kembali ke FAQ"

**Skenario 11.3 — Pilih pertanyaan FAQ**
- **Input:** Klik "Apa itu Agri-SAW Pro?" (value: 'faq_sistem_apa')
- **Expected:** Jawaban lengkap muncul
- **Cek:** `FAQ_CONTENT.find(s => s.id === 'cat_sistem').items.find(i => i.id === 'faq_sistem_apa')`

**Skenario 11.4 — Navigasi kembali dari jawaban**
- **Input:** Klik "Kembali ke FAQ" (value: '__FAQ_BACK__')
- **Expected:** Kembali ke daftar kategori
- **Cek:** `setFaqSection(null)` → `FAQ_REPLIES` muncul

**Skenario 11.5 — Kembali ke konsultasi dari FAQ**
- **Input:** Klik "Kembali" (value: '__FAQ_KEMBALI__')
- **Expected:** Kembali ke ringkasan
- **Cek:** `setPhase('ringkasan')` → `ringkasanMessage()` muncul

---

### 2.12 F12: Closing & Error Handling

**Fungsi:** `closingMessage()`, `errorMessage()`, `handleSelesai()`

**Skenario 12.1 — Selesai dari hasil**
- **Input:** Klik "Selesai" dari done phase
- **Expected:** Closing message muncul, phase = "closing"
- **Cek:** `closingMessage()` muncul

**Skenario 12.2 — Ulangi dari closing**
- **Input:** Klik "Konsultasi ulang" dari closing
- **Expected:** Reset ke ringkasan
- **Cek:** `handleUlangi()` → phase = "ringkasan"

**Skenario 12.3 — Error handling**
- **Input:** API call gagal (simulasi disconnect)
- **Expected:** Error message muncul
- **Cek:** `errorMessage()` muncul

---

### 2.13 F13: Quick Reply Button States

**Fungsi:** Button rendering di ChatWidget.tsx

**Skenario 13.1 — Preference selected state**
- **Input:** Pilih "Biaya produksi rendah"
- **Expected:** Tombol berubah jadi hijau (selected style)
- **Cek:** `isPrefSelected` = true → `bg-emerald-600 border-emerald-500 text-white`

**Skenario 13.2 — Preference disabled state**
- **Input:** Sudah pilih 3 preferensi, lihat tombol ke-4
- **Expected:** Tombol disabled (opacity 30%, cursor not-allowed)
- **Cek:** `isPrefDisabled` = true → `disabled:opacity-30`

**Skenario 13.3 — Secondary button style**
- **Input:** Lihat tombol "Kembali ke FAQ"
- **Expected:** Tombol abu-abu (secondary style)
- **Cek:** `isSecondary` = true → `bg-transparent border-[#3b4a54] text-[#8696a0]`

**Skenario 13.4 — Submit button style**
- **Input:** Lihat tombol "Hitung Ranking"
- **Expected:** Tombol biru (submit style)
- **Cek:** `isSubmit` = true → `bg-blue-600 border-blue-500 text-white`

---

## 3. PRIORITAS TESTING

### Prioritas 1 (Critical — harus lolos)
1. **F4.1** — Filter 1 normal (beberapa lolos, beberapa dieliminasi)
2. **F5.1** — Transition Filter 1 → Filter 2
3. **F7.5** — Submit preferensi mengubah ranking
4. **F9.1** — Ranking muncul dengan benar
5. **F10.1** — Detail view muncul dengan breakdown

### Prioritas 2 (High — penting)
1. **F4.3** — Eliminasi total
2. **F8.2** — Dynamic weight adjustment
3. **F11.1-11.5** — FAQ navigation lengkap
4. **F12.1** — Closing flow

### Prioritas 3 (Medium — nice to have)
1. **F3.2** — Kurang yakin
2. **F7.2-7.4** — Preference selection edge cases
3. **F13.1-13.4** — Button states
4. **F12.3** — Error handling
