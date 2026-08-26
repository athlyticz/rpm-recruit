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

### Canonical Demo Fixture

`npm run db:seed:demo -- <email>` seeds one coherent player who exercises every
visualization at once. Run it after `db:seed` and `db:seed:ladder`.

A right-handed pitcher, deliberately: fastball velocity is the metric with
published scale bands, which is what makes the metric-driven what-if lever
demonstrable. A shortstop cannot show that lever at all, so a shortstop fixture
silently hides the best thing in the product.

It produces a complete player row, four velocity measurements climbing 79 to 87
across all three verification levels, sixty and bat speed histories, and self
plus coach evaluations on the full pitcher skill set so the radar draws both
polygons. It is idempotent: re-running replaces that player's metrics and
evaluations rather than stacking duplicates.

Use this fixture for demos and for verifying chart work. Verifying one chart
against a shortstop and another against a pitcher, which is what happened
before this existed, means no single state was ever checked end to end.

### Visualization Colour Roles

Charts encode with the `--viz-*` role tokens in `globals.css`, never with
palette colours picked at the call site. Six views previously chose locally and
gold ended up meaning a division, a component, a verification level, a
projection, a trend line and the brand all at once.

**Chrome and data are separate systems.** Gold remains the brand accent in
chrome: navigation, calls to action, the gauge face. Inside a data encoding,
**gold means verification and nothing else**, because credibility is the thing
this product is actually selling. If a chart element is gold, it is telling you
who stood behind the number.

| Role | Tokens | Meaning |
|---|---|---|
| Level identity | `--viz-level-d1` … `-njcaa` | Which division a program plays in. Five categorical hues, none gold. |
| Verification | `--viz-verify-self/coach/event` | Who confirmed a number. Hollow slate, gold, solid ink. |
| Component contribution | `--viz-component-1` … `-5` | Parts of one score. A sequential warm-ink ramp, so the eye reads magnitude without competing with level hues. |
| Reference | `--viz-reference`, `--viz-reference-strong` | Thresholds and scale bands. Always recessive; strong is reserved for the player's own marker. |
| Fit quality | `--viz-fit-strong` … `-longshot` | How good a match is. One good-to-bad ramp; avoids amber (verification) and the saturated level hues. |
| Projection | `--viz-projection-line` | A mode, not a category, so it carries no hue: dashed outline plus an explicit badge. |

Adding a chart means picking a role, not picking a colour. If a new encoding
does not fit a role, add the role here first.

Every role token is contrast-checked by `npm run check:contrast`, which is part
of the standing pass. Graphical objects are held to 3:1 and chart text to
4.5:1, because axis labels run as small as 8px. Add a token, add its check.

One design decision came out of that audit rather than out of taste: out-of-range
dots are drawn hollow rather than faded. Fading to 42% put several level hues
under 3:1 and no single opacity fixed all of them, so the outline treatment
keeps every dot at full strength while still reading as "not yet".

### Verification Policy: controls are tested by gesture

An interactive control is verified by performing the gesture a person performs,
not by dispatching the events a test finds convenient.

This is not a preference. The what-if sliders passed every check for three
sessions and were broken the entire time. The checks drove them with a
synthetic `input` event followed by an explicit `pointerup`, which confirmed the
specified behaviour exactly and never once performed a drag. A real drag showed
the thumb springing back on release, which reads as a dead control. The
specification was wrong and the tests were built to agree with it.

**Origin story, worth keeping.** The policy found a real bug on its first run.
Dragging the fastball velocity lever *down* from 87 to 77 reported "77 mph = 10":
a lower measurement producing a higher score, and a score the player had not
earned. Published ladders have gaps (75-77, then 78-80), the slider was landing
in them, and the fallback sent in-gap values to whichever end of the whole scale
was nearer. It had shipped, it was live, and every automated check passed
because every check drove the slider with synthetic events instead of dragging
it. A wrong-direction score on the demo centrepiece was only ever going to be
found by a thumb.

The same run also caught me reporting a navigation bug that did not exist: I had
clicked coordinates measured before the page scrolled. Both halves are the
lesson. Gesture verification finds what event dispatch cannot, and coordinates
measured in one call are stale by the next.

- Sliders are dragged, not `setValue`d.
- Buttons and links are clicked at coordinates, not `.click()`ed, whenever the
  result is in doubt.
- Anything with pointer handlers is exercised with a full down, move, up
  sequence.

**Demo-critical path.** Any session that touches it ends with a full
human-gesture run on the deployed build:

1. log in
2. land on the dashboard
3. open college match
4. drag a what-if lever and confirm the projection holds after release
5. press Back to reality and confirm it clears

If the deployment is not live yet, say so rather than reporting the local run as
the confirmation.

### Motion Policy: geometry moves, digits cut

The rule that kept getting re-litigated case by case, written down.

**Motion is allowed on geometry. Motion is banned on the number itself.**

A dot may travel to its new position on the needle curve. A needle may sweep.
A bar may grow. A polygon may morph. These are pictures, and a picture caught
mid-transition is still an honest picture of something in motion.

