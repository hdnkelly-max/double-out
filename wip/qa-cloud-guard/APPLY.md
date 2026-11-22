# Cloud save guard v2: apply step (Delivery QA, Sun 22 Nov). Hayden approved; apply AFTER CAR-TABS ships. The Producer applies; DQ doesn't.

## Before
1. CAR-TABS is live (its client sends p_base only after the server takes it once; until then it pushes exactly as today).
2. Re-check production hasn't moved since 22 Nov 17:0x (one read-only query, Supabase SQL):
   select md5(pg_get_functiondef('public.tops_save3_put(jsonb)'::regprocedure));
   -> must be 8ec7c5ed166473e8f7187854102a0178 (that's what rollback.sql recreates, byte for byte). If it differs, stop and tell DQ.
3. Backup of the 3 rows: create table public.tops_saves_s3_bak_20261122 as select * from public.tops_saves_s3;  (drop it a week later)

## Apply
Run guard.sql as ONE migration (Supabase apply_migration, name: tops_save3_guard_v2). It is a single transaction: drop the old
1-arg function, create tops_save3_put(p_data jsonb, p_base bigint default null) SECURITY DEFINER with search_path '', revoke EXECUTE from
public/anon/authenticated/service_role (Supabase's default privileges grant it to all of them), grant to authenticated and service_role,
revoke insert/update/delete/truncate on tops_saves_s3 from anon and authenticated, drop the own_insert and own_update policies (own_select
stays), notify pgrst to reload its schema cache.

## Check, straight after (two minutes)
A. Database: run postcheck.sql in the SQL editor. It rolls itself back (it ends by raising an error whose message is the result).
   Expect: "QA-CHECK (rolled back): first save (p_data only):true | old client, p_data only:true | new client, current base:true |
   stale base:older sv 7 | direct update refused". Before the guard (and after a rollback) it says instead:
   "function public.tops_save3_put(jsonb, integer) does not exist".
B. The live endpoint (PostgREST's cache): in a browser console on the live site, signed OUT:
   const K='sb_publishable_zJXcxBrjvBA9OeKCIqRTow_bFvBxgLw', U='https://thyirfwoqkshsaqowdpe.supabase.co/rest/v1/rpc/tops_save3_put';
   for (const b of [{p_data:{}},{p_data:{},p_base:0}]) console.log(JSON.stringify(b), (await fetch(U,{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'content-type':'application/json'},body:JSON.stringify(b)})).status);
   Expect AFTER: both 401 (permission denied for function: anon no longer has EXECUTE, which proves both call shapes reach the new function).
   BEFORE (today): 200 for p_data only ({"ok":false,"err":"signed out"}) and 404 PGRST202 for the p_base call.
   If either still shows the BEFORE answer a minute after the apply, the schema cache didn't reload: run  notify pgrst, 'reload schema';  once.
C. A real device: open the live game signed in, play or change anything, and check the save reaches the cloud (Supabase table
   tops_saves_s3, that user's updated_at moves). Within 24 h every CAR-TABS device starts sending p_base (its probe).

## If anything is wrong: rollback.sql (one transaction)
Recreates today's function exactly, its grants, the table grants and both write policies, and reloads the cache. Then run check A again:
it must say "function ... (jsonb, integer) does not exist" (today's shape). Players' saves are untouched by apply or rollback.

## Tested
pgtest.py on a local Postgres 16 with RLS, Supabase's roles, default privileges and auth.uid(): 25/25 (both races, stale refused, old
clients unchanged, direct writes refused, anon refused, rollback restores production's function text exactly). ChatGPT: APPROVE 9/10.
