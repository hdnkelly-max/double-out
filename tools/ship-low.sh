#!/usr/bin/env bash
# Ship a LOW-risk item (art, text, UI, visuals) on the author's own tests (Hayden's 17:03 process, 19 Nov).
#   tools/ship-low.sh COMMIT "ITEM" [tests] [--dry]
# What it does, so the caller types one line:
#  1. resolves COMMIT and refuses unless a feature-branch CI run (ci.yml, unchanged from src) on that commit is green;
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
# same checks release.yml's gate makes (it is the one that counts; these fail early with a clearer message)
PROT='^(\.github/|tools/|sql/|env/|tests/setup\.sh$|build\.js$|ship\.sh$|package(-lock)?\.json$|\.gitignore$|engine\.js$|dartgeo\.json$|career3\.js$)'
bad=$(git diff --name-status origin/src "$C" | awk -F'\t' -v P="$PROT" '$2 ~ P || $NF ~ P || ($1 != "A" && ($2 ~ /^tests\// || $NF ~ /^tests\//)) {print $1" "$2($3 ? "->"$3 : "")}')
[ -z "$bad" ] || { echo "REFUSED: these need a Q&D pass (R0-R2 path), so not ship-low: $(echo $bad)"; exit 1; }
runs=$(gh api "repos/$REPO/actions/workflows/ci.yml/runs?head_sha=$C&event=push&per_page=50" --jq '[.workflow_runs[]|select(.head_sha=="'"$C"'" and .event=="push")]|map(.status+"/"+(.conclusion//"")+" "+(.id|tostring))|join(", ")')
case ", $runs" in
  *", completed/success "*) echo "fast suite green (ci runs: $runs)" ;;
  ", ") echo "REFUSED: no ci (fast suite) push run on ${C:0:7}: push it to a feature branch and wait"; exit 1 ;;
  *) echo "REFUSED: no green fast-suite run on ${C:0:7} yet (ci runs: $runs)"; exit 1 ;;
esac
# the green fast suite must have run on exactly what ships: so the commit must already contain src (then release.yml's merge is a no-op)
git merge-base --is-ancestor origin/src "$C" || { echo "REFUSED: ${C:0:7} does not contain src $(git rev-parse --short origin/src); rebase onto src, push, wait for the fast suite, then ship"; exit 1; }
T=$(git rev-parse "$C^{tree}")
BASE=$(git rev-parse --short origin/src); MODE=release; [ -n "$DRY" ] && MODE=dry_run
echo "shipping R3 ${C:0:7} tree ${T:0:7} base $BASE item '$ITEM'${DRY:+ (dry run)}"
BY=author exec tools/dispatch-release.sh R3 "$C" "$T" "$ITEM" "$BASE" "$TESTS" none "$MODE"
