const path = require('path');

module.exports = {
  addons: ['@storybook/addon-docs', '@storybook/addon-knobs/register', '@storybook/addon-actions/register'],
  stories: ['../src/stories/*.stories.ts'],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
          options: {
            configFile: path.join(__dirname, '../src/stories/tsconfig.json')
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
