/*********************************
/* Excalibur.js Grunt Build File
/*********************************/

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      //
      // Configure jasmine-node to run Jasmine specs
      //
      jasmine_node: {
         specNameMatcher: "Spec", // load only specs containing specNameMatcher
         projectRoot: "./spec",
         requirejs: false,
         forceExit: true,
         jUnit: {
            report: false,
            savePath: "./build/reports/jasmine/",
            useDotNotation: true,
            consolidate: true
         }
      },

      //
      // Concatenate build files
      // Add banner to files
      //
      concat: {
         main: {
            src: ['build/<%= pkg.name %>-<%= pkg.version %>.js'],
            dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js'
         },
         minified: {
            src: ['build/<%= pkg.name %>-<%= pkg.version %>.min.js'],
            dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
         },
         options: {
            separator: '\n;\n',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                    ' Licensed <%= pkg.licenses[0].type%>*/\n'
         }
      },

      //
      // Minify files
      //
      minified: {
         files: {
            src: 'build/<%= pkg.name %>-<%= pkg.version %>.js',
            dest: 'build/<%= pkg.name %>-<%= pkg.version %>'
         },
         options: {
            sourcemap: false,
            allinone: true,
            dest_filename: '.min.js'
         }
      },

      //
      // Shell Commands
      //
      shell: {

         //
         // Execute TypeScript compiler against Excalibur core
         //
         tsc: {
            command: 'tsc --sourcemap --removeComments --declaration "./ts/Core.ts" -out "./build/<%= pkg.name %>-<%= pkg.version %>.js"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Package up Nuget (Windows only)
         //
         nuget: {
            command: 'tools\\nuget pack Excalibur.nuspec -version <%= pkg.version %> -OutputDirectory ./build',
            options: {
               stdout: true
            }
         },

         //
         // TypeScript Compile Jasmine specs
         // TODO: Simplify this so we don't have to always update it every time we add a spec
         //
         specs: {
            command: 'tsc "./spec/ActorSpec.ts" -out "./spec/ActorSpec.js";' +
            'tsc "./spec/ColorSpec.ts" -out "./spec/ColorSpec.js";' +
            'tsc "./spec/PromiseSpec.ts" -out "./spec/PromiseSpec.js";' +
            'tsc "./spec/CollectionSpec.ts" -out "./spec/CollectionSpec.js";' +
            'tsc "./spec/LogSpec.ts" -out "./spec/LogSpec.js";' + 
            'tsc "./spec/TimerSpec.ts" -out "./spec/TimerSpec.js"',
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // TypeScript Compile sample game
         //
         sample: {
            command: 'tsc ./sample-game/ts/game.ts',
            options: {
               stdout: true,
               failOnError: true
            }
         }
      },

      //
      // Copy Files for sample game
      //
      copy: {
         main: {
            files: [
               {src: './build/<%= pkg.name %>-<%= pkg.version %>.js', dest: './build/<%= pkg.name %>.js'},
               {src: './build/<%= pkg.name %>-<%= pkg.version %>.d.ts', dest: './build/<%= pkg.name %>.d.ts'}
            ]
         }
      },



      //
      // Watch the source dirs and run shell tasks (re-compile) if they change
      //
      watch: {
         files: '<config:source.files>',
         tasks: 'shell'
      },

      //
      // UglifyJS configuration
      //
      uglify: {}
   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-shell');
   grunt.loadNpmTasks('grunt-minified');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-jasmine-node');

   //
   // Register available Grunt tasks
   //

   // Run tests
   grunt.registerTask('tests', ['shell:specs', 'jasmine_node']);

   // Compile sample game
   grunt.registerTask('sample', ['copy', 'shell:sample']);

   // Default task - compile, test, build dists
   grunt.registerTask('default', ['tests', 'shell:tsc', 'sample', 'minified', 'concat', 'shell:nuget']);

   // Travis task - for Travis CI
   grunt.registerTask('travis', 'default');

};