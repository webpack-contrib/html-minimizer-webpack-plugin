import os from 'os';

import Worker from 'jest-worker';

import HtmlMinimizerPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
  removeCache,
} from './helpers';

jest.mock('os', () => {
  const actualOs = jest.requireActual('os');

  actualOs.cpus = jest.fn(() => {
    return { length: 4 };
  });

  return actualOs;
});

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js
let workerTransform;
let workerEnd;

jest.mock('jest-worker', () => {
  return jest.fn().mockImplementation((workerPath) => {
    return {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      transform: (workerTransform = jest.fn((data) =>
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(workerPath).transform(data)
      )),
      end: (workerEnd = jest.fn()),
      getStderr: jest.fn(),
      getStdout: jest.fn(),
    };
  });
});

const workerPath = require.resolve('../src/minify');

describe('parallel option', () => {
  let compiler;

  beforeEach(() => {
    jest.clearAllMocks();

    const testHtmlId = './parallel/foo-(0|1|2|3|4).html';

    compiler = getCompiler(testHtmlId);

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot when a value is not specify', async () => {
    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: os.cpus().length - 1,
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "false" value', async () => {
    new HtmlMinimizerPlugin({ parallel: false }).apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(0);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "true" value', async () => {
    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: os.cpus().length - 1,
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "2" value', async () => {
    new HtmlMinimizerPlugin({ parallel: 2 }).apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: 2,
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "true" value when only one file passed', async () => {
    const testHtmlId = './simple.html';

    compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: Math.min(1, os.cpus().length - 1),
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "true" value and the number of files is less than the number of cores', async () => {
    const entries = [];

    for (let i = 0; i < os.cpus().length / 2; i++) {
      entries.push(i);
    }

    const testHtmlId = `./parallel/foo-(${entries.join('|')}).html`;

    compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: Math.min(entries.length, os.cpus().length - 1),
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "true" value and the number of files is same than the number of cores', async () => {
    const entries = [];

    for (let i = 0; i < os.cpus().length; i++) {
      entries.push(i);
    }

    const testHtmlId = `./parallel/foo-(${entries.join('|')}).html`;

    compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: Math.min(Object.keys(entries).length, os.cpus().length - 1),
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "true" value and the number of files is more than the number of cores', async () => {
    const entries = [];

    for (let i = 0; i < os.cpus().length * 2; i++) {
      entries.push(i);
    }

    const testHtmlId = `./parallel/foo-(${entries.join('|')}).html`;

    compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: Math.min(Object.keys(entries).length, os.cpus().length - 1),
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(readAssets(compiler, stats, /\.html$/i)).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
