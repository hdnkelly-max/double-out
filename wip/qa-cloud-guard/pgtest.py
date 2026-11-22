# Real Postgres 16, two sessions. Stubs: roles, auth.uid() from a session setting, the table as on prod (pk user_id).
import psycopg2, threading, time, json, re
C = lambda: psycopg2.connect(host='/tmp', port=55432, user='postgres')
U = '00000000-0000-4000-8000-00000000c10d'
def sql(f): return re.sub(r'notify pgrst[^;]*;', '', open('/tmp/claude-0/guard/' + f).read())
a = C(); a.autocommit = True; x = a.cursor()
x.execute("drop schema if exists public cascade; create schema public; drop schema if exists auth cascade; create schema auth")
for r in ('anon', 'authenticated', 'service_role'):
    x.execute(f"do $$ begin create role {r}; exception when duplicate_object then null; end $$")
# Supabase's default privileges, as on the project (pg_default_acl, 22 Nov): new public functions get EXECUTE for anon, authenticated, service_role
x.execute("alter default privileges in schema public grant execute on functions to anon, authenticated, service_role")
x.execute("create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('qa.uid', true),'')::uuid $$")
x.execute("create table public.tops_saves_s3(user_id uuid primary key, data jsonb, updated_at timestamptz); alter table public.tops_saves_s3 enable row level security; grant usage on schema public, auth to anon, authenticated, service_role; grant execute on function auth.uid() to anon, authenticated; grant all on public.tops_saves_s3 to anon, authenticated, service_role")
x.execute("create policy tops_saves_s3_own_select on public.tops_saves_s3 for select using (auth.uid() = user_id)")
res = []
def chk(n, got, want): ok = got == want; res.append(('PASS ' if ok else 'FAIL ') + n + ('' if ok else f'  got {got} want {want}'))
def sess():
    c = C(); c.autocommit = True; k = c.cursor(); k.execute("set qa.uid = %s", (U,)); k.execute("set role authenticated"); return c, k
def put(k, sv, dev, bank, base='legacy'):
    if base == 'legacy': k.execute("select public.tops_save3_put(%s::jsonb)", (json.dumps({'sv': sv, 'dev': dev, 'bank': bank}),))
    else: k.execute("select public.tops_save3_put(%s::jsonb, %s)", (json.dumps({'sv': sv, 'dev': dev, 'bank': bank}), base))
    return k.fetchone()[0]
def stored(): x.execute("select data from public.tops_saves_s3"); r = x.fetchone(); return r and r[0]
def reset(): x.execute("delete from public.tops_saves_s3")
_, k = sess()
def stale(base):
    reset(); put(k, 2200, 'A', 2050, base if base == 'legacy' else None); b = put(k, 2235, 'B', 2300, 'legacy' if base == 'legacy' else 2200)
    return b, put(k, 2238, 'A', 2050, base), stored()
