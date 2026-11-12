#!/usr/bin/env bash
# CAR-4: runs sql/reports/*.sql against a scratch Postgres loaded with the real sql/tops_perf.sql and tests/perf-report-fixture.sql,
# and checks the known answers. Needs a local Postgres (psql) and the migration's Supabase stubs (auth.uid(), roles).
# usage: PGHOST=/var/tmp/carpg PGPORT=5499 PGUSER=postgres tests/perf-report.sh
set -euo pipefail
cd "$(dirname "$0")/.."
Q="psql -v ON_ERROR_STOP=1 -q -X"
$Q -f tests/perf-report-fixture.sql
fail=0
# readout 1: per match
out=$($Q -At -F'|' -f sql/reports/perf_by_match.sql)
echo "$out" | cut -d'|' -f1,2,3,5,11,13,18,27,28 | sed 's/^/  by_match: /'
n=$(echo "$out" | grep -c . || true)
[ "$n" = 4 ] || { echo "FAIL by_match: want 4 matches (Hayden, last 24 h), got $n"; fail=1; }
echo "$out" | cut -d'|' -f1,2 | tr '\n' ' ' | grep -q '^1|1 1|2 1|3 2|1 $' || { echo "FAIL by_match: sessions/match order wrong"; fail=1; }
echo "$out" | head -1 | cut -d'|' -f5 | grep -qx end || { echo "FAIL by_match: match 1 should use its end row"; fail=1; }
echo "$out" | grep -q 'mL1\|mOld' && { echo "FAIL by_match: other player or old row included"; fail=1; }
# slow33 for match 2: (1500+400+80+20)/20000 = 10.0 %
echo "$out" | sed -n 2p | cut -d'|' -f27 | grep -qx '10.0' || { echo "FAIL by_match: slow33_pct for match 2 (want 10.0)"; fail=1; }
# readout 2: match 1 vs later
out2=$($Q -At -F'|' -f sql/reports/perf_match1_vs_later.sql)
echo "$out2" | cut -d'|' -f1,6,7,8,9,10,15,16,25,26 | sed 's/^/  m1_vs_later: /'
[ "$(echo "$out2" | grep -c .)" = 2 ] || { echo "FAIL m1_vs_later: want 2 sessions"; fail=1; }
l1=$(echo "$out2" | sed -n 1p)
[ "$(echo "$l1" | cut -d'|' -f6)" = 3 ] || { echo "FAIL m1_vs_later: session 1 matches (want 3)"; fail=1; }
[ "$(echo "$l1" | cut -d'|' -f9)" = 18.0 ] || { echo "FAIL m1_vs_later: p95_m1 (want 18.0)"; fail=1; }
[ "$(echo "$l1" | cut -d'|' -f10)" = 47.5 ] || { echo "FAIL m1_vs_later: p95_later (want 47.5)"; fail=1; }
[ "$(echo "$l1" | cut -d'|' -f25)" = 29.5 ] || { echo "FAIL m1_vs_later: p95_delta (want 29.5)"; fail=1; }
[ "$(echo "$out2" | sed -n 2p | cut -d'|' -f10)" = "" ] || { echo "FAIL m1_vs_later: single-match session should have no 'later'"; fail=1; }
# read-only: the reports contain no writes
grep -iqE '\b(insert|update|delete|truncate|drop|alter|create|grant)\b' sql/reports/*.sql && { echo "FAIL: a report contains a write statement"; fail=1; }
[ $fail = 0 ] && echo "PASS: perf reports (per match, match 1 vs later, end row preferred, sessions, window, player filter, slow %)" || exit 1
