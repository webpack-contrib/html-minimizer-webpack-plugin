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
});