x.execute(sql('rollback.sql'))   # today's function
b, r, s = stale('legacy'); chk("today: B's progress saved", b['ok'], True); chk("today: A (sv 2238, never saw B) overwrites B", (r['ok'], s['bank']), (True, 2050))
x.execute(sql('guard.sql'))
b, r, s = stale(2200); chk("guard: A sends base 2200, refused, gets B's save back (today's reply shape)", (r['ok'], r['err'], r['sv'], r['data']['bank'], s['bank'], sorted(r)), (False, 'older', 2235, 2300, 2300, ['data', 'err', 'ok', 'sv']))
b, r, s = stale('legacy'); chk("guard, client without base: exactly today's rule (still overwrites)", (r['ok'], s['bank']), (True, 2050))
reset(); put(k, 2201, 'B', 2300, None); chk("A synced B's save (base 2201) and saves on", put(k, 2202, 'A', 2300, 2201)['ok'], True)
reset(); put(k, 2200, 'A', 1, None); chk("same device, its base current: ok", put(k, 2205, 'A', 2, 2200)['ok'], True)
reset(); put(k, 2205, 'A', 1, None); r = put(k, 2210, 'A', 2, 2200); chk("same device, base behind (a lost reply): refused, gets its own newer copy (no exemption, ChatGPT P1-1)", (r['ok'], r['data']['bank']), (False, 1))
reset(); put(k, 2200, 'A', 1, None); chk("cloud reset below base (2200 < 2205): refused", put(k, 2206, 'A', 1, 2205)['ok'], False)
reset(); put(k, 2300, 'B', 1, None); chk("today's rule still applies with a base: lower sv", put(k, 2299, 'A', 1, 2300)['ok'], False); chk("equal sv from another device", put(k, 2300, 'A', 1, 2300)['ok'], False)
reset(); chk("first save ever, base 0", put(k, 5, 'A', 1, 0)['ok'], True)
c2, k2 = sess(); k2.execute("reset qa.uid"); chk("signed out", put(k2, 1, 'A', 1, 0)['err'], 'signed out')
# concurrency 1: both devices synced at 2200, both push at once. Session 1 holds its transaction open; session 2 must wait, then be refused.
reset(); put(k, 2200, 'A', 2050, None)
c1, k1 = sess(); c1.autocommit = False; c2, k2 = sess(); out = {}
r1 = put(k1, 2201, 'A', 2100, 2200)
def t2(): t = time.time(); out['r'] = put(k2, 2201, 'B', 2300, 2200); out['wait'] = time.time() - t
th = threading.Thread(target=t2); th.start(); time.sleep(1.5); blocked = th.is_alive(); c1.commit(); th.join(10)
chk("two pushes at once from the same base: the second waits for the first", blocked, True)
chk("... then is refused with the first's save; one writer wins", (r1['ok'], out['r']['ok'], out['r']['data']['bank'], stored()['bank']), (True, False, 2100, 2100))
# concurrency 2: no row yet, two first saves at once (base 0 = "the cloud was empty when I looked")
reset(); c1, k1 = sess(); c1.autocommit = False; c2, k2 = sess(); out = {}
r1 = put(k1, 3, 'A', 10, 0)
th = threading.Thread(target=lambda: out.update(r=put(k2, 4, 'B', 20, 0))); th.start(); time.sleep(1.5); blocked = th.is_alive(); c1.commit(); th.join(10)
chk("two first saves at once: second waits, then is refused (ON CONFLICT ... WHERE)", (blocked, r1['ok'], out['r']['ok'], out['r'].get('err'), stored()['bank']), (True, True, False, 'older', 10))
# grants: as on prod (no PUBLIC); one function only, so a call with p_data alone resolves to it
# the direct write is closed, reading your own row still works
_, kd = sess(); reset(); put(k, 7, 'A', 1, None)
try: kd.execute("update public.tops_saves_s3 set data = '{\"sv\":99}'"); direct = 'allowed, rows %d' % kd.rowcount
except Exception as e: direct = 'refused: ' + type(e).__name__
chk("a player's direct UPDATE is refused", direct.startswith('refused'), True)
try: kd.execute("insert into public.tops_saves_s3 values (%s, '{}', now()) on conflict (user_id) do update set data = excluded.data", (U,)); di = 'allowed'
except Exception as e: di = 'refused'
chk("a player's direct upsert is refused", di, 'refused')
kd.execute("select data->>'sv' from public.tops_saves_s3"); chk("a player still reads their own row", kd.fetchone()[0], '7')
_, ko = sess(); ko.execute("set qa.uid = '00000000-0000-4000-8000-0000000000ff'"); r = put(ko, 1, 'X', 1, None); ko.execute("select count(*) from public.tops_saves_s3"); n_vis = ko.fetchone()[0]
x.execute("select count(*) from public.tops_saves_s3"); chk("another player's call writes only their own row, sees only it", (r['ok'], n_vis, x.fetchone()[0]), (True, 1, 2))
c3 = C(); c3.autocommit = True; k3 = c3.cursor(); k3.execute("set role anon")
try: put(k3, 1, 'A', 1, 0); an = 'allowed'
except Exception as e: an = 'refused'
chk("anon can't call the function", an, 'refused')
x.execute("select pg_get_function_identity_arguments(p.oid), array(select grantee::regrole::text from aclexplode(p.proacl) where grantee<>0) from pg_proc p where proname='tops_save3_put'")
rows = x.fetchall(); chk("one function, grants authenticated/service_role, not PUBLIC or anon", (len(rows), rows[0][0], sorted(set(rows[0][1]) - {'postgres'})), (1, 'p_data jsonb, p_base bigint', ['authenticated', 'service_role']))
x.execute(sql('rollback.sql')); b, r, s = stale('legacy'); chk("rollback: today's function and behaviour back", (r['ok'], s['bank']), (True, 2050))
x.execute("select count(*) from pg_proc where proname='tops_save3_put'"); chk("rollback leaves one function", x.fetchone()[0], 1)
_, kd = sess(); kd.execute("update public.tops_saves_s3 set updated_at = now()"); chk("rollback: the direct write works again (today)", kd.rowcount, 1)
x.execute("select md5(pg_get_functiondef(p.oid)) from pg_proc p where proname='tops_save3_put'"); chk("rollback recreates production's function text exactly (md5 of pg_get_functiondef, prod 22 Nov 17:0x)", x.fetchone()[0], '8ec7c5ed166473e8f7187854102a0178')
print('\n'.join(res)); print(f"{sum(r.startswith('PASS') for r in res)}/{len(res)} pass")
