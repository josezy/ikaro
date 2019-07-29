const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'flight_panel': './pages/flight_panel.js',
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

