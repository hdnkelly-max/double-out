# Calibration profiles (QA 04:59, Overseer 05:27: every tuning table ships with its profile and command)

Every row of the V4 table in `claude/tops-calibration-summary.md` came from one file here, run as:

    JOINT=1 PROFILES=tests/profiles/<file> node tests/sim-player.js 1000

`JOINT=1` replays whole real darts from `tests/sim-player-joint.json` (the profile's `jd` key). 1,000 best-of-3 matches per cell.
Each profile entry is one cell: `tiers` (tier played), `st2v` (stats), `tb` (stats grandfathered at today's effect; default 20 = a new career, everything above 20 tapered), `barrel`, `setup`, `arm`, `lv`.
`out/` holds the exact output each file gave when the table was made (V4 8807ded; the sim never presses a touch screen, so the touch floor in d3be1b6 changes nothing here; row 1 Club rerun on d3be1b6 at 05:18 gave 40.4 → 51.0, table 41.2 → 51.0).

| Row | What | File | Output |
|---|---|---|---|
| 1 | Lee's real Club darts (`Lee_t1`), new career, starter kit (Assassin, std/med/standard, arm 0), stats by tier 40/50 … 80/85 | `row1-lee-club-new-career.json` | `out/V4_path_LeeNow.txt` |
| 1p | Row 1 with F2 kit by level (best barrel unlocked at each level, `lv` per cell) | `row1p-lee-club-f2-kit-by-level.json` | `out/F2kit_V4.txt` |
| 2 | Lee's actual save (his first 50 points grandfathered: `tb` 50) | `row2-lee-actual-save.json` | `out/V4_path_LeeSave.txt` |
| 3–4 | Lee at Club and David at Club/Regional, normal kit vs top barrel ("power"), caps +0/+5/+10 | `row3-4-lee-david-top-barrel-caps.json` | `out/V4_caps_live.txt` |
| 5 | Lee's older pub darts (`Lee`) | `row5-lee-pub-darts.json` | `out/V4_path_Lee.txt` |
| 6 | David's Regional darts (`David_t2`) | `row6-david-regional-darts.json` | `out/V4_path_DavidLater.txt` |
| 7 | Hayden, frozen pub timing, promotion stats, caps +0/+5/+10 | `row7-hayden-frozen-timing-caps.json` | `out/V4_caps_Hayden.txt` |
| 8 | BussyBoy, same | `row8-bussyboy-frozen-timing-caps.json` | `out/V4_caps_BussyBoy.txt` |
| 9 | David, same (pub darts) | `row9-david-frozen-timing-caps.json` | `out/V4_caps_David.txt` |

One tier only: `python3 -c "import json;d=json.load(open('tests/profiles/row1-lee-club-new-career.json'));json.dump(d[:2],open('/tmp/r1.json','w'))"` then `PROFILES=/tmp/r1.json`.
