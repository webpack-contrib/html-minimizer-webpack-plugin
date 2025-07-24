import path from "node:path";

import CopyPlugin from "copy-webpack-plugin";
import { Volume, createFsFromVolume } from "memfs";
import webpack from "webpack";

/**
 * @param {string=} htmlFixture The HTML fixture file path
 * @param {import("webpack").Configuration=} config The webpack configuration
 * @returns {import("webpack").Compiler} The webpack compiler instance
 */
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
          plugins: [
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
              : [],
          ].flat(),
          module: {
            rules: [
              !htmlFixture
                ? [
                    {
                      test: /\.html$/i,
                      type: "asset/resource",
                    },
                  ]
                : [],
            ].flat(),
          },
          ...config,
        },
  );

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
}
