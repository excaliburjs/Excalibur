const path = require('path');

module.exports = {
  stories: ['../src/stories/*.stories.ts'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],

  webpackFinal: async (config, { configType }) => {
    const cssLoader = config.module.rules.findIndex((r) => r.test && r.test.toString().includes('.css'));

    if (cssLoader > -1) {
      // TODO: Investigate why css-loader messes with toString() expressions
      config.module.rules.splice(cssLoader, 1);
    }

    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader']
    });

    config.module.rules.push({
      test: /\.css$/,
      use: ['css-loader']
    });

    config.module.rules.push({
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

    const sourceLoader = config.module.rules.findIndex((r) => r.loader && r.loader.includes('source-loader'));

    if (sourceLoader > -1) {
      // TODO: Investigate why source-loader is messing with graphics.add(string, object); expressions
      config.module.rules.splice(sourceLoader, 1);
    }

    if (configType === 'PRODUCTION') {
      config.mode = 'development';
    }

    return config;
  },

  framework: {
    name: '@storybook/html-webpack5',
    options: {}
  },

  docs: {
    autodocs: false
  }
};
