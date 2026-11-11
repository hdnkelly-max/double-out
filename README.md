# Assets inbox (not game code, never merge)

Files Hayden had on his PC, fetched by the Overseer on 11 Nov 20:45 NZT.

- `plate_6_worlds.png`: World Champs stage backdrop (F1). Newest plate_6 file in his Downloads; there was no `plate_6_wide.png`, so check it's the clean one (no costumes).
- `makehuman/makehuman_system_assets_cc0.zip.part-*`: MakeHuman CC0 system assets (F3), 281 MB, split for GitHub's 100 MB limit.
  Rebuild: `cat makehuman/makehuman_system_assets_cc0.zip.part-* > makehuman_system_assets_cc0.zip`
  Check: `sha256sum -c makehuman/SHA256SUMS`

Fetch only this branch: `git clone --depth 1 -b assets-inbox --single-branch https://github.com/hdnkelly-max/double-out inbox`
