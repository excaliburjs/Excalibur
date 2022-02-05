const replace = require('replace-in-file');
const versioner = require('../version');
let version = versioner.getAlphaVersion();
if (process.env.release) {
  version = versioner.getReleaseVersion();
}
console.log('Replacing __EX_VERSION with:', version);
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