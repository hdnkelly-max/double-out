# Match view look spec (agreed with ChatGPT, 9 Nov)

One broadcast composition, board is the main subject, fixed areas for information, no floating boxes over the action. Gameplay rules unchanged.

## 1. Composition (CSS px from viewport top-left, 100dvh, no page scroll in a match)
Desktop 1440x900:
| Element | x/y | w x h | Notes |
|---|---|---|---|
| Header | 0/0 | 1440x48 | TOPS, competition, leg/format; Menu right (Sound/Caller/Quit live under Menu) |
| Board pane | 0/48 | 840x660 | Board centred at 420,350; numbered board diameter 556px |
| Player pane | 840/48 | 600x660 | Single active thrower, 1px divider |
| Route toolbar | 24/642 | 792x50 | Remaining, selected route, Routes button |
| HR strip | 864/64 | 552x52 | ECG, BPM, cause/effect, Settle |
| Scoreboard | 0/708 | 1440x112 | Two 720px player blocks, shared dart footer |
Phone 390x844:
| Header | 0/0 | 390x40 | short competition label, leg, Menu |
| Board pane | 0/40 | 390x390 | numbered board diameter 350px centred 195,235 |
| Player strip | 0/430 | 390x180 | chest-up thrower, face toward right |
| HR strip | 12/442 | 366x44 | compact row on opaque charcoal |
| Route toolbar | 12/562 | 366x48 | one selected route + chevron |
| Scoreboard | 0/610 | 390x116 | two 44px rows + 28px dart footer |
| Pull area | 0/726 | 390x118 | 84px controls + safe area (use real env(safe-area-inset-bottom)) |
Shorter screens: shrink the player strip first; never scale the whole HUD.
Layers: 0 venue backdrop · 10 board/darts/thrower · 20 reticle + landing marks · 30 header/scoreboard/HR/route/pull · 40 expanded routes · 50 outcome bands · 60 menu. Expanded routes occupy the phone player-strip area, never the board, scoreboard or pull area.

## 2. Board
Sisal: fine irregular fibre grain, no woven-fabric look, no large repeating texture. Wear: restrained pinholes around T20 and common doubles, 5–8% local tonal variation, no holes that look like landings. Beds: warm cream, charcoal black, muted red and green (board keeps traditional colours; cream/red restriction is UI only). Wire: thin bevelled silver, narrow highlights, no glowing white spokes. Spider shadow 0.5–1mm offset, subtle. Numbers: upright cream numerals on matte charcoal, consistent size, no logos. Surround: ~20mm visible beyond the numbered board, dark oxblood, low sheen, full number ring visible by default. Lighting: broad warm key from above-left, gentle frontal fill, lower-right still readable, no central hotspot. Darts: fixed tips, narrow contact shadows, restrained metal highlights, flights distinguishable from the reticle. Across tiers: board scale/markings identical; change surround, wall and ambient colour; early boards slightly more worn; no glare or visibility penalty.

## 3. Scoreboard bar
One continuous charcoal graphic, not two bordered cards.
Desktop: each 720px half has 24px outer padding; columns Name 232 / Legs 48 / Average 76 / 180s 48 / Last visit 80 / Remaining 140. Remaining 64px condensed bold cream right-aligned; Name 24px condensed bold; Average 22px tabular one decimal; Legs 24px; 180s and last visit 20px; labels 11px uppercase muted; main rows 84px; shared dart footer 28px. Active thrower: 4px red edge + red underline under the name. Remaining stays cream.
Phone: 12px gutters; columns Name 142 / Average 72 / Legs 40 / Remaining 112. Name 16px condensed (abbreviate first name before shrinking); Average 13px; Legs 14px; Remaining 36px tabular right; row 44px. Hide 180s and last visit on phone (match details instead). Dart footer: three fixed 42x22 slots then "Dart 2 of 3"; scored darts cream, latest gets a red bottom rule; empty slots a dash; planned routes never in these slots.
Tier styling: identical geometry; pub uses a muted oxblood top rule, Palace the standard bright red rule plus a competition kicker. No gold trim, no bigger type at higher tiers.

