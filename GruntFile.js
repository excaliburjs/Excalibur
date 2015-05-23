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
         projectRoot: "./src/spec",
         requirejs: false,
         forceExit: true,
         jUnit: {
            report: false,
            savePath: "./dist/reports/jasmine/",
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
            src: ['dist/<%= pkg.name %>-<%= pkg.version %>.js', 'src/engine/Exports.js'],
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
         },
         minified: {
            src: ['dist/<%= pkg.name %>-<%= pkg.version %>.min.js', 'src/engine/Exports.js'],
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
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
            src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>'
         },
         options: {
            sourcemap: false,
            allinone: true,
            dest_filename: '.min.js'
         }
      },

      //
      // Watch files
      //
      watch: {
         scripts: {
            files: ['src/engine/*.ts', 'src/spec/*.ts'],
            tasks: ['tslint:src', 'shell:specs', 'jasmine_node'],
            options: {
               interrupt: true
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
            command: 'tsc --sourcemap --declaration "./src/engine/Engine.ts" --out "./dist/<%= pkg.name %>-<%= pkg.version %>.js"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Package up Nuget (Windows only)
         //
         nuget: {
            command: 'src\\tools\\nuget pack Excalibur.nuspec -version <%= pkg.version %> -OutputDirectory ./dist',
            options: {
               stdout: true
            }
         },         

         //
         // TypeScript Compile Jasmine specs
         //
         specs: {
            command: function () {
            	var files = grunt.file.expand("./src/spec/*.ts");

            	return 'tsc ' + files.join(' ') + ' --out ./src/spec/TestsSpec.js'
            },
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // TypeScript Compile sample game
         //
         sample: {
            command: 'tsc ./sandbox/web/src/game.ts',
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
               {src: './dist/<%= pkg.name %>-<%= pkg.version %>.js', dest: './dist/<%= pkg.name %>.js'},
               {src: './dist/<%= pkg.name %>-<%= pkg.version %>.js', dest: './sandbox/web/<%= pkg.name %>.js'},
               {src: './dist/<%= pkg.name %>-<%= pkg.version %>.min.js', dest: './dist/<%= pkg.name %>.min.js'},
               {src: './dist/<%= pkg.name %>-<%= pkg.version %>.d.ts', dest: './dist/<%= pkg.name %>.d.ts'}
            ]
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
            "src/engine/Actor.ts",
            "src/engine/Algebra.ts",
            "src/engine/Animation.ts",
            "src/engine/Binding.ts",
            "src/engine/Camera.ts",
            "src/engine/Class.ts",
            "src/engine/CollisionPair.ts",
            "src/engine/Color.ts",
            "src/engine/EasingFunctions.ts",
            "src/engine/Engine.ts",
            "src/engine/EventDispatcher.ts",
            "src/engine/Events.ts",
            "src/engine/Group.ts",
            "src/engine/Label.ts",
            "src/engine/Loader.ts",
            "src/engine/Log.ts",
            "src/engine/MonkeyPatch.ts",
            "src/engine/Particles.ts",
            "src/engine/Polygon.ts",
            "src/engine/Promises.ts",
            "src/engine/Resource.ts",
            "src/engine/Scene.ts",
            "src/engine/Sound.ts",
            "src/engine/Sprite.ts",
            "src/engine/SpriteEffects.ts",
            "src/engine/SpriteSheet.ts",
            "src/engine/TileMap.ts",
            "src/engine/Timer.ts",
            "src/engine/Trigger.ts"
         ]
      }
   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-shell');
   grunt.loadNpmTasks('grunt-minified');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-jasmine-node');
   grunt.loadNpmTasks('grunt-tslint');
   grunt.loadNpmTasks('grunt-contrib-watch');

   //
   // Register available Grunt tasks
   //

   // Run tests
   grunt.registerTask('tests', ['shell:specs', 'jasmine_node']);

   // Compile sample game
   grunt.registerTask('sample', ['shell:sample']);

   // Default task - compile, test, build dists
   grunt.registerTask('default', ['tslint:src', 'tests', 'shell:tsc', 'minified', 'concat', 'copy', 'sample', 'shell:nuget']);

   grunt.registerTask('compile', ['shell:tsc', 'minified', 'concat', 'copy', 'shell:nuget'])

   // Travis task - for Travis CI
   grunt.registerTask('travis', 'default');
};