# DQ: a tiny local stand-in for PostgREST in front of the REAL guard v3 function on the local Postgres 16 (port 55432).
# POST /rpc {uid, p_data, p_base?}  -> the function's jsonb reply (called as role authenticated with auth.uid() = uid)
# GET  /row?uid=...                 -> {data} or null (what select('data') would return)
# POST /seed {uid, data, guarded}   -> sets the row directly (test setup only, as postgres)
# POST /reset                       -> empties the table
import json, psycopg2, threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
C = lambda: psycopg2.connect(host='/tmp', port=55432, user='postgres')
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def out(self, o): b = json.dumps(o).encode(); self.send_response(200); self.send_header('content-type', 'application/json'); self.send_header('content-length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        c = C(); c.autocommit = True; k = c.cursor()
        if u.path == '/row':
            k.execute("select data, base_guarded from public.tops_saves_s3 where user_id = %s", (q['uid'][0],)); r = k.fetchone()
            self.out(r and {'data': r[0], 'guarded': r[1]})
        c.close()
    def do_POST(self):
        n = int(self.headers.get('content-length') or 0); body = json.loads(self.rfile.read(n) or b'{}'); u = urlparse(self.path)
        c = C(); c.autocommit = True; k = c.cursor()
        try:
            if u.path == '/rpc':
                k.execute("set qa.uid = %s", (body['uid'],)); k.execute("set role authenticated")
                if 'p_base' in body: k.execute("select public.tops_save3_put(%s::jsonb, %s)", (json.dumps(body['p_data']), body['p_base']))
                else: k.execute("select public.tops_save3_put(%s::jsonb)", (json.dumps(body['p_data']),))
                self.out(k.fetchone()[0])
            elif u.path == '/seed':
                k.execute("insert into public.tops_saves_s3(user_id,data,updated_at,base_guarded) values (%s,%s::jsonb,now(),%s) on conflict (user_id) do update set data=excluded.data, base_guarded=excluded.base_guarded", (body['uid'], json.dumps(body['data']), bool(body.get('guarded'))))
                self.out({'ok': True})
            elif u.path == '/reset':
                k.execute("delete from public.tops_saves_s3"); self.out({'ok': True})
        except Exception as e:
            self.out({'pgerror': str(e).split('\n')[0]})
        c.close()
ThreadingHTTPServer(('127.0.0.1', 55500), H).serve_forever()
