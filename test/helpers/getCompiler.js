import path from 'path';

import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

export default function getCompiler(config) {
  const compiler = webpack({
    mode: 'development',
    devtool: config.devtool || false,
    context: path.resolve(__dirname, '../fixtures'),
    optimization: {
      minimize: false,
    },
    output: {
      path: path.resolve(__dirname, '../outputs'),
      filename: '[name].js',
      chunkFilename: '[id].[name].js',
    },
    plugins: [],
    module: {},
    ...config,
  });

  if (!config.outputFileSystem) {
    const outputFileSystem = createFsFromVolume(new Volume());
    // Todo remove when we drop webpack@4 support
    outputFileSystem.join = path.join.bind(path);

    compiler.outputFileSystem = outputFileSystem;
  }

  return compiler;
}

getCompiler.isWebpack4 = () => webpack.version[0] === '4';
