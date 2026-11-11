## Design Critique: #13 "What are cards?" (round 2, 390x844 + 360x640 + desktop)

### Overall Impression
The fix is mostly subtraction and it works: the welcome stays a celebration (card art and "3 PICKS EARNED" lead), and the explainer reads as a short, temporary instruction sheet rather than a settings page. The biggest remaining risk was behavioural, not visual (X opening the picks), and that is now fixed.

### Usability
| Finding | Severity | Recommendation |
|---------|----------|----------------|
| One-time sheet: X / tap outside used to open the picks anyway | 🟡 Moderate | **Fixed:** X and backdrop now mean "not now": picks stay waiting, the calling flow (results Next) continues, the sheet doesn't come back. Test covers it. |
| Bottom sheet on short screens (360x640, large text) could clip its top if aligned with flex-end | 🟡 Moderate | **Fixed:** sheet uses `margin-top:auto` inside a scrolling column, so it scrolls instead of clipping. Test checks top and button at 360x640. |
| Binder help link was small, looked decorative | 🟢 Minor | **Fixed:** "(?) How cards work", 14px, 44px target. |
| Welcome "Later" link is small (pre-existing) | 🟢 Minor | Leave: it's a secondary action, and P6 covers tap targets across screens. |

### Visual Hierarchy
- **What draws the eye first**: the gold card fan on the welcome; the lime-numbered steps on the sheet. Correct for both.
- **Reading flow**: title, then 4 bold lead-ins, then one CTA. Each row's bold lead-in carries the meaning; the grey text can be skipped.
- **Emphasis**: one lime CTA per screen; nothing competes with it.

### Consistency
| Element | Issue | Recommendation |
|---------|-------|----------------|
| Copy | Welcome and sheet now use the same four ideas (earn, keep one of three, rewards, where to find) in the same order | Keep |
| Close button | The sheet's X sits inside the sheet; other full-screen sheets keep it top-right of the screen | Correct for a bottom sheet; same size and style |
| Heading | Fallback font wraps "WHAT ARE CARDS?" to two lines | Acceptable; 56px reserved, so it never touches the X in any font |

### Accessibility
- **Color contrast**: muted body #9AA7A5 on #10191A is about 7.3:1 (passes AA); lime button text #10191A on #D8F25A is about 14:1.
- **Touch targets**: CTA 52px, X 44px, binder link 44px. Welcome "Later" under 44px (pre-existing, P6).
- **Text readability**: 14px body, 15px lead-ins, line-height 1.4.

### What Works Well
- One explanation, three entry points, no tutorial carousel.
- "Find them in Career → Cards" answers the tester's actual question.
- The dimmed screen behind the sheet makes it feel temporary and keeps the player in context.

### Priority Recommendations
1. **Ship as is** after the X / backdrop behaviour change (done) and the short-screen check (done).
2. P6 later: the welcome "Later" link's tap target.
3. Nothing else for this item.

Verdict: 8.8/10 (agrees with ChatGPT's 8.9).
