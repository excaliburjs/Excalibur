const path = require('path');
const webpack = require('webpack');
const versioner = require('./version');
const pkg = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const now = new Date();
const dt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

const umdOutput = {
  path: path.resolve(__dirname, 'build/dist'),
  filename: '[name].js',
  library: {
    name: 'ex',
    type: 'umd'
  }
};

const esmOutput = {
  path: path.resolve(__dirname, 'build/esm'),
  filename: '[name].js',
  library: {
    type: 'module'
  }
};

module.exports = (env, argv) => {
  const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();
  console.log('[version]:', version);
  return [
    {
      name: 'worker',
      context: path.resolve(__dirname, 'src/engine'),
      entry: { worker: './Collision/Worker/CollisionWorker.ts' },
      output: { filename: "[name].js", path: path.resolve(__dirname, 'src/engine/Collision/Worker') },
      // output: env.output === 'esm' ? esmOutput : umdOutput,
      resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
      },
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            include: /\.min\.js$/
          })
        ]
      },
      module: {
        rules: [
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
      }
    },
    {
      name: 'main',
      dependencies: ["worker"],
      mode: 'production',
      devtool: 'source-map',
      entry: {
        excalibur: './index.ts',
        'excalibur.min': './index.ts',
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
          {
            test: /worker.js$/,
            type: 'asset/source'
          },
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
    }]
};
