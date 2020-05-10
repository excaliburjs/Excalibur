const { execSync } = require('child_process');
const readline = require('readline');
const semver = require('semver');
const { getLatestVersion } = require('./version');

function generatePatchVersion() {
  let version = getLatestVersion();
  version = semver.inc(version, 'patch');
  return version;
}
const currentVersion = getLatestVersion();
const version = generatePatchVersion();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(theQuestion) {
  return new Promise((resolve) => rl.question(theQuestion, (answ) => resolve(answ.toLowerCase().includes('y'))));
}

async function main() {
  let answer = false;
  answer = await question(`Creating an excalibur release at version [v${version}]? (y/n):`);
  if (answer) {
    console.log(`Cleaning dist 🧹`);
    console.log(execSync(`npm run clean`).toString());
    console.log(`Cloning dist repo 🤖`);
    console.log(execSync(`git clone https://github.com/excaliburjs/excalibur-dist build`).toString());

    console.log(`Rebuilding with version v${version} 🔨`);
    process.env.GH_TOKEN = `v${version}`;
    process.env.TRAVIS_TAG = `v${version}`;
    process.env.TRAVIS_BUILD_NUMBER = `v${version}`;
    console.log(execSync(`npm run core && npm run core:bundle-prod`).toString());
    console.log(`Zipping dists 🤐`);
    console.log(execSync(`powershell -noprofile "Compress-Archive -Force ./build/dist ./build/dist.${version}.zip"`).toString());
    console.log(`Building nuget package 📦`);
    console.log(execSync(`npm run nuget ${version}`).toString());

    console.log(`Preparing the release notes for Excalibur 📝⚔`);
    console.log(execSync(`git log v${currentVersion}..HEAD --oneline --pretty=format:%s --graph > changes.txt`));
    console.log(execSync(`echo Excalibur v${version} Release > title.txt`));
    console.log(execSync(`type title.txt .\\assets\\release.md changes.txt > pending-release.md`));
    console.log(execSync(`type .\\pending-release.md`).toString());
    console.log(`Updating package.json to ${version} 😘`);
    console.log(execSync(`npm --no-git-tag-version version ${version}`).toString());
    console.log('Committing updates ✅');
    console.log(execSync(`git add package.json`).toString());
    console.log(execSync(`git commit -nm "[chore] Release excalibur@v${version}"`).toString());

    console.log('Creating releases 🤞');
    const releaseUrl = execSync(
      [
        'hub release create -d',
        '--file ./pending-release.md',
        '--attach ./build/dist/excalibur.js',
        '--attach ./build/dist/excalibur.d.ts',
        '--attach ./build/dist/excalibur.min.js',
        '--attach ./build/dist/excalibur.min.js.map',
        `--attach ./build/dist/Excalibur.${version}.nupkg`,
        `--attach ./build/dist.${version}.zip`,
        `v${version}`
      ].join(' ')
    ).toString();
    console.log(releaseUrl);
    console.log(execSync(`"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" ${releaseUrl}`));

    const releaseUrlDist = execSync(
      [
        'cd ./build && ',
        'hub release create -d',
        '--file ../pending-release.md',
        '--attach ./dist/excalibur.js',
        '--attach ./dist/excalibur.d.ts',
        '--attach ./dist/excalibur.min.js',
        '--attach ./dist/excalibur.min.js.map',
        `--attach ./dist/Excalibur.${version}.nupkg`,
        `--attach ./dist.${version}.zip`,
        `v${version}`
      ].join(' ')
    ).toString();
    console.log(releaseUrlDist);
    console.log(execSync(`"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" ${releaseUrlDist}`));
  } else {
    console.log('Abort!');
    rl.close();
    return;
  }

  answer = await question('Push the updated package.json? (y/n)');
  if (answer) {
    console.log(execSync(`git push`).toString());
  } else {
    console.log('Abort!');
    rl.close();
    return;
  }

  answer = await question('Publish the nuget package? (y/n)');
  if (answer) {
    console.log(
      execSync(
        `.\\src\\tools\\NuGet.exe push ./build/dist/Excalibur.${version}.nupkg -Source https://api.nuget.org/v3/index.json`
      ).toString()
    );
  } else {
    console.log('Abort!');
    rl.close();
    return;
  }

  answer = await question('Clean working directory? (y/n)');
  if (answer) {
    console.log(execSync(`git clean -f`).toString());
  } else {
    console.log('Abort!');
    rl.close();
    return;
  }
}

main();
