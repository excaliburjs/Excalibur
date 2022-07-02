// Karma configuration
const process = require('process');
const path = require('path');
const webpack = require('webpack');
process.env.CHROMIUM_BIN = require('puppeteer').executablePath();
process.env.CHROME_BIN = require('puppeteer').executablePath();

const isAppveyor = process.env.APPVEYOR_BUILD_NUMBER ? true : false;
const karmaJasmineSeedReporter = function(baseReporterDecorator) {
  baseReporterDecorator(this);

  this.onBrowserComplete = function(browser, result) {
    if (result.order && result.order.random && result.order.seed) {
      this.write('\n%s: Randomized with seed %s\n', browser.name, result.order.seed);
    }
  };

  this.onRunComplete = function() {
  }
};

const seedReporter =  {
  'reporter:jasmine-seed': ['type', karmaJasmineSeedReporter] // 1. 'jasmine-seed' is a name that can be referenced in karma.conf.js
};

module.exports = (config) => {
  config.set({
    singleRun: true,
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      seedReporter
    ],
    client: {
      // Excalibur logs / console logs suppressed when captureConsole = false;
      captureConsole: false,
      jasmine: {
        random: true,
        // seed: '10148',
        timeoutInterval: 30000
      }
    },
    proxies: {
      // smooths over loading files because karma prepends '/base/' to everything
      '/src/' : '/base/src/'
    },
    files: [  
            'src/spec/_boot.ts', 
            { pattern: 'src/spec/images/**/*.mp3', included: false, served: true },
            { pattern: 'src/spec/images/**/*.ogg', included: false, served: true },
            { pattern: 'src/spec/images/**/*.png', included: false, served: true },
            { pattern: 'src/spec/images/**/*.gif', included: false, served: true },
            { pattern: 'src/spec/images/**/*.txt', included: false, served: true },
            { pattern: 'src/spec/images/**/*.css', included: false, served: true },
            { pattern: 'src/spec/images/**/*.woff2', included: false, served: true },
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
      plugins: [
        new webpack.DefinePlugin({
          'process.env.__EX_VERSION': '\'test-runner\''
        }),
      ],
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
            use: ['css-loader']
          },
          {
            test: /\.(png|jpg|gif|mp3)$/i,
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
            test: /\.glsl$/,
            use: ['raw-loader']
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
    reporters: ['progress', 'coverage-istanbul', 'jasmine-seed'],
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
    browsers: ['ChromiumHeadless_with_audio'],
    browserDisconnectTolerance : 1,
    browserDisconnectTimeout: 60000, // appveyor is slow :(
    browserNoActivityTimeout: 60000, // appveyor is slow :(
    customLaunchers: {
      ChromeHeadless_with_audio: {
          base: 'ChromeHeadless',
          flags: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-gpu', '--no-sandbox']
      },
      ChromiumHeadless_with_audio: {
          base: 'ChromiumHeadless',
          flags: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-gpu', '--no-sandbox']
      },
      ChromiumHeadless_with_debug: {
        base: 'ChromiumHeadless',
        flags: ['--remote-debugging-port=9334', '--no-sandbox', '--disable-web-security']
      },
      Chromium_with_debug: {
        base: 'Chromium',
        flags: ['--remote-debugging-port=9334', '--no-sandbox']
      }
    }
  });
};
