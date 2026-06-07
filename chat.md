# 💬 Discussion Space

---

## 2026-06-06 — Flow Analysis & UI Improvement Plan

### Current Consultation Flow

```
User opens /analyze
  → ChatWidget fullPage mode (max-w-4xl, h-[700px])
  → Bot sends welcome message
  → Quick reply buttons appear for 1st param (ketinggian)
  → User selects option → API call → next param question
  → ... (5 params: ketinggian, curah hujan, pH, tekstur tanah, cahaya)
  → All params collected → Confirmation screen ("Hitung" / "Ubah Jawaban")
  → User confirms → Filter 1 (elimination) → Preference selection
  → User selects preferences → Filter 2 (SAW ranking) → Final result
  → Result: Winner + Runner-up + Dark Horse + eliminated list
```

### Identified Issues (from user testing + code review)

| # | Issue | Severity | Root Cause |
|---|-------|----------|------------|
| 1 | Header image missing on homepage | Medium | HeroSection rewrite removed Image component; next/image needs domain whitelist |
| 2 | Mobile chat experience is annoying | High | fullPage mode uses max-w-4xl + fixed h-[700px] — not edge-to-edge on mobile |
| 3 | No personal greeting / name input | Medium | Flow jumps straight to ketinggian question |
| 4 | Quick replies wrap badly on mobile | Low | flex-wrap with text-xs buttons overflow on small screens |
| 5 | Disclaimer text still in English | Low | Footer says "AgriLens AI can make mistakes..." in English |

### Improvement Plan

#### Fix 1: Restore Hero Image
- Use next/image with proper domains config in next.config.ts
- Domain lh3.googleusercontent.com added to whitelist

#### Fix 2: Mobile-First Chat Layout
- On mobile (< md): fullPage chat should be w-full h-screen edge-to-edge
- On desktop (>= md): keep current max-w-4xl + h-[700px] centered

#### Fix 3: Add Personal Greeting Step
- Before asking ketinggian, bot asks for name
- Store name, use it in responses

#### Fix 4: Quick Reply Mobile Optimization
- On mobile: stack buttons vertically (flex-col) instead of flex-wrap
- Increase touch target size (min 44px height)

#### Fix 5: Translate Disclaimer
- Changed to: "AI dapat membuat kesalahan. Verifikasi hasil dengan ahli pertanian."

### Files Modified
- components/HeroSection.tsx — Restored hero image
- components/ChatWidget.tsx — Mobile layout, greeting flow, quick reply layout, disclaimer
- app/analyze/page.tsx — Adjusted container for mobile
- next.config.ts — Added image domain

---

## 2026-06-06 — Bot-Lead Flow Redesign (CRITICAL)

### Masalah Fundamental

Flow saat ini **user-lead**, bukan **bot-lead**. User harus inisiatif ngetik dulu. Ini salah untuk use case SPK petani.

**Yang terjadi sekarang:**
User buka /analyze, Bot: "Halo! Siapa nama Anda?", User bingung harus ngetik manual, Bot: "Baik, [nama]! Sekarang ceritakan kondisi lahan...", User harus ngetik lagi atau pilih quick reply

**Yang seharusnya (bot-lead / customer service model):**
User buka /analyze, Bot: "Halo! Selamat datang di Agri-SAW Pro", Bot: "Sebelum mulai, silakan isi data diri Anda:", Form card muncul (Nama, Email, Lokasi) + tombol "Mulai Konsultasi", User isi form, klik Mulai, Bot: "Terima kasih, [nama]! Sekarang ceritakan kondisi lahan Anda.", Quick reply: [Dataran rendah] [Dataran sedang] [Pegunungan], User pilih, bot tanya parameter berikutnya, sampai semua parameter terkumpul, Tombol "Hitung Rekomendasi", Bot tampilkan hasil ranking

### Perbedaan Kunci

| Aspek | Sekarang (User-Lead) | Seharusnya (Bot-Lead) |
|-------|---------------------|----------------------|
| Inisiatif | User harus ngetik dulu | Bot yang mulai, user tinggal pilih |
| Input | Text box selalu aktif | Form terstruktur di dalam chat bubble |
| Quick reply | Pilihan parameter langsung | Ada step form dulu, baru parameter |
| Flow feel | Kayak chat biasa | Kayak customer service atau Typeform |
| Input box | Selalu usable | Disabled saat ada quick reply atau form |

### Redesign Plan

#### Step 1: Welcome + Form Section
- Bot kirim welcome message
- Di bawahnya muncul form card (nama, email optional, lokasi optional)
- Tombol "Mulai Konsultasi" di bawah form
- Input box disabled sampai form di-submit

#### Step 2: Parameter Collection (Bot-Lead)
- Setelah form submit, bot tampilkan pertanyaan parameter
- Quick reply buttons sebagai satu-satunya cara jawab
- Input box disabled (kecuali untuk "Kurang yakin" yang perlu ketik manual)
- Progress bar tampil di atas

#### Step 3: Confirmation + Result
- Setelah semua parameter terkumpul, tombol "Hitung Rekomendasi"
- Hasil ranking tampil sebagai card terstruktur

### Files to Modify
- components/ChatWidget.tsx — Major rewrite: tambah form state, disable input saat quick reply aktif, form card component
- app/analyze/page.tsx — Mungkin perlu adjust container

### Reference UX
- WhatsApp Business auto-reply flow
- Facebook Messenger bot dengan quick replies
- Typeform conversational UI
- Intercom / Drift chat widget

---

## Session Log

| Date | Event | Output |
|------|-------|--------|
| 2026-05-25 | Phase 1 pivoted to chatbot | Foundation in .mainsaw/ |
| 2026-06-04 | Phase 2 implemented (no approval) | Filter 1, Filter 2, NLP, ChatWidget |
| 2026-06-06 | Comprehensive audit | discus.md — 67 findings |
| 2026-06-06 | Planning reconstructed | 10 docs in .planning/ |
| 2026-06-06 | Phase 2 Fix Waves 1-3 + Cleanup | All 67 findings resolved, 62 tests pass |
| 2026-06-06 | Indonesian UI Polish | All pages translated, landing page simplified |
| 2026-06-06 | Git push | Pushed to GitHub, Vercel auto-deploy |
| 2026-06-06 | UI/Flow improvement analysis | This document |
| 2026-06-06 | Bot-lead flow redesign identified | Critical: need form-based greeting + disable input during quick replies |
| 2026-06-06 | Full flow mapping completed | research/CHAT-FLOW-MAPPING.md — 6 phases, FAQ tree, edge cases, state machine |
| 2026-06-06 | Gender field replaces email/location | Form: Nama + Jenis Kelamin (Laki-laki/Perempuan), sapaan Bapak/Ibu |
| 2026-06-06 | ChatWidget full rewrite | Bot-lead flow, input disabled during quick replies, form card, confirmation step |
| 2026-06-06 | OpenRouter AI credentials set | .env.local configured, Vercel deploy pending env vars |