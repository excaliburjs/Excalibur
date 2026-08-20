#!/usr/bin/env node
/**
 * Scaffolds a new manual test page under sandbox/tests/<name>/, links it from
 * sandbox/index.html, and appends a bare entry to the Playwright golden-master manifest
 * (sandbox/tests-e2e/manifest.ts) so it's covered by `npm run test:sandbox` from day one.
 *
 * Usage:
 *   node scripts/new-sandbox-test.js <name> ["Display Title"]
 *   npm run new:sandbox -- <name> ["Display Title"]
 */
const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const [, , rawName, rawTitle] = process.argv;

if (!rawName) {
  fail('missing <name> argument.\n\nUsage: node scripts/new-sandbox-test.js <name> ["Display Title"]');
}

const name = rawName.trim();
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  fail(`"${name}" is not a valid sandbox test name - use lowercase letters, digits, and hyphens (e.g. "my-cool-test").`);
}

const title = (rawTitle && rawTitle.trim()) || name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const repoRoot = path.resolve(__dirname, '..');
const testDir = path.join(repoRoot, 'sandbox', 'tests', name);
const indexHtmlPath = path.join(repoRoot, 'sandbox', 'index.html');
const manifestPath = path.join(repoRoot, 'sandbox', 'tests-e2e', 'manifest.ts');

if (fs.existsSync(testDir)) {
  fail(`sandbox/tests/${name}/ already exists.`);
}

// 1. Scaffold sandbox/tests/<name>/index.html + index.ts
fs.mkdirSync(testDir, { recursive: true });

const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <!-- If this test needs a human to do something to verify it, describe it here - both
         manual testers and the Playwright golden-master suite's manifest.ts read this page. -->
    <script type="module" src="index.js"></script>
  </body>
</html>
`;

const tsContent = `var game = new ex.Engine({
  width: 800,
  height: 600
});

var actor = new ex.Actor({
  pos: ex.vec(400, 300),
  width: 100,
  height: 100,
  color: ex.Color.Red
});
game.add(actor);

game.start();
`;

fs.writeFileSync(path.join(testDir, 'index.html'), htmlContent);
fs.writeFileSync(path.join(testDir, 'index.ts'), tsContent);
console.log(`Created sandbox/tests/${name}/index.html`);
console.log(`Created sandbox/tests/${name}/index.ts`);

// 2. Link it from sandbox/index.html, alphabetically among the other tests/ entries
// (the very first <li> links to html/index.html, the platformer demo - not a tests/ entry,
// left alone).
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const href = `tests/${name}/`;

if (indexHtml.includes(`href="tests/${name}/`) || indexHtml.includes(`href="tests/${name}"`)) {
  console.log(`sandbox/index.html already links tests/${name}/ - leaving it alone.`);
} else {
  const lines = indexHtml.split('\n');
  const ulStart = lines.findIndex((line) => line.trim() === '<ul>');
  const ulEnd = lines.findIndex((line, i) => i > ulStart && line.trim() === '</ul>');
  if (ulStart === -1 || ulEnd === -1) {
    fail('could not find the main <ul>...</ul> list in sandbox/index.html to insert into.');
  }

  const newLine = `      <li><a href="${href}">${title}</a></li>`;
  let insertAt = ulEnd;
  for (let i = ulStart + 1; i < ulEnd; i++) {
    const match = lines[i].match(/href="tests\/([^/"]+)/);
    if (match && match[1].localeCompare(name) > 0) {
      insertAt = i;
      break;
    }
  }
  lines.splice(insertAt, 0, newLine);
  fs.writeFileSync(indexHtmlPath, lines.join('\n'));
  console.log(`Linked tests/${name}/ from sandbox/index.html`);
}

// 3. Append a bare entry to sandbox/tests-e2e/manifest.ts's SANDBOX_CASES array. Appended at
// the end rather than alphabetically inserted - several existing entries span multiple lines
// (custom actions), which makes safely parsing insertion position more trouble than it's
// worth for a scaffolding convenience. Reorder by hand later if you care about the ordering.
const manifest = fs.readFileSync(manifestPath, 'utf8');

if (new RegExp(`dir:\\s*'${name}'`).test(manifest)) {
  console.log(`sandbox/tests-e2e/manifest.ts already has an entry for '${name}' - leaving it alone.`);
} else {
  const closingIndex = manifest.lastIndexOf('];');
  if (closingIndex === -1) {
    fail("could not find the closing '];' of SANDBOX_CASES in manifest.ts to insert into.");
  }
  let before = manifest.slice(0, closingIndex).replace(/\s+$/, '');
  if (!before.endsWith(',')) {
    before += ',';
  }
  const newEntry =
    `\n  // TODO: fill in index.ts above, then check whether this scene needs a scripted action\n` +
    `  // (see other entries in this file for examples), a tolerance override for inherently\n` +
    `  // non-deterministic scenes, or a skip reason if it can't be automated at all.\n` +
    `  { dir: '${name}' }\n`;
  const after = manifest.slice(closingIndex);
  fs.writeFileSync(manifestPath, `${before}${newEntry}${after}`);
  console.log(`Added a manifest entry for '${name}' to sandbox/tests-e2e/manifest.ts`);
}

console.log(`
Next steps:
  1. npm run sandbox, then open http://localhost:5173/tests/${name}/ and build out the scene
  2. Review the new entry in sandbox/tests-e2e/manifest.ts - add an action/tolerance/skip if needed
  3. npm run test:sandbox:update -- --grep "${name} matches golden master"   (bake the baseline)
  4. npm run test:sandbox -- --grep "${name} matches golden master"         (confirm it's stable)
`);
