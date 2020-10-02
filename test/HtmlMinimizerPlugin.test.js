import HtmlMinimizerPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
  removeCache,
} from './helpers';

describe('HtmlMinimizerPlugin', () => {
  beforeEach(() => Promise.all([removeCache()]));

  afterEach(() => Promise.all([removeCache()]));

  it('should work (without options)', async () => {
    const testHtmlId = './simple.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with an empty file', async () => {
    const testHtmlId = './empty.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  // Todo unskip when copy-webpack-plugin will have weekCache
  it.skip('should work and use cache by default', async () => {
    const testHtmlId = './cache/*.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    if (getCompiler.isWebpack4()) {
      expect(
        Object.keys(stats.compilation.assets).filter((assetName) => {
          return stats.compilation.assets[assetName].emitted;
        }).length
      ).toBe(5);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(5);
    }

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('result');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      if (getCompiler.isWebpack4()) {
        expect(
          Object.keys(newStats.compilation.assets).filter((assetName) => {
            return newStats.compilation.assets[assetName].emitted;
          }).length
        ).toBe(5);
      } else {
        expect(newStats.compilation.emittedAssets.size).toBe(0);
      }

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getWarnings(newStats)).toMatchSnapshot('errors');
      expect(getErrors(newStats)).toMatchSnapshot('warnings');

      resolve();
    });
  });
});
