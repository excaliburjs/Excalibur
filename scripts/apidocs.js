const path = require('path');
const child_process = require('child_process');
const rimraf = require('rimraf');
const TYPEDOC_CMD = path.join('node_modules', '.bin', 'typedoc');

// allow specifying ts doc page title (typically version)
const title = process.argv[2] || 'Edge';

console.log('Build API documentation: ', title);
console.log('Removing existing docs...');

rimraf.sync('docs/api/');

console.log('Executing typedoc...');

child_process.execSync(
  TYPEDOC_CMD +
    ' --name "Excalibur.js ' +
    title +
    ' API Documentation"' +
    ' --out docs/api' +
    ' --hideGenerator' +
    ' --excludePrivate' +
    ' --gaID UA-46390208-1' +
    ' --tsconfig src/engine/tsconfig.json' +
    ' src/engine/index.ts',
  {
    stdio: [0, 1, 2]
  }
);
