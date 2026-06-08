# CHAT-FLOW-MAPPING.md — Agri-SAW Pro Conversation Logic Trees

> **Purpose:** Complete conversation flow mapping for bot-lead chatbot redesign.
> **Model:** Bot-lead driven (like customer service / Typeform), NOT user-lead free-text chat.
> **Rule:** Every chat bubble MUST end with options. No dead ends. No free-text unless explicitly requested.

---

## 1. MASTER FLOW OVERVIEW

```
User opens /analyze
    |
    v
PHASE 1: WELCOME + FORM
    Bot greeting -> Form card (nama, gender) -> Submit
    |
    v
PHASE 2: RINGKASAN SISTEM
    Bot explains SAW + 6 crops -> "Mengerti" / "Ada pertanyaan"
    |
    +-- [Mengerti] --> PHASE 3
    |
    +-- [Ada pertanyaan] --> FAQ LEVEL 1
            |
            +-- Tentang SAW --> FAQ-SAW detail --> Kembali
            +-- Tentang Tanaman --> FAQ-TANAMAN Level 2
            |       +-- Padi --> FAQ-PADI --> Kembali
            |       +-- Jagung --> FAQ-JAGUNG --> Kembali
            |       +-- Kedelai --> FAQ-KEDELAI --> Kembali
            |       +-- Cabai --> FAQ-CABAI --> Kembali
            |       +-- Bawang Merah --> FAQ-BM --> Kembali
            |       +-- Bawang Putih --> FAQ-BP --> Kembali
            +-- Tentang Parameter --> FAQ-PARAM Level 2
            |       +-- Ketinggian --> FAQ-KTG --> Kembali
            |       +-- Curah Hujan --> FAQ-CH --> Kembali
            |       +-- pH Tanah --> FAQ-PH --> Kembali
            |       +-- Tekstur Tanah --> FAQ-TXT --> Kembali
            |       +-- Cahaya --> FAQ-CAHAYA --> Kembali
            +-- Kembali --> PHASE 3
    |
    v
PHASE 3: PARAMETER COLLECTION
    Bot asks 1 parameter at a time -> Quick reply only
    Parameters: Ketinggian -> Curah Hujan -> pH -> Tekstur -> Cahaya
    Each has: 3-4 range options + "Tidak tahu" + "Kurang yakin"
    |
    v
PHASE 4: CONFIRMATION
    Show all collected data -> "Hitung Rekomendasi" / "Ulangi"
    |
    +-- [Hitung] --> API Filter 1 --> PHASE 5
    +-- [Ulangi] --> PHASE 3 restart
    |
    v
PHASE 5: PREFERENCE
    Show surviving crops -> Ask weight preference
    Options: Biaya/Harga/Produktivitas/Risiko/Permintaan + "Hitung Ranking"
    |
    v
PHASE 6: RESULT
    Show Winner/Runner-up/Dark Horse + eliminated
    Options: "Lihat detail [crop]" / "Ulangi" / "Selesai"
    |
    +-- [Lihat detail X] --> DETAIL-X --> Kembali/Ulangi/Selesai
    +-- [Ulangi] --> PHASE 3 restart
    +-- [Selesai] --> CLOSING
```

---

## 2. DETAILED PHASE BREAKDOWN

### PHASE 1: WELCOME + FORM

Bot message:
"Halo! Selamat datang di Agri-SAW Pro. Saya adalah asisten virtual yang akan membantu Bapak/Ibu merekomendasikan komoditas pertanian terbaik berdasarkan kondisi lahan. Sebelum mulai, silakan isi data diri Bapak/Ibu:"

Form card (inside chat bubble):
- Input: Nama (required)
- Select: Jenis Kelamin -> Laki-laki / Perempuan
- Button: "Mulai Konsultasi" (disabled until nama filled)

Input box: DISABLED -- hint: "Silakan isi form di atas"

On submit:
"Terima kasih, [Bapak/Ibu] [nama]! Sebelum kita mulai, izinkan saya menjelaskan singkat tentang sistem ini."

---

### PHASE 2: RINGKASAN SISTEM

Bot message:
"Agri-SAW Pro menggunakan metode SAW (Simple Additive Weighting) untuk menganalisis:

1. Kesesuaian lingkungan lahan (Filter 1): Ketinggian, curah hujan, pH tanah, tekstur tanah, intensitas cahaya

