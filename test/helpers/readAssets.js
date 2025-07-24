import readAsset from "./readAsset";

/**
 * @param {import("webpack").Compiler} compiler The webpack compiler
 * @param {import("webpack").Stats} stats The webpack stats
 * @param {RegExp=} extRegexp The regex to filter assets
 * @returns {Record<string, string>} The assets as key-value pairs
 */
export default function readAssets(compiler, stats, extRegexp) {
  const assets = {};

  for (const asset of Object.keys(stats.compilation.assets)) {
    if (extRegexp && extRegexp.test(asset)) {
      assets[asset] = readAsset(asset, compiler, stats);
    }
  }

  return assets;
}
