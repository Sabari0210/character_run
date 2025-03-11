const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js', // Your main JavaScript file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.min.js',
    publicPath: '/', // This ensures static files are referenced correctly
  },
  module: {
    rules: [
      {
        test: /\.css$/, // Handle CSS files
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|woff2?|eot|svg)$/, // Handle font files
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]', // Output font files to a fonts/ directory
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Path to your existing index.html file
      filename: 'index.html', // Output file name
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '.public/fonts', to: 'fonts' }, // Copy fonts to the output fonts/ folder
        { from: '.public/style.css', to: 'style.css' },
      ],
    }),
    new BrowserSyncPlugin({
      // Options for BrowserSync
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:8080', // Assuming your dev server runs on port 8080
      files: ['./dist/**/*.*'], // Watch for changes in the dist folder
      open: true, // Prevent opening a new tab in the browser automatically
  }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'), // Directory for static files
    },
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow fonts to be loaded from other domains
    },
    watchFiles: {
      paths: ['src/**/*'], // Watch source files for changes
      options: {
        usePolling: true, // Use polling if file changes are not being detected
      },
    },
    port: 8081,
    open: true,
    hot: true,
  },

  devtool: 'source-map', // Add this for source maps
};
