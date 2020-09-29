import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAsset,
} from './helpers';

describe('HtmlMinimizerPlugin', () => {
  it('should work', async () => {
    const compiler = getCompiler({
      entry: {
        foo: `${__dirname}/fixtures/simple.js`,
      },
    });
    const stats = await compile(compiler);

    expect(readAsset('foo.js', compiler, stats)).toMatchSnapshot('result');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
