# TOPS career UX brief (EXP-UX phase 1) · Experience · **v2.1** (Overseer review 14:55, Hayden's calls 14:53, ChatGPT round 1 applied), 12 Nov

**What this is:** our own thinking before any more visuals (Hayden 14:24: tier 2 went too flat, the Store doesn't sell, "Player" makes no sense for cards). No images in this phase. Built from three read-only audits of the live 2.09 code and screens (player journey, information per screen, naming), plus the live captures in `exp-home` `wip/style/live/`. Phase 2 (ChatGPT visuals and prototypes with imagery) starts only after Hayden agrees this.

## What changed in v2 (Overseer 14:55)
1. **Form vs his** is now the same in text and wireframe: "You 47 (last 10) · Him 42 · Best of 3"; a first-time player sees "Your first match".
2. **Decisions:** nine **Decided (Overseer 14:55)** and three **Decided (Hayden 14:53)**: practice free with small capped XP, a short walk-on every match and the full one on big nights, one free try per unlocked dart. No open decisions.
3. **Walk-ons:** short one every match (max 6 s, skippable from the first frame), full one on big nights; needs Engine review and a frame-rate check before build.
4. **Imagery source:** "venue" means **stills rendered from our own 3D rooms**, never stock photos or generated people; table of what exists vs what needs rendering.
5. **Empty and edge states** added (first match, Shop all locked or all owned, Locker with nothing waiting); the Messages badge and the level bar are in the hub wireframe.
6. **Economy:** when the next-want dart appears, from the F2 unlock levels and `v12.js`/`game4.js` prices, plus a cash/XP model from the game's own constants (Career to check later).
7. **After ChatGPT round 1 (7.6, BLOCK):** the four authoritative flows (fixture, promotion, can't afford, season end); a merged Result wireframe in three cases; the economy model; "one focal point" instead of "one image"; tab and header widths at 320–390; Locker landing state; no disabled primary in the Shop; trade-offs in "vs yours"; presentation vs system changes separated.

## The short version
1. **The loop is buried under interruptions, not under bad screens.** After a match a player can hit two result layers, a card pack, a stat-point screen and up to five phone messages before the hub, and the hub can open with another three pop-ups. Fixing the loop matters more than any restyle.
2. **Every screen gets one job and one next action**, and a picture that belongs to that job: the opponent and the venue on Tonight, the dart on the Shop, the card art in the Locker, your figure on a win.
3. **Tier 2 keeps the calm (flat panels, no glow) but puts real imagery inside the panels.** The splash stays full Broadcast.
4. **Names say what's inside:** Tonight · Season · Shop · Locker · Practice. Cards move into the Locker. Seven goal systems become one ("Goals").
5. **The Shop sells one dart at a time**, big, lit, with a line of character and "vs your dart", and the next dart you want is teased on the hub and after matches.

## Principles (apply to every screen)
- **One job, one next action, one focal point.** One image leads each screen (largest, highest contrast); any other imagery is a thumbnail at most a third of its size. If a screen needs two big buttons it's two screens.
- **Show each fact once, where it's used.** Level/XP lives in the header bar (thin) and the Locker; bank in the header only; season position on Season (Tonight gets one line); your average once, as a head-to-head on Tonight and on the result.
- **Imagery in frames, not light effects.** Tier 2 panels hold our own renders (venue still, opponent, dart, card art, figure) full-bleed inside the panel; no stock photos, no generated people. No haze, glow or streaks; red only on the one primary and the active tab.
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
| 7 | Practice uses up the spare night, explained only in small print | Decouple: practice is free with a small, capped XP reward every session (Hayden 14:53; Career sets the numbers) |
| 8 | Promotion is a 4+ message burst on top of everything | Promotion becomes its own moment: one full screen (new venue still, new tier, sponsor offer) then the hub |
| 9 | The walk-on plays once per browser session, never at tier 0 | A short walk-on every match (max 6 s, skippable from the first frame), the full one on big nights (deciders, derbies, exhibitions, promotion matches; Hayden 14:53). **Needs Engine review and a frame-rate check** (#17 came from the walk-on path) |
| 10 | Title repeats record and bank three times | Title shows them once (already fixed in the welcome prototype) |

**Target loop (one session):** title → Tonight (opponent, stake, cost, Walk on) → walk-on → match → **one result screen** (win/loss, head-to-head, rewards, "next want", messages badge) → Continue → Tonight (next fixture already up, badges where something waits).

## Screen by screen
### 1 · Tonight (today's Play tab)
- **(a) Job:** tell me who I'm playing tonight, why it matters, and get me to the oche.
- **(b) Next action:** **Walk on.**
- **(c) Ranked information:**
  - **Big:** opponent (name + render) · what's at stake ("Win: a place in the team" / "Top two go up") · Walk on with its cost on it.
  - **Medium:** head-to-head in one line, exactly: **"You 47 (last 10) · Him 42 · Best of 3"** (your 3-dart average over your last 10 career matches; **his playing average**, the same number the fixture card shows today, never a prediction for this match; the format). Season strip, one line: "Week 5 of 8 · 3rd · 2 pts off promotion" (tap → Season).
  - **Small:** one "also tonight" tile (money match, local comp or revenge, whichever is open) · the next thing you want (dart or shirt, "238 XP" or "$45 to go") · one goal ("Average 61+ → $40").
  - **Cut:** the big "4th / FILL-IN" headline (repeats the strip), form pips without a legend, the venue name in three places, hook line, the hardship-entry text (becomes the cost line), the old hidden legacy hub.
  - **Own average on the hub?** **Yes: your last-10 average, next to his** (Hayden asked for this directly). It is the comparison that means something tonight. Your career average lives in the Locker. Under 10 matches it reads "You 44 (last 4)"; with no matches yet, **"Your first match · Him 42 · Best of 3"**.
  - **Level/XP:** a thin bar in the header on every tab ("Lv 14" + bar, tap → Locker); the full track lives in the Locker.
  - **Messages:** a ✉ badge with a count in the header, right of the bank ("✉ 3"); tap opens the batched messages. Never a pop-up.
  - **States:** *first-time player* (no form, no table yet): "Your first match · Him 42 · Best of 3", the stake line is "Your first night at the Kauri Arms", no next-want tile until a dart is within reach, no "also tonight" tile. *Nothing extra tonight:* the also-tonight tile is simply absent (no empty box). *Can't afford entry:* the Walk on button carries the blocker ("Entry $40 · you have $25") and the money match tile is promoted to the secondary button.
- **(d) Imagery:** the **venue still** as the hero panel background: a render of our own 3D room for that tier (the room you're about to walk into; see "Imagery source" below) and the **opponent render** (flat, unlit portrait from `V.portrait`, bigger). The next-want tile shows the **dart render**. Logos: chrome TOPS mark in the header only.
- **(e) Exciting:** the matchup. Treat it like a broadcast lower-third: big name, his nickname if he has one, the stake in one line. Big nights (derby, promotion decider, exhibition) get a "Big night" tag and the full walk-on.

### 2 · Season (today's Career tab)
- **(a) Job:** show where I stand this season and the road to the Palace.
- **(b) Next action:** back to **Tonight** (a small "Next: vs Big Mal" button); secondary: view the full table.
- **(c) Ranked:** **Big:** position and gap ("3rd · 2 pts off 2nd · top two go up") and the table (top four + you, your row highlighted). **Medium:** Road to the Palace (venue stills, current one lit), trophy cabinet. **Small:** reputation, mates leaderboard link. **Cut:** the second stats strip, duplicate week text and pips, contracts (move to Goals), the Cards tile (moves to the Locker).
- **(d) Imagery:** venue stills (our own renders) on the road; trophy renders in the cabinet; small opponent heads in the table.
- **(e) Exciting:** the promotion line in the table, and the next venue on the road (a dimmed still you want to unlock).

### 3 · Shop (today's Store / "Kit room")
- **(a) Job:** make me want my next dart, and let me buy or equip it.
- **(b) Next action:** **Buy** (or **Equip** if owned). A locked dart has **no button-shaped primary**: a lock line "Unlocks at level 15 · you're level 14" and a text link "Play to reach it → Tonight". Owned, buyable and locked are three visibly different states. Secondary on an unlocked dart you don't own: **"Try it in practice"** (once per dart).
- **(c) Ranked:** **Big:** one dart at a time, a big lit render, its name and one line of character ("Sharp razor grip, 85% tungsten"). **Medium:** **"vs your dart"**: every stat that changes, up and down, with the trade-off in words when there is one ("Steadier aim (sway −10 %), heavier (24 g vs 22 g)"); a dart that doesn't suit your level says so ("Dart doesn't suit you yet") instead of a bigger number; price and what you'd have left, lock level. **Small:** weight, the range (swipe or thumbnails, owned ✓, locked 🔒), sponsor line if you have one. **Cut:** the five stat bars as the hero (move to "vs your dart" and the Locker), "Kit penalty", the long list as the default view, "Kit room" naming.
- **(d) Imagery:** **dart renders** large (the product shot). **Gestures:** arrows and the thumbnail strip switch darts; a drag on the dart rotates it (switching never shares the rotate gesture). Shafts and flights get renders too (they have none today); shirts on your figure. **Sponsor logos belong here** (sponsor sets) and nowhere else in the career.
- **(e) Exciting (the Store must sell):**
  - Product-shot treatment: dark studio plinth, the dart lit like a watch ad. Imagery is allowed to be rich here; the frame stays calm.
  - A reason to want it: a line of character, who throws this style (generic: "Front-weighted, built for treble 20 grinders"), and a "NEW" or "Just unlocked" badge.
  - The next dart is teased **outside** the Shop: on Tonight ("Razor Edge · Lv 15 · 1 level to go") and on the result after a win ("$45 to go").
  - **Try before you buy** (Hayden 14:53): one free practice session per unlocked dart you don't own; no XP and no money from it.
- **States:** *every dart in reach owned* (common at the start of a tier): the hero shows **the next locked dart** with "Unlocks at level 25 · $170" and the level bar; the button reads "Equip your Zen Jutsu" only if the owned best isn't equipped, otherwise no primary (the screen's job is the tease). *Every dart locked* (new career, level 1–3): the hero is your Club Brass (owned, equipped) and the strip shows Neutron "Lv 4 · $45" as the first thing to work for. *Everything owned* (late career): the hero becomes the loadout (dart + shafts & flights + shirt) with "Collection complete" and the sponsor set, no Buy.
- **Economy: when the next-want dart appears** (from the boards: F2 unlock levels, Asp/GA moved to 33/34; prices in `game4.js` BARRELS; Career to check later):
  | Level | Dart (price) | Where a typical player is (Career's F2 notes) |
  |---|---|---|
  | 4 · 6 · 8 | Neutron ($45) · Core XL ($70) · Supergrip ($95) | Pub: one every few matches, cheap; teaches the loop |
  | 15 · 18 | **Razor Edge ($120)** · Vapor8 ($150) | Club: the first real "want" |
  | 25 | **Zen Jutsu ($170)** | Club promotion → Regional |
  | 33 · 34 | **Asp ($270)** · GA ($240) | after Regional promotion (~level 30) → DPNZ |
  | 40 | **Power 9Five ($420)** | DPNZ → Trans-Tasman |
  | sponsor | Littler, MvG, Avalanche | with a sponsor deal only (never sold) |
  - **Rule for the tease:** show the next dart that is better than what you own once it is **within 2 levels** of unlocking (or unlocked but not yet affordable: "$45 to go"). Never more than one want at a time; after buying, the next appears at the next match.
  - **Money:** Hayden's direction (`tops-career-throw-voice-wrap.md`): money should hurt (entry, travel, running costs) and spending should make you better. The Shop line "what you'd have left" (e.g. "$640 → $520") makes that visible at the moment of buying. How much a typical player has spare at each tier is Career's to confirm.

### 4 · Locker (replaces "Player"; holds your figure, loadout, cards, stats)
- **(a) Job:** me as a player: how I look, what I carry, what I've collected and how good I am.
- **(b) Next action:** whatever waits: **Open packs** (when packs wait) or **Spend 2 points** (when points wait); otherwise Edit look.
- **Landing state:** the Locker opens on **Loadout** (figure + kit) unless something waits: packs waiting → Cards; points waiting → Stats. The tab-rail dot says which.
- **(c) Ranked:** **Big:** your **figure** in your kit, name, title, level. **Medium:** sub-tabs **Loadout · Cards · Stats · Trophies**. **Small:** career stats (record, career average, best leg), goals done. **Cut:** OVR shown twice, the stale perks count, "Chapter cap", "Respec" (becomes "Reset points" inside Stats), five goal systems (one Goals list).
- **Cards (sub-tab):** **Big:** the card grid with **real card art**; uncollected show a silhouette and number only (not name and rarity). **Medium:** "37 / 142" progress, set filters in sentence case. **Small:** ⓘ how cards work. **Next action:** Open packs (when waiting).
- **(d) Imagery:** your **figure** (`V.heroShot`), card art, trophy renders, dart and shirt thumbnails in Loadout.
- **(e) Exciting:** opening packs (keep the reveal), the card you're closest to completing a set with (completion shows that set's reward; phase 2 checks every set has one), your figure in new kit.
- **States:** *nothing waiting* (no packs, no points): no primary action button; the figure leads and the small link is "Edit look". The Cards tab then leads with "Closest set: Kiwi Pub Life 7/9" instead of Open packs. *No cards yet* (first match): the grid shows silhouettes with "Win matches to earn packs".

### 5 · Practice
- **(a) Job:** get better at one thing in five minutes.
- **(b) Next action:** **Start** the recommended drill.
- **(c) Ranked:** **Big:** the recommended drill and why ("Your doubles are 14 %: Round the clock doubles"). **Medium:** your best and last score on it; the other drills. **Small:** XP note ("+XP this session · cap 2 of 3 today"; numbers from Career). **Cut:** "soon" drills, "Practice room / Drills" double title, the link to the spare night.
- **(d) Imagery:** each drill gets a **board diagram** (the ring or segments it trains lit on a dartboard); none exist today.
- **(e) Exciting:** beating your best (a PB moment on the result).

### 6 · Match result (merges today's result screen and reward overlay)
- **(a) Job:** tell me how I did and what I earned, then point me to what's next.
- **(b) Next action:** **Continue** (to Tonight with the next fixture up). Secondary, only when it applies: Open pack · Equip new flights.
- **(c) Ranked:** **Big:** WIN/LOSS and the score, both faces. **Medium:** head-to-head (your average vs his, best visit, checkout %); rewards stacked: cash, XP bar (level-up called out), unlocks, packs, goals done. **Small:** "Messages (3)" card; full stats behind "See all stats"; season line ("Now 2nd · top two go up"). **Cut:** your average shown 4–5 times, bank shown twice, "Skill XP" vs "career XP" (one XP), "Match details" as a close button, "Copy dart log" (behind See all stats), the drill CTA (moves to Practice).
- **(d) Imagery:** both **portraits**, your **figure** celebrating on a win, the **unlock render** (dart/shirt), **card art** for packs.
- **(e) Exciting:** a level-up or unlock reveal, a PB, promotion (gets its own screen, see the loop).

## The four authoritative flows (v2.1)
Each is the exact sequence, the button and where it returns. Promotion and season end are the **only** planned exceptions to "one interruption per match".
| Flow | Sequence | Primary button → returns to |
|---|---|---|
| **1. Ordinary fixture** | Tonight → Walk on → short walk-on (≤6 s, skippable) → match → **Result** (one screen) | **Continue → Tonight** with the next fixture up; badges (✉, Locker dot) show what waits. Nothing else opens on its own. |
| **2. Milestone / promotion** | … match → **Result** (the win and rewards; "PROMOTED · Regional next" replaces the season line) → Continue → **Promotion screen** (new venue still, new tier name, the first sponsor offer if any: Accept / Not now) → **Tonight at the new tier** | Promotion screen's **Continue → Tonight**. Further sponsor offers and start-of-tier messages go to ✉. Level-ups and unlocks stay on the Result (no extra screen). |
| **3. Can't afford entry** | Tonight shows the blocker on the Walk on button before the tap ("Entry $40 · you have $25"); the secondary becomes the way out: **money match** or **pub comp**; if neither is open, **"Entry covered this time"** (the existing hardship entry) and Walk on works | Never a dead end: there is always one playable match from Tonight. |
| **4. Season end (no promotion)** | last fixture → **Result** ("Season over · 4th") → Continue → **Season summary** (final table, what you earned, next season's stake: "Top two go up") → **Tonight, week 1** | Summary's **Start next season → Tonight**. A knockout exit uses the same summary with its own line ("Out in round 3"). Winning the Palace (end of career) is the title-card moment, out of scope here. |

## Economy model (v2.1, from the game's constants; Career validates)
**Inputs:** `FIXPAY` (win pay, loss pay, entry fee, appearance), `TRAVEL`, XP per career match (`xpBreakdown`: played 60 + win 100, × tier multiplier, plus ~25–40 for tons and checkouts), `lvNeed(L) = 150 + 25L + 0.6L²`. **Not included** (all add money): sponsor pay per match, goal rewards, level-up cash, money matches ($100 at Club), pub comps, the prize skill. So these are floors.

| Tier | Net cash per fixture: win / loss | Average per fixture at 30 % / 50 % / 70 % wins | XP per fixture at 50 % |
|---|---|---|---|
| Pub | +13 / −5 | $0 / +$4 / +$8 | ~140 |
| Club | +30 / −20 | −$5 / +$5 / +$15 | ~170 |
| Regional | +90 / −70 | −$22 / +$10 / +$42 | ~200 |
| DPNZ | +350 / −170 | −$14 / +$90 / +$194 | ~250 |
| Trans-Tasman | +1,200 / −450 | +$45 / +$375 / +$705 | ~310 |

**What it means for the next-want dart** (levels 4 · 8 · 15 · 25 · 33 · 40 need 260 · 388 · 660 · 1,150 · 1,628 · 2,110 XP each):
- **Pub/Club (Neutron $45 → Razor Edge $120):** the **cash** gate binds, not the level. An average player gains a level every few fixtures but nets ~$5 a fixture from fixtures alone, so Razor comes from money matches, goals and level-up cash; a losing player (30 %) goes backwards on fixtures. This is where "money should hurt" is felt, so the next-want tile says **"$45 to go"** and points at the money match.
- **Regional (Zen Jutsu $170):** both gates bind about equally for an average player; a losing player can't afford it from fixtures alone.
- **DPNZ onward (Asp $270, GA $240, Power 9Five $420):** one or two wins pay for a dart; the **level** gate binds, so the tile says "Lv 33 · 2 levels to go".
- **Broke player:** flow 3 (money match, pub comp, entry covered) means nobody is trapped; the Shop warns before a purchase that would leave less than the next entry ("You'll have $10 · next entry $20").
- **For Career (not blocking this brief):** confirm with the sim or telemetry the bank a typical player actually has at levels 15, 25 and 33 including sponsor and goal money; if Razor is trivial or out of reach in practice, the price or level moves, not the UI.

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
**Widths (320 / 360 / 390 CSS px):** five tabs at 390 = ~74 px each after 16 px gutters; labels ≤ 8 characters ("Practice" is the longest, 13 px semibold ≈ 62 px); at 360, ~66 px each; **at 320, tabs switch to icon + 10 px label** (~58 px; tap targets stay 44 px tall). Header at 390: the name truncates first, then the TOPS mark drops; level bar, bank and ✉ never drop. Large text (iOS 125 %): tabs go icon-only with the active tab's label shown. The tab rail sits under the header, so the home indicator never overlaps it.

**Hub = Tonight (v2: form line, Messages badge and level bar shown)**
```
┌──────────────────────────────────────┐
│ TOPS  Hayden  Lv 14 ▓▓▓▓░░  $640  ✉3 ≡│  header: identity · level bar (tap → Locker) · bank · Messages badge · menu
├──────────────────────────────────────┤
│ [Tonight] [Season] [Shop] [Locker] [Practice]   tab rail (Locker shows a dot when points/packs wait)
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ VENUE STILL (our render, Club)   │ │  imagery: the room you're about to walk into
│ │                    ┌──────────┐  │ │
│ │  CLUB SINGLES ·    │ OPPONENT │  │ │  imagery: opponent render (V.portrait)
│ │  WEEK 5 OF 8       │  RENDER  │  │ │
│ │  vs BIG MAL        │          │  │ │  BIG: who + why it matters
│ │  "Win: a place in the team"   │  │ │
│ └──────────────────────────────────┘ │
│  You 47 (last 10) · Him 42 · Best of 3│  MEDIUM: the head-to-head, exactly this line
│ ┌──────────────────────────────────┐ │
│ │      WALK ON ▶   Entry $40       │ │  the ONE next action, cost on it
│ └──────────────────────────────────┘ │
│  Week 5 of 8 · 3rd · 2 pts off 2nd › │  small, tap → Season
│ ┌───────────────┐ ┌────────────────┐ │
│ │ MONEY MATCH   │ │ NEXT DART      │ │  secondary: one "also tonight" + one "want"
│ │ Back room $100│ │ [dart render]  │ │  (each absent when there's nothing; no empty boxes)
│ └───────────────┘ │ Razor Edge     │ │
│                   │ Lv 15 · 1 to go│ │
│                   └────────────────┘ │
│  Goal: average 61+ → $40   (1 line)  │  small
└──────────────────────────────────────┘
FIRST MATCH: the form line reads "Your first match · Him 42 · Best of 3"; no Next dart tile, no also-tonight tile.
CUT from the hub: career average (Locker), W–L record, the full table, venue name repeated in 3 places, "Fill-in" as a headline word.
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
│ │  RAZOR EDGE 24G       NEW · LV15 │ │  BIG: name; small: badge
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
│ Locker: [Loadout][Cards][Stats][Trophies]  sub-tabs
│ ┌──────────────────────────────────┐ │
│ │ 3 PACKS WAITING   [OPEN ▶]       │ │  the ONE next action (only when packs wait;
│ │                                  │ │  else "Closest set: Kiwi Pub Life 7/9")
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

**Result (merged; three cases).** Continue is pinned to the bottom of the first screen; each reward is one row; anything past four reward rows folds into "+2 more".
```
NORMAL WIN                               NORMAL LOSS
┌──────────────────────────────────┐     ┌──────────────────────────────────┐
│ [you]  WON 2–1  [him]            │     │ [you]  LOST 1–2  [him]           │  BIG: result, both portraits
│ You 51 · Him 44 · Checkout 38 %  │     │ You 41 · Him 44 · Checkout 22 %  │  MEDIUM: head-to-head, one line
│ ─ rewards ─────────────────────  │     │ ─ rewards ─────────────────────  │
│ +$55   +240 XP ▓▓▓▓▓░ Lv 14      │     │ +$5    +100 XP ▓▓▓▓░░ Lv 14      │  one row: cash + XP bar
│ Razor Edge: $45 to go            │     │ Best visit 100 · keep going      │  next-want, or a PB line
│ 🃏 1 pack            [Open]      │     │                                  │  only when earned
│ Now 2nd · top two go up          │     │ Now 4th · 2 pts off 2nd          │  season line
│ ✉ 2 new · See all stats ›        │     │ ✉ 1 new · See all stats ›        │  small
│ [         CONTINUE          ]    │     │ [         CONTINUE          ]    │  pinned primary
└──────────────────────────────────┘     └──────────────────────────────────┘
BIG REWARD / PROMOTION
┌──────────────────────────────────┐
│ [you celebrating]  WON 2–0       │  your figure replaces your portrait on a big win
│ You 58 · Him 49 · Checkout 50 %  │
│ LEVEL 15 · Razor Edge unlocked [dart render]   one reveal row (level-up + unlock together)
│ +$55 +280 XP · 🃏 2 packs [Open] │
│ PROMOTED · Regional next         │  replaces the season line
│ [      CONTINUE → promotion    ] │  goes to the promotion screen (flow 2)
└──────────────────────────────────┘
```
Priority when space runs out (keep top to bottom): result → head-to-head → cash + XP → level-up/unlock → packs → season line → next-want → messages and stats links.

## Decisions
**Decided (Overseer 14:55):** all YES. Items 1–4 and 6–9 are presentation. Item 5 (one Goals system) and the single XP name also change how progression is counted, so **Career owns and validates those mechanics before build**.
1. Tab names **Tonight · Season · Shop · Locker · Practice**.
2. **One result screen** instead of result + reward overlay.
3. Post-match phone messages **batched** into one Messages card and a header badge.
4. **Stat points as a Locker badge**, not a forced screen after the match.
5. **One Goals system** (contracts + side quests + objectives; Career owns the merge).
6. **Shop shows one dart at a time**, big, with a list toggle.
7. **Your form average on Tonight next to his** (career average only in the Locker).
8. **Tier 2 imagery rule:** our renders inside panel frames, never glow.
9. **Promotion gets its own full screen** (new venue still, new tier, sponsor offer).

**Decided (Hayden 14:53):**
10. **Practice is free and gives a small amount of XP every session, capped** (it no longer uses the extra match). **Career dependency:** Career sets the XP per session and the cap so levelling speed stays calibrated.
11. **Walk-ons:** a **short walk-on every match** (max 6 s, skippable from the first frame) and the **full walk-on on big nights** (deciders, derbies, exhibitions, promotion matches). It never shows an unposed figure (EXP-1d's hold). **Engine review and a frame-rate check before build** (#17 came from the walk-on path).
12. **Try before you buy:** **one free practice session per unlocked dart you don't own**; no XP and no money from it.

No open decisions remain in this brief.

## Imagery source (v2): our own renders only
"Venue" anywhere in this brief means **a still rendered from our own 3D room for that tier**, never a stock photo and never generated people. Portraits and figures are our own rigged characters. No real people, brands or logos in any new image (real dart brands stay only where the game already names them, Hayden 00:15).
| Image | Exists today | Needs making |
|---|---|---|
| Venue still per tier (7), hub framing, no figures | **No.** `img/v0–v6.jpg` are the current hub backdrops, but they are painted/generated images, not renders of our rooms; `assets/venue/*.webp` are painted plates (pub 1–4, club 4, plate 5). Test shots from `venueshot.js` are gameplay views with the player in them. | **Render 7 stills from the game**: tier 0–1 from the baked `pub2.glb`/`club2.glb`, tiers 2–6 from the code-built rooms, figures hidden, the walk-on's establishing camera (3.4 m behind the oche), 1672×941 like today's backdrops plus a 390-wide crop. **Prototype two first** (Club from the baked room, Regional from a code-built room), review them, then batch the rest. |
| Opponent portrait | Yes: `V.portrait` (flat-lit head and shoulders from our rigs) | Bigger crop for Tonight |
| Your figure | Yes: `V.heroShot` | — |
| Dart renders | Yes: `V.dartShot` | Studio look (dark plinth, rim light) for the Shop hero |
| Shafts & flights | No | Renders from the same dart rig |
| Drill diagrams | No | Simple SVG boards |
| Card art, trophies | Yes (painted card art; trophy art) | — |

## What phase 2 needs once this is agreed
- The renders above, then ChatGPT mockups of Tonight, Shop, Locker/Cards and the merged Result on this hierarchy (mockups may only use our renders as the imagery reference), then clickable prototypes (Hayden responds to those best).
- Build order (from the tier 2 plan in `tops-home-concepts.md`, updated): welcome → result screen merge → Tonight → Shop → Locker/Cards → Season → Practice.

## Sources
Read-only audits of `src` 2.09 (game4.js, career3.js, v09–v12.js, tc/core.js, body4.html): player journey (flow with file:line), information per screen (every element and its source), naming (every label). Live captures `exp-home` `wip/style/live/`. Hayden's direction: `tops-career-throw-voice-wrap.md` (money and progression).
