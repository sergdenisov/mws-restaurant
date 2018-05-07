const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const API_KEY = "AIzaSyCRnfUWfANw0glEAZwOq4vauiP5iZLAXa0";

module.exports = {
  mode: "development",
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
    new HtmlWebpackPlugin({
      title: "Restaurant Reviews",
      template: "src/html/common.html",
      inject: false,
      chunks: ["index"],
      apiKey: API_KEY
    }),
    new HtmlWebpackPlugin({
      title: "Restaurant Info",
      filename: "restaurant.html",
      template: "src/html/common.html",
      inject: false,
      chunks: ["restaurant"],
      apiKey: API_KEY,
      restaurantPage: true
    })
  ],
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  }
};
