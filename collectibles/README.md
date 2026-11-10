# TOPS collectibles: handoff for the build chat

Built in the collectibles chat on 11 Nov 2026. Spec: `claude/tops-collectibles-plan.md`. Rules: `claude/tops-coordination.md`.
This branch never ships. Merge into the game source at a clean point, after the regression gate passes.

## What's here
| Path | What | Plugs in |
|---|---|---|
| `cards/cards.css`, `cards/cards.js` | Card renderer (layered: art, rarity frame, live text, sheen, legendary foil + sweep), CSS 3D flip, touch tilt, pack screen (3 face-down, pick one, other two flip "Missed", skip / quick-open for 4+ / 8+ picks, open later, summary), tiny sound palette with synth fallback | Load after the game UI. `TopsCards.openPack({picks, resolve, onDone, onLater, backdrop})` after the reward overlay. `resolve(pickId,pos)` calls `tc_choose` |
| `cards/catalog.js` | First 20 cards (seed for `card_definitions`) | Replace with a read of `card_definitions` |
| `cards/assets/` | `back.webp`, `frame_{common,uncommon,rare,epic,legendary}.webp`, `foil.webp`, `art/*.webp` (700×1050) | Copy to `assets/cards/` |
| `cards/index.html` | Standalone prototype with a mock server | Not for the game. Open locally to test |
| `sql/001_collectibles.sql` | Phase 1 schema, RLS and RPCs: `tc_award`, `tc_open_picks`, `tc_choose` | **Draft.** Apply only when the Supabase lock is free |
| `sql/test_collectibles.sql` | Integrity tests (8 passing on local Postgres 16 with auth stubs) | Run on a branch DB before applying |
| `sim/odds.js` | Odds and pity sim | `node sim/odds.js 20000 40` |

## Card geometry
Canvas 700×1050 (2:3). Art window x 47–653, y 52–827. Nameplate 827–1039. All five frames share it within ±6 px.

## Game hooks needed (build chat)
1. On every 180 and every 100+ checkout, and on each achievement tier: `rpc('tc_award', {p_source_key, p_kind, p_reason})`.
   Source keys: `match:{matchId}:leg:{n}:visit:{n}:180`, `match:{matchId}:leg:{n}:visit:{n}:ton:{score}`, `ach:{id}:{tier}`, `nine:{matchId}:{leg}`. Career = `trust 'career'`. The referee awards online with `p_trust 'verified'` and `p_user` from the service role.
2. After the reward overlay: add one line, e.g. "4 card picks · 2×180, Ton Out bronze, 112 out". Then `tc_open_picks()` → `TopsCards.openPack`.
3. Practice and drills never call `tc_award`.

## Numbers
- Odds C60 U25 R11 E3.5 L0.5, three independent rolls per pick, options rolled when earned.
- Soft pity ramps from 160 picks and hits a hard cap at 240. It was tuned down from ChatGPT's 80/120, which halved the time to a first legendary. Sim over 20k players: median first legendary at 141 picks, p90 at 206, max 240. At 40 picks a week that's 3.5 weeks typical and 6 weeks worst.
- Nine-darter: an exclusive Nine-Dart Club card, plus all three options kept, with legendary chance at least 5% each.
