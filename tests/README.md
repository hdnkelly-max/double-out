# TOPS tests and triage kit

Run everything from the repo root after `bash tests/setup.sh` (once per clone, and again after pulling `src`).
Headless browser in the Claude containers: prefix with `NODE_PATH=/opt/node-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
Run one browser test at a time on a 2-core box; two at once can fail with "did not finish (play)".

## Ship gate
| Script | What it checks | Usage |
|---|---|---|
| `regress.js` | Real matches on the real characters (fails if the rig isn't loaded): 3 darts a turn, points match score, legal scores, opponent pose, spare darts, card picks, no page errors. Two matches at once on 4+ cores, one at a time otherwise (`REGRESS_PAR=n` overrides) | `node tests/regress.js 2` (~4.5 min on 2 cores) |
| `regress_assets.js` | Back-to-back Club and Pub matches at 390 px and desktop: board face and on-screen board have colour, every shirt texture drawn, GPU textures/geometries flat, and a pass with character models failing to load. Runs the standalone build (real rig). Add for rendering or loading changes | `node tests/regress_assets.js` · `TOPS_QA_SABOTAGE=1` blanks canvases to prove it fails |
| `sim-ai.js` | Opponent averages per tier and setting inside the rule 11 bands, The Run climbs stage to stage, 180 rates. Required for throw, AI or tuning changes | `node tests/sim-ai.js 200` · `--report-only` |

| `leak-suite.js` | **Fast R0 gate for the known leaks (~40 s).** A ledger tags every three.js geometry, material and texture with who made it and records `dispose()`; an orphan = drawn at least once, never disposed, no longer reachable, not kept. **D** orphans per dart thrown (6 visits, player and AI) ~0; **T** 5 start/quit cycles against different opponents: orphans flat, character templates ≤ remy + player + last + current; **L** live listeners flat, rAF loops per frame flat after 5 background/foreground switches. Fails on 1.99 (D 14.3/dart, L +4.8 loops, T 7 templates), passes on 2.04 and 2.09; `INJECT=dart` removes one dart dispose and it fails (D 7.1/dart). Gap: the player's darts are thrown with `land()`, not the pull/release flight | `node tests/leak-suite.js [dir]` · `INJECT=dart` to prove it catches a leak |

## Bug guards (each failed on the broken version, passes on the fix)
| Script | Bug | Usage |
|---|---|---|
| `regress-12-cloud.js` | #12: v1.75 cloud saves kept the inflated stored opponent | `node tests/regress-12-cloud.js` |
| `bank11.js` | #11: top-right balance didn't drop after a kit-room buy (fails until the #11 fix is in `src`) | `node tests/bank11.js` |

## Triage (for investigating, not in the gate)
| Script | Use it for | Usage |
|---|---|---|
| `gpucap.js` | Emulates a phone GPU texture budget; past the cap, uploads fail like on a phone (#10 reproduced Lee's blank board this way) | `node tests/gpucap.js . 300 4` (dir, MB cap, matches) |
| `leakq.js` | Geometry and texture counts per match across a session; flat means no leak | `node tests/leakq.js` (screenshot to `tests/out/`) |
| `twoclone.js` | Dispose one rigged figure, keep rendering another: no shared geometry freed, programs and frame time steady | `node tests/twoclone.js` |
| `lifecycle.js` | Create, dispose, recreate figures, switch shirt, render a portrait: no missing textures, GL error 0 | `node tests/lifecycle.js` |
| `sim-release.js` (on `collectibles-src` until B3/B4 ships) | Player-side perfect-release rate and average from real tester timing | `node tests/sim-release.js` |

## Notes
- `index.html` (dev build) loads `remy.glb`, which `setup.sh` decodes from `remy.b64.txt`. Without it, scripts run with placeholder figures.
- `double-out-standalone.html` has the rig inlined but loads three.js from a CDN; `regress_assets.js` serves the local copy instead.
- Assets (`img/`, `assets/`) live on `main`; `setup.sh` copies them in unstaged.
