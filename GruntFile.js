/*********************************
/* Excalibur.js Grunt Build File
/*********************************/
var path = require('path');
var appveyorBuild = process.env.APPVEYOR_BUILD_NUMBER || '';

if (appveyorBuild) {
   appveyorBuild = '.' + appveyorBuild + '-alpha';
}

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      version: '<%= pkg.version %>' + appveyorBuild,
      tscCmd: path.join('node_modules', '.bin', 'tsc'),

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
            src: ['src/browser/start.js', 'src/browser/almond.js', 'build/dist/<%= pkg.name %>.amd.js', 'src/browser/end.js'],
            dest: 'build/dist/<%= pkg.name %>.js',
            options: {
               sourceMap: true,
               process: function (src, filepath) {
                  return src.replace(/__EX_VERSION/g, grunt.template.process('<%= pkg.version %>'));
               }
            }
         },
         dts_amd: {
            src: ['build/dist/<%= pkg.name %>.amd.d.ts'],
            dest: 'build/dist/<%= pkg.name %>.amd.d.ts'
         },
         dts_global: {
            src: ['src/engine/Index.ts', 'src/browser/global.d.ts'],
            dest: 'build/dist/<%= pkg.name %>.d.ts',
            options: {
               process: function (src, filepath) {
                  // strip relative file paths
                  // and add reference path
                  return grunt.template.process('/// <reference path="<%= pkg.name %>.amd.d.ts" />\n') + 
                     src.replace(/\.\//g, '');
               }
            }
         },
         options: {
            separator: '\n',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> Excalibur.js <<%= pkg.author %>>;' +
            ' Licensed <%= pkg.license %>\n' +
            '* @preserve */\n'
         }
      },

      //
      // Minify files
      //
      uglify: {
         options: {
            sourceMap: true,
            preserveComments: 'some'
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
            command: '<%= tscCmd %> -p src/engine',
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // TypeScript Compile Jasmine specs
         //
         tscspecs: {
            command: function () {
               return '<%= tscCmd %> -p src/spec/tsconfig.json --outFile src/spec/TestsSpec.js'
            },
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // TypeScript Compile Jasmine specs for phantom debugging
         //
         tscspecsdebug: {
            command: function () {
               // tsconfig doesn't properly support ordering of includes :(
                  
               var jasmine = ['src/spec/support/phantom-jasmine-invoker.js', 'src/spec/support/js-imagediff.js'];
               var excalibur = ["./build/dist/excalibur.js"];
               var files = grunt.file.expand("./src/spec/*.ts");
               var help = ['node_modules/source-map-support/browser-source-map-support.js', 'src/spec/support/start-tests.js']

               var allfiles = jasmine.concat(excalibur).concat(files).concat(help)

               return '<%= tscCmd %> --target ES5 --allowJs --sourceMap ' + allfiles.join(' ') + ' --out ./TestsSpec.js'
            },
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Compile visual tests
         //
         tscvisual: {
            command: function () {
               var files = grunt.file.expand("./sandbox/web/**/*.ts");

               return '<%= tscCmd %> -t ES5 ' + files.join(' ');
            },
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

         gitBuild: {
            command: 'git clone https://github.com/excaliburjs/excalibur-dist build',
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
               { src: './build/dist/<%= pkg.name %>.js', dest: './sandbox/web/<%= pkg.name %>.js' },
               { src: './build/dist/<%= pkg.name %>.js.map', dest: './sandbox/web/<%= pkg.name %>.js.map' },
               { src: './build/dist/<%= pkg.name %>.amd.d.ts', dest: './sandbox/web/<%= pkg.name %>.amd.d.ts' },
               { src: './build/dist/<%= pkg.name %>.d.ts', dest: './sandbox/web/<%= pkg.name %>.d.ts' }
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
            configuration: './tslint/tslint.json'
         },
         src: [
            "src/engine/**/*.ts",
            "src/sandbox/web/**/*.ts",
            "src/spec/**/*.ts",

            // exclusions
            "!src/spec/jasmine.d.ts",
            "!src/spec/require.d.ts",
            "!src/spec/support/js-imagediff.d.ts"
         ]
      },

      //
      // Jasmine configuration
      //
      jasmine: {
         coverage: {
            src: 'build/dist/excalibur.js',
            options: {
               vendor: ['src/spec/support/js-imagediff.js'/*, 'src/spec/support/sourcemaps.js'*/],
               specs: 'src/spec/TestsSpec.js',
               keepRunner: true,
               template: require('grunt-template-jasmine-istanbul'),
               templateOptions: {
                  coverage: './coverage/coverage.json',
                  report: [
                     {
                        type: 'html',
                        options: {
                           dir: './coverage'
                        }
                     },
                     {
                        type: 'lcovonly',
                        options: {
                           dir: './coverage/lcov'
                        }
                     },
                     {
                        type: 'text-summary'
                     }
                  ]
               }
            }
         }
      },

      //
      // Code coverage configuration
      //
      coveralls: {
         main: {
            src: './coverage/lcov/lcov.info',
            options: {
               force: true
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
               var version = grunt.file.readJSON('package.json').version;
               var build = process.env.TRAVIS_BUILD_NUMBER || "localbuild";
               var commit = process.env.TRAVIS_COMMIT || "localcommit";
               var alphaVersion = version + '-alpha.' + build + "+" + commit.substring(0, 7);
               return alphaVersion;
            },
         },
         files: ['build/package.json']
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
   grunt.loadNpmTasks('grunt-bumpup');
   grunt.loadNpmTasks('grunt-contrib-jasmine');

   //
   // Register available Grunt tasks
   //

   // Default task - compile & test
   grunt.registerTask('default', ['tslint:src', 'compile', 'tests', 'visual']);

   // Core compile only
   grunt.registerTask('compile', ['shell:gitBuild', 'clean', 'shell:tsc', 'concat', 'uglify', 'copy']);

   // Run tests quickly
   grunt.registerTask('tests', ['shell:tscspecs', 'jasmine']);

   // Debug compile (for VS Code)
   grunt.registerTask('debug', ['compile', 'shell:tscspecsdebug'])   

   // Compile visual tests
   grunt.registerTask('visual', ['shell:tscvisual']);

   // Travis CI task
   grunt.registerTask('travis', ['default', 'coveralls']);

   // Appveyor task
   grunt.registerTask('appveyor', ['default', 'shell:nuget']);

   // CI task to deploy dists
   grunt.registerTask('dists', ['buildcontrol']);   
};