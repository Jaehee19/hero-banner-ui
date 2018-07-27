const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist',
    proxy: {
      '/banners': {
        target: 'http://localhost:3000/banners',
        pathRewrite: {'^/banners' : ''}
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: ['/node_modules'],
      }
    ]
   },
   plugins: [
     new ExtractTextPlugin({
       filename: 'style.css',
     })
   ]
};