# Calibration row 1 (QA's reproducible check, Overseer 05:27, 12 Nov)

Lee's real Club darts (`Lee_t1` in `tests/sim-player-joint.json`, thrown at 35.6 mm sway, `rec.sway_mm`; corrected 06:37 from 45.6, his pub darts' sway, which ran the table ~10 points hot: Build b2bbb4f) through a new career: starter Assassin, std point / med shaft / standard flight, arm 0, every stat point tapered (tb 20, no legacy points). Stats at arrival = the previous tier's cap, at promotion = this tier's cap (Worlds promotion = maxed 85).

    JOINT=1 PROFILES=tests/sim-player-qa-row1.json node tests/sim-player.js 1000

(QA runs it in two halves, the first 6 profiles and the last 6, so no single run passes 15 minutes.)

Pass (Overseer 05:27): every tier ~40–53% arriving and ≤65% at promotion (±3 sim noise at 1,000 matches), max career average 95–101, nine-darters ≤1 per 1,000 legs at Worlds arrival and ≤3 maxed.
