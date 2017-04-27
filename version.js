const request       = require('sync-request');
const appveyorBuild = process.env.APPVEYOR_BUILD_NUMBER || '';
const travisBuild   = process.env.TRAVIS_BUILD_NUMBER   || '';
const commit        = process.env.TRAVIS_COMMIT         || '';
const travisPr      = process.env.TRAVIS_PULL_REQUEST   || false;

// ignore local builds
if (!appveyorBuild && !travisBuild) {
   console.info('Local build, using version "local"');
   module.exports = 'local';
   return;
}

// ignore community PR builds
if (!process.env.GH_TOKEN && travisPr !== false) {
   console.info('Travis PR build, using version', 'pr-' + travisPr);
   module.exports = 'pr-' + travisPr;
   return;
}

// fail build if no GH_TOKEN present
if (!process.env.GH_TOKEN) {
   throw Error('Missing environment variable GH_TOKEN');
}

// Fetch latest GH release tag version
var res = request('GET', 'https://api.github.com/repos/excaliburjs/Excalibur/releases/latest', {
   headers: { 
      'User-Agent': 'excaliburjs/0.1',
      'Authorization': 'token ' + process.env.GH_TOKEN
   }
});

const statusCode = res.statusCode;

if (statusCode !== 200) {
   throw Error('Fatal error fetching GH release version, status: ' + statusCode);
}

const tag_name = JSON.parse(res.getBody()).tag_name;
const version  = tag_name.match(/^v?([0-9\.]+)$/)[1]; // strip v prefix

// Nuget doesn't yet support the + suffix in versions
const appveyVersion = version + '.' + appveyorBuild + '-alpha';   
const travisVersion = version + '-alpha.' + travisBuild + '+' + commit.substring(0, 7);

if (appveyorBuild) {
   console.info('Using Appveyor build as version', appveyVersion);
   module.exports = appveyVersion;
} else {
   console.info('Using Travis build as version', travisVersion);
   module.exports = travisVersion;
}
