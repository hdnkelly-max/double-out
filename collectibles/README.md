# TOPS collectibles: handoff for the build chat (11 Nov 2026)

Built in the collectibles chat. Spec: `claude/tops-collectibles-plan.md`. Rules: `claude/tops-coordination.md`.
Round 1–3 went live in v1.55. **Wave 2 (this push, 11 Nov afternoon)** is on the same two branches, rebased on `src` v1.58 with your backfill line kept. Merge at a clean point:

| Branch | What | Where it lands |
|---|---|---|
| `collectibles-src` (from `src`) | Game integration: `tc/` module + 5 small hooks in `game4.js` + `build.js` bundling | Your game source (oche-next) |
| `collectibles` (from `main`) | `assets/cards/` (all art incl. 47 new, plus `sfx/` reveal sounds, about 11 MB), `collectibles/sql`, sim, tests, review shots | `assets/cards/` on main (sfx folder is new). SQL 001–004 is already applied live |

Regression gate (`tests/regress.js 2`) passes with everything built in.

## Wave 2: what's new
- **68 cards** (66 in packs + 2 exclusives), up from 22. New regulars, venues, moments, disasters, kit, and legends Price, Wright, Smith, Barneveld, Sherlock, Humphries, Anderson. Phil Taylor now has real art. **Phil** (Phillip Callard) and **Water on Standby** from the boys' chat are in.
- New rewards: 9 titles, aviators (face slot), flame and lantern flights, black barrel, Humphries' "cool" win celebration, Anderson's saltire walk-on. The barrel cosmetic needs hook 6 below.
- **Card reveal sounds:** 11 short mp3s in `assets/cards/sfx/` (deal, select, flip, missed, charge, one reveal per rarity, duplicate), about 170 KB. Falls back to synth if a file is missing.
- **Server mode:**
  - Signed-in players use the live `tc_` RPCs. The first sync imports the save-file collection once (`tc_import`); after that awards and exhibition grants queue in `save.tc.q` and flush whenever online.
  - The pack screen resolves picks through `tc_choose`. Offline, it shows "Connection dropped, tap again" and keeps the pick.
  - Signed-out or offline-forever players stay in local mode as before.
  - Covered by `collectibles/tests/srv.js`: 20 checks against the real SQL on local Postgres.
