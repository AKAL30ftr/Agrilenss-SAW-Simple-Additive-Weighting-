# VOICE AND TONE FINDINGS — Agri-SAW Pro Chatbot

> **Date:** 2026-06-07
> **Source:** User testing feedback + deep dive into ChatWidget.tsx (1431 lines)
> **Criticality:** HIGH — Human touch is missing. Bot sounds like a machine, not a helpful extension officer.

---

## 1. PROBLEM SUMMARY

The bot's language is **too direct, too formal, and too technical**. It reads like a system manual, not a conversation with a helpful agricultural extension officer (penyuluh pertanian). The user (petani non-teknis) feels like they're talking to a database, not a human.

**User's exact words:** "pertanyaannya terlalu direct, dan fallbacknya tidak membantu, kita niat approach kelihatan seperti manusia, pertanyaanya tolong jangan judes gitu"

---

## 2. SPECIFIC FINDINGS

### 2.1 Ringkasan SAW Message (Phase 2)

**Current:**
```
Sistem kami menggunakan metode **SAW (Simple Additive Weighting)** untuk merekomendasikan komoditas terbaik.

**Filter 1 — Agroklimat:** 5 parameter lahan Anda akan dicocokkan dengan syarat tumbuh 6 komoditas (Padi, Jagung, Kedelai, Cabai, Bawang Merah, Bawang Putih).

**Filter 2 — Ekonomi:** Komoditas yang lolos akan diurutkan berdasarkan kriteria ekonomi (biaya, harga, produktivitas, risiko, permintaan pasar).

Silakan pilih opsi di bawah untuk melanjutkan.
```

**Problems:**
- `**SAW (Simple Additive Weighting)**` — bold technical term, user won't understand
- `**Filter 1 — Agroklimat:**` — too formal, sounds like a manual
- `dicocokkan dengan syarat tumbuh` — technical jargon
- No warmth, no human touch
- Feels like reading a textbook

**Should be:**
```
Baik, Bapak Aqib! Sebelum kita mulai, izinkan saya menjelaskan 
singkat cara kerja sistem ini.

Saya akan membantu Bapak memilih komoditas terbaik untuk lahan 
Bapak. Caranya begini:

Pertama, saya akan menanyakan 5 kondisi lahan Bapak — seperti 
ketinggian, curah hujan, dan kondisi tanah. Nanti saya cocokkan 
dengan 6 jenis tanaman yang cocok: Padi, Jagung, Kedelai, Cabai, 
Bawang Merah, dan Bawang Putih.

Tanaman yang cocok dengan lahan Bapak, kemudian saya hitung 
mana yang paling menguntungkan — dilihat dari biaya tanam, 
harga jual, sampai risikonya.

Gampangnya begitu, Pak. Ada yang ingin ditanyakan dulu, atau 
langsung mulai?
```

### 2.2 Parameter Question Messages (Phase 3)

**Current:**
```
Bapak Aqib, saya akan menanyakan tentang **Ketinggian**.
```

**Problems:**
- `**Ketinggian**` — bold technical term
- Too direct, no context
- No conversational warmth

