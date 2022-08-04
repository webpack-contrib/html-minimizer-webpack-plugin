const HtmlMinimizerPlugin = require("../src/index");

const {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
} = require("./helpers");

describe('when applied with "test" option', () => {
  let compiler;

  beforeEach(() => {
    jest.clearAllMocks();

    const testHtmlId = "./parallel/foo-[0-4].html";

    compiler = getCompiler(testHtmlId);
  });

  it("matches snapshot with empty value", async () => {
    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('matches snapshot for a single "test" value (RegExp)', async () => {
    new HtmlMinimizerPlugin({
      test: /foo-[1-3]\.html/,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('matches snapshot for multiple "test" value (RegExp)', async () => {
    new HtmlMinimizerPlugin({
      test: [/foo-[0]\.html/, /foo-[1-2]\.html/],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });
});
