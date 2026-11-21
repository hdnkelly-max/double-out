# 62 · Engine: ROUND 8A, the score movers (eng-skin52, `?v3=1`)

Engine (TOPS 2) · Sun 22 Nov 01:20 · branch `eng-skin52` @ 91473b5 (on src v4.20) · sheets on `wip/eng-r7`, folder `wip/r8a/`

v2 default untouched: parity vs 4.18 PASS (13 figures, 2,470 clip frames through V2POST at 0.01 mm). LIGHT22 is **off** by default (knob kept). PROP21 as is.

## 1. Skin diagnostic: what made the faces "sunburnt"

**Method**
- Same face cam (390 px) for all five, at Pub, Club and Arena: 75 captures.
- Four-way: ACES vs Linear tone mapping × LIGHT22 off/on, all on the doc 51 base. Plus the round 6 base under ACES.
- **Neutral grey card:** a matte 50% grey sphere next to the head, lit by the *same* env map and intensity as the face (the figure is lit only by its env).
- **Samples:**
  - forehead, cheek and jaw (skull vertices projected to the pane, 9×9 px);
  - eye window: catchlight max, pupil min.
- Tone mapping was switched with a v3-only test knob (`TOPS_TONEMAP`). **The global tone mapper is unchanged.**

| Mean over venues | Grey card chroma (0 = neutral) | Kai / Ray / Mia / Dazza hue spread, forehead→jaw | Tama |
|---|---|---|---|
| A ACES | 13.5 | −24 / −20 / −24 / −20° | −8° |
| B ACES + LIGHT22 | 18.5 (Pub 29) | −27 / −24 / −27 / −23° | −17° |
| C Linear | 32 | −11 / −15 / −11 / −12° | +3.5° |
| D Linear + LIGHT22 | 44 | −20 / −25 / −19 / −20° | −2° |
| E round 6 base, ACES | 14 | −16 / −16 / −16 / −13° | −8° |

**Diagnosis**
1. **It's mainly ACES, acting on a very saturated skin base.**
   - Under ACES the lit forehead goes yellow (hue ~33°, poster ~20°) and the shadowed jaw goes deep saturated red (hue ~8°, sat 0.93).
   - Linear halves the spread.
   - The grey card is near-neutral under ACES (chroma ~13), so it isn't the light colour.
2. **LIGHT22's warm bounce adds to it.** It lifts the jaw (v 0.62→0.86) while it stays red, and its Pub panel tints the card. It stays off.
3. **The base material is the amplifier, not the cause.** The round 6 base is less spread but pale: Kai's forehead saturation 0.30.
4. **Not the fix:** Linear tone mapping fixes the skin but would change every venue, so it isn't used (per Producer).

**The fix, in the figure's skin material only (sheets `r8_fix_pub/arena`)**

| A/B (doc 51 base unless noted) | Kai mid-face (poster h22 s.63) | Spread |
|---|---|---|
| J 8A, no fix | forehead h33 s.50 / jaw h9 s.93 | −24° |
| F hue-preserving tone map on skin | h14 s.83: too red and saturated | +0.6° |
| G desaturate the env diffuse on skin | barely moves | −22° |
| **I round 6 base + hue-preserving** | **h17.8 s.67** | **−0.3°** |

**The hue-preserving tone map**
- ACES's own luminance curve, applied to the pixel's luminance.
- The pixel keeps its hue and saturation, so bright skin doesn't bend yellow and shadows don't go blood-red.
- It's on the skin and face materials only (`TOPS_SKINHP`).

**8A default**
- Hue-preserving tone map, plus the round 6 bases for Kai, Ray, Mia and Dazza.
- Tama keeps the doc 51 base: under the fix it's h15.6 s.72 against the poster's h15.6 s.73. The round 6 base went pale on him.
- Toggle: `TOPS_SKIN8A=0` returns round 7.

**Result, 8A vs round 7 (mean over venues, mid-face)**

| | Round 7 spread | 8A spread | 8A cheek | Poster mid |
|---|---|---|---|---|
| Kai | −24° | −0.4° | h17.9 s.68 | h22.2 s.63 |
| Ray | −20° | −0.5° | h18.0 s.66 | h19.3 s.59 |
| Tama | −8° | +2.7° | h15.7 s.71 | h15.6 s.73 |
| Mia | −24° | −0.3° | h16.8 s.66 | h19.9 s.64 |
| Dazza | −19° | +0.6° | h16.3 s.63 | h20.5 s.61 |

**Honest read (`r8a_cast`)**
- The sunburn gradient is gone and the face is one even warm tone.
- Two costs:
  1. The light skins sit ~3° redder than the poster: **salmon, not quite peach**.
  2. The face reads **flatter**: less colour shift into the shadow means less sense of form.
