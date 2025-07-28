export = HtmlMinimizerPlugin;
/**
 * @template [T=import("html-minifier-terser").Options]
 * @typedef {BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>} PluginOptions
 */
/**
 * @template {PluginOptions<CustomOptions>} [T=PluginOptions<import("html-minifier-terser").Options>]
 */
declare class HtmlMinimizerPlugin<
  T extends PluginOptions<CustomOptions> = PluginOptions<
    import("html-minifier-terser").Options
  >,
> {
  /**
   * @private
   * @param {EXPECTED_ANY} warning The warning to build
   * @param {string} file The file path
   * @returns {Error & { hideStack?: boolean, file?: string }} The built warning
   */
  private static buildWarning;
  /**
   * @private
   * @param {EXPECTED_ANY} error The error to build
   * @param {string} file The file path
   * @returns {Error} The built error
   */
  private static buildError;
  /**
   * @private
   * @param {Parallel} parallel Parallel configuration
   * @returns {number} The number of available cores
   */
  private static getAvailableNumberOfCores;
  /**
   * @private
   * @template T
   * @param {BasicMinimizerImplementation<T> & MinimizeFunctionHelpers} implementation The minimizer implementation
   * @returns {boolean} Whether worker threads are supported
   */
  private static isSupportsWorkerThreads;
  /**
   * @param {T=} options Plugin options
   */
  constructor(options?: T | undefined);
  /**
   * @private
   * @type {InternalPluginOptions<T>}
   */
  private options;
  /**
   * @private
   * @param {Compiler} compiler The webpack compiler
   * @param {Compilation} compilation The webpack compilation
   * @param {Record<string, import("webpack").sources.Source>} assets The assets to optimize
   * @param {{availableNumberOfCores: number}} optimizeOptions Optimization options
   * @returns {Promise<void>} Promise that resolves when optimization is complete
   */
  private optimize;
  /**
   * @param {Compiler} compiler The webpack compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace HtmlMinimizerPlugin {
  export {
    htmlMinifierTerser,
    swcMinify,
    swcMinifyFragment,
    minifyHtmlNode,
    Schema,
    Compiler,
    Compilation,
    WebpackError,
    Asset,
    JestWorker,
    Rule,
    Rules,
    EXPECTED_ANY,
    Warning,
    WarningObject,
    ErrorObject,
    MinimizedResultObj,
    MinimizedResult,
    Input,
    CustomOptions,
    InferDefaultType,
    MinimizerOptions,
    BasicMinimizerImplementation,
    MinimizeFunctionHelpers,
    MinimizerImplementation,
    InternalOptions,
    InternalResult,
    MinimizerWorker,
    Parallel,
    BasePluginOptions,
    InternalPluginOptions,
    DefinedDefaultMinimizerAndOptions,
    PluginOptions,
  };
}
import { htmlMinifierTerser } from "./utils";
import { swcMinify } from "./utils";
import { swcMinifyFragment } from "./utils";
import { minifyHtmlNode } from "./utils";
type Schema = import("schema-utils/declarations/validate").Schema;
type Compiler = import("webpack").Compiler;
type Compilation = import("webpack").Compilation;
type WebpackError = import("webpack").WebpackError;
type Asset = import("webpack").Asset;
type JestWorker = import("jest-worker").Worker;
type Rule = RegExp | string;
type Rules = Rule[] | Rule;
type EXPECTED_ANY = any;
type Warning =
  | (Error & {
      plugin?: string;
      text?: string;
      source?: string;
    })
  | string;
type WarningObject = {
  /**
   * The warning message
   */
  message: string;
  /**
   * The plugin name
   */
  plugin?: string | undefined;
  /**
   * The text content
   */
  text?: string | undefined;
  /**
   * The line number
   */
  line?: number | undefined;
  /**
   * The column number
   */
  column?: number | undefined;
};
type ErrorObject = {
  /**
   * The error message
   */
  message: string;
  /**
   * The line number
   */
  line?: number | undefined;
  /**
   * The column number
   */
  column?: number | undefined;
  /**
   * The error stack trace
   */
  stack?: string | undefined;
};
type MinimizedResultObj = {
  /**
   * The minimized code
   */
  code: string;
  /**
   * Array of errors
   */
  errors?: Array<Error | ErrorObject | string> | undefined;
  /**
   * Array of warnings
   */
  warnings?: Array<Warning | WarningObject | string> | undefined;
};
type MinimizedResult = MinimizedResultObj | string;
type Input = {
  [file: string]: string;
};
type CustomOptions = {
  [key: string]: EXPECTED_ANY;
};
type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
type MinimizerOptions<T> = T extends any[]
  ? { [P in keyof T]?: InferDefaultType<T[P]> }
  : InferDefaultType<T>;
type BasicMinimizerImplementation<T> = (
  input: Input,
  minifyOptions: InferDefaultType<T>,
) => Promise<MinimizedResult> | MinimizedResult;
type MinimizeFunctionHelpers = {
  /**
   * - Function to check if worker threads are supported
   */
  supportsWorkerThreads?: (() => boolean | undefined) | undefined;
};
type MinimizerImplementation<T> = T extends any[]
  ? {
      [P in keyof T]: BasicMinimizerImplementation<T[P]> &
        MinimizeFunctionHelpers;
    }
  : BasicMinimizerImplementation<T> & MinimizeFunctionHelpers;
type InternalOptions<T> = {
  /**
   * The name of the minimizer
   */
  name: string;
  /**
   * The input content
   */
  input: string;
  /**
   * The minimizer configuration
   */
  minimizer: {
    implementation: MinimizerImplementation<T>;
    options: MinimizerOptions<T>;
  };
};
type InternalResult = {
  /**
   * Array of output objects
   */
  outputs: Array<{
    code: string;
  }>;
  /**
   * Array of warnings
   */
  warnings: Array<Warning | WarningObject | string>;
  /**
   * Array of errors
   */
  errors: Array<Error | ErrorObject | string>;
};
type MinimizerWorker<T> = JestWorker & {
  transform: (options: string) => Promise<InternalResult>;
  minify: (options: InternalOptions<T>) => Promise<InternalResult>;
};
type Parallel = undefined | boolean | number;
type BasePluginOptions = {
  /**
   * Test rule for files to process
   */
  test?: Rule | undefined;
  /**
   * Include rule for files to process
   */
  include?: Rule | undefined;
  /**
   * Exclude rule for files to process
   */
  exclude?: Rule | undefined;
  /**
   * Parallel processing configuration
   */
  parallel?: Parallel | undefined;
};
type InternalPluginOptions<T> = BasePluginOptions & {
  minimizer: {
    implementation: MinimizerImplementation<T>;
    options: MinimizerOptions<T>;
  };
};
type DefinedDefaultMinimizerAndOptions<T> =
  T extends import("html-minifier-terser").Options
    ? {
        minify?: MinimizerImplementation<T> | undefined;
        minimizerOptions?: MinimizerOptions<T> | undefined;
      }
    : {
        minify: MinimizerImplementation<T>;
        minimizerOptions?: MinimizerOptions<T> | undefined;
      };
type PluginOptions<T = import("html-minifier-terser").Options> =
  BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>;
