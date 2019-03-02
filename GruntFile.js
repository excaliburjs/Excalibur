/*********************************
/* Excalibur.js Grunt Build File
/*********************************/
const path = require('path');
const version = require('./version');
const webpackConfig = require('./webpack.config')(version);
const fs = require('fs');
const child_process = require('child_process');
const rimraf = require('rimraf');
const TYPEDOC_CMD = path.join('node_modules', '.bin', 'typedoc');

/*global module:false*/
module.exports = function(grunt) {
  //
  // Project configuration
  //
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: version,

    //
    // Clean dists and tests
    //
    clean: ['build/dist', 'src/spec/*.js', 'src/spec/*.map'],

    //
    // Webpack tasks
    //
    webpack: {
      bundle: webpackConfig,
      bundlemin: Object.assign({}, webpackConfig, {
        mode: 'production',
        output: Object.assign({}, webpackConfig.output, { filename: 'excalibur.min.js' })
      }),
      watch: Object.assign({}, webpackConfig, { watch: true })
    },

    //
    // Typescript compilation targets
    //
    ts: {
      // Core engine modules (ES2015)
      core_es2015: {
        tsconfig: 'src/engine',
        options: {
          removeComments: false
        }
      },

      // Jasmine specs
      specs: {
        tsconfig: 'src/spec'
      },

      // HTML visual tests
      visual: {
        options: {
          target: 'es5'
        },
        src: ['sandbox/**/*.ts']
      },

      // Jasmine debug specs (for VS Code)
      debug: {
        options: {
          allowJs: true,
          sourceMap: true,
          experimentalDecorators: true
        },
        out: 'TestsSpec.js',
        src: [
          'src/spec/support/phantom-jasmine-invoker.js',
          'src/spec/support/js-imagediff.js',
          'build/dist/excalibur.js',
          'src/spec/support/platform.js',
          'src/spec/*.ts',
          'node_modules/source-map-support/browser-source-map-support.js',
          'src/spec/support/start-tests.js'
        ]
      }
    },

    //
    // Version substitution
    //
    'string-replace': {
      dist_es2015: {
        files: {
          'build/dist/index.js': 'build/dist/index.js'
        },
        options: {
          replacements: [
            {
              pattern: /process\.env\.__EX_VERSION/g,
              replacement: `"${version}"`
            }
          ]
        }
      }
    },

    //
    // Copy dists for visual compilation/testing
    //
    copy: {
      core: {
        files: [
          {
            expand: true,
            cwd: './src/engine/',
            src: ['**/*.png', '**/*.css'],
            dest: './build/dist/'
          }
        ]
      },
      visual: {
        files: [
          {
            expand: true,
            cwd: './build/dist/',
            src: ['**'],
            dest: './sandbox/lib/'
          }
        ]
      },
      coveralls: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['coverage/**'],
            dest: 'coverage/',
            filter: 'isFile'
          }
        ]
      }
    },

    //
    // Shell Commands
    //
    shell: {
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
      // Clone distribution repository
      //
      gitBuild: {
        command: 'git clone https://github.com/excaliburjs/excalibur-dist build',
        options: {
          stdout: true,
          failOnError: false
        }
      }
    },

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
    // TS Lint configuration
    //
    tslint: {
      options: {
        configuration: './tslint/tslint.json'
      },
      src: [
        'src/engine/**/*.ts',
        'src/sandbox/**/*.ts',
        'src/spec/**/*.ts',

        // exclusions
        '!src/spec/require.d.ts',
        '!src/spec/support/js-imagediff.d.ts'
      ]
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    //
    // Code coverage configuration
    //
    coveralls: {
      main: {
        src: './coverage/lcov.info',
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
        version: function(old, releaseType, options) {
          return version;
        }
      },
      files: ['build/package.json']
    },

    connect: {
      sandbox: {
        options: {
          port: '3001',
          useAvailablePort: true,
          keepalive: true,
          base: './sandbox'
        }
      }
    }
  });

  //
  // Load NPM Grunt tasks as dependencies
  //
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-build-control');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-string-replace');

  //
  // Register available Grunt tasks
  //

  // Default task - compile & test
  grunt.registerTask('default', ['tslint:src', 'core', 'karma', 'visual']);

  // Lint only
  grunt.registerTask('lint', ['tslint:src']);

  // Core only
  grunt.registerTask('core', [
    'shell:gitBuild',
    'clean',
    'ts:core_es2015',
    'copy:core',
    'string-replace',
    'webpack:bundle',
    'webpack:bundlemin',
    'copy'
  ]);

  // Core w/watch
  grunt.registerTask('watch', ['shell:gitBuild', 'clean', 'webpack:watch', 'copy']);

  // Run tests quickly
  grunt.registerTask('tests', ['core', 'karma']);

  // Debug compile (for VS Code)
  grunt.registerTask('debug', ['core', 'ts:debug']);

  // Compile visual tests
  grunt.registerTask('visual', ['copy:visual', 'ts:visual']);

  // Serve sandbox
  grunt.registerTask('sandbox', ['connect']);

  // Travis CI task
  grunt.registerTask('travis', ['default', 'copy:coveralls', 'coveralls', 'apidocs']);

  // Appveyor task
  grunt.registerTask('appveyor', ['default', 'shell:nuget']);

  // CI task to deploy dists
  grunt.registerTask('dists', ['bumpup', 'buildcontrol']);

  // CI task to build API docs
  // Typically called by excaliburjs.github.io CI job to generate versioned docs
  grunt.registerTask('apidocs', 'Build API documentation', function(version) {
    version = version || 'Edge';

    console.log('Removing existing docs...');

    rimraf.sync('docs/api/');

    console.log('Compiling default template (default)...');
    try {
      if (!fs.existsSync('./typedoc-default-themes/node_modules')) {
        child_process.execSync('npm install', {
          cwd: './typedoc-default-themes',
          stdio: [0, 1, 2]
        });
      }
    } catch (e) {
      // fails to execute Linux commands, OK
    }

    console.log('Executing typedoc...');

    child_process.execSync(
      TYPEDOC_CMD +
        ' --name "Excalibur.js ' +
        version +
        ' API Documentation"' +
        ' --target es5' +
        ' --experimentalDecorators' +
        ' --mode modules' +
        ' --readme src/engine/Docs/Index.md' +
        ' --includes src/engine/Docs' +
        ' --out docs/api' +
        ' --theme typedoc-default-themes/bin/default' +
        ' --hideGenerator' +
        ' --excludePrivate' +
        ' --listInvalidSymbolLinks' +
        ' --gaID UA-46390208-1' +
        ' --gaSite excaliburjs.com' +
        ' --tsconfig src/engine/tsconfig.json' +
        ' src/engine',
      {
        stdio: [0, 1, 2]
      }
    );
  });
};
