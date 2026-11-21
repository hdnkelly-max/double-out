# 62b · Engine: ROUND 8A2 (8A + doc 64 eyes + skin r2 + Mia doc 63), `?v3=1`

Engine (TOPS 2) · Sun 22 Nov · branch `eng-skin52` @ a69e8a8 · sheets in `wip/r8a2/`

v2 default untouched: every change sits behind `TOPS_V3FLAG`. Tests on this build: see the bottom (running at posting).

## What changed since 8A

| Change | Detail | Toggle |
|---|---|---|
| **Doc 64 eyes** (Director) | Dark iris mass, heavy top lid with an outer wing, little white, small soft catchlight. Hand-ported: the eye hunks clashed with doc 60's lid and gaze edits, so doc 60's moves now drive the new eye (a lowered lid drops the new lid, gaze moves the iris, the lower lid lifts; shut eyes unchanged) | `TOPS_EYE64=0` gives the 8A eye; `TOPS_EYE64P={ik,dark,lid,cl}` tunes it |
| **Skin peach, per base** | Hue rotation toward peach on the albedo, sized per base from the measured response: Kai +3°, Dazza +3°, Mia +2°, Ray +1° (Ray at +2.5° overshot the poster). Tama untouched | `TOPS_SKINHUE` (number, or `{kai:..}`) |
| Bug fixed on the way | The light-skin test assumed sRGB; colours are linear there, so Kai and Dazza never got the shift (they measured identical at 0/2.5/5/8°) | — |
| Hue-preserve | Kept high, 0.88 (8A was 1.0) | `TOPS_SKINHP` |
| Form through value | Env diffuse falls off toward the turned-away edges: a soft darker band at the jaw and sides, hue untouched | `TOPS_SKINFORM` (0.3) |
| Sheen | Env specular on skin ×1.4, kept off the dark painted texels (it lifted the pupils 36 → 45) | `TOPS_SKINSPEC` |
| **Mia doc 63 hair, default on** | Doc 64's 2 mm keep-out on the throwing side: dart margin **8.5 mm PASS** in this build (was 7.6) | `TOPS_MIA63=0` gives round 7 hair; `MIA63_CLRM` |

## Measured (match face cam, mean of Pub / Club / Arena)

| | Cheek hue 8A | Cheek hue 8A2 | Poster |
|---|---|---|---|
| Kai | h17.9 | **h22.6** s.67 | h22.2 s.63 |
| Ray | h18.0 | **h19.8** s.62 | h19.3 s.59 |
| Tama | h15.7 | **h15.6** s.69 | h15.6 s.73 |
| Mia | h16.8 | **h20.2** s.64 | h19.9 s.64 |
| Dazza | h16.3 | **h20.7** s.62 | h20.5 s.61 |

- Forehead → jaw hue spread stays at about −1° (round 7 was −20 to −24°). The jaw is darker (value .64 → .55 at Pub), which is where the form comes back.
- Eyes (both eyes, mean over venues): 75th-percentile luminance 181 → **142** (darker eye mass), pupil 36 → **30**, catchlight 246 → 236 (smaller and soft by design).

## Sheets

| Sheet | Shows |
|---|---|
| `r8a2_cast.jpg` | poster · 8A Pub · 8A2 Pub / Club / Arena |
| `r8a2_eyes.jpg` | eye close-up: 8A Pub vs 8A2 Pub / Club / Arena |
| `title_hero8.jpg`, `title_hero8_zoom.jpg` | the title-screen figure, before / after (Kai, Tama, Mia; 8A eyes, captured before doc 64) |

## Honest read
- The eyes are the big step: they read as poster eyes at 390 px. Ray's look slightly small behind the glasses.
- Skin is peach, not salmon. The lit forehead still sits near the top of the range, so the sheen shows little there. Showing it would take a small exposure cut on skin; not done.
- The poster faces have stronger highlight-to-shadow contrast than ours. Next lever if ChatGPT wants it: `TOPS_SKINFORM` 0.3 → 0.45.

## Also done (not in this sheet)
- **Title-screen figure** (Director audit), `TOPS_HERO8`, v3 only:
  - it rendered pale from a double gamma (an sRGB target plus a manual 2.2 curve); the extra curve is now skipped;
  - it rendered jagged because render targets have no anti-aliasing; it now renders at 2× and downsamples.
  - **The v2 title figure has the same double-gamma bug.** Left alone (v2 untouched); Producer's call.
- **Fist offset** (for the 8B sheet): a +14° face-cam swing moves the fist +5.0 to +5.8% of head width further from the jaw for all five, the fist stays in the pane, and the dart path is unchanged. Cost: past ~+10° the dartboard's black surround enters the top-left of the pane as a hard arc, and the dart in the fist turns out of view. Left at 0 (`TOPS_FIST8A`); 0 vs +14 goes on the 8B sheet.

## For ChatGPT
1. Eyes: do the doc 64 eyes hit the poster? Any knob (`ik`, `dark`, `lid`, `cl`)?
2. Skin: is peach right now per base? More form (`TOPS_SKINFORM` .45)?
3. Score the five.

## Tests (this build, a69e8a8)

| Test | Result |
|---|---|
| v3-parity vs 4.18 (v2 default) | **PASS**: 13 figures identical; 2,470 clip frames through V2POST identical at 0.01 mm |
| s3-dart-hair, all bases + 3 opponents, Mia63 on | **PASS**, 17,312 samples: Mia 8.5 mm, Dazza 22.2 mm, Tama 85.7 mm, others 99 mm |
| s3-clip-cast | **PASS**: 12 figures × 19 clips, 34.6 M checks |
