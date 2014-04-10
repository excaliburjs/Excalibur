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
            src: ['dist/<%= pkg.name %>-<%= pkg.version %>.js'],
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
         },
         minified: {
            src: ['dist/<%= pkg.name %>-<%= pkg.version %>.min.js'],
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
      // Shell Commands
      //
      shell: {

         //
         // Execute TypeScript compiler against Excalibur core
         //
         tsc: {
            command: 'tsc --sourcemap --declaration "./src/engine/Core.ts" -out "./dist/<%= pkg.name %>-<%= pkg.version %>.js"',               
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
         // TODO: Simplify this so we don't have to always update it every time we add a spec
         //
         specs: {
            command: 'tsc "./src/spec/ActorSpec.ts" -out "./src/spec/ActorSpec.js";' +
            'tsc "./src/spec/ColorSpec.ts" -out "./src/spec/ColorSpec.js";' +
            'tsc "./src/spec/PromiseSpec.ts" -out "./src/spec/PromiseSpec.js";' +
            'tsc "./src/spec/CollectionSpec.ts" -out "./src/spec/CollectionSpec.js";' +
            'tsc "./src/spec/LogSpec.ts" -out "./src/spec/LogSpec.js";' + 
            'tsc "./src/spec/TimerSpec.ts" -out "./src/spec/TimerSpec.js";' +
            'tsc "./src/spec/ClassSpec.ts" -out "./src/spec/ClassSpec.js";' + 
            'tsc "./src/spec/CollisionGroupSpec.ts" -out "./src/spec/CollisionGroupSpec.js";' + 
            'tsc "./src/spec/BoundingBoxSpec.ts" -out "./src/spec/BoundingBoxSpec.js";' + 
            'tsc "./src/spec/CameraSpec.ts" -out "./src/spec/CameraSpec.js"',
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // TypeScript Compile sample game
         //
         sample: {
            command: 'tsc ./sandbox/src/game.ts',
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Build documentation site
         //
         docs: {
            command: 'yuidoc --helpers ./docs/strip.js --themedir ./docs/excalibur --norecurse --extension .ts --outdir ./docs/out ./src/engine',
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Build docs data
         //
         docsData: {
            command: 'yuidoc --helpers ./docs/strip.js --norecurse --extension .ts --outdir ./docs/out --parse-only ./src/engine',
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
               {src: './dist/<%= pkg.name %>-<%= pkg.version %>.min.js', dest: './dist/<%= pkg.name %>.min.js'},
               {src: './dist/<%= pkg.name %>-<%= pkg.version %>.d.ts', dest: './dist/<%= pkg.name %>.d.ts'}
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
   grunt.registerTask('sample', ['shell:sample']);

   // Default task - compile, test, build dists
   grunt.registerTask('default', ['tests', 'shell:tsc', 'minified', 'concat', 'copy', 'sample', 'shell:nuget']);

   // Travis task - for Travis CI
   grunt.registerTask('travis', 'default');

   // Generate documentation site
   grunt.registerTask('docs', 'shell:docs');

};