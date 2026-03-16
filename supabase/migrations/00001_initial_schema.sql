-- Profiles (created on signup via trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'player' check (role in ('player', 'scout', 'coach', 'org_admin')),
  plan text,
  stripe_customer_id text unique,
  subscription_status text,
  access_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Players (one per profile for player role)
create table public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  first_name text,
  last_name text,
  position text,
  grad_year integer,
  high_school text,
  city_state text,
  height_inches integer,
  weight_lbs integer,
  bats text check (bats in ('R', 'L', 'S')),
  throws text check (throws in ('R', 'L')),
  gpa numeric(3,2),
  sat_score integer,
  act_score integer,
  overall_score numeric(3,1),
  ratings jsonb default '{}',
  majors text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

create policy "Users can read own player"
  on public.players for select
  using (auth.uid() = profile_id);

create policy "Users can insert own player"
  on public.players for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own player"
  on public.players for update
  using (auth.uid() = profile_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger players_updated_at
  before update on public.players
  for each row execute function public.update_updated_at();
