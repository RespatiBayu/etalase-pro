# Etalase Pro 2.0 — Build Plan

> Living document. Update after each phase is completed.

## Phase 1: Project Scaffolding
- [x] Init Next.js 14 with App Router, TypeScript, Tailwind, src dir
- [x] Install dependencies (lucide-react, @supabase/supabase-js, @supabase/ssr)
- [x] Create folder structure (app/, components/, config/, context/, lib/, types/)
- [x] Setup .env.local and .env.example
- [x] Configure Tailwind with orange theme
- [x] Create base layout.tsx + globals.css
- [x] Verify npm run dev works
- [x] Git commit

## Phase 2: Supabase Schema & Client
- [x] Create migration SQL (projects, uploads, generated_images tables)
- [x] Define RLS policies
- [x] Define Storage bucket policies
- [x] Create Supabase browser client (src/lib/supabase/client.ts)
- [x] Create Supabase server client (src/lib/supabase/server.ts)
- [x] Create TypeScript types for DB (src/types/database.ts)
- [x] Git commit

## Phase 3: Config & Constants Migration
- [ ] src/config/categories.ts — 8 categories with icons, colors, prompts
- [ ] src/config/styles.ts — fashion styles, non-fashion presets (30 total), poster styles
- [ ] src/config/options.ts — fonts, visual effects, CTA, logo positions, ratios
- [ ] src/types/index.ts — all TypeScript interfaces
- [ ] Verify all data matches original app exactly
- [ ] Git commit

## Phase 4: Core UI Components
- [ ] StepIndicator.tsx
- [ ] CategorySelector.tsx
- [ ] ImageUploader.tsx
- [ ] StyleCard.tsx
- [ ] ToggleCard.tsx
- [ ] WarningModal.tsx
- [ ] SubWindow.tsx (sliding modal)
- [ ] ProgressOverlay.tsx
- [ ] Toast.tsx (replacement for alert())
- [ ] Git commit

## Phase 5: Step Pages 1-3
- [ ] ProjectContext.tsx (React Context for all state)
- [ ] page.tsx (main wizard page)
- [ ] Step1Upload.tsx (category + dual upload)
- [ ] Step2Style.tsx (fashion vs non-fashion paths)
- [ ] Step3Settings.tsx (toggles, density, count, ideas)
- [ ] PosterDetailsModal content
- [ ] LogoSettingsModal content
- [ ] Verify all interactions work
- [ ] Git commit

## Phase 6: API Routes
- [ ] src/lib/gemini.ts (shared Gemini API client)
- [ ] src/lib/prompt-builder.ts (buildAiPrompt logic)
- [ ] POST /api/generate-image/route.ts
- [ ] POST /api/generate-text/route.ts
- [ ] POST /api/generate-caption/route.ts
- [ ] Verify API key is server-side only
- [ ] Test with curl or Thunder Client
- [ ] Git commit

## Phase 7: Step Pages 4-5
- [ ] Step4Preview.tsx (prompt preview, copy, external links, generate button)
- [ ] Step5Results.tsx (loading, error, success states)
- [ ] Download logic with canvas logo merge
- [ ] Regenerate per-image
- [ ] Marketplace caption section
- [ ] iOS share fallback
- [ ] Connect to API routes
- [ ] Git commit

## Phase 8: Polish & Deploy
- [ ] Replace all alert() with Toast component
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] TypeScript strict — remove all `any`
- [ ] npm run build — zero errors
- [ ] npm run lint — clean
- [ ] Create middleware.ts (basic)
- [ ] Create README.md
- [ ] Update .gitignore
- [ ] Git commit
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Run SQL migration on Supabase
- [ ] Create Storage buckets
- [ ] Set env vars on Vercel
- [ ] Final verification on production URL

## Status
- **Current Phase**: Phase 2 complete
- **Blockers**: None
- **Notes**: —
