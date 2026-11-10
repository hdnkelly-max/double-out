-- integrity tests for 001_collectibles.sql (run against a scratch DB with auth stubs)
insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
insert into card_sets values ('regulars','Kauri Arms Regulars','set_regulars_shirt',1),('legends','Ally Pally Legends',null,2),('nine_dart_club','Nine-Dart Club',null,3);
insert into card_definitions(id,set_id,no,name,rarity,art_key,cosmetic_id,exclusive) values
 ('kev','regulars',4,'Kev','common','kev',null,false),('mo','regulars',5,'Mo','common','mo',null,false),
 ('deano','regulars',1,'Deano','uncommon','deano',null,false),('shazza','regulars',2,'Shazza','rare','shazza','towel',false),
 ('robin','legends',14,'Robin','epic','robin','eyepatch',false),('taylor','legends',18,'Phil Taylor','legendary','power','power_walkon',false),
 ('ninex','nine_dart_club',100,'Nine-Dart Club','legendary','nine','pyro',true);
select set_config('t.uid','11111111-1111-1111-1111-111111111111',false);
-- T1: same 180 twice pays once
select 'T1 first',  tc_award('match:m1:leg:1:visit:3:180','180','180');
select 'T1 repeat', tc_award('match:m1:leg:1:visit:3:180','180','180');
select 'T1 picks',  count(*) from card_picks;
-- T2: player cannot self-verify or award for someone else
do $$ begin perform tc_award('x','180','180','verified'); raise exception 'T2 FAIL'; exception when others then if sqlerrm like 'T2 FAIL' then raise; end if; end $$;
do $$ begin perform tc_award('y','180','180','career','22222222-2222-2222-2222-222222222222'); raise exception 'T2 FAIL'; exception when others then if sqlerrm like 'T2 FAIL' then raise; end if; end $$;
select 'T2 ok';
-- T3: options exist before choosing; choose is idempotent
select 'T3 options pre-rolled', count(*) from pick_options;
select 'T3 choose', (tc_choose((select id from card_picks limit 1),1))->>'chosen';
select 'T3 repeat', (tc_choose((select id from card_picks limit 1),2))->>'chosen';
select 'T3 instances', count(*) from card_instances;
-- T4: nine-darter keeps all three + exclusive
select 'T4 award', tc_award('nine:m1:2','nine_darter','Nine-darter');
select 'T4 choose', (tc_choose((select max(id) from card_picks),0)) is not null;
select 'T4 instances now', count(*), count(*) filter (where card_id='ninex') from card_instances;
-- T5: hard pity — set counter to 239, next pick's options must all be legendary
update pick_state set since_legendary = 239;
select tc_award('match:m2:leg:1:visit:1:180','180','180');
select 'T5 all legendary', bool_and(d.rarity='legendary') from pick_options o join card_definitions d on d.id=o.card_id where o.pick_id=(select max(id) from card_picks);
select 'T5 choose', (tc_choose((select max(id) from card_picks),0))->>'chosen';
select 'T5 pity reset', since_legendary from pick_state;
-- T6: exclusives never appear in normal rolls
select 'T6 exclusives in options', count(*) from pick_options o join card_definitions d on d.id=o.card_id where d.exclusive;
-- T7: cosmetic unlocked by legendary card
select 'T7 unlocks', string_agg(cosmetic_id, ',' order by cosmetic_id) from cosmetic_unlocks;
-- T8: odds over 20k rolls at base rate
select 'T8 dist', rarity, round(100.0*count(*)/20000,2) from (select d.rarity from generate_series(1,20000) g, lateral (select _tc_roll(0.005 + g*0,(select odds from drop_tables where version=1)) id) r join card_definitions d on d.id=r.id) x group by rarity order by 3 desc;
