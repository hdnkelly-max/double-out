# TOPS: the next 50 (9 Nov 2026)

Ranked by player impact per effort (ChatGPT, from the full QA screenshots in shots/ and shots/pub/). ★ = this week. Size: S under 1h, M half a day, L 1-2 days.

## QA run (Claude, 9 Nov)
- All 51 screens render on phone (390x844) and desktop (1366x768) with no page errors. Live build loads clean, Google sign-in works.
- Career match plays through the real pull/release input. A Run loss costs a life and shows the result. A Scoring 20s drill completes with its result card. Online lobby, invite link and Pub rules bet rounds work in multi-tab tests.
- Fixed during QA: the phone route bar was 48px wider than its slot ("ROUTES" cut off).
- Known gaps: Run Player tab still shows career labels; the leaderboard screen can't be checked offline.

## Progress (9 Nov, evening)
- Done: 1-9. Item 10 is partly done: events are recorded in each player's save (synced to the cloud when signed in) because creating a dedicated anonymous events table needs Hayden's OK.

## The list
| # | Area | Item | Size |
|---|---|---|---|
| 1 ★ ✅ | Result bug | Feats render as full rows (min 180px), hide empties, overflow behind "All feats" | S |
| 2 ★ ✅ | Career bug | Remove "undefined" from the previous-fixture tile; fallback "Previous result unavailable" | S |
| 3 ★ ✅ | Phone throwing | Throw pad explains its state: Aim on the board, Hold here, Release at the marker, verdict | M |
| 4 ★ ✅ | Pub polish | Buff chip under the name/score row so names never collapse | S |
| 5 ★ ✅ | Run context | Run Player tab: seed, match, lives, run average, cards, suits; no bank/chapter/Deano | M |
| 6 ★ ✅ | Phone intro | Venue and competition on separate lines (12px kicker, 16px name) | S |
| 7 ★ ✅ | Onboarding | Six-dart first-play lesson: three guided, three unassisted; Skip and Replay | M |
| 8 ★ ✅ | Multiplayer | "Rematch, same room" on online results; keep pros, teams, rules; re-collect ready | M |
| 9 ★ ✅ | Match feedback | Visit receipt: three dart chips, visit total, remaining, exact bust cause | M |
| 10 ★ (partly) | Beta evidence | Anonymous funnel: mode entry, first dart, first leg, result, rematch, quit, disconnect | M |
| 11 | Presentation | Remove duplicate throwing poses behind the active player | S |
| 12 | Career table | Compact table: position, player, played, points; W/L and legs in the full table | S |
| 13 | Kit shop | Show deltas vs equipped (Spread −7%, Window +4%), formulas under Details | M |
| 14 | Result | Remove duplicate reward summaries; one Skill/Money/Standings block | S |
| 15 | Title/login | Copy names all modes: career, quick darts, online with mates | S |
| 16 | Lobby | Rules collapsed by default on phone; room, pro and Ready first | M |
| 17 | Betting | Separate check column from odds; selected target cream outline | S |
| 18 | Pub settings | Switch rows (48px) instead of red rule buttons; short summary | S |
| 19 | Multiplayer | 30-second reconnect with snapshot restore, "Reconnecting" state | L |
| 20 | Online integrity | Event IDs, turn validation, duplicate rejection per dart/visit/bet | L |
| 21 | Phone controls | Left-handed preference for Settle and routes | M |
| 22 | Input | Cancel the pull on rotation/viewport change with "Throw cancelled" | M |
| 23 | Touch | 44x44 hit areas for Menu, Whole board, Routes, Settle, draft actions | S |
| 24 | Pacing | Saved "Quick presentation" for solo: 300ms holds, no ordinary reaction delays | M |
| 25 | Checkout | Game shot shows winner, checkout and legs for 1.2s, skippable after 300ms | M |
| 26 | Leg card | Previous leg result instead of "First match on the books" | S |
| 27 | Audio | Separate Effects / Caller / Crowd volume; resume audio after backgrounding | M |
| 28 | Impact audio | Small recorded pack: sisal impacts, wire, bust, checkout, UI | M |
| 29 | Caller | Original caller pack: 100, 140, 180, No score, Game shot (and the match) | L |
| 30 | Performance | Adaptive DPR 1.5 → 1.25 → 1.0 on sustained slow frames | L |
| 31 | Rendering | Pause hidden-scene rendering, lighter idle menus | M |
| 32 | Loading | Show real loading stage; "Retry loading" after 10s | M |
| 33 | Saves | Save-status indicator, export/import with version check | M |
| 34 | Economy | Next three fixtures' costs and shortfall, linked to local/money matches | M |
| 35 | Season stakes | Gap to second and fixtures left; announce secured promotion | M |
| 36 | Practice | "Practise this" from the result coaching line | M |
| 37 | Practice | Last five scores per drill, PB and change | M |
| 38 | Practice | Finish Round the Clock (order, darts used, PB) | L |
| 39 | Characters | Regulars get a form note, last three results, one factual callback | M |
| 40 | Run draft | Five columns on wide desktop; two columns + sticky footer on phone | M |
| 41 | Run synergies | Preview exact card effect ("Clubs 2 → 3 · Flush activates") | M |
| 42 | Run routes | Name risk and reward explicitly on both routes | S |
| 43 | Run retention | "Retry this seed" / "New seed" on defeat | M |
| 44 | Pub feedback | Round receipt in the tally log (nominal vs capped penalty) | M |
| 45 | Pub comfort | Personal "Visual wobble" toggle in the match menu | S |
| 46 | Text | 14px min body, 12px min metadata, tested contrast | M |
| 47 | Keyboard | Modal focus trap, Space/Enter selection, focus restore | M |
| 48 | Multiplayer | Turn order and team labels in 4-way/2v2; "YOU NEXT" | M |
| 49 | Sharing | Shareable result card (score, average, best finish, link) | M |
| 50 | Rivalry | Drill challenge link: "Beat Hayden's 420" | M |

## ChatGPT's summary
TOPS most needs a first match that teaches itself and makes every dart's outcome clear. Then reliable repeat play: rematches, reconnects, saved progress and useful practice feedback. Use the beta to choose the next investment; pause new modes until these loops hold up.