A numeral may not animate. It cuts, instantly, to its true value. A number
caught mid-flight is a false number, and this product's entire claim is that
every figure traces to a database row. This is not a stylistic preference: a
count-up on the fit score was built and removed after it froze mid-animation
and left 74 on screen for a program that scored 80.

The practical split, for a value that changes:

- The dot slides, the label beside it updates on the same frame it changes.
- The gauge needle sweeps, the readout in its centre cuts.
- The meter animates its width, the figure above it cuts.

Corollary, learned the hard way twice: **motion may never gate content.**
Entrance animations animate transform only, never opacity with a fill mode
that can strand an element invisible if the animation does not run. If a
motion moment is decorative rather than informative, and it fails
verification, delete it rather than patch it.

Everything above is additionally subject to `prefers-reduced-motion`, which
gets instant states with no exceptions.

### Route Transitions (read this if a link misbehaves)

`src/components/app/view-transitions.tsx` intercepts same-origin anchor clicks
in the **capture phase** and runs `router.push` inside
`document.startViewTransition`. Capture is required, not stylistic: Next's
`Link` calls `preventDefault` on the anchor itself, so a bubble-phase listener
always arrives after the navigation has been claimed.

That means this component sees every internal link click in the authenticated
shell before the framework does. **If a link in `(app)` behaves strangely,
suspect this first.**

Kill switch: set `NEXT_PUBLIC_ROUTE_TRANSITIONS=off` to disable every
interception without touching a single call site. Navigation falls back to
Next's own handling; the only loss is the cross-fade and the gauge morph.
Prefer flipping the flag over debugging a link in place.

Note that `experimental.viewTransition` in `next.config.ts` is deliberately not
enabled: it only works on the experimental React channel, and this project runs
React stable, where it is a silent no-op.

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
- Every number on screen must multiply out. Component scores are rounded before they are
  weighted, and the weight the UI prints is the renormalised one actually applied, so a
  player reading "61 x 40% weighting = 24.4 points" can check it on a calculator. Hidden
  precision anywhere in the chain is precision we cannot defend, same rule as the total.
- The binding constraint named in the breakdown headline is the component costing the most
  points, which is weight times shortfall, not the lowest raw score. A 59 on geography at a
  10% weight costs four points; a 61 on athletic projection at 40% costs sixteen. The gate
  is the second one.

## Legacy Prototype

`diamond-path-v3.html` is the original single-file HTML prototype (~2,350 lines) containing the original UI, a 31-school sample list, match heuristic, rating system, and prompt templates. Treat it as a reference for John's intended UX and evaluation ladder only. Do not port its match heuristic or hardcoded college list as-is; both are superseded by the directions above. It still uses the old "A.I.M." branding.

## Known Gaps (do not paper over)

- Most `(app)` pages are client-side stubs with local state only; they must be wired to Supabase with server components or actions.
- "AI-generated" labels exist in UI with no AI behind them. Either wire the Anthropic API or relabel until it lands.
- No NJCAA/NAIA data or UI anywhere. This is a product-defining gap.
- Package name is still `aim-recruiting`; stray A.I.M. branding assets remain.

## Environment Variables

See `.env.local.example` for required variables: Supabase URL/keys, Stripe keys/price IDs, app URL. Add `ANTHROPIC_API_KEY` (server-side only) when AI routes land.

### Cached Reference Data

`getColleges` is cached for an hour behind the `colleges` tag, because it is
reference data identical for every user and was the largest repeated query in
the app. Anything user-specific must never be cached this way.

Seeding invalidates it. The seed scripts POST to `/api/revalidate` with
`REVALIDATE_SECRET`, since `revalidateTag` only works inside the Next runtime
and the seeders are standalone Node processes. Without those env vars the
scripts log a skip rather than failing, because seeding a local database with
no app running is normal.

### players.overall_score is enforced by the database

It is a denormalised cache of `evaluations`, and migration 00005 puts a trigger
on that table so any insert, update or delete recomputes it. Previously the
rule lived in one server action, which held only while nothing else wrote
evaluations; Phase 2 AI routes and Phase 4 scout entry both will. A writer that
forgot would leave every gauge, projection and match score quietly wrong with
no error anywhere.

Do not recompute it by hand in new code. Write the evaluation and let the
trigger do it.

## Working Agreement

- See ROADMAP.md for phased priorities. Work the current phase unless told otherwise.
- New DB changes are new migration files. Never modify applied migrations.
- `src/types/database.ts` is generated output. Never hand-edit it; regenerate via `npm run db:types` after any migration.
- Prefer server components and server actions for data access; client components only where interactivity requires it.
- Every user-visible number that comes from the match engine must be explainable in the UI.
- Every page wired to data gets a design pass to the token system in the same session.
- Every layout must work at 390px width, and be reviewed at 1280px. Charts are capped rather than stretched: an SVG at width 100% scales its own text with the viewport.
- Run `npm run check:contrast` when touching chart colour.
- Verification happens against the deployed app, not localhost. The demo runs on the deployed build, so that is what gets measured.
