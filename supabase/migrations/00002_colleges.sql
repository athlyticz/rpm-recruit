-- Colleges: the program database that the match engine scores against.
-- Reference data, not player-owned: readable by any authenticated user,
-- writable only by the service role that seeds and maintains it.

create type college_division as enum ('d1', 'd2', 'd3', 'naia', 'njcaa');

create table public.colleges (
  id uuid primary key default gen_random_uuid(),

  -- Identity and linkage
  name text not null,
  short_name text,
  slug text not null unique,
  ipeds_unitid integer unique,
  college_board_slug text,
  website text,
  athletics_url text,

  -- Classification
  division college_division not null,
  division_detail text check (
    division_detail in ('NJCAA D-I', 'NJCAA D-II', 'NJCAA D-III', 'NAIA')
  ),
  conference text,
  roster_cap_optin boolean,
  roster_cap integer,
  is_public boolean,
  enrollment integer,

  -- Geography
  city text,
  state text not null,
  region text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  campus_setting text check (
    campus_setting in ('urban', 'suburban', 'rural', 'college-town')
  ),

  -- Academics. Sourced from the College Scorecard API keyed on ipeds_unitid.
  -- Null means unknown, never a guess.
  sat_25 integer,
  sat_75 integer,
  act_25 integer,
  act_75 integer,
  gpa_avg numeric(3, 2),
  acceptance_rate numeric(5, 4),
  majors text[] not null default '{}',

  -- Cost, whole dollars. Match engine v1 scores on net_price_avg.
  cost_of_attendance integer,
  net_price_avg integer,
  tuition_in_state integer,
  tuition_out_of_state integer,

  -- Content and maintenance
  program_notes text,
  data_source text not null default 'legacy_seed',
  source_updated_at timestamptz,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Bands must be ordered, and rates must be rates.
  constraint colleges_sat_band_ordered check (
    sat_25 is null or sat_75 is null or sat_25 <= sat_75
  ),
  constraint colleges_act_band_ordered check (
    act_25 is null or act_75 is null or act_25 <= act_75
  ),
  constraint colleges_acceptance_rate_range check (
    acceptance_rate is null or (acceptance_rate >= 0 and acceptance_rate <= 1)
  )
);

alter table public.colleges enable row level security;

-- Any authenticated user can read the active program database.
create policy "Authenticated users can read colleges"
  on public.colleges for select
  to authenticated
  using (true);

-- No insert/update/delete policies: writes are service-role only, which
-- bypasses RLS. Seeding and maintenance run through that path.

-- Table privileges. RLS decides which rows a role sees; grants decide whether
-- the role may touch the table at all. Without these, PostgREST returns
-- "permission denied for table colleges" to every caller, policy or no policy.
grant select on public.colleges to authenticated;
grant all on public.colleges to service_role;
-- anon is deliberately omitted: the program database sits behind auth.

create index colleges_division_idx on public.colleges (division);
create index colleges_state_idx on public.colleges (state);
create index colleges_majors_idx on public.colleges using gin (majors);

create trigger colleges_updated_at
  before update on public.colleges
  for each row execute function public.update_updated_at();
