# 62h · Engine: grip review P2s on 4.30, plus the prestige hook review

Engine (TOPS 2) · Sun 22 Nov

## 1. Grip P2s: branch `rel-grip77b` @ `ee04ef7` (4.30 `e8959e3` merged in)

**v3 dart from the face cam.** At 4.30 the barrel sat inside the fist; only the tip and a sliver of flight showed.
- In aim and pull, the dart is seated 3 cm higher (`G77V3 {u:.03}`), still pointing at the board.
- A thumb made for that seat presses on the barrel (`GRIP77T3`).
- Both ease back to 4.30's over the first 30% of the throw. Kept on higher in the swing, the seat met Kai's quiff (s3-dart-hair test rig, throw .42).
- v3 figures only. `TOPS_G77V3={}` gives 4.30.

| Measure | 4.30 | This |
|---|---|---|
| Visible dart pixels in the face cam (480 px pane) | 74–80 | 99 |
| s3-dart-hold thumb gap | 9.1 mm | 3.7 mm |

Seating it higher with 4.30's thumb showed more (139–144 px), but opened the thumb gap to 29 mm. That would reopen Q&D's (a), so I kept the thumb on the barrel.

**v2 cap peak.** Width .72 → .65 (`TOPS_CAP77P`). It still clears the glasses on every base and build.

**Sheet `grip_p2_sheet.jpg`:** Hayden's face pane and a close-up, Big Mal's aim and the hero, each at 4.30 and with this change, on v2 and v3.

**Tests on the merge (`chain.txt`): all PASS**
- grip-cap v2 and v3, dart-hold, v2-clear v2 and forced v3
- dart-hair v2 and v3 (Mia 36.4, Big Mal 45.7 mm), dart-cast
- herocolour with framing
- match and creator, v2 and v3
- clip v2, v3 and cast; pers-clear; pers-match; blend; hubfps

**Parity vs 4.30 (v2 default):**
- With the brim at its 4.30 width (`TOPS_CAP77P {w:.72}`): identical (13 figures, 2,470 clip frames).
- As shipped: only Dazza differs, his cap geometry, as intended.

## 2. Prestige hooks (CAR-PRESTIGE): review PASS, one P2 fixed

**Verdict:** posted in the CAR-PRESTIGE row.
- No hook touches throw maths, timing or opponents' darts. gearprobe, 3 editions on v2 and v3: the opponent's dart is identical; your dart keeps its geometry and tip.
- v2 parity with no edition: identical.

**P2 fixed, branch `eng-prestige-p2` @ `f44234c` (on `car-prestige` `8b8c405`):**
- **Bug:** in a local match the second player is human, so their 180 or match win fired the gear cam and showed player 1's darts.
- **Fix:** both calls now require `S.cur===0`.
- **Test:** `tests/s3-gearcam-p1.js` fails on `8b8c405` and passes on this. s3-prestige still passes.
- **To Career:** merge it into `car-prestige`. The hooks aren't on src, so this can't sit on 4.30 by itself.
