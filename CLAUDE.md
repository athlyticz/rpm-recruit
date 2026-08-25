# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RPM Recruit (Recruit, Profile, Match) is a college baseball recruiting SaaS by Scanzano Baseball / All-American Baseball Talent Showcases, led by Coach John Scanzano (Head Coach, Camden County College; 150+ college commitments produced through Scanzano Sports). It helps high school and post-grad baseball players build verified recruiting profiles, get an honest projection of their fit at every college level, match with programs, and run a proven outreach playbook.

## Product Vision and Principles

These principles override convenience. Every feature decision should be checked against them.

1. **Honest fit is the product.** Competitors (NCSA, SportsRecruits) monetize inflated hope. RPM Recruit's moat is a JUCO head coach's honest evaluation at scale. Match scores must be defensible, never padded to flatter. No floors that guarantee every school "matches." Show the gap between the player and the next tier, and the plan to close it.
2. **Every level exists.** D1, D2, D3, NAIA, and NJCAA are all first-class citizens in the data model, match engine, and UI. Post-House-settlement roster caps (D1 opted-in programs at 34) push talent down-market; JUCO and NAIA pathways are a core strength of this product, not an afterthought. Coach Scanzano is a JUCO head coach; the product must reflect that world.
3. **Verified beats self-reported.** Metrics carry a verification status (self_reported, coach_verified, event_verified). UI always distinguishes them. Event-verified data (PBR, Perfect Game) is the gold standard.
4. **The playbook, not just the profile.** The retention engine is guidance: grade-by-grade roadmaps, recruiting-calendar-aware timing, weekly task cadence. A profile is a consequence of the system, not the product.
5. **"AI-powered" must be true.** Never label template interpolation as AI. Bio generator, letter builder, and fit explanations call a real LLM (Anthropic API) server-side. If a feature is a template, label it a template until the AI integration lands.
6. **Coach's voice.** All player/parent-facing copy reads like a coach wrote it: plain, direct, no hype. No em dashes. No emojis.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom `@theme` tokens in `src/app/globals.css`
- **Auth & Database**: Supabase (auth + Postgres via RLS)
- **Payments**: Stripe (one-time + subscription via Checkout)
- **AI**: Anthropic API via server-side API routes only (never expose keys client-side)
- **Fonts**: Cormorant Garamond (display), Barlow (body), Barlow Condensed (labels/buttons), JetBrains Mono (data)

## Commands

```bash
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run lint           # ESLint
npm run type-check     # TypeScript strict check
npm run stripe:listen  # Forward Stripe webhooks to localhost
```

Run `npm run type-check` and `npm run lint` before considering any task complete.

## Architecture

### Route Groups

- `(marketing)` — Public pages: landing (`/`), `/pricing`, `/about`, `/contact`. Uses `MarketingHeader` + `MarketingFooter` layout.
- `(auth)` — `/login`, `/signup`, `/callback`. Diamond-themed auth layout.
- `(app)` — Authenticated app behind Supabase auth guard. Grid layout: topbar (56px) + sidebar (236px) + main content.

### App Pages (authenticated)

`/dashboard`, `/profile`, `/athletic`, `/academics`, `/scores`, `/college-match`, `/letter-builder`, `/bio-generator`, `/cost-tracker`, `/checklist`, `/pitch-log`, `/settings`

### Key Directories

- `src/lib/supabase/` — Client, server, and middleware Supabase helpers
- `src/lib/stripe.ts` — Server-side Stripe instance
- `src/config/pricing.ts` — Plan definitions (Showcase $1,499, Monthly $49, Scout $99, Org $299)
- `src/types/database.ts` — Supabase typed schema
- `src/components/ui/` — Shared UI: logo (`logo.tsx`), tachometer gauge (`tachometer.tsx`)
- `src/components/marketing/` — Header, footer, tachometer showcase section
- `src/components/app/` — Sidebar, topbar, page-header for authenticated shell
- `supabase/migrations/` — Database schema with RLS policies and auth trigger

### Tachometer Component

`src/components/ui/tachometer.tsx` — Signature UI element and the visual identity of the brand (RPM = engine RPMs = Recruit Profile Match). SVG gauge showing 1-10 player ratings. Arc from 210-330deg with gold (1-6), oxblood (7-8), and bright red (9-10) zones. Animated needle sweep. Sizes: sm/md/lg/xl. Use it wherever a player evaluation is displayed.

### Logo Assets

- `/public/logo.png` — Icon mark (tachometer + pitcher). Used in navbar/topbar at 36px height.
- `/public/full.png` — Full wordmark lockup. Used in hero, login screen, footer.
- All logo images get `drop-shadow(0 0 10px rgba(184,151,90,0.35))` filter.

### API Routes

- `POST /api/checkout` — Creates Stripe Checkout session for a plan
- `POST /api/webhooks/stripe` — Handles `checkout.session.completed`, subscription updates/cancellations
- AI routes live under `/api/ai/*` and are server-side only. Rate-limit per user. Log token usage.

### Auth Flow

1. Supabase email/password auth
2. Middleware (`src/middleware.ts`) refreshes sessions; gracefully handles missing Supabase env vars for local dev
3. `(app)/layout.tsx` server-side auth guard redirects to `/login` if no user
4. `/callback` route handles email confirmation redirect

### Stripe Flow

