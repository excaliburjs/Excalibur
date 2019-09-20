const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');
const path = require('path');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(stories|story)\.mdx$/,
    use: [
      {
        loader: 'babel-loader'
        // may or may not need this line depending on your app's setup
        // plugins: ['@babel/plugin-transform-react-jsx']
      },
      {
        loader: '@mdx-js/loader',
        options: {
          compilers: [createCompiler({})]
        }
      }
    ]
  });
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
