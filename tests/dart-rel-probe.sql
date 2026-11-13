-- CAR-5d probe for Q&D (R1). Applies sql/tops_darts_rel.sql, inserts the way the game does (role 'authenticated', user_id from
-- auth.uid() via the JWT claim), checks the size check and RLS, then raises an exception, so EVERYTHING rolls back (column included).
-- Run it as one statement (Supabase execute_sql). Expected error text:
--   PROBE_RESULT ok_rel ok_null big_refused other_user_refused n=2 size=244 (rolled back)
-- Afterwards: select count(*) from information_schema.columns where table_name='tops_darts' and column_name='rel';  -> 0
-- The JWT sub must be a real auth user (tops_darts.user_id has a foreign key); any player's id works since nothing is kept.
do $probe$ declare r text := ''; begin
alter table public.tops_darts add column if not exists rel jsonb;
alter table public.tops_darts drop constraint if exists tops_darts_rel_size;
alter table public.tops_darts add constraint tops_darts_rel_size check (rel is null or (jsonb_typeof(rel) = 'object' and pg_column_size(rel) < 1024));
execute 'set local role authenticated';
perform set_config('request.jwt.claims', '{"sub":"0ae81554-9088-42d4-8229-6bb4a60638d2","role":"authenticated"}', true);
-- 1 a dart with the record, as CAR-5d sends it
insert into public.tops_darts (ver,mode,tier,opp,leg,dart,score_before,aim_x,aim_y,lock_x,lock_y,land_x,land_y,dt_ms,perfect,ring_mm,rel)
values ('probe','career',1,'Tama Rewiri',1,1,501,0,-103,1.2,-101.5,2.5,-99,4,true,3.1,
 '{"gp":330,"gr":18,"gpl":17,"pm":301,"ra":16.7,"lag":1,"sx":3.2,"sy":-1.1,"gx":0.4,"gy":0.2,"rx":1.1,"ry":-0.6}');
r := r||'ok_rel ';
-- 2 an older client without the field
insert into public.tops_darts (ver,mode,tier,opp,leg,dart,score_before) values ('probe','career',1,'Tama Rewiri',1,2,441);
r := r||'ok_null ';
-- 3 an oversized record is refused by the check
begin insert into public.tops_darts (ver,mode,dart,rel) values ('probe','career',3, jsonb_build_object('pad', repeat('x', 1200))); r:=r||'BIG_ACCEPTED ';
exception when check_violation then r := r||'big_refused '; end;
-- 4 RLS unchanged: a row for someone else is refused
begin insert into public.tops_darts (user_id,ver,mode,dart,rel) values ('f2988dfb-0000-0000-0000-000000000000','probe','career',4,'{"gp":1}'); r:=r||'OTHER_ACCEPTED ';
exception when insufficient_privilege then r := r||'other_user_refused '; when foreign_key_violation then r:=r||'other_user_refused(fk) '; end;
r := r||'n='||(select count(*) from public.tops_darts where ver='probe')||' size='||(select pg_column_size(rel) from public.tops_darts where ver='probe' and dart=1);
raise exception 'PROBE_RESULT % (rolled back)', r;
end $probe$;
