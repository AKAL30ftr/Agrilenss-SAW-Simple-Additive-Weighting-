# FILTER 1 → FILTER 2 TRANSITION — Analysis & Design

> **Dibuat:** 2026-06-09
> **Status:** ANALYSIS — menunggu review & approval
> **Referensi:** SPK.md line 264-288 (diagram alur), dasar knowledge base.md (Section 6-7, Filter 2)

---

## 1. MASALAH SAAT INI

### Flow yang berjalan sekarang:
```
Collecting (5 param) → Confirming (rekap) → [Hitung Rekomendasi] → Loading → Preference selection → [Hitung Ranking] → Loading → Result
```

**Problem:** Tidak ada transisi eksplisit antara Filter 1 dan Filter 2. User langsung dihadapkan dengan preference selection tanpa konteks bahwa ini adalah tahap analisis keuntungan yang berbeda dari tahap kesesuaian lingkungan.

### Flow yang diharapkan (berdasarkan SPK line 264-288):
```
Collecting (5 param) → Confirming (rekap data lingkungan) → [Hitung Rekomendasi] → Loading → HASIL FILTER 1 (komoditas cocok secara lingkungan) → Opsi: "Lanjut analisis keuntungan" / "Cukup/Selesai" / "Konsultasi ulang"
```

Jika user pilih "Lanjut analisis keuntungan":
```
→ Penjelasan ringkasan Filter 1 → Preference selection → Hitung Filter 2 → Hasil ranking keuntungan
```

---

## 2. PERBEDAAN FILTER 1 vs FILTER 2

### Filter 1: Kesesuaian Lingkungan
- **Input:** 5 parameter agroklimat (ketinggian, curah hujan, pH tanah, tekstur tanah, intensitas cahaya)
- **Proses:** Rule Based + SAW Tahap 1
- **Output:** Daftar komoditas yang secara agronomis cocok dengan lahan
- **Kriteria:** Jenis Tanah (bobot 0.45), Curah Hujan (bobot 0.55)

### Filter 2: Analisis Keuntungan Ekonomi
- **Input:** Preferensi user (bobot: biaya produksi, harga jual, produktivitas, risiko gagal panen, permintaan pasar)
- **Proses:** SAW Tahap 2 dengan data ekonomi dari knowledge base
- **Output:** Perangkingan komoditas berdasarkan keuntungan ekonomi
- **Kriteria ekonomi (dari knowledge base):**
  - Biaya Produksi (Cost): Padi 7.2jt, Jagung 6.2jt, Kedelai 5.4jt, Cabai 48.5jt, Bawang Merah 58.5jt, Bawang Putih 91.6jt
  - Harga Jual (Benefit): Padi 10k, Jagung 8.4k, Kedelai 16.5k, Cabai 52k, Bawang Merah 37.3k, Bawang Putih 39.1k
  - Produktivitas (Benefit): Padi 5.28, Jagung 5.57, Kedelai 1.62, Cabai 8.6, Bawang Merah 10.05, Bawang Putih 8.5
  - Risiko (Cost): Padi 2, Jagung 2, Kedelai 3, Cabai 3, Bawang Merah 3, Bawang Putih 3
  - Permintaan (Benefit): Padi 5, Jagung 4, Kedelai 4, Cabai 4, Bawang Merah 5, Bawang Putih 5

---

## 3. DESIGN PROPOSAL

### 3.1. Tambahan Phase: 'filter1_result'

Setelah API call Filter 1 selesai, phase baru `'filter1_result'` menampilkan hasil kesesuaian lingkungan + opsi lanjut.

### 3.2. Tambahan Phase: 'filter2_pref'

User memilih preferensi ekonomi sebelum Filter 2 dihitung.

### 3.3. Flow Baru

```
collecting → confirming → [Hitung Rekomendasi] → API call → filter1_result
                                                                    ↓
                                                    ┌───────────────┼───────────────┐
                                                    ↓               ↓               ↓
                                              [Lanjut]      [Cukup]         [Ulangi]
                                                    ↓               ↓               ↓
                                              filter2_pref      done           ringkasan
                                                    ↓
                                              [Hitung Ranking]
                                                    ↓
                                              API call (dengan preferences)
                                                    ↓
                                              done (show filter2 result)
```

---

## 4. AFFECTED FILES

| File | Change |
|------|--------|
| `lib/chat/types.ts` | Add `'filter1_result'` dan `'filter2_pref'` to FlowPhase |
| `lib/chat/content/quick-replies.ts` | Add `FILTER1_RESULT_REPLIES` dan `FILTER2_PREF_REPLIES` |
| `lib/chat/content/messages.ts` | Add `filter1ResultMessage()`, `filter2PrefMessage()`, `filter2ResultMessage()` |
| `components/ChatWidget.tsx` | Update `proceedWithCalculation`, add handlers, update `handleQuickReply` |

---

## 5. OPEN QUESTIONS

1. **Bobot default Filter 2:** Bobot default: Biaya 20%, Harga 25%, Produktivitas 25%, Risiko 15%, Permintaan 15%. Apakah sudah fix?
2. **Preferensi user:** Quick reply multi-select max 3 dari 5 kriteria ekonomi?
3. **Hasil Filter 1 tanpa Filter 2:** Jika user pilih "Cukup", tampilkan Filter 1 result sebagai rekomendasi akhir?
4. **Score display:** Skor SAW tampil sebagai desimal (0.8886) atau persentase (88.86%)?
