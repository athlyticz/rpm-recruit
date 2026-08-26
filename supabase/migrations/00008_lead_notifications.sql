-- Lead notifications: a new lead row posts itself to the app, which emails it.
--
-- Architecture: pg_net trigger, not a dashboard-configured Database Webhook,
-- deliberately. A dashboard webhook lives outside the repo and cannot be
-- applied to the local stack or reviewed in a diff; this migration is the
-- whole mechanism, reproducible on any environment the migrations run on.
--
-- Flow: INSERT on leads -> trigger posts the row as JSON to the app's
-- /api/notify/lead route with a shared bearer secret -> the route formats and
-- sends the email through Resend. The URL and secret live in notify_config,
-- written by scripts/setup-notifications.ts with the service role, so no
-- secret is baked into a migration file.
--
-- Waitlist signups deliberately have NO trigger: they batch into a daily
-- digest sent by a Vercel cron hitting /api/notify/waitlist-digest, so a good
-- day of signups is one email, not thirty.

create extension if not exists pg_net;

-- Runtime configuration for the trigger. Service-role only: no policies and
-- no anon/authenticated grants, so nothing reachable through the public API
-- can read the webhook secret.
create table public.notify_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.notify_config enable row level security;
grant all on public.notify_config to service_role;

-- Digest bookkeeping: one row per digest actually sent, so "new since last
-- digest" is computed from fact rather than from an assumed 24-hour window
-- that drifts with the cron.
create table public.notify_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  sent_at timestamptz not null default now(),
  detail jsonb
);

alter table public.notify_log enable row level security;
grant all on public.notify_log to service_role;

create index notify_log_kind_sent_idx on public.notify_log (kind, sent_at desc);

-- The trigger. Two hard rules:
--   1. An unconfigured environment is silent, not broken: no config, no post,
--      and the insert proceeds. A local stack with no notification setup must
--      behave exactly like production minus the email.
--   2. A notification failure must never block a family's submission. The
--      whole body is wrapped so any error still returns NEW.
create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  webhook_url text;
  webhook_secret text;
begin
  select value into webhook_url from public.notify_config where key = 'lead_webhook_url';
  select value into webhook_secret from public.notify_config where key = 'webhook_secret';

  if webhook_url is null or webhook_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := webhook_url,
    body := jsonb_build_object(
      'kind', 'lead',
      'id', new.id,
      'player_first_name', new.player_first_name,
      'player_last_name', new.player_last_name,
      'grad_year', new.grad_year,
      'position', new.position,
      'current_level', new.current_level,
      'parent_name', new.parent_name,
      'parent_email', new.parent_email,
      'parent_phone', new.parent_phone,
      'plan_interest', new.plan_interest,
      'source', new.source,
      'notes', new.notes,
      'created_at', new.created_at
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    ),
    timeout_milliseconds := 5000
  );

  return new;
exception when others then
  return new;
end;
$$;

create trigger leads_notify
  after insert on public.leads
  for each row
  execute function public.notify_new_lead();
