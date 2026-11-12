## Design Critique: F6/F7 (tea towel, mullet, trophy cabinet), Art pass vs Build bc2c1d7

### Overall Impression
All three read at a glance now. The towel looks thrown on and used, the mullet reads short-sides/long-back rather than a wig, and the cabinet's trophies are the stars on a lit shelf each.

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| `V.heroShot` renders right after load show the base rig without wearables until character models load (Build's script retries; mine didn't at first) | 🟢 Minor | Not a player-facing issue: the loadout and match figures show wearables once loaded |
| Mullet hairline at the forehead still reveals the procedural shell up close | 🟢 Minor | Fine at 390 px gameplay sizes (ChatGPT agrees, not a blocker) |
| Cabinet shelf LED edge was a harsh white bar in pass 1 | 🟡 (fixed) | Dimmed to a warm edge |

### Visual Hierarchy
- Cabinet: trophies first (larger, contact shadows, own shelf light), cabinet timber second, room third.

### Consistency
- Towel and mullet work across body models (checked brian, lewis, megan; Build's 8-model script also passes).

### Verdict
Lock all three: towel 8.7, mullet 8.6, cabinet 8.7 (ChatGPT).
