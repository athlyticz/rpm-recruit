-- Newsletter subscribers: the low-commitment end of the funnel.
--
-- Same trust model as leads and for the same reason. A visitor who is not
-- signed in must be able to add a row and must never be able to read one: an
-- email list is a list of families, and a leaked anon key must not turn into
-- a leaked list.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- Which surface the address came from, so the first send can match the
  -- context the reader signed up in.
  source text,
  status text not null default 'active' check (
    status in ('active', 'unsubscribed', 'bounced', 'spam')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shape and length are enforced here, not only in the form. The form is the
-- only layer a person sees; this is the layer that actually holds.
alter table public.newsletter_subscribers
  add constraint newsletter_email_shape check (
    email like '%_@_%.__%' and length(email) between 3 and 254
  );

alter table public.newsletter_subscribers
  add constraint newsletter_source_length check (
    source is null or length(source) <= 120
  );

-- One row per address. A repeat sign-up is not an error the reader should
-- ever see, so the insert path swallows the conflict and answers the same way
-- either time.
create unique index newsletter_email_key
  on public.newsletter_subscribers (lower(email));

create index newsletter_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone may subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

grant insert on public.newsletter_subscribers to anon, authenticated;
grant all on public.newsletter_subscribers to service_role;

create trigger newsletter_subscribers_updated_at
  before update on public.newsletter_subscribers
  for each row
  execute function public.update_updated_at();
