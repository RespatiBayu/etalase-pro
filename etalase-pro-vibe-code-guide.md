# 🚀 Etalase Pro 2.0 — Full Vibe Code Guide dengan Claude Code

## Gambaran Besar

Kamu akan rebuild app React single-file menjadi full-stack Next.js app menggunakan **Claude Code** sebagai agentic coding assistant. Panduan ini berisi semua yang kamu butuhkan: dari setup environment sampai prompt-prompt spesifik untuk setiap fase.

---

## STEP 0 — Persiapan Environment

### Install Prerequisites
```bash
# Pastikan Node.js 18+ terinstall
node -v

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

### Buat Akun & Project
1. **Supabase** → https://supabase.com → Create New Project → catat URL dan keys
2. **Vercel** → https://vercel.com → Connect GitHub
3. **Gemini API** → https://aistudio.google.com/apikey → buat API key
4. **GitHub** → Buat repo baru: `etalase-pro`

---

## STEP 1 — Buat Project & CLAUDE.md

### 1a. Init Project
```bash
mkdir etalase-pro && cd etalase-pro
git init
```

### 1b. Buat file CLAUDE.md

> **INI FILE TERPENTING.** Claude Code membaca file ini di awal setiap session.
> Buat file ini SEBELUM menjalankan Claude Code.

Copy-paste isi file `CLAUDE.md` yang sudah saya siapkan (lihat file terpisah).

### 1c. Buat file SPEC.md

Copy-paste isi file `SPEC.md` yang sudah saya siapkan. File ini berisi spesifikasi lengkap aplikasi.

### 1d. Buat file PLAN.md

File ini akan diupdate oleh Claude Code sebagai living checklist. Copy isi awal dari file terpisah.

---

## STEP 2 — Session 1: Project Scaffolding

Buka terminal di folder project, lalu:

```bash
claude
```

### Prompt pertama (Planning Mode — tekan Shift+Tab 2x dulu):
```
Baca @CLAUDE.md, @SPEC.md, dan @PLAN.md.
Kamu akan membangun aplikasi ini dari nol.

Fase 1: Project Scaffolding.
1. Init Next.js 14 dengan App Router, TypeScript, Tailwind, src directory
2. Install semua dependencies yang ada di SPEC.md
3. Setup folder structure sesuai CLAUDE.md
4. Buat file .env.local dengan placeholder values
5. Buat file .env.example (tanpa secrets)
6. Setup Tailwind config dengan custom colors (orange theme dari app lama)
7. Buat base layout.tsx dan globals.css
8. Pastikan `npm run dev` berjalan tanpa error

Jangan coding dulu, buat plan dulu dan tunjukkan ke saya.
```

Setelah review plan, approve lalu biarkan Claude Code bekerja.

### Setelah selesai:
```
Update @PLAN.md, tandai fase 1 sebagai selesai. Commit semua perubahan dengan message "feat: project scaffolding"
```

---

## STEP 3 — Session 2: Supabase Setup

```bash
claude
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 2: Supabase Database & Storage Setup.
Buat file `supabase/migrations/001_initial_schema.sql` berisi:

1. Tabel `projects`:
   - id (uuid, PK, default gen_random_uuid())
   - user_id (uuid, references auth.users)
   - category (text, not null)
   - style_config (jsonb) — menyimpan selectedStyle, preset, gender, age, dll
   - settings (jsonb) — menyimpan posterDetails, visualDensity, count, ratio, dll
   - created_at (timestamptz)
   
2. Tabel `uploads`:
   - id (uuid, PK)
   - project_id (uuid, FK → projects)
   - upload_type (text: 'product_1', 'product_2', 'reference', 'logo')
   - storage_path (text)
   - created_at (timestamptz)

3. Tabel `generated_images`:
   - id (uuid, PK)
   - project_id (uuid, FK → projects)
   - image_url (text)
   - prompt_used (text)
   - created_at (timestamptz)

4. RLS policies: users hanya bisa CRUD data miliknya sendiri
5. Storage buckets: 'uploads' dan 'results' dengan policy per user_id

Juga buat file `src/lib/supabase/client.ts` (browser client) dan `src/lib/supabase/server.ts` (server client).
Buat type definitions di `src/types/database.ts` berdasarkan schema.

Update @PLAN.md setelah selesai.
```

---

## STEP 4 — Session 3: Config & Constants

```bash
/clear
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 3: Migrasi semua konstanta dan konfigurasi.
Pindahkan semua data statis dari app lama ke file-file config:

1. `src/config/categories.ts` — CATEGORIES array (8 kategori)
2. `src/config/styles.ts` — semua style config:
   - FASHION_STYLE_DETAILS, STYLE_DESCRIPTORS
   - NON_FASHION_PRESETS (Commercial, Lifestyle, Premium — masing-masing ~10 preset)
   - CATEGORY_POSTER_STYLES, GENERIC_POSTER_STYLES
