-- The six remaining tables from the CLAUDE.md Data Model Direction, plus three
-- lookup tables that the metrics and evaluations design depends on.
--
-- Two principles drive the constraints here:
--
--   Verified beats self-reported. A player may record their own measurables and
--   their own 1-10 self-ratings, but cannot write a coach_verified or
--   event_verified metric, and cannot create or alter anyone else's evaluation
--   of them. That is enforced in RLS, not just in the UI.
--
--   Every number is explainable. matches stores its component breakdown and an
--   input snapshot, and skill_scale_bands lets a verified measurable derive its
--   own 1-10 score with the band shown to the player.
--
-- Every table gets RLS and grants. Policies decide which rows a role sees;
-- grants decide whether it may touch the table at all. Missing grants is what
-- broke profiles and players until migration 00003.

create type verification_status as enum ('self_reported', 'coach_verified', 'event_verified');
create type evaluator_role as enum ('self', 'coach', 'scout', 'event');

-- ---------------------------------------------------------------------------
-- Lookups: reference data, authenticated reads, service role writes.
-- ---------------------------------------------------------------------------

-- Measurable definitions. This is a table rather than an enum because
-- lower_is_better carries scoring semantics the match engine needs: a 60-yard
-- dash and a pop time score inverted, bat speed and vertical leap do not.
create table public.metric_types (
  key text primary key,
  label text not null,
  unit text not null,
  lower_is_better boolean not null,
  category text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The evaluation ladder, moved out of scores/page.tsx into data. It is Coach
-- Scanzano's IP and it will change; changing it should not be a code deploy.
create table public.skill_definitions (
  id uuid primary key default gen_random_uuid(),
  position text not null,
  skill_key text not null,
  label text not null,
  group_heading text not null,
  sort_order integer not null default 0,
  -- When set, this skill has a measurable behind it (fastball velocity, pop
  -- time) and its 1-10 score can be derived from a metric via the bands below.
  scale_metric_type text references public.metric_types (key),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (position, skill_key)
);

-- The bridge between a raw measurable and the 1-10 scale, so the UI can say
-- "your 84 mph is an 8 on this scale" instead of asserting a number.
create table public.skill_scale_bands (
  id uuid primary key default gen_random_uuid(),
  skill_definition_id uuid not null references public.skill_definitions (id) on delete cascade,
  score smallint not null check (score between 1 and 10),
  -- Open-ended at both extremes: "<= 64" has no min, "88-90+" has no max.
  min_value numeric(8, 3),
  max_value numeric(8, 3),
  created_at timestamptz not null default now(),
  unique (skill_definition_id, score),
  constraint skill_scale_bands_bounded check (min_value is not null or max_value is not null),
  constraint skill_scale_bands_ordered check (
    min_value is null or max_value is null or min_value <= max_value
  )
);

alter table public.metric_types enable row level security;
alter table public.skill_definitions enable row level security;
alter table public.skill_scale_bands enable row level security;

create policy "Authenticated users can read metric types"
  on public.metric_types for select to authenticated using (true);
create policy "Authenticated users can read skill definitions"
  on public.skill_definitions for select to authenticated using (true);
create policy "Authenticated users can read skill scale bands"
  on public.skill_scale_bands for select to authenticated using (true);

grant select on public.metric_types to authenticated;
grant select on public.skill_definitions to authenticated;
grant select on public.skill_scale_bands to authenticated;
grant all on public.metric_types to service_role;
grant all on public.skill_definitions to service_role;
grant all on public.skill_scale_bands to service_role;

-- ---------------------------------------------------------------------------
-- Player-owned tables.
-- ---------------------------------------------------------------------------

-- Helper: does the given player row belong to the calling user?
create or replace function public.owns_player(target_player_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.players p
    where p.id = target_player_id
      and p.profile_id = (select auth.uid())
  );
$$;

-- Measurement events, append-only. One row per measurement, not one per
-- player: a 60 time improving across two years is the "what moves you up a
-- tier" story, and an overwritten field cannot tell it.
create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  metric_type text not null references public.metric_types (key),
  value numeric(8, 3) not null,
  verification_status verification_status not null default 'self_reported',
  source text,
  verified_by uuid references public.profiles (id),
  measured_at date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A self-reported measurement has no verifier by definition.
  constraint metrics_verifier_matches_status check (
    (verification_status = 'self_reported' and verified_by is null)
    or verification_status <> 'self_reported'
  )
);

