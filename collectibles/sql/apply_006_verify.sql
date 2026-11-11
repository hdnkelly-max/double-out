-- TOPS collectibles 006: stop farmed rewards.
-- 1) Online 180s are checked against the server referee's own dart log before they pay out.
-- 2) Everything else a phone can claim (career 180s, ton-outs, achievements) is capped per day.
-- 3) Exhibition legend cards: one copy per legend ever from exhibitions, signature titles only, 3 a day at most.

-- how many maximums (three T20s in one visit) a player key threw in a referee match
create or replace function _tc_ref_180s(p_match text, p_key text) returns int
language plpgsql stable security definer set search_path = public as $$
declare e jsonb; prev text := null; run int := 0; t20 int := 0; n int := 0; lab text;
begin
  for e in select x from tops_ref r, jsonb_array_elements(r.log) with ordinality as a(x, i) where r.match_id = p_match order by i loop
    if e->>'k' is distinct from prev or run = 3 then prev := e->>'k'; run := 0; t20 := 0; end if;
    run := run + 1;
    lab := case when coalesce((e->>'bo')::boolean, false) then 'BOUNCE' else tops_ref_score((e->>'x')::float8, (e->>'y')::float8)->>'label' end;
    if lab = 'T20' then t20 := t20 + 1; end if;
    if run = 3 and t20 = 3 and prev = p_key then n := n + 1; end if;
  end loop;
  return n;
end $$;
revoke all on function _tc_ref_180s(text, text) from public, anon, authenticated;

create or replace function tc_award(p_source_key text, p_kind text, p_reason text, p_trust text default 'career', p_user uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := coalesce(p_user, auth.uid()); ev bigint; n int := 1; dv tc_drop_tables; pk bigint; st tc_pick_state; lc numeric; pos int;
  v_trust text := p_trust; parts text[];
begin
  if uid is null then raise exception 'not signed in'; end if;
  if (p_user is not null or p_trust = 'verified') and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'verified awards come from the referee only';
  end if;
  if p_source_key like 'ref|%' then
    -- ref|<match>|<player key>|180|<nth maximum by that key in the match>
    parts := string_to_array(p_source_key, '|');
    if array_length(parts, 1) <> 5 or parts[4] <> '180' or p_kind <> '180' then raise exception 'bad referee claim'; end if;
    if coalesce(_tc_ref_180s(parts[2], parts[3]), 0) < parts[5]::int then return 0; end if;
    if exists (select 1 from tc_reward_events where source_key = p_source_key and user_id <> uid) then return 0; end if;   -- one claim per real 180
    v_trust := 'verified';
  elsif coalesce(auth.role(), '') <> 'service_role' then
    -- unverifiable claims (offline play): a generous daily cap no real player reaches
    if (select count(*) from tc_reward_events where user_id = uid and picks > 0 and created_at > now() - interval '24 hours'
          and trust <> 'verified' and source_key not like 'import:%') >= 60 then return 0; end if;
    if p_kind = 'nine_darter' and (select count(*) from tc_reward_events where user_id = uid and kind = 'nine_darter' and created_at > now() - interval '24 hours') >= 1 then return 0; end if;
  end if;
  insert into tc_reward_events(user_id, source_key, kind, trust, picks) values (uid, p_source_key, p_kind, v_trust, n)
    on conflict (user_id, source_key) do nothing returning id into ev;
  if ev is null then return 0; end if;
  select * into dv from tc_drop_tables order by version desc limit 1;
  insert into tc_pick_state(user_id) values (uid) on conflict do nothing;
  select * into st from tc_pick_state where user_id = uid;
  insert into tc_picks(user_id, reward_event_id, reason, keep_all, drop_version)
    values (uid, ev, p_reason, p_kind = 'nine_darter', dv.version) returning id into pk;
  lc := _tc_leg_chance(st.since_legendary, dv.odds, dv.pity_start, dv.pity_hard);
  if p_kind = 'nine_darter' then lc := greatest(lc, 0.05); end if;
  for pos in 0..2 loop
    insert into tc_pick_options(pick_id, position, card_id) values (pk, pos, _tc_roll(lc, dv.odds));
  end loop;
  if p_kind = 'nine_darter' then
    insert into tc_owned(card_id, owner_id, source_pick, origin)
      select id, uid, pk, 'nine_darter' from tc_cards where id = 'ninex';
  end if;
  return n;
end $$;

create or replace function tc_grant(p_source_key text, p_card text, p_cosmetic text default null) returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); ev bigint;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_card not in (select id from tc_cards where set_id in ('legends', 'exhibitions')) then raise exception 'not grantable'; end if;
  if p_cosmetic is not null and p_cosmetic not like 'title\_%' then raise exception 'not grantable'; end if;
  -- one exhibition copy of each card, ever, and no more than three exhibition grants a day
  if exists (select 1 from tc_owned where owner_id = uid and card_id = p_card and origin = 'exhibition') then return false; end if;
  if (select count(*) from tc_reward_events where user_id = uid and kind = 'exhibition' and created_at > now() - interval '24 hours') >= 3 then return false; end if;
  insert into tc_reward_events(user_id, source_key, kind, trust, picks) values (uid, p_source_key, 'exhibition', 'career', 0)
    on conflict (user_id, source_key) do nothing returning id into ev;
  if ev is null then return false; end if;
  insert into tc_owned(card_id, owner_id, origin) values (p_card, uid, 'exhibition');
  if p_cosmetic is not null then insert into tc_unlocks(user_id, cosmetic_id, source) values (uid, p_cosmetic, 'exh:' || p_card) on conflict do nothing; end if;
  insert into tc_unlocks(user_id, cosmetic_id, source) select uid, cosmetic_id, 'card:' || id from tc_cards where id = p_card and cosmetic_id is not null on conflict do nothing;
  perform _tc_check_sets(uid);
  return true;
end $$;

