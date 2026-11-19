#!/usr/bin/env bash
# Ship-time log (DQ-IDLE-1, for the Overseer to report to Hayden): how long each release took, leg by leg, from what GitHub records.
#   tools/ship-times.sh [YYYY-MM-DD (UTC day, default today)] [--md]
# Per release in RELEASES.log on that day:
#   done     = the released commit's commit time (the author finished)
#   ci       = its feature-branch CI (ci.yml) push run finished green (author / LOW path; "-" when it had none)
#   queued   = the release run was dispatched;  started = it started running (after any wait for the release lock)
#   live     = the release run finished (release.yml finishes only once the live site shows the new version)
#   checked  = the live check after it finished (live-check.yml; "-" until that workflow is on main)
# Legs: done->dispatch (waiting to be shipped), queue (waiting for the lock), release (gate+build+deploy+live), total done->live.
# The "request" time (when Hayden or the Overseer asked) is not recorded anywhere yet; see DQ-IDLE-1 for the tracker stage log.
set -euo pipefail
REPO=${REPO:-hdnkelly-max/double-out}
DAY=$(date -u +%F); MD=; for a in "$@"; do case "$a" in --md) MD=1;; *) DAY=$a;; esac; done
cd "$(git rev-parse --show-toplevel)"; git fetch -q origin main
ts(){ [ -n "${1:-}" ] && [ "$1" != null ] && date -u -d "$1" +%s || echo; }
mins(){ [ -n "$1" ] && [ -n "$2" ] && awk -v a="$1" -v b="$2" 'BEGIN{d=(b-a)/60; printf (d<0?"-":"%.0f"), d}' || echo -; }
hm(){ [ -n "$1" ] && TZ=Pacific/Auckland date -d "@$1" +%H:%M || echo -; }
rows=(); legs_wait=(); legs_rel=(); legs_tot=()
while IFS= read -r line; do
  v=$(sed -n 's/.* version=\([0-9.]*\) .*/\1/p' <<<"$line"); c=$(sed -n 's/.* commit=\([0-9a-f]*\) .*/\1/p' <<<"$line"); r=$(sed -n 's/.* risk=\(R[0-3]\) .*/\1/p' <<<"$line")
  run=$(sed -n 's/.* run=\([0-9]*\) .*/\1/p' <<<"$line"); by=$(sed -n 's/.* by=\([a-z]*\) .*/\1/p' <<<"$line"); item=$(sed -n 's/.* item=\(.*\)/\1/p' <<<"$line" | cut -c1-48)
  [ -n "$run" ] || continue
  git cat-file -e "$c^{commit}" 2>/dev/null || git fetch -q origin "$c" 2>/dev/null || true
  done_t=$(git log -1 --format=%ct "$c" 2>/dev/null || echo)
  read -r q s l < <(gh api "repos/$REPO/actions/runs/$run" --jq '[.created_at,.run_started_at,.updated_at]|@tsv' | tr '\t' ' ')
  q=$(ts "$q"); s=$(ts "$s"); l=$(ts "$l")
  # the release job itself can start later than run_started_at when it waited for the lock: use the first job's start
  s2=$(ts "$(gh api "repos/$REPO/actions/runs/$run/jobs" --jq '[.jobs[].started_at]|min' 2>/dev/null || echo)"); [ -n "$s2" ] && s=$s2
  ci=$(ts "$(gh api "repos/$REPO/actions/workflows/ci.yml/runs?head_sha=$c&event=push&per_page=20" --jq '[.workflow_runs[]|select(.conclusion=="success")|.updated_at]|min // empty' 2>/dev/null || echo)")
  ck=$(ts "$(gh api "repos/$REPO/actions/workflows/live-check.yml/runs?per_page=50" --jq "[.workflow_runs[]|select(.display_title|contains(\"commit=$c\"))|.updated_at]|min // empty" 2>/dev/null || echo)")
  w=$(mins "$done_t" "$q"); qu=$(mins "$q" "$s"); rl=$(mins "$s" "$l"); tot=$(mins "$done_t" "$l")
  rows+=("$v|${r:-?}|${by:-qa}|$(hm "$done_t")|$(hm "$ci")|$(hm "$q")|$(hm "$l")|$(hm "$ck")|$w|$qu|$rl|$tot|$item")
  [ "$w" != - ] && legs_wait+=("$w"); [ "$rl" != - ] && legs_rel+=("$rl"); [ "$tot" != - ] && legs_tot+=("$tot")
done < <(git show origin/main:RELEASES.log | grep "^$DAY" | grep ' live version=' || true)
med(){ [ $# -gt 0 ] && printf '%s\n' "$@" | sort -n | awk '{a[NR]=$1} END{print (NR%2?a[(NR+1)/2]:(a[NR/2]+a[NR/2+1])/2)}' || echo -; }
H="ver|risk|by|done|ci green|dispatched|live|checked|done->dispatch|queue|release|total|item"
if [ -n "$MD" ]; then echo "| ${H//|/ | } |"; echo "|$(sed 's/[^|]*/---/g' <<<"$H")|"; for x in "${rows[@]}"; do echo "| ${x//|/ | } |"; done
else { echo "$H"; printf '%s\n' "${rows[@]}"; } | awk -F'|' '{for(i=1;i<=NF;i++){c[NR,i]=$i; if(length($i)>w[i])w[i]=length($i)} n=NF; r=NR} END{for(j=1;j<=r;j++){l=""; for(i=1;i<=n;i++) l=l sprintf("%-*s  ", w[i], c[j,i]); print l}}'; fi
echo; echo "$DAY (NZ times): ${#rows[@]} releases. Median minutes: done->dispatch $(med "${legs_wait[@]}"), release run $(med "${legs_rel[@]}"), done->live $(med "${legs_tot[@]}")."
