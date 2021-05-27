/* istanbul ignore next */
async function htmlMinifierTerser(data, minimizerOptions) {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const htmlMinifier = require("html-minifier-terser");

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

  const [[, input]] = Object.entries(data);

  return {
    code: htmlMinifier.minify(input, {
      ...defaultMinimizerOptions,
      ...minimizerOptions,
    }),
  };
}

// eslint-disable-next-line import/prefer-default-export
export { htmlMinifierTerser };
