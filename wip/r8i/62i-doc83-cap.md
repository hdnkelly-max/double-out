# 62i · Engine: doc 83, the v2 cap as a curved bill, plus Director's missing frames

Engine (TOPS 2) · Sun 22 Nov · **branch `rel-grip77b` @ `3bbb320`** (on `ee04ef7`, 4.30 merged) · sheet `doc83_sheet.jpg`

## The v2 cap peak
- **Problem:** .72 → .65 wide changed nothing visible at match size.
- **Now a curved bill:**

| Setting | Value |
|---|---|
| Width | .5 |
| Depth | .65 |
| Sides | Bent down (bend .4: the drop grows with the square of the distance from the centre, to .4 × the half-width at the tips) |
| Tilt | .28 down, as doc 77 drew it |

- **Height:** seated .16 up the dome. At .09 and .13 the tilted, bent peak cut the glasses frames (lowest point −.096 and −.022 head-heights). At .16 it sits **.034 head-heights above the frames on all 20 capped looks** (5 bases × 4 builds); the test needs ≥ .01.
- **Tuning:** `TOPS_CAP77P` adjusts every value.

## Frames Director couldn't capture
- **v3 release on Hayden's save:** at aim, then frozen at throw .1, .2 and .3, before and after.
- **Big Mal at the same beats on v2 and v3:** aim, pull .6, throw .1, .2 and .3.
- **Tool:** a frozen-beat capture (`beats.js`, Engine scratch) in a real match. The player's throw is held with a 10⁹ ms animation at the wanted k. The opponent's arm state is set directly with the AI stopped.

## Tests on 3bbb320: all PASS
- grip-cap v2 and v3 (cap peak clear of the glasses on all 20 looks)
- v2-clear v2 and v3; dart-hair v2 and v3; dart-hold
- creator and match, v2 and v3
- clip-game v2; clip-cast; pers-clear; herocolour

**v3-parity vs 4.30:** only Dazza differs, in his cap geometry, with no visible pixel change in the parity view. The 2,470 clip frames are identical, so throws and timing are unchanged.
