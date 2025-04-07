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
   * @param {any} warning
   * @param {string} file
   * @returns {Error & { hideStack?: boolean, file?: string } | undefined}
   */
  private static buildWarning;
  /**
   * @private
   * @param {any} error
   * @param {string} file
   * @returns {Error}
   */
  private static buildError;
  /**
   * @private
   * @param {Parallel} parallel
   * @returns {number}
   */
  private static getAvailableNumberOfCores;
  /**
   * @private
   * @template T
   * @param {BasicMinimizerImplementation<T> & MinimizeFunctionHelpers} implementation
   * @returns {boolean}
   */
  private static isSupportsWorkerThreads;
  /**
   * @param {T} [options]
   */
  constructor(options?: T);
  /**
   * @private
   * @type {InternalPluginOptions<T>}
   */
  private options;
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {{availableNumberOfCores: number}} optimizeOptions
   * @returns {Promise<void>}
   */
  private optimize;
  /**
   * @param {Compiler} compiler
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
type Warning =
  | (Error & {
      plugin?: string;
      text?: string;
      source?: string;
    })
  | string;
type WarningObject = {
  message: string;
  plugin?: string | undefined;
  text?: string | undefined;
  line?: number | undefined;
  column?: number | undefined;
};
type ErrorObject = {
  message: string;
  line?: number | undefined;
  column?: number | undefined;
  stack?: string | undefined;
};
type MinimizedResultObj = {
  code: string;
  errors?: (string | Error | ErrorObject)[] | undefined;
  warnings?: (Warning | WarningObject)[] | undefined;
};
type MinimizedResult = MinimizedResultObj | string;
type Input = {
  [file: string]: string;
};
type CustomOptions = {
  [key: string]: any;
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
  supportsWorkerThreads?: (() => boolean | undefined) | undefined;
};
type MinimizerImplementation<T> = T extends any[]
  ? {
      [P in keyof T]: BasicMinimizerImplementation<T[P]> &
        MinimizeFunctionHelpers;
    }
  : BasicMinimizerImplementation<T> & MinimizeFunctionHelpers;
type InternalOptions<T> = {
  name: string;
  input: string;
  minimizer: {
    implementation: MinimizerImplementation<T>;
    options: MinimizerOptions<T>;
  };
};
type InternalResult = {
  outputs: Array<{
    code: string;
  }>;
  warnings: Array<Warning | WarningObject | string>;
  errors: Array<Error | ErrorObject | string>;
};
type MinimizerWorker<T> = JestWorker & {
  transform: (options: string) => Promise<InternalResult>;
  minify: (options: InternalOptions<T>) => Promise<InternalResult>;
};
type Parallel = undefined | boolean | number;
type BasePluginOptions = {
  test?: Rule | undefined;
  include?: Rule | undefined;
  exclude?: Rule | undefined;
  parallel?: Parallel;
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
