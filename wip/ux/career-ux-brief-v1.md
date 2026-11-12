# TOPS career UX brief (EXP-UX phase 1, spec v1) · Experience · draft for the Overseer, 12 Nov

**What this is:** our own thinking before any more visuals (Hayden 14:24: tier 2 went too flat, the Store doesn't sell, "Player" makes no sense for cards). No images in this phase. Built from three read-only audits of the live 2.09 code and screens (player journey, information per screen, naming), plus the live captures in `exp-home` `wip/style/live/`. Phase 2 (ChatGPT visuals and prototypes with imagery) starts only after Hayden agrees this.

## The short version
1. **The loop is buried under interruptions, not under bad screens.** After a match a player can hit two result layers, a card pack, a stat-point screen and up to five phone messages before the hub, and the hub can open with another three pop-ups. Fixing the loop matters more than any restyle.
2. **Every screen gets one job and one next action**, and a picture that belongs to that job: the opponent and the venue on Tonight, the dart on the Shop, the card art in the Locker, your figure on a win.
3. **Tier 2 keeps the calm (flat panels, no glow) but puts real imagery inside the panels.** The splash stays full Broadcast.
4. **Names say what's inside:** Tonight · Season · Shop · Locker · Practice. Cards move into the Locker. Seven goal systems become one ("Goals").
5. **The Shop sells one dart at a time**, big, lit, with a line of character and "vs your dart", and the next dart you want is teased on the hub and after matches.

## Principles (apply to every screen)
- **One job, one next action, one hero image.** If a screen needs two big buttons it's two screens.
- **Show each fact once, where it's used.** Level/XP lives in the header bar (thin) and the Locker; bank in the header only; season position on Season (Tonight gets one line); your average once, as a head-to-head on Tonight and on the result.
- **Imagery in frames, not light effects.** Tier 2 panels can hold photos and renders (venue, opponent, dart, card art, figure) full-bleed inside the panel. No haze, glow or streaks; red only on the one primary and the active tab.
- **Never interrupt the next action.** Nothing pops over Tonight on a timer. Messages, packs and stat points queue as badges the player opens when they choose; one interruption per match at most (the reward screen).
- **Plain words a pub player uses.** Darts words are fine (walk on, oche, checkout); game-system jargon isn't (OVR, respec, pinned contract, open draw).

## (g) The career loop, and where it hurts today
**Today, one session:** open app → (sign-in once) → title → **Continue career** → hub (possible mid-season message, 28 %/week spare-night message, exhibition poster at 0.6 s, card welcome at 0.7 s, trophy toast) → **Walk on** (second tap if it costs over 30 % of your bank; may bounce to a phone message for a lesson, a card fee, a season fee, travel or entry shortfall, or Deano's heads-up) → walk-on cinematic (only from tier 1, only if you throw first, once per browser session) → match → **result screen** (shows for a split second) → **reward overlay** on top of it → Continue (or "Match details", which just closes the overlay) → **card pack** (first time: an explainer sheet first) → **stat-point screen** (once per point) → up to **five phone messages** (rival table, objective, rival result, flavour on 45 % of low-tier matches, season outcome; promotion adds start message, sponsor offers, welcome) → hub again (pop-ups again).

**Friction, ranked by how often players hit it**
| # | Friction | Fix |
|---|---|---|
| 1 | Two result layers every match; score, cash and average shown 2–5 times; "Match details" is a third Continue | **One result screen**: the result on top, rewards stacked under it, one Continue |
| 2 | Up to 5 serial phone messages with typing delays after a match | **One "Messages" card** on the result ("3 new") and a badge on Tonight; read when you like |
| 3 | Stat-point screen forced after a match, once per point | **Badge on the Locker** ("2 points to spend"); the result says it once |
| 4 | Card pack hijacks Continue; first time an explainer stacks on it | Packs show on the result as a reward ("Open pack"); explainer once, inside the pack |
| 5 | Pop-ups on the hub on 0.6–0.7 s timers, under the player's finger | Hub never pops; exhibition invite, welcome and events become tiles on Tonight |
| 6 | Walk on bounces back with fee/travel/lesson messages; a dead end when short of money | Show the cost and any blocker **on Tonight before the tap** ("Entry $40 · you have $25 · take the money match first") |
| 7 | Practice uses up the spare night, explained only in small print | Decouple: practice is free; one rewarded drill a week |
| 8 | Promotion is a 4+ message burst on top of everything | Promotion becomes its own moment: one full screen (new venue photo, new tier, sponsor offer) then the hub |
| 9 | The walk-on plays once per browser session, never at tier 0 | A short walk-on every fixture (skippable), the full one on big nights |
| 10 | Title repeats record and bank three times | Title shows them once (already fixed in the welcome prototype) |

**Target loop (one session):** title → Tonight (opponent, stake, cost, Walk on) → walk-on → match → **one result screen** (win/loss, head-to-head, rewards, "next want", messages badge) → Continue → Tonight (next fixture already up, badges where something waits).

## Screen by screen
### 1 · Tonight (today's Play tab)
- **(a) Job:** tell me who I'm playing tonight, why it matters, and get me to the oche.
- **(b) Next action:** **Walk on.**
- **(c) Ranked information:**
  - **Big:** opponent (name + render) · what's at stake ("Win: a place in the team" / "Top two go up") · Walk on with its cost on it.
  - **Medium:** head-to-head in three facts: his average · your form (last-10 average) · best of N. Season strip, one line: "Week 5 of 8 · 3rd · 2 pts off promotion" (tap → Season).
  - **Small:** one "also tonight" tile (money match, local comp or revenge, whichever is open) · the next thing you want (dart or shirt, "238 XP" or "$45 to go") · one goal ("Average 61+ → $40").
  - **Cut:** the big "4th / FILL-IN" headline (repeats the strip), form pips without a legend, the venue name in three places, hook line, the hardship-entry text (becomes the cost line), the old hidden legacy hub.
  - **Own average on the hub?** Yes, but only as your **form** next to his average (that's the comparison that means something tonight). Career average lives in the Locker.
  - **Level/XP:** a thin bar in the header on every tab; the full track lives in the Locker.
- **(d) Imagery:** the **venue photo** as the hero panel background (the room you're walking into, changes by tier) and the **opponent render** (flat, unlit portrait from `V.portrait`, bigger). The next-want tile shows the **dart render**. Logos: chrome TOPS mark in the header only.
- **(e) Exciting:** the matchup. Treat it like a broadcast lower-third: big name, his nickname if he has one, the stake in one line. Big nights (derby, promotion decider, exhibition) get a "Big night" tag and the full walk-on.

### 2 · Season (today's Career tab)
- **(a) Job:** show where I stand this season and the road to the Palace.
- **(b) Next action:** back to **Tonight** (a small "Next: vs Big Mal" button); secondary: view the full table.
- **(c) Ranked:** **Big:** position and gap ("3rd · 2 pts off 2nd · top two go up") and the table (top four + you, your row highlighted). **Medium:** Road to the Palace (venue photos, current one lit), trophy cabinet. **Small:** reputation, mates leaderboard link. **Cut:** the second stats strip, duplicate week text and pips, contracts (move to Goals), the Cards tile (moves to the Locker).
- **(d) Imagery:** venue photos on the road; trophy renders in the cabinet; small opponent heads in the table.
- **(e) Exciting:** the promotion line in the table, and the next venue on the road (a locked photo you want to unlock).

### 3 · Shop (today's Store / "Kit room")
- **(a) Job:** make me want my next dart, and let me buy or equip it.
- **(b) Next action:** **Buy** (or Equip if owned; or "Unlocks at level 15" when locked).
- **(c) Ranked:** **Big:** one dart at a time, a big lit render, its name and one line of character ("Sharp razor grip, 85% tungsten"). **Medium:** **"vs your dart"** (only what changes: "Control +5, Scoring +4"), price and what you'd have left, lock level. **Small:** weight, the range (swipe or thumbnails, owned ✓, locked 🔒), sponsor line if you have one. **Cut:** the five stat bars as the hero (move to "vs your dart" and the Locker), "Kit penalty", the long list as the default view, "Kit room" naming.
- **(d) Imagery:** **dart renders** large (the product shot), swipeable, ideally rotating. Shafts and flights get renders too (they have none today); shirts on your figure. **Sponsor logos belong here** (sponsor sets) and nowhere else in the career.
- **(e) Exciting (the Store must sell):**
  - Product-shot treatment: dark studio plinth, the dart lit like a watch ad. Imagery is allowed to be rich here; the frame stays calm.
  - A reason to want it: a line of character, who throws this style (generic: "Front-weighted, built for treble 20 grinders"), and a "NEW" or "Just unlocked" badge.
  - The next dart is teased **outside** the Shop: on Tonight ("Razor Grip · 238 XP to go") and on the result after a win ("$45 to go").
  - Decision for Hayden: **try before you buy** (one practice session with the dart; it's already in the F8 backlog).
  - **Economy context:** Hayden's own direction (`tops-career-throw-voice-wrap.md`): money should hurt (entry, travel, running costs) and spending should make you better. **Career's answer to our spending question is pending** (asked on their board 14:36); the Shop design doesn't depend on it, the pacing of the "want" item does.

### 4 · Locker (replaces "Player"; holds your figure, loadout, cards, stats)
- **(a) Job:** me as a player: how I look, what I carry, what I've collected and how good I am.
- **(b) Next action:** whatever waits: **Open packs** (when packs wait) or **Spend 2 points** (when points wait); otherwise Edit look.
- **(c) Ranked:** **Big:** your **figure** in your kit, name, title, level. **Medium:** sub-tabs **Loadout · Cards · Stats · Trophies**. **Small:** career stats (record, career average, best leg), goals done. **Cut:** OVR shown twice, the stale perks count, "Chapter cap", "Respec" (becomes "Reset points" inside Stats), five goal systems (one Goals list).
- **Cards (sub-tab):** **Big:** the card grid with **real card art**; uncollected show a silhouette and number only (not name and rarity). **Medium:** "37 / 142" progress, set filters in sentence case. **Small:** ⓘ how cards work. **Next action:** Open packs (when waiting).
- **(d) Imagery:** your **figure** (`V.heroShot`), card art, trophy renders, dart and shirt thumbnails in Loadout.
- **(e) Exciting:** opening packs (keep the reveal), the card you're closest to completing a set with, your figure in new kit.

### 5 · Practice
- **(a) Job:** get better at one thing in five minutes.
- **(b) Next action:** **Start** the recommended drill.
- **(c) Ranked:** **Big:** the recommended drill and why ("Your doubles are 14 %: Round the clock doubles"). **Medium:** your best and last score on it; the other drills. **Small:** XP note. **Cut:** "soon" drills, "Practice room / Drills" double title, the link to the spare night.
- **(d) Imagery:** each drill gets a **board diagram** (the ring or segments it trains lit on a dartboard); none exist today.
- **(e) Exciting:** beating your best (a PB moment on the result).

### 6 · Match result (merges today's result screen and reward overlay)
- **(a) Job:** tell me how I did and what I earned, then point me to what's next.
- **(b) Next action:** **Continue** (to Tonight with the next fixture up). Secondary, only when it applies: Open pack · Equip new flights.
- **(c) Ranked:** **Big:** WIN/LOSS and the score, both faces. **Medium:** head-to-head (your average vs his, best visit, checkout %); rewards stacked: cash, XP bar (level-up called out), unlocks, packs, goals done. **Small:** "Messages (3)" card; full stats behind "See all stats"; season line ("Now 2nd · top two go up"). **Cut:** your average shown 4–5 times, bank shown twice, "Skill XP" vs "career XP" (one XP), "Match details" as a close button, "Copy dart log" (behind See all stats), the drill CTA (moves to Practice).
- **(d) Imagery:** both **portraits**, your **figure** celebrating on a win, the **unlock render** (dart/shirt), **card art** for packs.
- **(e) Exciting:** a level-up or unlock reveal, a PB, promotion (gets its own screen, see the loop).

## (f) Navigation and naming
| Today | Proposed | Why |
|---|---|---|
| Play (tab) | **Tonight** | Says what's inside: tonight's match |
| Career (tab) | **Season** | It's the season table and the road; "Career" also names the mode |
| Store (tab) / "Kit room" (header) / "Change darts" (button) | **Shop** (tab and header) | One place, one name |
| Barrels / Setup / Gear | **Darts · Shafts & flights · Shirts** | "Setup" vs "Gear" is unclear; say the things |
| Player (tab) | **Locker** | Where your kit, cards and trophies live; Hayden: "Player" makes no sense for cards |
| Practice / Practice room / Drills / Have a throw | **Practice** (title button keeps "Have a throw") | One name inside the career |
| Spare night · 1 available | **Extra match · 1 this week** | Spare night is our jargon |
| Local night · Open draw | **Pub comp · win $15** | "Open draw" is jargon |
| Money match · Kauri back room | keep | Clear |
| Fill-in night / Fill-in match / FILL-IN | **"First match: fill-in"** once, as a kicker | Three spellings today |
| Pinned contract / Contracts / Side quests / Objectives | **Goals** | Four names for two near-identical systems |
| Feats / Achievements / Tiers / Perks | **Achievements** (one list) · Run perks stay **Perks** | Too many reward nouns |
| Card picks / Open picks | **Card packs · Open pack** | A pick is the action, not the thing |
| The Run's "a card each win" | **a perk each win** | Collectible cards are a different thing |
| Pub rules "Ability cards" | **Pub rules** | Third thing called cards |
| Card set "Pub Rules" | rename the set (e.g. **House rules**) | Collides with the Pub rules mode |
| Trophy cabinet / Titles (nicknames) | **Trophies** · **Nicknames** | "Title" means two things |
| Skill XP / career XP | **XP** | One currency |
| OVR | **Rating** | Plain |
| Respec | **Reset points** | Gamer slang |
| Kit penalty | **Dart doesn't suit you yet** (or cut) | Jargon |
| Match details (closes overlay) | **See all stats** (opens them) | Says what it does |
| Hardship entry | **Entry covered this time** | Plain |
| Tap timing (title) | **Throw timing setup** | Says what it sets |
| Play a mate (button) → "Play online" (screen) | **Play a mate** on both | One name |
| Walk on | keep | Darts language and the brand |

## Greybox wireframes
(Boxes and labels only; they show hierarchy, not style. 390-wide phone, top to bottom.)

**Hub (Play)**
```
┌──────────────────────────────────────┐
│ TOPS · Hayden · Lv 14 ▓▓▓▓░░   $640 ≡│  header: identity, level bar, bank, menu
├──────────────────────────────────────┤
│ [Tonight] [Season] [Shop] [Locker] [Practice]   tab rail
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │  VENUE PHOTO (Kauri Arms, night) │ │  imagery: the room you're about to walk into
│ │                    ┌──────────┐  │ │
│ │  CLUB SINGLES ·    │ OPPONENT │  │ │  imagery: opponent render, lit
│ │  WEEK 5 OF 8       │  RENDER  │  │ │
│ │  vs BIG MAL        │          │  │ │  BIG: who + why it matters
│ │  "Win: a place in the team"   │  │ │
│ └──────────────────────────────────┘ │
│  His avg 42 │ Best of 3 │ You 3rd    │  small: the tale of the tape (3 facts max)
│ ┌──────────────────────────────────┐ │
│ │            WALK ON  ▶            │ │  the ONE next action
│ └──────────────────────────────────┘ │
│  Season strip: ●●●●○○○○  3rd of 8  › │  small, tap → Season tab
│ ┌───────────────┐ ┌────────────────┐ │
│ │ MONEY MATCH   │ │ NEXT UNLOCK    │ │  secondary: one "also tonight" + one "want"
│ │ Back room $100│ │ [dart render]  │ │  imagery: the thing you're working toward
│ └───────────────┘ │ Lv15 · 238 XP  │ │
│                   └────────────────┘ │
│  Contract: avg 61+ → $40   (1 line)  │  small
└──────────────────────────────────────┘
CUT from the hub: your own average (it's on Season/Locker), W–L record, the full table, venue name repeated in 3 places, "Fill-in" as a headline word.
```

**Shop (was Store / Kit room)**
```
┌──────────────────────────────────────┐
│ header (same)          $640          │
│ [Tonight] [Season] [Shop] [Locker] [Practice]
├──────────────────────────────────────┤
│ [Darts] [Shafts & flights] [Shirts]  │  sub-tabs, plain words
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │   BIG HERO DART RENDER (lit,     │ │  imagery: the product, big, rotating/swipeable
│ │   on a dark plinth, ~45% height) │ │
│ │                                  │ │
│ │  RAZOR GRIP 24G       NEW · LV15 │ │  BIG: name; small: badge
│ │  "Sharp razor grip, 85% tungsten"│ │  one line of character
│ │  vs yours: Scoring +4 Control +5 │ │  comparison to what you throw now
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │      BUY · $120   (or LOCKED Lv15)│ │  the ONE next action
│ └──────────────────────────────────┘ │
│  ◀ ○ ○ ● ○ ○ ○ ▶   swipe the range   │  carousel dots (one dart at a time)
│  ┌────┐┌────┐┌────┐┌────┐            │  small thumbnails row (owned ✓, locked 🔒)
│  └────┘└────┘└────┘└────┘            │
└──────────────────────────────────────┘
CUT: the 5-stat bars as the hero (move into "vs yours" deltas), the long list as the default view, sponsor line unless you have one.
```

**Cards (was Player → Cards)**
```
┌──────────────────────────────────────┐
│ header (same)                        │
│ [Tonight] [Season] [Shop] [Locker] [Practice]
├──────────────────────────────────────┤
│ Locker: [Loadout] [Cards] [Trophies] │  sub-tabs
│ ┌──────────────────────────────────┐ │
│ │ 3 PICKS WAITING   [OPEN ▶]       │ │  the ONE next action (only when picks wait)
│ └──────────────────────────────────┘ │
│  37 / 142 collected  ▓▓▓░░░░░░░      │  progress, small
│  [All] [Regulars] [Venues] [Moments] [Disasters] [Kit] [Pub rules] ›
│ ┌──────┐┌──────┐┌──────┐             │
│ │ CARD ││ CARD ││ CARD │             │  imagery: real card art, full bleed
│ │ ART  ││ ART  ││  ?   │             │  uncollected = silhouette
│ └──────┘└──────┘└──────┘             │
│ ┌──────┐┌──────┐┌──────┐             │
│ └──────┘└──────┘└──────┘             │
└──────────────────────────────────────┘
CUT: "How cards work" as a header link (move to a small ⓘ), set names in jargon.
```

## Decisions for Hayden (short questions, our recommendation first)
1. **Tab names Tonight · Season · Shop · Locker · Practice?** Recommend yes.
2. **One result screen instead of result + reward overlay?** Recommend yes; it's the biggest friction in every match.
3. **Post-match phone messages batched into one "Messages" card** (no more serial pop-ups)? Recommend yes; keep the story, lose the interruptions.
4. **Stat points as a Locker badge, not a forced screen after the match?** Recommend yes.
5. **Practice no longer uses the extra match?** Recommend yes (practice free; one rewarded drill a week).
6. **One "Goals" system** (contracts + side quests + objectives)? Recommend yes; Career owns the merge.
7. **Shop shows one dart at a time, big, with a list toggle?** Recommend yes.
8. **Try before you buy** (one practice session with a dart you don't own)? Recommend yes, after the Shop rebuild.
9. **Walk-on every fixture** (short, skippable; full on big nights)? Recommend yes.
10. **Your form average on Tonight next to his** (career average only in the Locker)? Recommend yes.
11. **Tier 2 imagery rule: photos and renders inside panel frames, never glow?** Recommend yes.
12. **Promotion gets its own full screen** (new venue, new tier, sponsor offer)? Recommend yes.

## What phase 2 needs once this is agreed
- Imagery: venue photo per tier (7, have the plates in part), opponent portraits flat-lit (exist via `V.portrait`), dart renders large (exist via `V.dartShot`, need a studio look), shaft/flight renders (new), drill board diagrams (new, simple SVG), card art (exists), trophy renders (exist as painted art).
- Visuals: ChatGPT mockups of Tonight, Shop, Locker/Cards and the merged Result on the agreed hierarchy, then clickable prototypes (Hayden responds to those best).
- Build order (from the tier 2 plan in `tops-home-concepts.md`, updated): welcome → result screen merge → Tonight → Shop → Locker/Cards → Season → Practice.

## Sources
Read-only audits of `src` 2.09 (game4.js, career3.js, v09–v12.js, tc/core.js, body4.html): player journey (flow with file:line), information per screen (every element and its source), naming (every label). Live captures `exp-home` `wip/style/live/`. Hayden's direction: `tops-career-throw-voice-wrap.md` (money and progression).
