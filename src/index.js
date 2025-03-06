const os = require("os");

const { validate } = require("schema-utils");

const {
  throttleAll,
  memoize,
  htmlMinifierTerser,
  swcMinify,
  swcMinifyFragment,
  minifyHtmlNode,
} = require("./utils");
const schema = require("./options.json");
const { minify } = require("./minify");

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("jest-worker").Worker} JestWorker */

/** @typedef {RegExp | string} Rule */
/** @typedef {Rule[] | Rule} Rules */

/** @typedef {Error & { plugin?: string, text?: string, source?: string } | string} Warning */

/**
 * @typedef {Object} WarningObject
 * @property {string} message
 * @property {string} [plugin]
 * @property {string} [text]
 * @property {number} [line]
 * @property {number} [column]
 */

/**
 * @typedef {Object} ErrorObject
 * @property {string} message
 * @property {number} [line]
 * @property {number} [column]
 * @property {string} [stack]
 */

/**
 * @typedef {Object} MinimizedResultObj
 * @property {string} code
 * @property {Array<Error | ErrorObject| string>} [errors]
 * @property {Array<Warning | WarningObject | string>} [warnings]
 */

/**
 * @typedef {MinimizedResultObj | string} MinimizedResult
 */

/**
 * @typedef {{ [file: string]: string }} Input
 */

/**
 * @typedef {{ [key: string]: any }} CustomOptions
 */

/**
 * @template T
 * @typedef {T extends infer U ? U : CustomOptions} InferDefaultType
 */

/**
 * @template T
 * @typedef {T extends any[] ? { [P in keyof T]?: InferDefaultType<T[P]> } : InferDefaultType<T>} MinimizerOptions
 */

/**
 * @template T
 * @callback BasicMinimizerImplementation
 * @param {Input} input
 * @param {InferDefaultType<T>} minifyOptions
 * @returns {Promise<MinimizedResult> | MinimizedResult}
 */

/**
 * @typedef {object} MinimizeFunctionHelpers
 * @property {() => boolean | undefined} [supportsWorkerThreads]
 */

/**
 * @template T
 * @typedef {T extends any[] ? { [P in keyof T]: BasicMinimizerImplementation<T[P]> & MinimizeFunctionHelpers; } : BasicMinimizerImplementation<T> & MinimizeFunctionHelpers} MinimizerImplementation
 */

/**
 * @template T
 * @typedef {Object} InternalOptions
 * @property {string} name
 * @property {string} input
 * @property {{ implementation: MinimizerImplementation<T>, options: MinimizerOptions<T> }} minimizer
 */

/**
 * @typedef InternalResult
 * @property {Array<{ code: string }>} outputs
 * @property {Array<Warning | WarningObject | string>} warnings
 * @property {Array<Error | ErrorObject | string>} errors
 */

/**
 * @template T
 * @typedef {JestWorker & { transform: (options: string) => Promise<InternalResult>, minify: (options: InternalOptions<T>) => Promise<InternalResult> }} MinimizerWorker
 */

/**
 * @typedef {undefined | boolean | number} Parallel
 */

/**
 * @typedef {Object} BasePluginOptions
 * @property {Rule} [test]
 * @property {Rule} [include]
 * @property {Rule} [exclude]
 * @property {Parallel} [parallel]
 */

/**
 * @template T
 * @typedef {BasePluginOptions & { minimizer: { implementation: MinimizerImplementation<T>, options: MinimizerOptions<T> } }} InternalPluginOptions
 */

/**
 * @template T
 * @typedef {T extends import("html-minifier-terser").Options ? { minify?: MinimizerImplementation<T> | undefined, minimizerOptions?: MinimizerOptions<T> | undefined } : { minify: MinimizerImplementation<T>, minimizerOptions?: MinimizerOptions<T> | undefined }} DefinedDefaultMinimizerAndOptions
 */

const getSerializeJavascript = memoize(() =>
  // eslint-disable-next-line global-require
  require("serialize-javascript"),
);

/**
 * @template [T=import("html-minifier-terser").Options]
 */
