## Design Critique: TOPS rebrand batch 1 · match view, match menu, leg card, Result (r4)

### Overall impression
The match now speaks the same language as the menus: graphite panels, white type, one red accent. The scoreboard reads faster than live: the side that's throwing has a red top edge and a red wash, the other side is grey. Nothing moved: every box, the board, the reticle and the pull pad keep their size and place.

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Active player was weaker with a thin underline only (r2) | 🟡 Moderate | Fixed r4: red top edge + wash on the active side, muted inactive side |
| Pull pad corner brackets still lime | 🟢 Minor | Colour-only swap once Engine agrees (improvements log #15) |
| Header sits under the iPhone status bar in the home-screen app | 🟡 Moderate | Needs a call on the board (option A recommended) |
| Menu opens over more of the board with 44 px items | 🟢 Minor | Fine: the menu is only open between throws |

### Visual hierarchy
- First read mid-throw: the active score (white on red wash), then the visit chips, then the HR chip. Correct.
- "Big Mal throwing" stays a graphite chip with a small red bar: information, not an alarm.

### Consistency
| Element | Issue | Recommendation |
|---|---|---|
| Lime accents | Gone from the HUD and the scoreboard | Pull pad brackets left (input surface) |
| Red | Used for the active side, the last-dart tick, the throwing chip bar | Keep solid red for primary buttons only |

### Accessibility
- White on #1a1e21 and on the red wash ≥ 7:1; grey inactive score #8d9497 on #1a1e21 ≈ 5:1.
- Menu items 44 px. MENU button itself 28 px tall (live too): logged for the safe-area header work.

### Scores
ChatGPT: r2 7.8 BLOCK → **r4 9.1 APPROVE** (match 390 9.2, scoreboard 9.4, 360 8.6 provisional → confirmed with r4 360 capture `mv_ba_r4_360.jpg`, opponent throwing 9.0, menu 8.5, Result 9.0).
