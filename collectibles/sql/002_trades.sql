-- TOPS collectibles, Phase 4: trading duplicate legendaries between mates. DRAFT (see coordination doc).
-- Rules: only a duplicate legendary can be offered (you always keep one copy); offered cards are locked;
-- the receiver accepts the exact offer; both sides lock in a fixed order and swap atomically; offers expire in 48 h.
-- Achievements and unlocked cosmetics never move with a card.
begin;

create table if not exists trades (
  id bigserial primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open','accepted','declined','cancelled','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '48 hours',
  closed_at timestamptz,
  check (sender_id <> receiver_id)
);
create table if not exists trade_items (
  trade_id bigint not null references trades(id) on delete cascade,
  card_instance_id bigint not null references card_instances(id),
  side text not null check (side in ('give','get')),
  primary key (trade_id, card_instance_id)
);
alter table trades enable row level security;
alter table trade_items enable row level security;
create policy "own trades" on trades for select using (auth.uid() in (sender_id, receiver_id));
create policy "own trade items" on trade_items for select using (exists (select 1 from trades t where t.id = trade_id and auth.uid() in (t.sender_id, t.receiver_id)));

-- expire old offers and release their locks (call from both RPCs; cheap)
create or replace function _tc_expire() returns void language sql security definer set search_path = public as $$
  update card_instances set locked_by_trade = null where locked_by_trade in (select id from trades where status = 'open' and expires_at < now());
  update trades set status = 'expired', closed_at = now() where status = 'open' and expires_at < now();
$$;

-- offer: p_give = my duplicate legendary instance ids, p_get = their instance ids I want
create or replace function tc_trade_offer(p_to uuid, p_give bigint[], p_get bigint[]) returns bigint
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); tid bigint; i bigint; c record;
begin
  perform _tc_expire();
  if me is null then raise exception 'not signed in'; end if;
  if coalesce(array_length(p_give,1),0) = 0 then raise exception 'offer at least one card'; end if;
  insert into trades(sender_id, receiver_id) values (me, p_to) returning id into tid;
  foreach i in array p_give loop
    select ci.*, d.rarity into c from card_instances ci join card_definitions d on d.id = ci.card_id where ci.id = i for update of ci;
    if not found or c.owner_id <> me then raise exception 'not your card'; end if;
    if c.rarity <> 'legendary' then raise exception 'only legendaries trade'; end if;
    if c.locked_by_trade is not null then raise exception 'card already in a trade'; end if;
    if (select count(*) from card_instances where owner_id = me and card_id = c.card_id and locked_by_trade is null) < 2 then raise exception 'you must keep one copy'; end if;
    update card_instances set locked_by_trade = tid where id = i;
    insert into trade_items values (tid, i, 'give');
  end loop;
  foreach i in array coalesce(p_get, '{}') loop
    select ci.*, d.rarity into c from card_instances ci join card_definitions d on d.id = ci.card_id where ci.id = i;
    if not found or c.owner_id <> p_to then raise exception 'they do not own that card'; end if;
    if c.rarity <> 'legendary' then raise exception 'only legendaries trade'; end if;
    insert into trade_items values (tid, i, 'get');
  end loop;
  return tid;
end $$;

-- respond: accept or decline (receiver), cancel (sender). Atomic and idempotent.
create or replace function tc_trade_respond(p_trade bigint, p_action text) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); t trades; it record; n int;
begin
  perform _tc_expire();
  select * into t from trades where id = p_trade for update;
  if not found or me not in (t.sender_id, t.receiver_id) then raise exception 'no such trade'; end if;
  if t.status <> 'open' then return t.status; end if;
  if p_action = 'cancel' and me = t.sender_id or p_action = 'decline' and me = t.receiver_id then
    update card_instances set locked_by_trade = null where locked_by_trade = t.id;
    update trades set status = case when p_action = 'cancel' then 'cancelled' else 'declined' end, closed_at = now() where id = t.id;
    return p_action;
  end if;
  if p_action <> 'accept' or me <> t.receiver_id then raise exception 'not allowed'; end if;
  -- lock every card involved in id order (deadlock-safe), then revalidate
  perform 1 from card_instances where id in (select card_instance_id from trade_items where trade_id = t.id) order by id for update;
  for it in select ti.side, ci.* from trade_items ti join card_instances ci on ci.id = ti.card_instance_id where ti.trade_id = t.id loop
    if it.side = 'give' and (it.owner_id <> t.sender_id or it.locked_by_trade <> t.id) then raise exception 'offer changed'; end if;
    if it.side = 'get' then
      if it.owner_id <> t.receiver_id or it.locked_by_trade is not null then raise exception 'your card is no longer available'; end if;
      select count(*) into n from card_instances where owner_id = t.receiver_id and card_id = it.card_id;
      if n < 2 then raise exception 'you must keep one copy'; end if;
    end if;
  end loop;
  update card_instances ci set owner_id = case ti.side when 'give' then t.receiver_id else t.sender_id end, locked_by_trade = null, origin = 'trade'
    from trade_items ti where ti.trade_id = t.id and ci.id = ti.card_instance_id;
  update trades set status = 'accepted', closed_at = now() where id = t.id;
  perform _tc_check_sets(t.sender_id); perform _tc_check_sets(t.receiver_id);
  return 'accepted';
end $$;

-- cards a user can offer: duplicate legendaries not in a trade (keeps one copy back)
create or replace function tc_tradeable(p_user uuid default null) returns table(instance_id bigint, card_id text)
language plpgsql security definer set search_path = public volatile as $$
begin
  perform _tc_expire();
  return query select x.id, x.card_id from (
    select ci.id, ci.card_id, row_number() over (partition by ci.card_id order by ci.obtained_at, ci.id) rn
    from card_instances ci join card_definitions d on d.id = ci.card_id
    where ci.owner_id = coalesce(p_user, auth.uid()) and d.rarity = 'legendary' and ci.locked_by_trade is null) x
  where x.rn > 1;
end $$;

revoke all on function _tc_expire from public, anon, authenticated;
grant execute on function tc_trade_offer, tc_trade_respond, tc_tradeable to authenticated;
commit;