2. Analisis keuntungan ekonomi (Filter 2): Biaya produksi, harga jual, produktivitas, risiko gagal panen, permintaan pasar

6 komoditas unggulan: Padi, Jagung, Kedelai, Cabai, Bawang Merah, Bawang Putih

Hasil akhir: Ranking komoditas terbaik untuk lahan Bapak/Ibu."

Options:
- "Mengerti, lanjut konsultasi"
- "Ada pertanyaan dulu"

---

### PHASE 3: PARAMETER COLLECTION (per parameter)

Bot message:
"[Bapak/Ibu] [nama], sekarang saya akan menanyakan tentang [parameter]. [Mengapa ditanya? tooltip] Silakan pilih kondisi lahan Bapak/Ibu:"

Quick replies (example for Ketinggian):
- "Dataran rendah (0-400 mdpl)"
- "Dataran sedang (400-700 mdpl)"
- "Pegunungan (700+ mdpl)"
- "Tidak tahu"
- "Kurang yakin"

Input box: DISABLED -- hint: "Pilih jawaban di atas"

On "Kurang yakin":
"Tidak masalah! Silakan ketik perkiraan [parameter] lahan Bapak/Ibu."
-> Input box ENABLED temporarily

On "Tidak tahu":
-> Skip to next parameter, use median value

After all 5 params collected -> auto go to PHASE 4

---

### PHASE 4: CONFIRMATION

Bot message:
"Baik, [Bapak/Ibu] [nama]! Semua data lahan sudah terkumpul. Silakan periksa data berikut:"

Data recap card:
- Ketinggian: [value]
- Curah hujan: [value]
- pH tanah: [value]
- Tekstur tanah: [value]
- Intensitas cahaya: [value]

Options:
- "Hitung Rekomendasi"
- "Ulangi dari awal"

Input box: DISABLED

---

### PHASE 5: PREFERENCE

Bot message:
"Filter 1 Selesai, [Bapak/Ibu] [nama]! [X] komoditas lolos kesesuaian lingkungan: [list]. Sebelum menghitung ranking akhir, apa yang paling penting untuk Bapak/Ibu?"

Quick replies (multi-select):
- "Biaya produksi rendah"
- "Harga jual tinggi"
- "Produktivitas tinggi"
- "Risiko rendah"
- "Permintaan pasar tinggi"
- "Hitung Ranking" (submit)

Input box: DISABLED

---

### PHASE 6: RESULT

Bot message:
"Hasil Rekomendasi untuk Lahan [Bapak/Ibu] [nama]

WINNER: [Crop 1] -- Skor: [X.XXX]
[1-2 sentence why]

RUNNER-UP: [Crop 2] -- Skor: [X.XXX]
[1-2 sentence why]

DARK HORSE: [Crop 3] -- Skor: [X.XXX]
[1-2 sentence why]

Tidak lolos: [Crop 4, 5, 6]
[Brief reason per crop]"

Options (dynamic per surviving crops):
- "Lihat detail Padi"
- "Lihat detail Jagung"
- "Lihat detail Kedelai"
- "Ulangi konsultasi"
- "Selesai"

Input box: DISABLED

---

### PHASE 6.x: CROP DETAIL (drill-down)

On "Lihat detail [crop]":
"[Crop Name] -- Detail Analisis

Skor SAW: [X.XXX]
- Kondisi tanah: [skor]/5
- Curah hujan: [skor]/5
- Biaya produksi: [skor]/5
- Harga jual: [skor]/5
- Produktivitas: [skor]/5
- Risiko: [skor]/5
- Permintaan: [skor]/5

Kesesuaian lingkungan: [Parameter match/mismatch details]

Analisis ekonomi: [Brief economic analysis]

Catatan: [Risk/caveat notes]"

Options:
- "Kembali ke hasil"
- "Ulangi konsultasi"
- "Selesai"

---

### CLOSING

Bot message:
"Terima kasih telah menggunakan Agri-SAW Pro, [Bapak/Ibu] [nama]! Hasil rekomendasi ini bersifat pendukung keputusan. Untuk hasil terbaik, silakan konsultasikan dengan penyuluh pertanian setempat. Semoga panen Bapak/Ibu sukses!"

Options:
- "Konsultasi ulang"
- "Kembali ke beranda"

---

## 3. FAQ TREE (from Phase 2 "Ada pertanyaan")

### Level 1: Main FAQ categories
- "Tentang metode SAW"
- "Tentang komoditas tanaman"
- "Tentang parameter lahan"
- "Kembali ke konsultasi"

