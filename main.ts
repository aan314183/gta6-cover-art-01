/**
 * Vice Cover v4 — make.fun entry builder for gta6-cover-art-01.
 *
 * Running this file assembles the submission bundle, in four steps:
 *
 *   1. It resolves the repository root from this file's own location and
 *      picks the bundle directory from MAKEFUN_OUTPUT_DIR (the grader
 *      sets it; when it is absent the bundle lands in /output).
 *   2. It wipes that directory and recreates it, so a leftover file from
 *      an earlier run can never sneak into the entry.
 *   3. It copies the offline app (app/) and the screenshots
 *      (screenshots/) into the bundle, refusing to continue if either
 *      source folder is missing or is not a directory.
 *   4. It asks the vendored make.fun library (vendor/makefun-app.ts,
 *      which this file never edits) to build the dossier for the bundle
 *      and writes it as dossier.json, then reports the file counts and
 *      the dossier size.
 *
 * Before copying, it checks the bundle against the bounty gate's own
 * limits — at most four screenshots of 256 KiB each, app/ at most 993
 * files and 48 MiB in total, no app/ path over 1000 bytes, and dossier
 * text capped at 160 KiB — so a bundle that cannot pass never leaves
 * this machine looking like it can.
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

// The bounty gate's limits, exactly as stated in the kit's RULES.txt.
const GATE_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const ROOT = dirname(fileURLToPath(import.meta.url));

function abort(reason) {
  throw new Error(`vice-cover v4 build: ${reason}`);
}

function walkFiles(folder, out) {
  for (const item of readdirSync(folder, { withFileTypes: true })) {
    const next = join(folder, item.name);
    if (item.isDirectory()) walkFiles(next, out);
    else if (item.isFile()) out.push(next);
  }
  return out;
}

function checkGateLimits(appFolder, shotsFolder) {
  const appFiles = walkFiles(appFolder, []);
  if (appFiles.length > GATE_LIMITS.app_max_files) {
    abort(`app/ holds ${appFiles.length} files, over the ${GATE_LIMITS.app_max_files} limit`);
  }
  let appBytes = 0;
  for (const file of appFiles) {
    const size = statSync(file).size;
    appBytes += size;
    if (Buffer.byteLength(file, 'utf8') > GATE_LIMITS.app_path_max_bytes) {
      abort(`app/ path over the limit: ${file}`);
    }
  }
  if (appBytes > GATE_LIMITS.app_max_bytes) {
    abort(`app/ is ${appBytes} bytes, over the ${GATE_LIMITS.app_max_bytes} limit`);
  }
  const shots = readdirSync(shotsFolder).filter((name) => !name.startsWith('.'));
  if (shots.length > GATE_LIMITS.screenshots.max) {
    abort(`${shots.length} screenshots, over the ${GATE_LIMITS.screenshots.max} limit`);
  }
  for (const name of shots) {
    const size = statSync(join(shotsFolder, name)).size;
    if (size > GATE_LIMITS.screenshots.max_bytes) {
      abort(`screenshot ${name} is ${size} bytes, over the ${GATE_LIMITS.screenshots.max_bytes} limit`);
    }
  }
  return { appFiles: appFiles.length, appBytes, shots: shots.length };
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
  const appFolder = join(ROOT, 'app');
  const shotsFolder = join(ROOT, 'screenshots');

  const counts = checkGateLimits(appFolder, shotsFolder);
  wipeAndMake(bundle);
  copyInto(appFolder, join(bundle, 'app'), 'app');
  copyInto(shotsFolder, join(bundle, 'screenshots'), 'screenshots');

  const dossierText = buildDossier(bundle, GATE_LIMITS);
  const dossierFile = join(bundle, 'dossier.json');
  writeFileSync(dossierFile, dossierText);

  const dossierSize = statSync(dossierFile).size;
  console.log(`vice-cover v4: bundle written to ${bundle}`);
  console.log(`vice-cover v4: app files in bundle: ${counts.appFiles} (${counts.appBytes} bytes)`);
  console.log(`vice-cover v4: screenshots in bundle: ${counts.shots}`);
  console.log(`vice-cover v4: dossier.json: ${dossierSize} bytes`);
}

buildBundle();
