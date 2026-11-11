## Design Critique: TOPS career home, round 2 (three visual languages), 390×844, mid-career save

### Why round 1 missed (agreed with ChatGPT)
All three concepts shared one design system: the same dark green and lime, the same condensed caps and small tracked labels, rounded translucent cards with thin borders, thin-line icons and darkened pub photos behind panels. They differed only in layout. The test for round 2: no concept can be produced by swapping CSS variables on another.

### 1 · Prime Time (sports broadcast)
- **First impression:** a darts broadcast going live; the matchup dominates.
- **Hierarchy:** strap (Hayden v Big Mal) → comparison bars → "On the line" → Walk on → ticker. Correct.
- **Language:** Anton/Oswald, black/red/white, hard skewed panels, no radius, a real in-game hero render as the cut-out.
- **Risks:** the ticker text is truncated at rest (intended as a crawl, it scrolls in a build); the hero render must be lit well for each look.
- **Accessibility:** white on black and white on red both pass AA at these sizes; nav items 48 px tall.

### 2 · Black Label (dark luxury minimal)
- **First impression:** a premium watch or whisky brand; calm, one decision.
- **Hierarchy:** "Big Mal." → one sentence of stakes → three serif stats → Walk on. Almost nothing else.
- **Language:** Cormorant display, Inter light tracked caps, one brass accent, no cards, the dartboard as a lit object.
- **Risks:** secondary paths (money match, contract) are hidden behind tabs; the 10–11 px tracked caps sit at the floor, so lift them to 11 in a build.
- **Accessibility:** brass on near-black ≈ 7:1; the Walk on pill is 64 px.

### 3 · Chalk & Ink (gritty pub materials)
- **First impression:** your local's fixture board; tactile and warm.
- **Hierarchy:** chalkboard (who, the stake, form) → ticket (where, prize) → stencil Walk on sign → plaques.
- **Language:** Permanent Marker chalk, Special Elite typewriter, Black Ops stencil, real-material surfaces (slate, paper, enamel), tungsten light.
- **Risks:** chalk type is less legible at small sizes, so only headline and key lines are chalk; textures need a performance check on phones (CSS/SVG noise, no extra images).
- **Accessibility:** chalk on slate ≈ 12:1; plaques are 48 px tall.

### Distinctness
Each would pass as a different game's home at first glance. They share no font, palette, surface treatment or nav style.
