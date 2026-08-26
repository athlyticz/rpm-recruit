# RPM Recruit Roadmap

Phases are ordered by what makes the $1,499 Showcase Package honest to sell. Each item is scoped so a single Claude Code session can complete it with type-check and lint passing.

## Phase 0: Foundation and truth in the codebase

Nothing below this line can meet the "type-check and lint passing" bar until the build compiles. Item (a) comes first.

- [ ] **(a) Fix the build.** `npm run build` currently fails with 17 TypeScript errors on a clean checkout.
  - Bump `@supabase/ssr` to 0.7.x. The pinned 0.5.2 resolves against `@supabase/supabase-js` 2.99.1 and pipes the schema generic through its own stale `GenericSchema`, so every query types as `never`. This breaks `api/checkout/route.ts:40` and all five webhook `.update()` calls, plus 7 implicit-any errors in the cookie callbacks.
  - Regenerate `src/types/database.ts` via the Supabase CLI rather than maintaining it by hand. Hand-writing it is how this drift recurs, and Phase 1 adds seven tables.
  - Fix the Stripe API version string in `src/lib/stripe.ts`. It declares `"2025-01-27.acacia"`; the installed `stripe@17.7.0` accepts only `"2025-02-24.acacia"`.
- [ ] **(b) Close the auth fail-open.** `(app)/layout.tsx` and `lib/supabase/middleware.ts` both bypass the auth guard entirely when the Supabase env vars are missing, so one misnamed env var in the deploy environment silently opens the whole app instead of erroring. Gate the bypass on `NODE_ENV !== "production"`.
- [ ] **(c) Relabel every AI claim** until Phase 2 lands, so no false AI claims ship. Seven sites: `bio-generator/page.tsx` (title, textarea placeholder, "What the AI will use"), `letter-builder/page.tsx:60`, `dashboard/page.tsx:54`, `(marketing)/page.tsx:115,120`, `config/pricing.ts:10`, `components/app/sidebar.tsx:30`, `components/marketing/footer.tsx:52`. The `pricing.ts` line is the sharp end: it lists a feature of a $1,499 product that does not exist.
- [ ] **(d) Rename cleanup.** Package `aim-recruiting` to `rpm-recruit`; remove `aim-recruiting-thumbnail.svg` and any remaining A.I.M. branding references; delete the dead `APP_ROUTES` constant at `src/middleware.ts:4`, duplicated from `lib/supabase/middleware.ts`.
- [ ] **(e) Add `ANTHROPIC_API_KEY`** to `.env.local.example` with a server-side-only comment.

## Phase 1: Real data layer (make the app remember)

- [x] Migration 00002: `colleges` table per CLAUDE.md Data Model Direction. Include `division` enum covering D1, D2, D3, NAIA, NJCAA.
- [x] Migration 00003: grant table privileges on `profiles` and `players`. Migration 00001 created
  them with RLS policies but no grants, so PostgREST denies every caller regardless of policy.
- [x] Seed script: load the 31 legacy schools as a starter set, tagged `data_source = 'legacy_seed'`, then extend with NJCAA Region 19 and NAIA programs relevant to the NJ/PA/DE launch market.
- [x] Migration 00004: `metrics`, `evaluations`, `matches`, `outreach_log`, `checklist_items`, `pitch_sessions` with RLS and grants.

### Showcase Surface (next after 00004)

The college match page is the product's flagship screen and the reference implementation of the
design bar. Everything wired after it is held to the same standard.

- [x] Responsive app shell first, because a mobile-first page cannot live inside a fixed desktop
  grid. `(app)/layout.tsx` is currently `grid-cols-[236px_1fr]` with no breakpoints; the whole app
  carries 21 breakpoint utilities and all of them are on marketing pages. Collapsible sidebar at
  tablet, bottom-tab navigation at phone width, safe-area insets respected.
- [x] Rebuild `/college-match` to full design ambition: mobile-first from 390px up, real seeded
  college data rather than the hardcoded six, the tachometer as the visual centerpiece, and results
  across all five levels.
- [x] Honest thin-coverage treatment for NAIA per the CLAUDE.md Match Engine Direction rule. No
  padding, no hiding.
- [x] Component-level "why this score" breakdown on every result, so the number is explainable.
  The engine behind it stays the interim heuristic until Phase 3; the breakdown UI is built now and
  the real engine slots into it.
