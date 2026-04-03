# Etalase Pro 2.0 — Full Specification

## Overview
Indonesian product photo generator for e-commerce. Takes raw product photos → applies AI styling → outputs marketing-ready visuals.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (product uploads + generated results)
- **Auth**: Supabase Auth (email magic link)
- **AI**: Google Gemini API
  - Image generation: `gemini-2.5-flash-image-preview` (responseModalities: ['TEXT', 'IMAGE'])
  - Text generation: `gemini-2.5-flash-preview-09-2025` (responseModalities: ['TEXT'])
- **Hosting**: Vercel

## Dependencies
```json
{
  "next": "^14",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3",
  "lucide-react": "^0.383",
  "@supabase/supabase-js": "^2",
  "@supabase/ssr": "^0"
}
```

## Database Schema

### Table: projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK → auth.users, not null |
| category | text | not null |
| style_config | jsonb | { selectedStyle, preset, gender, age, generateTab, activePresetTab } |
| settings | jsonb | { count, ratio, density, posterDetails, details{...}, logo, logoPlacement, visualDensity, additionalIdeas } |
| created_at | timestamptz | default now() |

### Table: uploads
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| upload_type | text | 'product_1', 'product_2', 'reference', 'logo' |
| storage_path | text | Supabase Storage path |
| created_at | timestamptz | default now() |

### Table: generated_images
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| image_url | text | Storage path or base64 |
| prompt_used | text | Full prompt used |
| created_at | timestamptz | default now() |

