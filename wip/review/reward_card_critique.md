## Design Critique: Post-match reward screen (career), 12 Nov 06:15 NZT
Builds: live 1.95 (46d490b) → `polish-rwfit` 288737f (bug fix) → `polish-rwcard` fcc629c (rule 22 polish on top).
Shots: `wip/shots/rw195se_open.png` (before, 375×548), `rwfix2_se_open.png`, `rwc3_390_end.png`, `rwc3_360f_end.png`, `rwc2_360f_open.png`.

### Overall Impression
A strong reward reveal (result → stats → money → XP → unlocks → achievements → picks → decision) that was broken by layout, not design: on short screens the reveal started in the middle and its first half could not be reached. With the fix the order reads as intended on every size; the polish pass removes the last sub-floor text and taps.

### Usability
| Finding | Severity | Recommendation |
|---------|----------|----------------|
| Top of a tall card (WIN, score, stats, prize, XP) unreachable on phones and 1366×768 (bottom sheet / centred flex with no scroll) | 🔴 Critical (fixed) | Overlay scrolls; auto margins keep short cards as a bottom sheet and start tall ones at their top |
| CONTINUE below the fold on a tall card | 🟢 Minor (accepted) | Keep it in the flow: the decision belongs after the rewards; a sticky bar would cover rewards on a 548 px screen (agreed with ChatGPT) |
| Text links 40 px tall | 🟡 Moderate (fixed) | 44 px rows, still text links so they don't compete with the lime action |

### Visual Hierarchy
- **What draws the eye first**: WIN, then the prize in gold and the XP in lime. Correct.
- **Reading flow**: top to bottom in reward order; the unlock tile is the visual peak of the second half; the lime action ends it.
- **Emphasis**: the level-up tile text was squeezed onto two lines next to empty space (a 58% cap meant for the floating dart variant). Now only the dart variant is capped (`is-dart` class), so "LEVEL 4 UNLOCKED" and "Plus 2 more · see Player" read on one line.

### Consistency
| Element | Issue | Recommendation |
|---------|-------|----------------|
| Link colour | #ADB2BA, dimmer than the other muted text on the card | Same muted token as the XP line (#C6CBD2) |
| XP breakdown + score line | Faint under the XP bar | #D4D8DE, still below the headline colours |
| Stat labels | 10 px, under the 11 px floor used on every other screen | 11 px, tracking .05em so the three tiles fit at 360 with the fallback font |

### Accessibility
- **Text size**: nothing under 11 px on the card at 390 (real fonts) and 360 (fallback font), measured by `rwfit.js` while scrolling the whole card.
- **Touch targets**: every button and link ≥ 44 px.
- **Contrast**: links and the XP line move lighter on the dark plate (both above 4.5:1 before and after).
- **Reduced motion**: unchanged (existing `prefers-reduced-motion` rules still apply).

### What Works Well
- The reveal order and the hero render peeking over the card.
- Achievements and card picks stay visibly secondary to the unlock and the action.

### Priority Recommendations
1. **Ship the scroll fix** (bug, Express): it restores the first half of the reveal on short screens.
2. **Ship the polish** (Standard): floors and the unlock tile text.
3. **Later, only if testers miss it**: a sticky action row; not now.

**Score:** fix 9.0 · polish 9.0 (ChatGPT: fix 8.5 → round 1 applied; polish 8.6 → 9.2).