- [x] Bar to clear: this one screen would not embarrass a premium consumer app. See the delivery
  self-critique; the screen clears it on structure and honesty, less so on typographic finish.

- [ ] College Scorecard enrichment script (separate from the seed): backfill numeric academics
  and cost fields keyed on `ipeds_unitid`. The 31 legacy rows carry no unitid, so this needs a
  name-plus-state matching step with manual review of ambiguous matches before it can key on them.
- [ ] Wire `/profile`, `/athletic`, `/academics` to Supabase (server actions, optimistic UI). Player edits persist.
- [~] Wire `/scores` and `/pitch-log`. `/scores` is wired to `evaluations` with the overall_score
  cache written in the same server action. `/pitch-log` is not started, and `verification_status`
  is surfaced on the dashboard credibility ladder but not yet on individual metrics.
- [ ] Wire `/checklist` to `checklist_items`, seeded by grad year from a playbook template table.
- [ ] Wire checkout. `/api/checkout` is never called from anywhere in the app; the pricing CTAs are plain links to `/signup`, so no user can start a purchase. Add the client call and the plan-selection path.
- [ ] Entitlement gating. Nothing anywhere reads `plan`, `subscription_status`, or `access_expires_at`, so a free signup and a $1,499 purchaser get identical access. Add a server-side entitlement check and gate paid surfaces on it.
- [ ] Custom SMTP for auth emails (launch blocker). Supabase's built-in sender is
  rate-limited and not deliverable at volume; it will not survive real signups.
  Email confirmation already cost us a day of "empty data" debugging when
  confirmation links pointed at localhost, so this path is load-bearing.
- [ ] Set `access_expires_at` in the subscription branch of the Stripe webhook. `checkout.session.completed` with `session.mode === "subscription"` currently leaves it null, so subscribers would have no expiry once gating exists. Carry it forward from the period end on `customer.subscription.updated`.

## Phase 2: Real AI (earn the label)

- [ ] `POST /api/ai/letter` — Anthropic API route generating coach outreach letters from player data + target school + tone. Streaming response. Per-user rate limit.
- [ ] `POST /api/ai/bio` — profile bio generation with the same guardrails.
- [ ] `POST /api/ai/fit-explainer` — natural-language explanation of a match score from its component breakdown.
- [ ] Restore "AI" labels in UI now that they are true. Log token usage per user.

## Phase 3: Match engine v1 (the honest one)

- [ ] `src/lib/match/engine.ts` — transparent weighted scoring per CLAUDE.md Match Engine Direction. Pure function, unit-tested with fixture players at each tier.
- [ ] Persist runs to `matches` with input snapshots.
- [ ] Rebuild `/college-match` on real data: all five levels, component breakdown visible, tachometer for overall projection, honest division recommendation.
- [ ] Gap view: "what moves you up a tier" derived from the score components.

## Phase 4: Scout and org mode (John's side of the table)

- [ ] Scout role UI: evaluation entry on the 1-10 scale per tool, feeding `evaluations` and the tachometer.
- [ ] Org dashboard: roster of players, bulk evaluation, pipeline view.
- [ ] PDF export of the player one-pager (profile, verified metrics, tachometer, fit summary) for the Showcase Package deliverable.

## Phase 5: Growth surface

- [ ] Rebuild marketing landing page around the tachometer identity and honest-fit positioning.
- [ ] Public shareable profile route (`/p/[slug]`) with QR code, read-only, coach-facing.
- [ ] PWA manifest and installability pass (precursor to app-store presence).

## Later / parked

- Bayesian match engine v2 (hierarchical model, uncertainty intervals).
- Home-state-aware cost scoring: score public schools against `tuition_in_state` vs
  `tuition_out_of_state` based on the player's home state, replacing the v1 `net_price_avg`
  approximation and its out-of-state UI disclosure.
- PBR / Perfect Game event data import.
- Native mobile packaging (Expo or capacitor decision after PWA traction).
- Full national college dataset pipeline with maintenance cadence (roster-cap opt-in status
  changes yearly). Includes full NAIA membership: the launch seed carries only the two NAIA
  programs in the NJ/PA/DE footprint, both in Pittsburgh, so national coverage is what makes
  the level genuinely usable.
