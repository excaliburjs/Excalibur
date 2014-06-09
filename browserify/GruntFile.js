/*********************************
/* Excalibur.js Grunt Build File
/*********************************/

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({          

      //
      // Shell Commands
      //
      shell: {

         //
         // Execute Browserify Bundle
         //
         bundle: {
            command: 'browserify main.js -o bundle.js',               
            options: {
               stdout: true,
               failOnError: true
            }
         },
      }

     
   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-shell');

   //
   // Register available Grunt tasks
   //
   // Default task - compile, test, build dists
   grunt.registerTask('default', ['shell:bundle']);
};