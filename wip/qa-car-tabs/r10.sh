#!/bin/bash
# DQ R10 final: real guard v3 on local Postgres behind brk/pgshim.py; tabs-r8 matrix (A3 on the real function); tabs-r10 server cases; s3-tabs x3; break; cloud rows
export SBJS=/tmp/claude-0/sbjs/node_modules/@supabase/supabase-js/dist/umd/supabase.js
cd /tmp/claude-0/guard && python3 -c "
import psycopg2,re
c=psycopg2.connect(host='/tmp',port=55432,user='postgres'); c.autocommit=True; x=c.cursor()
x.execute(re.sub(r'notify pgrst[^;]*;','',open('guard.sql').read())); x.execute('delete from public.tops_saves_s3')
x.execute(\"select md5(pg_get_functiondef(p.oid)) from pg_proc p where proname='tops_save3_put'\"); print('local guard v3 installed, md5', x.fetchone()[0])"
python3 /tmp/claude-0/brk/pgshim.py > /tmp/claude-0/pgshim.log 2>&1 & SHIM=$!; sleep 1
cd /tmp/claude-0/wt-ci
for c in 1 4; do echo "== tabs-r10 server cases CPU x$c"; CPU=$c OLDDIR=/tmp/claude-0/wt-432 timeout 2400 node tests/_r10.js /tmp/claude-0/wt-tabs C1,C2,C3,C4 2>&1 | grep -E "^(PASS|FAIL|ERR|TRACE)|pass, " | cut -c1-1200; done
for d in 0 2000 8000; do echo "== tabs-r8 CPU x4 DLY $d (A3 on the real function)"; MOCK_RULE=realdb DLY=$d CPU=4 timeout 3600 node tests/_r8.js /tmp/claude-0/wt-tabs A1,A2,A2b,A3,A4 2>&1 | grep -E "^(PASS|FAIL|ERR|TRACE)|pass, " | cut -c1-900; done
for d in 0 8000; do echo "== FALLBACK (TABS_NOLOCKS) tabs-r8 CPU x4 DLY $d"; NOLOCKS=1 DLY=$d CPU=4 timeout 2400 node tests/_r8.js /tmp/claude-0/wt-tabs A2,A2b,A4 2>&1 | grep -E "^(PASS|FAIL|ERR|TRACE)|pass, " | cut -c1-900; done
echo "== s3-tabs x3"; cd /tmp/claude-0/wt-tabs; for i in 1 2 3; do r=""; for t in s3-tabs s3-tabs-2 s3-tabs-3 s3-tabs-4; do timeout 900 node tests/$t.js /tmp/claude-0/wt-tabs > /tmp/claude-0/r10_${t}_$i.log 2>&1; rc=$?; r="$r $t=$rc"; [ $rc != 0 ] && r="$r[$(grep -E '^- ' /tmp/claude-0/r10_${t}_$i.log | cut -c1-300 | tr '\n' ' ')]"; done; echo "run $i:$r"; done
echo "== s3-tabs fallback (TABS_NOLOCKS=1)"; r=""; for t in s3-tabs s3-tabs-2 s3-tabs-3 s3-tabs-4; do TABS_NOLOCKS=1 timeout 900 node tests/$t.js /tmp/claude-0/wt-tabs > /tmp/claude-0/r10nl_${t}.log 2>&1; rc=$?; r="$r $t=$rc"; [ $rc != 0 ] && r="$r[$(grep -E '^- ' /tmp/claude-0/r10nl_${t}.log | cut -c1-300 | tr '\n' ' ')]"; done; echo "fallback:$r"
cd /tmp/claude-0/wt-ci; echo "== break script"; cp /tmp/claude-0/brk/tabs-break.js tests/_tb.js; timeout 1800 node tests/_tb.js /tmp/claude-0/wt-tabs /tmp/claude-0/wt-base /tmp/claude-0/brk/shots10 2>&1 | grep -E "^(PASS|FAIL|ERR|INFO)|pass, " | cut -c1-220; rm -f tests/_tb.js
for m in realdb today; do echo "== cloud rows, server rule $m"; MOCK_RULE=$m OUT=/tmp/claude-0/cl-r10-$m.json timeout 1500 node tests/switch-on.js /tmp/claude-0/wt-tabs cloud >/dev/null 2>&1; python3 -c "
import json;[print(('PASS' if r['ok'] else 'FAIL'),r['check'],'::',r['note'][:200]) for r in json.load(open('/tmp/claude-0/cl-r10-$m.json'))['rows']]"; done
kill $SHIM; echo DONE
