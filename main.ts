/**
 * Vice Cover v2 — make.fun entry builder for the gta6-cover-art-01 bounty.
 *
 * What this program does, in order:
 *   1. Works out where it is running from (this repository) and where the
 *      entry must land (MAKEFUN_OUTPUT_DIR, or /output when that is unset,
 *      which is what the grader uses).
 *   2. Empties that destination first, so a stale file from an earlier run
 *      can never leak into the entry, then recreates it empty.
 *   3. Copies the offline app (app/) and the screenshots (screenshots/)
 *      into it, and refuses to continue when either source is missing.
 *   4. Asks the vendored make.fun library (vendor/makefun-app.ts, never
 *      edited here) to build the dossier for the finished directory and
 *      writes it as dossier.json.
 *   5. Prints a short summary: how many app files were copied and how
 *      big the dossier came out.
 *
 * The output is deterministic: the grader runs this file twice into two
 * fresh directories and expects byte-identical results, which is why the
 * destination is cleared before copying and nothing here stamps a time,
 * a random value, or a machine-specific path into the output.
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

// The gate's caps, exactly as the bounty states them: at most four
// screenshots of 256 KiB each, app/ at most 993 files and 48 MiB in all,
// no app/ path over 1000 bytes, and dossier text capped at 160 KiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function fail(message) {
  throw new Error(`vice-cover build: ${message}`);
}

function countFiles(root) {
  let total = 0;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) total += countFiles(path);
    else if (entry.isFile()) total += 1;
  }
  return total;
}

function prepareDestination(destination) {
  if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
}

function copyTree(from, to, label) {
  if (!existsSync(from)) fail(`missing ${label} directory: ${from}`);
  if (!statSync(from).isDirectory()) fail(`${label} is not a directory: ${from}`);
  cpSync(from, to, { recursive: true });
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  prepareDestination(destination);
  copyTree(join(here, 'app'), join(destination, 'app'), 'app');
  copyTree(join(here, 'screenshots'), join(destination, 'screenshots'), 'screenshots');

  const dossier = buildDossier(destination, DOSSIER_CAPS);
  const dossierPath = join(destination, 'dossier.json');
  writeFileSync(dossierPath, dossier);

  const appFiles = countFiles(join(destination, 'app'));
  const dossierBytes = statSync(dossierPath).size;
  console.log(`vice-cover: wrote ${destination}`);
  console.log(`vice-cover: app files copied: ${appFiles}`);
  console.log(`vice-cover: dossier.json: ${dossierBytes} bytes`);
}

main();
