const path = require('path');

module.exports = (env, argv) => {
  return {
    mode: 'production',
    entry: {
      index: path.join(__dirname, 'src', 'index.ts'),
    },
    output: {
      path: path.join(__dirname, 'www'),
      filename: 'main.js',
      library: 'main',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [{ loader: 'ts-loader'}]
        }
      ]
    },
    devServer: {
      contentBase: 'www',
      port: 8080
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [
        "node_modules"
      ]
    },
  }
};