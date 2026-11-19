#!/usr/bin/env bash
# Ship a LOW-risk item (art, text, UI, visuals) on the author's own tests (Hayden's 17:03 process, 19 Nov).
#   tools/ship-low.sh COMMIT "ITEM" [tests] [--dry]
# What it does, so the caller types one line:
#  1. resolves COMMIT and refuses unless its feature-branch CI (commit status tops/fast-suite) is green;
#  2. refuses unless the commit already contains src (so the suite ran on exactly the tree that ships) and takes its tree;
#  3. dispatches release.yml as R3 with the attest 'AUTHOR TESTS PASS names this tree' via tools/dispatch-release.sh.
# R0-R2 (throw, aim, money, saves, difficulty) are NOT for this: they still need a Q&D PASS line and tools/dispatch-release.sh.
# --dry dispatches mode=dry_run (the gate and the build, no publish).
set -euo pipefail
REPO=${REPO:-hdnkelly-max/double-out}
DRY=; ARGS=(); for a in "$@"; do [ "$a" = --dry ] && DRY=1 || ARGS+=("$a"); done
[ ${#ARGS[@]} -ge 2 ] || { echo 'usage: tools/ship-low.sh COMMIT "ITEM" [tests] [--dry]'; exit 2; }
C=${ARGS[0]}; ITEM=${ARGS[1]}; TESTS=${ARGS[2]:-fast suite (tops/fast-suite green)}
cd "$(git rev-parse --show-toplevel)"
git fetch -q origin src
C=$(git rev-parse --verify "$C^{commit}") || { echo "unknown commit $C (fetch its branch first)"; exit 1; }
st=$(gh api "repos/$REPO/commits/$C/statuses" --jq 'first(.[]|select(.context=="tops/fast-suite")) | .state+" "+.description' 2>/dev/null || true)
case "$st" in
  success*) echo "fast suite: $st" ;;
  "") echo "REFUSED: $C has no tops/fast-suite result (push it to a feature branch and wait for CI)"; exit 1 ;;
  *) echo "REFUSED: tops/fast-suite on ${C:0:7} is '$st', not green"; exit 1 ;;
esac
# the green fast suite must have run on exactly what ships: so the commit must already contain src (then release.yml's merge is a no-op)
git merge-base --is-ancestor origin/src "$C" || { echo "REFUSED: ${C:0:7} does not contain src $(git rev-parse --short origin/src); rebase onto src, push, wait for the fast suite, then ship"; exit 1; }
T=$(git rev-parse "$C^{tree}")
BASE=$(git rev-parse --short origin/src); MODE=release; [ -n "$DRY" ] && MODE=dry_run
echo "shipping R3 ${C:0:7} tree ${T:0:7} base $BASE item '$ITEM'${DRY:+ (dry run)}"
BY=author exec tools/dispatch-release.sh R3 "$C" "$T" "$ITEM" "$BASE" "$TESTS" none "$MODE"
