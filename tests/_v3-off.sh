#!/usr/bin/env bash
# rel-v3-off (Producer Sun 05:09, decision A): the PRIMARY v3 rollback is a one-line release through the normal pipeline.
# Run in a src checkout at the commit to roll back FROM (normally origin/src after the switch-on): it sets the models' default back
# to off (game4.js: const V3D=1 -> const V3D=0) and commits that one line, nothing else. The "_" keeps CI from running it as a test.
#   git fetch origin src && git checkout -B rel-v3-off origin/src && bash tests/_v3-off.sh && git push -f origin rel-v3-off
# HARD=1 makes it const V3D=-1: off for everyone, including testers with ?v3=1 or a stored 1 (for a severe models fault).
set -euo pipefail
n=$(grep -c "const V3D=1;" game4.js || true)
[ "$n" = 1 ] || { echo "rel-v3-off: expected exactly one 'const V3D=1;' in game4.js (found $n): is the switch-on in this src?" >&2; exit 1; }
TO=0; [ "${HARD:-}" = 1 ] && TO=-1
sed -i "s/const V3D=1;/const V3D=$TO;/" game4.js
[ "$(git diff --numstat | awk '{print $1"+"$2" "$3}')" = "1+1 game4.js" ] || { echo "rel-v3-off: the change is not exactly one line of game4.js" >&2; git diff --stat >&2; exit 1; }
git -c user.name="${GIT_AUTHOR_NAME:-tops-qa}" -c user.email="${GIT_AUTHOR_EMAIL:-tops-qa@users.noreply.github.com}" commit -qam "rel-v3-off: the v3 models' default back to off (TOPS_V3FLAG, const V3D=$TO); nothing else changes"
echo "rel-v3-off: $(git rev-parse HEAD) tree $(git rev-parse HEAD^{tree})"
