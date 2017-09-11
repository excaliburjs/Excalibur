// Karma configuration
// Generated on Sat Sep 09 2017 14:56:04 GMT-0500 (Central Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],


    // list of files / patterns to load in the browser
    files: [
      './build/dist/excalibur.js',
      './build/dist/excalibur.d.ts',
      './src/spec/images/*/*.png',
      './src/spec/support/js-imagediff.js',
      './src/spec/support/js-imagediff.d.ts',
      './src/spec/!(*Spec).ts',
      './src/spec/*Spec.ts',
      
    ],


    // list of files to exclude
    exclude: [
       "node_modules",
       "typedoc-default-themes"
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/spec/*.ts': ['karma-typescript'],
      //'build/dist/excalibur.js': ['coverage']
    },

   //  karmaTypescriptConfig: {

   //    compilerOptions: {
   //       "sourceMap": true,
   //       "experimentalDecorators": true,
   //       "target": "es5",
   //       "module": "none"
   //    },
   //    // transforming the filenames 
   //    transformPath: function(path) {
   //       return path.replace(/\.ts$/, '.js');
   //    }

   //  },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],//, 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
