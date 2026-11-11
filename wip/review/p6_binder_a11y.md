## Accessibility Audit: Collection (binder) card text, P6
**Standard:** WCAG 2.1 AA | **Date:** 12 Nov 2026, 02:2x NZT | **Build:** `polish-p6-binder` 59ead92 on `src` 2d6317f (1.88)

### Summary
**Issues found:** 4 | **Critical:** 0 | **Major:** 1 (fixed) | **Minor:** 3 (2 fixed, 1 follow-up)

### Findings

#### Perceivable
| # | Issue | WCAG Criterion | Severity | Recommendation |
|---|-------|---------------|----------|----------------|
| 1 | Card number + rarity on Collection cards at **7.5 px** (390 px wide phone, card 159 px); 6.9 px at 360 | 1.4.4 Resize text / project floor 11 px (P6) | 🟡 Major | **Fixed:** `max(11px, card-w × .047)`, tracking .08em → .03em so "No. 012 · Uncommon" stays on one line |
| 2 | Longest names (>16 chars, e.g. "Raymond van Barneveld") at **10.6 px** (9.7 px at 360) | project floor 11 px | 🟢 Minor | **Fixed:** `max(12px, …)` on Collection cards; still 2 lines, nothing clamped (tested with the real fonts) |
| 3 | Empty slot "Not collected" at **10 px** | project floor 11 px | 🟢 Minor | **Fixed:** 11 px |
| 4 | Rarity shown by colour **and** by word | 1.4.1 Use of colour | ✅ Pass | Keep (colour-blind safe) |

#### Operable
| # | Issue | WCAG Criterion | Severity | Recommendation |
|---|-------|---------------|----------|----------------|
| 5 | Collection cards are `div`s with `onclick` (open inspect): not reachable by keyboard, no button role or name. Pre-existing, outside this item | 2.1.1 Keyboard, 4.1.2 Name/Role | 🟢 Minor (touch-first game) | Follow-up: `tabIndex=0`, `role="button"`, `aria-label="<name>, <rarity>"`, Enter/Space opens inspect |

### Color Contrast Check (plate ≈ #141C1D)
| Element | Foreground | Ratio | Required | Pass? |
|---------|-----------|-------|----------|-------|
| Card name | #EDECE5 | 14.6:1 | 4.5:1 | ✅ |
| Card number (muted) | #9AA7A5 | 7.0:1 | 4.5:1 | ✅ |
| Rarity: common | #AEB7B5 | 8.4:1 | 4.5:1 | ✅ |
| Rarity: uncommon | #C08A5B | 5.8:1 | 4.5:1 | ✅ |
| Rarity: rare | #B9B4D8 | 8.7:1 | 4.5:1 | ✅ |
| Rarity: epic (gold) | #C49A52 | ~6.6:1 | 4.5:1 | ✅ |
| Rarity: legendary | #E2C27E | 10.1:1 | 4.5:1 | ✅ |
| "Not collected" | rgba(237,236,229,.55) on #10191A ≈ #8A8F8D | 5.3:1 | 4.5:1 | ✅ |

### Measured (wip/scripts/p6binder.js, real Barlow Condensed + Manrope from @fontsource)
| Size | Card width | Text under 11 px | Clipped | Result |
|---|---|---|---|---|
| 1.88, 390×844 | 159 | number/rarity 7.5, long name 10.6 | 0 | FAIL |
| fix, 390×844 | 159 | none | 0 | PASS |
| fix, 360×640 | 147 | none | 0 | PASS |
| fix, 1366×768 | 170 | none | 0 | PASS |

### Priority Fixes
1. **Done:** the 11 px floor on Collection card text (number, rarity, empty slots) and 12 px for long names.
2. **Follow-up (own small item):** keyboard access and names for Collection cards (#5).
3. Not covered here: the pack summary mini cards (`.tcpk__grid`, `--card-w:min(27vw,120px)`), next in the P6 pass.
