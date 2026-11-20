# Vice Cover — make your own GTA-style cover art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/aan314183/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/aan314183/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover is a poster maker in the spirit of GTA 6 cover art: drop in your own photos, arrange them across three or four panels — one big hero and the supporting shots — write a bold headline, pick a colour grade, and export a share-ready image. It runs entirely in your browser, offline, with no build step and no account.

## What it does

- **Three or four panels, three layouts each.** The hero-plus-supporters grid is rearranged for every export size, so the same photos work as a square, a portrait, or a wide banner. Switch between 3 and 4 panels whenever you like.
- **Your photos stay yours.** Photos are read locally with FileReader and never uploaded. Up to three photos; one photo can fill every panel, or each panel can show a different one.
- **Frame every shot.** Click a panel to select it, drag it on the preview to pan, then zoom and rotate until the framing is right.
- **Poster lettering.** A headline and a tagline in bold DejaVu Sans Bold, with left/centre/right alignment, adjustable letter-spacing, an adjustable headline outline, and an optional drop shadow with adjustable strength.
- **Five colour grades.** Sunset, Neon, Mono, Dusk, and the new Candy — a loud pink-and-cyan pop.
- **A star badge.** An optional “EST. 2026” star in the top corner of the cover.
- **Panel dividers.** Lines between panels: none, hairline, bold, or dashed.
- **Real export sizes, two file types.** 1080 × 1080, 1080 × 1350, and 1920 × 1080, as PNG or JPEG.

## What's new in v3

- Toggle between **3-panel and 4-panel** covers.
- **Headline alignment** (left / centre / right) plus a **letter-spacing** slider.
- New **Candy** grade (pink/cyan pop).
- Optional **“EST. 2026” star badge** overlay.
- **JPEG export** alongside PNG.

## How to use it

1. Open `app/index.html` in a desktop browser, or serve the app folder:
   ```sh
   node serve.ts
   ```
   then open http://localhost:8080.
2. Add photos from your machine, or click **Load sample photos** to try the two bundled samples.
3. Pick 3 or 4 panels, select a panel, drag it to pan, and set zoom and rotation.
4. Write your headline and tagline, tune the alignment, letter-spacing, outline, shadow, and panel lines, pick a grade, and switch the star badge on if you want it.
5. Choose an export size and file type, then hit **Export PNG** / **Export JPEG**.

## Originality

The layout, lettering, and colours are original. No Rockstar logo, wordmark, artwork, character, or font is used anywhere. The only font is DejaVu Sans Bold (SIL OFL), shipped under `app/fonts/`.

## Files

- `app/` — the whole app: `index.html`, `style.css`, and the modules under `app/src/` (`main.js`, `editor.js`, `panels.js`, `grade.js`, `export.js`, `scenes.js`), plus the bundled font and sample photos.
- `main.ts` — builds the make.fun entry: copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — renders of the real app in headless Chromium.
- `serve.ts` — a tiny static server for local development.

---

<sub>Entered on [make.fun](https://make.fun/?ref=aan314183&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
