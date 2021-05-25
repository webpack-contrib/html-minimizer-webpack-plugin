const minify = async (options) => {
  const minifyFns =
    typeof options.minify === "function" ? [options.minify] : options.minify;

  const result = {
    code: options.input,
  };

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];

    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions;
    // eslint-disable-next-line no-await-in-loop
    const minifyResult = await minifyFn(
      { [options.assetName]: result.code },
      minifyOptions
    );

    result.code = minifyResult;
  }

  return result;
};

async function transform(options) {
  // 'use strict' => this === undefined (Clean Scope)
  // Safer for possible security issues, albeit not critical at all here
  // eslint-disable-next-line no-new-func, no-param-reassign
  options = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    `'use strict'\nreturn ${options}`
  )(exports, require, module, __filename, __dirname);

  return minify(options);
}

module.exports.minify = minify;
module.exports.transform = transform;
