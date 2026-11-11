# WIP: build chat, paused 11 Nov 18:41 (not live; live is v1.75 on main)
- game4.js: GPU memory leak fix for lag across matches (disposeTree in clearGroup, figure swaps, portrait figures; skeleton bone textures; VENUE_SC kept). Ready for QA, not shipped.
- game4.js: World Champs backplate path ENABLED ({6:'plate_6.webp'}). The current plate_6 image has Superman/Batman costumes: do NOT ship it. Copy is in wip/assets/venue/. Replace with the wider clean ChatGPT version ("plate_6_wide.png") or revert PLATE to the TOPS_PLATE6 flag before shipping.
- wip/scripts: headless test scripts (sideq.js face-cam/background shots, leakq.js GPU memory across matches).