class HtmlMinimizerPlugin {
  /**
   * @param {BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>} [options]
   */
  constructor(options) {
    validate(/** @type {Schema} */ (schema), options || {}, {
      name: "Html Minimizer Plugin",
      baseDataPath: "options",
    });

    const {
      minify = /** @type {BasicMinimizerImplementation<T>} */ (
        htmlMinifierTerser
      ),
      minimizerOptions = /** @type {MinimizerOptions<T>} */ ({}),
      parallel = true,
      test = /\.html(\?.*)?$/i,
      include,
      exclude,
    } = options || {};

    /**
     * @private
     * @type {InternalPluginOptions<T>}
     */
    this.options = {
      test,
      parallel,
      include,
      exclude,
      minimizer: {
        implementation: /** @type {MinimizerImplementation<T>} */ (minify),
        options: /** @type {MinimizerOptions<T>} */ (minimizerOptions),
      },
    };
  }

  /**
   * @private
   * @param {any} warning
   * @param {string} file
   * @returns {Error & { hideStack?: boolean, file?: string } | undefined}
   */
  static buildWarning(warning, file) {
    /**
     * @type {Error & { hideStack?: true, file?: string }}
     */
    const builtWarning = new Error(
      warning instanceof Error
        ? warning.message
        : typeof warning.message !== "undefined"
          ? warning.message
          : warning.toString(),
    );

    builtWarning.name = "Warning";
    builtWarning.hideStack = true;
    builtWarning.file = file;

    return builtWarning;
  }

  /**
   * @private
   * @param {any} error
   * @param {string} file
   * @returns {Error}
   */
  static buildError(error, file) {
    /**
     * @type {Error & { file?: string }}
     */
    let builtError;

    if (typeof error === "string") {
      builtError = new Error(`${file} from Html Minimizer plugin\n${error}`);
      builtError.file = file;

      return builtError;
    }

    if (error.stack) {
      // @ts-ignore
      builtError = new Error(
        `${file} from Html Minimizer plugin\n${
          typeof error.message !== "undefined" ? error.message : ""
        }\n${error.stack}`,
      );
      builtError.file = file;

      return builtError;
    }

    builtError = new Error(
      `${file} from Html Minimizer plugin\n${error.message}`,
    );
    builtError.file = file;

    return builtError;
  }

  /**
   * @private
   * @param {Parallel} parallel
   * @returns {number}
   */
  static getAvailableNumberOfCores(parallel) {
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus =
      typeof os.availableParallelism === "function"
        ? { length: os.availableParallelism() }
        : os.cpus() || { length: 1 };

    return parallel === true || typeof parallel === "undefined"
      ? cpus.length - 1
      : Math.min(parallel || 0, cpus.length - 1);
  }

  /**
   * @private
   * @template T
   * @param {BasicMinimizerImplementation<T> & MinimizeFunctionHelpers} implementation
   * @returns {boolean}
   */
  static isSupportsWorkerThreads(implementation) {
    return typeof implementation.supportsWorkerThreads !== "undefined"
      ? implementation.supportsWorkerThreads() !== false
      : true;
  }

  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {{availableNumberOfCores: number}} optimizeOptions
   * @returns {Promise<void>}
   */
  async optimize(compiler, compilation, assets, optimizeOptions) {
    const cache = compilation.getCache("HtmlMinimizerWebpackPlugin");
    let numberOfAssets = 0;
    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          const { info } = /** @type {Asset} */ (compilation.getAsset(name));

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return false;
          }

