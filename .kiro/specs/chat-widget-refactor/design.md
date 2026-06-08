# Chat Widget Refactor — Bugfix Design

## Overview

ChatWidget (`components/ChatWidget.tsx`, ~1200 baris) mengalami empat bug yang ditemukan dari
flow nyata konsultasi pertanian. Bug-bug ini menyebabkan: satu parameter lahan tidak pernah
ditanyakan (rekomendasi tidak akurat), tanaman yang dieliminasi tidak dijelaskan alasannya,
tanda bintang markdown tampil sebagai karakter literal, dan tombol quick reply muncul ganda.

Selain perbaikan bug, refactor modularitas memindahkan konstanta dan type definitions ke
modul terpisah (`lib/chat/constants.ts` dan `lib/chat/types.ts`) untuk mengurangi ukuran file
ChatWidget.tsx dan meningkatkan maintainability.

Pendekatan fix bersifat **minimal dan targeted**: setiap bug diperbaiki secara independen
dengan scope perubahan sesempit mungkin agar tidak menimbulkan regresi pada flow yang sudah
berjalan.

---

## Glossary

- **Bug_Condition (C)**: Kondisi input/state yang memicu bug — fungsi spesifik `isBugCondition_N`
  per bug
- **Property (P)**: Perilaku yang diinginkan ketika bug condition terpenuhi setelah fix
- **Preservation**: Perilaku yang tidak boleh berubah akibat fix — semua path yang tidak
  melewati bug condition
- **PARAM_ORDER**: Array `['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah',
  'intensitas cahaya']` — source of truth urutan pengumpulan parameter
- **advanceCollecting**: Handler di ChatWidget yang menerima API response dan mengupdate
  `currentMissingParams` serta `collectedParams`
- **detectMissingParams**: Fungsi di `lib/knowledge-base.ts` yang memeriksa `ParsedUserInput`
  dan mengembalikan array nama parameter yang masih `null`
- **textureKeywords**: Map di `knowledge-base.ts` yang memetakan kata kunci observasional ke
  kategori tekstur tanah — mengandung 'subur' dan 'hijau' yang juga muncul di `phKeywords`
- **eliminatedCrops**: State array `{name, reasons[]}` di ChatWidget — diisi setelah Filter 1
  berjalan, tapi tidak selalu dirender ke UI
- **renderMessageContent**: Fungsi strip-markdown di ChatWidget yang dipanggil di setiap
  `messages.map` — saat ini hanya handle `**double asterisk**`
- **returningToRingkasan**: Boolean state yang menandai user baru kembali dari FAQ ke fase
  ringkasan

---

## Bug Details

### Bug 1 — Tekstur Tanah Terskip

#### Root Cause Analysis

`advanceCollecting` menerima `data.missingParams` dari API response dan langsung
menggunakannya sebagai `currentMissingParams` baru:

```typescript
// ChatWidget.tsx — advanceCollecting (KONDISI BUGGY)
const remaining = data.missingParams || [];
setCurrentMissingParams(remaining);    // ← hanya percaya API
```

Masalah terjadi ketika user menjawab pertanyaan pH tanah dengan jawaban seperti
**"tanah subur hijau"**. Parser di `knowledge-base.ts` menjalankan kedua loop secara
berurutan:

```typescript
// knowledge-base.ts — parseUserInput (sumber masalah)
// Step 1: pH parsing
for (const [kw, val] of Object.entries(phKeywords)) {
  if (lower.includes(kw)) { result.pH = val; break; }  // 'subur' → pH 6.5 ✓
}
// Step 2: Texture parsing — berjalan TERLEPAS dari step 1
for (const [kw, val] of Object.entries(textureKeywords)) {
  if (lower.includes(kw)) { result.texture = val; break; }  // 'subur' → 'lempung' ✓
}
```

`textureKeywords` mengandung entri `'subur': 'lempung'` dan `'hijau': 'lempung'` (melalui
keyword 'subur'). Jadi jawaban untuk pertanyaan pH seperti "tanah subur hijau" secara
tidak sengaja juga men-set `parsed.texture = 'lempung'`.

Akibatnya, di call API berikutnya, `detectMissingParams` tidak lagi memandang 'tekstur tanah'
sebagai missing karena `parsed.texture !== null`. API mengembalikan `missingParams` tanpa
'tekstur tanah', dan `advanceCollecting` langsung mematuhinya — melewatkan pertanyaan tekstur.

#### Data Flow Diagram — Sequential Param Collection

