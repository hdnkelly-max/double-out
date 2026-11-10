# TOPS collectibles: handoff for the build chat (11 Nov 2026)

Built in the collectibles chat. Spec: `claude/tops-collectibles-plan.md`. Rules: `claude/tops-coordination.md`.
Nothing here is live. Two branches to merge at a clean point:

| Branch | What | Where it lands |
|---|---|---|
| `collectibles-src` (from `src`) | Game integration: `tc/` module + 5 small hooks in `game4.js` + `build.js` bundling | Your game source (oche-next) |
| `collectibles` (from `main`) | `assets/cards/` (all art, 4.1 MB WebP), `collectibles/sql`, sim, prototype, review shots | `assets/cards/` on main; SQL to Supabase when the lock is free |

Regression gate (`tests/regress.js 2`) passes with everything built in.

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

## Saved data
Everything is in `save.tc`, so it syncs with the cloud save:
- `picks` (options rolled when the pick is earned), `own`, `paid` (unique source keys: no double awards), `unl`, `stats`, `tiers`, `troph`, `exh`, `since` (pity counter), `sets`, `bf` (backfill done)
- The loadout lives in `save.look.wear`, `save.look.cel`, `save.look.kit` and `save.look.title`, so opponents receive it through the existing online look sync.

## Server mode (when the Supabase lock frees)
- `sql/001_collectibles.sql` (8 integrity tests) and `sql/002_trades.sql` (trade tests) both pass on local Postgres 16 with auth stubs.
- To switch over, replace `choose()` / `award()` in `tc/core.js` with `rpc('tc_choose')` / `rpc('tc_award')`. The shapes already match.
- Trading UI hooks into `tc_trade_offer` / `tc_trade_respond` / `tc_tradeable`. The binder already marks duplicate legendaries as tradeable.
- For a mates-only game, career trust is accepted. Online awards go through the referee with `p_trust 'verified'`.

## Numbers
- Odds C60 U25 R11 E3.5 L0.5, with three independent rolls per pick.
- Soft pity from 160 picks, hard at 240. In the sim, the first legendary arrives at a median of 141 picks and never later than 240, about 3.5 weeks typical at an assumed 40 picks a week.

## Review history (ChatGPT)
- Round 1 scored 6.5/10. Round 2 scored 7.2/10: collection and welcome met their targets, the exhibition was close.
- Round 3 fixed the rest: three-shot dimmed walk-on, choreographed pyro, tier medals, finishes stronger at phone scale.

## Known gaps
- 20 + 2 cards so far, against about 150 planned. `tc/data.js` is the catalogue, and the art pipeline is in `claude/tops-coordination.md`.
- Mullet and towel read best from the side and back. A proper baked cloth mesh for the towel would be nicer.
- The cabinet is a painted scene with trophies placed over it, not a live 3D model. It's light on phones; a glb version can swap in later.
- Legends are drawn as silhouettes from behind (no faces), because the image tool won't do real likenesses.
