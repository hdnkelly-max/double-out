# 62g · Engine: the grip and cap release (doc 77 + Q&D a/b/c), head cards and framing (doc 79)

Engine (TOPS 2) · Sun 22 Nov · **branch `rel-v3-r8c` @ `3aec1c3`**, merged onto src v4.28 `dacc9b4` (clean) · sheets in `wip/r8g/`

**This one branch is the release.** It has src 4.28 plus:
- doc 77 grip and cap;
- Q&D's (a), (b) and (c);
- e9907be's head cards;
- doc 79's framing.

`rel-v2-grip77` (`e446c3a`, off 4.26) has the same thumb fix, but it's now superseded. Ship `rel-v3-r8c`.

## Q&D's findings

### (a) The thumb now presses on the barrel

**Cause:** doc 77's thumb swung away from the barrel (58–65 mm).

**Fix:**
- The dart is still seated where doc 77 seats it, so every clearance doc 77 proved still holds.
- After the dart is placed, the thumb closes onto the barrel (`GRIP77T` Thumb1 −.4/−.5/−.1, Thumb2 1, Thumb3 1).
- Closing the thumb before seating moved the dart into the forearm and toward the hair. That's why the order is seat first, then close.

**Result:** thumb gap **9.1 mm** (old hands 54.2, doc 77 58–65).

| Model | Thumb pad to barrel | Index hook to barrel |
|---|---|---|
| v3 | .21 hand-lengths | .43 |
| v2 | .11–.19 | .31–.35 |

The player and the opponents use the same grip.

### (b) s3-dart-hold baseline

Rebaselined after (a). The test now **PASSES** on all five bases.

### (c) The v2 cap peak clears the glasses

- The peak sits at the rim, nearly level (y .09, tilt .05).
- `s3-grip-cap` checks it clears the glasses on 5 bases × 4 builds.
- Sheet: `grip_release_hayden.jpg`.

### New: v3 late throw

- **Found by:** running s3-v2-clear with v3 forced.
- **Problem:** at throw .95–1, doc 77's seat put the flight 0.4–6.6 mm into the forearm on every v3 figure. Doc 77's own thumb does the same, so this is not the thumb change.
- **Fix:** over throw .8 → 1 the seat eases back to the 4.26 seat. Aim and pull are unchanged.
- **Scope:** v3 only. `TOPS_G77LATE=0` turns it off.

## Doc 79

### Head cards

- e9907be's five PNGs are on the branch, byte-identical.
- src's 4.25 wiring is kept: `rb/s3.js`, `have.json`, the manifest.
- The content hash gives the cards new URLs.
- s3-v3heads **PASS**.

### Framing (v3 only; `TOPS_FRAME79=0` gives r8c)

**Cause:** with its hair, the v3 head is ~.75 m tall, past `s3HeadFrame`'s 1.8× cap.
- The portrait cut the hair top and the mouth.
- The hero put the hair on the top edge (69–71 px).

**Portrait:**
- The camera moves back until every head vertex fits (hair, cap, ears).
- Then it's framed with 7% headroom and centred.

**Hero:**
- The camera is kept.
- It's only reframed (zoom out or shift, never zoom in) if the head, the throwing hand or the dart would cross a 5% side or 4% top margin.

**Sheet:** `doc79_framing.jpg`.

**Note for Director:** the hand and dart are now inside the frame on every look. But in the hero pose the dart points almost straight at the camera, so it reads end-on in the fist. If doc 79 wants the barrel readable along its length, that's a pose or camera change, not a crop. Say if you want it.

**New checks in `v3-herocolour`** (measured on the pictures):
- the hero is clear of the top edge and of the sides above the waist;
- the portrait head starts 3–14% down and is clear of the sides.

**Results:** PASS on this build (head 6.3–6.6% down). FAIL on r8c (head from 0%, hero on the top edge).

## Tests on 3aec1c3 (`chain.txt`)

| Test | Result |
|---|---|
| s3-grip-cap, v2 and v3 | **PASS** |
| s3-dart-hold | **PASS** |
| s3-v2-clear, v2 | **PASS** |
| s3-v2-clear, forced v3 | **PASS** |
| s3-dart-hair (v3) | **PASS**: Mia 39.2, Big Mal 45.7 |
| s3-dart-cast | **PASS** |
| v3-herocolour, with framing | **PASS** |
| v3-portskin | Ran |
| s3-v3heads | **PASS** |
| v3-cardart | **PASS** |
| v3-moodpaint | **PASS** |
| s3-match, v2 and v3 | **PASS** |
| s3-creator, v2 and v3 | **PASS** |
| v3-hubfps | **PASS** (≥ 63 frames per 2 s) |
| s3-clip-game, v2, v3 and cast | **PASS** |
| s3-pers-clear | **PASS** |
| s3-pers-match | **PASS** |
| s3-collar-chin | **PASS** |
| s3-blend | **PASS** |
| s3-binder-art | **PASS** |
| asset-refs | Same 6 `assets/rb` files missing as src 4.28 in this environment (they ship from `main`) |
| v3-parity vs src 4.28, grip and cap off | **PASS**: identical |
| v3-parity vs src 4.28, on | Only Dazza differs (the cap), as intended |

The Hayden sheet was shot on `024c478`. `3aec1c3` only changes v3 throw .8–1, so aim, title and hero are the same.