```
User jawab pH: "tanah subur hijau"
        │
        ▼
[API /recommend]
  parseUserInput("tanah subur hijau")
  ┌─────────────────────────────────────────────────┐
  │ phKeywords['subur'] → pH = 6.5         (BENAR) │
  │ textureKeywords['subur'] → texture = 'lempung' │
  │   ↑ SIDE EFFECT: tekstur ter-parse dari         │
  │     jawaban yang seharusnya untuk pH            │
  └─────────────────────────────────────────────────┘
  merged dengan previousParams
  detectMissingParams(parsed):
    pH=6.5 ✓, texture='lempung' ✓   ← SALAH, tekstur belum dijawab user
    → missingParams = ['intensitas cahaya']  ← tekstur HILANG
        │
        ▼
[ChatWidget — advanceCollecting]
  remaining = ['intensitas cahaya']   ← tekstur tidak ada!
  setCurrentMissingParams(remaining)  ← langsung dipercaya
        │
        ▼
  Pertanyaan tekstur TIDAK PERNAH DITAMPILKAN
  filterByAgroklimat berjalan dengan parsed.texture = 'lempung'
  (nilai "phantom" dari kontaminasi pH jawaban)
```

**Seharusnya (setelah fix):**

```
User jawab pH: "tanah subur hijau"
        │
        ▼
[API /recommend] → missingParams mungkin tidak mengandung 'tekstur tanah'
        │
        ▼
[ChatWidget — advanceCollecting FIXED]
  computeClientMissingParams(collectedParams):
    collectedParams['tekstur tanah'] == null  → MASUK ke missing
    → clientMissing = ['tekstur tanah', 'intensitas cahaya']
  
  remaining = MERGE(data.missingParams, clientMissing)
  → ['tekstur tanah', 'intensitas cahaya']  ← tekstur TETAP ada
        │
        ▼
  Pertanyaan tekstur TETAP DITAMPILKAN
```

#### Bug Condition (Formal)

```
FUNCTION isBugCondition_1(X)
  INPUT: X adalah state setelah advanceCollecting dipanggil dengan API response
  OUTPUT: boolean

  apiMissing   ← X.data.missingParams
  localParams  ← X.collectedParams

  RETURN 'tekstur tanah' NOT IN apiMissing
         AND localParams['tekstur tanah'] IS NULL
         AND (currentMissingParams akan di-set hanya dari apiMissing)
END FUNCTION
```

#### Contoh Konkret

| Skenario | pH Jawaban User | texture di API | missingParams API | Bug Terjadi? |
|----------|----------------|----------------|-------------------|--------------|
| "tanah subur hijau" | 6.5 | 'lempung' | ['intensitas cahaya'] | **Ya** |
| "hijau dan subur" | 6.5 | 'lempung' | ['intensitas cahaya'] | **Ya** |
| "tanaman menguning" | 5.0 | null | ['tekstur tanah', 'intensitas cahaya'] | Tidak |
| "pH 6.5" (numerik eksplisit) | 6.5 | null | ['tekstur tanah', 'intensitas cahaya'] | Tidak |
| "tumbuh biasa saja" | 6.5 | null | ['tekstur tanah', 'intensitas cahaya'] | Tidak |

---

### Bug 2 — Eliminasi Tanpa Alasan

#### Root Cause Analysis

State `eliminatedCrops` diisi dengan benar di `proceedWithCalculation`:

```typescript
// ChatWidget.tsx — proceedWithCalculation
setSurvivingCrops(surviving);
setEliminatedCrops(apiData.eliminated || []);  // ← data ada di state
```

Namun, UI rendering hanya menangani kasus `all-eliminated`:

```typescript
// ChatWidget.tsx — renderEliminatedFaqLinks
const renderEliminatedFaqLinks = () => {
  if (phase !== 'done' || eliminatedCrops.length === 0 || outOfRangeParams.length === 0)
    return null;
  // Render FAQ links untuk semua-dieliminasi
  // ← Ini TIDAK dipanggil ketika ada surviving crops juga
};
```

Ketika `survivingCrops.length > 0 && eliminatedCrops.length > 0`, tidak ada komponen yang
merender `eliminatedCrops`. Pengguna hanya melihat tanaman yang lolos tanpa tahu mengapa
tanaman lain tidak direkomendasikan.

#### Bug Condition (Formal)

```
FUNCTION isBugCondition_2(X)
  INPUT: X adalah state setelah proceedWithCalculation selesai
  OUTPUT: boolean

  RETURN X.eliminatedCrops.length > 0
         AND X.survivingCrops.length > 0
         AND phase = 'done'
         AND UI tidak merender eliminatedCrops dengan alasan
END FUNCTION
```

#### Contoh Konkret

- Kondisi lahan: dataran sedang (500 mdpl), pH 6.5, lempung, hujan cukup, cahaya 9 jam
- Padi: dieliminasi (ketinggian 500 mdpl > batas 0-400)  ← tidak muncul di UI
- Jagung, Kedelai, Cabai: survive                         ← muncul di UI
- User melihat rekomendasi Jagung tanpa tahu Padi kenapa tidak ada

---

### Bug 3 — Tanda Bintang Markdown

#### Root Cause Analysis

Tiga sumber terpisah menyebabkan asterisk tampil:

**Sumber 1** — `renderMessageContent` hanya strip double asterisk:
```typescript
// ChatWidget.tsx — renderMessageContent (BUGGY)
const renderMessageContent = (content: string) => {
  return content.replace(/\*\*/g, '');  // ← hanya hapus '**', tidak hapus '*'
};
```

