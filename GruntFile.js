/// Build Excalibur
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jasmine_node: {
      specNameMatcher: "Spec", // load only specs containing specNameMatcher
      projectRoot: "./spec",
      requirejs: false,
      forceExit: true,
      jUnit: {
        report: false,
        savePath : "./build/reports/jasmine/",
        useDotNotation: true,
        consolidate: true
      }
    },
    concat: {
      main : {
        src: ['build/<%= pkg.name %>-<%= pkg.version %>.js'],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      minified : {
        src: ['build/<%= pkg.name %>-<%= pkg.version %>.min.js'],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
      },
      options:{
        separator: '\n;\n',
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= pkg.licenses[0].type%>*/\n'
      }
    },
    minified: {
      files : {
        src: 'build/<%= pkg.name %>-<%= pkg.version %>.js',
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>'
      },
      options : {
        sourcemap: false,
        allinone: true,
        dest_filename : '.min.js'
      }
    },
    shell: {
      tsc : {
         command: 'tsc --sourcemap --removeComments --declaration ./ts/Core.ts -out ./build/<%= pkg.name %>-<%= pkg.version %>.js',
         options : {
          stdout : true,
          failOnError : true
         }
      },
      nuget : {
        command: 'tools\\nuget pack Excalibur.nuspec -version <%= pkg.version %> -OutputDirectory ./build',
        options : {
          stdout : true
         }
      },
      specs : {
        command : 'tsc "./spec/ActorSpec.ts" -out "./spec/ActorSpec.js";' + 
        'tsc "./spec/ColorSpec.ts" -out "./spec/ColorSpec.js";'+
        'tsc "./spec/PromiseSpec.ts" -out "./spec/PromiseSpec.js";'+
        'tsc "./spec/CollectionSpec.ts" -out "./spec/CollectionSpec.js";'+
        'tsc "./spec/LogSpec.ts" -out "./spec/LogSpec.js"',
        options : {
          stdout : true,
          failOnError : true
        }
      },
      sample : {
        command : 'tsc ./sample-game/ts/game.ts',
        options : {
          stdout : true,
          failOnError : true
        }
      }
    },
    watch: {
      files: '<config:source.files>',
      tasks: 'shell'
    },
    uglify: {}
  });

  // Exec task
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-minified');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.

  grunt.registerTask('tests', ['shell:specs', 'jasmine_node']);
  grunt.registerTask('sample', ['shell:sample']);
  grunt.registerTask('default', ['tests', 'shell:tsc', 'sample', 'minified', 'concat', 'shell:nuget']);
  grunt.registerTask('travis', 'default');

};