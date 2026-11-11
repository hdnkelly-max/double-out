# Assets inbox (not game code, never merge)

Files Hayden had on his PC, fetched by the Overseer on 11 Nov 20:45 NZT.

- World Champs plate (F1): NOT here. The only plate_6 file in Hayden's Downloads (`plate_6_worlds.png`) is the costume version (Superman, Batman, Mario, Waldo): DO NOT SHIP, so it was removed. There is no `plate_6_wide.png` on his PC. Build: regenerate a clean one with ChatGPT (no recognisable characters or brands).
- `makehuman/makehuman_system_assets_cc0.zip.part-*`: MakeHuman CC0 system assets (F3), 281 MB, split for GitHub's 100 MB limit.
  Rebuild: `cat makehuman/makehuman_system_assets_cc0.zip.part-* > makehuman_system_assets_cc0.zip`
  Check: `sha256sum -c makehuman/SHA256SUMS`

Fetch only this branch: `git clone --depth 1 -b assets-inbox --single-branch https://github.com/hdnkelly-max/double-out inbox`