3. `src/config/options.ts` — FONT_OPTIONS, VISUAL_EFFECT_OPTIONS, CTA_OPTIONS, 
   LOGO_OPTIONS, RATIOS, NON_FASHION_THEMES
4. `src/types/index.ts` — TypeScript types/interfaces untuk semua entities

Referensi app lama ada di @SPEC.md bagian "Source Code Reference".
Pastikan semua data identik dengan aslinya, jangan ada yang hilang.
Export semua dengan named exports.

Update @PLAN.md setelah selesai. Commit: "feat: migrate config and constants"
```

---

## STEP 5 — Session 4: Core UI Components

```bash
/clear
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 4: Build semua reusable UI components.
Buat di `src/components/ui/`:

1. StepIndicator.tsx — 5-step progress (sama persis dgn app lama)
2. CategorySelector.tsx — grid kategori produk
3. ImageUploader.tsx — reusable upload component (preview, delete, label)
4. StyleCard.tsx — card untuk pilihan style/preset
5. ToggleCard.tsx — card dengan toggle switch (untuk posterDetails, logo)
6. WarningModal.tsx — confirmation dialog
7. SubWindow.tsx — sliding modal untuk detail/logo settings
8. ProgressOverlay.tsx — loading state saat generate (scanning animation)

Semua komponen harus:
- TypeScript dengan proper props interface
- Tailwind styling yang match dengan theme orange app lama
- Client components ("use client") karena ada interactivity
- Mobile-first responsive

