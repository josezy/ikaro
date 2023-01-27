const path = require('path');

module.exports = {
  mode: 'production',
  resolve: {
    fallback: {
      // "fs": false,
      // "tls": false,
      // "net": false,
      "path": require.resolve("path-browserify"),
      // "zlib": false,
      // "http": false,
      // "https": false,
      // "stream": false,
      // "crypto": false,
      // "crypto-browserify": false,
    } 
  },
  entry: {
    flight_panel: './pages/flight_panel.js',
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
      },
      {
        test: /\.less$/i,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader', // translates CSS into CommonJS
        }, {
          loader: 'less-loader', // compiles Less to CSS
          options: {
            lessOptions: {
              modifyVars: {
                'primary-color': '#02253C', // Dark blue
              },
              javascriptEnabled: true,
            },
          },
        }],
      }
    ]
  },
  optimization: {
    minimize: true,
  },
  performance: {
    maxEntrypointSize: 700000,
  }
};

