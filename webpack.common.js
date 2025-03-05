const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    popup: path.resolve('src/popup/index.tsx'),
    options: path.resolve('src/options/index.tsx'),
    background: path.resolve('src/background/background.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('src/assets'),
          to: path.resolve('dist'),
        },
        {
          from: path.resolve('src/js'),
          to: path.resolve('dist'),
        },
      ],
    }),
    ...getHtlmPlugins(['popup', 'options']),
  ],
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  //   minimize: true,
  //   minimizer: [
  //     new TerserPlugin({
  //       extractComments: false,
  //       terserOptions: {
  //         compress: {
  //           drop_console: true, // Видаляє console.log
  //           dead_code: true, // Видаляє невикористаний код
  //           unused: true, // Видаляє змінні та функції, що не використовуються
  //           collapse_vars: true, // Об'єднує змінні, коли можливо
  //           reduce_vars: true, // Оптимізує повторно використані змінні
  //         },
  //         format: {
  //           comments: false, // Видаляє коментарі
  //         },
  //         mangle: {
  //           toplevel: true, // Обфускація глобальних змінних
  //         },
  //       },
  //     }),
  //   ],
  // },
};

function getHtlmPlugins(chunks) {
  return chunks.map(
    chunk =>
      new HtmlWebpackPlugin({
        title: 'A-ReactJS',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}