Style guide: bg-[#FFF8F0] base, orange-400 primary, rounded-2xl corners, 
font-black italic uppercase tracking-tighter untuk headings.

Update @PLAN.md. Commit: "feat: core UI components"
```

---

## STEP 6 — Session 5: Step Pages (1-3)

```bash
/clear
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 5: Build halaman step 1 sampai 3.

Buat `src/app/page.tsx` sebagai main page yang mengatur multi-step flow.
State management menggunakan React Context (`src/context/ProjectContext.tsx`).

Context harus menyimpan:
- step (1-5), selectedCategory, uploadedImages (product1, product2, reference, logo)
- styleConfig (fashion: style/gender/age, non-fashion: preset/tab/custom)
- settings (posterDetails, logo, visualDensity, count, ratio, additionalIdeas)
- generatedResults[], error, progress, isGenerating

Step components di `src/components/steps/`:
1. Step1Upload.tsx — Kategori + dual image upload
2. Step2Style.tsx — Fashion path (gender/age + fashion layouts) vs Non-Fashion path 
   (Commercial/Lifestyle/Premium tabs + Custom reference upload)
3. Step3Settings.tsx — Toggle cards, visual density, count, ratio, additional ideas

Semua layout, interaksi, dan visual harus match 1:1 dengan app lama.
Gunakan config dari `src/config/` yang sudah dibuat sebelumnya.

Update @PLAN.md. Commit: "feat: step 1-3 pages"
```

---

## STEP 7 — Session 6: API Routes

```bash
/clear
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 6: Build semua API routes di `src/app/api/`.

1. `POST /api/generate-image/route.ts`
   - Menerima: base64 images, project settings
   - Membangun prompt menggunakan logic buildAiPrompt dari app lama 
     (pindahkan ke `src/lib/prompt-builder.ts`)
   - Panggil Gemini API (gemini-2.5-flash-image-preview) dari SERVER SIDE
   - Handle retry logic untuk 429 (rate limit) — max 5 retries, 60s wait
   - Handle exponential backoff untuk error lain — max 2 retries
   - Return: { imageUrl: "data:image/png;base64,..." }

2. `POST /api/generate-text/route.ts`
   - Untuk "Isi Otomatis AI" — generate headline, tagline, features
   - Panggil Gemini text model (gemini-2.5-flash-preview)
   - Return JSON { headline, tagline, feature1, feature2, feature3 }

3. `POST /api/generate-caption/route.ts`
   - Untuk marketplace caption generator
   - Panggil Gemini text model
   - Return { caption: string }

CRITICAL: API key HANYA di server-side via process.env.GEMINI_API_KEY.
Jangan pernah expose ke client.

Buat juga `src/lib/gemini.ts` sebagai shared Gemini API client utility.

Update @PLAN.md. Commit: "feat: API routes for AI generation"
```

---

## STEP 8 — Session 7: Step Pages (4-5) + Generate Flow

```bash
/clear
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 7: Build Step 4 (Preview) dan Step 5 (Results).

1. Step4Preview.tsx:
   - Prompt preview panel (read-only, scrollable)
   - Copy prompt button (dengan clipboard fallback untuk iOS)
   - External AI links (ChatGPT, Gemini) — copy prompt lalu buka tab baru
   - "Generate di Aplikasi" button → pindah ke step 5 + trigger generate
   - Tips section tentang cara pakai prompt manual

2. Step5Results.tsx:
   - Loading state: scanning animation + progress bar + progress messages
   - Error state: error display + retry/back buttons
   - Success state:
     - Image grid (responsive: 1 col for 1 img, 2 col for 2, 2x2 for 4)
     - Logo overlay preview (CSS positioned, 15% width, 40% opacity)
     - Per-image download (canvas merge logo jika ada) 
     - Per-image regenerate button
     - Marketplace caption generator section
     - Action buttons: kembali, baru, generate ulang
   
   Download logic harus handle:
   - Desktop: blob download
   - iOS: navigator.share fallback
   - Logo merge: canvas compositing sebelum download

Semua harus connect ke API routes yang sudah dibuat.
Gunakan ProjectContext untuk state management.

Update @PLAN.md. Commit: "feat: step 4-5 with generate flow"
```

---

## STEP 9 — Session 8: Polish & Testing

```bash
/clear
```

### Prompt:
```
Baca @CLAUDE.md dan @PLAN.md.

Fase 8: Polish, error handling, dan testing.

1. Ganti semua alert() dengan toast notifications (buat simple toast component)
2. Pastikan semua loading states smooth
3. Test semua responsive breakpoints (mobile, tablet, desktop)
4. Pastikan error handling konsisten di semua API routes
5. Tambah proper TypeScript types di mana masih ada `any`
6. Pastikan `npm run build` berhasil tanpa error
7. Pastikan `npm run lint` clean

Juga buat `src/middleware.ts` yang basic (untuk future auth).
Buat `.gitignore` yang proper.
Buat `README.md` dengan setup instructions.

Update @PLAN.md, tandai semua selesai.
Commit: "feat: polish and error handling"
```

---

## STEP 10 — Deploy ke Vercel

```bash
# Push ke GitHub
git remote add origin https://github.com/USERNAME/etalase-pro.git
git push -u origin main
```

Di Vercel:
1. Import repository
2. Framework: Next.js (auto-detect)
3. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = (dari Supabase dashboard)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (dari Supabase dashboard)  
   - `SUPABASE_SERVICE_ROLE_KEY` = (dari Supabase dashboard)
   - `GEMINI_API_KEY` = (dari Google AI Studio)
4. Deploy!

Di Supabase:
1. Buka SQL Editor
2. Jalankan file `supabase/migrations/001_initial_schema.sql`
3. Buat Storage buckets: `uploads`, `results`

---

## Tips Vibe Coding dengan Claude Code

### Session Management
- **`/clear`** di awal setiap fase baru — context bersih = hasil lebih baik
- **`/compact`** kalau di tengah session context mulai penuh (50%+)
- Satu session = satu fase. Jangan campur.

### Planning Mode
- Tekan **Shift+Tab 2x** untuk masuk Planning Mode
- Gunakan di awal setiap session untuk review plan
- Claude akan analisis tanpa mengubah file

### Quality Control
- Setelah setiap fase: `npm run build && npm run lint`
- Review diff sebelum commit: `git diff --stat`
- Kalau ada yang aneh, bilang: "Itu salah, harusnya X. Perbaiki."

### Kalau Claude Stuck atau Salah
```
Stop. Kamu salah di bagian X. 
Baca ulang @SPEC.md bagian Y.
Yang benar adalah: [jelaskan].
Perbaiki sekarang.
```

### Kalau Mau Tweak Hasil
```
Komponen X sudah bagus tapi:
1. Spacing terlalu rapat di mobile
2. Warnanya kurang match — harusnya orange-400 bukan orange-500
3. Animasinya terlalu lambat

Perbaiki ketiga hal ini.
```

---

## Estimasi Waktu

| Fase | Durasi | Keterangan |
|------|--------|------------|
| Step 0-1 | 30 menit | Setup manual |
| Step 2 (Scaffolding) | 15-20 menit | Claude Code |
| Step 3 (Supabase) | 10-15 menit | Claude Code |
| Step 4 (Config) | 10-15 menit | Claude Code |
| Step 5 (UI Components) | 20-30 menit | Claude Code |
| Step 6 (Step 1-3) | 30-45 menit | Claude Code |
| Step 7 (API Routes) | 20-30 menit | Claude Code |
| Step 8 (Step 4-5) | 30-45 menit | Claude Code |
| Step 9 (Polish) | 20-30 menit | Claude Code |
| Step 10 (Deploy) | 15 menit | Manual |

**Total: ~3-5 jam** untuk full rebuild (vs berminggu-minggu manual).

---

## File yang Perlu Kamu Buat Manual Sebelum Mulai

1. ✅ `CLAUDE.md` — (lihat file terpisah)
2. ✅ `SPEC.md` — (lihat file terpisah)  
3. ✅ `PLAN.md` — (lihat file terpisah)
4. ✅ Source code lama — simpan sebagai `reference/original-app.jsx`

Selamat vibe coding! 🎯
