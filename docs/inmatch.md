
## In-match view (agreed with ChatGPT, 9 Nov) — replaces sprint 1 and most of item 8

Hayden's brief: the match view is where the time goes, so look, feel and dopamine have to be best here. I proposed a broadcast-style redesign; ChatGPT rejected the parts that move the aiming reference or add waits, and we agreed the rest. What follows is the settled plan.

### Principles
- The aiming reference never moves. No zoom during the pull, no camera cut between pull start and release. A close view is a manual toggle, chosen before the pull and locked.
- Honest spread: the reticle ring is the real 80th-percentile error (radius ≈ 1.79σ in board mm); timing is shown by ticks, not by the ring collapsing to a dot. "Perfect release" means timing, not a guaranteed treble, and is confirmed after release.
- Darts stay in the board for the visit (shaft wobble 180 ms around a fixed tip, cheap shadow). Score updates immediately; animations are decoration, never the source of truth.
- One outcome resolver per dart: legality first, then one dominant treatment (bust suppresses treble/visit celebration; checkout suppresses the visit total; match dart + match won are one sequence). Nothing queues more than 500 ms of extra input lock; skip stops speech and particles too.
- Earned moments get room, ordinary darts get none. Cream and red only in the match; gold stays for money.
- Timestamp-based release evaluation (never frame-derived), pointer capture with explicit pointercancel, so app switches or lost touches cancel the pull rather than throwing.
- Separate settings: Sound, Caller, Haptics, Reduced motion.

### What changed from my proposal
| Proposed | Agreed |
|---|---|
| Zoom toward target during the pull | Rejected. Manual close view, locked before pulling. |
| Reticle snaps to a dot in the perfect window | Changed. Ring stays at true radius; four inward 4 mm ticks mark the window. |
| Ghosts of last three landings always | Practice, plus career tiers 0–1 by default (off from tier 2, toggle kept). Hollow cream marks, 20% opacity, cleared each leg. |
| Three broadcast shots | Two: stable three-quarter thrower, and a reaction after a big outcome. No cut on ordinary darts. |
| Board top 60% on phones | Reserve scoreboard (~100–112 px) and pull controls (64 px) first, fit the whole numbered board to width with 12 px clearance, thrower takes what is left and collapses first. |
| Gold score colour ladder | Rejected. Size, weight and red accents. |
| 180 freeze frame + confetti | No clock freeze. One combined treatment, particles outside the board only. |
| Hot tag / Perfect ×3 on HUD | Deferred as HUD elements. Streak text (Perfect ×2+) shows 400 ms in the release-verdict area, resets on a non-perfect thrown dart, no effect, no sound. |
| Haptics as a core channel | Optional enhancement (vibration support is patchy); never the only feedback. |
| In-match XP/feat toasts | One 600 ms notice at visit end, outside the board, zero added wait. Details on the result screen. |

My amendments ChatGPT accepted: a 140+ visit gets the 450 ms reaction shot by default; 180s and checkouts get a 350 ms board push (140 in / 210 out, max 8% magnification) toward the dart cluster, starting only after the final landing, returning before aiming resumes, skippable, fixed under reduced motion.

### Reticle spec
- Board mm throughout, one projection for everything board-attached. Centre dot 1 mm (2 CSS px minimum). Ring stroke 1.5 CSS px with 1 px charcoal outline, DPR-independent. Cream #e9e4d8, warnings red #e8382c.
- Ring radius = 1.794σ of the live throw model (attrs, arm, nerves, pressure). σ 4 mm → 7.2 mm. Over 45 mm: dashed 45 mm boundary plus "Wide".
- Aiming: dot + four 3 mm crosshair arms starting 3 mm out. No ring, timer or pulse. Drag sets aim; lifting does not throw. Separate pull area so the finger never hides the target.
- Pulling: dot + cream ring; small timing track in the pull area. Camera and aim locked.
- Perfect window: four inward 4 mm ticks outside the ring; sweet region marked on the track. No pre-release buzz or sound.
- Over-held: dashed red ring, "Late" by the track. No shake, no forced release.
- Nerves: same ring, enlarged by the real nerves contribution; the HR strip explains why. No decorative jitter.
- Released: reticle fades 100 ms; timing verdict (and streak) in the pull area for 200–400 ms, optional 8 ms pulse. Cancelled: back to aiming, no dart, no penalty.

### Camera rules
| State | Board pane | Player pane | Duration | Skippable |
|---|---|---|---|---|
| Pre-aim | Whole numbered board; optional close-view toggle | Stable three-quarter thrower | Until pull | Toggle before pull |
| View change | Chosen framing, aim preserved in board coords | Unchanged | 180 ms (instant under reduced motion) | Yes |
| Pull | Locked | Same shot, arm animation only | Player controlled | Cancel |
| Ordinary landing | Locked, darts stay | Same shot, release synchronised | Flight + 180 ms wobble | No extra wait |
| AI visit | Same framing | Opponent replaces player, compact pressure label | Visit length (Quick shortens gaps) | Quick mode |
| 140+ visit | Unchanged | Reaction shot | 450 ms | Yes |
| 180 / checkout | 350 ms push-and-return after final landing | Reaction | 600 ms | Yes |
| Match-winning checkout | Push-and-return, board readable | Winner reaction | 800 ms | Yes |
| Between legs | Whole board after darts clear | Neutral idle | 900 ms band | Yes |