**Sumber 2** — `fallbackMessage` di `route.ts` menggunakan single asterisk:
```typescript
// app/api/recommend/route.ts (BUGGY)
'⚠️ *Rekomendasi awal berdasarkan knowledge base. Validasi dengan penyuluh...*',
//   ↑ single asterisk — lolos dari strip yang hanya handle **
```

**Sumber 3** — Pesan lokal di `proceedWithCalculation` sudah menggunakan strip, tapi
strip-nya juga tidak lengkap:
```typescript
// ChatWidget.tsx — proceedWithCalculation
const cleanMessage = apiData.message
  ? apiData.message.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '')  // ← ini sudah lebih baik
  : '';
// Tapi pesan yang masuk ke messages SEBELUM cleanMessage (pesan lokal) tidak di-strip sama sekali
```

#### Bug Condition (Formal)

```
FUNCTION isBugCondition_3(content)
  INPUT: content adalah string pesan yang akan ditampilkan
  OUTPUT: boolean

  RETURN content MENGANDUNG pola /\*\*.*?\*\*/
         OR content MENGANDUNG pola /\*[^*].*?\*/
         OR content MENGANDUNG karakter '*' tunggal
END FUNCTION
```

#### Contoh Konkret

| Input Content | renderMessageContent (buggy) | Output (buggy) |
|--------------|------------------------------|----------------|
| `**Rekomendasi: Jagung**` | replace `**` → '' | `Rekomendasi: Jagung` ✓ (tidak ada masalah di sini) |
| `⚠️ *Rekomendasi awal...*` | replace `**` hanya | `⚠️ *Rekomendasi awal...*` ✗ |
| `*teks italic*` | tidak ter-handle | `*teks italic*` ✗ |
| `Catatan: *penting*` | tidak ter-handle | `Catatan: *penting*` ✗ |

---

### Bug 4 — Double Button

#### Root Cause Analysis

Dua render function dengan kondisi guard yang secara logika seharusnya mutually exclusive:

```typescript
// renderRingkasanQuickReplies — guard
if (phase !== 'ringkasan' || faqView !== 'none' || returningToRingkasan) return null;
// → aktif ketika: phase='ringkasan' AND faqView='none' AND returningToRingkasan=false

// renderReturnToRingkasan — guard
if (!returningToRingkasan || faqView !== 'none') return null;
if (phase !== 'ringkasan') return null;
// → aktif ketika: returningToRingkasan=true AND faqView='none' AND phase='ringkasan'
```

Secara logika ini mutually exclusive, **tapi React render cycle** menyebabkan window singkat
di mana kedua kondisi bisa terpenuhi. Ketika `setReturningToRingkasan(true)` dipanggil:

```
Tick 1: returningToRingkasan = false (lama)
  → renderRingkasanQuickReplies: aktif (false → false → false = render)
  → renderReturnToRingkasan: tidak aktif (!false → return null)

[setReturningToRingkasan(true) dipanggil]

Tick 2 (render baru): returningToRingkasan = true
  → renderRingkasanQuickReplies: tidak aktif (true → return null)
  → renderReturnToRingkasan: aktif

Di antara Tick 1 dan Tick 2, jika ada batched state update atau
StrictMode double-render, kedua fungsi bisa aktif bersamaan.
```

Selain itu, kedua fungsi merender tombol dengan `__RINGKASAN_LANJUT__` dan `__RINGKASAN_FAQ__`
yang identik — jika keduanya muncul sekaligus, ada dua set tombol di DOM.

#### Bug Condition (Formal)

```
FUNCTION isBugCondition_4(X)
  INPUT: X adalah DOM snapshot saat fase 'ringkasan'
  OUTPUT: boolean

  buttonsLanjut ← count(DOM.querySelectorAll button dengan onClick '__RINGKASAN_LANJUT__')

  RETURN X.phase = 'ringkasan'
         AND X.faqView = 'none'
         AND buttonsLanjut > 1
END FUNCTION
```

#### Contoh Konkret

- User membaca FAQ, klik "← Kembali ke ringkasan"
- `setFaqView('none')` + `setReturningToRingkasan(true)` dijalankan
- Dalam React StrictMode (development): render dipanggil dua kali
- Untuk sejenak: `faqView='none'`, `returningToRingkasan` belum konsisten antar render
- Hasil: dua set tombol "Mengerti, lanjut konsultasi" muncul bersamaan

---

## Expected Behavior

### Preservation Requirements

Berikut perilaku yang **tidak boleh berubah** akibat keempat fix:

