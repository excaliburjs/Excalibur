const path = require('path');
const webpack = require('webpack');
const versioner = require('./version');
const pkg = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const now = new Date();
const dt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

/**
 * @returns {import('webpack').Configuration}
 */
module.exports = (env, argv) => {
  const { mode } = argv;
  const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();
  console.log('[version]:', version);

  const umdOutput = {
    path: path.resolve(__dirname, 'build/dist'),
    filename: mode === 'development' ? '[name].development.js' : '[name].js',
    library: {
      name: 'ex',
      type: 'umd'
    }
  };

  const esmOutput = {
    path: path.resolve(__dirname, 'build/esm'),
    filename: mode === 'development' ? '[name].development.js' : '[name].js',
    library: {
      type: 'module'
    }
  };

  return {
    mode,
    devtool: 'source-map',
    entry: {
      excalibur: './index.ts',
      'excalibur.min': './index.ts'
    },
    context: path.resolve(__dirname, 'src/engine'),
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          include: /\.min\.js$/
        })
      ]
    },
    output: env.output === 'esm' ? esmOutput : umdOutput,
    experiments:
      env.output === 'esm'
        ? {
            outputModule: true
          }
        : {},
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              outDir: env.output === 'esm' ? esmOutput.path : umdOutput.path
            }
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
          test: /\.glsl$/,
          use: ['raw-loader']
        }
      ]
    },

    plugins: [
      new CopyWebpackPlugin({ patterns: ['excalibur.d.ts'] }),
      new webpack.DefinePlugin({
        'process.env.__EX_VERSION': JSON.stringify(version),
        'process.env.NODE_ENV': JSON.stringify(mode)
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
};
