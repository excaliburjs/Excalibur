// Karma configuration
const process = require('process');
const path = require('path');
const webpack = require('webpack');
process.env.CHROME_BIN = require('puppeteer').executablePath();

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
    frameworks: ['jasmine'],
    client: {
      // Excalibur logs / console logs suppressed when captureConsole = false;
      captureConsole: false,
      jasmine: {
        timeoutInterval: 30000
      }
    },
    proxies: {
      // smooths over loading files because karma prepends '/base/' to everything
      '/src/' : '/base/src/'
    },
    files: [
            'src/browsersupport/BrowserSupportSpec.ts',
           ],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    preprocessors: {
      './src/browsersupport/BrowserSupportSpec.ts': ['webpack']
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
    browserDisconnectTimeout : 10000,
    browserDisconnectTolerance : 1,
    browserNoActivityTimeout: 60000, // appveyor is slow :(
    captureTimeout : 4*60*1000,
      // define browsers
    customLaunchers: {
      bs_latest_chrome_win10: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '10'
      },
      bs_latest_minus_1_chrome_win10: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '10'
      },
      bs_latest_firefox_win10: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '10'
      },
      bs_latest_minus_1_firefox_win10: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '10'
      },
      bs_latest_opera_win10: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '10'
      },
      bs_latest_minus_1_opera_win10: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '10'
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
      'bs_latest_chrome_win10',
      'bs_latest_minus_1_chrome_win10',
      'bs_latest_firefox_win10',
      'bs_latest_minus_1_firefox_win10',
      'bs_latest_opera_win10',
      'bs_latest_minus_1_opera_win10',
      'bs_safari_14_1',
      'bs_safari_13_1',
      'bs_safari_12_1'
    ]
    // browsers: ['ChromeHeadless_with_audio'],
    // customLaunchers: {
    //   ChromeHeadless_with_audio: {
    //       base: 'ChromeHeadless',
    //       flags: ['--autoplay-policy=no-user-gesture-required', '--mute-audio']
    //   },
    //   ChromeHeadless_with_debug: {
    //     base: 'ChromeHeadless',
    //     flags: ['--remote-debugging-port=9334', '--no-sandbox', '--disable-web-security']
    //   },
    //   Chrome_with_debug: {
    //     base: 'Chrome',
    //     flags: ['--remote-debugging-port=9334', '--no-sandbox']
    //   }
    // }
  });
};