**Unchanged Behaviors:**
- Alur form nama + gender → fase ringkasan harus tetap berjalan normal
- Quick reply `__ESCAPE_TIDAK_TAHU__` dan `__ESCAPE_KURANG_YAKIN__` harus tetap berfungsi
- Mode `all-eliminated` dengan `renderEliminatedFaqLinks` harus tetap tampil normal
- FAQ navigation (categories → items → answer → kembali) harus tetap berfungsi
- Loading screen 3 detik minimum di fase preference → done harus tetap ada
- Preference selection (multi-select, Hitung Ranking) harus tetap berfungsi
- Detail card per tanaman harus tetap dapat dibuka
- Closing flow (Selesai → Konsultasi ulang / Kembali ke beranda) tetap berfungsi
- `budgetWarning` dari API tetap ditampilkan
- localStorage load/save tetap berfungsi
- Progress bar tetap update sesuai `collectedParams`

**Scope:**
Semua input yang TIDAK memicu bug condition harus menghasilkan output yang identik antara
kode lama dan kode baru. Ini mencakup:
- Jawaban pH yang tidak mengandung kata kunci tekstur (contoh: "tanaman menguning", "pH 6.5")
- Flow ketika semua tanaman dieliminasi (`survivingCrops.length === 0`)
- Fase yang bukan 'ringkasan' (collecting, confirming, preference, detail, done)
- Pesan tanpa asterisk sama sekali

---

## Correctness Properties

Property 1: Bug Condition — Tekstur Tanah Selalu Masuk Antrian

_For any_ state X di mana `advanceCollecting` dipanggil dan
`collectedParams['tekstur tanah']` masih `null`, fungsi yang diperbaiki SHALL
memastikan 'tekstur tanah' tetap masuk ke `currentMissingParams` terlepas dari isi
`data.missingParams` dari API.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Parameter Lain Tidak Terganggu

_For any_ state X di mana `collectedParams['tekstur tanah']` sudah terisi (bukan null),
fungsi yang diperbaiki SHALL menghasilkan `currentMissingParams` yang identik dengan
hasil dari kode lama — tidak menambah atau mengurangi parameter lain secara tidak semestinya.

**Validates: Requirements 3.2, 3.3**

Property 3: Bug Condition — Eliminasi Ditampilkan Beserta Alasan

_For any_ state X di mana `phase === 'done'`, `survivingCrops.length > 0`, dan
`eliminatedCrops.length > 0`, UI yang diperbaiki SHALL merender informasi `eliminatedCrops`
dengan minimal satu alasan per tanaman yang terlihat oleh pengguna.

**Validates: Requirements 2.4, 2.5**

Property 4: Bug Condition — Tidak Ada Asterisk di Output Rendered

_For any_ string `content` yang mengandung pola `**...**` atau `*...*` atau `*` tunggal,
`renderMessageContent` yang diperbaiki SHALL mengembalikan string tanpa karakter `*` sama
sekali.

**Validates: Requirements 2.6, 2.7, 2.8**

Property 5: Bug Condition — Tombol Ringkasan Tidak Duplikat

_For any_ state X di mana `phase === 'ringkasan'` dan `faqView === 'none'`, DOM SHALL
mengandung tepat **satu** tombol dengan action `__RINGKASAN_LANJUT__` dan tepat **satu**
tombol dengan action `__RINGKASAN_FAQ__`, tidak pernah lebih dari satu.

**Validates: Requirements 2.9, 2.10, 2.11**

Property 6: Preservation — Pesan Tanpa Asterisk Tidak Berubah

_For any_ string `content` yang tidak mengandung karakter `*` sama sekali,
`renderMessageContent` yang diperbaiki SHALL mengembalikan string yang identik dengan input.

**Validates: Requirements 3.1**

---

## Hypothesized Root Cause

| Bug | Root Cause Utama | Tingkat Keyakinan |
|-----|-----------------|-------------------|
| Bug 1 | `textureKeywords` overlap dengan `phKeywords` ('subur', 'hijau'); `advanceCollecting` terlalu percaya API | Tinggi |
| Bug 2 | Tidak ada render path untuk `eliminatedCrops` ketika ada `survivingCrops` juga | Tinggi |
| Bug 3 | `renderMessageContent` hanya handle `**`, bukan `*`; `fallbackMessage` pakai single asterisk | Tinggi |
| Bug 4 | Dua render function dengan kondisi yang bisa overlap di React render cycle | Sedang |

---

## Fix Implementation

### Bug 1 Fix — `computeClientMissingParams` + Merge di `advanceCollecting`

**File**: `components/ChatWidget.tsx`

**Fungsi baru yang perlu ditambahkan:**

```typescript
// Tambahkan sebelum komponen utama ChatWidget
// atau sebagai helper di dalam komponen

function computeClientMissingParams(
  collected: Record<string, unknown> | null
): string[] {
  if (!collected) return [...PARAM_ORDER];
  return PARAM_ORDER.filter((param) => {
    const val = collected[param];
    return val === null || val === undefined || val === '';
  });
}
```

**Perubahan di `advanceCollecting`:**

