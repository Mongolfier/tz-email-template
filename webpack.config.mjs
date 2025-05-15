import path from 'path';
import webpack from 'webpack';
import { fileURLToPath } from 'url';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackPugPlugin from 'html-webpack-pug-plugin';
import HtmlWebpackInlineSVGPlugin from 'html-webpack-inline-svg-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractStyles = new MiniCssExtractPlugin({
  filename: 'css/[name].bundle.css',
});

export default {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: {
    app: './_develop/js/app.js',
  },
  output: {
    path: path.resolve(__dirname, '_distribute/'),
    filename: 'js/[name].bundle.js',
    publicPath: '/', // Ensure assets are served from root
  },
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sourceMapContents: true,
              sassOptions: {
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        include: path.resolve(__dirname, '_develop/images/'),
        type: 'asset/resource', // Use Webpack 5 asset module
        generator: {
          filename: 'images/[name][ext]', // Preserve original filename
        },
      },
      {
        test: /\.pug$/,
        include: path.resolve(__dirname, '_develop/'),
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: true, // Process img src attributes
            },
          },
          {
            loader: 'pug-html-loader',
            options: {
              pretty: true,
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        include: path.resolve(__dirname, '_develop/fonts/'),
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]', // Preserve original filename
          publicPath: '../', // Adjust for font paths
        },
      },
    ],
  },
  devServer: {
    static: path.join(__dirname, '_distribute/'),
    compress: false,
    port: 9001,
  },
  plugins: [
    extractStyles,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '_develop/images'),
          to: path.resolve(__dirname, '_distribute/images'),
          noErrorOnMissing: true, // Avoid errors if folder is empty
        },
      ],
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['_distribute/**'],
      cleanAfterEveryBuildPatterns: [],
      verbose: true,
      dry: false,
    }),
    new webpack.ProvidePlugin({}),
    new HtmlWebpackPlugin({
      template: './_develop/templates/index.pug',
      filename: 'index.html',
    }),
    new HtmlWebpackPugPlugin(),
    new HtmlWebpackInlineSVGPlugin({
      svgoConfig: {
        plugins: [
          { name: 'preset-default' },
          { name: 'removeViewBox', active: false },
        ],
      },
    }),
  ],
};

if (process.env.npm_lifecycle_event === 'start') {
  console.log('* * * * * * * * * *');
  console.log('** RUNNING: START');
  console.log('** START: webpack --watch - rebuilds the distribute folder.');
  console.log('** SERVER: webpack-dev-server --open - ...');
  console.log('* * * * * * * * * *');
}

if (process.env.npm_lifecycle_event === 'server') {
  console.log('* * * * * * * * * *');
  console.log('** RUNNING: SERVER');
  console.log('** START: webpack --watch - rebuilds the distribute folder.');
  console.log('** SERVER: webpack-dev-server --open - serves immediate updates from memory');
  console.log('* * * * * * * * * *');
}

if (process.env.NODE_ENV === 'production') {
  console.log('** RUNNING: PRODUCTION BUILD');
}