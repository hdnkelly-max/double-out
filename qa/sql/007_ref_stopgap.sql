-- TOPS collectibles 007 (QA stopgap for B1/B2, 11 Nov): referee claims no longer skip the daily cap.
-- Why: tops_ref_start / tops_ref_dart are anon and take any player key and coordinates, so a referee log
-- can be manufactured from the console. Until seats are bound to accounts (Polish, proper fix), a ref| claim
-- is stored as ordinary 'career' trust and counts toward the same 60-a-day cap as every other phone claim.
-- The referee check stays (a ref| claim still needs a 180 in that match's log), and one claim per key stays.
-- Before applying: live had 0 verified rows and 0 ref| rows (checked 19:50), so nothing to revoke.
-- Only change from 006: the 'verified' trust line is gone and the daily cap now applies to ref| claims too.
begin;

create or replace function public.tc_award(p_source_key text, p_kind text, p_reason text, p_trust text default 'career', p_user uuid default null)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare uid uuid := coalesce(p_user, auth.uid()); ev bigint; n int := 1; dv tc_drop_tables; pk bigint; st tc_pick_state; lc numeric; pos int;
  v_trust text := p_trust; parts text[];
begin
  if uid is null then raise exception 'not signed in'; end if;
  if (p_user is not null or p_trust = 'verified') and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'verified awards come from the referee only';
  end if;
  if p_source_key like 'ref|%' then
    parts := string_to_array(p_source_key, '|');
    if array_length(parts, 1) <> 5 or parts[4] <> '180' or p_kind <> '180' then raise exception 'bad referee claim'; end if;
    if coalesce(_tc_ref_180s(parts[2], parts[3]), 0) < parts[5]::int then return 0; end if;
    if exists (select 1 from tc_reward_events where source_key = p_source_key and user_id <> uid) then return 0; end if;
    -- 007: no 'verified' trust until seats are bound to accounts
  end if;
  if coalesce(auth.role(), '') <> 'service_role' then
    -- unverifiable claims (offline play, and referee claims until 007 is replaced): a generous daily cap no real player reaches
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
end $function$;

commit;
