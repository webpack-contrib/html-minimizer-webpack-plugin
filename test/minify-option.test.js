import HtmlMinimizerPlugin from "../src/index";

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
} from "./helpers";

describe('"minify" option', () => {
  it("should work minify function", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minimizerOptions: {
        collapseWhitespace: true,
      },
      minify: (data, minimizerOptions) => {
        // eslint-disable-next-line global-require
        const htmlMinifier = require("html-minifier-terser");
        const [[, input]] = Object.entries(data);

        return htmlMinifier.minify(input, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work if minify is array && minimizerOptions is object", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minimizerOptions: {
        collapseWhitespace: true,
      },
      minify: [
        HtmlMinimizerPlugin.htmlMinifierTerser,
        async (data, minimizerOptions) => {
          const [[, input]] = Object.entries(data);

          return `${input}<div>Second function: ${minimizerOptions.collapseWhitespace}</div>`;
        },
        async (data, minimizerOptions) => {
          const [[name, input]] = Object.entries(data);
          return `${name} - ${input}<div>Third function: ${minimizerOptions.collapseWhitespace}</div>`;
        },
      ],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work if minify is array && minimizerOptions is array", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minimizerOptions: [
        {
          collapseWhitespace: true,
        },
        {
          test: "text from option",
        },
      ],
      minify: [
        HtmlMinimizerPlugin.htmlMinifierTerser,
        async (data, minimizerOptions) => {
          const [[name, input]] = Object.entries(data);
          return `${name} - ${input}:<div>Second function: ${minimizerOptions.test}</div>`;
        },
      ],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work if minify function return object", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minimizerOptions: [
        {
          collapseWhitespace: true,
        },
        {
          test: "text from option",
        },
      ],
      minify: [
        HtmlMinimizerPlugin.htmlMinifierTerser,
        async (data, minimizerOptions) => {
          const [[name, input]] = Object.entries(data);
          return {
            code: `${name} - ${input}:<div>Second function: ${minimizerOptions.test}</div>`,
          };
        },
      ],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should minimize code and emit warning", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minimizerOptions: [
        {
          collapseWhitespace: true,
        },
      ],
      minify: [
        HtmlMinimizerPlugin.htmlMinifierTerser,
        async (data) => {
          const [[, input]] = Object.entries(data);
          return {
            code: input,
            warnings: [
              "string warning",
              new Error("test warning"),
              {
                message: "object warning",
              },
            ],
          };
        },
      ],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should emit error", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minimizerOptions: [
        {
          collapseWhitespace: true,
        },
      ],
      minify: [
        HtmlMinimizerPlugin.htmlMinifierTerser,
        async (data) => {
          const [[, input]] = Object.entries(data);
          return {
            code: input,
            errors: [
              "string error",
              new Error("test error"),
              {
                message: "object error",
              },
            ],
          };
        },
      ],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });
});
