# TOPS game source (read-only mirror)
Synced by the build chat after every ship. **Never ship from this branch.** Live is `main`.
- Build: `npm i three@0.128.0` then `node build.js` (writes double-out-standalone.html). Assets (img/, assets/) live on `main`.
- Regression gate: `node tests/regress.js 2`
- Collectibles work goes on the `collectibles` branch under `collectibles/`; the build chat merges it.
Version: TOPS_VER='1.52'
