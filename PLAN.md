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
- [x] src/config/categories.ts — 8 categories with icons, colors, prompts
- [x] src/config/styles.ts — fashion styles, non-fashion presets (30 total), poster styles
- [x] src/config/options.ts — fonts, visual effects, CTA, logo positions, ratios
- [x] src/types/index.ts — all TypeScript interfaces
- [x] Verify all data matches original app exactly
- [x] Git commit

## Phase 4: Core UI Components
- [x] StepIndicator.tsx
- [x] CategorySelector.tsx
- [x] ImageUploader.tsx
- [x] StyleCard.tsx
- [x] ToggleCard.tsx
- [x] WarningModal.tsx
- [x] SubWindow.tsx (sliding modal)
- [x] ProgressOverlay.tsx
- [x] Toast.tsx (replacement for alert())
- [x] Git commit

## Phase 5: Step Pages 1-3
- [x] ProjectContext.tsx (React Context for all state)
- [x] page.tsx (main wizard page)
- [x] Step1Upload.tsx (category + dual upload)
- [x] Step2Style.tsx (fashion vs non-fashion paths)
- [x] Step3Settings.tsx (toggles, density, count, ideas)
- [x] PosterDetailsModal content
- [x] LogoSettingsModal content
- [x] Verify all interactions work
- [x] Git commit

## Phase 6: API Routes
- [x] src/lib/gemini.ts (shared Gemini API client)
- [x] src/lib/prompt-builder.ts (buildAiPrompt logic)
- [x] POST /api/generate-image/route.ts
- [x] POST /api/generate-text/route.ts
- [x] POST /api/generate-caption/route.ts
- [x] Verify API key is server-side only
- [x] Git commit

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
- **Current Phase**: Phase 6 complete
- **Blockers**: None
- **Notes**: —
