const { execSync } = require('child_process');
const package = require('./package.json');

function getCurrentCommit() {
  const commit = execSync('git rev-parse HEAD').toString().trim();
  return commit;
}

function getNextVersion() {
  return package.exNextVersion;
}

function getAlphaVersion() {
  let commit = getCurrentCommit();
  let version = getNextVersion();
  if (process.env.GITHUB_RUN_NUMBER) {
    return version + '-alpha.' + process.env.GITHUB_RUN_NUMBER + '+' + commit.substring(0, 7);
  } else {
    return version + '-alpha.0' + '+' + commit.substring(0, 7);
  }
}

function getReleaseVersion() {
  return package.version;
}

module.exports = {
  getAlphaVersion: getAlphaVersion,
  getReleaseVersion: getReleaseVersion
};
