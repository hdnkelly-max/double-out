# Round 2 mockups · design-critique (Experience, 04:45 13 Nov)

Framework: first impression · usability · hierarchy · consistency · accessibility. Sheet: `wip/r2/r2_contact.jpg`.

| # | Screen | First read | Works | Problems / risks |
|---|---|---|---|---|
| 1 | Setup & gear | "My dart, then its parts" | One navigation system (hub tabs + segment); kit stats as meters match Locker | Part rows reuse the dart render as a placeholder; a build needs per-part shots or icons |
| 2 | Leg end lower-third | "I took the leg, 1–0" | Never covers the board; pips + averages read in under a second; no tap | It sits over the pull pad: must not swallow a pull (Engine); the progress line needs to read as the timer, not a stat |
| 3 | Opponent visit | His big red-edged score block | Throwing state lives where the eye already is; banter no longer covers the room | Caption at 13 px is quiet; it has to stay one line (long lines truncate) |
| 4 | In-match Menu | "Settings, then back" | Same sheet language as the hub ☰; 44+ px rows | Quit must keep today's two-tap confirm |
| 5 | Match intro | Two men, VS, numbers | Real renders, same faces as Tonight/Result, so the three screens tell one story | Mirroring Big Mal hides his throwing hand; renders end at the waist (faded) |
| 6 | Level-up in Result | "Level 15, new dart" | No new→old→new jump; one red primary | The unlock image must be the real product shot/render of that item |
| 7 | Title / Continue | "Big Mal next, continue" | Fixture as hero; three modes as tiles; links demoted | Duplicates Tonight's hero: option is to skip the title for returning players |
| 8 | Messages | "Deano about Thursday" | Message tied to its fixture; bubbles + chips | Copy is placeholder; sender hero render only where we have a 3D character |

Accessibility: all text ≥ 11 px, taps ≥ 44 px, white on graphite/red ≥ 4.5:1.
