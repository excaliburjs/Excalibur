var Travis = require('travis-ci');
var child_process = require('child_process');
var repo = "excaliburjs/excaliburjs.github.io";
var travis = new Travis({
	version: '2.0.0'
});

var branch = process.env.TRAVIS_BRANCH;

if (branch !== "master") {
   console.log("Current branch is `" + branch + "`, skipping docs deployment...");
} else {
   console.log("Current branch is `" + branch + "`, triggering remote build of edge docs...");
   
   travis.authenticate({
      github_token: process.env.GH_TOKEN
   }, function (err, res) {
      if (err) {
      return console.error(err);
      }
   
      travis.repos(repo.split('/')[0], repo.split('/')[1]).builds.get(
      function (err, res) {
         if (err) {
            return console.error(err);
         }
   
         travis.requests.post({
            build_id: res.builds[0].id
         }, function (err, res) {
            if (err) {
               return console.error(err);
            }
            console.log(res.flash[0].notice);
         });
      });
   });
}