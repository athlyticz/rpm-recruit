# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RPM Recruit (Recruit · Profile · Match) is a college baseball recruiting SaaS by Scanzano Baseball / All-American Baseball Talent Showcases, led by Coach John Scanzano. It helps high school baseball players build recruiting profiles, get evaluated on the 1-10 showcase scale, match with D1/D2/D3 programs, and generate professional outreach materials.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom `@theme` tokens in `src/app/globals.css`
- **Auth & Database**: Supabase (auth + Postgres via RLS)
- **Payments**: Stripe (one-time + subscription via Checkout)
- **Fonts**: Cormorant Garamond (display), Barlow (body), Barlow Condensed (labels/buttons), JetBrains Mono (data)

## Commands

```bash
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run lint           # ESLint
npm run type-check     # TypeScript strict check
npm run stripe:listen  # Forward Stripe webhooks to localhost
```

## Architecture

### Route Groups

- `(marketing)` — Public pages: landing (`/`), `/pricing`, `/about`, `/contact`. Uses `MarketingHeader` + `MarketingFooter` layout.
- `(auth)` — `/login`, `/signup`, `/callback`. Diamond-themed auth layout with full.png logo.
- `(app)` — Authenticated app behind Supabase auth guard. Grid layout: topbar (56px) + sidebar (236px) + main content.

### App Pages (authenticated)

`/dashboard`, `/profile`, `/athletic`, `/academics`, `/scores`, `/college-match`, `/letter-builder`, `/bio-generator`, `/cost-tracker`, `/checklist`, `/pitch-log`, `/settings`

### Key Directories

- `src/lib/supabase/` — Client, server, and middleware Supabase helpers
- `src/lib/stripe.ts` — Server-side Stripe instance
- `src/config/pricing.ts` — Plan definitions (Showcase $1,499, Monthly $49, Scout $99, Org $299)
- `src/types/database.ts` — Supabase typed schema (`profiles`, `players` tables)
- `src/components/ui/` — Shared UI: logo (`logo.tsx`), tachometer gauge (`tachometer.tsx`)
- `src/components/marketing/` — Header, footer, tachometer showcase section
- `src/components/app/` — Sidebar, topbar, page-header for authenticated shell
- `supabase/migrations/` — Database schema with RLS policies and auth trigger

### Tachometer Component

`src/components/ui/tachometer.tsx` — Signature UI element. SVG-based gauge showing 1-10 player ratings. Arc from 210-330deg with gold (1-6), oxblood (7-8), and bright red (9-10) zones. Animated needle sweep. Sizes: sm/md/lg/xl. Used on dashboard, profile, scores page, college match cards, and marketing homepage.

### Logo Assets

- `/public/logo.png` — Icon mark (tachometer + pitcher). Used in navbar/topbar at 36px height.
- `/public/full.png` — Full wordmark lockup. Used in hero, login screen, footer.
- All logo images get `drop-shadow(0 0 10px rgba(184,151,90,0.35))` filter.

### API Routes

- `POST /api/checkout` — Creates Stripe Checkout session for a plan
- `POST /api/webhooks/stripe` — Handles `checkout.session.completed`, subscription updates/cancellations

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

Colors defined as Tailwind `@theme` tokens: `bone`, `ink`, `gold`, `blood`, `green`, `slate`, `blue` (each with variants). Mapped to Tailwind classes like `bg-ink`, `text-gold`, `border-bone-3`, etc.

## Legacy Prototype

`diamond-path-v3.html` is the original single-file HTML prototype (~2350 lines). It contains the complete UI, college database (~30 schools), match engine logic, rating bar system, and AI prompt templates that should be ported into the Next.js app page by page. Reference it for exact UI patterns, evaluation ladder, and business logic. Note: this file still uses the old "A.I.M." branding.

## Environment Variables

See `.env.local.example` for required variables: Supabase URL/keys, Stripe keys/price IDs, app URL.
