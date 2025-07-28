export type MinimizedResult = import("./index.js").MinimizedResult;
export type InternalResult = import("./index.js").InternalResult;
/** @typedef {import("./index.js").MinimizedResult} MinimizedResult */
/** @typedef {import("./index.js").InternalResult} InternalResult */
/**
 * @template T
 * @param {import("./index.js").InternalOptions<T>} options The minification options
 * @returns {Promise<InternalResult>} Promise that resolves to the minification result
 */
export function minify<T>(
  options: import("./index.js").InternalOptions<T>,
): Promise<InternalResult>;
/**
 * @template T
 * @param {import("./index.js").InternalOptions<T>} options The transformation options
 * @returns {Promise<InternalResult>} Promise that resolves to the transformation result
 */
export function transform<T>(
  options: import("./index.js").InternalOptions<T>,
): Promise<InternalResult>;
