# 62f · Engine: rel-v3-r8c (on r8b): portrait skin and pro card composition, plus the v3 walk-on

Engine (TOPS 2) · Sun 22 Nov · branch `rel-v3-r8c` @ **6368772** (tree `227b3e4`), base src v4.23 `9e182c2`, on top of r8b `b784185` · sheets in `wip/r8c2/`

It merges clean onto src v4.26 `c6ca822` (auto-merge of `rb/s3.js` and `s3/manifest.json`; the build is OK). Both items are switch-on work, not blockers for the hidden ship. Everything sits behind `?v3=1`; the v2 default is untouched (v3-parity passes against src 4.23).

## 1. Portrait skin: trimmed 13%, then measured against the in-match render

**What changed**
- During the v3 portrait render only (`headshot`), the light on skin is multiplied by **0.87** (`TOPS_PORTSK`; `1` gives r8b). It covers the skin's environment diffuse and specular.
- It's one uniform shared by every v3 skin material. It's 1 everywhere else, so the match, the hero and the cards are unchanged.
- The material and colour pipeline is the same. There's no skin recalibration.

**How it was checked**
- The reference is the same figure under the match light rig, drawn by the main renderer to the screen.
- Its camera is the portrait's, fixed relative to the head bone, so each pixel is the same surface in both images.
- Forehead, cheek and jaw are sampled at landmarks anchored on the head (skull vertices facing the camera), skin pixels only.
- Tool: `tests/v3-portskin.js` plus `tests/v3-portskin-measure.py`. Sheet: `r8c_portrait_skin.jpg`, at 256 px, the game's portrait size.

| Base | Forehead (portrait / in-match) | Cheek | Jaw: r8b → r8c / in-match | Mean error r8b → r8c |
|---|---|---|---|---|
| Kai | 176 / 178 | 167 / 162 | 118 → 108 / 63 | 20.4 → 17.0 |
| Ray | 174 / 178 | 162 / 163 | 89 → 80 / 64 | 9.6 → 7.3 |
| Tama | (hair) | 88 / 91 | 52 → 47 / 40 | 8.6 → 5.2 |
| Mia | 171 / 176 | 160 / 160 | 94 → 86 / 69 | 10.1 → 7.2 |
| Dazza | 175 / 182 | 155 / 156 | 92 → 92 / 70 | 11.3 → 10.3 (the beard) |

**Honest read**
- The trim brings every base closer to the in-match render, by 10–40% of the error.
- Forehead and cheek already matched, within a few points. The light there sits near the top of the tone curve, so a 13% trim barely moves it.
- **What's left is the jaw.** In the match the light comes from above, so the lower face falls off. The portrait's front light has no such falloff. That's why it reads as one flat orange.
- A trim can't make that gradient. Two possible next steps, not done because they go beyond the trim asked for:
  - **(a)** Render the portrait under the match light rig. Measured, this matches the in-match render by construction.
  - **(b)** A soft top-down gradient on the portrait skin only.

## 2. Pro cards: one camera composition, nine personalities

**How**
- Each card keeps its doc 71 pose and camera angle. The renderer measures:
  - the head top (hair or cap included);
  - the head centre;
  - the character height (head top to feet, projected).
- It then zooms (fov) and pans (`setViewOffset`) to the shared targets. That's a pure reframe with no perspective change, rendered fresh with no upscaling.
- Targets (`tests/v3-cards-frame.json`):
  - head top at card y **202** on all nine;
  - head centre x within **332–368** of 700 (a 5% band);
  - character height within a **5%** band.

**The changes**

| Card | Size change |
|---|---|
| Barneveld | **+35%** |
| Price | +21% |
| Power, Littler | +13% |
| Wright | +2% |
| Humphries | 0 |
| van Gerwen | −3% |
| Anderson | −8% |
| Smith | **−9%** |

- **On the numbers:** Smith lands at your −9%. Barneveld needs +35%, not 12–15%, because he was 24% below the median height. +15% would leave him 13% smaller than the rest, outside the 5% band.
- **Barneveld:**
  - lifted: head top from y 247 to 202;
  - a card-only skin light ×1.15 for face exposure. I tried ×1.3 too, but it started to lighten his skin tone, so ×1.15 it is.
