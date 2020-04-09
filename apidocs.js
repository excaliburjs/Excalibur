const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const rimraf = require('rimraf');
const TYPEDOC_CMD = path.join('node_modules', '.bin', 'typedoc');

// allow specifying ts doc page title (typically version)
const title = process.argv[2] || 'Edge';

console.log('Build API documentation: ', title);
console.log('Removing existing docs...');

rimraf.sync('docs/api/');

console.log('Compiling default template (default)...');
try {
  if (!fs.existsSync('./typedoc-default-themes/node_modules')) {
    child_process.execSync('npm install', {
      cwd: './typedoc-default-themes',
      stdio: [0, 1, 2]
    });
  }
} catch (e) {
  // fails to execute Linux commands, OK
}

console.log('Executing typedoc...');

child_process.execSync(
  TYPEDOC_CMD +
    ' --name "Excalibur.js ' +
    title +
    ' API Documentation"' +
    ' --target es5' +
    ' --experimentalDecorators' +
    ' --mode modules' +
    ' --readme src/engine/Docs/Index.md' +
    ' --includes src/engine/Docs' +
    ' --out docs/api' +
    ' --theme typedoc-default-themes/bin/default' +
    ' --hideGenerator' +
    ' --excludePrivate' +
    ' --listInvalidSymbolLinks' +
    ' --gaID UA-46390208-1' +
    ' --gaSite excaliburjs.com' +
    ' --tsconfig src/engine/tsconfig.json' +
    ' src/engine',
  {
    stdio: [0, 1, 2]
  }
);
