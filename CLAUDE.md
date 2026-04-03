# Etalase Pro 2.0

Product photo generator app for Indonesian e-commerce sellers. Transforms raw product photos into high-end marketing visuals using AI (Gemini).

## Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS 
- Supabase (PostgreSQL + Storage + Auth)
- Google Gemini API (server-side only)
- Deployed on Vercel

## Project Structure
```
src/
  app/             # Next.js App Router pages + API routes
    api/           # Server-side API routes (generate-image, generate-text, generate-caption)
    page.tsx       # Main multi-step wizard page
    layout.tsx     # Root layout
  components/
    ui/            # Reusable UI components (StepIndicator, ImageUploader, etc.)
    steps/         # Step-specific page components (Step1Upload, Step2Style, etc.)
  config/          # Static data: categories, styles, presets, options
  context/         # React Context for project state management
  lib/             # Utilities: supabase clients, gemini client, prompt-builder
  types/           # TypeScript type definitions
supabase/
  migrations/      # SQL migration files
reference/         # Original app source code for reference
```

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (run after every phase to verify)
- `npm run lint` — lint check

## Code Style
- TypeScript strict mode, no `any` types
- Named exports for all modules, default export only for page components
- "use client" directive only on components with interactivity (useState, onClick, etc.)
- Tailwind only for styling, no CSS modules or styled-components
- Mobile-first responsive: base styles for mobile, `md:` for tablet+, `lg:` for desktop

## Design System
- Base background: `bg-[#FFF8F0]`
- Primary: `orange-400` (buttons, active states, accents)
- Cards: `bg-white rounded-2xl md:rounded-[2.5rem] border border-orange-100`
- Headings: `font-black italic uppercase tracking-tighter text-orange-900`
- Sub-labels: `text-[10px] font-black uppercase tracking-widest text-orange-300`
- Active state: `border-orange-400 bg-white shadow-xl shadow-orange-100`

## API Security
- IMPORTANT: Gemini API key MUST only be used in server-side API routes (process.env.GEMINI_API_KEY)
- NEVER expose API keys to the client
- All AI calls go through /api/ routes

## App Behavior
- Multi-step wizard: 5 steps (Upload → Style → Settings → Preview → Results)
- Step 1: Category selection (8 categories) + dual product image upload
- Step 2: Fashion path (gender/age + 4 fashion styles) OR Non-fashion path (30 presets in 3 tabs + custom reference)
- Step 3: Poster details toggle, logo toggle, visual density, variation count, additional ideas
- Step 4: Prompt preview, copy, external AI links, in-app generate button
- Step 5: Results grid, logo overlay, download with canvas merge, regenerate, marketplace caption

## When Compacting
Preserve: current phase progress, list of completed/remaining files, any errors to fix.

## Reference
Full original source code: @reference/original-app.jsx
Full spec: @SPEC.md
Progress tracker: @PLAN.md