- **Power's stand-in:**
  - it drops the white cap for a horseshoe hairline and a walrus moustache, with his round glasses kept: an older, heavy "old master" silhouette that no other card shares;
  - options are in `r8c_power_standin_options.jpg`: quiff, horseshoe + walrus (shipped), mullet + stubble, curly + goatee;
  - **card-only** (`tests/v3-cards-pros.json` `look`). Doc 67's recipes and the in-game stand-in are untouched. **Director:** the in-game Phil Taylor stand-in still wears the cap. Say if the in-game stand-in should match the card; it's a one-line look change.
- **Clip check:** 0 fails on all nine.

**v3-cardart framing check (new)**
- Across the nine, it checks:
  - head top within 5% (of 1050);
  - head x within 5% (of 700);
  - character height within 5%;
  - head top ≥ 120 (the safe area);
  - 0 clip fails.
- The measurements come from the renderer (`tests/v3-cards-frame-measured.json`). The test also checks that each shipped webp **is** the measured render, by sha256.
- **It fails** on the r8b cards and on any re-made card that wasn't re-measured.

**Sheet `r8c_procards_real.jpg`:** the cards as the game draws them (`TopsCards.card`, the game's own CSS, `--card-w` 226 px as on a 390 px phone, at 2×). Top row r8b, bottom row r8c.

## 3. The walk-on on v3 (queued item)

Sheets:
- `walkon_v3.jpg`: the five on v3, at 0.5 / 1.3 / 2.1 / 2.9 / 3.7 / 4.7 / 6.2 s;
- `walkon_v2_ref.jpg`: Kai and Mia on v2.

The capture freezes the game clock for each frame, so the times are exact.

**Findings**
- **0.5–1.3 s (entrance) and 2.9–3.7 s (oche, rear 3/4):** these read well on v3. Hair, colours and the shirt are right.
- **2.1 s, the tracking close-up** (tc/core.js: camera 0.55 m forward, 1.15 m to the side, 1.5 m up, fov 41):
  - the v3 head is bigger and sits higher, so the shot cuts the head at the top and the side;
  - on v2 the same shot holds the whole face.
  - **Fix:** scale that shot's offsets by the head size, or widen it to fov ~48 when v3 is on.
- **4.7 s, the hand-over to the play camera:**
  - the camera passes through the back of the player's head (Mia's bun fills the frame);
  - **v2 does the same.** It's a pre-existing glitch, a little more visible on v3's bigger head.
  - **Fix:** hide the player's figure at the hand-over.
- tc/core.js isn't mine (Experience). Both fixes are small; I can make them if you want them.

## For ChatGPT
1. Portrait skin: is ×0.87 enough, or take step (a), the portrait under the match light rig?
2. The cards at real size: is the composition now consistent? Power's new stand-in silhouette: horseshoe + walrus, or another option?

## Doc 72: Mia curls A/B (opt-in, branch `eng-mia72` @ `cc8dc55`, off r8b)

- Sheet `mia72_ab.jpg`: r8b vs doc 72 at front, both 3/4 views and the 390 face cam.
- **Read:** a clear S-lock down the cheek in the 3/4 views. Subtle at the 390 face cam (a curl in front of the hoop). This matches Director's own read.
- **Dart:** s3-dart-hair (Mia) 17.9 mm with the curls on and 17.9 mm off, so they're never the closest hair.
- **Off by default.** Off is r8b exactly.

## Tests (on 6368772)

| Test | Result |
|---|---|
| v3-parity vs src 4.23 (v2 default) | **PASS**: 13 figures identical; 2,470 clip frames identical at 0.01 mm |
| v3-herocolour | **PASS**: the portrait's reference carries the same trim, so this checks the colour pipeline |
| v3-moodpaint | **PASS** |
| **v3-cardart, now with the framing check** | **PASS**: head top 201.8 on all nine; height 777–816 (5.0%); head x 332–368 |
| s3-creator, v2 and v3 | **PASS** |
| s3-match, v2 and v3 | **PASS** |
| s3-pers-clear | **PASS**: 1.6 M checks |
| s3-pers-match | **PASS**: 429 k checks |
| s3-pros | **PASS** |
| asset-refs | **PASS** |
| s3-clip-cast | **PASS**: 34.6 M checks |
| s3-clip-game (v3) | **PASS**: 23.3 M checks |
| s3-dart-hair | **PASS**: Mia 17.9 mm |
| s3-dart-cast | **PASS**: closest Price 14.6 mm |
| Card renders | 9 / 9 clip-clean |
