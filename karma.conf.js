// Karma configuration
const process = require('process');
const path = require('path');
const webpack = require('webpack');
process.env.CHROMIUM_BIN = require('puppeteer').executablePath();
process.env.CHROME_BIN = require('puppeteer').executablePath();

console.log('Chromium', process.env.CHROMIUM_BIN);

const isAppveyor = process.env.APPVEYOR_BUILD_NUMBER ? true : false;
const KarmaJasmineSeedReporter = function (baseReporterDecorator) {
  baseReporterDecorator(this);

  this.onBrowserComplete = function (browser, result) {
    if (result.order && result.order.random && result.order.seed) {
      this.write('\n%s: Randomized with seed %s\n', browser.name, result.order.seed);
    }
  };

  this.onRunComplete = function () {};
};

const seedReporter = {
  'reporter:jasmine-seed': ['type', KarmaJasmineSeedReporter] // 1. 'jasmine-seed' is a name that can be referenced in karma.conf.js
};

const SlowSpecsReporter = function (baseReporterDecorator) {
  baseReporterDecorator(this);
  let slowSpecs = [];
  this.specSuccess = this.specFailure = function (browser, result) {
    const seconds = result.time / 1000;
    slowSpecs.push({
      time: result.time,
      name: result.fullName,
      message: `Spec ${result.fullName} took ${seconds} seconds\n`
    });
  };

  this.onBrowserComplete = function (browser, result) {
    this.write('\n');
    slowSpecs.sort((a, b) => {
      return b.time - a.time;
    });
    for (const spec of slowSpecs.slice(0, 20)) {
      let color = '\u001b[32m'; // green
      let timeSeconds = spec.time/1000;
      if (timeSeconds >= 0.5) {
        color = '\u001b[33m'; // yellow
      } 
      if (timeSeconds >= 1.0) {
        color = '\u001b[31m'; // red
      }
      this.write(`${color}${(timeSeconds).toFixed(2)} Seconds:\u001b[0m ${spec.name}\n`);
    }
    slowSpecs.length = 0;
  };
};
const timingReporter = {
  'reporter:jasmine-slow': ['type', SlowSpecsReporter] // 1.
};

const TimeoutSpecsReporter = function(baseReporterDecorator, logger, emitter) {
  baseReporterDecorator(this);
  const reporter = this;

  emitter.on('browser_info', (browser, data) => {
      if (!data || data.type !== 'Jasmine Timeout Reporter') {
          return
      }
      reporter.write(`\n\u001b[31m${data.type.toUpperCase()}:\u001b[0m ${data.specName}\n`);
  });
}
TimeoutSpecsReporter.$inject = ['baseReporterDecorator', 'logger', 'emitter'];
const timeoutReporter = {
  'reporter:jasmine-timeout': ['type', TimeoutSpecsReporter]
}

module.exports = (config) => {
  config.set({
    browserConsoleLogOptions: {
      terminal: true,
      level: ''
    },
    singleRun: true,
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('karma-jasmine-order-reporter'),
      seedReporter,
      timingReporter,
      timeoutReporter
    ],
    client: {
      // Excalibur logs / console logs suppressed when captureConsole = false;
      captureConsole: process.env.CAPTURE_CONSOLE === 'true',
      jasmine: {
        random: true,
        timeoutInterval: 70000 // needs to be bigger than no-activity
      }
    },
    proxies: {
      // smooths over loading files because karma prepends '/base/' to everything
      '/src/': '/base/src/'
    },
    files: [
      'src/spec/_boot.ts',
      { pattern: 'src/spec/images/**/*.mp3', included: false, served: true },
      { pattern: 'src/spec/images/**/*.ogg', included: false, served: true },
      { pattern: 'src/spec/images/**/*.svg', included: false, served: true },
      { pattern: 'src/spec/images/**/*.png', included: false, served: true },
      { pattern: 'src/spec/images/**/*.gif', included: false, served: true },
      { pattern: 'src/spec/images/**/*.txt', included: false, served: true },
      { pattern: 'src/spec/images/**/*.css', included: false, served: true },
      { pattern: 'src/spec/images/**/*.woff2', included: false, served: true },
      { pattern: 'src/spec/fonts/**/*.ttf', included: false, served: true }
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
          '@excalibur': path.resolve(__dirname, './src/engine/')
        }
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.__EX_VERSION': "'test-runner'",
          'process.env.NODE_ENV': JSON.stringify('development')
        })
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
    reporters: ['jasmine-order', 'progress', /*'spec'*/, 'coverage-istanbul','jasmine-seed', 'jasmine-slow', 'jasmine-timeout'],
    coverageReporter: {
      reporters: [{ type: 'html', dir: 'coverage/' }, { type: 'lcovonly', dir: 'coverage/', file: 'lcov.info' }, { type: 'text-summary' }]
    },
    coverageIstanbulReporter: {
      // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/aae256fb8b9a3d19414dcf069c592e88712c32c6/packages/istanbul-reports/lib
      reports: ['html', 'lcovonly', 'text-summary'],

      // base output directory. If you include %browser% in the path it will be replaced with the karma browser name
      dir: path.join(__dirname, 'coverage')
    },
    browsers: ['ChromiumHeadless_with_audio'],
    browserDisconnectTolerance: 1,
    browserDisconnectTimeout: 60000, // appveyor is slow :(
    browserNoActivityTimeout: 60000, // appveyor is slow :(
    customLaunchers: {
      ChromeHeadless_with_audio: {
        base: 'ChromeHeadless',
        flags: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-gpu', '--no-sandbox']
      },
      ChromiumHeadless_with_audio: {
        base: 'ChromiumHeadless',
        flags: [
          '--autoplay-policy=no-user-gesture-required',
          '--mute-audio',
          '--disable-gpu',
          '--no-sandbox',
          '--enable-precise-memory-info',
          '--js-flags="--max_old_space_size=8192"'
        ]
      },
      ChromiumHeadless_with_debug: {
        base: 'ChromiumHeadless',
        flags: ['--remote-debugging-port=9334', '--no-sandbox', '--disable-web-security']
      },
      Chromium_with_debug: {
        base: 'Chromium',
        flags: [
          '--remote-debugging-address=0.0.0.0',
          '--remote-debugging-port=9222',
          '--disable-web-security',
          '--mute-audio',
          '--no-sandbox'
        ]
      }
    }
  });
};
