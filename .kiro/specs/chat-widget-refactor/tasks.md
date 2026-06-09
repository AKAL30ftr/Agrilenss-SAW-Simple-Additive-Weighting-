# Implementation Plan

## Overview

Implementasi empat bugfix pada ChatWidget plus refactor modularitas. Urutan dikerjakan dari fondasi (types + constants) dulu, lalu fix yang paling sederhana (Bug 3, Bug 4), kemudian yang paling kritis (Bug 1, Bug 2), dan diakhiri dengan tests serta verifikasi final.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3"] },
    { "wave": 3, "tasks": ["4", "5", "6", "7"] },
    { "wave": 4, "tasks": ["8"] },
    { "wave": 5, "tasks": ["9"] },
    { "wave": 6, "tasks": ["10"] }
  ]
}
```

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Tekstur Tanah Terskip + Asterisk di Output
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: Scope to concrete failing cases that are deterministic and reproducible
  - Test 1.A — Bug 1 (Tekstur Terskip):
    - Call `parseUserInput("tanah subur hijau")` and assert `result.texture !== null`
    - This confirms the side-effect: keyword 'subur' in phKeywords also triggers textureKeywords
    - Simulate `advanceCollecting` receiving `data.missingParams = ['intensitas cahaya']` while `collectedParams['tekstur tanah'] === null`
    - Assert that after the call, `currentMissingParams` contains 'tekstur tanah'
    - **EXPECTED OUTCOME on unfixed code**: FAILS — 'tekstur tanah' disappears from the queue
    - Document counterexample: `advanceCollecting({missingParams: ['intensitas cahaya'], ...})` → currentMissingParams does NOT contain 'tekstur tanah'
  - Test 1.B — Bug 3 (Asterisk di Output):
    - Call `renderMessageContent('⚠️ *Rekomendasi awal berdasarkan knowledge base.*')` and assert output does not contain `*`
    - Call `renderMessageContent('*italic teks*')` and assert output does not contain `*`
    - **EXPECTED OUTCOME on unfixed code**: FAILS — single asterisks pass through unchanged
    - Document counterexample: `renderMessageContent('*teks*')` returns `'*teks*'` instead of `'teks'`
  - Run tests on UNFIXED code
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Parameter Lain & Pesan Tanpa Asterisk Tidak Berubah
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (cases where isBugCondition returns false)
  - Test 2.A — Bug 1 Preservation (`collectedParams['tekstur tanah']` sudah terisi):
    - Observe: when `collectedParams = { 'tekstur tanah': 'lempung', 'ketinggian': 500 }`, `advanceCollecting` dengan `data.missingParams = ['curah hujan']` → `currentMissingParams = ['curah hujan']`
    - Write property-based test: for all collectedParams where `collectedParams['tekstur tanah'] !== null`, the resulting `currentMissingParams` matches `data.missingParams` filtered by PARAM_ORDER
    - Verify test PASSES on UNFIXED code (confirms baseline behavior)
  - Test 2.B — Bug 3 Preservation (teks tanpa asterisk):
    - Observe: `renderMessageContent('Jagung adalah pilihan terbaik')` returns `'Jagung adalah pilihan terbaik'` unchanged
    - Write property-based test: for all strings WITHOUT `*` character, `renderMessageContent(content) === content` (identity property)
    - Verify test PASSES on UNFIXED code
  - Test 2.C — Bug 4 Preservation (fase non-ringkasan):
    - Observe: `renderRingkasanActions` with `phase = 'collecting'` or `'confirming'` or `'preference'` returns null
    - Write test asserting null return for all non-ringkasan phases
    - Verify test PASSES on UNFIXED code
  - Test 2.D — Bug 2 Preservation (all-eliminated case tidak terganggu):
    - Observe: `renderEliminationSummary` with `survivingCrops.length === 0` and `eliminatedCrops.length > 0` returns null
    - Write test asserting null return when `survivingCrops` is empty
    - Verify test PASSES on UNFIXED code
  - **EXPECTED OUTCOME**: All preservation tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Modularitas: buat `lib/chat/types.ts` dan `lib/chat/constants.ts`

  - [x] 3.1 Buat `lib/chat/types.ts` — type definitions
    - Export `FlowPhase` type: `'welcome' | 'ringkasan' | 'collecting' | 'confirming' | 'preference' | 'detail' | 'done'`
    - Export `FaqView` type: `'none' | 'categories' | 'items' | 'answer'`
    - Export `Message` interface: `{ id: string; role: 'user' | 'assistant'; content: string }`
    - Export `QuickReply` interface: `{ label: string; value: string }`
    - Export `PreferenceOption` interface: `{ id: string; label: string; criterionId: string }`
    - Export `StoredUserData` interface: `{ name: string; gender: 'laki' | 'perempuan'; lastParams?: Record<string, unknown> }`
    - _Requirements: N/A (refactor modularitas)_

  - [x] 3.2 Buat `lib/chat/constants.ts` — constants & static data
    - Import types dari `./types`
    - Export `STORAGE_KEY = 'agri-saw-user'`
    - Export `PARAM_ORDER: string[]` dengan urutan canonical: `['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah', 'intensitas cahaya']`
    - Export `QUICK_REPLIES: Record<string, QuickReply[]>` — pindah dari ChatWidget.tsx
    - Export `TOOLTIPS: Record<string, string>` — pindah dari ChatWidget.tsx
    - Export `PARAM_LABELS: Record<string, { label, emoji, format }>` — pindah dari ChatWidget.tsx
    - Export `ParamQuestionFn` type dan `PARAM_QUESTION_MESSAGES: Record<string, ParamQuestionFn>` — pindah dari ChatWidget.tsx
    - Export `PREFERENCE_OPTIONS: PreferenceOption[]` — pindah dari ChatWidget.tsx
    - Export `PARAM_TO_FAQ: Record<string, { sectionId, itemId, label }>` — pindah dari ChatWidget.tsx
    - _Requirements: N/A (refactor modularitas)_

  - [x] 3.3 Update import di `components/ChatWidget.tsx`
    - Tambah import: `import type { FlowPhase, FaqView, Message, QuickReply, PreferenceOption, StoredUserData } from '@/lib/chat/types'`
    - Tambah import: `import { STORAGE_KEY, PARAM_ORDER, QUICK_REPLIES, TOOLTIPS, PARAM_LABELS, PARAM_QUESTION_MESSAGES, PREFERENCE_OPTIONS, PARAM_TO_FAQ } from '@/lib/chat/constants'`
    - Hapus semua deklarasi duplikat lokal di ChatWidget.tsx yang sudah dipindah
    - Verifikasi kompilasi tidak error setelah perubahan import
    - _Requirements: N/A (refactor modularitas)_

- [ ] 4. Fix Bug 3 — strip markdown asterisk

  - [x] 4.1 Fix `renderMessageContent` di `components/ChatWidget.tsx`
    - Ganti implementasi lama yang hanya handle `**` dengan versi baru:
    - `.replace(/\*\*(.*?)\*\*/g, '$1')` — bold: **teks** → teks
    - `.replace(/\*(.*?)\*/g, '$1')` — italic: *teks* → teks
    - `.replace(/\*/g, '')` — sisa asterisk tunggal → hapus
    - _Bug_Condition: isBugCondition_3(content) — content mengandung pola `**...**` atau `*...*` atau `*` tunggal_
    - _Expected_Behavior: renderMessageContent(content) tidak mengandung karakter `*` sama sekali_
    - _Preservation: string tanpa `*` dikembalikan identik tanpa perubahan_
    - _Requirements: 2.6, 2.7, 2.8_

  - [x] 4.2 Fix `fallbackMessage` di `app/api/recommend/route.ts`
    - Cari baris dengan pola `'⚠️ *Rekomendasi awal berdasarkan knowledge base...*'`
    - Hapus tanda bintang pembuka dan penutup, pertahankan isi pesan dan emoji ⚠️
    - _Bug_Condition: fallbackMessage mengandung `*...*` yang lolos dari strip ChatWidget_
    - _Expected_Behavior: fallbackMessage tidak mengandung asterisk sama sekali_
    - _Requirements: 3.3_

- [x] 5. Fix Bug 4 — merge tombol ringkasan duplikat

  - [x] 5.1 Tambah `renderRingkasanActions` di `components/ChatWidget.tsx`
    - Buat fungsi baru dengan guard tunggal: `if (phase !== 'ringkasan' || faqView !== 'none') return null`
    - Label tombol kedua bervariasi: `returningToRingkasan ? 'Ada pertanyaan lain' : 'Ada pertanyaan dulu'`
    - Render dua tombol: `__RINGKASAN_LANJUT__` dan `__RINGKASAN_FAQ__`
    - Tambah `role="group"` dan `aria-label="Opsi ringkasan"` untuk aksesibilitas
    - Tambah `onKeyDown` handler dengan `handleQuickReplyKeyDown` di setiap tombol
    - Tambah `tabIndex={0}` dan `min-h-[44px]` (touch target minimum) di setiap tombol
    - _Bug_Condition: isBugCondition_4(X) — phase='ringkasan', faqView='none', dua render function aktif bersamaan_
    - _Expected_Behavior: DOM mengandung tepat satu tombol `__RINGKASAN_LANJUT__` dan satu `__RINGKASAN_FAQ__`_
    - _Preservation: Semua fase non-ringkasan tidak terpengaruh; FAQ navigation tetap berjalan_
    - _Requirements: 2.9, 2.10, 2.11_

  - [x] 5.2 Hapus `renderRingkasanQuickReplies` dan `renderReturnToRingkasan`
    - Hapus definisi fungsi `renderRingkasanQuickReplies` dari ChatWidget.tsx
    - Hapus definisi fungsi `renderReturnToRingkasan` dari ChatWidget.tsx
    - Di JSX, ganti kedua pemanggilan dengan satu pemanggilan `{renderRingkasanActions()}`
    - Pastikan tidak ada referensi sisa ke dua fungsi lama
    - _Requirements: 2.9, 2.10, 2.11_

- [x] 6. Fix Bug 1 — tekstur tanah selalu masuk antrian

  - [x] 6.1 Tambah helper `computeClientMissingParams` di `components/ChatWidget.tsx`
    - Tambahkan fungsi pure (di luar komponen) yang menerima `collected: Record<string, unknown> | null`
    - Jika `collected` null, return `[...PARAM_ORDER]` (semua parameter)
    - Jika tidak, filter `PARAM_ORDER` untuk param yang nilainya null/undefined/'' di `collected`
    - Fungsi ini adalah client-side guard yang tidak bergantung pada API response
    - _Bug_Condition: isBugCondition_1(X) — 'tekstur tanah' NOT IN apiMissing AND collectedParams['tekstur tanah'] IS NULL_
    - _Requirements: 2.1, 2.2_

  - [x] 6.2 Update `advanceCollecting` — merge API missing dengan client missing
    - Simpan hasil mapping `data.userValues` ke Indonesian keys dalam variabel `updatedCollected`
    - Tambahkan invariant comment: `// INVARIANT: jangan pernah percaya penuh pada data.missingParams dari API.`
    - Hitung `apiMissing = data.missingParams || []`
    - Hitung `clientMissing = computeClientMissingParams(updatedCollected ?? collectedParams)`
    - Buat union: `mergedSet = new Set([...apiMissing, ...clientMissing])`
    - Filter melalui PARAM_ORDER: `remaining = PARAM_ORDER.filter((p) => mergedSet.has(p))`
    - Gunakan `remaining` (bukan `data.missingParams` langsung) untuk `setCurrentMissingParams`
    - _Bug_Condition: `advanceCollecting` set `currentMissingParams` hanya dari `data.missingParams` tanpa merge client check_
    - _Expected_Behavior: setelah fix, 'tekstur tanah' selalu ada di currentMissingParams jika collectedParams['tekstur tanah'] masih null_
    - _Preservation: jika collectedParams['tekstur tanah'] sudah terisi, hasilnya identik dengan kode lama_
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Fix Bug 2 — tampilkan alasan eliminasi

  - [x] 7.1 Tambah `renderEliminationSummary` di `components/ChatWidget.tsx`
    - Buat fungsi dengan guard: return null jika `phase !== 'done'` atau `survivingCrops.length === 0` atau `eliminatedCrops.length === 0`
    - Render card dengan styling amber (konsisten dengan warning style yang ada)
    - Tampilkan judul: `Tanaman yang tidak cocok dengan lahan {sapaan(userGender)}:`
    - Untuk setiap `eliminatedCrops`, tampilkan `• {crop.name}: {crop.reasons[0]}`
    - Gunakan ikon `Bot` dengan warna amber (konsisten dengan design system)
    - _Bug_Condition: isBugCondition_2(X) — phase='done', survivingCrops.length > 0, eliminatedCrops.length > 0, UI tidak render eliminatedCrops_
    - _Expected_Behavior: UI merender informasi eliminatedCrops dengan minimal satu alasan per tanaman_
    - _Preservation: ketika survivingCrops.length === 0 (all-eliminated), fungsi ini return null — renderEliminatedFaqLinks tetap menangani kasus itu_
    - _Requirements: 2.4, 2.5_

  - [x] 7.2 Pasang `renderEliminationSummary` di JSX ChatWidget
    - Temukan area render di fase 'done' — setelah `renderConfirmingCard()` dan `renderDetailCard()`
    - Tambahkan sebelum `renderResultQuickReplies()` dengan komentar section
    - Pastikan urutan render: pesan asisten → elimination summary → result quick replies
    - _Requirements: 2.4, 2.5_

