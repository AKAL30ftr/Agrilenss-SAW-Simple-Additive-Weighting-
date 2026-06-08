# Bugfix Requirements Document

## Introduction

ChatWidget di aplikasi Agri-SAW Pro mengalami empat bug yang ditemukan dari flow nyata. Bug-bug ini menyebabkan pengalaman pengguna terganggu: satu parameter lahan tidak pernah ditanyakan (sehingga rekomendasi tidak akurat), tanaman yang dieliminasi tidak dijelaskan alasannya, tanda bintang markdown tampil sebagai teks literal, dan tombol quick reply muncul ganda. Perbaikan ini juga mencakup refactor modularitas untuk memecah ChatWidget.tsx (~1200 baris) menjadi modul-modul yang lebih kecil dan mudah di-maintain.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — Tekstur Tanah Terskip**

1.1 WHEN pengguna menjalani flow pengumpulan parameter secara sequential (ketinggian → curah hujan → pH tanah → intensitas cahaya) THEN sistem melewatkan pertanyaan tekstur tanah dan tidak pernah menampilkan pertanyaan untuk parameter ke-4 dari PARAM_ORDER ('tekstur tanah')

1.2 WHEN sistem memanggil `advanceCollecting` dengan `data.missingParams` dari API response THEN sistem menggunakan array `missingParams` dari API tanpa memvalidasi bahwa urutan dan kelengkapannya sesuai dengan PARAM_ORDER yang didefinisikan di ChatWidget

1.3 WHEN rekomendasi akhir dikompilasi tanpa data tekstur tanah THEN sistem menghasilkan hasil rekomendasi yang tidak akurat karena filter agroklimat berjalan dengan `parsed.texture === null` (melewatkan pengecekan tekstur)

**Bug 2 — Eliminasi Tanpa Alasan**

2.1 WHEN ada tanaman yang dieliminasi di Filter 1 dan ada tanaman yang survive THEN sistem hanya menampilkan tanaman yang lolos sebagai rekomendasi tanpa menampilkan alasan mengapa tanaman-tanaman lain dieliminasi dalam UI chat

2.2 WHEN pengguna menerima hasil rekomendasi di fase 'done' THEN sistem tidak merender informasi dari `eliminatedCrops` (yang sudah tersedia di state) di area chat yang terlihat pengguna

**Bug 3 — Tanda Bintang Markdown Tampil Sebagai Teks Literal**

3.1 WHEN API mengembalikan pesan dengan format bold markdown (contoh: `**Rekomendasi Utama: Jagung**`) THEN sistem menampilkan tanda bintang `**` sebagai karakter literal di beberapa path render, bukan sebagai teks tebal atau tanpa tanda bintang

3.2 WHEN `renderMessageContent` dipanggil pada pesan yang sudah tersimpan di state `messages` THEN fungsi ini hanya mencakup path render via `messages.map`, sementara ada content yang di-inject langsung ke DOM melalui komponen card atau pesan yang dibangun di luar fungsi tersebut

3.3 WHEN `fallbackMessage` di `route.ts` dikembalikan sebagai respons API yang mengandung pola `⚠️ *Rekomendasi awal berdasarkan...* ` THEN tanda bintang tunggal `*` masih lolos dari proses strip di ChatWidget karena strip hanya meng-handle `**` (double asterisk)

**Bug 4 — Double Button / Redundant Quick Reply**

4.1 WHEN fase transisi ke 'ringkasan' dan `returningToRingkasan` bernilai false THEN sistem merender dua set tombol yang identik secara bersamaan: `renderRingkasanQuickReplies()` dan `renderReturnToRingkasan()` keduanya dapat aktif di kondisi tertentu karena kondisi guard-nya tidak saling mutually exclusive

4.2 WHEN `renderReturnToRingkasan` merender tombol `__RINGKASAN_LANJUT__` dan `__RINGKASAN_FAQ__` THEN tombol-tombol yang sama persis sudah dirender oleh `renderRingkasanQuickReplies`, menghasilkan duplikasi visual dan potensi double-trigger event

4.3 WHEN pengguna mengklik salah satu tombol quick reply yang terduplikasi THEN handler `handleQuickReply` bisa terpanggil dua kali jika kedua tombol muncul bersamaan dalam DOM

---

### Expected Behavior (Correct)

**Bug 1 — Tekstur Tanah Harus Selalu Ditanyakan**

