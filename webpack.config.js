const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.mjs', 
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'dist'),
    clean: true, 
  },
  mode: 'development', 
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/, 
        use: {
          loader: 'babel-loader', 
        },
      },
      {
        test: /\.css$/, 
        use: ['style-loader', 'css-loader'], 
      },
    ],
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', 
    }),
  ],
  devServer: {
    static: './dist', 
    port: 8080, 
  },
};
