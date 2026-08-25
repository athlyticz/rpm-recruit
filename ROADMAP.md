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

- [ ] Migration 00002: `colleges` table per CLAUDE.md Data Model Direction. Include `division` enum covering D1, D2, D3, NAIA, NJCAA.
- [ ] Migration 00003: `metrics`, `evaluations`, `matches`, `outreach_log`, `checklist_items`, `pitch_sessions` with RLS.
- [ ] Seed script: load the 31 legacy schools as a starter set, tagged `data_source = 'legacy_seed'`, then extend with NJCAA Region 19 and NAIA programs relevant to the NJ/PA/DE launch market.
- [ ] Wire `/profile`, `/athletic`, `/academics` to Supabase (server actions, optimistic UI). Player edits persist.
- [ ] Wire `/scores` and `/pitch-log` to `metrics` and `pitch_sessions` with verification_status surfaced in the UI.
- [ ] Wire `/checklist` to `checklist_items`, seeded by grad year from a playbook template table.
- [ ] Wire checkout. `/api/checkout` is never called from anywhere in the app; the pricing CTAs are plain links to `/signup`, so no user can start a purchase. Add the client call and the plan-selection path.
- [ ] Entitlement gating. Nothing anywhere reads `plan`, `subscription_status`, or `access_expires_at`, so a free signup and a $1,499 purchaser get identical access. Add a server-side entitlement check and gate paid surfaces on it.
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
- PBR / Perfect Game event data import.
- Native mobile packaging (Expo or capacitor decision after PWA traction).
- Full national college dataset pipeline with maintenance cadence (roster-cap opt-in status changes yearly).
