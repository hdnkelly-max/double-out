## Design Critique: Club venue, pass 1 (v2) vs live 1.81

### Overall Impression
Pass 1 kills the clinical read: warm timber, deep green walls and oxblood carpet now say "club hall". Biggest opportunity: the room is evenly dark, so there's no pooled light and no depth; it reads "repainted", not "lit".

### Usability (match readability)
| Finding | Severity | Recommendation |
|---|---|---|
| White polo now has strong contrast against the green wall; thrower reads faster than on live | 🟢 Minor (positive) | Keep wall value low behind the thrower |
| "Aim on the board" hint and HR panel stay legible on the darker scene | 🟢 Minor | No change |
| Carpet at desktop is a dark red mass; the gold motif is invisible at match distance | 🟡 Moderate | Lift carpet value ~15%, raise motif contrast or scale it up |

### Visual Hierarchy
- **Eye goes first to:** the thrower (correct), then the honours boards.
- **Problem:** wall brightness is flat left to right; nothing frames the thrower. A warm light pool behind/above the board lane and darker room edges would add depth and focus.
- **Honours boards:** lettering reads grey-white; real boards use gold leaf. Warming it to gold sells the club instantly.

### Consistency
| Element | Issue | Recommendation |
|---|---|---|
| Wainscot timber | Now quite orange and bright, competes with the thrower's skin tone | Deepen to a walnut brown |
| Ceiling | Grid still faintly visible as a cool pattern in some angles | Already multiplied; check in-match angles |

### Accessibility
- HUD contrast unaffected (HUD is its own panel). Text over scene (hint) still on a dark plate, passes.

### What Works Well
- Palette now matches the reference: green, wood, oxblood, brass.
- Fallback room before the GLB loads matches the graded look.

### Priority Recommendations
1. **Light pools**: paint warm radial pools on the walls behind the thrower and at the board end, darken the room edges.
2. **Gold-leaf honours lettering**: tint the pale text gold.
3. **Carpet value and motif** readable at match distance.
4. **Deepen the wainscot** to walnut.
