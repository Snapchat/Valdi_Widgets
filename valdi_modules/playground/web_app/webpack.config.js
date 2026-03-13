const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Path to the Bazel-built playground_export_npm (set by bazel_web_serve.sh or default relative to repo root).
const REPO_ROOT = path.resolve(__dirname, '../../..');
const PLAYGROUND_NPM = process.env.PLAYGROUND_NPM_PATH ||
  path.resolve(REPO_ROOT, 'bazel-bin/valdi_modules/playground/playground_export_npm');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: 'development',
  devtool: 'source-map',
  ignoreWarnings: [{ message: /Cannot statically analyse 'require/ }],
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new (require('webpack').IgnorePlugin)({
      resourceRegExp: /foundation[\\/]test[\\/]util[\\/]lib[\\/]faker\.js$/,
    }),
  ],
  devServer: {
    port: parseInt(process.env.PORT || '8080', 10),
    hot: true,
    static: false,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    alias: {
      'playground_export_npm': PLAYGROUND_NPM,
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { esmodules: true } }],
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
          },
        },
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, type: 'asset/resource' },
      { test: /\.protodecl$/, type: 'asset/resource' },
    ],
  },
};
