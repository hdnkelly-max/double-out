-- TOPS collectibles, trade screen reads: my offers (open + recent), and the spare legendaries mates can trade.
begin;
create or replace function tc_my_trades() returns jsonb
language plpgsql security definer set search_path = public volatile as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  perform _tc_expire();
  return coalesce((select jsonb_agg(x order by x.open desc, x.created_at desc) from (
    select t.id, t.status, t.status = 'open' as open, t.created_at, t.expires_at,
      case when t.sender_id = me then 'out' else 'in' end as dir,
      case when t.sender_id = me then t.receiver_id else t.sender_id end as other,
      (select coalesce(jsonb_agg(ci.card_id), '[]') from tc_trade_items ti join tc_owned ci on ci.id = ti.card_instance_id where ti.trade_id = t.id and ti.side = 'give') as give,
      (select coalesce(jsonb_agg(ci.card_id), '[]') from tc_trade_items ti join tc_owned ci on ci.id = ti.card_instance_id where ti.trade_id = t.id and ti.side = 'get') as get
    from tc_trades t
    where me in (t.sender_id, t.receiver_id) and (t.status = 'open' or t.closed_at > now() - interval '7 days')
    order by t.created_at desc limit 30) x), '[]');
end $$;

-- spare (tradeable) legendaries for me and a list of mates: { "<uuid>": [{"i":instance,"c":card}], ... }
create or replace function tc_trade_board(p_users uuid[]) returns jsonb
language plpgsql security definer set search_path = public volatile as $$
declare me uuid := auth.uid(); u uuid; res jsonb := '{}';
begin
  if me is null then raise exception 'not signed in'; end if;
  perform _tc_expire();
  foreach u in array (array[me] || coalesce(p_users[1:40], '{}')) loop
    res := res || jsonb_build_object(u::text, coalesce((select jsonb_agg(jsonb_build_object('i', instance_id, 'c', card_id)) from tc_tradeable(u)), '[]'));
  end loop;
  return res;
end $$;

-- accept: substitute a free copy when the asked-for one is busy; nobody ends a trade with zero copies
create or replace function tc_trade_respond(p_trade bigint, p_action text) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); t tc_trades; it record; n int; alt bigint;
begin
  perform _tc_expire();
  select * into t from tc_trades where id = p_trade for update;
  if not found or me not in (t.sender_id, t.receiver_id) then raise exception 'no such trade'; end if;
  if t.status <> 'open' then return t.status; end if;
  if p_action = 'cancel' and me = t.sender_id or p_action = 'decline' and me = t.receiver_id then
    update tc_owned set locked_by_trade = null where locked_by_trade = t.id;
    update tc_trades set status = case when p_action = 'cancel' then 'cancelled' else 'declined' end, closed_at = now() where id = t.id;
    return p_action;
  end if;
  if p_action <> 'accept' or me <> t.receiver_id then raise exception 'not allowed'; end if;
  perform 1 from tc_owned where id in (select card_instance_id from tc_trade_items where trade_id = t.id) order by id for update;
  for it in select ti.side, ci.* from tc_trade_items ti join tc_owned ci on ci.id = ti.card_instance_id where ti.trade_id = t.id loop
    if it.side = 'give' and (it.owner_id <> t.sender_id or it.locked_by_trade <> t.id) then raise exception 'offer changed'; end if;
    if it.side = 'get' and (it.owner_id <> t.receiver_id or it.locked_by_trade is not null) then
      -- the asked-for copy is busy: any other free copy of the same card will do
      select o.id into alt from tc_owned o where o.owner_id = t.receiver_id and o.card_id = it.card_id and o.locked_by_trade is null
        and o.id not in (select card_instance_id from tc_trade_items where trade_id = t.id) order by o.obtained_at desc, o.id desc limit 1 for update;
      if alt is null then raise exception 'your card is no longer available'; end if;
      update tc_trade_items set card_instance_id = alt where trade_id = t.id and card_instance_id = it.id;
    end if;
  end loop;
  -- both players keep at least one copy that is not leaving in this or another open trade
  for it in select ti.side, ci.card_id, count(*) k from tc_trade_items ti join tc_owned ci on ci.id = ti.card_instance_id where ti.trade_id = t.id group by 1, 2 loop
    select count(*) into n from tc_owned o where o.owner_id = case it.side when 'give' then t.sender_id else t.receiver_id end and o.card_id = it.card_id
      and o.id not in (select card_instance_id from tc_trade_items where trade_id = t.id) and (o.locked_by_trade is null);
    if n < 1 then
      if exists (select 1 from tc_owned o where o.owner_id = case it.side when 'give' then t.sender_id else t.receiver_id end and o.card_id = it.card_id and o.locked_by_trade is not null and o.locked_by_trade <> t.id) then
        raise exception '%', case it.side when 'give' then 'their spare is tied up in another offer' else 'your spare is in another offer, cancel that one first' end;
      end if;
      raise exception '%', case it.side when 'give' then 'they no longer have a spare' else 'you must keep one copy' end;
    end if;
  end loop;
  update tc_owned ci set owner_id = case ti.side when 'give' then t.receiver_id else t.sender_id end, locked_by_trade = null, origin = 'trade'
    from tc_trade_items ti where ti.trade_id = t.id and ci.id = ti.card_instance_id;
  update tc_trades set status = 'accepted', closed_at = now() where id = t.id;
  perform _tc_check_sets(t.sender_id); perform _tc_check_sets(t.receiver_id);
  return 'accepted';
end $$;

revoke all on function tc_my_trades, tc_trade_board from public, anon;
grant execute on function tc_my_trades, tc_trade_board to authenticated;
commit;
