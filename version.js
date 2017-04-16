const request       = require('request');
const appveyorBuild = process.env.APPVEYOR_BUILD_NUMBER || '';
const travisBuild   = process.env.TRAVIS_BUILD_NUMBER   || '';
const commit        = process.env.TRAVIS_COMMIT         || '';

// ignore local builds
if (!appveyorBuild && !travisBuild) {
   console.info('Local build, using version "local"');
   module.exports = 'local';
   return;
}

// Fetch latest GH release tag version
request({
   uri: 'https://api.github.com/repos/excaliburjs/Excalibur/releases/latest',
   headers: { 'User-Agent': 'excaliburjs/0.1' }
}, function (error, res, body) {
   const statusCode = res.statusCode;

   if (statusCode !== 200) {
      console.error('Error fetching GH release version:', statusCode, error);
      throw Error('Fatal error fetching GH release version:' + error);
   }

   const tag_name = JSON.parse(body).tag_name;
   const version  = tag_name.match(/^v?([0-9\.]+)$/)[1]; // strip v prefix
 
   // Nuget doesn't yet support the + suffix in versions
   const appveyVersion = version + '.' + appveyorBuild + '-alpha';   
   const travisVersion = version + '-alpha.' + build + '+' + commit.substring(0, 7);

   if (appveyorBuild) {
      console.info('Using Appveyor build as version', appveyVersion);
      module.exports = appveyVersion;
   } else {
      console.info('Using Travis build as version', travisVersion);
      module.exports = travisVersion;
   }

});