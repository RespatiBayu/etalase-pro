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
- [x] Step4Preview.tsx (prompt preview, copy, external links, generate button)
- [x] Step5Results.tsx (loading, error, success states)
- [x] Download logic with canvas logo merge
- [x] Regenerate per-image
- [x] Marketplace caption section
- [x] iOS share fallback
- [x] Connect to API routes
- [x] Git commit

## Phase 8: Polish & Deploy ✅ COMPLETE
- [x] Replace all alert() with Toast component
- [x] TypeScript strict — remove all `any`
- [x] npm run build — zero errors
- [x] npm run lint — clean (warnings only, intentional)
- [x] Create middleware.ts (Supabase session refresh)
- [x] Update .gitignore
- [x] Git commit
- [x] Push to GitHub
- [x] Deploy to Vercel
- [x] Run SQL migrations on Supabase (001, 002, 003_tokens)
- [x] Set env vars on Vercel
- [x] Final verification on production URL

## Phase 9: Token System ✅ COMPLETE
- [x] 003_tokens.sql — add tokens to profiles, token_transactions, token_packages tables
- [x] Seed token packages (Starter 30/69rb, Pro 100/97rb, Ultimate 210/199rb)
- [x] POST /api/tokens/webhook — Scalev payment webhook with HMAC-SHA256 verification
- [x] GET /api/tokens/balance — return current user token balance
- [x] GET /api/tokens/packages — return active packages
- [x] /api/generate-image — deduct 1 token per generation, return 402 if insufficient
- [x] TokenModal component — show packages, open Scalev CO page
- [x] WizardShell — token balance badge + TokenModal trigger
- [x] Step5Results — TOKEN_INSUFFICIENT error state with "Beli Token" CTA
- [x] /set-password page — invited users set their password
- [x] /auth/callback — handle ?next=/set-password redirect
- [x] End-to-end test: payment → webhook → user created → invite email → token credited ✅

## Phase 10: User Dashboard & Account
- [ ] /dashboard page — token balance card, transaction history table
- [ ] Token usage chart (last 30 days)
- [ ] Account info (email, plan, join date)
- [ ] Link from WizardShell header (avatar/profile button)

## Phase 11: Landing Page
- [ ] / root redirect logic (unauthenticated → landing, authenticated → /app)
- [ ] Landing page — hero, how it works, pricing section (3 token packages)
- [ ] Pricing cards with Scalev CO links
- [ ] FAQ section
- [ ] Footer

## Phase 12: Save Results to Supabase
- [ ] Upload generated images to Supabase Storage (results bucket)
- [ ] Save project + generated_images to DB after generation
- [ ] /history page — past projects grid with re-download
- [ ] Storage RLS policies

## Status
- **Current Phase**: Phase 9 complete — deciding next phase
- **Live URL**: https://etalase-pro.vercel.app
- **Blockers**: None
