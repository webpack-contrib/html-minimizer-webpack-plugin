import path from "path";

import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";
import CopyPlugin from "copy-webpack-plugin";

export default function getCompiler(htmlFixture, config = {}) {
  const compiler = webpack(
    Array.isArray(config)
      ? config
      : {
          mode: "production",
          bail: true,
          devtool: config.devtool || false,
          context: path.resolve(__dirname, "../fixtures"),
          entry: path.resolve(__dirname, "../fixtures/entry.js"),
          optimization: {
            minimize: false,
            emitOnErrors: true,
          },
          output: {
            pathinfo: false,
            path: path.resolve(__dirname, "../dist"),
            filename: "[name].js",
            chunkFilename: "[id].[name].js",
            assetModuleFilename: "[name][ext]",
          },
          plugins: [].concat(
            htmlFixture
              ? [
                  new CopyPlugin({
                    patterns: [
                      {
                        context: path.resolve(__dirname, "..", "fixtures"),
                        from: htmlFixture,
                      },
                    ],
                  }),
                ]
              : []
          ),
          module: {
            rules: [].concat(
              !htmlFixture
                ? [
                    {
                      test: /\.html$/i,
                      type: "asset/resource",
                    },
                  ]
                : []
            ),
          },
          ...config,
        }
  );

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
}
