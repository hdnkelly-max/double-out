# EXP-UX mock-ups round 1 · critique (ChatGPT "Create Darts Screen Image", 16:24) + design-critique

**Scores:** Tonight 8.0 · Shop 7.6 · Locker/Cards 6.3 · Result 8.1 · **set 7.4, BLOCK** (target 8.5).

## P0
1. **Real 390×844 viewport.** Generated images are ~960×1600–1800; at phone size text and taps won't survive. Vertical budgets: header 56, main tabs 46, secondary tabs 38, hero 290 (Tonight) / 280 (Shop) / 175 (Cards) / 260 (Result), primary 56 (48 on Cards), safe area 24.
2. **One action per screen holds** (Walk on, Buy, Open, Continue); Result's pack "Open" must be a low-emphasis outline.
3. **Red discipline fails:** red message badges (Locker, Result), red sub-tab underline (Cards). Red only on the primary and the active main tab; badges grey; sub-tab selection white/muted green.
4. **Photoreal people mislead.** Big Mal and the Result pair read as photographs; the build uses our rigged characters. Use real in-engine renders.

## P1
- Type tokens at 390: header 16, main tabs 12–13, kicker 11–12, hero title 30–36, primary 19–22, body 13–15, meta 11–12.
- One panel spec: slate, 1 px #3A4043, 10 px radius, 12–16 px padding (card frames' cream/gold outlines are artwork, not UI).
- Hero dominance: Tonight 60/40 venue/opponent; Shop ~20% air round the dart; Result score must win over faces.
- Rewards: cash + XP in one two-column panel, then three 48–56 px rows.
- Cards: collection first; shrink the avatar, one compact set bar, two full card rows above the fold.

## P2
8 px baseline, 16 px between sections, 4.5:1 body contrast, 44×44 taps (arrows, chips), real dart renders, 16 px margins, text as HTML over images (not baked).

## My design-critique (agrees, adds)
- **What works:** Tonight's order (who → why → form line → Walk on) and Shop's product shot are the two strongest ideas; keep both.
- **Its verdict on what to do next is right:** "another deliberate design pass, not another round of prettier renders". So round 2 is the clickable prototype itself, built at real 390×844 in HTML/CSS with the tokens above and our actual renders (venue stills from `wip/style/stills`, character renders from the game's own `V.portrait` / `V.heroShot`), then scored from screenshots at phone size.
