# 62e · Engine: rel-v3-r8b (hidden RC on top of r8): hero and portrait colours, doc 71, and pro cards under the shipping flags

Engine (TOPS 2) · Sun 22 Nov · branch `rel-v3-r8b` @ **b784185** (tree `18f65b8`), base src v4.23 `9e182c2`, on top of r8 `168b507` · sheets in `wip/r8b/`

**It merges clean onto the current src, v4.26 `c6ca822`.** `rb/s3.js` and `s3/manifest.json` auto-merge and the build is OK.

Everything new sits behind `?v3=1`. The v2 default is untouched: v3-parity passes against src 4.23.

## 1. Hero and portrait colours fixed at the source (Experience)

**What Experience saw:** under v3, red shirts read pink, charcoal read grey, purple read lilac, and Tama looked pale. This hit the Locker hero, the hub hero, the New look card and the portraits.

**There were two causes, and both are now fixed (v3 only):**

1. **A double gamma in the portrait.** `headshot` (used on the result screen, hub and Circuit) renders to an sRGB target and then applied a second 2.2 curve on readback. The hero had the same bug, which r8 fixed (`TOPS_HERO8`). The portrait now gets the same fix.
2. **The portrait/hero scene's direct lights.** Its hemisphere, key and rim lights were built for v2. They over-lit and warmed the v3 materials, which the match lights with the environment map only. They're now switched off during a v3 render and restored right after. `TOPS_HERO8L=0` keeps them on.

**Result:** the hero and portrait now come out the same as the in-match render. Sheet `r8b_hero.jpg` shows, for each look: r8, r8b, and the same frame drawn the in-match way, plus the real face cam for reference. Rows are Kai in red, charcoal and purple, then Tama and Mia.

**New test: `tests/v3-herocolour.js`.**
- It renders the hero and the portrait, then compares each against the same scene and camera drawn straight to the screen canvas (the in-match colour path, via a QA-only `__SHOTREF` hook).
- Six shirts: red, green, blue, black, charcoal and purple. Each must keep its hue (within 20°), its saturation (at least 0.6× the picked value) and its darkness.
- One skin swatch per base.
- It **fails** with either fix turned off and **passes** with both on.

| Look | Hero mean difference vs in-match (0–255) | Shirt: picked → hero (in-match) |
|---|---|---|
| Red | 0.46 | `#d21e28` → 255,88,71 (255,85,69) |
| Charcoal | 0.52 | `#2a2b33` → 67,60,60 (66,58,58) |
| Purple | 0.49 | `#5b2a86` → 142,62,167 (140,60,165) |
| Tama skin (portrait) | 3.7 | 242,120,75 (245,121,73) |

**Honest read:** the portrait is lit from the front, so the face reads flatter than in the 3/4 match camera. The colours are the same.

**Note for doc 74** (Director's Locker hero, which Experience owns): doc 74 uses `V.heroShot` for the Locker. With this fix, that render now carries the real shirt colour.

## 2. Doc 71 (Director): card poses and the mood fix

- **Applied clean:**
  - `V3CARDPOSE`: one pose, camera and plate crop per pro card.
  - `v3PersApply` now takes an explicit spec.
  - `v3SkinPaint` is shared by the build and the mood redraw.
- **Mood fix (`TOPS_DOC71`):** a PERS23 mood (celebrate, signature, miss) used to wipe Dazza's doc 68 beard junction and any painted stubble. They're now kept.
- **New test: `tests/v3-moodpaint.js`.** It checks Dazza's junction ring and a stubble player's cheeks through every mood and the reset. It ignores the pixels the mood itself changes: the mouth area, taken from the plain sheets. **Fix off:** FAIL, the paint shifts by 37–43 (0–255). **Fix on:** PASS, within 0.6.

## 3. Pro cards under the SHIPPING flags (Producer)

- All 9 cards were re-rendered with `s3pros` **off**, so they show the seeded stand-ins (what ships until the look-alike patch).
- They use doc 71's poses and cameras and Director's composite.
- The clip check runs per card: 0 fails.
- Head tops land at y 131–288 (spec: y ≥ 120).
- Sheet `r8b_procards.jpg`: top row r8, bottom row r8b as shipped.

**One change from doc 71's numbers: the plate crop.**
- Doc 71's crops (cx 620–836) cut the Palace plate's TOPS banner down to a fragment ("PS", "ORS") at the top-left of Taylor, Littler, van Barneveld and Humphries.
- The crop's left edge now stays right of the banner (x ≥ 632, i.e. cx ≥ 945). Figures, poses and cameras are unchanged.
- `CLRBAN=0` in `tests/v3-cards-comp.py` reproduces doc 71's exact crops.
- Sheet `r8b_procards_crop.jpg`: A (doc 71 crops) vs B (shipped). In B the board sits behind the figure on most cards.
- **Director / ChatGPT:** if you prefer A, it's a one-line re-composite.

**Render tools:** `tests/v3-cards-render.js`, `tests/v3-cards-comp.py`, `tests/v3-cards-pros.json`.

## For ChatGPT

1. Hero and portrait: do they now read as the in-match figure, especially red, charcoal, purple and Tama?
2. Pro cards under the shipping flags: right read and framing? Crop A or B?

## Tests

The build tested is `5aeed91`. After that there were no game-code changes: `40403bd` only adds a test, and `b784185` changes the card webps and the composite tool (cardart was re-run on it).

| Test | Result |
|---|---|
| v3-parity vs src 4.23 (v2 default) | **PASS**: 13 figures identical; 2,470 clip frames through V2POST identical at 0.01 mm |
| **v3-herocolour** (new) | **PASS**: 11 looks; hero and portrait match the in-match path; 6 shirts keep their colour; 1 skin swatch per base |
| **v3-moodpaint** (new) | **PASS** (fix off: FAIL by 37–43) |
| v3-cardart (×2: before and after the crop change) | **PASS**: 9 cards, v3 art under `?v3=1` at 700×1050, no nested swap, v2 keeps today's art |
| s3-creator, v2 and v3 | **PASS** |
| s3-match, v2 and v3 | **PASS** |
| s3-pers-clear | **PASS**: 5 figures, 75 poses, 1.6 M checks |
| s3-pers-match | **PASS**: 25 moments in a real match, 429 k clip checks, release on pull OK |
| s3-pros | **PASS** |
| asset-refs | **PASS** |
| s3-clip-cast | **PASS**: 12 figures × 19 clips, 34.6 M checks |
| s3-clip-game (v3) | **PASS**: 8 figures, 23.3 M checks |
| s3-dart-hair | **PASS**: Mia 17.9 mm, Dazza 22, Big Mal 18.1 |
| s3-dart-cast | **PASS**: closest Price 14.6, Big Mal 18.1 |

**Not re-run:** s3-clip-p70 and s3-dart-p70. r8b doesn't touch the player-look geometry, so the r8 runs on `168b507` stand.
