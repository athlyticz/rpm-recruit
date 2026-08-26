-- players.overall_score is a denormalised cache of the evaluations table.
--
-- Until now it had exactly one writer: the saveSkillRating server action, which
-- recomputed it in the same call. That held only as long as nothing else wrote
-- evaluations. Phase 2 adds AI routes and Phase 4 adds scout entry, and the
-- first writer that forgets would leave every gauge, every athletic projection
-- and every match score quietly wrong, with no error anywhere.
--
-- The rule moves into the database, where it cannot be forgotten.

create or replace function public.recompute_overall_score(target_player_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  computed numeric(3, 1);
begin
  -- One rating per skill, taking the most authoritative evaluator available.
  -- Mirrors the ordering used in the application: an event or coach rating
  -- outranks a self report rather than being averaged with it.
  with ranked as (
    select
      e.skill_definition_id,
      e.score,
      row_number() over (
        partition by e.skill_definition_id
        order by
          case e.evaluator_role
            when 'event' then 3
            when 'coach' then 2
            when 'scout' then 2
            else 0
          end desc,
          e.evaluated_at desc,
          e.created_at desc
      ) as rn
    from public.evaluations e
    where e.player_id = target_player_id
  )
  select round(avg(score)::numeric, 1) into computed
  from ranked
  where rn = 1;

  update public.players
  set overall_score = computed
  where id = target_player_id;
end;
$$;

create or replace function public.evaluations_sync_overall_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_overall_score(old.player_id);
    return old;
  end if;

  perform public.recompute_overall_score(new.player_id);

  -- A row that moved between players has to leave the old one correct too.
  if tg_op = 'UPDATE' and old.player_id is distinct from new.player_id then
    perform public.recompute_overall_score(old.player_id);
  end if;

  return new;
end;
$$;

create trigger evaluations_sync_overall_score
  after insert or update or delete on public.evaluations
  for each row execute function public.evaluations_sync_overall_score();

-- Bring every existing player in line with the rule as it now stands.
do $$
declare
  p record;
begin
  for p in select id from public.players loop
    perform public.recompute_overall_score(p.id);
  end loop;
end;
$$;
