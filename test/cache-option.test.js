import path from 'path';

import del from 'del';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';

import HtmlMinimizerPlugin from '../src/index';
import Webpack4Cache from '../src/Webpack4Cache';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
  removeCache,
} from './helpers';

const uniqueCacheDirectory = findCacheDir({ name: 'unique-cache-directory' });
const uniqueCacheDirectory1 = findCacheDir({
  name: 'unique-cache-directory-1',
});
const uniqueCacheDirectory2 = findCacheDir({
  name: 'unique-cache-directory-2',
});
const uniqueOtherDirectory = findCacheDir({
  name: 'unique-other-cache-directory',
});
const otherCacheDir = findCacheDir({ name: 'other-cache-directory' });
const otherOtherCacheDir = findCacheDir({
  name: 'other-other-cache-directory',
});
const otherOtherOtherCacheDir = findCacheDir({
  name: 'other-other-other-cache-directory',
});

if (getCompiler.isWebpack4()) {
  describe('HtmlMinimizerPlugin', () => {
    beforeEach(() => {
      return Promise.all([
        removeCache(),
        removeCache(uniqueCacheDirectory),
        removeCache(uniqueCacheDirectory1),
        removeCache(uniqueCacheDirectory2),
        removeCache(uniqueOtherDirectory),
        removeCache(otherCacheDir),
        removeCache(otherOtherCacheDir),
        removeCache(otherOtherOtherCacheDir),
      ]);
    });

    it('should match snapshot when a value is not specify', async () => {
      const testHtmlId = './cache/*.html';
      const compiler = getCompiler(testHtmlId);

      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => uniqueCacheDirectory);

      new HtmlMinimizerPlugin().apply(compiler);

      const stats = await compile(compiler);

      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(readAssets(compiler, stats, /\.html$/i))
        .length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(
        readAssets(compiler, newStats, /\.html$/i)
      ).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
      getCacheDirectorySpy.mockRestore();
    });

    it('should match snapshot for the "false" value', async () => {
      const testHtmlId = './cache/*.html';
      const compiler = getCompiler(testHtmlId);

      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      new HtmlMinimizerPlugin({ cache: false }).apply(compiler);

      const stats = await compile(compiler);

      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      // Cache disabled so we don't run `get` or `put`
      expect(cacacheGetSpy).toHaveBeenCalledTimes(0);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
    });

    it('should match snapshot for the "true" value', async () => {
      const testHtmlId = './cache/*.html';
      const compiler = getCompiler(testHtmlId);

      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => uniqueCacheDirectory);

      new HtmlMinimizerPlugin({ cache: true }).apply(compiler);

      const stats = await compile(compiler);

      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(readAssets(compiler, stats, /\.html$/i))
        .length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(
        readAssets(compiler, newStats, /\.html$/i)
      ).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
      getCacheDirectorySpy.mockRestore();
    });

    it('should match snapshot for the "other-cache-directory" value', async () => {
      const testHtmlId = './cache/*.html';
      const compiler = getCompiler(testHtmlId);

      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      new HtmlMinimizerPlugin({ cache: otherCacheDir }).apply(compiler);

      const stats = await compile(compiler);

      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(readAssets(compiler, stats, /\.html$/i))
        .length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(
        readAssets(compiler, newStats, /\.html$/i)
      ).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
    });

    it('should match snapshot when "cacheKey" is custom "function"', async () => {
      const testHtmlId = './cache/*.html';
      const compiler = getCompiler(testHtmlId);

      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      new HtmlMinimizerPlugin({
        cache: otherOtherCacheDir,
        cacheKeys: (defaultCacheKeys, file) => {
          // eslint-disable-next-line no-param-reassign
          defaultCacheKeys.myCacheKey = 1;
          // eslint-disable-next-line no-param-reassign
          defaultCacheKeys.myCacheKeyBasedOnFile = `file-${file}`;

          return defaultCacheKeys;
        },
      }).apply(compiler);

      const stats = await compile(compiler);

      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(readAssets(compiler, stats, /\.html$/i))
        .length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(
        readAssets(compiler, newStats, /\.html$/i)
      ).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
    });
  });
} else {
  describe('"cache" option', () => {
    const fileSystemCacheDirectory = path.resolve(
      __dirname,
      './outputs/type-filesystem'
    );
    const fileSystemCacheDirectory1 = path.resolve(
      __dirname,
      './outputs/type-filesystem-1'
    );
    const fileSystemCacheDirectory2 = path.resolve(
      __dirname,
      './outputs/type-filesystem-2'
    );
    const fileSystemCacheDirectory3 = path.resolve(
      __dirname,
      './outputs/type-filesystem-3'
    );

    beforeAll(() => {
      return Promise.all([
        del(fileSystemCacheDirectory),
        del(fileSystemCacheDirectory1),
        del(fileSystemCacheDirectory2),
        del(fileSystemCacheDirectory3),
      ]);
    });

    it('should work with the "false" value for the "cache" option', async () => {
      const testHtmlId = false;
      const compiler = getCompiler(testHtmlId, {
        cache: false,
        entry: {
          foo: path.resolve(__dirname, './fixtures/cache.js'),
        },
      });

      new HtmlMinimizerPlugin().apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('HtmlMinimizerWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('HtmlMinimizerWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Without cache webpack always try to get
      expect(getCounter).toBe(5);
      // Without cache webpack always try to store
      expect(storeCounter).toBe(5);
      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Without cache webpack always try to get
      expect(getCounter).toBe(5);
      // Without cache webpack always try to store
      expect(storeCounter).toBe(5);
      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });

    it('should work with the "memory" value for the "cache.type" option', async () => {
      const testHtmlId = false;
      const compiler = getCompiler(testHtmlId, {
        cache: {
          type: 'memory',
        },
        entry: {
          foo: path.resolve(__dirname, './fixtures/cache.js'),
        },
      });

      new HtmlMinimizerPlugin().apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('HtmlMinimizerWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('HtmlMinimizerWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(5);
      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(5);
      // No need to store, we got cached assets
      expect(storeCounter).toBe(0);
      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });

    it('should work with the "filesystem" value for the "cache.type" option', async () => {
      const testHtmlId = false;
      const compiler = getCompiler(testHtmlId, {
        cache: {
          type: 'filesystem',
          cacheDirectory: fileSystemCacheDirectory,
        },
        entry: {
          foo: path.resolve(__dirname, './fixtures/cache.js'),
        },
      });

      new HtmlMinimizerPlugin().apply(compiler);

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('HtmlMinimizerWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('HtmlMinimizerWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(5);
      expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      getCounter = 0;
      storeCounter = 0;

      const newStats = await compile(compiler);

      // Get cache for assets
      expect(getCounter).toBe(5);
      // No need to store, we got cached assets
      expect(storeCounter).toBe(0);
      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        'assets'
      );
      expect(getErrors(newStats)).toMatchSnapshot('errors');
      expect(getWarnings(newStats)).toMatchSnapshot('warnings');
    });
  });
}
