# Content Rewrite Brief — Agri-SAW Pro Chatbot

> **Dibuat:** 2026-06-11
> **Tujuan:** Brief untuk content rewrite — apa yang boleh diubah, apa yang tidak.
> **Scope:** Semua message text di chat widget + FAQ page + tooltips + collecting flow.

---

## YANG TIDAK BOLEH BERUBAH (FUNGTIONAL CONTRACT)

1. **State machine flow** — `welcome → ringkasan → collecting → confirming → filter1_result → filter2_summary → filter2_pref → done → detail → closing`. Jangan tambah/kurangi phase.
2. **Quick reply values** — Semua `value` di quick-replies.ts (contoh: `__FILTER1_LANJUT__`, `pref_biaya`, `cat_sistem`, dll) adalah kontrak dengan `handleQuickReply` di ChatWidget.tsx. Jangan ubah valuenya.
3. **API contract** — Request body `{ collectedParams, preferences }`, response `{ surviving: [{ name, score, breakdown }], eliminated, darkHorse }`. Jangan ubah field names.
4. **Score ×100** — Score sekarang dikali 100 (78.55 bukan 0.7855). Label "dari 100" sudah benar.
5. **Breakdown 1-5** — Breakdown per kriteria tetap skala 1-5. Jangan ubah.
6. **preferenceToCriterion map** — `pref_biaya → biaya_produksi`, dll. Sudah benar.
7. **FAQ 3-level structure** — Level 1 kategori, Level 2 pertanyaan, Level 3 jawaban. Navigasi `__FAQ_BACK__` dan `__FAQ_KEMBALI__`.
8. **Quick reply labels yang sudah benar** — "Lanjut hitung ranking", "Cukup, tampilkan rekomendasi", "Konsultasi ulang", "Hitung Ranking", dll.

---

## YANG BOLEH DIREWRITE (CONTENT)

### A. messages.ts — Semua function message
- `welcomeMessage()` — sambutan awal
- `ringkasanMessage()` — overview 2 tahap
- `collectingQuestion()` — pertanyaan per parameter (5 function)
- `kurangYakinFallback()` — fallback "kurang yakin" (5 parameter)
- `confirmingMessage()` — konfirmasi data
- `paramRecapLine()` — baris rekap per parameter
- `filter1ResultMessage()` — hasil Filter 1
- `filter2PrefMessage()` — data ekonomi + minta preferensi
- `filter2ResultMessage()` — ranking + breakdown
- `allEliminatedMessage()` — semua dieliminasi
- `detailMessage()` — detail per crop + breakdown
- `closingMessage()` — penutup
- `errorMessage()` — error
- `loadingMessage()` — loading

### B. phases/collecting.ts — Pertanyaan collecting
- `getCurrentQuestion()` — pertanyaan per parameter
- `getKurangYakinFallback()` — fallback per parameter

### C. phases/ringkasan.ts — Ringkasan message
- `handleShowFaqCategories()` — daftar kategori FAQ

### D. quick-replies.ts — Label quick replies
- Semua `label` boleh diubah (tapi bukan `value`)
- FAQ_REPLIES labels
- FILTER2_SUMMARY_REPLIES labels
- Semua labels lain

### E. tooltips.ts — Tooltip content
- Semua tooltip boleh di-rewrite

### F. faq-content.ts — FAQ content (21 pertanyaan)
- Semua `question` dan `answer` boleh di-rewrite

---

## PRINSIP REWRITE

### Bahasa
- Bahasa Indonesia yang mudah dipahami petani non-teknis
- Tidak ada jargon teknis (SAW, normalisasi, matriks, Boolean, Vᵢ, dll)
- Gunakan bahasa sehari-hari yang ramah
- Angka tetap ada (petani perlu angka untuk membandingkan)
- Jangan pakai em-dash panjang (—) sebagai pemisah. Gunakan bullet atau baris kosong.
- Jangan pakai underscore untuk italic (`_text_`). Gunakan bold (`**text**)` untuk penekanan.

### Struktur
- Paragraf pendek (maks 3-4 kalimat per paragraf)
- Gunakan bullet `•` untuk list
- Gunakan emoji sebagai visual anchor (🌾🌽🫘🌶️🧅🧄)
- Bold `**text**` untuk label/nama (pastikan format markdown benar — tidak ada spasi sebelum `**` penutup)
- Data ekonomi dalam format: `Label: nilai` (contoh: `Biaya: Rp 7,2 juta/ha`)

### Line Break Rules (PENTING — ReactMarkdown rendering)

ReactMarkdown membaca `\n\n` (baris kosong) sebagai pemisah paragraf. `\n` (single newline) di dalam paragraf TIDAK membuat baris baru — ia hanya spasi.

**DALAM PARAGRAF (antar kalimat):**
- Gunakan 1 baris kosong (`\n\n`) untuk memisahkan kalimat dalam paragraf yang panjang
- Contoh: "Kalimat pertama.\n\nKalimat kedua." → dua paragraf terpisah
- Contoh: "Kalimat pertama. Kalimat kedua." (tanpa baris kosong) → satu paragraf, ReactMarkdown akan rapikan

**ANTAR SECTION (antar paragraf/topik):**
- Minimal 1 baris kosong (`\n\n`) antara section yang berbeda
- Contoh: paragraf penjelasan → baris kosong → heading `**Tahap 1**` → baris kosong → isi
- JANGAN gabungkan heading dengan paragraf sebelumnya tanpa baris kosong

**ANTAR BULLET POINTS:**
- Setiap bullet `•` harus di baris sendiri (dipisah `\n`)
- Tidak perlu baris kosong antar bullet dalam list yang sama
- Baris kosong sebelum bullet pertama dan sesudah bullet terakhir

**Contoh pola yang benar (FAQ content - sudah benar):**
```
'Agri-SAW Pro bekerja dalam **2 tahap perhitungan berurutan**:',
'',                    ← baris kosong = pemisah section
'**Tahap 1 — Kesesuaian Lahan**',
'',                    ← baris kosong = pemisah section
'Penjelasan tentang tahap 1...',
```

**Contoh pola yang benar (messages.ts - lines.push):**
```typescript
lines.push('Paragraf penjelasan tentang topik A.');
lines.push('');           ← baris kosong = pemisah section
lines.push('**Heading**');
lines.push('');           ← baris kosong = pemisah section
lines.push('• Bullet 1');
lines.push('• Bullet 2');
```

**YANG HARUS DIHINDARI:**
- Jangan gabungkan heading `**text**` dengan teks sebelumnya tanpa baris kosong
- Jangan mulai paragraf baru tanpa baris kosong sebelumnya
- Jangan pakai single `\n` untuk membuat paragraf baru — harus `\n\n` (baris kosong)

### Tone
- Ramah, seperti penyuluh pertanian yang sedang berbicara
- Menggunakan "Bapak/Ibu" atau "Anda" (konsisten)
- Tidak terlalu formal, tidak terlalu casual
- Memberikan konteks "kenapa" di balik setiap informasi

### Halaman FAQ
- Pertanyaan tetap sama (21 pertanyaan, 5 kategori)
- Jawaban di-rewrite dengan gaya yang sama seperti chat
- Page layout (accordion, glass-plate) TIDAK diubah — hanya teks

---

## OUTPUT SETELAH REWRITE

Setelah selesai, semua message harus:
1. Lebih mudah dipahami petani awam
2. Terstruktur dengan baik (paragraf, bullet, spacing)
3. Konsisten tone-nya
4. Tidak ada jargon teknis yang tidak dijelaskan
5. Markdown format yang benar (bold tampil sebagai bold, bukan literal `**text**`)
