#!/usr/bin/env bash
# Warm a TOPS test workspace (rule 16.3). Run from the repo root on a clone of `src`: bash tests/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d node_modules/three ] || npm i --no-save three@0.128.0 >/dev/null
# assets live on main; copy them in without staging them on this branch
git fetch -q --depth=1 origin main
git checkout origin/main -- img assets && git reset -q -- img assets
# the dev index.html loads remy.glb; decode it from the base64 copy
[ -f remy.glb ] || node -e "require('fs').writeFileSync('remy.glb',Buffer.from(require('fs').readFileSync('remy.b64.txt','utf8').trim(),'base64'))"
node build.js
mkdir -p tests/out
echo "ready: index.html (dev, remy.glb), double-out-standalone.html (rig inlined)"
