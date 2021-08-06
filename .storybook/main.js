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

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
          options: {
            onlyCompileBundledFiles: true
          }
        }
      ]
    });
    config.resolve.extensions.push('.ts', '.tsx');

    if (configType === 'PRODUCTION') {
      config.mode = 'development';
    }

    return config;
  }
};
