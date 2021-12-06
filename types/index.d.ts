export default HtmlMinimizerPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type JestWorker = import("jest-worker").Worker;
export type HtmlMinifierTerserOptions =
  import("./utils.js").HtmlMinifierTerserOptions;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type MinimizedResult = {
  code: string;
  errors?: unknown[] | undefined;
  warnings?: unknown[] | undefined;
};
export type Input = {
  [file: string]: string;
};
export type CustomOptions = {
  [key: string]: any;
};
export type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
export type MinimizerOptions<T> = InferDefaultType<T> | undefined;
export type MinimizerImplementation<T> = (
  input: Input,
  minimizerOptions?: MinimizerOptions<T>
) => Promise<MinimizedResult>;
export type Minimizer<T> = {
  implementation: MinimizerImplementation<T>;
  options?: MinimizerOptions<T> | undefined;
};
export type InternalOptions<T> = {
  name: string;
  input: string;
  minimizer: T extends any[]
    ? { [P in keyof T]: Minimizer<T[P]> }
    : Minimizer<T>;
};
export type InternalResult = {
  code: string;
  warnings: Array<any>;
  errors: Array<any>;
};
export type MinimizerWorker<T> = Worker & {
  transform: (options: string) => InternalResult;
  minify: (options: InternalOptions<T>) => InternalResult;
};
export type Parallel = undefined | boolean | number;
export type BasePluginOptions = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  parallel?: Parallel;
};
export type InternalPluginOptions<T> = BasePluginOptions & {
  minimizer: T extends any[]
    ? { [P in keyof T]: Minimizer<T[P]> }
    : Minimizer<T>;
};
export type DefinedDefaultMinimizerAndOptions<T> =
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
  export { htmlMinifierTerser };
}
import { Worker } from "jest-worker";
import { htmlMinifierTerser } from "./utils";
