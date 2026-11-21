# 62c · Engine: ROUND 8C (8A2 + doc 65 mouth and nose + doc 66 hair + skin form), with 8B folded in, `?v3=1`

Engine (TOPS 2) · Sun 22 Nov · branch `eng-skin52` @ 932ba1b · sheets in `wip/r8c/`

v2 default untouched: every change sits behind `TOPS_V3FLAG`. All tests pass on this build (bottom).

## 8C: what changed since 8A2

| Change | Detail | Toggle |
|---|---|---|
| **Mouth** (doc 65, as designed) | Near-black interior (#1e0608), teeth 60% of the opening with 5 soft tooth breaks, narrower and lower pink tongue. Shape, width and smile unchanged | `TOPS_MOUTH65=0` gives 8A2 |
| **Nose** (doc 65, trimmed to ~2/3) | Kai, Tama, Dazza +10% and 4.5 mm forward; Ray +8% / 3.8 mm; Mia +6% / 3.0 mm. Director's gloss, painted form and under-nose shadow kept; the drop scales with the size. Dazza's nose was already +12% (PROP21), so it's ~+23% in total | `TOPS_NOSE65=0`; per base `V3NOSE8C`; `TOPS_NOSE65P={k,fw,gl,v0,rose}` |
| Tama's nose | Doc 65's rose tint read as a red clown nose on his darker skin: tint off for Tama, gloss 0.8 | `TOPS_NOSE65P.rose` |
| **Skin form** | `TOPS_SKINFORM` 0.3 → 0.39 | `TOPS_SKINFORM` |
| **Hair** (doc 66, Director) | Applied clean. Mia mass and flow, Kai broken streaks, Ray soft crown, Tama mixed curl finish, Dazza softer beard edge and thinner moustache | `TOPS_HAIR66=0`, or per character `TOPS_H66_<id>=0` |

Measured (face cam, mean of Pub / Club / Arena):
- **Cheek hue:** unchanged from 8A2, within 0.5° of the poster on all five (Kai h22.6 vs 22.2, Ray 19.8 vs 19.3, Tama 15.6 vs 15.6, Mia 20.2 vs 19.9, Dazza 20.7 vs 20.5).
- **Jaw value:** .55 → .53 (more form).
- **Eyes:** unchanged.

## 8B (folded in)

| Item | State | Sheet |
|---|---|---|
| **V3CAST** (doc 59b): seeded opponents and pros on the v3 kit following their cards | Ported; opt-in (`?v3cast=1` / `TOPS_V3CAST`) | `r8b_cast.jpg`: 5 opponents, off vs on |
| **PERS23** (doc 60): a personality per base, 5 moments (idle, celebrate, miss, defeated, signature) | Ported; opt-in (`?pers23=1` / `TOPS_PERS23`). Engine's game wiring (miss groan, defeated at match end, the player's celebrate) is not done yet | `r8b_pers.jpg`: 5 bases × 5 moments |
| **Face-cam fist offset**: the camera swings toward the front; the dart path is unchanged | Built; default 0 (`TOPS_FIST8A`) | `r8b_fist.jpg`: 0 vs +14° |

Fist-to-jaw gap, % of head width (8C build):

| | 0° | +14° | Change |
|---|---|---|---|
| Kai | 10.5 | 15.5 | +5.0 |
| Ray | 9.1 | 13.3 | +4.2 |
| Tama | 9.3 | 14.6 | +5.3 |
| Mia | 10.9 | 15.6 | +4.7 |
| Dazza | 10.3 | 15.6 | +5.3 |

- The fist stays fully in the pane at +14°.
- **Cost:** past ~+10° the dartboard's black surround enters the top-left of the pane as a hard arc, and the dart in the fist turns out of view. Lowering the camera made the gap smaller, so it isn't used.
- If ChatGPT picks "on", +16° puts all five at +5 or more (sweep: +18° gives +5.7 to +7).
- The fist frames were captured before doc 66; the hair doesn't affect the camera.

## Honest read
- **Nose:** reads on all five at 390 px now (it vanished before): a rounded ball, lit on top, dark underneath, with a soft shadow on the lip. Tama's is warm brown, no longer red.
- **Mouth:** a dark band now shows under the teeth and the tongue sits low; it reads closer to the poster's open grin.
- **Hair 66:** subtle at the 390 face cam (Mia's mass and Kai's streaks show most). Close-up in `r8c_face.jpg`.
- **V3CAST:** the card-skinned opponents (Shazza, Pete, Deano, Jonno) read paler and pinker than the five bases, because their card skin values are lighter. A per-cast skin pass would be a follow-up.
- **PERS23:** the moments read (Kai's and Ray's winks, Ray's defeated head-drop, Dazza's showman pose). Kai's and Ray's defeated pose shows mostly the top of the head from the front.

## Sheets (`wip/r8c/`)

| Sheet | Shows |
|---|---|
| `r8c_cast.jpg` | poster · 8A2 Pub · 8C Pub / Club / Arena |
| `r8c_face.jpg` | close-up (eyes, nose, mouth, hair): 8A2 Pub vs 8C Pub / Club / Arena |
| `r8b_pers.jpg` | PERS23: 5 bases × idle / celebrate / miss / defeated / signature |
| `r8b_cast.jpg` | V3CAST off vs on: Big Mal, Shazza, Pete the Plumber, Deano Marsh, Jonno |
| `r8b_fist.jpg` | face cam, fist offset 0 vs +14° |

## For ChatGPT
1. Nose and mouth: does the trimmed nose hit the poster? Mouth right?
2. Hair 66: enough per character?
3. 8B: V3CAST on by default? PERS23 on by default? Fist offset on (+16°) or off, given the board arc?
4. Score the five.

## Tests (this build, 932ba1b)

| Test | Result |
|---|---|
| v3-parity vs 4.18 (v2 default) | **PASS**: 13 figures identical; 2,470 clip frames through V2POST identical at 0.01 mm |
| s3-dart-hair, all bases + 3 opponents, nose counted as a keep-out | **PASS**, 17,312 samples: Mia **10.4 mm** (8.5 before doc 66), Dazza 22.0, Tama 85.7, others 99. The nose is never near the dart |
| s3-clip-cast | **PASS**: 12 figures × 19 clips, 34.6 M checks |
| s3-dart-cast (V3CAST figures) | **PASS**, 25,968 samples: closest Price 15.6 mm, Big Mal 19.3 mm |
| s3-pers-clear (PERS23) | **PASS**: 5 figures, 75 poses, 1.6 M checks |
