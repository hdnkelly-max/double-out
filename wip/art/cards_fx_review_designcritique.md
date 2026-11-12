## Design Critique: Pub rules card effects (Jukebox, Air Horn, Heckle, Bouncer + the rest), live 1.94 vs after

### Overall Impression
Live, the Jukebox read as a coloured filter over the board, and on desktop every effect was mis-sized: the layer was a fixed top 52% band, so the Bouncer's door covered half the board, the heckle caption ran off the pane and the horn was tiny. After, every effect sits on the board pane itself and props scale with it; the Jukebox has its own identity.

### Usability (match readability)
| Finding | Severity | Recommendation |
|---|---|---|
| Live desktop: effects layer ignores the board pane (door half-height, caption off-pane) | 🔴 (fixed) | Layer and canvas sized to `V.lkRects().board`, props scale by pane size |
| Jukebox wash covered the doubles and numbers | 🟡 (fixed) | Tubes at the edges, narrow screen-blend glow, centre clean |
| Jukebox gave no sense of how long it lasts | 🟡 (fixed) | "Jukebox · this visit" pill opposite the HR chip, ends with the visit |
| Air Horn cone over the lower-left board on phone | 🟢 (fixed) | Horn ~44 px further left on phone |
| Heckle caption read as loose UI text | 🟡 (fixed) | Staged broadcast caption strip above the HR chip |

### Visual Hierarchy
- Each effect interrupts at the edge or bottom of the pane; the aim point and the treble ring stay readable except where the card is meant to block (Bouncer).

### Consistency
- Last Orders and the drink/defence stamps scale with the pane too, so desktop matches phone proportions.

### Accessibility
- Caption: white on rgba(10,12,14,.74), 13 px phone / ~18 px desktop. Reduced-motion rule unchanged (CSS animations collapse).

### Verdict
Agree with ChatGPT: lock. Jukebox 7.0/6.5 → 8.7/8.6; Air Horn 7.5/8.0 → 8.7/8.6; Heckle 8.0/7.0 → 8.8/8.7; Bouncer 8.0/9.0 → 8.7/9.0.
