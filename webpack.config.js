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

const tsLoader = (env) => ({
  loader: 'ts-loader',
  options: {
    compilerOptions: {
      outDir: env.output === 'esm' ? esmOutput.path : umdOutput.path
    }
  }
})

const removeInstrumentation = {
    loader: 'string-replace-loader',
    options: {
      multiple: [
        // kill imports
        { search: /.*Profiler(?:\'|\");/g, replace: '' },
        // kill decorator
        { search: /\s*@profile\(\)/g, replace: '' },
        // kill inlined
        { search: /Profiler\.start\(.*\);?/g, replace: '' },
        // kill inlined
        { search: /Profiler\.end\(\);?/g, replace: '' }
     ]
    }
}

const defaultConfig = ({mode, version, env, useInstrumentation}) => ({
    mode: mode ?? 'production',
    devtool: 'source-map',
    entry: useInstrumentation ? {
      'excalibur.dev': './index.ts'
    }
    : {
      excalibur: './index.ts',
      'excalibur.min': './index.ts'
    },
    context: path.resolve(__dirname, 'src/engine'),
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          include: /\.min\.js$/,
          extractComments: 'some'
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
          use: useInstrumentation ? [tsLoader(env)] : [tsLoader(env), removeInstrumentation]
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
  })

module.exports = (env, argv) => {
  const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();
  console.log('[version]:', version);
  return [
    defaultConfig({mode: 'development', version, env, useInstrumentation: true}),
    defaultConfig({mode: 'production', version, env, useInstrumentation: false})
  ];
};
