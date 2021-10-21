const replace = require('replace-in-file');
const version = require('../version').getCiVersion();
const options = {
  files: 'build/dist/index.js',
  from: /process\.env\.__EX_VERSION/g,
  to: `'${version}'`
};

try {
  replace.sync(options);
} catch (e) {
  console.error(e);
}