- [x] 8. Buat `tests/chat-widget.test.ts`

  - [x] 8.1 Unit tests untuk `computeClientMissingParams`
    - `computeClientMissingParams(null)` → returns semua 5 params dari PARAM_ORDER
    - `computeClientMissingParams({})` → returns semua 5 params
    - `computeClientMissingParams({ ketinggian: 500, 'pH tanah': 6.5 })` → `['curah hujan', 'tekstur tanah', 'intensitas cahaya']`
    - `computeClientMissingParams({ 'tekstur tanah': 'lempung' })` → `['ketinggian', 'curah hujan', 'pH tanah', 'intensitas cahaya']`
    - `computeClientMissingParams` dengan semua 5 params terisi → returns `[]`
    - _Requirements: 2.1, 2.2_

  - [x] 8.2 Unit tests untuk `renderMessageContent`
    - `renderMessageContent('**bold**')` → `'bold'`
    - `renderMessageContent('*italic*')` → `'italic'`
    - `renderMessageContent('⚠️ *Rekomendasi awal berdasarkan knowledge base.*')` → `'⚠️ Rekomendasi awal berdasarkan knowledge base.'`
    - `renderMessageContent('Catatan: *penting*')` → `'Catatan: penting'`
    - `renderMessageContent('teks biasa tanpa asterisk')` → `'teks biasa tanpa asterisk'` (identik)
    - `renderMessageContent('**Rekomendasi: Jagung**')` → `'Rekomendasi: Jagung'`
    - _Requirements: 2.6, 2.7, 2.8_

  - [x] 8.3 Unit tests untuk `renderRingkasanActions` guard conditions
    - `phase='ringkasan', faqView='none', returningToRingkasan=false` → render satu set tombol (tidak null)
    - `phase='collecting'` → null
    - `phase='confirming'` → null
    - `phase='preference'` → null
    - `phase='ringkasan', faqView='categories'` → null
    - `returningToRingkasan=true` → label tombol kedua = 'Ada pertanyaan lain'
    - `returningToRingkasan=false` → label tombol kedua = 'Ada pertanyaan dulu'
    - _Requirements: 2.9, 2.10_

  - [x] 8.4 Unit tests untuk `renderEliminationSummary` guard conditions
    - `phase='done', survivingCrops.length=2, eliminatedCrops.length=1` → render card (tidak null)
    - `survivingCrops.length=0` → null (all-eliminated case)
    - `eliminatedCrops.length=0` → null
    - `phase='preference'` → null
    - Verifikasi alasan tanaman pertama (`reasons[0]`) muncul di render output
    - _Requirements: 2.4, 2.5_

  - [x] 8.5 Integration test — flow tekstur tanah tidak pernah terskip
    - Setup: simulate user menjawab pertanyaan pH dengan "tanah subur hijau"
    - Mock API response: `{ missingParams: ['intensitas cahaya'], userValues: { pH: 6.5, texture: 'lempung', ... } }`
    - Panggil `advanceCollecting` dengan data tersebut, di mana `collectedParams['tekstur tanah']` masih null
    - Assert: setelah call, `currentMissingParams` MENGANDUNG 'tekstur tanah'
    - Assert: pertanyaan tekstur tanah ditampilkan sebelum pertanyaan intensitas cahaya
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 8.6 Integration test — alasan eliminasi tampil di UI
    - Setup: `phase='done'`, `survivingCrops = [{ name: 'Jagung', score: '0.750' }]`, `eliminatedCrops = [{ name: 'Padi', reasons: ['ketinggian 500 mdpl terlalu tinggi...'] }]`
    - Render ChatWidget di fase tersebut
    - Assert: teks "Padi" muncul di area chat
    - Assert: teks dari `reasons[0]` muncul di area chat
    - _Requirements: 2.4, 2.5_

