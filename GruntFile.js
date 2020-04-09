/*********************************
/* Excalibur.js Grunt Build File
/*********************************/
const version = require('./version');

/*global module:false*/
module.exports = function (grunt) {
  //
  // Project configuration
  //
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: version,

    //
    // Distribution repository build control
    //
    buildcontrol: {
      options: {
        dir: 'build',
        commit: true,
        push: true,
        message: ':shipit: Built excaliburjs/Excalibur@%sourceCommit% on branch %sourceBranch%',
        config: {
          'user.name': 'Travis-CI',
          'user.email': 'travis@excaliburjs.com'
        }
      },

      // continuous integration dists
      dist: {
        options: {
          branch: 'master',
          remote: 'https://github.com/excaliburjs/excalibur-dist',
          login: 'kamranayub',
          token: process.env.GH_DIST_TOKEN,
          fetchProgress: false
        }
      }
    },

    //
    // Package.json version bumper
    //
    bumpup: {
      setters: {
        // Overrides version setter
        version: function (old, releaseType, options) {
          return version;
        }
      },
      files: ['build/package.json']
    }
  });

  //
  // Load NPM Grunt tasks as dependencies
  //
  grunt.loadNpmTasks('grunt-build-control');
  grunt.loadNpmTasks('grunt-bumpup');

  //
  // Register available Grunt tasks
  //

  // CI task to deploy dists
  grunt.registerTask('dists', ['bumpup', 'buildcontrol']);
};
