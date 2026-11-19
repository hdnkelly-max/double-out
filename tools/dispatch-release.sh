#!/usr/bin/env bash
# Dispatch a TOPS release from a QA PASS line (SHIP-4). Needs gh (REST only) and a clone of the repo.
# usage: tools/dispatch-release.sh RISK COMMIT TREE "ITEM" [BASE] ["tests/a.js tests/b.js"] [none|applied] [release|dry_run|test_rollback]
#   RISK R0..R3 · COMMIT the item commit (any length; resolved to the full sha) · TREE QA's tree from the PASS line
#   BASE the src commit QA merged onto, only if src has moved since the pass · tests: the item's named tests for the recheck
# R0 jumps the queue: queued/waiting release runs are cancelled first, then dispatched again with their own inputs once the R0 run ends.
# REF=<branch> (env) runs release.yml from that branch (to dry-run a workflow change); default main.
# BY=author (env) dispatches with the attest 'AUTHOR TESTS PASS names this tree' (R3 / LOW only; release.yml refuses it for R0-R2).
# For LOW items use tools/ship-low.sh, which checks the commit's green fast suite first and works out the tree.
set -euo pipefail
R=hdnkelly-max/double-out; W=repos/$R/actions/workflows/release.yml
RISK=$1; C=$2; T=$3; ITEM=$4; BASE=${5:-}; TESTS=${6:-}; MIG=${7:-none}; MODE=${8:-release}
case "${BY:-qa}" in qa) ATTEST="QA PASS names this tree";; author) ATTEST="AUTHOR TESTS PASS names this tree";; *) echo "BY must be qa or author"; exit 1;; esac
git fetch -q origin 2>/dev/null || true
C=$(git rev-parse --verify -q "$C^{commit}" || { echo "commit $C not found locally (git fetch first)"; exit 1; })
JUMPED=()
if [ "$RISK" = R0 ]; then
  for st in queued waiting pending; do
    for id in $(gh api "$W/runs?status=$st&per_page=20" --jq '.workflow_runs[].id'); do
      t=$(gh api repos/$R/actions/runs/$id --jq .display_title)
      # cancel only if the run name gives back every input (ChatGPT P1): 8 fields (9 with attest=, since 19 Nov), commit and tree present
      n=$(awk -F'|' '{print NF}' <<<"$t"); c=$(sed -n 's/.*| commit=\([^ |]*\) |.*/\1/p' <<<"$t"); tr=$(sed -n 's/.*| tree=\([^ |]*\) |.*/\1/p' <<<"$t")
      # a 9-field name must say attest=qa or attest=author; anything else (attest=invalid) is left alone: it refuses itself,
      # and re-dispatching it would wrongly give it a valid attest
      a9=$(sed -n 's/.*| attest=\([a-z]*\) *$/\1/p' <<<"$t")
      if { [ "$n" != 8 ] && [ "$n" != 9 ]; } || { [ "$n" = 9 ] && [ "$a9" != qa ] && [ "$a9" != author ]; } || [ -z "$c" ] || [ -z "$tr" ]; then echo "R0 jump: NOT cancelling run $id (its inputs can't be read back from: $t)"; continue; fi
      gh api -X POST "repos/$R/actions/runs/$id/cancel" >/dev/null && { echo "R0 jump: cancelled $st run $id: $t"; JUMPED+=("$t"); }
    done
  done
fi
redispatch(){ # the run name carries every input: "RISK | ITEM | commit=.. | tree=.. | base=.. | tests=.. | migration=.. | mode=.. [| attest=qa|author]"
  local t=$1; IFS='|' read -r r it c tr b ts m md at <<<"$t"; f(){ echo "$1" | sed 's/^ *[a-z]*=//; s/^ *//; s/ *$//'; }
  local ra="QA PASS names this tree"; [ "$(f "$at")" = author ] && ra="AUTHOR TESTS PASS names this tree"
  gh api -X POST "$W/dispatches" -f ref=main -f "inputs[commit]=$(f "$c")" -f "inputs[tree]=$(f "$tr")" -f "inputs[risk]=$(f "$r")" \
    -f "inputs[attest]=$ra" -f "inputs[item]=$(f "$it")" -f "inputs[base]=$(f "$b")" -f "inputs[tests]=$(f "$ts")" \
    -f "inputs[migration]=$(f "$m")" -f "inputs[mode]=$(f "$md")" && echo "re-dispatched after the R0: $t"; }
before=$(gh api "$W/runs?per_page=1" --jq '.workflow_runs[0].id // 0')
gh api -X POST "$W/dispatches" -f ref="${REF:-main}" -f "inputs[commit]=$C" -f "inputs[tree]=$T" -f "inputs[risk]=$RISK" \
  -f "inputs[attest]=$ATTEST" -f "inputs[item]=$ITEM" -f "inputs[base]=$BASE" -f "inputs[tests]=$TESTS" \
  -f "inputs[migration]=$MIG" -f "inputs[mode]=$MODE"
id=$before; for i in $(seq 1 30); do id=$(gh api "$W/runs?per_page=1" --jq '.workflow_runs[0].id'); [ "$id" != "$before" ] && break; sleep 2; done
echo "dispatched: https://github.com/$R/actions/runs/$id"
for i in $(seq 1 240); do s=$(gh api repos/$R/actions/runs/$id --jq '.status+" "+(.conclusion//"")'); case "$s" in completed*) break;; esac; sleep 10; done
echo "result: $s"
for j in $(gh api repos/$R/actions/runs/$id/jobs --jq '.jobs[].id'); do gh api repos/$R/check-runs/$j/annotations --jq '.[]|select(.annotation_level!="notice" or (.message|test("nothing")))|"  "+.annotation_level+": "+.message' 2>/dev/null | grep -v "Node.js 20\|ubuntu-latest" || true; done
for t in "${JUMPED[@]}"; do redispatch "$t"; done
