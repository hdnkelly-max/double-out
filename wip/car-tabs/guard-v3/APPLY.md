# Cloud save guard v3: apply step (Career for CAR-TABS R10, extending DQ's v2 on qa-cloud-guard). The Producer applies; nobody else.

v3 = DQ's v2 (compare-and-set on p_base, atomic, direct writes closed) plus ChatGPT's legacy policy (b): a permanent per-player
`base_guarded` flag. The first write with p_base that lands sets it, and nothing clears it. Once it's set, a write without p_base
(an old client: 4.32 and earlier) is refused with `{ok:false, err:'upgrade_required', sv}`. Until then it works exactly as today.

## Order (Producer 16:13 Mon 23 Nov)
Apply the guard on production immediately BEFORE the R10 client release, with rollback.sql ready. R10 sends p_base on every
cloud write and falls back to a plain push only if the server answers PGRST202 (no guard: after a rollback).

## Before
1. DQ has tested R10 against this guarded function on a non-production database.
2. Re-check production hasn't moved since 22 Nov 17:0x (one read-only query, Supabase SQL):
   select md5(pg_get_functiondef('public.tops_save3_put(jsonb)'::regprocedure));
   -> must be 8ec7c5ed166473e8f7187854102a0178 (what rollback.sql recreates, byte for byte; still true on 23 Nov 16:3x). If it differs, stop.
   Also: select column_name from information_schema.columns where table_name='tops_saves_s3';  -> user_id, data, updated_at only.
3. Backup of the rows: create table public.tops_saves_s3_bak_<date> as select * from public.tops_saves_s3;  (drop it a week later)

## Apply
Run guard.sql as ONE migration (Supabase apply_migration, name: tops_save3_guard_v3). It's a single transaction:
- add column base_guarded boolean not null default false (every existing player starts unflagged);
- drop the old 1-arg function, then create tops_save3_put(p_data jsonb, p_base bigint default null) as SECURITY DEFINER with search_path '';
- revoke EXECUTE from public/anon/authenticated/service_role, then grant it to authenticated and service_role;
- revoke insert/update/delete/truncate on tops_saves_s3 from anon and authenticated, so nobody can clear the flag directly;
- drop the own_insert and own_update policies (own_select stays);
- notify pgrst to reload its schema cache.

## Check, straight after (two minutes)
A. Database: run postcheck.sql in the SQL editor. It rolls itself back: it ends by raising an error whose message is the result.
   Expect: "QA-CHECK (rolled back): first save (p_data only):true | old client, p_data only:true | new client, current base:true |
   stale base:older sv 7 | old client after the flag:upgrade_required | flag:true | direct update refused".
   Before the guard, and after a rollback, it says instead: "function public.tops_save3_put(jsonb, integer) does not exist".
B. The live endpoint (PostgREST's cache), as in v2: signed OUT, both call shapes get 401 after the apply. Before the apply: 200 for
   p_data only, and 404 PGRST202 for the p_base call. If either still shows the old answer a minute later, run
   notify pgrst, 'reload schema';  once.
C. A real device on R10, signed in: change anything, then check the save reaches the cloud (tops_saves_s3.updated_at moves) and that
   player's base_guarded is true. A 4.32 tab of the same player then can't push (upgrade_required). Its progress stays on that device.
   R10 tabs show the reload card if they ever get that answer.

## If anything is wrong: rollback.sql (one transaction)
Recreates today's function exactly (md5 above), its grants, the table grants and both write policies, drops base_guarded, and
reloads the cache. Then run check A again: it must say "function ... (jsonb, integer) does not exist". Players' saves (the data
column) are untouched by apply and rollback. Only the flag is lost on rollback, and today has no such flag.

## Tested
pgtest.py on a local Postgres 16 with RLS, Supabase's roles, default privileges and auth.uid(): 42/42. That's DQ's 25 v2 cases on
v3, plus 17 for the flag:
- an old client before the flag;
- a refused p_base write doesn't set it;
- the first landed p_base write sets it;
- an old client is refused even with a higher sv;
- equal-version conflict;
- a delayed put;
- the flag on a first save with base 0;
- three races (new then old first save, old then new, old and new on an existing row);
- no direct clear;
- rollback drops the column and restores the function text exactly.
postcheck.sql run against it gives the expected line above, and "does not exist" after the rollback.
