-- TOPS collectibles, Phase 1 schema. DRAFT: do not apply while the build chat holds the Supabase lock
-- (see claude/tops-coordination.md). Spec: claude/tops-collectibles-plan.md.
-- Principles: server owns every roll and grant; every reward has a unique source key; picks are
-- rolled once, hidden until chosen, never re-rolled; one row per owned card (trades, provenance).

begin;

-- ---------- catalogue ----------
create table if not exists card_sets (
  id text primary key,
  name text not null,
  completion_cosmetic text,              -- cosmetic id unlocked when the set is first completed
  sort int not null default 0
);

create table if not exists card_definitions (
  id text primary key,
  set_id text not null references card_sets(id),
  no int not null unique,
  name text not null,
  rarity text not null check (rarity in ('common','uncommon','rare','epic','legendary')),
  art_key text not null,
  cosmetic_id text,                       -- unlocked the first time this card is kept
  exclusive boolean not null default false,  -- e.g. Nine-Dart Club: never in normal rolls
  active boolean not null default true
);

-- drop tables are versioned so pending picks keep the odds they were rolled with
create table if not exists drop_tables (
  version int primary key,
  odds jsonb not null,                    -- {"common":0.60,"uncommon":0.25,"rare":0.11,"epic":0.035,"legendary":0.005}
  pity_start int not null default 160,
  pity_hard int not null default 240,
  created_at timestamptz not null default now()
);
insert into drop_tables(version, odds) values
  (1, '{"common":0.60,"uncommon":0.25,"rare":0.11,"epic":0.035,"legendary":0.005}')
on conflict do nothing;

-- ---------- ledger ----------
create table if not exists reward_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null,               -- match:{id}:leg:{n}:visit:{n}:180 | ach:{id}:{tier} | nine:{match}:{leg}
  kind text not null check (kind in ('180','ton_checkout','achievement','nine_darter','exhibition','set_complete')),
  trust text not null check (trust in ('verified','career')),  -- online referee vs offline career
  picks int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, source_key)
);

create table if not exists achievement_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  tier text not null check (tier in ('bronze','silver','gold','single')),
  awarded_at timestamptz not null default now(),
  primary key (user_id, achievement_id, tier)
);

create table if not exists achievement_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  progress int not null default 0,
  primary key (user_id, achievement_id)
);

-- per-user pity counter
create table if not exists pick_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  since_legendary int not null default 0,
  picks_opened int not null default 0
);

-- ---------- picks ----------
create table if not exists card_picks (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_event_id bigint not null references reward_events(id),
  reason text not null,                   -- shown on the pack screen: "180", "Ton Out · bronze"
  keep_all boolean not null default false,-- nine-darter: all three kept
  drop_version int not null references drop_tables(version),
  status text not null default 'open' check (status in ('open','resolved')),
  chosen int check (chosen between 0 and 2),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists card_picks_open on card_picks(user_id) where status = 'open';

-- hidden options: no client grants at all; read only through the RPCs below
create table if not exists pick_options (
  pick_id bigint not null references card_picks(id) on delete cascade,
  position int not null check (position between 0 and 2),
  card_id text not null references card_definitions(id),
  primary key (pick_id, position)
);

-- ---------- ownership ----------
create table if not exists card_instances (
  id bigserial primary key,
  card_id text not null references card_definitions(id),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_pick bigint references card_picks(id),
  origin text not null default 'pick',    -- pick | nine_darter | exhibition | trade
  obtained_at timestamptz not null default now(),
  locked_by_trade bigint
);
create index if not exists card_instances_owner on card_instances(owner_id, card_id);

create table if not exists cosmetic_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  cosmetic_id text not null,
  source text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)        -- permanent: never removed by trading
);

create table if not exists player_loadouts (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null,                     -- hat, glasses, face, flights, shaft, barrel, walkon, cel_180, cel_checkout, cel_win, title
  cosmetic_id text not null,
  primary key (user_id, slot)
);

create table if not exists trophy_awards (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id text not null,                 -- club_night, club_champs, regional, dpnz, trans_tasman, pro_tour, palace
  match_ref text not null,
  opponent text, venue text, score text, average numeric, deciding_checkout int,
  awarded_at timestamptz not null default now(),
  unique (user_id, title_id, match_ref)
);

