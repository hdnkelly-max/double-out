# Cloud save guard v3: apply step (Delivery QA, Mon 23 Nov). Hayden approved the guard; the Producer applies; DQ doesn't.
Order (agreed with ChatGPT): apply this to production IMMEDIATELY BEFORE the CAR-TABS R10 client release, with rollback.sql ready.
v3 = v2 (compare-and-set on p_base) + a permanent per-player flag, tops_saves_s3.base_guarded (legacy policy b).

## What changes for players
- New client (R10 and later): every cloud write carries p_base (the stored sv it last loaded or pushed). Refused unless the cloud still
  holds exactly that sv: reply {ok:false, err:'older', sv, data}; the client takes the newer save instead of overwriting it.
- The first successful p_base write for a player sets base_guarded = true. It is never cleared by a save.
- After that, a write WITHOUT p_base for that player (an old build in another tab or on another device, or any code path that forgot the
  base) is refused, atomically: {ok:false, err:'upgrade_required', sv}. No data in that reply, so an old build changes nothing (live 4.32's
  v11 only adopts err 'older' with data); its progress stays on that device until it reloads to the new build. R10 shows a reload card.
- Players who never open R10 are not flagged: their saves work exactly as today (today's counter rule).

## Before
1. R10 is PASSED (DQ) and ready to release in the next few minutes. R10 must send p_base on EVERY write, including v16's ENG-RESET put.
2. Re-check production hasn't moved since 22 Nov 17:0x (read-only, Supabase SQL):
   select md5(pg_get_functiondef('public.tops_save3_put(jsonb)'::regprocedure));
   -> must be 8ec7c5ed166473e8f7187854102a0178 (what rollback.sql recreates, byte for byte). If it differs, stop and tell DQ.
   select column_name from information_schema.columns where table_name='tops_saves_s3';   -> user_id, data, updated_at (no base_guarded yet)
3. Backup of the rows: create table public.tops_saves_s3_bak_20261123 as select * from public.tops_saves_s3;  (drop it a week later)

## Apply
Run guard.sql as ONE migration (Supabase apply_migration, name: tops_save3_guard_v3). One transaction:
- alter table tops_saves_s3 add column if not exists base_guarded boolean not null default false (every existing row: false)
- drop the old 1-arg function; create tops_save3_put(p_data jsonb, p_base bigint default null) SECURITY DEFINER, search_path ''
- revoke EXECUTE from public/anon/authenticated/service_role (Supabase's default privileges grant it to all), grant to authenticated and
  service_role; revoke insert/update/delete/truncate on tops_saves_s3 from anon and authenticated; drop the own_insert and own_update
  policies (own_select stays; clients read select('data') only, so the new column is invisible to them)
- notify pgrst to reload its schema cache

## Check, straight after (two minutes), then release R10
A. Database: run postcheck.sql in the SQL editor. It rolls itself back (it ends by raising an error whose message is the result). Expect:
   "QA-CHECK (rolled back): first save (p_data only):true | old client before the flag:true | new client, current base:true |
   old client after the flag:upgrade_required | stale base:older sv 7 | new client again:true | direct update refused"
   Before the guard (and after a rollback) it says instead: "function public.tops_save3_put(jsonb, integer) does not exist".
B. The live endpoint (PostgREST's cache): in a browser console on the live site, signed OUT:
   const K='sb_publishable_zJXcxBrjvBA9OeKCIqRTow_bFvBxgLw', U='https://thyirfwoqkshsaqowdpe.supabase.co/rest/v1/rpc/tops_save3_put';
   for (const b of [{p_data:{}},{p_data:{},p_base:0}]) console.log(JSON.stringify(b), (await fetch(U,{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'content-type':'application/json'},body:JSON.stringify(b)})).status);
   Expect AFTER: both 401 (anon has no EXECUTE, so both call shapes reach the new function). BEFORE: 200 and 404 PGRST202.
   If either still shows the BEFORE answer a minute after the apply: run  notify pgrst, 'reload schema';  once.
C. Then release R10. On a real device, signed in: play or change anything; the save reaches the cloud (tops_saves_s3.updated_at moves) and
   that player's row now has base_guarded = true:
   select user_id, data->>'sv' sv, updated_at, base_guarded from public.tops_saves_s3 order by updated_at desc;

## If anything is wrong: rollback.sql (one transaction)
Recreates today's function exactly, its grants, the table grants and both write policies, and reloads the cache. It KEEPS the base_guarded
column (today's function ignores it; a later re-apply then still knows who has a new client). Run check A again: it must say
"function ... (jsonb, integer) does not exist". Players' saves are untouched by apply or rollback.
If R10 is rolled back but the guard stays: flagged players' R9-and-older tabs get 'upgrade_required' and keep progress locally only, so
roll the guard back too (rollback.sql) whenever the client goes back below R10.

## Tested
pgtest.py on a local Postgres 16 with RLS, Supabase's roles, default privileges and auth.uid(): 47/47. v2's 25 (both races, stale
refused, old clients unchanged before the flag, direct writes refused, anon refused, rollback restores production's function text exactly)
plus v3's flag cases: set on the first p_base write, never cleared, old client refused upgrade_required with no data, a refused p_base
call doesn't change it, a delayed put after the lock moved refused, equal-version conflicts, retry of a landed put, ENG-RESET with a base
(and refused if it resets the counter or omits the base), an old client racing the first p_base save (with and without a row) refused,
a player can't clear the flag directly, rollback keeps the column and re-apply keeps the flags. postcheck.sql run locally: the expected
line above, and nothing left behind.
