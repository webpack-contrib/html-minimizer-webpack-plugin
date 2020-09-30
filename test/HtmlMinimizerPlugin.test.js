import HtmlMinimizerPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAsset,
} from './helpers';

describe('HtmlMinimizerPlugin', () => {
  it('should work (without options)', async () => {
    const testHtmlId = './simple.html';
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAsset('simple.html', compiler, stats)).toMatchSnapshot('result');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
