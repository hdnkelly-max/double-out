insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
insert into tc_card_sets values ('legends','Legends',null,1);
insert into tc_cards(id,set_id,no,name,rarity,art_key) values ('taylor','legends',18,'Phil','legendary','p'),('littler','legends',19,'Luke','legendary','n'),('kev','legends',4,'Kev','common','k');
-- A owns 2x taylor + 1 kev; B owns 2x littler
insert into tc_owned(card_id,owner_id) values ('taylor','11111111-1111-1111-1111-111111111111'),('taylor','11111111-1111-1111-1111-111111111111'),('kev','11111111-1111-1111-1111-111111111111'),('littler','22222222-2222-2222-2222-222222222222'),('littler','22222222-2222-2222-2222-222222222222');
select set_config('t.uid','11111111-1111-1111-1111-111111111111',false);
select 'T1 tradeable A', count(*) from tc_tradeable();
-- T2 cannot offer a common, cannot offer last copy
do $$ begin perform tc_trade_offer('22222222-2222-2222-2222-222222222222', array[3::bigint], null); raise exception 'FAIL'; exception when others then if sqlerrm='FAIL' then raise; end if; end $$;
do $$ begin perform tc_trade_offer('22222222-2222-2222-2222-222222222222', array[1::bigint,2::bigint], null); raise exception 'FAIL'; exception when others then if sqlerrm='FAIL' then raise; end if; end $$;
select 'T2 ok';
select 'T3 offer', tc_trade_offer('22222222-2222-2222-2222-222222222222', array[2::bigint], array[5::bigint]);
-- T4 the locked card can't go into a second trade
do $$ begin perform tc_trade_offer('22222222-2222-2222-2222-222222222222', array[2::bigint], null); raise exception 'FAIL'; exception when others then if sqlerrm='FAIL' then raise; end if; end $$;
select 'T4 ok';
-- T5 sender cannot accept own offer
do $$ begin perform tc_trade_respond((select min(id) from tc_trades where status in ('open','accepted')),'accept'); raise exception 'FAIL'; exception when others then if sqlerrm='FAIL' then raise; end if; end $$;
select set_config('t.uid','22222222-2222-2222-2222-222222222222',false);
select 'T6 accept', tc_trade_respond((select min(id) from tc_trades where status in ('open','accepted')),'accept');
select 'T6 repeat', tc_trade_respond((select min(id) from tc_trades where status in ('open','accepted')),'accept');
select 'T7 owners', string_agg(card_id||':'||right(owner_id::text,1),',' order by id) from tc_owned;
select 'T8 locks clear', count(*) from tc_owned where locked_by_trade is not null;
-- T9 expiry releases locks
select set_config('t.uid','11111111-1111-1111-1111-111111111111',false);
insert into tc_owned(card_id,owner_id) values ('littler','11111111-1111-1111-1111-111111111111');
select 'T9 offer2', tc_trade_offer('22222222-2222-2222-2222-222222222222', array[(select max(id) from tc_owned where card_id='littler' and owner_id='11111111-1111-1111-1111-111111111111')], null);
update tc_trades set expires_at = now() - interval '1 minute' where id = (select max(id) from tc_trades);
select 'T9 tradeable after expiry', count(*) from tc_tradeable();
select 'T9 status', status from tc_trades where id = (select max(id) from tc_trades);