create index metrics_player_type_measured_idx
  on public.metrics (player_id, metric_type, measured_at desc);

-- 1-10 Scanzano scale ratings. A rating comes from either a person or a
-- measurable, never both and never neither.
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  skill_definition_id uuid not null references public.skill_definitions (id),
  score smallint not null check (score between 1 and 10),
  evaluator_id uuid references public.profiles (id),
  evaluator_role evaluator_role not null,
  derived_from_metric_id uuid references public.metrics (id) on delete set null,
  evaluated_at date not null,
  session_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evaluations_person_or_metric check (
    (derived_from_metric_id is not null and evaluator_id is null)
    or (derived_from_metric_id is null and evaluator_id is not null)
  )
);

create index evaluations_player_skill_evaluated_idx
  on public.evaluations (player_id, skill_definition_id, evaluated_at desc);

-- Persisted fit results. components is the "why" breakdown the UI renders;
-- inputs is the snapshot that makes a past score reproducible after the
-- player's profile or the engine changes.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  college_id uuid not null references public.colleges (id) on delete cascade,
  score numeric(5, 2) not null,
  components jsonb not null default '{}',
  inputs jsonb not null default '{}',
  engine_version text not null,
  computed_at timestamptz not null default now()
);

create index matches_player_computed_idx on public.matches (player_id, computed_at desc);

-- Coach contacts. college_id is nullable with a school_name fallback so a
-- player can log outreach to a program that is not in the database yet.
create table public.outreach_log (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  college_id uuid references public.colleges (id) on delete set null,
  school_name text,
  coach_name text,
  coach_email text,
  channel text not null check (
    channel in ('email', 'phone', 'letter', 'camp', 'social_dm', 'in_person', 'other')
  ),
  sent_at date not null,
  response_status text not null default 'none' check (
    response_status in ('none', 'replied', 'interested', 'not_interested', 'offer')
  ),
  responded_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outreach_log_has_school check (college_id is not null or school_name is not null)
);

create index outreach_log_player_sent_idx on public.outreach_log (player_id, sent_at desc);

-- Playbook tasks, tied to grad year and the recruiting calendar. template_key
-- links a row back to the playbook template it was seeded from.
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  template_key text,
  title text not null,
  description text,
  category text,
  grad_year integer,
  due_date date,
  sort_order integer not null default 0,
  is_complete boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checklist_items_completed_at_matches check (
    (is_complete and completed_at is not null) or (not is_complete and completed_at is null)
  )
);

create index checklist_items_player_idx on public.checklist_items (player_id, sort_order);

