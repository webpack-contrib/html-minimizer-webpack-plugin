const HtmlMinimizerPlugin = require("../src/index");

const {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
} = require("./helpers");

describe("exclude option", () => {
  let compiler;

  beforeEach(() => {
    const testHtmlId = "./include-exclude/*.html";

    compiler = getCompiler(testHtmlId);
  });

  it("should match snapshot for a single RegExp value exclude", async () => {
    new HtmlMinimizerPlugin({
      exclude: /include-exclude\/exclude/i,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should match snapshot for multiple RegExp values exclude", async () => {
    new HtmlMinimizerPlugin({
      exclude: [
        /include-exclude\/exclude-(1)/i,
        /include-exclude\/exclude-(2)/i,
      ],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should match snapshot for multiple String values exclude", async () => {
    new HtmlMinimizerPlugin({
      exclude: ["include-exclude/exclude-1", "include-exclude/exclude-2"],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });
});
