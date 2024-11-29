const path = require('path');
const webpack = require('webpack');

module.exports = function (wallaby) {
  return {
    runMode: 'onsave',
    files: [
      { pattern: 'src/spec/util/*.ts', load: false },
      { pattern: 'src/engine/**/*.ts', load: false },
      { pattern: 'src/engine/**/*.glsl', load: false },
      { pattern: 'src/spec/images/**/*.mp3' },
      { pattern: 'src/spec/images/**/*.ogg' },
      { pattern: 'src/spec/images/**/*.svg' },
      { pattern: 'src/spec/images/**/*.png' },
      { pattern: 'src/spec/images/**/*.gif' },
      { pattern: 'src/spec/images/**/*.txt' },
      { pattern: 'src/spec/images/**/*.css' },
      { pattern: 'src/spec/fonts/**/*.ttf' },
      { pattern: 'src/spec/images/**/*.woff2' }
    ],
    tests: ['./src/spec/*Spec.ts'],
    env: {
      kind: 'chrome',
      // This is tied to the puppeteer install
      runner: './node_modules/puppeteer/.local-chromium/win64-1022525/chrome-win/chrome.exe',
      params: {
        runner: '--headless --mute-audio --autoplay-policy=no-user-gesture-required'
      }
    },
    testFramework: 'jasmine',
    setup: function () {
      window.__moduleBundler.loadTests();
    },
    postprocessor: wallaby.postprocessors.webpack({
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
          'process.env.__EX_VERSION': "'test-runner'"
        })
      ],
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
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
            test: /\.(glsl)$/,
            use: ['raw-loader']
          }
        ]
      }
    })
  };
};