- **Trades** (Collection → Trades, signed-in only):
  - Spare legendaries only, with mates you've played online (from `tops_mp_results`).
  - Offers in and out with Accept / Decline / Cancel, plus your spares and each mate's spares. Pick yours and theirs, then Send. Offers last 48 hours.
  - Accept swaps in another free copy if the one asked for is busy, and nobody ever ends with zero copies.
  - Needs `sql/005_trade_view.sql` (not applied yet, waiting on Hayden's OK). Covered by `collectibles/tests/trade.js`.
- **Opponent walk-on online:** if your mate has a walk-on equipped, their name and title banner plus their effect play on your screen at the start of an online match, before your own.

## What the player gets
- **Card picks:** one each for a 180, a 100+ checkout, an achievement and an achievement tier. A nine-darter keeps all three cards plus the exclusive Nine-Dart Club card. Practice and drills never count.
- **Reward screen:** a "N card picks · reasons" line. Pressing Continue opens the pack screen before the normal flow resumes.
- **Pack screen:**
  - Three backs. You pick one and it becomes a 208 px hero card; the other two fan behind and flip as "Missed".
  - Epic and legendary cards "charge" for about 0.5 s before they flip.
  - Duplicates show as a quiet "Duplicate · N owned" line under the card.
  - "Fast reveals" toggle; Continue / Open later.
- **Welcome backfill:**
  - On the first load after the update: one pick per achievement already unlocked, plus tiers reached from career wins.
  - Minimum of three picks, behind a "Cards are here" screen.
- **Hub:**
  - Play tab: exhibition poster tile and a "N card picks" tile, both above Spare night.
  - Career tab: trophy cabinet tile and collection tile.
  - Player tab: Cards / Rewards / Tiers / Open picks.
- **Collection:** two columns, N/20 collected with a progress bar, set chips, embossed silhouettes for missing cards, inspect view with tilt and Equip. Set completion unlocks a reward.
- **Loadout:**
  - A live 3D player preview (V.preview) above one row per slot.
  - Tapping a row opens a bottom sheet with card thumbnails and lock reasons.
  - Slots: hat, face, mouth, hair, shoulder, flights, barrel, 180, checkout, win, walk-on, title.
- **Wearables** (built on the face kit and shown online via the synced look): flat cap, pirate eye patch, cigarette, mullet, Shazza's tea towel.
- **Celebrations** (`tc/fx.js`, one canvas, ≤1.8 s, half the particles on weak devices):
  - 180: pyro, the Nuke, confetti cannons, crowd chants your name. A 180 also shows a "180 · maximum" headline.
  - Checkout: gold board flash.
  - Win: green lights, plus a fist pump on the player.
  - The thrower's equipped effect plays on every client, so opponents see your pyro.
- **Walk-on cinematic:**
  - Letterboxed with the venue dimmed. Your player walks from the back of the room to the oche on the Mixamo `walk` clip.
  - Banner shows your name, title and song. The walk-on effect (smoke, lasers, The Power lightning) fires on arrival. Tap to skip.
  - Plays once per session, and always for exhibitions and at the Palace.
- **Trophy cabinet:**
  - A painted pub cabinet scene with one trophy per title. Repeat wins add an ×N plate.
  - Tap a trophy for the opponent, score and average, with a warm spotlight on the selected trophy.
  - The wall case shows your six best cards.
- **Exhibition nights:**
  - About 7% a week, never within 8 weeks of the last. A poster with three plain stakes, a reward preview and Accept / Not tonight.
  - Real legends: Phil Taylor (avg 101), Luke Littler (103), MvG (100). The match uses `local:true`, so it takes your spare night and doesn't touch the table.
  - Three tries in three weeks. A win gives the legend's card, a legendary achievement and a signature title. A first loss gives the commemorative Exhibition Ticket card.
  - Test with `?exh=1`.
- **Tiered achievements:** Maximums, Ton Out, Big Finish, Bull Finisher, Silk Release, Quick Legs, Winner, Drink Bitch. Bronze, silver and gold medals, with the next tier highlighted.
- **In the zone:** three or more perfect releases in a row trigger a vignette, a quiet crowd and a heartbeat. The throw maths is unchanged.
- **Toasts:** one at a time, held back during packs and walk-ons, with a sheen on arrival.

## Hooks added to game4.js (search `TOPS_`)
1. `faceKit`: calls `TOPS_WEAR(...)` before the cap block. The cap is skipped when a wear hat is equipped.
2. `frame`: calls `TOPS_WALKFX(now,{me,pos,look,T,playClip,fpFig})` before the camera is applied.
3. `useSplit` and `fpFig.visible`: both check `!window.TOPS_WALKFULL`.
4. Arm pass: skipped while `TOPS_WALKFULL` is set. `TOPS_WALKPOST()` runs right before `renderer.render(scene,camera)`.
5. `V.tcCelebrate()`: plays the `pump` clip on the player.
6. `makeDart`: calls `TOPS_BARREL(bmat)` when `setup.mine`, and `myDart` passes `mine:true` (wave 2, barrel cosmetics).

## Saved data
Everything is in `save.tc`, so it syncs with the cloud save:
- `picks` (options rolled when the pick is earned), `own`, `paid` (unique source keys: no double awards), `unl`, `stats`, `tiers`, `troph`, `exh`, `since` (pity counter), `sets`, `bf` (backfill done)
- The loadout lives in `save.look.wear`, `save.look.cel`, `save.look.kit` and `save.look.title`, so opponents receive it through the existing online look sync.

## Server (Supabase, `tc_` tables)
- Live: `001_collectibles`, `002_trades`, `003_client_sync`, `004_seed` (catalogue). Pending: `005_trade_view` and the 2 new cards in `004_seed` (Phil, Water).
- Re-run `node sql/gen_seed.js > sql/004_seed.sql` after adding cards to `tc/data.js`.
- Tests: `test_collectibles.sql`, `test_trades.sql` and `test_sync.sql` all pass on local Postgres 16 with auth stubs.
- Career trust is accepted (mates-only game). Online awards could later go through the referee with `p_trust 'verified'`.

## Numbers
- Odds C60 U25 R11 E3.5 L0.5, with three independent rolls per pick.
- Soft pity from 160 picks, hard at 240. In the sim, the first legendary arrives at a median of 141 picks and never later than 240, about 3.5 weeks typical at an assumed 40 picks a week.

## Review history (ChatGPT)
- Round 1 scored 6.5/10. Round 2 scored 7.2/10: collection and welcome met their targets, the exhibition was close.
- Round 3 fixed the rest: three-shot dimmed walk-on, choreographed pyro, tier medals, finishes stronger at phone scale.

## Known gaps
- 66 + 2 cards so far. `tc/data.js` is the catalogue, and the art pipeline is in `claude/tops-coordination.md`.
- Mullet and towel read best from the side and back. A proper baked cloth mesh for the towel would be nicer.
- The cabinet is a painted scene with trophies placed over it, not a live 3D model. It's light on phones; a glb version can swap in later.
- Most legends are drawn from behind in their signature look; Phil Taylor's card shows his face.
- Phil's card is a generic regular, not his real face. Swap the art if someone sends a photo.