### Feedback ladder (visual · sound · haptic · visible · max added wait)
- Miss / zero: 0 chip, impact point · surround/wire impact · none · 250 ms (chip persists) · 0
- Single: chip + immediate score · sisal thunk · none · 180 ms · 0
- Treble: chip, 6 mm impact halo · thunk + treble accent · 10 ms · 220 ms · 0
- 100–139: cream total at board edge, then floats to a scoreboard chip over 250 ms (real score updates at once) · caller + light venue response · none · 400 ms · 0
- 140–179: larger cream total, red underline · caller + short swell · 15 ms · 550 ms · 100 ms
- 180: large cream 180, red band, no full-screen flash · 180 caller + venue-scaled cheer · 15–40–15 ms · 800 ms · 250 ms
- Bust: red BUST, visit-start score visibly restored · muted low cue, "No score" · 30 ms · 450 ms · 100 ms
- Missed double: actual result, route updates · normal impact, restrained crowd only on decisive attempts · none · 200 ms · 0
- Checkout: "80 OUT · T20 D10", legs update · game shot + venue applause · 20 ms · 600 ms · 200 ms
- Match dart hit → match won: legal finish confirmed, winning route band, RESPECT only for an eligible route actually thrown · "Game shot, and the match" + venue celebration · 15–40–25 ms once · 800 ms sequence · 500 ms
- Match-dart hush: ambience −6 dB over 150 ms, not restarted on each missed double. Caller default: 100+ totals and checkouts. Crowd ducks 6 dB under speech. Skip = 60 ms fade.
- Sound off keeps every chip, score, bust restoration, route and band. Reduced motion: fixed cameras, 100 ms opacity changes instead of pushes/reactions, no wobble, particles or travelling totals, same durations.

### Sound asset brief (103 files, first pass; one neutral NZ caller voice, mixed per tier rather than re-recorded)
- Sisal impacts ×6 (80–160 ms, no immediate repeats); surround impacts ×2 (100–180 ms); wire contact ×2 (60–120 ms, only when the sim supports it).
- Treble accent ×1, double accent ×1 (100–160 ms, distinct); bust cue ×1 (180–250 ms, dry, not comic); game-shot accent ×1 (250–400 ms); match-win accent ×1 (500–700 ms).
- Caller numbers 100–180 inclusive ×81 (450–900 ms; 180 up to 1.2 s). Phrases ×3: "Game shot", "Game shot, and the match", "No score". No names or routes yet. "All visit totals" setting needs 1–99 (+99 files) and ships only when they exist.
- Venue ambience ×1 (30 s seamless murmur, no intelligible speech/music/clinks); light applause ×1 (0.6–0.9 s); strong applause ×1 (1–1.5 s); cheer ×1 (1.5–2.2 s); anticipation ×1 (1.5 s loop, rising murmur, not a riser).
- Tier mixes (ambience gain; light / strong / cheer triggers): T0 pub −24 dB; light 100+ and checkouts, strong 180/match win, no anticipation. T1 club −22; light 100+, strong 140+/checkouts, cheer 180/match win. T2 regional −20; as T1 plus anticipation on a deciding-leg checkout visit. T3 DPNZ −26; light 140+/ordinary checkouts, strong 180/ton-plus finishes/match win, no routine cheer. T4 Trans-Tasman −18; as T1 plus anticipation on decisive checkout visits. T5 PDC floor −30; light 180/ton-plus finishes, strong match win, no cheer or anticipation. T6 Palace −16; as T4.
- Export: trimmed mono one-shots and caller, stereo ambience/crowd, 48 kHz WAV masters, consistent loudness per family.

### Build order
**Sprint 1 — trustworthy input, board and scoreboard** (absorbs the old sprint 1): timestamp release + cancel handling with pointer capture; phone layout with separate aim and pull areas; stable board camera + exact reticle states; persistent darts, fixed tips, wobble; dart chips, live route updates, immediate scoreboard; basic landing sounds and bust/checkout priority; Quick/Full pacing budgets.
Checks: scripted timing offsets classify identically at 30/60/120 Hz; 20 cancellation/backgrounding cases produce zero unintended darts; 5 testers can tell aim, spread and timing apart after one practice leg; no name/average overlap at 390 and 320 px; 4 of 5 can set a double target without their finger hiding it; presentation waiting down ≥25% vs v51; 10 minutes on an older phone holds 60 fps or a stable 30.

**Sprint 2 — opponent presence and earned feedback** (merges old sprint 3's throw sync and item 8): synchronised opponent animation and landing; outcome ladder, caller priority, tier-scaled crowd; one board key light, darker venue, thrower rim light, cheap dart shadows; reaction shot and winning band; optional haptics; visit-end XP/feat notice; feed timing errors, double attempts and route outcomes into practice recommendations.
Checks: testers name the active thrower and remaining score within 2 s; 4 of 5 recognise a 180 and a checkout with sound off; scripted outcome tests show no duplicate caller lines, celebratory busts or input-blocking rewards; no camera movement during any pull; 10-minute sessions with effects on/off show no frame-stability loss; ask "which moment felt good?" and "what interrupted your rhythm?" and remove anything repeatedly named in the second.

Deferred until this feels good on a phone: haze, replay infrastructure, streak counters on the HUD, multi-shot broadcast choreography.
