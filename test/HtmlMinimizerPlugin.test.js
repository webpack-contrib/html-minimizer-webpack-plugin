import path from 'path';

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

  it('should work without files', async () => {
    const testHtmlId = './simple.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      include: 'nothing',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should write stdout and stderr of workers to stdout and stderr of main process in parallel mode', async () => {
    const { write: stdoutWrite } = process.stdout;
    const { write: stderrWrite } = process.stderr;

    let stdoutOutput = '';
    let stderrOutput = '';

    process.stdout.write = (str) => {
      stdoutOutput += str;
    };

    process.stderr.write = (str) => {
      stderrOutput += str;
    };

    const testHtmlId = './parallel/foo-[1-3].html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      parallel: true,
      minify: () => {
        // eslint-disable-next-line no-console
        process.stdout.write('stdout\n');
        // eslint-disable-next-line no-console
        process.stderr.write('stderr\n');

        return '<!-- Comment --><p title="blah" id="moo">  foo  </p>';
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(stdoutOutput).toMatchSnapshot('process stdout output');
    expect(stderrOutput).toMatchSnapshot('process stderr output');
    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');

    process.stdout.write = stdoutWrite;
    process.stderr.write = stderrWrite;
  });

  it('should work with child compilation', async () => {
    const testHtmlId = './simple.html';
    const compiler = getCompiler(testHtmlId, {
      module: {
        rules: [
          {
            test: /entry.js$/i,
            use: [
              {
                loader: path.resolve(
                  __dirname,
                  './helpers/emitAssetInChildCompilationLoader'
                ),
              },
            ],
          },
        ],
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error', async () => {
    const testHtmlId = './simple.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minify: () => {
        // eslint-disable-next-line global-require
        const htmlMinifier = require('html-minifier-terser');

        return htmlMinifier.minify(null);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when broken html syntax', async () => {
    const testHtmlId = './broken-html-syntax.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

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
