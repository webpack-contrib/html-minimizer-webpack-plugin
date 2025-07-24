/** @typedef {import("./index.js").MinimizedResult} MinimizedResult */
/** @typedef {import("./index.js").CustomOptions} CustomOptions */
/** @typedef {import("./index.js").Input} Input */

const notSettled = Symbol("not-settled");

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
function throttleAll(limit, tasks) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError(
      `Expected \`limit\` to be a finite number > 0, got \`${limit}\` (${typeof limit})`,
    );
  }

  if (
    !Array.isArray(tasks) ||
    !tasks.every((task) => typeof task === "function")
  ) {
    throw new TypeError(
      "Expected `tasks` to be a list of functions returning a promise",
    );
  }

  return new Promise((resolve, reject) => {
    const result = Array.from({ length: tasks.length }).fill(notSettled);

    const entries = tasks.entries();

    const next = () => {
      const { done, value } = entries.next();

      if (done) {
        const isLast = !result.includes(notSettled);

        if (isLast) resolve(/** @type {T[]} */ (result));

        return;
      }

      const [index, task] = value;

      /**
       * @param {T} value The resolved value
       */
      const onFulfilled = (value) => {
        result[index] = value;
        next();
      };

      task().then(onFulfilled, reject);
    };

    for (const _ of Array.from({ length: limit }, () => 0)) {
      next();
    }
  });
}

/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/* istanbul ignore next */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
async function htmlMinifierTerser(input, minimizerOptions = {}) {
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

/**
 * @returns {boolean} Whether worker threads are supported
 */
htmlMinifierTerser.supportsWorkerThreads = () => true;

/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/* istanbul ignore next */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
async function minifyHtmlNode(input, minimizerOptions = {}) {
  const minifyHtmlPkg = require("@minify-html/node");

  const [[, code]] = Object.entries(input);
  const options =
    /** @type {Parameters<import("@minify-html/node").minify>[1]} */ ({
      ...minimizerOptions,
    });
  const result = await minifyHtmlPkg.minify(Buffer.from(code), options);

  return { code: result.toString() };
}

/**
 * @returns {boolean} Whether worker threads are supported
 */
minifyHtmlNode.supportsWorkerThreads = () => false;

/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/* istanbul ignore next */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
async function swcMinify(input, minimizerOptions = {}) {
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
          // eslint-disable-next-line jsdoc/no-restricted-syntax
          const error = /** @type {Error & { span: any; level: any }} */ (
            new Error(diagnostic.message)
          );

          error.span = diagnostic.span;

          error.level = diagnostic.level;

          return error;
        })
      : undefined,
  };
}

/**
 * @returns {boolean} Whether worker threads are supported
 */
swcMinify.supportsWorkerThreads = () => false;

/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
/* istanbul ignore next */
/**
 * @param {Input} input The input to minify
 * @param {CustomOptions=} minimizerOptions The minimizer options
 * @returns {Promise<MinimizedResult>} Promise that resolves to the minified result
 */
async function swcMinifyFragment(input, minimizerOptions = {}) {
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
          // eslint-disable-next-line jsdoc/no-restricted-syntax
          const error = /** @type {Error & { span: any; level: any }} */ (
            new Error(diagnostic.message)
          );

          error.span = diagnostic.span;

          error.level = diagnostic.level;

          return error;
        })
      : undefined,
  };
}

/**
 * @returns {boolean} Whether worker threads are supported
 */
swcMinifyFragment.supportsWorkerThreads = () => false;

// eslint-disable-next-line jsdoc/no-restricted-syntax
/**
 * @template T
 * @param {(() => any) | undefined} fn The function to memoize
 * @returns {() => T} The memoized function
 */
function memoize(fn) {
  let cache = false;
  /** @type {T} */
  let result;

  return () => {
    if (cache) {
      return result;
    }
    // eslint-disable-next-line jsdoc/no-restricted-syntax
    result = /** @type {() => any} */ (fn)();
    cache = true;
    // Allow to clean up memory for fn
    // and all dependent resources

    fn = undefined;

    return result;
  };
}

module.exports = {
  htmlMinifierTerser,
  memoize,
  minifyHtmlNode,
  swcMinify,
  swcMinifyFragment,
  throttleAll,
};
