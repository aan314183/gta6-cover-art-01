# Vice Cover — GTA 6 cover art maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/aan314183/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/aan314183/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover turns your own photos and a caption into multi-panel cover art in the style of GTA 6 posters — a big hero panel plus smaller panels, bold poster lettering, and a Vice City sunset, neon night or monochrome grade — and exports it as a PNG to share.

## How to use it

1. Open `app/index.html` in a desktop browser (or serve `app/` with any static server).
2. Add up to three photos from your machine — they are read locally and never uploaded.
3. Pick a panel, drag it on the preview to pan its photo, and use zoom and rotate to frame it.
4. Write your caption, pick a style (Sunset, Neon, Mono) and an export size: 1080 × 1080, 1080 × 1350 or 1920 × 1080.
5. Hit **Export PNG**.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Everything runs offline from the static files under `app/` — the only font is DejaVu Sans Bold (freely redistributable), shipped under `app/fonts/`. No Rockstar logo, artwork or font is used anywhere; the look is original layout, lettering and colour.

---

<sub>Entered on [make.fun](https://make.fun/?ref=aan314183&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