2.1 WHEN sistem menjalankan flow pengumpulan parameter THEN sistem SHALL menanyakan seluruh 5 parameter sesuai PARAM_ORDER = ['ketinggian', 'curah hujan', 'pH tanah', 'tekstur tanah', 'intensitas cahaya'] secara sequential tanpa ada yang dilewatkan

2.2 WHEN `advanceCollecting` menerima `data.missingParams` dari API THEN sistem SHALL memvalidasi bahwa parameter yang belum terkumpul di state lokal `collectedParams` tetap masuk ke antrian pertanyaan, tidak mengandalkan sepenuhnya pada API response

2.3 WHEN semua 5 parameter telah terkumpul (termasuk tekstur tanah) THEN sistem SHALL masuk ke fase 'confirming' dan `filterByAgroklimat` berjalan dengan `parsed.texture !== null`

**Bug 2 — Alasan Eliminasi Harus Ditampilkan**

2.4 WHEN ada tanaman yang dieliminasi DAN ada tanaman yang survive THEN sistem SHALL menampilkan ringkasan eliminasi di UI chat yang berisi nama tanaman yang dieliminasi beserta alasan utama eliminasinya (minimal satu alasan per tanaman)

2.5 WHEN pengguna berada di fase 'done' dengan surviving crops tersedia THEN sistem SHALL menampilkan daftar tanaman yang dieliminasi dengan alasannya dalam format yang dapat dibaca pengguna, baik sebagai bagian dari pesan asisten maupun sebagai komponen UI tersendiri

**Bug 3 — Tanda Bintang Tidak Boleh Muncul**

2.6 WHEN sistem merender konten pesan apapun yang mengandung format markdown bold (`**teks**`) THEN sistem SHALL menghilangkan tanda bintang dan menampilkan teks tanpa asterisk (jika bold tidak bisa dirender, tanda bintang harus dihapus sepenuhnya)

2.7 WHEN konten pesan mengandung tanda bintang tunggal `*teks*` (italic markdown) THEN sistem SHALL menghilangkan tanda bintang tunggal tersebut agar tidak tampil sebagai karakter literal

2.8 WHEN `renderMessageContent` atau fungsi strip markdown dipanggil THEN sistem SHALL memproses semua konten pesan sebelum ditampilkan ke pengguna, mencakup seluruh path render termasuk pesan dari API, pesan yang dibuat secara lokal, dan konten card

**Bug 4 — Tidak Ada Duplikasi Button**

2.9 WHEN fase adalah 'ringkasan' DAN `returningToRingkasan` adalah false THEN sistem SHALL hanya merender satu set tombol `__RINGKASAN_LANJUT__` dan `__RINGKASAN_FAQ__`, tidak merender keduanya secara bersamaan dari dua render function yang berbeda

2.10 WHEN `returningToRingkasan` berubah menjadi true THEN sistem SHALL menggantikan (bukan menambahkan) tampilan tombol ringkasan sebelumnya dengan tombol yang sesuai untuk kondisi kembali dari FAQ

2.11 WHEN pengguna mengklik tombol quick reply apapun THEN sistem SHALL memastikan handler hanya terpanggil satu kali per klik, tidak terjadi double-trigger akibat duplikasi render

---

### Unchanged Behavior (Regression Prevention)

**Alur normal yang harus tetap berjalan**

3.1 WHEN pengguna mengisi form nama dan gender lalu klik "Mulai Konsultasi" THEN sistem SHALL CONTINUE TO menampilkan pesan ringkasan dan transisi ke fase 'ringkasan'

3.2 WHEN pengguna menjawab pertanyaan parameter dengan quick reply THEN sistem SHALL CONTINUE TO mengirim jawaban ke API `/api/recommend` dan memproses response dengan benar

3.3 WHEN pengguna memilih "Saya tidak tahu persis" untuk suatu parameter THEN sistem SHALL CONTINUE TO melewatkan parameter tersebut dengan `[skip:paramName]` dan lanjut ke parameter berikutnya

3.4 WHEN pengguna memilih "Saya kurang yakin" THEN sistem SHALL CONTINUE TO mengaktifkan input text sementara (`escapeKurangYakinActive = true`) untuk memungkinkan pengguna mengetik jawaban bebas

3.5 WHEN API mengembalikan mode 'all-eliminated' (semua tanaman dieliminasi) THEN sistem SHALL CONTINUE TO menampilkan pesan konversasional dan link FAQ untuk mempelajari cara memperbaiki kondisi lahan

