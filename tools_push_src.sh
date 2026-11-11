#!/bin/bash
# Push the current game source to the `src` branch of hdnkelly-max/double-out (never ship from it).
set -e
SRC=/home/claude/oche-next; W=/home/claude/double-out-src; MSG="${1:-source sync}"
if [ ! -d $W/.git ]; then git clone -q --no-checkout "$(git -C /home/claude/double-out remote get-url origin)" $W; cd $W; (git fetch -q origin src && git checkout -q src) || git checkout -q --orphan src; fi
cd $W; git fetch -q origin src 2>/dev/null && git reset -q --hard origin/src 2>/dev/null || true
find $W -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
mkdir -p $W/env $W/tests $W/docs
cp $SRC/{build.js,engine.js,game4.js,career3.js,head3.html,body4.html,dartgeo.json,remy.b64.txt,v03.js,v04.js,v041.js,v05.js,v051.js,v06.js,v07.js,v08.js,v09.js,v10.js,v11.js,ship.sh,poseq.js,package.json} $W/ 2>/dev/null || true
cp $SRC/env/*.exr.js $W/env/ 2>/dev/null || true; mkdir -p $W/tc; cp $SRC/tc/* $W/tc/
cp $SRC/tests/*.js $W/tests/; mkdir -p $W/sql; cp $SRC/sql/*.sql $W/sql/ 2>/dev/null || true; cp $SRC/docs/fixlog.md $W/docs/ 2>/dev/null || true
cat > $W/README.md <<R
# TOPS game source (read-only mirror)
Synced by the build chat after every ship. **Never ship from this branch.** Live is \`main\`.
- Build: \`npm i three@0.128.0\` then \`node build.js\` (writes double-out-standalone.html). Assets (img/, assets/) live on \`main\`.
- Regression gate: \`node tests/regress.js 2\`
- Collectibles work goes on the \`collectibles\` branch under \`collectibles/\`; the build chat merges it.
Version: $(grep -o "TOPS_VER='[0-9.]*'" $SRC/v051.js)
R
git add -A; git -c user.name="TOPS build" -c user.email="build@tops.local" commit -qm "$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WmQEKVWtrDN8rgTZ7Cjw6j" || true
git push -q origin src 2>&1 | tail -1; echo "src pushed $(git rev-parse --short HEAD)"
