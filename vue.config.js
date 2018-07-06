const webpack = require('webpack');

const path = require('path');

module.exports = {
  baseUrl: '/Vue-Player/dist/',
  configureWebpack: {
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          stylus: {
            import: [path.resolve('./src/lib/styles/mixins/index.styl')],
          }
        }
      })
    ],
  },
}