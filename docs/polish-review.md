# Polish review (ChatGPT, 9 Nov 2026, 44 screenshots)

Verdict: identity is there; the MVP feel is inconsistent sizing, cramped desktop content and weak hierarchy.

## Top 10 by impact per hour
1. Three content widths: 1200 page, 960 selection, 560 dialogue; 32px desktop / 16px phone gutters. Multiplayer and drafts stop being narrow side panels.
2. Type scale: page title 40/32, section 22/20, body 15 (lh 1.45), labels 12. No tiny uppercase paragraphs.
3. One opaque content surface #11151B with separators; no nested translucent boxes.
4. Lobby: replace the big disabled red waiting button with a 48px neutral status row + separate Start button.
5. Cards: no blue glow or stacked insets; rarity header; 180-200px desktop cards; route choices as two 280px panels.
6. Kit: top-align preview and list, 80px product rows, fixed 72px price column, cream "Equipped".
7. Copy: hide undefined fixture previews, practice empty state "Complete a drill to set your baseline", feat chips become wrapping rows.
8. Stat tiles: 72px min, 12px padding, 28px value, 4 cols desktop / 2 phone, one shared "No recorded matches yet" note.
9. Actions: login Google row 48px with helper outside, creator preview 240px on phone, dialogue max 560 with 48px replies.
10. Match: hold zone 1px solid 25% cream instead of dashed, 44px instruction strip, Settled out of the score, Routes its own full-width phone row.

## Components
Tokens: bg #0D1014, surface #11151B, raised #1B2129, text #E9E4D8, muted #ADB2BA, border #343C47, red #E8382C, red-wash #2B1719, money #D9AD52, radius 4, gaps 8/16/24.
- Page header 56px desktop; phone 52 + 44 tab row. Phone tabs: Career / Practice / Player / Kit / Ranks.
- Section heading 22/20, kicker 12 (0.08em), 8 kicker gap, 16 to content.
- Segmented control min 44px, 3px padding, 2px gap, 14px labels, selected red fill.
- Primary button 48px, 16px bold, red fill, supporting copy outside. Secondary raised + 1px border. Disabled raised + muted, reason alongside.
- Stat tile 72px, 12px padding, 12px label, 28px value. List row 72px, 40px avatar, 16/14 type, fixed trailing column.
- Empty state 24px padding, 20px title, one 15px line, optional 44px action.
- Focus 2px cream outline, 3px offset.

## Cards
Rarity header 28px: common "• COMMON" muted; rare "•• RARE" cream with 3px cream top rule; keystone ribbon in red. Selection = checkmark + raised, never a rarity-looking outline. Desktop 184px wide, art 88px; phone 2 columns, art 64px. Flavour off the card face. Copy: "Choose 1 of 3", "Hard route reward: choose 1 of 5". More options: one single-card reroll per Run (same rarity and suit, excludes offered cards, seeded for daily). No locks or pick-two.

## Multiplayer
Landing: PLAY ONLINE header, entry first, rules in a "Match rules" disclosure with a summary line, code input "Room code" 48px. Pros: CHOOSE YOUR PRO, 4 cols desktop / 2 phone, aligned stat rows, selected = red top rule + SELECTED ✓, records in their own section. Lobby: roster rows 64px with Host / Ready / Choosing pro badges, "2 of 3 players ready" line, Copy/Share by the code. 4-player match: roster off the board (top of player pane desktop, 2x2 above the scoreboard on phone), no nicknames in play, THROWING label.
