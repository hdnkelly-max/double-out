## Design Critique: Play and Player tabs (rule 22, 1.92, 390x844)

### Overall Impression
Both screens were already well structured (clear primary action, strong hero), so this pass is measurement-led polish only: text under the 11 px floor and tap targets under 44 px, plus the cramped card-picks tile. ChatGPT: 8.1 → 9.0 (Play 8.3 → 9.1 target, Player 7.9 → 8.9).

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Hamburger menu rows 40 px tall | 🟡 Moderate | **Done:** 48 px rows, same type |
| Respec button 40 px (inline style in `v09.js`) | 🟡 Moderate | **Done:** 44 px |
| Card-picks tile: "Ready to open" on the bottom edge, chevron cramped | 🟢 Minor | **Done:** +12 px padding, 4 px under the subtitle, 32×32 chevron box |

### Visual Hierarchy
- **First:** WALK ON (lime, full width), which is correct. The card-picks tile stays secondary (lime edge + chevron, no button) and Spare night stays optional, which matches ChatGPT's pushback.

### Accessibility
- **Text floor:** WIN / LOSE labels and spare-night tags 10 → 11 px; "Next big unlock" 10 → 12 px. After the change the measure finds nothing under 11 px on Play, Store, Player or the menu at 390.
- **Touch targets:** none under 44 px on those screens after the change.
- Colours unchanged (muted #9AA7A5 and lime on the dark surface, both well above 4.5:1).

### What Works Well
- The fixture card (portrait, stakes, WALK ON) reads in one glance.
- The menu keeps its dark panel and right anchor; only its hit area grew.

### Priority Recommendations
1. Ship as is (CSS + one inline style). 2. Later, optional: Signature trait spacing (ChatGPT P3). 3. Keep the dark panel inside the card-picks tile (ChatGPT round 2).

Verdict: 8.9/10.
