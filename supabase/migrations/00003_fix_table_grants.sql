-- Grant table privileges on profiles and players.
--
-- Migration 00001 created both tables with RLS enabled and correct policies,
-- but never granted table privileges to the API roles. RLS decides which rows
-- a role may see; grants decide whether the role may touch the table at all.
-- With policies but no grants, PostgREST returns
--   "permission denied for table profiles"
-- to every caller, and the app's entire data layer fails closed.
--
-- Grants are idempotent, so this is safe to apply to a project where they are
-- already present (for example one whose tables were created via the Supabase
-- dashboard, which grants them automatically).
--
-- Privileges are deliberately narrower than the policies. Each table's RLS
-- still restricts every statement to the owning user's rows.

-- profiles: users read and update their own row. Inserts happen through the
-- handle_new_user trigger, which is security definer and runs as the owner,
-- so authenticated does not need insert here. Deletes cascade from auth.users.
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- players: users read, insert, and update their own row, matching the three
-- policies defined in 00001.
grant select, insert, update on public.players to authenticated;
grant all on public.players to service_role;

-- anon is deliberately omitted from both. Neither table is public.
