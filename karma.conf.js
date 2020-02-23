// Karma configuration
const process = require('process');
const path = require('path');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    singleRun: true,
    frameworks: ['jasmine'],
    files: [  
            'src/spec/_boot.ts', 
            { pattern: 'src/spec/images/**/*.png', included: false, served: true },
            { pattern: 'src/spec/images/**/*.gif', included: false, served: true },
            { pattern: 'src/spec/images/**/*.txt', included: false, served: true }
           ],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    preprocessors: {
      './src/spec/_boot.ts': ['webpack']
    },
    webpack: {
      mode: 'none',
      devtool: 'source-map',
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          "@excalibur": path.resolve(__dirname, './src/engine/')
        }
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
              projectReferences: true,
              configFile: 'tsconfig.json'
            }
          },
          {
            test: /\.css$/,
            use: ['to-string-loader', 'css-loader']
          },
          {
            test: /\.(png|jpg|gif)$/i,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 8192
                }
              }
            ]
          },
          {
            test: /\.ts$/,
            enforce: 'post',
            include: path.resolve('src/engine/'),
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            }
          }
        ]
      }
    },
    webpackMiddleware: {
    // webpack-dev-middleware configuration
    // i. e.
        stats: 'normal'
    },
    reporters: ['progress', 'coverage-istanbul'],
    // specReporter: {
    //   maxLogLines: 5,         // limit number of lines logged per test
    //   suppressErrorSummary: true,  // do not print error summary
    //   suppressFailed: false,  // do not print information about failed tests
    //   suppressPassed: false,  // do not print information about passed tests
    //   suppressSkipped: true,  // do not print information about skipped tests
    //   showSpecTiming: false // print the time elapsed for each spec
    // },
    coverageReporter: {
      reporters: [
          { type: 'html', dir: 'coverage/' }, 
          { type: 'lcovonly', dir: 'coverage/', file: 'lcov.info' }, 
          { type: 'text-summary' }]
    },
    coverageIstanbulReporter: {
      // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/aae256fb8b9a3d19414dcf069c592e88712c32c6/packages/istanbul-reports/lib
      reports: ['html', 'lcovonly', 'text-summary'],

      // base output directory. If you include %browser% in the path it will be replaced with the karma browser name
      dir: path.join(__dirname, 'coverage')
    },

    browsers: ['ChromeHeadless_with_audio'],
    customLaunchers: {
      ChromeHeadless_with_audio: {
          base: 'ChromeHeadless',
          flags: ['--autoplay-policy=no-user-gesture-required']
      },
      ChromeHeadless_with_debug: {
        base: 'ChromeHeadless',
        flags: ['--remote-debugging-port=9334', '--no-sandbox', '--disable-web-security']
      },
      Chrome_with_debug: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9334', '--no-sandbox']
      }
    }
  });
};
