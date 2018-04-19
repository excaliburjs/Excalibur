const path = require("path");
const webpack = require("webpack");
const version = require("./version");

module.exports = env => ({
  mode: env && env.production ? "production" : "development",
  devtool: env && env.production ? "source-map" : "inline-source-map",
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
    })
  ]
});