### Level 2 (if "Tentang komoditas"):
- "Padi", "Jagung", "Kedelai", "Cabai", "Bawang Merah", "Bawang Putih", "Kembali"

### Level 2 (if "Tentang parameter"):
- "Ketinggian", "Curah hujan", "pH tanah", "Tekstur tanah", "Intensitas cahaya", "Kembali"

### FAQ content per item: 2-3 paragraph explanation + "Kembali" option

---

## 4. EDGE CASES

| Scenario | Handling |
|----------|----------|
| All crops eliminated (Filter 1) | "Maaf, tidak ada komoditas yang cocok. Saran: [improvement tips]. Coba ubah parameter?" |
| User types free text during disabled input | Ignore or show: "Silakan pilih opsi yang tersedia" |
| API error | "Maaf, terjadi kesalahan teknis. Silakan coba lagi." + "Coba lagi" / "Kembali" |
| User wants to skip a parameter | "Tidak tahu" option -> use median value, note in confirmation |
| User uncertain | "Kurang yakin" -> enable free text input, use +/-15% range |

---

## 5. LANGUAGE and TONE GUIDELINES

- Sapaan: "Bapak" (laki-laki) / "Ibu" (perempuan) -- used in every bot message
- Tone: Helpful, respectful, concise -- like a knowledgeable extension officer
- Length: Max 3-4 short paragraphs per bot message
- Jargon: Avoid technical terms. Use "tinggi/rendah" not "optimal range"
- Focus: Always bring back to the task. No rambling.
- Guardrails: Never hallucinate data. Only use values from knowledge base.
- Formatting: Use emoji as visual anchors. Use line breaks for readability.

---

## 6. STATE MACHINE SUMMARY

| Phase | Input Box | Quick Replies | Form | API Call |
|-------|-----------|---------------|------|----------|
| welcome | DISABLED | No | Yes (nama+gender) | No |
| ringkasan | DISABLED | Yes (2 options) | No | No |
| collecting | DISABLED* | Yes (5-6 options) | No | Yes (per reply) |
| confirming | DISABLED | Yes (2 options) | No | No |
| preference | DISABLED | Yes (5+1 options) | No | Yes (on submit) |
| result | DISABLED | Yes (3-5 options) | No | No |
| detail | DISABLED | Yes (2-3 options) | No | No |
| closing | DISABLED | Yes (2 options) | No | No |

*Input box ENABLED only after "Kurang yakin" escape


## 7. API CALL FLOW & DECISION TREE

The ChatWidget uses a centralized API endpoint (/api/recommend) to drive the decision tree.

### A. Collecting Phase (Parameter Collection)
**Trigger:** User selects a quick reply in Phase 3.
**API Request:**
``json
{
  "message": "Pegunungan (700+ mdpl)",
  "previousParams": { "elevation": "pegunungan" },
  "uncertainParams": []
}
``
**API Logic:**
1. Matches the message to a parameter intent.
2. Updates userValues.
3. Checks userValues against required parameters.
4. If missing, returns missingParams and 
extQuestion.
5. If fulfilled, returns missingParams: [].

**Frontend Reaction:**
- **missingParams > 0:** Renders next question and specific quick reply buttons.
- **missingParams === 0:** Transitions to Phase 4 (Confirmation).

### B. Hitung Rekomendasi (Filter 1)
**Trigger:** User clicks "Hitung Rekomendasi" in Phase 4.
**API Request:** Sends all 5 parameters with message = "Hitung rekomendasi".
**API Logic:** Evaluates 6 crops. Returns surviving and eliminated arrays.
**Frontend Reaction:**
- **All eliminated:** Transitions to Phase 6 (Done) directly, showing FAQ links.
- **Success:** Transitions to Phase 5 (Preference), prompting user to pick economic weights.

### C. Hitung Ranking (Filter 2: SAW)
**Trigger:** User selects preferences and clicks "Hitung Ranking" in Phase 5.
**API Request:** Sends 5 parameters + preferences array.
**API Logic:**
1. Re-runs Filter 1.
2. Applies SAW algorithm with dynamic weights based on preferences.
3. Returns ranked surviving array with detailed scores.
**Frontend Reaction:**
- Transitions to Phase 6 (Result) showing Winner/Runner-up.
- Generates dynamic detail buttons for each surviving crop to prevent duplicate buttons or dead ends.
