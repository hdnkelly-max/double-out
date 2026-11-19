-- CAR-TUNE (Overseer 19:45, Hayden): Season 3 per-tier perfect-window scale and near-miss ramp, changeable without a code release.
-- The game reads tier, win_scale, ramp_ms once at load (baked fallback in tc/s3.js: win 1, ramp 40 at every tier).
-- win_scale scales the perfect window AND the ramp (the whole forgiving zone): the one difficulty lever per tier. ramp_ms is the shape and freezes them per match,
-- so a change applies from each player's next match after their next app load. Players can only read; the service role writes.
-- Every insert/update is logged in tops_tune_log by the trigger (old and new values, note, role, time).
-- Change one tier (example: Club window 5% smaller, with a note):
--   update public.tops_tune set win_scale = 0.95, note = 'Club entry 64% win (2 players, 31 matches)' where tier = 1;
create table if not exists public.tops_tune (
  tier smallint primary key check (tier between 0 and 6),
  win_scale numeric(4,3) not null default 1 check (win_scale between 0.5 and 1.5),
  ramp_ms numeric(5,1) not null default 40 check (ramp_ms between 0 and 120),
  note text,
  updated_by text not null default current_user,
  updated_at timestamptz not null default now()
);
comment on table public.tops_tune is 'CAR-TUNE: Season 3 per-tier perfect-window scale and near-miss ramp (ms). Read at game load; applies from the next match. Players read only; change with the service role. Every change is logged in tops_tune_log.';
create table if not exists public.tops_tune_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  tier smallint not null,
  old_win_scale numeric(4,3), new_win_scale numeric(4,3),
  old_ramp_ms numeric(5,1), new_ramp_ms numeric(5,1),
  note text, by_role text not null default current_user
);
create or replace function public.tops_tune_touch() returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now(); new.updated_by := current_user;
  if tg_op = 'INSERT' then
    insert into public.tops_tune_log(tier, new_win_scale, new_ramp_ms, note) values (new.tier, new.win_scale, new.ramp_ms, new.note);
  elsif new.win_scale is distinct from old.win_scale or new.ramp_ms is distinct from old.ramp_ms then
    insert into public.tops_tune_log(tier, old_win_scale, new_win_scale, old_ramp_ms, new_ramp_ms, note)
      values (new.tier, old.win_scale, new.win_scale, old.ramp_ms, new.ramp_ms, new.note);
  end if;
  return new;
end $$;
drop trigger if exists tops_tune_touch on public.tops_tune;
create trigger tops_tune_touch before insert or update on public.tops_tune for each row execute function public.tops_tune_touch();
alter table public.tops_tune enable row level security;
alter table public.tops_tune_log enable row level security;
revoke all on public.tops_tune, public.tops_tune_log from anon, authenticated;
grant select (tier, win_scale, ramp_ms, updated_at) on public.tops_tune to anon, authenticated;
drop policy if exists tops_tune_read on public.tops_tune;
create policy tops_tune_read on public.tops_tune for select to anon, authenticated using (true);
revoke execute on function public.tops_tune_touch() from public, anon, authenticated;
-- seed = the baked fallback (tc/s3.js TUNE_BAKED), so turning the table on changes nothing
insert into public.tops_tune(tier, win_scale, ramp_ms, note)
  select t, 1, 40, 'seed = baked fallback (CAR-TUNE)' from generate_series(0, 6) t
on conflict (tier) do nothing;
