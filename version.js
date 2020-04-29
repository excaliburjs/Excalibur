const { execSync } = require('child_process');
const semver = require('semver');

function getCiOptions() {
  return {
    ghToken: process.env.GH_TOKEN || undefined,
    appveyorBuild: process.env.APPVEYOR_BUILD_NUMBER || '',
    travisBuild: process.env.TRAVIS_BUILD_NUMBER || '',
    commit: process.env.TRAVIS_COMMIT || '',
    travisPr: process.env.TRAVIS_PULL_REQUEST || 'false',
    travisTag: process.env.TRAVIS_TAG || '',
    fork: process.env.TRAVIS_REPO_SLUG
  };
}

function getCurrentCommit() {
  const commit = execSync('git rev-parse HEAD').toString().trim();
  return commit;
}

function getLatestTag(commit) {
  execSync('git fetch');
  const tag = execSync(`git describe --tags ${commit} --abbrev=0`).toString().trim();
  return tag;
}

function getLatestVersion() {
  const commit = getCurrentCommit();
  const tag = getLatestTag(commit);
  return tag.match(/^v?([0-9\.]+)$/)[1];
}

function isTaggedRelease(options) {
  return !!options.travisTag;
}

function isLocal(options) {
  return !options.appveyorBuild && !options.travisBuild;
}

function isPr(options) {
  return !options.ghToken && options.travisPr !== 'false';
}

function isFork(options) {
  return !options.ghToken && options.fork !== 'excaliburjs/Excalibur';
}

function generateLocalVersion() {
  let version = 'local';
  try {
    execSync('git fetch');
    const commit = getCurrentCommit();
    version = getLatestVersion();
    version = semver.inc(version, 'minor');
    version = version + '-' + commit.substring(0, 7);
  } catch (err) {
    console.error(err);
  }
  return version;
}

function generateTaggedVersion(options) {
  const version = options.travisTag.match(/^v?([0-9\.]+)$/)[1];
  return version;
}

function generateCommunityVersion(options) {
  if (isPr(options)) {
    return 'pr-' + options.travisPr;
  }
  if (isFork(options)) {
    return 'fork-' + options.fork;
  }
  throw Error('Invalid community version');
}

function generateAlphaVersion(options) {
  let commit = getCurrentCommit();
  let version = getLatestVersion();
  // Alpha builds target next projected release pre 1.0
  version = semver.inc(version, 'minor');

  // Nuget doesn't yet support the + suffix in versions
  const appveyVersion = version + '.' + options.appveyorBuild + '-alpha';
  const travisVersion = version + '-alpha.' + options.travisBuild + '+' + commit.substring(0, 7);

  if (options.appveyorBuild) {
    return appveyVersion;
  } else {
    return travisVersion;
  }
}

function getCiVersion(ciOptions, log = true) {
  if (!ciOptions) {
    ciOptions = getCiOptions();
  }
  let version = 'unknown';
  if (isLocal(ciOptions)) {
    version = generateLocalVersion(ciOptions);
    log ? console.log('[local]: ' + version) : null;
  } else if (isPr(ciOptions) || isFork(ciOptions)) {
    version = generateCommunityVersion(ciOptions);
    log ? console.log('[community]: ' + version) : null;
  } else if (isTaggedRelease(ciOptions)) {
    version = generateTaggedVersion(ciOptions);
    log ? console.log('[release]: ' + version) : null;
  } else {
    // Else alpha version
    version = generateAlphaVersion(ciOptions);
    log ? console.log('[alpha]: ' + version) : null;
  }
  return version;
}

exports.getCiOptions = getCiOptions;
exports.getCurrentCommit = getCurrentCommit;
exports.getLatestTag = getLatestTag;
exports.getLatestVersion = getLatestVersion;
exports.isTaggedRelease = isTaggedRelease;
exports.isLocal = isLocal;
exports.isFork = isFork;
exports.isPr = isPr;
exports.generateLocalVersion = generateLocalVersion;
exports.generateTaggedVersion = generateTaggedVersion;
exports.generateAlphaVersion = generateAlphaVersion;
exports.generateCommunityVersion = generateCommunityVersion;
exports.getCiVersion = getCiVersion;

// good enough assertions
function assertContains(actual, value, message) {
  if (!actual.includes(value)) {
    throw Error(`Assertion failed for ${message}`);
  }
}

const local = getCiVersion({}, false);
assertContains(local, '-', 'local version');

const pr = getCiVersion({ travisPr: 'somepr', travisBuild: 'somebuild' }, false);
assertContains(pr, 'pr-', 'pr version');

const fork = getCiVersion({ fork: 'somefork', travisPr: 'false', travisBuild: 'somebuild' }, false);
assertContains(fork, 'fork-', 'fork version');

const tagged = getCiVersion({ travisTag: 'v0.0.1', ghToken: 'sometoken', travisBuild: 'somebuild' }, false);
assertContains(tagged, '0.0.1', 'tagged version');

const alpha = getCiVersion({ travisBuild: 'somebuild', ghToken: 'sometoken' }, false);
assertContains(alpha, '-alpha.', 'alpha version');
