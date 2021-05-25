import os from "os";

import { validate } from "schema-utils";
import serialize from "serialize-javascript";
import pLimit from "p-limit";
import Worker from "jest-worker";

import schema from "./options.json";

import { htmlMinifierTerser } from "./utils";
import { minify as minifyFn } from "./minify";

class HtmlMinimizerPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: "Html Minimizer Plugin",
      baseDataPath: "options",
    });

    const {
      minify = htmlMinifierTerser,
      minimizerOptions,
      test = /\.html(\?.*)?$/i,
      parallel = true,
      include,
      exclude,
    } = options;

    this.options = {
      test,
      parallel,
      include,
      exclude,
      minify,
      minimizerOptions,
    };
  }

  static buildError(error, file, context) {
    return new Error(
      `${file} in "${context}" from Html Minimizer\n${error.stack}`
    );
  }

  static getAvailableNumberOfCores(parallel) {
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus = os.cpus() || { length: 1 };

    return parallel === true
      ? cpus.length - 1
      : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  async optimize(compiler, compilation, assets, optimizeOptions) {
    const cache = compilation.getCache("HtmlMinimizerWebpackPlugin");
    let numberOfAssetsForMinify = 0;
    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          const { info } = compilation.getAsset(name);

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return false;
          }

          if (
            !compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
              // eslint-disable-next-line no-undefined
              undefined,
              this.options
            )(name)
          ) {
            return false;
          }

          return true;
        })
        .map(async (name) => {
          const { info, source } = compilation.getAsset(name);

          const eTag = cache.getLazyHashedEtag(source);
          const cacheItem = cache.getItemCache(name, eTag);
          const output = await cacheItem.getPromise();

          if (!output) {
            numberOfAssetsForMinify += 1;
          }

          return { name, info, inputSource: source, output, cacheItem };
        })
    );

    let getWorker;
    let initializedWorker;
    let numberOfWorkers;

    if (optimizeOptions.availableNumberOfCores > 0) {
      // Do not create unnecessary workers when the number of files is less than the available cores, it saves memory
      numberOfWorkers = Math.min(
        numberOfAssetsForMinify,
        optimizeOptions.availableNumberOfCores
      );
      // eslint-disable-next-line consistent-return
      getWorker = () => {
        if (initializedWorker) {
          return initializedWorker;
        }

        initializedWorker = new Worker(require.resolve("./minify"), {
          numWorkers: numberOfWorkers,
          enableWorkerThreads: true,
        });

        // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
        const workerStdout = initializedWorker.getStdout();

        if (workerStdout) {
          workerStdout.on("data", (chunk) => process.stdout.write(chunk));
        }

        const workerStderr = initializedWorker.getStderr();

        if (workerStderr) {
          workerStderr.on("data", (chunk) => process.stderr.write(chunk));
        }

        return initializedWorker;
      };
    }

    const limit = pLimit(
      getWorker && numberOfAssetsForMinify > 0 ? numberOfWorkers : Infinity
    );

    const { RawSource } = compiler.webpack.sources;

    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(
        limit(async () => {
          const { name, inputSource, cacheItem } = asset;
          let { output } = asset;
          let input;

          const sourceFromInputSource = inputSource.source();

          if (!output) {
            input = sourceFromInputSource;

            if (Buffer.isBuffer(input)) {
              input = input.toString();
            }

            const options = {
              name,
              input,
              minimizerOptions: this.options.minimizerOptions,
              minify: this.options.minify,
            };

            try {
              output = await (getWorker
                ? getWorker().transform(serialize(options))
                : minifyFn(options));
            } catch (error) {
              compilation.errors.push(
                HtmlMinimizerPlugin.buildError(error, name, compiler.context)
              );

              return;
            }

            output.source = new RawSource(output.code);

            await cacheItem.storePromise({
              source: output.source,
            });
          }

          const newInfo = { minimized: true };
          const { source } = output;

          compilation.updateAsset(name, source, newInfo);
        })
      );
    }

    await Promise.all(scheduledTasks);

    if (initializedWorker) {
      await initializedWorker.end();
    }
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    const availableNumberOfCores = HtmlMinimizerPlugin.getAvailableNumberOfCores(
      this.options.parallel
    );

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          additionalAssets: true,
        },
        (assets) =>
          this.optimize(compiler, compilation, assets, {
            availableNumberOfCores,
          })
      );

      compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
        stats.hooks.print
          .for("asset.info.minimized")
          .tap(
            "html-minimizer-webpack-plugin",
            (minimized, { green, formatFlag }) =>
              // eslint-disable-next-line no-undefined
              minimized ? green(formatFlag("minimized")) : undefined
          );
      });
    });
  }
}

HtmlMinimizerPlugin.htmlMinifierTerser = htmlMinifierTerser;

export default HtmlMinimizerPlugin;