```typescript
// SEBELUM (buggy):
const advanceCollecting = useCallback((data: {...}) => {
  if (data.userValues) {
    // ... update collectedParams ...
    const idParams: Record<string, unknown> = {};
    // ...
    setCollectedParams(idParams);
  }
  const remaining = data.missingParams || [];
  setCurrentMissingParams(remaining);   // ← hanya percaya API
  // ...
}, [...]);

// SESUDAH (fixed):
const advanceCollecting = useCallback((data: {...}) => {
  let updatedCollected: Record<string, unknown> | null = null;
  if (data.userValues) {
    const idParams: Record<string, unknown> = {};
    const keyMap: Record<string, string> = {
      elevation: 'ketinggian',
      rainfall: 'curah hujan',
      pH: 'pH tanah',
      texture: 'tekstur tanah',
      light: 'intensitas cahaya',
    };
    for (const [eng, id] of Object.entries(keyMap)) {
      if (data.userValues[eng] != null) idParams[id] = data.userValues[eng];
    }
    updatedCollected = idParams;
    setPreviousParams(data.userValues);
    setCollectedParams(idParams);
  }

  // Guard: merge API missing params dengan client-side missing params
  const apiMissing = data.missingParams || [];
  const clientMissing = computeClientMissingParams(updatedCollected ?? collectedParams);
  
  // Union: param masuk ke antrian jika hilang di API atau hilang di client state
  const mergedSet = new Set([...apiMissing, ...clientMissing]);
  // Preserve PARAM_ORDER: filter PARAM_ORDER berdasarkan mergedSet
  const remaining = PARAM_ORDER.filter((p) => mergedSet.has(p));

  setCurrentMissingParams(remaining);
  if (remaining.length === 0) {
    setPhase('confirming');
  } else {
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'assistant', content: data.message },
    ]);
  }
}, [collectedParams, userGender, userName]);
```

**Catatan implementasi:**
- `updatedCollected` menggunakan nilai yang baru di-set (tidak bisa pakai `collectedParams`
  langsung karena React state belum update di tick yang sama)
- `PARAM_ORDER` sebagai source of truth urutan — union set di-filter melalui PARAM_ORDER
  sehingga urutan pertanyaan tetap konsisten

---

### Bug 2 Fix — `renderEliminationSummary`

**File**: `components/ChatWidget.tsx`

**Fungsi baru yang perlu ditambahkan:**

```typescript
const renderEliminationSummary = () => {
  if (
    phase !== 'done' ||
    survivingCrops.length === 0 ||   // hanya tampil jika ada yang survive
    eliminatedCrops.length === 0
  ) return null;

  return (
    <div className="flex gap-2 max-w-[92%]">
      <div className="w-6 h-6 rounded-full bg-amber-400/20 flex-shrink-0 flex items-center justify-center border border-amber-400/30 mt-1">
        <Bot className="w-3 h-3 text-amber-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm p-3 border shadow-lg bg-amber-400/5 backdrop-blur-md border-amber-400/20 w-full">
        <p className="text-amber-300 text-xs font-semibold mb-2">
          Tanaman yang tidak cocok dengan lahan {sapaan(userGender)}:
        </p>
        <div className="space-y-1.5">
          {eliminatedCrops.map((crop) => (
            <div key={crop.name} className="text-xs">
              <span className="text-white/70 font-medium">• {crop.name}:</span>{' '}
              <span className="text-white/50">{crop.reasons[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Penempatan di JSX** (di dalam messages area, setelah `renderConfirmingCard()` dan
`renderDetailCard()`, sebelum result quick replies):

```tsx
{/* ── Phase 6: Elimination summary (when some crops survive) ─── */}
{renderEliminationSummary()}

{/* ── Phase 6: Result quick replies ────────────────────────── */}
{renderResultQuickReplies()}
```

---

### Bug 3 Fix — `renderMessageContent` + `fallbackMessage`

**File 1**: `components/ChatWidget.tsx`

```typescript
// SEBELUM (buggy):
const renderMessageContent = (content: string) => {
  return content.replace(/\*\*/g, '');
};

// SESUDAH (fixed):
const renderMessageContent = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold: **teks** → teks
    .replace(/\*(.*?)\*/g, '$1')        // italic: *teks* → teks
    .replace(/\*/g, '');                // sisa asterisk tunggal → hapus
};
```

**File 2**: `app/api/recommend/route.ts`

```typescript
// SEBELUM (buggy):
'⚠️ *Rekomendasi awal berdasarkan knowledge base. Validasi dengan penyuluh setempat dan data cuaca aktual sebelum keputusan tanam.*',

// SESUDAH (fixed):
'⚠️ Rekomendasi awal berdasarkan knowledge base. Validasi dengan penyuluh setempat dan data cuaca aktual sebelum keputusan tanam.',
```

**Catatan**: Pesan lokal di `proceedWithCalculation` yang sudah menggunakan
`.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '')` tidak perlu diubah — sudah cukup,
tapi akan semakin konsisten setelah `renderMessageContent` di-fix karena semua pesan
melewati fungsi yang sama.

---

### Bug 4 Fix — Merge `renderRingkasanQuickReplies` + `renderReturnToRingkasan`

**File**: `components/ChatWidget.tsx`

```typescript
// HAPUS kedua fungsi lama:
// - renderRingkasanQuickReplies()
// - renderReturnToRingkasan()

