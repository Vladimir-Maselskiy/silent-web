const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { verify } = require('crypto');

module.exports = env => {
  return {
    entry: {
      popup: path.resolve('src/popup/index.tsx'),
      verify: path.resolve('src/verify/index.tsx'),
      options: path.resolve('src/options/index.tsx'),
      background: path.resolve('src/background/background.ts'),
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },

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
      ...getHtlmPlugins(['popup', 'options', 'verify']),
    ],
    optimization:
      env === 'production'
        ? {
            splitChunks: {
              chunks: 'all',
            },
            minimize: true,
            minimizer: [
              new TerserPlugin({
                extractComments: false,
                terserOptions: {
                  compress: {
                    drop_console: true,
                    dead_code: true,
                    unused: true,
                    collapse_vars: true,
                    reduce_vars: true,
                  },
                  format: {
                    comments: false,
                  },
                  mangle: {
                    toplevel: true,
                  },
                },
              }),
            ],
          }
        : {},
  };
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
