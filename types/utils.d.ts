export type Task<T> = () => Promise<T>;
export type MinimizedResult = import("./index.js").MinimizedResult;
export type CustomOptions = import("./index.js").CustomOptions;
export type Input = import("./index.js").Input;
/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */
/**
 * Run tasks with limited concurrency.
 * @template T
 * @param {number} limit - Limit of tasks that run at once.
 * @param {Task<T>[]} tasks - List of tasks to run.
 * @returns {Promise<T[]>} A promise that fulfills to an array of the results
 */
export function throttleAll<T>(limit: number, tasks: Task<T>[]): Promise<T[]>;
/**
 * @template T
 * @param fn {(function(): any) | undefined}
 * @returns {function(): T}
 */
export function memoize<T>(fn: (() => any) | undefined): () => T;
/**
 * @param {Input} input
 * @param {CustomOptions } [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
export function htmlMinifierTerser(
  input: Input,
  minimizerOptions?: CustomOptions,
): Promise<MinimizedResult>;
export namespace htmlMinifierTerser {
  function supportsWorkerThreads(): boolean;
}
/**
 * @param {Input} input
 * @param {CustomOptions} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
export function swcMinify(
  input: Input,
  minimizerOptions?: CustomOptions,
): Promise<MinimizedResult>;
export namespace swcMinify {
  function supportsWorkerThreads(): boolean;
}
/**
 * @param {Input} input
 * @param {CustomOptions} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
export function swcMinifyFragment(
  input: Input,
  minimizerOptions?: CustomOptions,
): Promise<MinimizedResult>;
export namespace swcMinifyFragment {
  function supportsWorkerThreads(): boolean;
}
/**
 * @param {Input} input
 * @param {CustomOptions} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
export function minifyHtmlNode(
  input: Input,
  minimizerOptions?: CustomOptions,
): Promise<MinimizedResult>;
export namespace minifyHtmlNode {
  function supportsWorkerThreads(): boolean;
}
