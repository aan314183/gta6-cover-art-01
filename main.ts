/**
 * Vice Cover v3 — make.fun entry builder for gta6-cover-art-01.
 *
 * Running this file assembles the submission bundle:
 *
 *   1. It resolves the repository root from this file's own location and
 *      picks the bundle directory from MAKEFUN_OUTPUT_DIR (the grader
 *      sets it; when it is absent the bundle lands in /output).
 *   2. It wipes that directory and recreates it, so a leftover file from
 *      an earlier run can never sneak into the entry.
 *   3. It copies the offline app (app/) and the screenshots
 *      (screenshots/) into the bundle, and stops immediately if either
 *      source folder is missing or is not a directory.
 *   4. It asks the vendored make.fun library (vendor/makefun-app.ts,
 *      which this file never edits) to build the dossier for the bundle
 *      and writes it as dossier.json.
 *   5. It prints how many files the app holds and how large the dossier
 *      came out.
 *
 * The bundle is deterministic: nothing here stamps a clock reading, a
 * random value, or a machine-specific path into the output, so running
 * this file twice into two fresh directories gives byte-identical
 * results — that is what the grader checks.
 *
 * Node 22 or newer, standard library only, no build step, no install:
 *
 *   MAKEFUN_OUTPUT_DIR=out node main.ts
 *
 * To try the app itself instead, serve it with `node serve.ts` and open
 * http://localhost:8080 in a desktop browser.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The bounty gate's limits, exactly as stated: at most four screenshots
// of 256 KiB each, app/ at most 993 files and 48 MiB in total, no app/
// path over 1000 bytes, and dossier text capped at 160 KiB.
const GATE_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const ROOT = dirname(fileURLToPath(import.meta.url));

function abort(reason) {
  throw new Error(`vice-cover v3 build: ${reason}`);
}

function tallyFiles(folder) {
  let found = 0;
  for (const item of readdirSync(folder, { withFileTypes: true })) {
    const next = join(folder, item.name);
    if (item.isDirectory()) found += tallyFiles(next);
    else if (item.isFile()) found += 1;
  }
  return found;
}

function wipeAndMake(folder) {
  if (existsSync(folder)) rmSync(folder, { recursive: true, force: true });
  mkdirSync(folder, { recursive: true });
}

function copyInto(source, target, what) {
  if (!existsSync(source)) abort(`cannot find the ${what} folder: ${source}`);
  if (!statSync(source).isDirectory()) abort(`${what} is not a folder: ${source}`);
  cpSync(source, target, { recursive: true });
}

function buildBundle() {
  const bundle = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  wipeAndMake(bundle);
  copyInto(join(ROOT, 'app'), join(bundle, 'app'), 'app');
  copyInto(join(ROOT, 'screenshots'), join(bundle, 'screenshots'), 'screenshots');

  const dossierText = buildDossier(bundle, GATE_LIMITS);
  const dossierFile = join(bundle, 'dossier.json');
  writeFileSync(dossierFile, dossierText);

  const appFileCount = tallyFiles(join(bundle, 'app'));
  const dossierSize = statSync(dossierFile).size;
  console.log(`vice-cover v3: bundle written to ${bundle}`);
  console.log(`vice-cover v3: app files in bundle: ${appFileCount}`);
  console.log(`vice-cover v3: dossier.json: ${dossierSize} bytes`);
}

buildBundle();
