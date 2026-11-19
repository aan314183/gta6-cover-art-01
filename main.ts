// Vice Cover — entrypoint for make.fun's gta6-cover-art-01 bounty.
// Runs on Node 22 with the standard library only. It takes the app in this
// repository (app/, plain static files that run offline in a desktop browser)
// and the screenshots/ folder, copies both into the output directory, and
// writes dossier.json there with the vendored make.fun library's buildDossier.
// The grader runs this program twice into two fresh output directories and
// expects both runs to write identical bytes.
//
// Local use: serve the app with `node serve.ts` (http://localhost:8080), or
// hand it in with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps matching the gate: at most 4 screenshots of 256 KiB each, app/ at most
// 993 files and 48 MiB in all, no app/ path over 1000 bytes, and the dossier
// text capped at 160 KiB so the whole output stays under its own limits.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
