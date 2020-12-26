var Travis = require('travis-ci');
var repo = 'excaliburjs/excaliburjs.github.io';
var travis = new Travis({
  version: '2.0.0',
  headers: {
    'User-Agent': 'Travis/1.0'
  },
  pro: true
});

var branch = process.env.TRAVIS_BRANCH;
var tag = process.env.TRAVIS_TAG;
var pr = process.env.TRAVIS_PULL_REQUEST;

if (pr !== 'false') {
  console.log('Skipping docs deployment, detected pull request');
  return;
}

// build docs for tags and main only
if (tag) {
  console.log('Current tag is `' + tag + '`');
} else if (branch == 'main') {
  console.log('Current branch is `' + branch + '`');
} else {
  console.log('Current branch is `' + branch + '`, skipping docs deployment...');
  return;
}

console.log('Triggering remote build of edge docs...');

travis.authenticate(
  {
    github_token: process.env.GH_TOKEN
  },
  function (err, res) {
    if (err) {
      return console.error(err);
    }

    travis.repos(repo.split('/')[0], repo.split('/')[1]).builds.get(function (err, res) {
      if (err) {
        return console.error(err);
      }

      travis.requests.post(
        {
          build_id: res.builds[0].id
        },
        function (err, res) {
          if (err) {
            return console.error(err);
          }
          console.log(res.flash[0].notice);
        }
      );
    });
  }
);
