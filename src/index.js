import os from 'os';
import crypto from 'crypto';

import webpack, {
  ModuleFilenameHelpers,
  version as webpackVersion,
} from 'webpack';

import validateOptions from 'schema-utils';
import serialize from 'serialize-javascript';
import HtmlMinimizerPackageJson from 'html-minifier-terser/package.json';
import pLimit from 'p-limit';
import Worker from 'jest-worker';

import schema from './options.json';

import { minify as minifyFn } from './minify';

// webpack 5 exposes the sources property to ensure the right version of webpack-sources is used
const { RawSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

class HtmlMinimizerPlugin {
  constructor(options = {}) {
    validateOptions(schema, options, {
      name: 'Html Minimizer Plugin',
      baseDataPath: 'options',
    });

    const {
      minify,
      minimizerOptions = {},
      test = /\.html(\?.*)?$/i,
      cache = true,
      cacheKeys = (defaultCacheKeys) => defaultCacheKeys,
      parallel = true,
      include,
      exclude,
    } = options;

    this.options = {
      test,
      cache,
      cacheKeys,
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

  // eslint-disable-next-line consistent-return
  static getAsset(compilation, name) {
    // New API
    if (compilation.getAsset) {
      return compilation.getAsset(name);
    }

    if (compilation.assets[name]) {
      return { name, source: compilation.assets[name], info: {} };
    }
  }

  static updateAsset(compilation, name, newSource, assetInfo) {
    // New API
    if (compilation.updateAsset) {
      compilation.updateAsset(name, newSource, assetInfo);
    }

    // eslint-disable-next-line no-param-reassign
    compilation.assets[name] = newSource;
  }

  async optimize(compiler, compilation, assets, CacheEngine, weakCache) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(
      // eslint-disable-next-line no-undefined
      undefined,
      this.options
    );

    const assetNames = Object.keys(
      typeof assets === 'undefined' ? compilation.assets : assets
    ).filter((assetName) => matchObject(assetName));

    if (assetNames.length === 0) {
      return Promise.resolve();
    }

    const availableNumberOfCores = HtmlMinimizerPlugin.getAvailableNumberOfCores(
      this.options.parallel
    );

    let concurrency = Infinity;
    let worker;

    if (availableNumberOfCores > 0) {
      // Do not create unnecessary workers when the number of files is less than the available cores, it saves memory
      const numWorkers = Math.min(assetNames.length, availableNumberOfCores);

      concurrency = numWorkers;

      worker = new Worker(require.resolve('./minify'), { numWorkers });

      // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
      const workerStdout = worker.getStdout();

      if (workerStdout) {
        workerStdout.on('data', (chunk) => {
          return process.stdout.write(chunk);
        });
      }

      const workerStderr = worker.getStderr();

      if (workerStderr) {
        workerStderr.on('data', (chunk) => {
          return process.stderr.write(chunk);
        });
      }
    }

    const limit = pLimit(concurrency);

    const cache = new CacheEngine(
      compilation,
      {
        cache: this.options.cache,
      },
      weakCache
    );

    const scheduledTasks = [];

    for (const assetName of assetNames) {
      scheduledTasks.push(
        limit(async () => {
          const { source: assetSource, info } = HtmlMinimizerPlugin.getAsset(
            compilation,
            assetName
          );

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return;
          }

          let input = assetSource.source();

          if (Buffer.isBuffer(input)) {
            input = input.toString();
          }

          const cacheData = { assetName, assetSource };

          if (HtmlMinimizerPlugin.isWebpack4()) {
            if (this.options.cache) {
              cacheData.input = input;
              cacheData.cacheKeys = this.options.cacheKeys(
                {
                  nodeVersion: process.version,
                  // eslint-disable-next-line global-require
                  'html-minimizer-webpack-plugin': require('../package.json')
                    .version,
                  htmlMinimizer: HtmlMinimizerPackageJson.version,
                  'html-minimizer-webpack-plugin-options': this.options,
                  assetName,
                  contentHash: crypto
                    .createHash('md4')
                    .update(input)
                    .digest('hex'),
                },
                assetName
              );
            }
          }

          let output = await cache.get(cacheData, { RawSource });

          if (!output) {
            try {
              const minimizerOptions = {
                assetName,
                input,
                minimizerOptions: this.options.minimizerOptions,
                minify: this.options.minify,
              };

              output = await (worker
                ? worker.transform(serialize(minimizerOptions))
                : minifyFn(minimizerOptions));
            } catch (error) {
              compilation.errors.push(
                HtmlMinimizerPlugin.buildError(
                  error,
                  assetName,
                  compiler.context
                )
              );

              return;
            }

            output.source = new RawSource(output.html);

            await cache.store({ ...output, ...cacheData });
          }

          HtmlMinimizerPlugin.updateAsset(
            compilation,
            assetName,
            output.source,
            {
              ...info,
              minimized: true,
            }
          );
        })
      );
    }

    const result = await Promise.all(scheduledTasks);

    if (worker) {
      await worker.end();
    }

    return result;
  }

  static isWebpack4() {
    return webpackVersion[0] === '4';
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    const weakCache = new WeakMap();

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      if (HtmlMinimizerPlugin.isWebpack4()) {
        // eslint-disable-next-line global-require
        const CacheEngine = require('./Webpack4Cache').default;

        compilation.hooks.optimizeChunkAssets.tapPromise(pluginName, () => {
          return this.optimize(
            compiler,
            compilation,
            // eslint-disable-next-line no-undefined
            undefined,
            CacheEngine,
            weakCache
          );
        });
      } else {
        // eslint-disable-next-line global-require
        const CacheEngine = require('./Webpack5Cache').default;

        // eslint-disable-next-line global-require
        const Compilation = require('webpack/lib/Compilation');

        compilation.hooks.processAssets.tapPromise(
          {
            name: pluginName,
            stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          },
          (assets) => this.optimize(compiler, compilation, assets, CacheEngine)
        );

        compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
          stats.hooks.print
            .for('asset.info.minimized')
            .tap(
              'html-minimizer-webpack-plugin',
              (minimized, { green, formatFlag }) =>
                // eslint-disable-next-line no-undefined
                minimized ? green(formatFlag('minimized')) : undefined
            );
        });
      }
    });
  }
}

export default HtmlMinimizerPlugin;
