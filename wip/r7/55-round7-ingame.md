# 55 · Engine: ROUND 7 in-game (eng-skin52, `?v3=1`)

Engine (TOPS 2) · Sun 22 Nov 00:10 · branch `eng-skin52` @ 8bb0610 (on src v4.20, the live hidden v3 release) · sheets on branch `wip/eng-r7` @ 5f522a7, folder `wip/r7/`

The v2 default is untouched. Parity against 4.18 passes, every bone of 2,470 clip frames identical at 0.01 mm.

## What's in round 7

All are v3-only and each sits behind its own toggle.

| Doc | Change | Toggle |
|---|---|---|
| 51 | Skin base colours (poster-measured); per-base correction under LIGHT22 still running, see Skin | `TOPS_SKIN51` |
| 52/53 | r19 hands (fingers +22%, mitten spacing, thumb +15%) + dart fist; Mia r16 round bun + crown pole fix | `TOPS_HANDS19`, `TOPS_FIST19`, `MIA_BUN16`, `GROOVE_POLE` |
| 54 | r20 hair read: one gloss streak per lock, seams 30% darker, glossy Tama curls, warmer Mia gold | `HAIR20` |
| 56 | r21: per-character proportion (jaw, cheek width, ears for Kai, Ray, Tama, Mia); Ray lighter warm-brown glasses; Tama uneven top curls + 4 hairline curls | `TOPS_PROP21`, `TOPS_SIG21` (+`_RAY`, `_TAMA`) |
| 57 | r21b: Kai quiff +7% tipped forward; Mia lash flick + face-framing strands; Dazza strand beard, fuller jaw and chin, curled moustache, nose +12%, heavier brows | `TOPS_SIG21` (+`_KAI`, `_MIA`, `_DAZZA`), `TOPS_PROP21` |
| 58 | Per-venue lighting (Pub, Club, Arena): smaller key, fill −24%, red-orange rims, warm bounce | `TOPS_LIGHT22` |
| — | Blend coverage: new `tests/s3-blend.js` | test |
| 59 | **Not in round 7.** V3CAST (opponents and pros on v3): the patch never reached me (not in the project, which is over its storage cap, and on no branch). It leads round 8 with doc 60 (TOPS_PERS23). | — |

### Port notes, where I changed the hand-off

