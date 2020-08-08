const path = require('path');
const webpack = require('webpack');
const version = require('./version').getCiVersion();
const pkg = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const now = new Date();
const dt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './index.ts',
  context: path.resolve(__dirname, 'src/engine'),
  output: {
    path: path.resolve(__dirname, 'build/dist'),
    filename: 'excalibur.js',
    library: 'ex',
    libraryTarget: 'umd'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['to-string-loader', 'css-loader']
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
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({ patterns: ['excalibur.d.ts'] }),
    new webpack.DefinePlugin({
      'process.env.__EX_VERSION': JSON.stringify(version)
    }),
    new webpack.BannerPlugin(
      `${pkg.name} - ${version} - ${dt}
${pkg.homepage}
Copyright (c) ${now.getFullYear()} Excalibur.js <${pkg.author}>
Licensed ${pkg.license}
@preserve`
    )
  ]
};