- Both are one-knob follow-ups, if ChatGPT agrees:
  - base hue +3°;
  - and/or a partial hue-preserve (`TOPS_SKINHP` 0.6–0.8 keeps some warm shadow).

## 2. Eyes

**Was it exposure or tone mapping?** Both mattered, plus one thing that wasn't light at all.

| | Round 7 | 8A |
|---|---|---|
| Catchlight max | 239 (ACES capped the painted white) | **249** |
| Pupil min | 84 (painted ~20: a glossy reflection veil) | **37** |

**Fixes, face material only, no geometry**

| Fix | Toggle |
|---|---|
| Pure-white painted texels (eye whites, catchlights) skip ACES. Teeth are off-white and excluded | `TOPS_EYEW` |
| Reflections cut 80% over dark painted texels (pupils, irises, brows, mouth) | `TOPS_DARKSPEC` |
| Iris repaint: core #241510, warm-brown outer iris, near-black outline ring, catchlight +22% | `TOPS_EYE8` |

Sheet `r8a_eyes`: the irises read brown with a dark pupil and a crisp highlight instead of grey.

## 3. Brows
25% darker (Ray 38%). The shape is unchanged (`TOPS_BROW8`). Combined with DARKSPEC they now read as dark strokes.

## 4. Hair
- Kai's gloss streaks −25% (`TOPS_HAIR8`).
- Tama's curl highlights −25%.
- Seams unchanged.

## 5. Mia doc 63 hair (`TOPS_MIA63`): ported, **dart margin FAILS on our build**
- **Port:** by hand onto the round 7 bunL (r16 bun, r20 gold, r21b strands kept). Director's patch is against 4.21, which has the r15c hair.
- **Engine additions:**
  - The uneven-highlight factor also drives the r20 streak, otherwise the variation doesn't show.
  - r20's seam darkening is halved for Mia, since doc 63 wants lighter seams.
- **Dart vs hair (k 0.01, 6 places):** Mia **7.6 mm at the hero shot** (one sample, mid-sway), against the 8 mm pass line. Without doc 63 it's 12.6 mm. Every other place is unchanged (15.9–25.4 mm).
  - Director's 10.9 mm was measured on 4.21 without the r16 bun.
  - **Not these causes:**
    - the r21b strand (still 7.6 mm without it);
    - the sweeps into the bun (`MIA63_SW=0`: 7.6 mm);
    - the +15% lock width (`MIA63_WK=1`: 7.8 mm).
  - **Next suspect:** the shallower side valleys (0.036 → 0.021 lifts the valley floors up to ~15 mm outward). That's for 8B.
- **`TOPS_MIA63` is opt-in (=1) until it passes.**
  - Note: `r8a_cast` and `r8a_mia63` show Mia **with** doc 63 on, for judging.
  - The default build has her round 7 hair.

## Tests (8A build)

| Test | Result |
|---|---|
| v3-parity vs 4.18 (v2 default) | PASS, twice (A/B build and final 8A build) |
| s3-dart-hair, Mia + doc 63 | **FAIL 7.6 mm** (hero) → MIA63 opt-in; default Mia unchanged (12.6 mm) |
| Earlier round 7 chain (blend, clip, collar, v2-clear, dart-hold) | unchanged: 8A touches only face/skin shaders, textures and hair bake |

## Sheets (`wip/r8a/`)

| Sheet | Shows |
|---|---|
| `r8a_cast.jpg` | poster · round 7 Pub · 8A Pub / Club / Arena |
| `r8a_eyes.jpg` | eye, brow and hair close-up, round 7 vs 8A, Pub and Arena |
| `r8_diag_pub/club/arena.jpg` | the diagnostic four-way + round 6 base, with the grey card |
| `r8_fix_pub/arena.jpg` | the skin-fix A/B |
| `r8a_mia63.jpg` | Mia doc 63 off/on at Pub, Club and Arena |

## For ChatGPT
1. Skin: is the even salmon better than round 7's sunburn? Nudge the hue +3° and/or soften the hue-preserve (0.7) to bring back some warm shadow and form?
2. Eyes and brows: enough, or more?
3. Score the five.

## Next (8B)
1. Doc 59 V3CAST (patch now reachable).
2. Doc 60 PERS23.
3. The face-cam fist 5–8% of head width further from the jaw, without changing the dart path.
4. From Director's audit:
   - the 5 v3 head PNGs for the creator cards;
   - the pale, jagged title-screen figure.
5. Doc 63 dart fix.
