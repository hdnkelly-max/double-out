## Design Critique: TOPS career screens v9.1 (round 4, Hayden 17:52)

### Overall impression
Every section now has a job, a first read and a treatment from one component set (card, chip, meter, ring, row, image slot). The pages read as one product. The two weakest spots left are the stats graph's small tap targets and the money match being the only fixture art not from a real venue tier yet.

### Section by section (what it's for → first read → treatment)
| Screen · section | For | First read | Treatment |
|---|---|---|---|
| Tonight · hero | Who you play | VS BIG MAL | Photo, kicker, stake chip |
| Tonight · head-to-head | Who's in form | 47 vs 42 | Faces + tug bar, format line |
| Tonight · primary | Play | WALK ON | Red, entry in the button |
| Tonight · season | Where you stand | 3rd · 2 pts off 2nd | Position dots + cut line → Season |
| Tonight · money match | Side cash | MONEY MATCH | Back-room art, Win $100 chip |
| Tonight · next dart | What to want | Razor Edge | Whole dart 16:9, level meter |
| Tonight · goal | A target for tonight | Average 61+ | Meter with form and target tick, +$40 |
| Season · header | The race | 3rd | Week ring, promotion chip |
| Season · table | The race in full | Your row | Highlighted row, dashed cut line |
| Season · road | The career arc | Club (you) | Stepper Pub → Worlds |
| Shop · product | The dart | Name | Whole dart, brand + state chips |
| Shop · compare | Is it better | +4 Scoring | Yours vs this bars, coloured delta, weight chip |
| Shop · lock / short | Why not yet | Level 15 / $15 to go | Lock panel: chips + progress + way forward |
| Shop · all darts | Browse | Selected tile | Whole-dart strips, state labels |
| Locker · level | Progress | 14 | Ring, XP to next, next unlock |
| Locker · your game | Strengths | Scoring 20 | Segmented to the cap, darts bonus as ghost, + to spend |
| Locker · kit | What you carry | Dart + shirt | 1:1 product tiles, Equipped/Wearing chips |
| Cards · packs | Open | 3 packs waiting | Pack art, set meter, one primary |
| Stats | How good | 47.2 | 4 tiles, tappable form graph vs goal, records |
| Trophies | Pride | 2 of 14 | Cabinet photo, rows open detail |
| Result · header | Win or loss | WON 2–1 | Photo + lockup |
| Result · rewards | What you got | +$55 | Ring, cash big, XP, level-up line |
| Result · next | What's next | Razor Edge $45 to go | Dart strip + money bar |

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Form graph tap targets are 32 px columns | 🟢 Minor | Fine on a phone (full height columns); keep |
| Shafts/Shirts tabs are placeholders | 🟢 Minor | Marked "soon" and dimmed |
| Money match art is the only non-tier image | 🟢 Minor | Per-tier back rooms in the build set |

### Accessibility
- Body text ≥ 13 px; labels 12 px caps; contrast ≥ 4.5:1 on cards; every tappable thing ≥ 44 px (plus buttons 30 px inside a 44 px row, flagged for the build).

### Priority for the build
1. `+` buttons to 44 px hit areas.
2. Per-tier hero and back-room images (6 more).
3. Lock one player reference before the build set.