### RLS Policies
All tables: `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE.

### Storage Buckets
- `uploads` — user product photos, logos, references (policy: authenticated, own user_id folder)
- `results` — AI generated images (policy: authenticated, own user_id folder)

## Categories (8 total)
1. Fashion (Shirt icon, rose) — "high-end fashion editorial style"
2. Aksesoris & Koleksi (Watch icon, amber) — "luxury accessory and jewelry"
3. Produk Rumah & Dekorasi (Home icon, emerald) — "cozy interior design"
4. Elektronik & Gadget (Smartphone icon, blue) — "sleek tech product"
5. Kecantikan & Kesehatan (Sparkle icon, purple) — "soft beauty lighting"
6. Makanan & Minuman (Utensils icon, orange) — "appetizing food photography"
7. Otomotif (Car icon, zinc) — "professional automotive product"
8. Olahraga & Outdoor (Dumbbell icon, teal) — "dynamic sports equipment"

## Style System

### Fashion Category (when category === 'fashion')
Gender options: Pria, Wanita, Unisex
Age options: Dewasa, Remaja, Anak-Anak, Balita

4 Fashion Styles:
1. **Creative Flatlay** — overhead, organized, minimalist background
2. **Ghost 3D Fit** — transparent glass mannequin, dynamic pose, matching outfit
3. **Pro Model Look** — realistic studio mannequin, professional pose
4. **Boutique Hanger** — garment on hanger, natural draping, studio wall

### Non-Fashion Categories (all other 7 categories)
3 preset tabs + 1 custom tab:

**Commercial** (11 presets): Produk Katalog, Clean White Hero, High-Key Bright, Premium Spotlight, Flat Lay Commercial, Sharp Shadow, Gradient Ads, Reflective Surface, Macro Detail, Dynamic Angle, Shadowless Catalog

**Lifestyle** (10 presets): Natural Lifestyle, Cinematic Moody, Human Interaction, Morning Light, Everyday Use, Outdoor Natural, Cozy Warm, Editorial Mag, Seasonal Theme, Brand Story

**Premium** (10 presets): Dark Luxury, Artistic Concept, Sculpting Light, Editorial Fashion, Minimal Luxury, Glass Art, Gold Accent, Museum Display, Monochrome Lux, Iconic Hero

Each preset has: id, name, icon (lucide), desc, prompt, and optionally typography instruction.

**Custom**: Upload reference background image, AI replicates that style.

## Settings (Step 3)

### Poster Details (toggle)
When enabled, opens modal with:
- Headline (max 3 words, required)
- Tagline (max 3 words, required)
- Feature 1-3 (max 3 words each, optional)
- Delivery options: COD, Instant, Sameday (checkboxes)
- "Isi Otomatis AI" button — calls API to auto-generate from product image

### Logo (toggle)
When enabled, opens modal with:
- Logo upload
- 6 placement positions: TL, TC, TR, BL, BC, BR
- Logo renders on result as overlay: 15% width, 40% opacity
- Logo is merged into image via canvas on download

### Visual Density
3 options: Bersih (minimal), Natural (balanced), Rame (festive/dense)

### Variation Count
Options: 1, 2, or 4 images

### Aspect Ratio
Options: 1:1, 9:16, 3:4, 16:9

### Additional Ideas
Free text field for extra creative instructions

## Prompt Building Logic
See `buildAiPrompt()` in original source code. Key structure:
1. Design & Composition System rules (typography integration, visual hierarchy)
2. Category-specific base prompt
3. Style-specific instructions (fashion styles OR preset prompt)
4. Visual density prompt
5. Quality requirements (8K, commercial grade)
6. Object isolation + realism constraints
7. Poster details (if enabled): headline, tagline, features, delivery badges
8. Additional ideas (if provided)
9. Aspect ratio

## API Endpoints

### POST /api/generate-image
- Input: { base64Image, base64Image2?, referenceBase64?, settings, category, styleConfig }
- Process: Build prompt → Call Gemini image API → Return base64 result
- Retry: 429 → wait 60s, retry up to 5x. Other errors → exponential backoff, 2x.
- Rate limit: 20s delay between sequential generations

### POST /api/generate-text
- Input: { base64Image }
- Process: Call Gemini text API → Parse JSON response
- Output: { headline, tagline, feature1, feature2, feature3 }
- All outputs max 3 words, in Indonesian

### POST /api/generate-caption
- Input: { base64Image, details }
- Process: Call Gemini text API → Return marketplace-ready description
- Output: { caption } — Indonesian SEO product description with structure:
  Title, Hook, Benefits (bullets), Specs, Urgency, Hashtags

## UI Flow

### Step 1: Upload
- Category grid (2-3 cols mobile, 6 cols desktop)
- Dual upload: Product 1 (required) + Product 2 (optional)
- Side by side layout (grid-cols-2 forced)

### Step 2: Style
- Fashion: Gender/Age selector → Fashion Layout style grid
- Non-Fashion: Tab bar (Commercial | Lifestyle | Premium | Custom) → Style grid or reference upload

### Step 3: Settings
- 2-col grid of toggle cards (Poster Details, Logo)
- Visual density selector (3 options)
- Variation count buttons
- Additional ideas textarea

### Step 4: Preview
- Prompt preview (code block, scrollable)
- Copy button with fallback (navigator.clipboard → execCommand)
- External links: ChatGPT, Gemini (copy prompt then open)
- Tips section
- "Generate di Aplikasi" main CTA

### Step 5: Results
- Loading: scanning animation over product image, progress bar, status messages
- Error: icon + message + retry/back buttons
- Success: responsive image grid, logo overlay, download/regenerate per image
- Marketplace caption generator
- Footer: kembali, baru, generate ulang

## Download Logic
1. Fetch image as blob
2. If no logo → simple download (desktop) or share (iOS)
3. If logo enabled:
   - Create canvas at image dimensions
   - Draw main image
   - Draw logo at selected position (15% width, 40% opacity, 5% padding)
   - Export canvas as PNG blob
   - Download or share

## Error Handling
- No more alert() — use toast component
- API errors: display in Step 5 error state with retry option
- Rate limit (429): show waiting indicator, auto-retry
- Network errors: exponential backoff
- Validation: real-time word count checks (max 3 words)

## Source Code Reference
The complete original single-file React app is stored at `reference/original-app.jsx`.
All business logic, constants, and UI should match this reference exactly.