-- ---------- RLS ----------
alter table card_sets enable row level security;
alter table card_definitions enable row level security;
alter table drop_tables enable row level security;
alter table reward_events enable row level security;
alter table achievement_awards enable row level security;
alter table achievement_progress enable row level security;
alter table pick_state enable row level security;
alter table card_picks enable row level security;
alter table pick_options enable row level security;     -- no policies: invisible to clients
alter table card_instances enable row level security;
alter table cosmetic_unlocks enable row level security;
alter table player_loadouts enable row level security;
alter table trophy_awards enable row level security;

create policy "catalogue readable" on card_sets for select using (true);
create policy "catalogue readable" on card_definitions for select using (true);
create policy "own events" on reward_events for select using (auth.uid() = user_id);
create policy "own awards" on achievement_awards for select using (auth.uid() = user_id);
create policy "own progress" on achievement_progress for select using (auth.uid() = user_id);
create policy "own picks" on card_picks for select using (auth.uid() = user_id);
-- mates can see each other's collections, cabinets and loadouts (bragging rights)
create policy "collections public to players" on card_instances for select using (auth.role() = 'authenticated');
create policy "unlocks public to players" on cosmetic_unlocks for select using (auth.role() = 'authenticated');
create policy "loadouts public to players" on player_loadouts for select using (auth.role() = 'authenticated');
create policy "own loadout write" on player_loadouts for all using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists (select 1 from cosmetic_unlocks u where u.user_id = auth.uid() and u.cosmetic_id = player_loadouts.cosmetic_id));
create policy "trophies public to players" on trophy_awards for select using (auth.role() = 'authenticated');
-- no insert/update/delete policies elsewhere: all writes go through the security definer functions

-- ---------- functions ----------
-- roll one card for a given legendary chance, excluding exclusives
create or replace function _tc_roll(p_leg numeric, p_odds jsonb) returns text
language plpgsql volatile set search_path = public as $$
declare r numeric := random(); v_rar text; acc numeric := 0; rest numeric; k text;
begin
  if r < p_leg then v_rar := 'legendary';
  else
    rest := 1 - (p_odds->>'legendary')::numeric;
    r := (r - p_leg) / (1 - p_leg) * rest;
    foreach k in array array['common','uncommon','rare','epic'] loop
      acc := acc + (p_odds->>k)::numeric;
      if r < acc then v_rar := k; exit; end if;
    end loop;
    v_rar := coalesce(v_rar, 'epic');
  end if;
  return (select id from card_definitions where rarity = v_rar and active and not exclusive order by random() limit 1);
end $$;

create or replace function _tc_leg_chance(p_since int, p_odds jsonb, p_start int, p_hard int) returns numeric
language sql immutable as $$
  select case
    when p_since + 1 >= p_hard then 1
    when p_since + 1 < p_start then (p_odds->>'legendary')::numeric
    else (p_odds->>'legendary')::numeric + (0.25 - (p_odds->>'legendary')::numeric)
         * power((p_since + 1 - p_start)::numeric / (p_hard - p_start), 2)
  end $$;

