## Design Critique: TOPS career screens, prototype v5 (generated photography, Hayden 17:09)

### Overall impression
The photography fixes the main complaint: every screen now opens on a real-feeling person in a real-feeling room, and the set reads as one shoot (same grade, same green club, same man). The cost is that what you see in the menus no longer matches what you see in a match (our 3D figures and rooms).

### Before vs after (what we gain, what we lose)
| Screen | Gain | Lose |
|---|---|---|
| Tonight | Opponent you'd believe exists; one clear Walk on; calm red | Live game's green-lime brand colour and the big "FILL-IN" chapter title; the card-picks tile (moves to Locker) |
| Shop | A dart you'd want to buy; brand split from the name; "vs your dart" up front | The live screen's 5 stat bars (only the changes now); Setup/Gear tabs become Shafts & flights / Shirts |
| Locker | Player portrait with mood; collection-first | The big LV number and stat bars on landing (move to Stats sub-tab) |
| Result | One screen, victory or defeat felt in the photo; one Continue | The animated cash/XP count-up and level-up stage (to keep in the build); "Match details" |
| Exhibition | Barney recognisable at a glance | Painted style differs from the photo set (deliberate: marks a guest star) |

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Menu photos don't match the in-match 3D look | 🟡 Moderate | Accept for menus (Hayden's call); keep the walk-on and match unchanged; say so in the release note |
| Shop hero crops the flight on some darts | 🟢 Minor | Generate with more top margin, or per-dart background position |
| Player's face differs slightly between images | 🟢 Minor | Lock a reference image and regenerate with it attached for the build set |

### Visual hierarchy
- First look: the face, then the title, then the red primary, on every screen. Correct.
- Text over images sits on dark gradients; contrast holds at 390 and 360.

### Accessibility
- Body text on gradients ≥ 4.5:1 in all shots checked; primaries 56 px; thumbnails 78 px.

### Priority recommendations
1. Lock the player reference and regenerate the build set from it (face consistency).
2. Per-tier Tonight images (6 more) before slice 2.
3. Barney style: keep painted for legends only, applied to every legend so it becomes a rule, not an exception.