- **Shared code is v3-gated.** Director's r19/bun patch, the Kai envMod/lip and the beard all run in code v2 also uses. Each change checks `TOPS_V3FLAG`, so v2 can't change. The release's V2POST slip (Q&D iso.js) is why this matters.
- **LIGHT22 is lit per figure, not per scene.** This is Director's scope option. Only v3 figures take the venue rig (materials are tagged as a v3 figure is dressed); v2 opponents keep today's rig.
  - A venue change rebuilds only the LIGHT22 texture: **3.1 ms** (Director's lab: 2.5).
  - Per-frame cost: **0**.
- **Mia's lash flick** is drawn on the v3 face sheet. The v2 face still carries its old lashes.

## Tests, all PASS on the full round 7 build with PROP21 and r21b on

| Test | Result |
|---|---|
| v3-parity (v2 default vs 4.18) | PASS: 13 figures identical in geometry, materials and pixels; **2,470 clip frames through V2POST identical at 0.01 mm** (new clip pass; it catches the released bug: unfixed 104 frames, worst 362 mm) |
| s3-dart-hair (k 0.01, 6 places, ≥ 8 mm) | PASS: **Mia 12.6 mm** (r7 before r21b: 15.5; Director lab 10.3), **Dazza 22.2 mm** (22.7), Tama 85.7, Kai/Ray 99 |
| s3-collar-chin | PASS, nothing inside the skull. Closest: **Dazza beard 10.4 mm** (r21b fuller chin; was 12.7), **Mia hair 7.9 mm** (follow 0.35), others ~34 mm |
| s3-v2-clear (v3) | PASS: 0 head penetration, 0 darts in arms (spares ≥ 67°), dart-skull 1.061, dart-hair 24.2 mm (Dazza), glasses 8.3 mm off the eye |
| s3-dart-hold (r19 vs old hands) | PASS on all five: thumb gap 54.2→58.0, index 50.8→54.3, closest finger −9.4→−7.1 mm (Mia −8.5→−8.6) |
| s3-clip-game | PASS: 8 figures × 19 clips, 23.5M checks |
| **s3-blend (new)** | PASS: 5 v3 figures × 9 transitions × weights .2/.4/.6/.8 × 2 start points (+ throw phases layered) = **680 mid-crossfade samples**, 32.6M checks |
| v2 default (v4.20 release) | s3-v2-clear PASS; Q&D iso.js PASS |

**s3-blend: what it covers**
- **Transitions:**
  - victory→idle;
  - walk→throw (set, pull, throw .3/.6 layered);
  - walk→pump;
  - idle→cheer and cheer→idle;
  - idle→celebrate and celebrate→idle;
  - throw→reset (follow/reset over the pump→idle fade);
  - throw→celebrate.
- **Fade lengths:** the game's own (tc/core.js clipOn .2, walk end .5, tcCelebrate .2/.6).
- **Checks at every sample:**
  - head clearance;
  - darts in arms or shirt, dart vs skull and hair;
  - the Lab clipCheck (cuff, collar, trim, fist, pants, arm);
  - collar inside the skull;
  - glasses on the eyes mid-blend.
- **Results:** dart-skull 1.127, dart-hair 29.1 mm (Mia, walk→throw), glasses 8.3 mm with **0 mm drift**.
- The seeded opponents are v2 until V3CAST, so they're skipped.

## Frame time (phone tier, software render: compare, don't read absolute)

| Arena | Round 6 median / p90 | Round 7 median / p90 |
|---|---|---|
| Kai | 285 / 349 ms | 300 / 375 ms (+5%) |
| Tama | 312 / 406 ms | 325 / 389 ms (+4%) |

The extra cost comes from the hair, the r21b beard grid (54×22 → 110×34) and the hands. The lighting costs nothing per frame. Real-phone timing still needs Hayden's device.

## Sheets (`wip/eng-r7:wip/r7/`)

All are the 390 px match face cam unless noted, with all toggles on.

| Sheet | Shows |
|---|---|
| `r7_cast.jpg` | poster · round 6 Pub · round 7 Pub / Club / Arena |
| `r7_light.jpg` | LIGHT22 off/on at Pub, Club, Arena |
| `r7_prop21.jpg` | PROP21 off/on at Pub and Club |
| `r7_sig21.jpg` | SIG21 off/on at Pub and Arena |
| `r7_throw_on.jpg` / `r7_throw_off.jpg` | Pub throw strip (aim, pull, throw .6, release, fly .5, follow .5), r19 hands + fist on / off |
| `r7_creator.jpg` | poster · round 6 · round 7 creator |
| `r7_skin.jpg` | poster · old skin · **doc 51 base (pick)** · measured correction S1 at Pub/Club/Arena (rejected) |

## What I see (Engine's read, for ChatGPT to confirm or overturn)

1. **Tama is the clear win.** Round 6's ashy grey-brown is now a warm brown close to the poster, and the glossy curls each catch a highlight.
2. **Skin hue is the main open problem, and it's the doc 51 base, not the light.** With the doc 51 base, Kai, Ray and Mia go deep red-orange on the lower face while the mid tones read yellow. That's more hue spread across the face than the poster, which stays an even peach.
   - The LIGHT22 off/on sheet shows the light itself changes little.
   - Measured mid-tone error under LIGHT22 (target ±3° hue, ±0.05 saturation):

   | | Hue | Saturation | Brightness |
   |---|---|---|---|
   | Kai | +2.8° | +0.01 | −0.03 |
   | Ray | +4.5° | −0.05 | −0.08 |
   | Tama | +2.4° | −0.15 | +0.11 |
   | Mia | +7.9° | −0.11 | −0.02 |
   | Dazza | +3.1° | −0.05 | −0.03 |

   - **Skin update (00:25): the measured correction failed. Round 7 keeps the doc 51 base under LIGHT22, uncorrected.**
     - One correction step on each base hex (hue, saturation, value against the error) moved the mid tones toward target on 3 of 5:

       | | Mid-tone result after the step |
       |---|---|
       | Kai | lands at Pub and Club |
       | Dazza | lands at Pub and Club |
       | Mia | hue +7.9 → +4.7° |
       | Ray | barely moved (+4.5 → +4.3°) |
       | Tama | hue overshot (−1.6°), saturation unchanged (−0.15) |

     - **Visually it is worse.** Tama turns dark red-brown and Mia's lower face redder (`r7_skin.jpg`, right three columns).
     - A second step would have pushed the bases to extremes (Mia #ff1a09, Tama #561800), so I stopped it.
     - Earlier the one-step material solve also made Kai worse.
   - **Diagnosis.** The game's skin remap keeps hue. My best explanation for the remaining spread (yellow mid and lit tones, red shadows) is ACES filmic tone mapping bending bright saturated reds toward orange-yellow. A base-colour change can't fix that; it mostly moves the shadows. Not yet tested directly.
   - **Round 8 candidates:**
     1. A skin-only exposure or saturation adjustment after tone mapping (keeps hue even across the face).
     2. Less warm bounce on skin.
     3. A per-skin key trim.

     I'll A/B these on the face cam.
3. **LIGHT22 helps moderately.**
   - Gains: a tighter, whiter key highlight (forehead, Dazza's cap), a little more facial shape, and a warm rim on hair edges.
   - Ears do not go red at the face cam.
   - No gloss band shows on Tama's forehead, so I kept the key as specified (no dark-skin trim).
4. **The signatures read unevenly at face-cam size.**
   - Clear: Ray's lighter glasses; Dazza's strand beard and curled moustache tips.
   - Faint: Kai's quiff lift and Tama's curls.
   - Not visible at the 3/4 face cam: Mia's lash flick. It shows in the creator.
5. **PROP21 is subtle at 390 px.** Ray's wider cheeks show; Kai's jaw, a little. Tama and Mia barely change. This is the one item ChatGPT may want to push harder.
6. **Hands:** the r19 fist reads as a fist holding the dart through aim, pull and throw .6, and opens forward at release.

## Questions for ChatGPT

1. Skin: is the doc 51 warmth right but the hue spread wrong (yellow lit tones, red shadows, `r7_cast`/`r7_skin`), or is the base itself too saturated? Engine's view: the spread, likely from tone mapping. Should round 8 attack it there?
2. LIGHT22 on or off as the default under `?v3=1`?
3. PROP21 and the signatures: keep as is, push harder, or drop any?
4. Score each of the five against the poster at the face cam (round 6: Kai 8.4, Mia 8.0, Tama 8.2, Ray 8.4, Dazza 8.5; r17/r18 faces ~8.7).

## Next (round 8)

1. V3CAST (doc 59) once I can reach the patch, with V3CAST on/off at one venue.
2. TOPS_PERS23 personality (doc 60).
3. Whatever ChatGPT picks from the questions above.
