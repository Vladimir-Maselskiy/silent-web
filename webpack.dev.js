const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'cheap-module-source-map',
});
