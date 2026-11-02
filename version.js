import { execSync } from 'child_process';
import pkg from './package.json' with { type: 'json' };

function getCurrentCommit() {
  const commit = execSync('git rev-parse HEAD').toString().trim();
  return commit;
}

export function getNextVersion() {
  return pkg.exNextVersion;
}

export function getAlphaVersion() {
  let commit = getCurrentCommit();
  let version = getNextVersion();
  if (process.env.GITHUB_RUN_NUMBER) {
    return version + '-alpha.' + process.env.GITHUB_RUN_NUMBER + '+' + commit.substring(0, 7);
  } else {
    return version + '-alpha.0' + '+' + commit.substring(0, 7);
  }
}

export function getReleaseVersion() {
  return pkg.version;
}