3.6 WHEN pengguna mengklik "Hitung Rekomendasi" di fase confirming THEN sistem SHALL CONTINUE TO menampilkan loading screen minimal 3 detik sebelum hasil muncul

3.7 WHEN fase preference aktif THEN sistem SHALL CONTINUE TO menampilkan 5 opsi preferensi yang bisa dipilih multiple dan tombol "Hitung Ranking"

3.8 WHEN hasil rekomendasi muncul THEN sistem SHALL CONTINUE TO menyediakan tombol "Lihat detail [nama tanaman]" untuk setiap surviving crop

3.9 WHEN localStorage sudah ada data user THEN sistem SHALL CONTINUE TO mengisi form nama dan gender otomatis dari localStorage

3.10 WHEN FAQ dibuka dari fase ringkasan THEN sistem SHALL CONTINUE TO menampilkan kategori FAQ, item, dan jawaban dalam navigasi bertingkat

3.11 WHEN rate limit API tercapai (30 req/menit) THEN sistem SHALL CONTINUE TO mengembalikan error 429 dengan pesan yang sesuai

3.12 WHEN API mengembalikan `budgetWarning` THEN sistem SHALL CONTINUE TO menampilkan peringatan modal tanpa mengeliminasi tanaman dari rekomendasi

---

## Bug Condition Derivation

### Bug 1 — Tekstur Tanah Terskip

```pascal
FUNCTION isBugCondition_1(X)
  INPUT: X adalah state collecting setelah menerima API response
  OUTPUT: boolean
  
  RETURN X.data.missingParams TIDAK mengandung 'tekstur tanah'
         AND X.collectedParams['tekstur tanah'] IS NULL
         AND X.data.missingParams sudah di-set ke currentMissingParams
END FUNCTION

// Property: Fix Checking — Tekstur Selalu Ditanyakan
FOR ALL X WHERE isBugCondition_1(X) DO
  result ← advanceCollecting'(X.data)
  ASSERT currentMissingParams MENGANDUNG 'tekstur tanah'
         ATAU collectedParams['tekstur tanah'] TIDAK NULL
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_1(X) DO
  ASSERT advanceCollecting(X) = advanceCollecting'(X)
END FOR
```

### Bug 2 — Eliminasi Tanpa Alasan

```pascal
FUNCTION isBugCondition_2(X)
  INPUT: X adalah state setelah proceedWithCalculation selesai
  OUTPUT: boolean
  
  RETURN X.eliminatedCrops.length > 0
         AND X.survivingCrops.length > 0
         AND UI tidak menampilkan eliminatedCrops dengan alasan
END FUNCTION

// Property: Fix Checking — Alasan Eliminasi Ditampilkan
FOR ALL X WHERE isBugCondition_2(X) DO
  renderedUI ← render'(X)
  ASSERT renderedUI MENGANDUNG informasi dari X.eliminatedCrops
         DAN setiap crop yang dieliminasi tampil dengan minimal 1 alasan
END FOR
```

### Bug 3 — Tanda Bintang Markdown

```pascal
FUNCTION isBugCondition_3(content)
  INPUT: content adalah string pesan yang akan ditampilkan
  OUTPUT: boolean
  
  RETURN content MENGANDUNG pola /\*\*.*?\*\*/ ATAU /\*[^*].*?\*/
END FUNCTION

// Property: Fix Checking — Tidak Ada Asterisk di Output
FOR ALL content WHERE isBugCondition_3(content) DO
  rendered ← renderMessageContent'(content)
  ASSERT rendered TIDAK MENGANDUNG karakter '*'
END FOR
```

### Bug 4 — Double Button

```pascal
FUNCTION isBugCondition_4(X)
  INPUT: X adalah state fase 'ringkasan'
  OUTPUT: boolean
  
  RETURN X.phase = 'ringkasan'
         AND X.faqView = 'none'
         AND renderRingkasanQuickReplies() TIDAK NULL
         AND renderReturnToRingkasan() TIDAK NULL  // keduanya aktif bersamaan
END FUNCTION

// Property: Fix Checking — Hanya Satu Set Tombol
FOR ALL X WHERE isBugCondition_4(X) DO
  buttons ← countButtons'(X, '__RINGKASAN_LANJUT__')
  ASSERT buttons = 1  // hanya ada satu tombol, bukan dua
END FOR
```
