export type Task<T> = () => Promise<T>;
export type MinimizedResult = import("./index.js").MinimizedResult;
export type Input = import("./index.js").Input;
export type HtmlMinifierTerserOptions = import("html-minifier-terser").Options;
/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */
/**
 * Run tasks with limited concurency.
 * @template T
 * @param {number} limit - Limit of tasks that run at once.
 * @param {Task<T>[]} tasks - List of tasks to run.
 * @returns {Promise<T[]>} A promise that fulfills to an array of the results
 */
export function throttleAll<T>(limit: number, tasks: Task<T>[]): Promise<T[]>;
/**
 * @param {Input} input
 * @param {HtmlMinifierTerserOptions | undefined} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
export function htmlMinifierTerser(
  input: Input,
  minimizerOptions?: HtmlMinifierTerserOptions | undefined
): Promise<MinimizedResult>;