-- record a reward event once and create its picks with options pre-rolled.
-- Called by the server referee (verified) or by the client for offline career (trust = 'career').
-- Returns the number of new picks (0 if this source_key was already paid).
create or replace function tc_award(p_source_key text, p_kind text, p_reason text, p_trust text default 'career', p_user uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := coalesce(p_user, auth.uid()); ev bigint; n int := 1; dv drop_tables; pk bigint; st pick_state; lc numeric; pos int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  -- only the referee (service role) may award for someone else or mark an award verified
  if (p_user is not null or p_trust = 'verified') and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'verified awards come from the referee only';
  end if;
  insert into reward_events(user_id, source_key, kind, trust, picks) values (uid, p_source_key, p_kind, p_trust, n)
    on conflict (user_id, source_key) do nothing returning id into ev;
  if ev is null then return 0; end if;                       -- already paid: idempotent
  select * into dv from drop_tables order by version desc limit 1;
  insert into pick_state(user_id) values (uid) on conflict do nothing;
  select * into st from pick_state where user_id = uid;
  insert into card_picks(user_id, reward_event_id, reason, keep_all, drop_version)
    values (uid, ev, p_reason, p_kind = 'nine_darter', dv.version) returning id into pk;
  -- options are rolled now, at the pity level current when the pick was earned
  lc := _tc_leg_chance(st.since_legendary, dv.odds, dv.pity_start, dv.pity_hard);
  if p_kind = 'nine_darter' then lc := greatest(lc, 0.05); end if;
  for pos in 0..2 loop
    insert into pick_options(pick_id, position, card_id) values (pk, pos, _tc_roll(lc, dv.odds));
  end loop;
  if p_kind = 'nine_darter' then  -- guaranteed exclusive card on top of the three
    insert into card_instances(card_id, owner_id, source_pick, origin)
      select id, uid, pk, 'nine_darter' from card_definitions where exclusive and set_id = 'nine_dart_club' order by no limit 1;
  end if;
  return n;
end $$;

-- open picks, redacted: no options until resolved
create or replace function tc_open_picks() returns table(id bigint, reason text, keep_all boolean, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select id, reason, keep_all, created_at from card_picks where user_id = auth.uid() and status = 'open' order by id $$;

-- choose a card. Atomic and idempotent: a repeat call returns the same result.
create or replace function tc_choose(p_pick bigint, p_pos int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); p card_picks; kept text; is_leg boolean; res jsonb; c record;
begin
  select * into p from card_picks where id = p_pick and user_id = uid for update;
  if not found then raise exception 'no such pick'; end if;
  if p.status = 'open' then
    if p_pos not between 0 and 2 then raise exception 'bad position'; end if;
    update card_picks set status = 'resolved', chosen = p_pos, resolved_at = now() where id = p.id;
    for c in select o.position, o.card_id, d.rarity, d.cosmetic_id from pick_options o join card_definitions d on d.id = o.card_id
             where o.pick_id = p.id and (p.keep_all or o.position = p_pos) loop
      insert into card_instances(card_id, owner_id, source_pick) values (c.card_id, uid, p.id);
      if c.cosmetic_id is not null then
        insert into cosmetic_unlocks(user_id, cosmetic_id, source) values (uid, c.cosmetic_id, 'card:' || c.card_id) on conflict do nothing;
      end if;
    end loop;
    select bool_or(d.rarity = 'legendary') into is_leg from pick_options o join card_definitions d on d.id = o.card_id
      where o.pick_id = p.id and (p.keep_all or o.position = p_pos);
    update pick_state set picks_opened = picks_opened + 1,
      since_legendary = case when is_leg then 0 else since_legendary + 1 end where user_id = uid;
    perform _tc_check_sets(uid);
    p.chosen := p_pos;
  end if;
  select jsonb_build_object(
    'chosen', p.chosen,
    'options', (select jsonb_agg(jsonb_build_object('pos', o.position, 'id', o.card_id) order by o.position) from pick_options o where o.pick_id = p.id),
    'owned', (select jsonb_object_agg(card_id, n) from (select card_id, count(*) n from card_instances
              where owner_id = uid and card_id in (select card_id from pick_options where pick_id = p.id) group by card_id) x)
  ) into res;
  return res;
end $$;

create or replace function _tc_check_sets(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s record;
begin
  for s in select cs.id, cs.completion_cosmetic from card_sets cs where cs.completion_cosmetic is not null
    and not exists (select 1 from cosmetic_unlocks u where u.user_id = p_uid and u.cosmetic_id = cs.completion_cosmetic)
    and not exists (select 1 from card_definitions d where d.set_id = cs.id and d.active and not d.exclusive
                    and not exists (select 1 from card_instances i where i.owner_id = p_uid and i.card_id = d.id)) loop
    insert into cosmetic_unlocks(user_id, cosmetic_id, source) values (p_uid, s.completion_cosmetic, 'set:' || s.id) on conflict do nothing;
  end loop;
end $$;

revoke all on function _tc_roll, _tc_leg_chance, _tc_check_sets from public, anon, authenticated;
grant execute on function tc_award, tc_open_picks, tc_choose to authenticated;

commit;
-- Phase 4 adds: trades, trade_items, tc_trade_offer / tc_trade_accept (lock both sides, fixed order, atomic swap, 48h expiry).
