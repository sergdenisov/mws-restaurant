const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const ServiceWorkerWebpackPlugin = require("serviceworker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const API_KEY = "AIzaSyCRnfUWfANw0glEAZwOq4vauiP5iZLAXa0";

module.exports = {
  mode: "production",
  entry: {
    index: "./src/js/index.js",
    restaurant: "./src/js/restaurant.js"
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ["css-loader", "postcss-loader"]
        })
      },
      {
        test: /\.jpg$/,
        loader: "responsive-loader",
        options: {
          min: 200,
          max: 800,
          name: "images/[name]-[width].[ext]"
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new ExtractTextPlugin("css/all.css"),
    new FaviconsWebpackPlugin({
      logo: "./src/images/favicon/favicon.png",
      prefix: "images/favicons/",
      persistentCache: false,
      background: "#fcf5e4",
      title: "MWS Restaurant",
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: true,
        favicons: true,
        firefox: true,
        opengraph: true,
        twitter: true,
        yandex: true,
        windows: true
      }
    }),
    new HtmlWebpackPlugin({
      title: "Restaurant Reviews",
      template: "src/html/common.html",
      inject: false,
      chunks: ["index"],
      apiKey: API_KEY,
      minify: {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true
      }
    }),
    new HtmlWebpackPlugin({
      title: "Restaurant Info",
      filename: "restaurant.html",
      template: "src/html/common.html",
      inject: false,
      chunks: ["restaurant"],
      apiKey: API_KEY,
      restaurantPage: true,
      minify: {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true
      }
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, "src/js/sw.js")
    }),
    new CopyWebpackPlugin([{ from: "src/manifest.json" }]),
    new CompressionPlugin({ include: [/.html/, /.js$/, /.css/] })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ sourceMap: true }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  devtool: "source-map",
  devServer: {
    contentBase: "./dist"
  }
};