**Should be (per user's example for curah hujan):**
```
Baik, Pak Aqib. Selanjutnya saya ingin menanyakan tentang 
ketinggian lahan Bapak. Kira-kira lahan Bapak berada di 
ketinggian berapa, Pak? Dataran rendah, sedang, atau 
pegunungan?
```

**For curah hujan (user's exact suggestion):**
```
Baik, Pak Aqib. Selanjutnya saya ingin menanyakan terkait 
curah hujan di lingkungan lokasi Bapak. Kira-kira seberapa 
sering hujannya, Pak?
```

### 2.3 Quick Reply Labels

**Current:**
- `Dataran rendah (0-400 mdpl)` — too technical
- `Hampir tiap hari` — OK but could be warmer
- `Tanaman sering menguning/kerdil` — OK, observational
- `Tidak tahu` — too blunt
- `Kurang yakin` — OK

**Should be:**
- `Dataran rendah (seperti pantai/flat)` — more descriptive
- `Hampir setiap hari hujan` — more natural
- `Saya tidak tahu persis` — softer
- `Saya kurang yakin, tapi saya coba jawab` — more helpful

### 2.4 "Kurang Yakin" Fallback

**Current:**
```
Tidak masalah! Silakan ketik perkiraan ketinggian Anda.
```

**Problems:**
- Still formal
- "ketik perkiraan" — sounds like a data entry form
- No guidance on what format to use

**Should be:**
```
Tidak masalah, Pak Aqib. Silakan ketik perkiraannya saja. 
Misalnya "sekitar 300 meter" atau "dataran rendah". 
Yang penting perkiraan kasar sudah cukup.
```

### 2.5 Confirmation Message (Phase 4)

**Current:**
```
Semua data terkumpul! Silakan periksa:
```

**Problems:**
- Too abrupt
- No sapaan
- Sounds like a system notification

**Should be:**
```
Baik, Pak Aqib! Semua data lahan sudah terkumpul. 
Silakan periksa dulu, apakah data di bawah ini sudah benar. 
Kalau ada yang salah, saya bisa ulangi dari awal.
```

### 2.6 Preference Message (Phase 5)

**Current:**
```
Filter 1 Selesai, Bapak Aqib!

3 komoditas lolos: Padi, Jagung, Kedelai

Sebelum menghitung ranking akhir, apa yang paling penting untuk Anda?
(Pilih satu atau lebih)
```

**Problems:**
- "Filter 1 Selesai" — technical term
- "apa yang paling penting untuk Anda?" — too formal
- No explanation of what the preferences mean

**Should be:**
```
Bagus, Pak Aqib! Dari 6 jenis tanaman, ada 3 yang cocok 
dengan lahan Bapak: Padi, Jagung, dan Kedelai.

Sekarang, untuk menentukan ranking terbaik, saya perlu tahu 
prioritas Bapak. Mana yang lebih penting?

• Biaya tanam yang murah?
• Harga jual yang tinggi?
• Hasil panen yang banyak?
• Risiko yang rendah?
• Permintaan pasar yang tinggi?

Bapak bisa pilih satu atau lebih, Pak.
```

### 2.7 Result Message (Phase 6)

**Current:**
```
Hasil Rekomendasi untuk Lahan Bapak Aqib

WINNER: Padi — Skor: 0.8886
...
```

**Problems:**
- "WINNER" — too game-like
- "Skor: 0.8886" — too precise, meaningless to farmers
- No personalized explanation

**Should be:**
```
Pak Aqib, berdasarkan kondisi lahan Bapak, berikut hasil 
rekomendasi saya:

🌾 **Padi** — Paling cocok untuk lahan Bapak
   Cocok karena lahan Bapak dataran rendah dengan curah hujan 
   tinggi, sangat ideal untuk padi. Biaya tanam juga paling 
   terjangkau.

🌽 **Jagung** — Alternatif bagus
   Jagung juga cocok, terutama kalau Bapak ingin biaya produksi 
   lebih rendah. Produktivitasnya juga lumayan tinggi.

🫘 **Kedelai** — Opsi lain
   Kedelai cocok untuk rotasi tanaman, meskipun produktivitasnya 
   lebih rendah.

Mau lihat detail salah satu tanaman, Pak?
```

### 2.8 Closing Message

**Current:**
```
Terima kasih, Bapak Aqib, telah menggunakan Agri-SAW Pro. 
Semoga lahan Anda makin produktif!
```

**Problems:**
- Too short
- No call to action
- No follow-up suggestion

**Should be:**
```
Terima kasih, Pak Aqib, sudah menggunakan Agri-SAW Pro! 🙏

Semoga rekomendasi ini membantu Bapak menentukan tanaman 
yang terbaik untuk lahan. Kalau ada pertanyaan lain atau 
mau konsultasi ulang, jangan sungkan ya, Pak.

Kalau hasil ini dirasa kurang sesuai, Bapak juga bisa 
konsultasikan dengan penyuluh pertanian di daerah Bapak 
untuk pendalaman lebih lanjut.

Mau konsultasi ulang atau ada pertanyaan lain, Pak?
```

### 2.9 Error Messages

**Current:**
```
Maaf, terjadi kesalahan: Unknown error
```

**Problems:**
- Technical error message exposed to user
- No helpful guidance

**Should be:**
```
Maaf, Pak Aqib, ada kendala teknis. Silakan coba lagi nanti, 
atau hubungi penyuluh pertanian setempat untuk konsultasi langsung.
```

### 2.10 Loading Screen

**Current:** Not implemented yet (only animated dots)

**Should be:**
```
Terima kasih atas kesabarannya, Pak Aqib. 
Hasil perhitungan sedang disusun...
[animated dots]
```

---

## 3. LANGUAGE PRINCIPLES (from user feedback)

1. **Use conversational Indonesian** — like talking to a neighbor, not reading a manual
2. **Use "Pak" consistently** — every bot message should address the user as "Pak" or "Bu"
3. **Avoid technical terms** — no "SAW", "Filter 1", "agroklimat", "parameter"
4. **Use observational language** — "kira-kira seberapa sering hujannya, Pak?" not "Berapa curah hujan?"
5. **Add context to questions** — explain WHY you're asking before asking
6. **Use natural transitions** — "Baik, selanjutnya..." not "Saya akan menanyakan tentang..."
7. **Soften commands** — "Silakan pilih" → "Silakan dipilih, Pak" or better yet, just show options without command
8. **Add warmth** — "Bagus!", "Baik, Pak", "Oke, lanjut ya"
9. **Explain in simple terms** — "cocok dengan lahan" not "dicocokkan dengan syarat tumbuh"
10. **No bold technical terms** — if you must use a term, explain it in parentheses

---

## 4. MESSAGE TEMPLATE LIBRARY

### Welcome
```
Halo, Pak [nama]! Selamat datang di Agri-SAW Pro. 🌾

Saya adalah asisten virtual yang akan membantu Pak [nama] 
merekomendasikan komoditas pertanian terbaik untuk lahan Bapak.

Sebelum mulai, silakan isi data diri Bapak dulu ya:
```

### Ringkasan
```
Terima kasih, Pak [nama]! Sebelum kita mulai, izinkan saya 
menjelaskan singkat cara kerja sistem ini.

Saya akan menanyakan 5 kondisi lahan Bapak — ketinggian, 
curah hujan, kondisi tanah, dan lainnya. Nanti saya cocokkan 
dengan 6 jenis tanaman: Padi, Jagung, Kedelai, Cabai, 
Bawang Merah, dan Bawang Putih.

Tanaman yang cocok, kemudian saya hitung mana yang paling 
menguntungkan untuk Bapak.

Ada yang ingin ditanyakan dulu, atau langsung mulai, Pak?
```

### Parameter Question (template)
```
Baik, Pak [nama]. Selanjutnya saya ingin menanyakan tentang 
[parameter]. [Context: why this matters]

[Observational question in simple language]
```

### Confirmation
```
Baik, Pak [nama]! Semua data lahan sudah terkumpul. 
Silakan periksa dulu, apakah data di bawah ini sudah benar:

[data recap]

Kalau ada yang salah, saya bisa ulangi dari awal, Pak.
```

### Preference
```
Bagus, Pak [nama]! Dari 6 jenis tanaman, ada [X] yang cocok 
dengan lahan Bapak: [list].

Sekarang, untuk menentukan ranking terbaik, saya perlu tahu 
prioritas Bapak. Mana yang lebih penting?

[preference options]

Bapak bisa pilih satu atau lebih, Pak.
```

### Result
```
Pak [nama], berdasarkan kondisi lahan Bapak, berikut hasil 
rekomendasi saya:

[winner explanation]
[runner-up explanation]
[dark horse explanation]

Mau lihat detail salah satu tanaman, Pak?
```

### Closing
```
Terima kasih, Pak [nama], sudah menggunakan Agri-SAW Pro! 🙏

Semoga rekomendasi ini membantu Bapak. Kalau ada pertanyaan 
lain atau mau konsultasi ulang, jangan sungkan ya, Pak.

Mau konsultasi ulang atau ada pertanyaan lain?
```

### Error
```
Maaf, Pak [nama], ada kendala teknis. Silakan coba lagi nanti, 
atau hubungi penyuluh pertanian setempat.
```

### Loading
```
Terima kasih atas kesabarannya, Pak [nama]. 
Hasil perhitungan sedang disusun...
[animated dots]
```

---

## 5. ACTION ITEMS

1. Replace ALL bot messages in ChatWidget.tsx with conversational versions
2. Remove all bold technical terms (**SAW**, **Filter 1**, etc.)
3. Add "Pak/Bu" sapaan to every message
4. Rewrite parameter questions with observational language
5. Add context before each question (why we're asking)
6. Soften all commands and instructions
7. Add natural transitions between phases
8. Implement loading screen with warm message
9. Personalize result explanations (not just scores)
10. Add closing message with follow-up suggestion
