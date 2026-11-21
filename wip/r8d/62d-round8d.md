# 62d · Engine: ROUND 8D: the five at their best + the full cast (doc 68, cast skin pass, pros 67, PERS23 in play), `?v3=1`

Engine (TOPS 2) · Sun 22 Nov · branch `eng-skin52` @ 1d1f7c6 · sheets in `wip/r8d/`, pro card art in `wip/r8d/cards/`

v2 default untouched: every change sits behind `TOPS_V3FLAG`. **All tests pass on this build** (bottom).

## The five: doc 68 last pass (Director)

**Doc 68** (`TOPS_DOC68`, per character `TOPS_D68_<M|R|K|D|T>`):

| Character | Change |
|---|---|
| Mia | Lighter sides, lifted crown |
| Ray | Depth behind the glasses |
| Kai | Softer, slightly shorter eyes |
| Dazza | Beard hugs the mouth |
| Tama | Satin top curls |

**Porting:**
- 7 of 9 hunks applied clean.
- 2 were hand-merged with doc 67, which had changed the same lines:
  - Dazza's head map now gets both doc 67's painted cast stubble and doc 68's beard shadow at the mouth.
  - Dazza's beard takes doc 68's mouth hug, and his signature beard stays off the cast.

**Measured** (face cam, mean of Pub / Club / Arena):
- Cheek hue is still within 0.5° of the poster on all five.
- Eye 75th-percentile luminance 142 → 132.
- Dazza's jaw value .40 → .36 (the beard edge at the mouth).

**Mia's dart margin: 17.9 mm** (10.4 in 8C).

Sheets: `r8d_cast.jpg` (poster · 8C Pub · 8D Pub / Club / Arena) and `r8d_face.jpg` (close-up, 8C vs 8D).

## The cast: skin pass (V3CAST normalised)

**Why it read pale and pink:** the card-skinned cast carried more blue and less saturation than the five (Shazza `b36557`, Pete `be7b69` vs Kai `eea472`), and most fell under the light-skin cutoff, so they got no peach.

**The pass** (`TOPS_CASTSKIN8`, default .75; `0` = the card values):
- Under v3, every non-base skin moves 75% of the way toward the five's family:
  - its own lightness picks a target on the line from Tama's tone to the light bases' mean tone;
  - the target is matched to the cast skin's own lightness, so only warmth and saturation move.
- The peach shift then scales with that lightness (0 for the darkest, the full 2.5° for the lightest).
- The rest of the pipeline (hue-preserve .88, form .39, sheen) already applied to the cast.

| | Card skin | After |
|---|---|---|
| Shazza, Jonno | `b36557` (pink) | `b06748` (warm tan) |
| Pete, Deano | `be7b69` | `c17c59` |
| Big Mal | `72513f` | `894c2f` |
| Dave Hurring | `8d6b4e` | `a36643` |
| Price | `be826c` | `c5825d` |
| Littler, Humphries, van Gerwen, Kev, Lisa | already light: small shift toward peach | |

Sheets:
- `r8d_castskin_1.jpg` / `_2.jpg`: all 12, before vs after.
- `r8d_opp_pub.jpg`: 8 of them in a real match at the Pub on the opponent's turn (V3CAST on, s3pros on).

## The pros: doc 67 + cards to its spec

**Doc 67** (`TOPS_CAST67`) applied clean:
- Dazza's signature beard no longer leaks onto the cast (Price, Humphries, Big Mal, Pete get the plain trimmed beard).
- Stubble is painted into the skin map: no pale shell edge.
- Van Gerwen's goatee reads from the front.

**Pro cards to doc 67's spec** (Engine's renderer):

| Setting | Value |
|---|---|
| Figure | `makeFigure(lookFor(name))` under v3 + V3CAST |
| Pose | `cheer` at .40, dart hidden (none of the pros has a PERS23 signature) |
| Camera | fov 30, 4.4 m from the head bone at yaw −22°, .30 m below the head, looking .42 m below it |
| Light | the match rig at match exposure |
| Render | 1400×2100 with alpha solved over black and white |
| Composite | Palace plate `v6.jpg` (2:3 crop centred at x 1000, blur 3 px, brightness ×.82), warm glow (alpha blurred 28 px, 35%) |
| Output | 700×1050 webp q90, no text |

