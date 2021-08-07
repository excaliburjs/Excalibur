const path = require('path');

module.exports = {
  stories: ['../src/stories/*.stories.ts'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: 'webpack5'
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader']
    });

    // Remove TS handling from babel-loader
    const babelloader = config.module.rules.find((r) => r.test.test('foo.ts'));
    babelloader.test = /\.(mjs|jsx?)$/;

    config.module.rules.unshift({
      test: /\.(tsx?)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
          options: {
            configFile: path.join(__dirname, '../src/stories/tsconfig.json')
          }
        }
      ]
    });

    // const assetloader = config.module.rules.find((r) => r.test.test('file.png'));
    // assetloader.generator.filename = 'static/media/[path][name][ext]';

    if (configType === 'PRODUCTION') {
      config.mode = 'development';
    }

    return config;
  }
};