create table public.pitch_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  session_date date not null,
  opponent text,
  innings_pitched numeric(3, 1),
  pitches_thrown integer,
  strikes integer,
  balls integer,
  hits integer,
  runs integer,
  earned_runs integer,
  walks integer,
  strikeouts integer,
  max_velocity numeric(4, 1),
  avg_velocity numeric(4, 1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pitch_sessions_player_date_idx on public.pitch_sessions (player_id, session_date desc);

alter table public.metrics enable row level security;
alter table public.evaluations enable row level security;
alter table public.matches enable row level security;
alter table public.outreach_log enable row level security;
alter table public.checklist_items enable row level security;
alter table public.pitch_sessions enable row level security;

-- metrics: read own. Insert and update own, but only as self_reported. A
-- player cannot promote their own numbers to coach_verified or event_verified;
-- that write path is service role, driven by a coach or an event feed.
create policy "Players read own metrics"
  on public.metrics for select to authenticated
  using (public.owns_player(player_id));

create policy "Players insert own self-reported metrics"
  on public.metrics for insert to authenticated
  with check (public.owns_player(player_id) and verification_status = 'self_reported');

create policy "Players update own self-reported metrics"
  on public.metrics for update to authenticated
  using (public.owns_player(player_id) and verification_status = 'self_reported')
  with check (public.owns_player(player_id) and verification_status = 'self_reported');

create policy "Players delete own self-reported metrics"
  on public.metrics for delete to authenticated
  using (public.owns_player(player_id) and verification_status = 'self_reported');

-- evaluations: read every evaluation of yourself, including a coach's. Write
-- only your own self-ratings. A player cannot author, edit, or delete someone
-- else's evaluation of them.
create policy "Players read own evaluations"
  on public.evaluations for select to authenticated
  using (public.owns_player(player_id));

create policy "Players insert own self evaluations"
  on public.evaluations for insert to authenticated
  with check (
    public.owns_player(player_id)
    and evaluator_role = 'self'
    and evaluator_id = (select auth.uid())
  );

create policy "Players update own self evaluations"
  on public.evaluations for update to authenticated
  using (
    public.owns_player(player_id)
    and evaluator_role = 'self'
    and evaluator_id = (select auth.uid())
  )
  with check (
    public.owns_player(player_id)
    and evaluator_role = 'self'
    and evaluator_id = (select auth.uid())
  );

create policy "Players delete own self evaluations"
  on public.evaluations for delete to authenticated
  using (
    public.owns_player(player_id)
    and evaluator_role = 'self'
    and evaluator_id = (select auth.uid())
  );

-- matches: computed server-side by the engine. Players read, never write.
create policy "Players read own matches"
  on public.matches for select to authenticated
  using (public.owns_player(player_id));

-- outreach_log, checklist_items, pitch_sessions: fully player-owned.
create policy "Players manage own outreach log"
  on public.outreach_log for all to authenticated
  using (public.owns_player(player_id))
  with check (public.owns_player(player_id));

create policy "Players manage own checklist items"
  on public.checklist_items for all to authenticated
  using (public.owns_player(player_id))
  with check (public.owns_player(player_id));

create policy "Players manage own pitch sessions"
  on public.pitch_sessions for all to authenticated
  using (public.owns_player(player_id))
  with check (public.owns_player(player_id));

-- Scout and org read policies are deliberately absent. Scoping scout access to
-- players is a privacy decision about minors' data that needs an explicit
-- player-to-scout link table, and it lands in Phase 4 with the scout UI. Until
-- then these tables fail closed for every role except the owning player.

grant select, insert, update, delete on public.metrics to authenticated;
grant select, insert, update, delete on public.evaluations to authenticated;
grant select on public.matches to authenticated;
grant select, insert, update, delete on public.outreach_log to authenticated;
grant select, insert, update, delete on public.checklist_items to authenticated;
grant select, insert, update, delete on public.pitch_sessions to authenticated;

grant all on public.metrics to service_role;
grant all on public.evaluations to service_role;
grant all on public.matches to service_role;
grant all on public.outreach_log to service_role;
grant all on public.checklist_items to service_role;
grant all on public.pitch_sessions to service_role;

create trigger metric_types_updated_at before update on public.metric_types
  for each row execute function public.update_updated_at();
create trigger skill_definitions_updated_at before update on public.skill_definitions
  for each row execute function public.update_updated_at();
create trigger metrics_updated_at before update on public.metrics
  for each row execute function public.update_updated_at();
create trigger evaluations_updated_at before update on public.evaluations
  for each row execute function public.update_updated_at();
create trigger outreach_log_updated_at before update on public.outreach_log
  for each row execute function public.update_updated_at();
create trigger checklist_items_updated_at before update on public.checklist_items
  for each row execute function public.update_updated_at();
create trigger pitch_sessions_updated_at before update on public.pitch_sessions
  for each row execute function public.update_updated_at();

-- ---------------------------------------------------------------------------
-- players.ratings is superseded by the evaluations table.
--
-- Dropped rather than deprecated: an audit found zero readers. The only
-- "ratings" references in the app were unrelated local React state in
-- scores/page.tsx and a marketing copy string, and no query against players
-- existed anywhere. It was an empty vestige, not data.
--
-- players.overall_score stays as a denormalized cache, recomputed on
-- evaluation write, because the dashboard and match engine read it constantly.
-- ---------------------------------------------------------------------------
alter table public.players drop column ratings;
