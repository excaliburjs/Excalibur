/*********************************
/* Excalibur.js Grunt Build File
/*********************************/
var path = require('path');

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      version: process.env.APPVEYOR_BUILD_VERSION || '<%= pkg.version %>',
      tscCmd: path.join('node_modules', '.bin', 'tsc'),
      jasmineCmd: path.join('node_modules', '.bin', 'jasmine'),
      jasmineConfig: path.join('src', 'spec', 'support', 'jasmine.json'),
      istanbulCmd: path.join('node_modules', '.bin', 'istanbul'),
      jasmineJs: path.join('node_modules', 'jasmine', 'bin', 'jasmine.js'),
      
      //
      // Clean dists
      //
      clean: ['build/dist'],

      //
      // Concatenate build files
      // Add banner to files
      //
      concat: {
         main: {
            src: ['build/dist/<%= pkg.name %>.js', 'src/engine/Exports.js'],
            dest: 'build/dist/<%= pkg.name %>.js'
         },
         minified: {
            src: ['build/dist/<%= pkg.name %>.min.js', 'src/engine/Exports.js'],
            dest: 'build/dist/<%= pkg.name %>.min.js'
         },
         options: {
            separator: '\n;\n',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> Excalibur.js <<%= pkg.author %>>;' +
                    ' Licensed <%= pkg.license %>*/\n' +
                    'var EX_VERSION = "<%= version %>";\n'
         }
      },

      //
      // Minify files
      //
      uglify: {
         options: {
            sourceMap: true
         },
         main: {
            files: {
               'build/dist/<%= pkg.name %>.min.js': 'build/dist/<%= pkg.name %>.js'
            } 
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
            command: '<%= tscCmd %> --declaration --target ES5 "./src/engine/Engine.ts" --out "./build/dist/<%= pkg.name %>.js"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },         

         //
         // Package up Nuget (Windows only)
         //
         nuget: {
            command: 'src\\tools\\nuget pack Excalibur.nuspec -version <%= version %> -OutputDirectory ./build/dist',
            options: {
               stdout: true,
               failOnError: true
            }
         },
         
         //
         // TypeScript Compile Jasmine specs
         //
         specs: {
            command: function () {
            	var files = grunt.file.expand("./src/spec/*.ts");

            	return '<%= tscCmd %> --target ES5 --sourceMap ' + files.join(' ') + ' --out ./src/spec/TestsSpec.js'
            },
            options: {
               stdout: true,
               failOnError: true
            }
         },
         
         //
         // Jasmine NPM command
         //
         tests: {
             command: '<%= jasmineCmd %> JASMINE_CONFIG_PATH=<%= jasmineConfig %>',
             options: {
                 stdout: true,
                 failOnError: true
             }
         },
         
         //
         // Istanbul command that generates code coverage
         //
         istanbul: {
             command: '<%= istanbulCmd %> cover <%= jasmineJs %> JASMINE_CONFIG_PATH=<%= jasmineConfig %>',
             options: {
                 stdout: true,
                 failOnError: true
             }
         },

         //
         // TypeScript Compile sample game
         //
         sample: {
            command: '<%= tscCmd %> -t ES5 ./sandbox/web/src/game.ts',
            options: {
               stdout: true,
               failOnError: true
            }
         },
         
         //
         // Compile visual tests
         //
         visual: {
             command: function() {
                 var files = grunt.file.expand("./sandbox/web/tests/**/*.ts");
                 return '<%= tscCmd %> -t ES5 ' + files.join(' ');
             },
             options: {
               stdout: true,
               failOnError: true
            }            
         },

         gitBuild: {
            command: 'git clone -q https://github.com/excaliburjs/excalibur-dist build',
            options: {
               stdout: true,
               failOnError: false
            }
         }

      },

      //
      // Copy Files for sample game
      //
      copy: {
         main: {
            files: [
               {src: './build/dist/<%= pkg.name %>.js', dest: './sandbox/web/<%= pkg.name %>.js'},
               {src: './build/dist/<%= pkg.name %>.d.ts', dest: './sandbox/web/<%= pkg.name %>.d.ts'}
            ]
         }
      },

      //
      // Dist build control
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
      // TS Lint configuration
      //
      tslint: {
         options: {
            formatter: 'prose',
            rulesDirectory: './tslint/rules/',
            configuration: grunt.file.readJSON('./tslint/tslint.json')            
         },
         src: [
            "src/engine/**/*.ts",
            "src/sandbox/web/**/*.ts",
            "src/spec/**/*.ts",
            
            // exclusions
            "!src/spec/jasmine.d.ts",
            "!src/spec/require.d.ts"
         ]
      },
      
      coveralls: {
         main: {
            src: './coverage/lcov.info',
            options: {
               force: true
            }
         }
      }
   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-shell');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-tslint');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-coveralls');
   grunt.loadNpmTasks('grunt-build-control');
   
   //
   // Register available Grunt tasks
   //

   // Compile core engine
   grunt.registerTask('compile', ['shell:gitBuild', 'clean', 'shell:tsc', 'uglify', 'concat', 'copy']);   

   // Run tests quickly
   grunt.registerTask('tests', ['shell:specs', 'shell:tests']);

   // Compile sample game
   grunt.registerTask('sample', ['shell:sample']);
   
   // Compile visual tests
   grunt.registerTask('visual', ['shell:visual']);   

   // Travis CI task
   grunt.registerTask('travis', 'default');

   // Appveyor task
   grunt.registerTask('appveyor', ['default', 'shell:nuget']);

   // CI task to deploy dists
   grunt.registerTask('dists', ['buildcontrol']);
   
   // Default task - compile, test, build dists
   grunt.registerTask('default', ['tslint:src', 'shell:specs', 'shell:istanbul', 'coveralls', 'compile', 'sample', 'visual']);

};