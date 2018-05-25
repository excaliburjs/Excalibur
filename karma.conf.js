// Karma configuration
// Generated on Sat Sep 09 2017 14:56:04 GMT-0500 (Central Daylight Time)

module.exports = function (config) {
   config.set({

      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath: '',


      // frameworks to use
      // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
      frameworks: ['jasmine', 'karma-typescript'],


      // list of files / patterns to load in the browser
      files: [
         './build/dist/excalibur.js',
         { pattern: './build/dist/excalibur.js.map', included: false, served: true },
         { pattern: './src/spec/images/**/*.png', include: false, served: true },
         './build/dist/index.d.ts',
         './src/engine/**/*.ts',
         './src/spec/support/js-imagediff.js',
         './src/spec/support/js-imagediff.d.ts',
         './src/spec/Mocks.ts',
         './src/spec/TestUtils.ts',
         './src/spec/*.ts'
      ],


      // list of files to exclude
      exclude: [
         //  "node_modules",
         //  "typedoc-default-themes"
      ],


      // preprocess matching files before serving them to the browser
      // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors: {
         'src/spec/Mocks.ts': ['karma-typescript'],
         'src/spec/TestUtils.ts': ['karma-typescript'],
         'src/spec/*.ts': ['karma-typescript'],
         'build/dist/excalibur.js': ['coverage']
      },

      karmaTypescriptConfig: {
         compilerOptions: {
            noImplicitAny: false,
            target: "ES5",
            module: "none",
            sourceMap: true,
            removeComments: false,
            declaration: true,
            experimentalDecorators: true
         },
         include: [
            './build/dist/index.d.ts',
            'src/spec/Mocks.ts',
            'src/spec/TestUtils.ts',
            'src/spec/*.ts'
         ],
         types: [
            '@types/jasmine'
         ]
      },



      // test results reporter to use
      // possible values: 'dots', 'progress'
      // available reporters: https://npmjs.org/browse/keyword/karma-reporter
      reporters: ['progress', 'coverage'],

      coverageReporter: {
         reporters: [
            { type: 'html', dir: 'coverage/' },
            { type: 'lcovonly', dir: 'coverage/', file: 'lcov.info' },
            { type: 'text-summary' }
         ],
      },

      // web server port
      port: 9876,


      // enable / disable colors in the output (reporters and logs)
      colors: true,


      // level of logging
      // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
      logLevel: config.LOG_INFO,


      // enable / disable watching file and executing tests whenever any file changes
      autoWatch: false,


      // start these browsers
      // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
      browsers: ['ChromeHeadlessDebug'],

      customLaunchers: {
         ChromeHeadlessDebug: {
            base: 'ChromeHeadless',
            flags: [
               '--remote-debugging-port=9333',
               '--no-sandbox'
            ]
         }
      },


      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun: true,

      // Concurrency level
      // how many browser should be started simultaneous
      concurrency: Infinity
   })
}
