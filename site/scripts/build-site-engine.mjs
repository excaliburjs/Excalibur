import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDir = path.join(siteRoot, 'static');
const candidates = [
  path.join(siteRoot, '..', 'build', 'dist', 'excalibur.js'),
  path.join(siteRoot, '..', 'build', 'dist', 'excalibur.development.js')
];
const output = path.join(publicDir, 'excalibur.js');
const source = candidates.find((candidate) => fs.existsSync(candidate));

fs.mkdirSync(publicDir, { recursive: true });

if (!source) {
  console.warn('No built Excalibur browser bundle found. Run `npm run build` at the repository root before building live examples.');
  fs.writeFileSync(output, '/* Excalibur bundle not found. Build the engine before publishing the docs. */\n');
  process.exit(0);
}

fs.copyFileSync(source, output);
console.log(`Copied ${path.relative(siteRoot, source)} to ${path.relative(siteRoot, output)}.`);
