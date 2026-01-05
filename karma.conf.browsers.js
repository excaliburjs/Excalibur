// Karma configuration
const process = require('process');
const fs = require('fs')
process.env.CHROME_BIN = require('puppeteer').executablePath();


if (!fs.existsSync('build/dist/excalibur.js')) {
  throw new Error('Excalibur build not found. Please run "npm run build" first');
}

module.exports = (config) => {
  config.set({
    // global config of your BrowserStack account
    browserStack: {
      project: 'Excalibur',
      username: process.env.BS_USERNAME,
      accessKey: process.env.BS_PASSWORD,
      timeout: 600
    },
    singleRun: true,
    frameworks: ['webpack', 'jasmine'],
    client: {
      // Excalibur logs / console logs suppressed when captureConsole = false;
      captureConsole: false,
      jasmine: {
        timeoutInterval: 30000
      }
    },
    proxies: {
      // smooths over loading files because karma prepends '/base/' to everything
      '/src/': '/base/src/',
      '/build/': '/base/build/'
    },
    files: [
      'build/dist/excalibur.js',
      'src/spec/karma/browser-support-spec.ts',
    ],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    preprocessors: {
      'src/spec/karma/**/*.ts': ['webpack']
    },
    webpack: {
      mode: 'none',
      devtool: 'source-map',
      resolve: {
        extensions: ['.ts', '.js'],
      },
      plugins: [
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
        ]
      }
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'normal'
    },
    reporters: ['progress', 'summary'],
    summaryReporter: {
      // 'failed', 'skipped' or 'all'
      show: 'all',
      // Limit the spec label to this length
      specLength: 50,
      // Show an 'all' column as a summary
      overviewColumn: true,
      // Show a list of test clients, 'always', 'never' or 'ifneeded'
      browserList: 'always'
    },
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 60000, // appveyor is slow :(
    captureTimeout: 4 * 60 * 1000,
    // define browsers
    customLaunchers: {
      bs_latest_chrome_win11: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '11'
      },
      bs_latest_minus_1_chrome_win11: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '11'
      },
      bs_latest_firefox_win11: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '11'
      },
      bs_latest_minus_1_firefox_win11: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '11'
      },
      bs_latest_opera_win11: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '11'
      },
      bs_latest_minus_1_opera_win11: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '11'
      },
      bs_safari_14_1: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '14.1',
        os: 'OS X',
        os_version: 'Big Sur'
      },
      bs_safari_13_1: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '13.1',
        os: 'OS X',
        os_version: 'Catalina'
      },
      bs_safari_12_1: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '12.1',
        os: 'OS X',
        os_version: 'Mojave'
      },
    },

    browsers: [
      'bs_latest_chrome_win11',
      'bs_latest_minus_1_chrome_win11',
      'bs_latest_firefox_win11',
      'bs_latest_minus_1_firefox_win11',
      // 'bs_latest_opera_win11',
      // 'bs_latest_minus_1_opera_win11',
      'bs_safari_14_1',
      'bs_safari_13_1',
      'bs_safari_12_1'
    ]
  });
};
