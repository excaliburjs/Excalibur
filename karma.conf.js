const process = require('process');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    singleRun: true,
    frameworks: ['jasmine'],
    files: [
      'src/spec/UIActorSpec.ts',
      'src/spec/UtilSpec.ts',
      'src/spec/WebAudioInstanceSpec.ts',
      'src/spec/TriggerSpec.ts',
      'src/spec/TimescalingSpec.ts',
      'src/spec/TimerSpec.ts',
      'src/spec/TileMapSpec.ts',
      'src/spec/SpriteSpec.ts',
      'src/spec/SpriteSheetSpec.ts',
      { pattern: 'src/spec/images/**/*.png', included: false, served: true }
    ],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    preprocessors: {
      'src/spec/UIActorSpec.ts': ['webpack'],
      'src/spec/UtilSpec.ts': ['webpack'],
      'src/spec/WebAudioInstanceSpec.ts': ['webpack'],
      'src/spec/TriggerSpec.ts': ['webpack'],
      'src/spec/TimescalingSpec.ts': ['webpack'],
      'src/spec/TimerSpec.ts': ['webpack'],
      'src/spec/TileMapSpec.ts': ['webpack'],
      'src/spec/SpriteSpec.ts': ['webpack'],
      'src/spec/SpriteSheetSpec.ts': ['webpack']
    },
    webpack: {
      mode: 'none',
      devtool: 'source-map',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: false // speeds up tests a TON by only using webpack resolution
            }
          }
        ]
      }
    },
    reporters: ['progress'],
    browsers: ['ChromeHeadless'],
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
