const { execSync } = require('child_process');
const readline = require('readline');
const semver = require('semver');
const { getLatestVersion } = require('./version');

function generatePatchVersion() {
  let version = getLatestVersion();
  version = semver.inc(version, 'patch');
  return version;
}

const version = generatePatchVersion();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Creating an excalibur release at version [v${version}] Shall we proceed and update the origin? (y/n): `, (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log(`Preparing the release for Excalibur ⚔`);
    console.log(`Updating package.json to ${version}`);
    console.log(execSync(`npm --no-git-tag-version version ${version}`).toString());
    console.log('Committing updates ✅');
    console.log(execSync(`git add package.json`).toString());
    console.log(execSync(`git commit -nm "[chore] Release excalibur@v${version}`).toString());
    console.log('Tagging version 😍');
    console.log(execSync(`git tag -a v${version} -m v${version}`).toString());
    console.log('Pushing update to origin');
    console.log(execSync(`git push`).toString());
  } else {
    console.log('Aborted!');
  }
  rl.close();
});
