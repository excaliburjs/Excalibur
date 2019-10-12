const path = require('path');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('@storybook/source-loader')
      },
      {
        loader: require.resolve('ts-loader'),
        options: {
          configFile: path.join(__dirname, '../src/stories/tsconfig.json')
        }
      }
    ]
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
