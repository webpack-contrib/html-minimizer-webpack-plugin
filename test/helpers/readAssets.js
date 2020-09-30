import readAsset from './readAsset';

export default function readAssets(compiler, stats, extRegexp) {
  const assets = {};

  Object.keys(stats.compilation.assets).forEach((asset) => {
    if (extRegexp && extRegexp.test(asset)) {
      assets[asset] = readAsset(asset, compiler, stats);
    }
  });

  return assets;
}
