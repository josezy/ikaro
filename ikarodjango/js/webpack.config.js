const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'home': './pages/home.js',
  },
  output: {
    path: path.resolve(__dirname, '../static/js/pages'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  optimization: {
    // splitChunks: true,
    minimize: true,
  },
  performance: {
    maxEntrypointSize: 700000,
  }
};

