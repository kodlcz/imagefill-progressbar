const path = require('path');

module.exports = {
  entry: {
    'imagefill-progressbar': './src/imagefill-progressbar.ts'
  },
  output: {
    path: path.resolve(__dirname, '_bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ImageFillProgressBar',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
};
