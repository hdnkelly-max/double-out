#!/bin/bash
# usage: [QA_PASSED=<commit>] ship.sh "v1.xx: message"   -> copies the build live + /next/, commits, pushes, watches the Pages deploy
set -e
MSG="$1"; SRC=/home/claude/oche-next; R=/home/claude/double-out
# the release must be committed, so the src push below matches exactly what went live
if [ -n "$(git -C $SRC status --porcelain --untracked-files=no)" ]; then echo "SHIP BLOCKED: uncommitted changes in $SRC"; exit 1; fi
# always rebuild from the committed source, so the file that ships (and the gate tests) is never a stale build
(cd $SRC && node build.js >/dev/null) || { echo "SHIP BLOCKED: build.js failed"; exit 1; }
# regression gate: real matches in a headless browser; a failure blocks the ship (SKIP_REGRESS=1 to bypass in an emergency)
# QA_PASSED=<commit>: skip the rerun only when the release is that QA-passed commit plus the version bump (rule 12);
# any other difference (merge changes, extra commits) and the gate runs as normal
if [ -z "$SKIP_REGRESS" ] && [ -n "$QA_PASSED" ] && git -C $SRC diff --quiet "$QA_PASSED" HEAD -- . ':(exclude)v051.js'; then
  echo "regress: skipped, release = QA-passed $QA_PASSED + version bump (QA ran regress.js on it)"; SKIP_REGRESS=1
elif [ -n "$QA_PASSED" ]; then echo "regress: release differs from QA-passed $QA_PASSED beyond the version bump, running the gate"; fi
if [ -z "$SKIP_REGRESS" ]; then set +e; OUT=$(node $SRC/tests/regress.js 2 2>&1); RC=$?; set -e; echo "$OUT" | grep -E "^regress|REGRESSION|^- (match|page)"; if [ $RC -ne 0 ]; then echo "SHIP BLOCKED by regression suite"; exit 1; fi; fi
# the main checkout can fall behind when main is pushed from elsewhere (12 Nov 13:24 reject): sync it first
git -C $R fetch -q origin main && git -C $R merge -q --ff-only origin/main || { echo "SHIP BLOCKED: $R main is not a fast-forward of origin/main"; exit 1; }
cp $SRC/double-out-standalone.html $R/index.html
# preview shares the live assets: one base tag, no duplicate files
python3 - "$SRC/double-out-standalone.html" "$R/next/index.html" <<'P'
import sys;s=open(sys.argv[1],encoding='utf-8').read();s=s.replace('<meta charset="utf-8">','<meta charset="utf-8"><base href="../">',1);open(sys.argv[2],'w',encoding='utf-8').write(s)
P
VER=$(grep -o "TOPS_VER='[0-9.]*'" $SRC/v051.js | grep -o "[0-9.]*" | head -1); echo "{\"v\":\"$VER\"}" > $R/version.json
mkdir -p $R/assets/ui $R/assets/voice
cp $SRC/assets/ui/* $R/assets/ui/ 2>/dev/null || true
cp $SRC/assets/voice/* $R/assets/voice/ 2>/dev/null || true
cp $SRC/img/menu_*.jpg $R/img/ 2>/dev/null || true
cd $R
git add -A index.html version.json next assets img manifest.webmanifest sw.js icon-*.png 2>/dev/null || true
git commit -qm "$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WmQEKZ7N76uwtfmwPmhGWk" || echo "nothing to commit"
git push -q
SHA=$(git rev-parse --short=7 HEAD); echo "pushed $SHA"
# watchdog: wait for this commit's Pages run; cancel + re-trigger if it sits queued > 3 min or fails
for attempt in 1 2 3; do
  START=$(date +%s)
  while true; do
    sleep 15
    L=$(gh run list --limit 5 --json status,conclusion,headSha,databaseId,createdAt -q ".[]|select(.headSha|startswith(\"$SHA\"))|[.status,.conclusion,.databaseId]|@tsv" | head -1)
    ST=$(echo "$L"|cut -f1); CO=$(echo "$L"|cut -f2); ID=$(echo "$L"|cut -f3)
    # stuck older runs block the queue: cancel anything queued that isn't ours
    for old in $(gh run list --limit 6 --json status,headSha,databaseId -q ".[]|select(.status==\"queued\" and (.headSha|startswith(\"$SHA\")|not))|.databaseId"); do gh run cancel $old >/dev/null 2>&1 || true; done
    NOW=$(date +%s)
    if [ "$ST" = "completed" ]; then echo "deploy $CO ($ID)"; [ "$CO" = "success" ] && { git -C $SRC push -q origin HEAD:src && echo "src pushed $(git -C $SRC rev-parse --short=7 HEAD)" || echo "src push failed (live is fine; push src by hand)"; exit 0; }; break; fi
    if [ "$ST" = "queued" ] && [ $((NOW-START)) -gt 180 ]; then echo "queued too long, cancelling $ID"; gh run cancel $ID >/dev/null 2>&1 || true; break; fi
    if [ $((NOW-START)) -gt 900 ]; then echo "timeout"; break; fi
  done
  git commit -q --allow-empty -m "Re-trigger Pages deploy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WmQEKZ7N76uwtfmwPmhGWk"; git push -q; SHA=$(git rev-parse --short=7 HEAD); echo "re-pushed $SHA"
done
exit 1
