const path = require("path");
const webpack = require("webpack");
const pkg = require("./package.json");
const now = new Date();
const dt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

module.exports = (version) => ({
  mode: "development",
  devtool: "source-map",
  entry: "./index.ts",
  context: path.resolve(__dirname, "src/engine"),
  output: {
    path: path.resolve(__dirname, "build/dist"),
    filename: "excalibur.js",
    library: "ex",
    libraryTarget: "umd"
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.__EX_VERSION': JSON.stringify(version)
    }),
    new webpack.BannerPlugin(
`${pkg.name} - ${version} - ${dt}
${pkg.homepage}
Copyright (c) ${now.getFullYear()} Excalibur.js <${pkg.author}>
Licensed ${pkg.license}
@preserve`)
  ]
});
