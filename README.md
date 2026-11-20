# Vice Cover — make your own GTA-style cover art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/aan314183/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/aan314183/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover is a poster maker in the spirit of GTA 6 cover art: drop in your own photos, arrange them across two to five panels — one big hero and the supporting shots — write a bold headline, pick a colour grade, and export a share-ready image. It runs entirely in your browser, offline, with no build step and no account.

## What it does

- **Two to five panels, a layout for each.** A cinematic 2-panel split, the classic 3- and 4-panel grids, and a 5-panel mosaic — each rearranged for every export size, so the same photos work as a square, a portrait, a wide banner, or a story.
- **One-click presets.** Heist (purple-and-gold, 4 panels, bold lines), Beach (tropical green, 3 panels, portrait), and Night Drive (neon, 2 panels, cinematic) set panels, grade, size, divider, badge and lettering in one click. Tweak anything after.
- **Your photos stay yours.** Photos are read locally with FileReader and never uploaded. Up to three photos; one photo can fill every panel, or each panel can show a different one.
- **Frame every shot.** Click a panel to select it, drag it on the preview to pan, then zoom and rotate until the framing is right. A reset button puts one panel back to its defaults.
- **Light per panel.** Each panel gets its own brightness, contrast and colour-strength sliders, so a dark shot and a bright one can sit side by side without fighting.
- **Poster lettering.** A headline and a tagline in bold DejaVu Sans Bold, with headline size, an ALL CAPS switch, left/centre/right alignment, adjustable letter-spacing, an adjustable headline outline, and an optional drop shadow with adjustable strength.
- **Seven colour grades.** Sunset, Neon, Mono, Dusk, Candy, plus the new Vice (purple night, gold lettering) and Palm (green tropical afternoon).
- **A star badge and film grain.** An optional “EST. 2026” star in the top corner, and an optional deterministic film grain over the finished cover.
- **Panel dividers.** Lines between panels: none, hairline, bold, or dashed.
- **Real export sizes, two file types.** 1080 × 1080, 1080 × 1350, 1920 × 1080, and the new 1080 × 1920 story size, as PNG or JPEG.

## What's new in v4

- **2-panel cinematic** split and **5-panel mosaic** layouts, alongside 3 and 4 panels.
- **One-click presets**: Heist, Beach, Night Drive.
- New grades **Vice** (purple-and-gold) and **Palm** (green tropical).
- **Per-panel light**: brightness, contrast and colour strength for each panel, plus a per-panel reset.
- **Headline size** slider and **ALL CAPS** toggle.
- **Story export size** 1080 × 1920.
- **Film grain** toggle (deterministic, so two exports of the same settings match).
- The entry builder (`main.ts`) now checks the bounty gate's own limits before copying anything.

## How to use it

1. Open `app/index.html` in a desktop browser, or serve the app folder:
   ```sh
   node serve.ts
   ```
   then open http://localhost:8080.
2. Pick a preset, or start from scratch: add photos from your machine, or click **Load sample photos** to try the two bundled samples.
3. Pick 2–5 panels, select a panel, drag it to pan, and set zoom, rotation and light.
4. Write your headline and tagline, tune size, caps, alignment, letter-spacing, outline, shadow, and panel lines, pick a grade, and switch the star badge and grain on if you want them.
5. Choose an export size and file type, then hit **Export PNG** / **Export JPEG**.

## Originality

The layout, lettering, and colours are original. No Rockstar logo, wordmark, artwork, character, or font is used anywhere. The only font is DejaVu Sans Bold (SIL OFL), shipped under `app/fonts/`.

## Files

- `app/` — the whole app: `index.html`, `style.css`, and the modules under `app/src/` (`main.js`, `editor.js`, `panels.js`, `grade.js`, `export.js`, `scenes.js`), plus the bundled font and sample photos.
- `main.ts` — builds the make.fun entry: checks the gate limits, copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — renders of the real app in headless Chromium.
- `serve.ts` — a tiny static server for local development.

---

<sub>Entered on [make.fun](https://make.fun/?ref=aan314183&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
