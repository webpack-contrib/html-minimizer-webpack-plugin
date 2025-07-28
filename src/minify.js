/** @typedef {import("./index.js").MinimizedResult} MinimizedResult */
/** @typedef {import("./index.js").InternalResult} InternalResult */

/**
 * @template T
 * @param {import("./index.js").InternalOptions<T>} options The minification options
 * @returns {Promise<InternalResult>} Promise that resolves to the minification result
 */
async function minify(options) {
  const minifyFns = Array.isArray(options.minimizer.implementation)
    ? options.minimizer.implementation
    : [options.minimizer.implementation];

  /** @type {InternalResult} */
  const result = { outputs: [], warnings: [], errors: [] };

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizer.options)
      ? options.minimizer.options[i]
      : options.minimizer.options;
    const prevResult =
      result.outputs.length > 0
        ? result.outputs[result.outputs.length - 1]
        : { code: options.input };
    const { code } = prevResult;

    /** @type {MinimizedResult} */
    const minifyResult = await minifyFn(
      { [options.name]: code },
      minifyOptions,
    );

    if (
      typeof minifyResult !== "string" &&
      typeof minifyResult.code !== "string"
    ) {
      throw new Error(
        "minimizer function doesn't return the 'code' property or result is not a string value",
      );
    }

    if (typeof minifyResult === "string") {
      result.outputs.push({ code: minifyResult });
    } else {
      if (minifyResult.errors) {
        result.errors = [...result.errors, ...minifyResult.errors];
      }

      if (minifyResult.warnings) {
        result.warnings = [...result.warnings, ...minifyResult.warnings];
      }

      result.outputs.push({ code: minifyResult.code });
    }
  }

  result.outputs = [result.outputs[result.outputs.length - 1]];

  return result;
}

/**
 * @template T
 * @param {import("./index.js").InternalOptions<T>} options The transformation options
 * @returns {Promise<InternalResult>} Promise that resolves to the transformation result
 */
async function transform(options) {
  // 'use strict' => this === undefined (Clean Scope)
  // Safer for possible security issues, albeit not critical at all here
  // eslint-disable-next-line no-new-func
  const evaluatedOptions = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    `'use strict'\nreturn ${options}`,
  )(module.exports, require, module, __filename, __dirname);

  return minify(evaluatedOptions);
}

module.exports = { minify, transform };