- **Files** (`wip/r8d/cards/`), named for the art they replace: `power` (Taylor), `nuke` (Littler), `green` (van Gerwen), `price`, `wright`, `smith`, `barneveld`, `humphries`, `anderson`.
- **Safe area:** head tops land at y 151–207 of 1050 (spec: y ≥ 120). The feet sit below the card window (~y 955), as the spec intends.
- **Rendered with `s3pros` on**, so Littler / van Gerwen / Price / Humphries show doc 67's recipes.
- Sheet: `r8d_procards.jpg`.

**Decision needed** (Director's doc 67):
- Cards follow the shipping flags. With `s3pros` off by default, shipping cards would show the seeded stand-ins until the look-alike patch ships. Confirm, and I'll render that set (or ship these with the patch).
- The Regulars keep their painted cards (recommended).
- The art isn't committed to `s3/assets/cards/art/` yet; that waits for the decision.

## PERS23: on by default under v3, wired into play

`?pers23=0` / `TOPS_PERS23=0` turns it off. It only acts on figures with a v3 base personality, so v2 is untouched (parity PASS).

| Moment | Fired by | Shows on |
|---|---|---|
| miss | a visit under 30, or a bust (the groan path) | the player's face-pane figure (or the opponent's figure for the AI), held ~1.6 s |
| celebrate | a visit of 100+ | the same, ~1.5 s |
| signature | a 180 | the same, ~2.2 s |
| defeated / celebrate | match end | the **result portraits**: the loser's defeated face, the winner's celebration |
| celebrate | the hub `tcCelebrate` | the hub figure (in place of the generic pump), 2.6 s |

**How holds behave:**
- A moment only holds while the figure is idle, so a new pull releases it at once and never blocks a throw.
- Off online: a remote player isn't the local figure.

**Why match end uses the result portraits:** the result screen covers the 3D scene as soon as the match ends, so they're where "defeated" is seen. They take the moment's *expression* only, because the defeated pose bows the head and a front portrait then shows only hair.

**Fist offset:** stays off, per ChatGPT.

**New test: `tests/s3-pers-match.js`.**
- In a real match for all five, the game's own hooks fire each moment.
- It checks the face-pane figure holds that moment and passes the body clip check, that the result portrait changes at match end, and that a pull releases a held moment.
- Sheet: `r8d_pers_match.jpg`.

## Sheets (`wip/r8d/`)

| Sheet | Shows |
|---|---|
| `r8d_cast.jpg` | the five: poster · 8C Pub · 8D Pub / Club / Arena |
| `r8d_face.jpg` | the five, close-up: 8C vs 8D |
| `r8d_castskin_1.jpg`, `_2.jpg` | 12 cast, card skin vs normalised |
| `r8d_opp_pub.jpg` | 8 cast in a real match at the Pub |
| `r8d_procards.jpg` + `cards/*.webp` | the 9 pro cards to doc 67's spec |
| `r8d_pers_match.jpg` | PERS23 in a real match: miss, celebrate, signature, bust, result portrait |

## For ChatGPT
1. The five after doc 68: score them.
2. The cast after the skin pass: do they sit with the five now?
3. The pro cards: right read and framing?
4. PERS23 in play: do the moments land? Anything too long or too short (miss 1.6 s, celebrate 1.5 s, signature 2.2 s)?

## Tests (this build, 1d1f7c6)

| Test | Result |
|---|---|
| v3-parity vs 4.18 (v2 default) | **PASS**: 13 figures identical; 2,470 clip frames through V2POST identical at 0.01 mm |
| s3-dart-hair, all bases + 3 opponents, nose counted | **PASS**, 17,312 samples: **Mia 17.9 mm**, Dazza 22.0, Tama 85.7, others 99 |
| s3-dart-cast (12 cast, CAST67 on) | **PASS**, 25,968 samples: closest Price 14.6, Big Mal 18.1, Pete 20.2, Humphries 24.1; stubble wearers 95–99 (no shell) |
| s3-clip-cast | **PASS**: 12 figures × 19 clips, 34.6 M checks |
| s3-pers-clear (PERS23 poses) | **PASS**: 5 figures, 75 poses, 1.6 M checks |
| **s3-pers-match** (new: PERS23 in a real match) | **PASS**: 5 bases, 25 moments held through the game's hooks, 429 k clip checks, release on pull OK |

The cast skin, pro card and in-match opponent captures were taken on c4c1897 (before doc 68). Doc 68 only touches the five bases, and its Dazza beard change is kept off the cast.
