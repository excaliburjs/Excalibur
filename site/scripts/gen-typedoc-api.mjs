import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { normalizeTypedoc } from './lib/typedoc-normalize.mjs';

const siteRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const generatedDir = path.join(siteRoot, 'generated');
const typedocJsonPath = path.join(generatedDir, 'typedoc.json');
const apiDataPath = path.join(generatedDir, 'api-data.json');
const symbolIndexPath = path.join(generatedDir, 'api-symbol-index.json');
const typedocBin = path.join(siteRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'typedoc.cmd' : 'typedoc');

fs.mkdirSync(generatedDir, { recursive: true });

if (!fs.existsSync(typedocBin)) {
  writeEmptyApiData();
  console.warn(`TypeDoc binary not found at ${typedocBin}. Wrote empty API data; run npm install in site/.`);
  process.exit(0);
}

const result = spawnSync(
  typedocBin,
  [
    '--json',
    typedocJsonPath,
    '--name',
    'Excalibur.js API Documentation',
    '--excludePrivate',
    '--validation.notExported',
    'false',
    '--tsconfig',
    path.join(siteRoot, '..', 'src', 'engine', 'tsconfig.json'),
    path.join(siteRoot, '..', 'src', 'engine', 'index.ts')
  ],
  {
    cwd: siteRoot,
    stdio: 'inherit'
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const project = JSON.parse(fs.readFileSync(typedocJsonPath, 'utf8'));
const apiData = normalizeTypedoc(project);

fs.writeFileSync(apiDataPath, `${JSON.stringify(apiData, null, 2)}\n`);
fs.writeFileSync(symbolIndexPath, `${JSON.stringify({ generatedAt: apiData.generatedAt, symbols: apiData.symbols }, null, 2)}\n`);

console.log(`Generated ${apiData.pages.length} API pages and ${Object.keys(apiData.symbols).length} API symbol links.`);

function writeEmptyApiData() {
  const empty = {
    generatedAt: new Date().toISOString(),
    pages: [],
    rootSymbols: [],
    symbols: {}
  };

  fs.writeFileSync(apiDataPath, `${JSON.stringify(empty, null, 2)}\n`);
  fs.writeFileSync(symbolIndexPath, `${JSON.stringify({ generatedAt: empty.generatedAt, symbols: {} }, null, 2)}\n`);
}
