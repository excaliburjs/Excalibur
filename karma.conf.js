const process = require('process');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    singleRun: true,
    frameworks: ['jasmine'],
    files: ['src/spec/UIActorSpec.ts', { pattern: 'src/spec/images/**/*.png', included: false, served: true }],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    preprocessors: {
      'src/spec/UIActorSpec.ts': ['webpack']
    },
    webpack: {
      mode: 'none',
      devtool: 'source-map',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
      }
    },
    reporters: ['progress'],
    browsers: ['ChromeHeadless_with_debug'],
    customLaunchers: {
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
