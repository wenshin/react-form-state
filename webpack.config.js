const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');

const isBuild = process.argv.join('').indexOf('webpack-dev-server') === -1;

const BASE_PATH = './';
const EXAMPLES_PATH = path.join(BASE_PATH, '/examples');
const SRC_PATH = path.join(BASE_PATH, '/src');
const BUILD_PATH = path.join(BASE_PATH, '/build');
const BUILD_EXAMPLES_PATH = path.join(BUILD_PATH, '/examples');

const STATIC_URL = '/static/';

const FILENAME_TMPL = isBuild ? '[name]-[hash].min.' : '[name].';

/**
 * Get Plugins
 */
let plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new HtmlWebpackPlugin({
    template: path.join(EXAMPLES_PATH, 'index.html'),
    inject: 'body'
  })
];

if (isBuild) {
  plugins = plugins.concat([
    // NOTE：如果已经压缩过的文件被重复处理，会非常耗时
    new webpack.optimize.UglifyJsPlugin()
  ]);
}


const webpackConfig = {
  entry: {
    app: path.resolve(path.join(EXAMPLES_PATH, 'index.entry.jsx.js'))
  },

  // 表示输出文件
  output: {
    filename: FILENAME_TMPL + 'js',
    chunkFilename: FILENAME_TMPL.replace('hash', 'chunkhash') + 'js',
    // NOTE: 必须是绝对路径
    // path: path.join(path.resolve(BUILD_EXAMPLES_PATH), STATIC_URL),
    path: path.resolve(BUILD_EXAMPLES_PATH),
    // 在 index.html 中的静态文件使用相对地址
    // publicPath: STATIC_URL,
  },

  devServer: {
    contentBase: BUILD_EXAMPLES_PATH,
    compress: true,
    port: 8080,
    // NOTE devServer.publicPath 必须和 output.publicPath 一致
    // publicPath: STATIC_URL,
    hot: true,
    // 不显示太多的提示信息
    // quiet: true,
    stats: {
      assets: false,
      chunks: false,
      children: false,
      modules: false,
      colors: true
    },
    // 可通过 IP 地址访问
    host: '0.0.0.0'
  },
  watch: !isBuild,

  module: {
    rules: [
      {
        test: /\.(es6|js|jsx|jsx\.js)$/,
        exclude: /(dist|vendor|node_modules|min\.js)/,
        use: [{
          loader: 'babelsrc-loader'
        }, {
          loader: 'babel-loader',
          options: {
            cacheDirectory: '/tmp/'
          }
        }],
      }, {
        test: /\.less$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'less-loader' // compiles Less to CSS
        }]
      }, {
        test: /\.css$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }]
      }
    ]
  },

  plugins,
  // resolve主要配置 require 模块时的模块查找相关功能
  resolve: {
    alias: {
      [pkg.name]: path.resolve(SRC_PATH)
    },
    // 配置模块的根目录，可以是数组。NOTE: 必须是绝对路径
    modules: ['node_modules']
  },
  /**
   * 默认情况下，webpack寻找loader的路径是当前entry所在的路径
   * 通过resolveLoader.root更改loader的寻找路径
   */
  resolveLoader: {
    modules: ['webpack-loaders', 'node_modules']
  }
};

if (!isBuild) {
  // devtool 不要用 eval 模式，虽然这能带来初次构建减少 1s 左右的好处，
  // 但是这会导致刷新页面中断无效，影响调试
  // Chrome 升级49+ 后会导致 cheap-module-source-map 失效
  // https://github.com/webpack/webpack/issues/2145
  webpackConfig.devtool = '#module-source-map';
}

module.exports = webpackConfig;