1. Authenticated user POSTs to `/api/checkout` with a `planKey`
2. Server creates/looks up Stripe customer, creates Checkout session
3. On success, Stripe webhook updates `profiles.plan`, `subscription_status`, `access_expires_at`
4. Showcase Package = one-time payment granting 1 year access; all others = subscriptions

### Design System

Colors defined as Tailwind `@theme` tokens in `src/app/globals.css`: `bone`, `ink`, `gold`, `blood`, `green`, `slate`, `blue` (each with variants). Mapped to Tailwind classes like `bg-ink`, `text-gold`, `border-bone-3`, etc. Data and metrics render in JetBrains Mono. Copy rules: no em dashes, no emojis, coach's voice.

Tokens are the only source of styling values. Do not introduce raw hex, one-off font stacks, or
ad hoc shadows; if a value is missing from the token set, add it to `@theme` rather than inlining it.

**Responsive bar: every layout must work at 390px width.** Design mobile-first and let the desktop
layout be the enhancement, not the other way round. The authenticated shell is responsive: the
sidebar collapses and a bottom-tab pattern carries primary navigation at phone width. Native mobile
packaging stays in ROADMAP.md Later; the near-term bar is that the web app at phone width feels
app-like rather than like a desktop page that was shrunk.

**Every page that gets wired to data gets a design pass to this token system in the same session.**
Wiring without the design pass is not done. The college match page is the reference implementation
of the bar: see the Showcase Surface item in ROADMAP.md.

## Data Model Direction

Current schema has `profiles` and `players` only. Target schema (build via new migrations, never edit applied ones):

- `colleges` — the program database. All five levels (D1/D2/D3/NAIA/NJCAA). Fields for division, conference, state, enrollment, academics (SAT/ACT/GPA bands, acceptance rate), cost bands, program notes, roster-cap opt-in status. Seeded from a maintained dataset, not hardcoded arrays.
- `metrics` — player measurables with `verification_status` (self_reported, coach_verified, event_verified), source, and measured_at.
- `evaluations` — the 1-10 Scanzano scale ratings, by evaluator, per tool/category. Feeds the tachometer.
- `matches` — persisted fit results per player x college with score, computed_at, and inputs snapshot for reproducibility.
- `outreach_log` — coach contacts: school, coach, channel, sent_at, response status.
- `checklist_items` — per-player playbook tasks tied to grad year and the recruiting calendar.
- `pitch_sessions` — pitch log data.

All tables get RLS. Players own their rows; scout/org roles get scoped read policies.

Numeric academics and cost fields (SAT/ACT bands, GPA, acceptance rate, cost of
attendance, net price, tuition) are sourced from the College Scorecard API, keyed on
`ipeds_unitid`. The 31 legacy prototype rows are parsed into numerics once and tagged
`data_source = 'legacy_seed'`. Prefer nulls over invented values: a missing band is a
null the UI can disclose, not a guess the match engine will silently score against.

## Match Engine Direction

Replace the legacy if/else heuristic with a transparent weighted scoring model as v1 (athletic projection vs division benchmarks, academic fit vs school bands, major overlap, geography, cost), with headroom for a Bayesian model as v2. Rules:

- Never floor scores to guarantee matches. A bad fit scores badly.
- Output includes the "why": each component's contribution, so the UI can explain the number.
- Always return results across all five levels, sorted by fit, with the honest division recommendation.
- v1 cost scoring uses `net_price_avg`, the average price after aid. When a school is
  public and the player is out-of-state, the UI must disclose that the figure may
  understate their actual cost. Home-state-aware cost scoring is a later phase.
- Levels with thin regional coverage get an explicit honest UI treatment, never padding.
  Do not pad a level's results to make it look populated, and do not hide the level. Say
  plainly what the data shows. NAIA in the Northeast is the canonical case: the copy notes
  that most NAIA baseball is played in the Midwest and South, and that national coverage
  arrives with the full dataset. A level being sparse near a player is information they
  need, not a gap to paper over.

## Legacy Prototype

`diamond-path-v3.html` is the original single-file HTML prototype (~2,350 lines) containing the original UI, a 31-school sample list, match heuristic, rating system, and prompt templates. Treat it as a reference for John's intended UX and evaluation ladder only. Do not port its match heuristic or hardcoded college list as-is; both are superseded by the directions above. It still uses the old "A.I.M." branding.

## Known Gaps (do not paper over)

- Most `(app)` pages are client-side stubs with local state only; they must be wired to Supabase with server components or actions.
- "AI-generated" labels exist in UI with no AI behind them. Either wire the Anthropic API or relabel until it lands.
- No NJCAA/NAIA data or UI anywhere. This is a product-defining gap.
- Package name is still `aim-recruiting`; stray A.I.M. branding assets remain.

## Environment Variables

See `.env.local.example` for required variables: Supabase URL/keys, Stripe keys/price IDs, app URL. Add `ANTHROPIC_API_KEY` (server-side only) when AI routes land.

## Working Agreement

- See ROADMAP.md for phased priorities. Work the current phase unless told otherwise.
- New DB changes are new migration files. Never modify applied migrations.
- `src/types/database.ts` is generated output. Never hand-edit it; regenerate via `npm run db:types` after any migration.
- Prefer server components and server actions for data access; client components only where interactivity requires it.
- Every user-visible number that comes from the match engine must be explainable in the UI.
- Every page wired to data gets a design pass to the token system in the same session.
- Every layout must work at 390px width. Check phone width before calling a screen done.
