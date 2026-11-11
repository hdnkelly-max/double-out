## Design Critique: player walk-on (Regional, lightning), 1.99 vs art-walkon2

### Overall Impression
Live had three cinematic faults: a low opening camera looking up into the black above the walls, a hero pose caught mid-move (the one-shot cheer clip ran on to an arms-out end pose), and a closing camera blend that flew through the player's arm. All three are fixed; the walk-on now ends on a held, arms-up hero frame and cuts under the overlay fade.

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| T-pose while animations load (live) | 🔴 (fixed separately, art-walkon c419505) | Hold on a stage shot until the rig can animate |
| Camera flies through the arm at the end | 🟡 (fixed) | Hard cut under the fade |
| Hero pose inconsistent (end-pose arms out) | 🟡 (fixed) | Hold at the live-detected hand peak |

### Visual Hierarchy
- Phone: player on the left third, board clear on the right, banner above: the classic broadcast walk-on frame.
- Opening: chest height, tilted slightly down; the venue fills the frame.

### Consistency
- Same timeline and effects for every walk-on cosmetic; only camera, pose hold and light changed.

### Verdict
Agree with ChatGPT: lock (phone 8.5 → 9.1, desktop 8.5 → 9.0). Note: the k 0.97 image in the round 3 sheet came from an older run (arms out); the current build was reshot at 0.97 and ends arms-up on both sizes (`wip/art/shots/walk_r8_end.jpg`).
