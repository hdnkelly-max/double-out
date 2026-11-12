## Design Critique: TOPS career screens, prototype round 3 (390 × 844, game renders only)

### Overall Impression
Reads as one product now: one header, one tab rail, one panel spec, red only on the primary and the active tab. The biggest remaining weakness is not layout but the characters: our rigs are plain next to the UI, and Big Mal's model doesn't look like Big Mal.

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Tonight hero says "VS BIG MAL" over a slim young figure | 🟡 Moderate | Character roster call (Needs a call): give Big Mal a heavier model or a beard/build variant; UI can't fix it |
| Shop thumbnails: 4 of 6 visible, rest by arrows/swipe | 🟢 Minor | Fine; scroll-snap + centred selection keeps the choice visible |
| Locker chips overflow | 🟢 Minor | Fixed: edge fade + partly visible next chip |
| Result: "Open" pack is a second button | 🟢 Minor | Ghost style keeps CONTINUE the single primary |

### Visual Hierarchy
- **First look:** Tonight → hero then WALK ON; Shop → the dart (now large, angled) then BUY; Cards → OPEN then the grid; Result → WON 2–1 lockup, then +$55.
- **Reading flow:** top to bottom on every screen, one primary each.
- **Emphasis:** right. Result now says victory first (opponent dimmed, score on its own dark column).

### Consistency
| Element | Issue | Recommendation |
|---|---|---|
| Panels | All 1px #3A4043, r10 | — |
| Type | Metadata floor 13 px; header Lv 12 px; tabs 12.5 px | — |
| Imagery | Venues and darts read as one world; figures are flatter than the rooms | Rim light / grade pass on hero portraits (renders.js) |

### Accessibility
- **Contrast:** body #f2f3f1 and #b7bdb9 on #1c2024 pass 4.5:1; #868d89 meta passes for 13 px at ~5:1.
- **Touch targets:** primaries 56 / 48 px; thumbs 78 px; chips 34 px (below 44, but with 8 px gaps; P2).
- **Text:** nothing under 11 px; card captions 11 px on a solid strip.

### What Works Well
- Real game imagery inside calm panels: the Club still and the dart renders sell the world better than generated art.
- One action per screen survived every state (first match, broke, locked dart).

### Priority Recommendations
1. **Big Mal's model** — identity mismatch on the main screen; a roster call for Career/character owners.
2. **Hero portrait grade** — add rim light and a slight contrast lift to the two hero renders so figures sit in the room.
3. **Chip height 34 → 40 px** — closer to the 44 px target without crowding.
