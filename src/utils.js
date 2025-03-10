/** @typedef {import("./index.js").MinimizedResult} MinimizedResult */
/** @typedef {import("./index.js").CustomOptions} CustomOptions */
/** @typedef {import("./index.js").Input} Input */

const notSettled = Symbol(`not-settled`);

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
function throttleAll(limit, tasks) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError(
      `Expected \`limit\` to be a finite number > 0, got \`${limit}\` (${typeof limit})`,
    );
  }

  if (
    !Array.isArray(tasks) ||
    !tasks.every((task) => typeof task === `function`)
  ) {
    throw new TypeError(
      `Expected \`tasks\` to be a list of functions returning a promise`,
    );
  }

  return new Promise((resolve, reject) => {
    const result = Array(tasks.length).fill(notSettled);

    const entries = tasks.entries();

    const next = () => {
      const { done, value } = entries.next();

      if (done) {
        const isLast = !result.includes(notSettled);

        if (isLast) resolve(/** @type{T[]} **/ (result));

        return;
      }

      const [index, task] = value;

      /**
       * @param {T} x
       */
      const onFulfilled = (x) => {
        result[index] = x;
        next();
      };

      task().then(onFulfilled, reject);
    };

    Array(limit).fill(0).forEach(next);
  });
}

/**
 * @param {Input} input
 * @param {CustomOptions } [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
/* istanbul ignore next */
async function htmlMinifierTerser(input, minimizerOptions = {}) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const htmlMinifier = require("html-minifier-terser");
  const [[, code]] = Object.entries(input);
  /** @type {import("html-minifier-terser").Options} */
  const defaultMinimizerOptions = {
    caseSensitive: true,
    // `collapseBooleanAttributes` is not always safe, since this can break CSS attribute selectors and not safe for XHTML
    collapseWhitespace: true,
    conservativeCollapse: true,
    keepClosingSlash: true,
    // We need ability to use cssnano, or setup own function without extra dependencies
    minifyCSS: true,
    minifyJS: true,
    // `minifyURLs` is unsafe, because we can't guarantee what the base URL is
    // `removeAttributeQuotes` is not safe in some rare cases, also HTML spec recommends against doing this
    removeComments: true,
    // `removeEmptyAttributes` is not safe, can affect certain style or script behavior, look at https://github.com/webpack-contrib/html-loader/issues/323
    // `removeRedundantAttributes` is not safe, can affect certain style or script behavior, look at https://github.com/webpack-contrib/html-loader/issues/323
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    // `useShortDoctype` is not safe for XHTML
  };
  const result = await htmlMinifier.minify(code, {
    ...defaultMinimizerOptions,
    ...minimizerOptions,
  });

  return { code: result };
}

htmlMinifierTerser.supportsWorkerThreads = () => true;

/**
 * @param {Input} input
 * @param {CustomOptions} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
/* istanbul ignore next */
async function minifyHtmlNode(input, minimizerOptions = {}) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies, import/no-unresolved
  const minifyHtmlPkg = require("@minify-html/node");
  const [[, code]] = Object.entries(input);
  const options =
    /** @type {Parameters<import("@minify-html/node").minify>[1]} */ ({
      ...minimizerOptions,
    });
  const result = await minifyHtmlPkg.minify(Buffer.from(code), options);

  return { code: result.toString() };
}

minifyHtmlNode.supportsWorkerThreads = () => false;

/**
 * @param {Input} input
 * @param {CustomOptions} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
/* istanbul ignore next */
async function swcMinify(input, minimizerOptions = {}) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies, import/no-unresolved
  const swcMinifier = require("@swc/html");
  const [[, code]] = Object.entries(input);
  const options = /** @type {import("@swc/html").Options} */ ({
    ...minimizerOptions,
  });
  const result = await swcMinifier.minify(Buffer.from(code), options);

  return {
    code: result.code,
    errors: result.errors
      ? result.errors.map((diagnostic) => {
          const error = new Error(diagnostic.message);

          // @ts-ignore
          error.span = diagnostic.span;
          // @ts-ignore
          error.level = diagnostic.level;

          return error;
        })
      : // eslint-disable-next-line no-undefined
        undefined,
  };
}

swcMinify.supportsWorkerThreads = () => false;

/**
 * @param {Input} input
 * @param {CustomOptions} [minimizerOptions]
 * @returns {Promise<MinimizedResult>}
 */
/* istanbul ignore next */
async function swcMinifyFragment(input, minimizerOptions = {}) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies, import/no-unresolved
  const swcMinifier = require("@swc/html");
  const [[, code]] = Object.entries(input);
  const options = /** @type {import("@swc/html").FragmentOptions} */ ({
    ...minimizerOptions,
  });
  const result = await swcMinifier.minifyFragment(Buffer.from(code), options);

  return {
    code: result.code,
    errors: result.errors
      ? result.errors.map((diagnostic) => {
          const error = new Error(diagnostic.message);

          // @ts-ignore
          error.span = diagnostic.span;
          // @ts-ignore
          error.level = diagnostic.level;

          return error;
        })
      : // eslint-disable-next-line no-undefined
        undefined,
  };
}

swcMinifyFragment.supportsWorkerThreads = () => false;

/**
 * @template T
 * @param fn {(function(): any) | undefined}
 * @returns {function(): T}
 */
function memoize(fn) {
  let cache = false;
  /** @type {T} */
  let result;

  return () => {
    if (cache) {
      return result;
    }
    result = /** @type {function(): any} */ (fn)();
    cache = true;
    // Allow to clean up memory for fn
    // and all dependent resources
    // eslint-disable-next-line no-undefined, no-param-reassign
    fn = undefined;

    return result;
  };
}

module.exports = {
  throttleAll,
  memoize,
  htmlMinifierTerser,
  swcMinify,
  swcMinifyFragment,
  minifyHtmlNode,
};
