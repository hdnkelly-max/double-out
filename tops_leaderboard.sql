-- TOPS mates leaderboard. Paste into Supabase → SQL editor → Run.
create table if not exists public.tops_players (
  id uuid primary key,
  token text not null,
  name text not null,
  tier int not null default 0,
  matches int not null default 0,
  wins int not null default 0,
  avg numeric(5,1) not null default 0,
  best_avg numeric(5,1) not null default 0,
  best_leg int,
  t180 int not null default 0,
  hf int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.tops_players enable row level security;
revoke all on public.tops_players from anon, authenticated;
grant select (id, name, tier, matches, wins, avg, best_avg, best_leg, t180, hf, updated_at), insert, update on public.tops_players to anon;
create policy tops_read on public.tops_players for select to anon using (true);
create policy tops_insert on public.tops_players for insert to anon with check (true);
create policy tops_update on public.tops_players for update to anon
  using (token = coalesce(current_setting('request.headers', true)::json->>'x-tops-token', ''))
  with check (token = coalesce(current_setting('request.headers', true)::json->>'x-tops-token', ''));
