const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: 'assets', to: 'assets'},
      {from: 'index.html'}
    ])
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    open: true
  }
};
