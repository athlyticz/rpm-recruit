-- Leads: the launch funnel.
--
-- The product sells through a phone call from Coach Scanzano's team, not
-- through a checkout page. Stripe stays wired and dormant; this table is what
-- the public "Start Today" form writes to, and what John's team works from.
--
-- Trust model: a lead is written by a visitor who is not signed in, so anon
-- must be able to insert and must never be able to read. Every row here is a
-- minor's name alongside a parent's phone number and email, which is the most
-- sensitive data this product holds. Insert-only for the public, readable
-- only by the service role.

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  -- The player
  player_first_name text not null,
  player_last_name text not null,
  grad_year integer not null,
  position text not null,
  current_level text not null,

  -- The parent or guardian, who is who the team actually calls
  parent_name text not null,
  parent_email text not null,
  parent_phone text not null,

  -- Context: which plan card or page the visitor came from, so the call can
  -- start where they left off. Never trusted for anything but routing.
  plan_interest text,
  source text,
  notes text,

  -- Worked by the team
  status text not null default 'new' check (
    status in ('new', 'contacted', 'scheduled', 'closed', 'spam')
  ),
  contacted_at timestamptz,
  contacted_by text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Length caps at the database edge, so a malformed or hostile submission
-- cannot store an essay. The form validates the same limits, but the table is
-- the boundary that actually holds.
alter table public.leads
  add constraint leads_lengths check (
    length(player_first_name) between 1 and 80 and
    length(player_last_name) between 1 and 80 and
    length(position) between 1 and 60 and
    length(current_level) between 1 and 60 and
    length(parent_name) between 1 and 120 and
    length(parent_email) between 3 and 254 and
    length(parent_phone) between 7 and 40 and
    (plan_interest is null or length(plan_interest) <= 60) and
    (source is null or length(source) <= 120) and
    (notes is null or length(notes) <= 1000)
  );

alter table public.leads
  add constraint leads_grad_year_sane check (grad_year between 2020 and 2040);

alter table public.leads
  add constraint leads_email_shape check (parent_email like '%_@_%.__%');

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

alter table public.leads enable row level security;

-- The public may add a lead and nothing else. There is deliberately no select,
-- update, or delete policy for anon or authenticated: with RLS on, the absence
-- of a policy is a denial, so a leaked anon key cannot enumerate families.
create policy "Anyone may submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- Privileges match the policy exactly. Insert only, and no column may be read
-- back, which is why the insert path must never use .select().
grant insert on public.leads to anon, authenticated;
grant all on public.leads to service_role;

create trigger leads_updated_at
  before update on public.leads
  for each row
  execute function public.update_updated_at();
