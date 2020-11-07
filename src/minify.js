const htmlMinifier = require('html-minifier-terser');

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

const minify = async (options) => {
  const { assetName, input, minimizerOptions, minify: minifyFn } = options;

  if (minifyFn) {
    const result = await minifyFn({ [assetName]: input }, minimizerOptions);

    return {
      code: result,
    };
  }

  const result = await htmlMinifier.minify(input, {
    ...defaultMinimizerOptions,
    ...minimizerOptions,
  });

  return {
    code: result,
  };
};

async function transform(options) {
  // 'use strict' => this === undefined (Clean Scope)
  // Safer for possible security issues, albeit not critical at all here
  // eslint-disable-next-line no-new-func, no-param-reassign
  options = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    `'use strict'\nreturn ${options}`
  )(exports, require, module, __filename, __dirname);

  return minify(options);
}

module.exports.minify = minify;
module.exports.transform = transform;