## 4. Player pane
Desktop: waist to above head, whole throwing hand and follow-through inside the pane. Phone: chest-up, face clear of the HR strip. Warm broad key on face and arm; weak rim light; background 1.5–2 stops below the player; muted navy/charcoal/cream clothing; matte skin and cloth; match the venue plate's warmth and black level instead of blur; no DoF on phone; no haze this pass, a restrained distance fade; vignette max 12% in the player pane only; remove nearby duplicate throwers and crude extras, distant silhouettes optional.
Tier dressing: 0 Pub worn timber, warm pendant, dark burgundy, no extras · 1 Club trophy cabinet silhouette, faded club wall, broader overhead light · 2 Regional dark stage curtain, subtle red side light, scorer's table silhouette · 3 DPNZ black partitions, neutral board lighting, distant adjacent lanes · 4 Trans-Tasman dark stage, restrained red light panels, barrier silhouette · 5 PDC floor quiet dark hall, neutral overhead pools, minimal · 6 Palace black stage depth, red scenic panels, stronger shoulder rim.

## 5. Phone pull area (at 390 wide)
Verdict line x12 y726 w366 h20 (reserved permanently). Timing track x12 y750 w366 h4. Pull pad x12 y758 w366 h48. Corners 4px max. Whole pad is the target, not the track.
States: Ready charcoal fill, cream 1px border, "Hold to pull" · Pulling slightly lighter fill, "Release to throw", cream marker on track · Perfect window four short cream ticks around the sweet region, no green · Over-held red marker + "Late", no flash · Released verdict in the reserved line 400ms ("Perfect ×3" fits) · Opponent turn pad stays, subdued, "Opponent throwing". The highlighted track region must reflect the actual window.

## 6. Routes and HR
Routes: opaque charcoal strip, 1px separator, no glass. Text 16px desktop / 14px phone. Chips min 36x28, 6px gaps, neutral #20252C. Selected: 3px red left rule, cream text, slightly lighter fill. Respect routes: small outlined diamond + RESPECT in cream, no gold or glow. Collapsed phone: "132 OUT · T20 → T12 → D18" + chevron. Expanded phone: max three 44px rows + compact heading, scroll the rest vertically within that area. No finish: "No checkout this visit".
HR: ECG 48px desktop / 28px phone; BPM 20/18px; cause/effect 13/12px; Settle 72x44 touch target, outlined red, not a filled CTA. Cream at baseline, red for warning/pressure increase. One-line phone copy: "88 · Big visit · +12% spread".

## 7. Motion
Button press tint 80ms linear; release 120ms ease-out; route expansion 160ms opacity + 6px, cubic-bezier(.2,.8,.2,1); active-player red indicator 160ms ease-out; band entrance 200ms 8px; band exit 120ms ease-in; score duplicate travelling to bar 250ms ease-out; release verdict 80ms in / 120ms out; manual board view change 180ms ease-in-out; earned board push 350ms (140 in, 210 back) ease-in-out. 450ms reaction shot and wait caps as agreed. Never tween through intermediate score values. Reduced motion: no translations, pushes, wobble or travelling totals; opacity changes ≤100ms.

## 8. Tokens and removals
--match-bg #0D1014 · --match-surface #101318 · --match-raised #20252C · --match-text #E9E4D8 · --match-muted #ADB0B5 · --match-line #343A43 · --match-red #E8382C · --match-oxblood #682B2B · --match-focus #E9E4D8 · radius 4px · stroke 1px · gap 8px. Existing condensed display font and body font; tabular-nums on scores, averages, BPM, timing; kickers 0.06em tracking, normal tracking for names.
Remove: cropped default board and oversized crosshair; floating route list over the character; duplicate selected-route display; names and averages sharing space; gold averages and respect text; bright corrugated backdrop and synchronised extras; separate Sound/Caller/Quit boxes (under Menu); tiny ghosted dart icons without readable results.
