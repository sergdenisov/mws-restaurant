module.exports = {
  plugins: [
    require("postcss-import"),
    // postcss-media-variables has to be used twice https://www.npmjs.com/package/postcss-media-variables#usage
    require("postcss-media-variables"),
    require("postcss-custom-properties"),
    require("postcss-media-variables"),
    require("autoprefixer")({ grid: true })
  ]
};
