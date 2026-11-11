# Calibration profiles (QA 04:59 ask: rows 1 and 1p reproducible from the repo)

Each file is a `PROFILES` list for `tests/sim-player.js` with `JOINT=1` (whole real darts replayed from `tests/sim-player-joint.json`, key `jd`).
Stats not listed in `tb` start tapered from 20 (the sim's default, same as a new career).

| Row | File | Command (1,000 best-of-3 matches per cell) | d3be1b6 result, Club arrive → promotion |
|---|---|---|---|
| 1: Lee's real Club darts, new career, starter kit (Assassin, std/med/standard, arm 0) | `row1-lee-club-new-career.json` | `JOINT=1 PROFILES=tests/profiles/row1-lee-club-new-career.json node tests/sim-player.js 1000` | 40.4 → 51.0 (rerun 05:2x; table 41.2 → 51) |
| 1 with F2 kit by level (best barrel unlocked at each level, `lv` set per cell) | `row1p-lee-club-f2-kit-by-level.json` | `JOINT=1 PROFILES=tests/profiles/row1p-lee-club-f2-kit-by-level.json node tests/sim-player.js 1000` | 49 → 58 (table) |

One file per tier pair: each profile carries `tiers` (the tier it plays), `st2v` (stats at that point), `barrel`, `setup`, `arm`, `jd`.
To run Club only: `python3 -c "import json;d=json.load(open('tests/profiles/row1-lee-club-new-career.json'));json.dump(d[:2],open('/tmp/r1.json','w'))"` then `PROFILES=/tmp/r1.json`.
