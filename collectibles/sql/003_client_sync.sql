-- TOPS collectibles, client sync: one-call state, one-time import of save-file collections, exhibition grants.
begin;
alter table tc_pick_state add column if not exists imported_at timestamptz;

-- everything the client needs to render: owned counts, unlocks, open picks (redacted), pity counter
create or replace function tc_state() returns jsonb
language sql security definer set search_path = public stable as $$
  select jsonb_build_object(
    'own', coalesce((select jsonb_object_agg(card_id, n) from (select card_id, count(*) n from tc_owned where owner_id = auth.uid() group by card_id) x), '{}'),
    'unl', coalesce((select jsonb_object_agg(cosmetic_id, source) from tc_unlocks where user_id = auth.uid()), '{}'),
    'picks', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'reason', reason, 'keepAll', keep_all) order by id) from tc_picks where user_id = auth.uid() and status = 'open'), '[]'),
    'since', coalesce((select since_legendary from tc_pick_state where user_id = auth.uid()), 0),
    'imported', (select imported_at is not null from tc_pick_state where user_id = auth.uid())
  ) $$;

-- one-time import of a save-file collection (career trust, same as offline play). Ignored after the first call.
-- p: { own:{card:count}, unl:[cos], paid:[source_key], picks:[{reason, opts:[card,card,card], keepAll}], since }
create or replace function tc_import(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); k text; v jsonb; i int; pk bigint; ev bigint; pos int; dv int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into tc_pick_state(user_id) values (uid) on conflict do nothing;
  if (select imported_at from tc_pick_state where user_id = uid) is not null then return tc_state(); end if;
  select max(version) into dv from tc_drop_tables;
  for k, v in select * from jsonb_each(coalesce(p->'own', '{}')) loop
    if exists (select 1 from tc_cards where id = k) then
      for i in 1..least(greatest((v #>> '{}')::int, 0), 20) loop insert into tc_owned(card_id, owner_id, origin) values (k, uid, 'import'); end loop;
    end if;
  end loop;
  insert into tc_unlocks(user_id, cosmetic_id, source) select uid, x, 'import' from jsonb_array_elements_text(coalesce(p->'unl', '[]')) x on conflict do nothing;
  insert into tc_reward_events(user_id, source_key, kind, trust, picks) select uid, x, 'achievement', 'career', 0 from jsonb_array_elements_text(coalesce(p->'paid', '[]')) x on conflict do nothing;
  for v in select * from jsonb_array_elements(coalesce(p->'picks', '[]')) loop
    insert into tc_reward_events(user_id, source_key, kind, trust, picks) values (uid, 'import:' || md5(v::text || clock_timestamp()::text), 'achievement', 'career', 1) returning id into ev;
    insert into tc_picks(user_id, reward_event_id, reason, keep_all, drop_version) values (uid, ev, coalesce(v->>'reason', 'Card pick'), coalesce((v->>'keepAll')::boolean, false), dv) returning id into pk;
    pos := 0;
    for k in select jsonb_array_elements_text(v->'opts') loop
      if pos < 3 and exists (select 1 from tc_cards where id = k) then insert into tc_pick_options values (pk, pos, k); pos := pos + 1; end if;
    end loop;
    while pos < 3 loop insert into tc_pick_options values (pk, pos, _tc_roll(0.005, (select odds from tc_drop_tables where version = dv))); pos := pos + 1; end loop;
  end loop;
  update tc_pick_state set since_legendary = coalesce((p->>'since')::int, since_legendary), imported_at = now() where user_id = uid;
  perform _tc_check_sets(uid);
  return tc_state();
end $$;

-- exhibition win / first loss: grant a specific card once per source key
create or replace function tc_grant(p_source_key text, p_card text, p_cosmetic text default null) returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); ev bigint;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_card not in (select id from tc_cards where set_id in ('legends', 'exhibitions')) then raise exception 'not grantable'; end if;
  insert into tc_reward_events(user_id, source_key, kind, trust, picks) values (uid, p_source_key, 'exhibition', 'career', 0)
    on conflict (user_id, source_key) do nothing returning id into ev;
  if ev is null then return false; end if;
  insert into tc_owned(card_id, owner_id, origin) values (p_card, uid, 'exhibition');
  if p_cosmetic is not null then insert into tc_unlocks(user_id, cosmetic_id, source) values (uid, p_cosmetic, 'exh:' || p_card) on conflict do nothing; end if;
  insert into tc_unlocks(user_id, cosmetic_id, source) select uid, cosmetic_id, 'card:' || id from tc_cards where id = p_card and cosmetic_id is not null on conflict do nothing;
  perform _tc_check_sets(uid);
  return true;
end $$;

grant execute on function tc_state, tc_import, tc_grant to authenticated;
commit;