- [x] 9. Verifikasi fix dan tidak ada regresi

  - [x] 9.1 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Tekstur Tanah Terskip + Asterisk di Output
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - Re-run Test 1.A: `advanceCollecting` dengan API missing tanpa 'tekstur tanah' → currentMissingParams sekarang MENGANDUNG 'tekstur tanah'
    - Re-run Test 1.B: `renderMessageContent('⚠️ *note*')` → output tidak mengandung `*`
    - **EXPECTED OUTCOME**: Both tests PASS (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.6, 2.7_

  - [x] 9.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Parameter Lain & Pesan Tanpa Asterisk Tidak Berubah
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Re-run semua 4 preservation test groups (2.A, 2.B, 2.C, 2.D)
    - **EXPECTED OUTCOME**: All preservation tests PASS (confirms no regressions)
    - Confirm semua quick replies tetap berfungsi, FAQ navigation tetap berjalan
    - Confirm all-eliminated case tetap ditangani oleh `renderEliminatedFaqLinks` (bukan `renderEliminationSummary`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.3 Manual smoke test — alur lengkap
    - Form → ringkasan → collecting 5 param termasuk tekstur tanah → confirming → preference → done
    - Verifikasi semua 5 pertanyaan muncul berurutan sesuai PARAM_ORDER
    - Jawab pH dengan "Hijau dan subur" → verifikasi pertanyaan tekstur tanah tetap muncul sesudahnya
    - Verifikasi tidak ada tanda bintang `*` di output chat manapun
    - Verifikasi tombol ringkasan hanya muncul satu set (tidak duplikat) saat kembali dari FAQ
    - Verifikasi tanaman dieliminasi muncul dengan alasan saat ada tanaman yang survive
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 10. Checkpoint — Semua tests pass
  - Jalankan test suite: `npx vitest run tests/chat-widget.test.ts`
  - Pastikan tidak ada test yang gagal
  - Pastikan TypeScript compile tanpa error: `npx tsc --noEmit`
  - Verifikasi checklist: `advanceCollecting` tidak pernah set `currentMissingParams` dari `data.missingParams` saja tanpa merge client check
  - Verifikasi checklist: tidak ada render function baru yang merender tombol `__RINGKASAN_LANJUT__` atau `__RINGKASAN_FAQ__` selain `renderRingkasanActions`
  - Verifikasi checklist: `renderMessageContent` memproses semua pola `*` bukan hanya `**`
  - Verifikasi checklist: tidak ada string literal di ChatWidget.tsx atau route.ts yang menggunakan `*...*` untuk formatting
  - Verifikasi checklist: `renderEliminationSummary` hanya aktif saat `survivingCrops.length > 0`
  - Tanyakan ke user jika ada yang tidak jelas atau ada keputusan implementasi yang perlu dikonfirmasi

## Notes

- **Urutan kritis**: Task 3 (modularitas) harus selesai sebelum task 4–7 (bug fixes) karena semua fix akan mengimport dari `lib/chat/constants` dan `lib/chat/types`.
- **Task 1 & 2 adalah PBT tasks**: Tulis test sebelum implementasi fix. Task 1 EXPECTED to FAIL pada unfixed code; task 2 EXPECTED to PASS.
- **Bug 1 adalah yang paling kritis**: Menyebabkan rekomendasi tidak akurat karena filter agroklimat berjalan tanpa data tekstur tanah.
- **Bug 3 ada dua titik fix**: ChatWidget.tsx (`renderMessageContent`) dan route.ts (`fallbackMessage`). Keduanya harus diperbaiki.
- **Bug 4 fix adalah merge, bukan tambah**: Hapus dua fungsi lama, buat satu fungsi baru — bukan menambah fungsi ketiga.
- **`renderEliminationSummary` vs `renderEliminatedFaqLinks`**: Keduanya harus koeksistensi. Yang baru hanya aktif saat ada `survivingCrops`; yang lama tetap menangani all-eliminated case.
- File test: gunakan `vitest` yang sudah terkonfigurasi di project (`vitest.config.ts`).