// TAMBAH satu fungsi baru:
const renderRingkasanActions = () => {
  // Guard tunggal: keluar jika bukan fase yang relevan
  if (phase !== 'ringkasan' || faqView !== 'none') return null;

  // Bedakan label tombol kedua berdasarkan returningToRingkasan
  const secondButtonLabel = returningToRingkasan
    ? 'Ada pertanyaan lain'
    : 'Ada pertanyaan dulu';

  return (
    <div className="pl-8 space-y-2" role="group" aria-label="Opsi ringkasan">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <button
          onClick={() => handleQuickReply('__RINGKASAN_LANJUT__')}
          onKeyDown={(e) => handleQuickReplyKeyDown(e, '__RINGKASAN_LANJUT__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          Mengerti, lanjut konsultasi
        </button>
        <button
          onClick={() => handleQuickReply('__RINGKASAN_FAQ__')}
          onKeyDown={(e) => handleQuickReplyKeyDown(e, '__RINGKASAN_FAQ__')}
          tabIndex={0}
          className="text-xs px-3 py-2.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-all cursor-pointer min-h-[44px]"
        >
          {secondButtonLabel}
        </button>
      </div>
    </div>
  );
};
```

**Perubahan di JSX** — ganti dua pemanggilan lama dengan satu:

```tsx
{/* HAPUS kedua baris ini: */}
{/* {renderRingkasanQuickReplies()} */}
{/* {renderReturnToRingkasan()} */}

{/* GANTI dengan satu baris: */}
{renderRingkasanActions()}
```

---

## Refactor Modularitas

### Tujuan

Memindahkan konstanta dan type definitions dari ChatWidget.tsx ke modul terpisah untuk:
- Mengurangi ukuran ChatWidget.tsx (~200-250 baris berkurang)
- Memudahkan unit testing konstanta secara independen
- Meningkatkan discoverability (developer tahu di mana mencari konstanta)

### File Structure

```
lib/chat/
  constants.ts    — PARAM_ORDER, QUICK_REPLIES, TOOLTIPS, PARAM_LABELS,
                    PARAM_QUESTION_MESSAGES, PREFERENCE_OPTIONS, PARAM_TO_FAQ,
                    STORAGE_KEY
  types.ts        — FlowPhase, FaqView, Message, QuickReply, PreferenceOption,
                    StoredUserData

components/
  ChatWidget.tsx  — state, handlers, render logic (diperkecil)
                    import dari lib/chat/constants dan lib/chat/types
```

### Yang TIDAK Dipindah

- Helper functions yang bergantung pada React state (`sapaan`, `ringkasanMessage`,
  `AnimatedDots`, `extractOutOfRangeParams`) — tetap di ChatWidget.tsx atau di-inline
- Render functions — tetap di ChatWidget.tsx

### Contoh `lib/chat/types.ts`

```typescript
export type FlowPhase =
  | 'welcome'
  | 'ringkasan'
  | 'collecting'
  | 'confirming'
  | 'preference'
  | 'detail'
  | 'done';

export type FaqView = 'none' | 'categories' | 'items' | 'answer';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface PreferenceOption {
  id: string;
  label: string;
  criterionId: string;
}

export interface StoredUserData {
  name: string;
  gender: 'laki' | 'perempuan';
  lastParams?: Record<string, unknown>;
}
```

### Contoh `lib/chat/constants.ts`

```typescript
import type { QuickReply, PreferenceOption } from './types';

export const STORAGE_KEY = 'agri-saw-user';

export const PARAM_ORDER: string[] = [
  'ketinggian',
  'curah hujan',
  'pH tanah',
  'tekstur tanah',
  'intensitas cahaya',
];

export const QUICK_REPLIES: Record<string, QuickReply[]> = {
  // ... isi dari ChatWidget.tsx
};

export const TOOLTIPS: Record<string, string> = {
  // ... isi dari ChatWidget.tsx
};

export const PARAM_LABELS: Record<
  string,
  { label: string; emoji: string; format: (v: unknown) => string }
> = {
  // ... isi dari ChatWidget.tsx
};

export type ParamQuestionFn = (
  name: string,
  gender: 'laki' | 'perempuan' | ''
) => string;

export const PARAM_QUESTION_MESSAGES: Record<string, ParamQuestionFn> = {
  // ... isi dari ChatWidget.tsx
};

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  // ... isi dari ChatWidget.tsx
];

export const PARAM_TO_FAQ: Record<
  string,
  { sectionId: string; itemId: string; label: string }
> = {
  // ... isi dari ChatWidget.tsx
};
```

### Perubahan Import di ChatWidget.tsx

```typescript
// Tambahkan di bagian atas ChatWidget.tsx
import type { FlowPhase, FaqView, Message, QuickReply, PreferenceOption, StoredUserData } from '@/lib/chat/types';
import {
  STORAGE_KEY,
  PARAM_ORDER,
  QUICK_REPLIES,
  TOOLTIPS,
  PARAM_LABELS,
  PARAM_QUESTION_MESSAGES,
  PREFERENCE_OPTIONS,
  PARAM_TO_FAQ,
} from '@/lib/chat/constants';

// Hapus deklarasi lokal yang sama dari ChatWidget.tsx
```

---

## Testing Strategy

### Validation Approach

Testing mengikuti dua fase: (1) eksplorasi untuk mengkonfirmasi root cause dengan kode belum
di-fix, (2) fix checking dan preservation checking setelah fix diimplementasikan.

---

### Exploratory Bug Condition Checking

**Goal**: Mengonfirmasi root cause analysis SEBELUM implementasi fix. Jika test tidak gagal
sesuai prediksi, root cause perlu direvisi.

**Test Cases — Bug 1:**

```
1. Test: "tanah subur hijau" sebagai jawaban pH
   Setup: collectedParams tanpa tekstur tanah, previousParams dari jawaban sebelumnya
   Action: Panggil parseUserInput("tanah subur hijau")
   Expected (unfixed): texture = 'lempung' (SALAH — ter-parse sebagai side effect)
   Konfirmasi: detectMissingParams() tidak menghasilkan 'tekstur tanah' → bug terkonfirmasi

2. Test: advanceCollecting dengan data.missingParams = ['intensitas cahaya']
         sementara collectedParams['tekstur tanah'] = null
   Action: Panggil advanceCollecting dengan data tersebut
   Expected (unfixed): currentMissingParams = ['intensitas cahaya'] — tekstur hilang
   Konfirmasi: pertanyaan tekstur tidak akan muncul → bug terkonfirmasi
```

**Test Cases — Bug 3:**

```
3. Test: renderMessageContent('⚠️ *Rekomendasi awal...*')
   Expected (unfixed): output masih mengandung '*' → bug terkonfirmasi

4. Test: renderMessageContent('**Jagung** adalah pilihan terbaik')
   Expected (unfixed): output = 'Jagung adalah pilihan terbaik' ✓ (ini sudah oke)
   Expected (unfixed): renderMessageContent('*Jagung* adalah pilihan terbaik')
                     = '*Jagung* adalah pilihan terbaik' ✗ (bug terkonfirmasi)
```

**Expected Counterexamples:**
- `parseUserInput("tanah subur hijau").texture` = 'lempung' (bukan null)
- `advanceCollecting({missingParams: ['intensitas cahaya'], ...})` →
  `currentMissingParams` tidak mengandung 'tekstur tanah'
- `renderMessageContent('*teks*')` masih mengandung `*`

---

### Fix Checking

**Goal**: Verifikasi bahwa semua input dengan bug condition menghasilkan perilaku yang benar
setelah fix.

**Pseudocode — Bug 1:**

```
FOR ALL state X WHERE isBugCondition_1(X) DO
  result ← advanceCollecting_fixed(X.data)
  ASSERT currentMissingParams CONTAINS 'tekstur tanah'
         OR collectedParams['tekstur tanah'] IS NOT NULL
END FOR
```

**Pseudocode — Bug 3:**

```
FOR ALL content WHERE isBugCondition_3(content) DO
  rendered ← renderMessageContent_fixed(content)
  ASSERT rendered DOES NOT CONTAIN '*'
END FOR
```

**Pseudocode — Bug 4:**

```
FOR ALL state X WHERE phase='ringkasan' AND faqView='none' DO
  dom ← render_fixed(X)
  buttons_lanjut ← dom.querySelectorAll('[data-action="__RINGKASAN_LANJUT__"]')
  ASSERT buttons_lanjut.length === 1
END FOR
```

---

### Preservation Checking

**Goal**: Verifikasi bahwa input yang tidak memicu bug condition menghasilkan output identik
antara kode lama dan baru.

**Pseudocode:**

```
FOR ALL state X WHERE NOT isBugCondition_1(X) DO
  // collectedParams['tekstur tanah'] sudah terisi
  ASSERT advanceCollecting_original(X) = advanceCollecting_fixed(X)
END FOR

FOR ALL content WHERE NOT isBugCondition_3(content) DO
  // content tidak mengandung '*'
  ASSERT renderMessageContent_original(content) = renderMessageContent_fixed(content)
END FOR
```

**Testing Approach**: Property-based testing direkomendasikan untuk preservation checking
karena:
- Menghasilkan banyak test case otomatis dari input domain
- Menangkap edge case yang mungkin terlewat dari manual testing
- Memberikan jaminan kuat bahwa perilaku tidak berubah untuk semua input non-buggy

**Preservation Test Cases:**

```
1. renderMessageContent — teks tanpa asterisk:
   Input: "Jagung adalah pilihan terbaik"
   Expected: output identik dengan input

2. advanceCollecting — tekstur sudah terisi:
   Input: collectedParams = { 'tekstur tanah': 'lempung', ... }
   Expected: currentMissingParams identik antara kode lama dan baru

3. renderRingkasanActions — fase non-ringkasan:
   Input: phase = 'collecting' || 'confirming' || 'preference'
   Expected: return null (tidak merender apapun)

4. renderEliminationSummary — all-eliminated (survivingCrops kosong):
   Input: survivingCrops.length = 0, eliminatedCrops.length > 0
   Expected: return null (renderEliminatedFaqLinks yang aktif, bukan ini)
```

---

### Unit Tests

- `computeClientMissingParams(null)` → semua PARAM_ORDER
- `computeClientMissingParams({ ketinggian: 500, 'pH tanah': 6.5 })` →
  `['curah hujan', 'tekstur tanah', 'intensitas cahaya']`
- `renderMessageContent('**bold**')` → `'bold'`
- `renderMessageContent('*italic*')` → `'italic'`
- `renderMessageContent('⚠️ *note*')` → `'⚠️ note'`
- `renderMessageContent('teks biasa')` → `'teks biasa'`
- `renderRingkasanActions` dengan `phase='ringkasan', faqView='none', returningToRingkasan=false` →
  render satu set tombol
- `renderRingkasanActions` dengan `phase='collecting'` → null
- `renderEliminationSummary` dengan `survivingCrops.length=2, eliminatedCrops.length=1` →
  render card eliminasi
- `renderEliminationSummary` dengan `survivingCrops.length=0` → null

### Property-Based Tests

- **Bug 1**: Generate random `collectedParams` dengan 'tekstur tanah' = null.
  Setelah `advanceCollecting_fixed`, `currentMissingParams` selalu mengandung 'tekstur tanah'.
- **Bug 3**: Generate random string dengan karakter `*` di berbagai posisi.
  `renderMessageContent_fixed(content)` tidak pernah mengandung `*`.
- **Bug 3 Preservation**: Generate random string tanpa `*`.
  `renderMessageContent_fixed(content) === content` selalu.
- **Bug 4**: Generate berbagai kombinasi `(returningToRingkasan, faqView, phase)`.
  Jika `phase='ringkasan'` dan `faqView='none'`, tombol `__RINGKASAN_LANJUT__` muncul
  tepat sekali.

### Integration Tests

- Flow lengkap: form → ringkasan → collecting (5 param termasuk tekstur) → confirming →
  preference → done. Verifikasi semua 5 parameter ditanyakan.
- Flow dengan jawaban "tanah subur hijau" untuk pH: verifikasi pertanyaan tekstur muncul
  setelah pH.
- Flow dengan tanaman dieliminasi sebagian: verifikasi `renderEliminationSummary` muncul
  di fase done.
- Flow FAQ → kembali ke ringkasan → klik "Mengerti, lanjut": verifikasi tidak ada
  double-click event.
- API fallbackMessage tanpa asterisk: verifikasi tidak ada `*` di UI.

---

## Regression Prevention Strategy

### Linting Rules

Tambahkan komentar di `advanceCollecting` sebagai dokumentasi kontrak:

```typescript
// INVARIANT: jangan pernah percaya penuh pada data.missingParams dari API.
// Selalu merge dengan computeClientMissingParams(collectedParams) untuk
// memastikan parameter yang belum terkumpul di state lokal tetap ditanyakan.
// Lihat Bug 1 — Tekstur Tanah Terskip untuk konteks.
```

### Guard Comments di Render Functions

```typescript
// INVARIANT: renderRingkasanActions adalah SATU-SATUNYA render function untuk
// tombol ringkasan. Jangan buat renderRingkasanQuickReplies atau
// renderReturnToRingkasan yang terpisah — itu menyebabkan Bug 4.
const renderRingkasanActions = () => { ... };
```

### Test Coverage Targets

| Komponen | Target Coverage | Fokus |
|----------|----------------|-------|
| `computeClientMissingParams` | 100% | Semua kombinasi collectedParams |
| `renderMessageContent` | 100% | Semua pola asterisk |
| `renderRingkasanActions` | 90% | Guard conditions + label variation |
| `renderEliminationSummary` | 90% | Null cases + render cases |

### Code Review Checklist (untuk PR ini)

- [ ] `advanceCollecting` tidak pernah set `currentMissingParams` dari `data.missingParams`
  saja tanpa merge client check
- [ ] Tidak ada render function baru yang merender tombol `__RINGKASAN_LANJUT__` atau
  `__RINGKASAN_FAQ__` selain `renderRingkasanActions`
- [ ] `renderMessageContent` memproses semua pola `*` bukan hanya `**`
- [ ] Tidak ada string literal di ChatWidget.tsx atau route.ts yang menggunakan `*...*`
  untuk formatting
- [ ] `renderEliminationSummary` hanya aktif saat `survivingCrops.length > 0`
  (tidak mengambil alih `renderEliminatedFaqLinks` untuk all-eliminated case)