          if (
            !compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
              // eslint-disable-next-line no-undefined
              undefined,
              this.options,
            )(name)
          ) {
            return false;
          }

          return true;
        })
        .map(async (name) => {
          const { info, source } = /** @type {Asset} */ (
            compilation.getAsset(name)
          );

          const eTag = cache.getLazyHashedEtag(source);
          const cacheItem = cache.getItemCache(name, eTag);
          const output = await cacheItem.getPromise();

          if (!output) {
            numberOfAssets += 1;
          }

          return { name, info, inputSource: source, output, cacheItem };
        }),
    );

    if (assetsForMinify.length === 0) {
      return;
    }

    /** @type {undefined | (() => MinimizerWorker<T>)} */
    let getWorker;
    /** @type {undefined | MinimizerWorker<T>} */
    let initializedWorker;
    /** @type {undefined | number} */
    let numberOfWorkers;

    if (optimizeOptions.availableNumberOfCores > 0) {
      // Do not create unnecessary workers when the number of files is less than the available cores, it saves memory
      numberOfWorkers = Math.min(
        numberOfAssets,
        optimizeOptions.availableNumberOfCores,
      );
      // eslint-disable-next-line consistent-return
      getWorker = () => {
        if (initializedWorker) {
          return initializedWorker;
        }

        // eslint-disable-next-line global-require
        const { Worker } = require("jest-worker");

        initializedWorker =
          /** @type {MinimizerWorker<T>} */
          (
            new Worker(require.resolve("./minify"), {
              numWorkers: numberOfWorkers,
              enableWorkerThreads: Array.isArray(
                this.options.minimizer.implementation,
              )
                ? this.options.minimizer.implementation.every((item) =>
                    HtmlMinimizerPlugin.isSupportsWorkerThreads(item),
                  )
                : HtmlMinimizerPlugin.isSupportsWorkerThreads(
                    this.options.minimizer.implementation,
                  ),
            })
          );

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

    const { RawSource } = compiler.webpack.sources;
    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(async () => {
        const { name, inputSource, cacheItem } = asset;
        let { output } = asset;
        let input;

        const sourceFromInputSource = inputSource.source();

        if (!output) {
          input = sourceFromInputSource;

          if (Buffer.isBuffer(input)) {
            input = input.toString();
          }

          /**
           * @type {InternalOptions<T>}
           */
          const options = {
            name,
            input,
            minimizer: {
              implementation: this.options.minimizer.implementation,
              options: this.options.minimizer.options,
            },
          };

          let result;

          try {
            result = await (getWorker
              ? getWorker().transform(getSerializeJavascript()(options))
              : minify(options));
          } catch (error) {
            compilation.errors.push(
              /** @type {WebpackError} */
              (HtmlMinimizerPlugin.buildError(error, name)),
            );

            return;
          }

          output = { warnings: [], errors: [] };
          output.source = new RawSource(
            result.outputs[result.outputs.length - 1].code,
          );

          await cacheItem.storePromise({
            source: output.source,
            errors: output.errors,
            warnings: output.warnings,
          });
        }

        const newInfo = { minimized: true };

        if (output.warnings && output.warnings.length > 0) {
          for (const warning of output.warnings) {
            compilation.warnings.push(
              /** @type {WebpackError} */
              (HtmlMinimizerPlugin.buildWarning(warning, name)),
            );
          }
        }

        if (output.errors && output.errors.length > 0) {
          for (const error of output.errors) {
            compilation.errors.push(
              /** @type {WebpackError} */
              (HtmlMinimizerPlugin.buildError(error, name)),
            );
          }
        }

        compilation.updateAsset(name, output.source, newInfo);
      });
    }

    const limit =
      getWorker && numberOfAssets > 0
        ? /** @type {number} */ (numberOfWorkers)
        : scheduledTasks.length;

    await throttleAll(limit, scheduledTasks);

    if (initializedWorker) {
      await initializedWorker.end();
    }
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    const pluginName = this.constructor.name;
    const availableNumberOfCores =
      HtmlMinimizerPlugin.getAvailableNumberOfCores(this.options.parallel);

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
          }),
      );

      compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
        stats.hooks.print
          .for("asset.info.minimized")
          .tap(
            "html-minimizer-webpack-plugin",
            (minimized, { green, formatFlag }) =>
              minimized
                ? /** @type {Function} */ (green)(
                    /** @type {Function} */ (formatFlag)("minimized"),
                  )
                : "",
          );
      });
    });
  }
}

HtmlMinimizerPlugin.htmlMinifierTerser = htmlMinifierTerser;
HtmlMinimizerPlugin.swcMinify = swcMinify;
HtmlMinimizerPlugin.swcMinifyFragment = swcMinifyFragment;
HtmlMinimizerPlugin.minifyHtmlNode = minifyHtmlNode;

module.exports = HtmlMinimizerPlugin;
