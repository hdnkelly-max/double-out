# 62j · Engine: ChatGPT P1, the v3 raise checked along its whole path (rel-grip77b on 4.31)

Engine (TOPS 2) · Sun 22 Nov · **branch `rel-grip77b` @ `46a313e`** = src 4.31 `85261c6` merged (clean) into `c081acd` (the fix) · chain in `chain.txt`

## The fix
- **What ChatGPT found:** the hair limit on the v3 raise checked only the end of the raise and binary-searched. That assumes clearance is monotonic in the raise. A dart could clear a lock at the 4.30 seat and at the full raise, yet pass through it in between, and every in-between share is on screen while the seat eases.
- **Now swept:**
  - The raise is checked at steps no more than 4 mm apart, from 0 (8 steps at the full 3 cm).
  - The raise used is the largest share whose every step so far keeps the dart's gap to the hair ≥ min(its gap at the 4.30 seat, 8 mm).
- **Real dart geometry, not the centreline:** the surface of every part's bounds (point, barrel, rings, shaft, each flight wing) on a grid of 4 mm or less, posed exactly as the dart is placed.
- **Hair:** every hair and cap triangle, held in head space; point-to-triangle distances.
- `TOPS_G77HC=0` gives the unlimited raise.

## Independent checks: `tests/s3-g77-sweep.js` (new)
The test doesn't use the limiter's own maths. It moves the dart along its own raise path, from the 4.30 seat to the seat the game chose, in 17 steps, and checks each step two ways:
- `TOPS_S3DARTHAIR`, the signed measure within its 6 cm radius;
- rays along the dart (its axis and 4 lines at the barrel's radius) against double-sided hair.

**A. Fixture:** a 6 mm hair lock 45% of the way along a 12 cm raise. It is 32 mm and 44 mm clear of the dart at the two ends and cuts the dart in the middle.

| Build | Result |
|---|---|
| 0f01a74 | **FAIL**: full raise, 4 ray hits, −1.9 mm |
| This | **PASS**: the raise stops at .23, path worst 9.6 mm, no hits |

**B. Builds:**
- Looks: Kai, Ray, Tama, Mia and Dazza, heavy and muscle; save3 (David: Tama, heavy, quiff, band, glasses); Kai standard.
- Places: match, match portrait, opponent, test rig.
- Poses: aim; pull 0–1.3 in .1 steps; throw 0–.3 in .05 steps. 88 poses per look.
- **Result:** the whole path is clear on every pose, by the measure and by rays.
- **Raise kept:** the full raise on 84 of 88 poses; the 4 throw poses from .15 to .3 have little or none by design (it eases out by throw .3). Mia keeps 72 of 88 at .99.

## The measure fix (approved)
- On 4.30, the old and new measure give **identical per-look results** on all 128 p70 looks (4 chunks), on s3-dart-hair-g and on s3-dart-cast. The fix hides nothing that was real.

## Cost
- At 4× CPU throttle: **0.6–1.5 ms per call**, one call per frame, on David's look and Kai heavy at aim, pull .3 and pull .7.
- It only runs on v3 figures in aim, pull and throw .0–.3.
- It returns at once when no hair triangle is near the swept dart.
- Caveat: the frame rate under software GL here isn't phone-representative, so this is the time per call, not a frame-time measurement.

## Tests on 46a313e (4.31 merged): all PASS
- s3-g77-sweep
- **s3-dart-p70: all 4 chunks, twice**
- dart-hair v2 and v3; dart-cast
- grip-cap v2 and v3; dart-hold; v2-clear v2 and forced v3
- creator and match, v2 and v3
- clip-game v2 and v3; clip-cast; pers-clear; pers-match; blend
- herocolour; v3heads; hubfps

**v3-parity vs 4.31:** only Dazza differs (the doc 83 cap, pixels the same).
- The chain's own parity run listed all 13 figures, with pixels the same and the same meshes in a different order.
- Two re-runs on the same builds (`parity_rerun1/2.txt`) show Dazza only, so I read that run as a one-off ordering flake.
- Throws, scores and timing are unchanged: the 2,470 clip frames are identical, and none of these changes touches aim, scoring, flight or timing.
