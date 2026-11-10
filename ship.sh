#!/bin/bash
# usage: ship.sh "v0.xx: message"   -> copies the build live + /next/, commits, pushes, watches the Pages deploy
set -e
MSG="$1"; SRC=/home/claude/oche-next; R=/home/claude/double-out
# regression gate: real matches in a headless browser; a failure blocks the ship (SKIP_REGRESS=1 to bypass in an emergency)
if [ -z "$SKIP_REGRESS" ]; then set +e; OUT=$(node $SRC/tests/regress.js 2 2>&1); RC=$?; set -e; echo "$OUT" | grep -E "^regress|REGRESSION|^- (match|page)"; if [ $RC -ne 0 ]; then echo "SHIP BLOCKED by regression suite"; exit 1; fi; fi
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
Claude-Session: https://claude.ai/code/session_01WmQEKVWtrDN8rgTZ7Cjw6j" || echo "nothing to commit"
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
    if [ "$ST" = "completed" ]; then echo "deploy $CO ($ID)"; [ "$CO" = "success" ] && { bash $SRC/tools_push_src.sh "$MSG" || echo "src push failed"; exit 0; }; break; fi
    if [ "$ST" = "queued" ] && [ $((NOW-START)) -gt 180 ]; then echo "queued too long, cancelling $ID"; gh run cancel $ID >/dev/null 2>&1 || true; break; fi
    if [ $((NOW-START)) -gt 900 ]; then echo "timeout"; break; fi
  done
  git commit -q --allow-empty -m "Re-trigger Pages deploy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WmQEKVWtrDN8rgTZ7Cjw6j"; git push -q; SHA=$(git rev-parse --short=7 HEAD); echo "re-pushed $SHA"
done
exit 1
