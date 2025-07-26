export type Task<T> = () => Promise<T>;
export type MinimizedResult = import("./index.js").MinimizedResult;
export type CustomOptions = import("./index.js").CustomOptions;
export type Input = import("./index.js").Input;
export type EXPECTED_ANY = any;
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
export function htmlMinifierTerser(
  input: Input,
  minimizerOptions?: CustomOptions | undefined,
): Promise<MinimizedResult>;
export namespace htmlMinifierTerser {
  /**
   * @returns {boolean} Whether worker threads are supported
   */
  function supportsWorkerThreads(): boolean;
}
/**
 * @template T
 * @param {(() => EXPECTED_ANY) | undefined} fn The function to memoize
 * @returns {() => T} The memoized function
 */
export function memoize<T>(fn: (() => EXPECTED_ANY) | undefined): () => T;
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
export function minifyHtmlNode(
  input: Input,
  minimizerOptions?: CustomOptions | undefined,
): Promise<MinimizedResult>;
export namespace minifyHtmlNode {
  /**
   * @returns {boolean} Whether worker threads are supported
   */
  function supportsWorkerThreads(): boolean;
}
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
export function swcMinify(
  input: Input,
  minimizerOptions?: CustomOptions | undefined,
): Promise<MinimizedResult>;
export namespace swcMinify {
  /**
   * @returns {boolean} Whether worker threads are supported
   */
  function supportsWorkerThreads(): boolean;
}
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
export function swcMinifyFragment(
  input: Input,
  minimizerOptions?: CustomOptions | undefined,
): Promise<MinimizedResult>;
export namespace swcMinifyFragment {
  /**
   * @returns {boolean} Whether worker threads are supported
   */
  function supportsWorkerThreads(): boolean;
}
/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */
/**
 * Run tasks with limited concurrency.
 * @template T
 * @param {number} limit Limit of tasks that run at once.
 * @param {Task<T>[]} tasks List of tasks to run.
 * @returns {Promise<T[]>} A promise that fulfills to an array of the results
 */
export function throttleAll<T>(limit: number, tasks: Task<T>[]): Promise<T[]>;
