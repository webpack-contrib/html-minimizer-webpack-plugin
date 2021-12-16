export = HtmlMinimizerPlugin;
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("jest-worker").Worker} JestWorker */
/** @typedef {import("./utils.js").HtmlMinifierTerserOptions} HtmlMinifierTerserOptions */
/** @typedef {RegExp | string} Rule */
/** @typedef {Rule[] | Rule} Rules */
/**
 * @typedef {Object} MinimizedResult
 * @property {string} code
 * @property {Array<unknown>} [errors]
 * @property {Array<unknown>} [warnings]
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
 * @typedef {InferDefaultType<T> | undefined} MinimizerOptions
 */
/**
 * @template T
 * @callback MinimizerImplementation
 * @param {Input} input
 * @param {MinimizerOptions<T>} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
/**
 * @template T
 * @typedef {Object} Minimizer
 * @property {MinimizerImplementation<T>} implementation
 * @property {MinimizerOptions<T> | undefined} [options]
 */
/**
 * @template T
 * @typedef {Object} InternalOptions
 * @property {string} name
 * @property {string} input
 * @property {T extends any[] ? { [P in keyof T]: Minimizer<T[P]>; } : Minimizer<T>} minimizer
 */
/**
 * @typedef InternalResult
 * @property {string} code
 * @property {Array<any>} warnings
 * @property {Array<any>} errors
 */
/**
 * @template T
 * @typedef {JestWorker & { transform: (options: string) => InternalResult, minify: (options: InternalOptions<T>) => InternalResult }} MinimizerWorker
 */
/**
 * @typedef {undefined | boolean | number} Parallel
 */
/**
 * @typedef {Object} BasePluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {Parallel} [parallel]
 */
/**
 * @template T
 * @typedef {BasePluginOptions & { minimizer: T extends any[] ? { [P in keyof T]: Minimizer<T[P]> } : Minimizer<T> }} InternalPluginOptions
 */
/**
 * @template T
 * @typedef {T extends HtmlMinifierTerserOptions
 *  ? { minify?: MinimizerImplementation<T> | undefined, minimizerOptions?: MinimizerOptions<T> | undefined }
 *  : T extends any[]
 *    ? { minify: { [P in keyof T]: MinimizerImplementation<T[P]>; }, minimizerOptions?: { [P in keyof T]?: MinimizerOptions<T[P]> | undefined; } | undefined }
 *    : { minify: MinimizerImplementation<T>, minimizerOptions?: MinimizerOptions<T> | undefined }} DefinedDefaultMinimizerAndOptions
 */
/**
 * @template [T=HtmlMinifierTerserOptions]
 */
declare class HtmlMinimizerPlugin<T = import("html-minifier-terser").Options> {
  /**
   * @private
   * @param {any} warning
   * @param {string} file
   * @returns {Error}
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
   * @param {BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>} [options]
   */
  constructor(
    options?:
      | (BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>)
      | undefined
  );
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
    Schema,
    Compiler,
    Compilation,
    WebpackError,
    Asset,
    JestWorker,
    HtmlMinifierTerserOptions,
    Rule,
    Rules,
    MinimizedResult,
    Input,
    CustomOptions,
    InferDefaultType,
    MinimizerOptions,
    MinimizerImplementation,
    Minimizer,
    InternalOptions,
    InternalResult,
    MinimizerWorker,
    Parallel,
    BasePluginOptions,
    InternalPluginOptions,
    DefinedDefaultMinimizerAndOptions,
  };
}
type Compiler = import("webpack").Compiler;
type BasePluginOptions = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  parallel?: Parallel;
};
type DefinedDefaultMinimizerAndOptions<T> =
  T extends import("html-minifier-terser").Options
    ? {
        minify?: MinimizerImplementation<T> | undefined;
        minimizerOptions?: MinimizerOptions<T> | undefined;
      }
    : T extends any[]
    ? {
        minify: { [P in keyof T]: MinimizerImplementation<T[P]> };
        minimizerOptions?:
          | { [P_1 in keyof T]?: MinimizerOptions<T[P_1]> }
          | undefined;
      }
    : {
        minify: MinimizerImplementation<T>;
        minimizerOptions?: MinimizerOptions<T> | undefined;
      };
import { htmlMinifierTerser } from "./utils";
type Schema = import("schema-utils/declarations/validate").Schema;
type Compilation = import("webpack").Compilation;
type WebpackError = import("webpack").WebpackError;
type Asset = import("webpack").Asset;
type JestWorker = import("jest-worker").Worker;
type HtmlMinifierTerserOptions = import("./utils.js").HtmlMinifierTerserOptions;
type Rule = RegExp | string;
type Rules = Rule[] | Rule;
type MinimizedResult = {
  code: string;
  errors?: unknown[] | undefined;
  warnings?: unknown[] | undefined;
};
type Input = {
  [file: string]: string;
};
type CustomOptions = {
  [key: string]: any;
};
type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
type MinimizerOptions<T> = InferDefaultType<T> | undefined;
type MinimizerImplementation<T> = (
  input: Input,
  minimizerOptions?: MinimizerOptions<T>
) => Promise<MinimizedResult>;
type Minimizer<T> = {
  implementation: MinimizerImplementation<T>;
  options?: MinimizerOptions<T> | undefined;
};
type InternalOptions<T> = {
  name: string;
  input: string;
  minimizer: T extends any[]
    ? { [P in keyof T]: Minimizer<T[P]> }
    : Minimizer<T>;
};
type InternalResult = {
  code: string;
  warnings: Array<any>;
  errors: Array<any>;
};
type MinimizerWorker<T> = Worker & {
  transform: (options: string) => InternalResult;
  minify: (options: InternalOptions<T>) => InternalResult;
};
type Parallel = undefined | boolean | number;
type InternalPluginOptions<T> = BasePluginOptions & {
  minimizer: T extends any[]
    ? { [P in keyof T]: Minimizer<T[P]> }
    : Minimizer<T>;
};
import { minify } from "./minify";
import { Worker } from "jest-worker";
