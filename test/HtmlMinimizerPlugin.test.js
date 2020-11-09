import path from "path";

import HtmlMinimizerPlugin from "../src/index";

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readAssets,
  ModifyExistingAsset,
} from "./helpers";

describe("HtmlMinimizerPlugin", () => {
  it("should work (without options)", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with an empty file", async () => {
    const testHtmlId = "./empty.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work without files", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      include: "nothing",
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should write stdout and stderr of workers to stdout and stderr of main process in parallel mode", async () => {
    const { write: stdoutWrite } = process.stdout;
    const { write: stderrWrite } = process.stderr;

    let stdoutOutput = "";
    let stderrOutput = "";

    process.stdout.write = (str) => {
      stdoutOutput += str;
    };

    process.stderr.write = (str) => {
      stderrOutput += str;
    };

    const testHtmlId = "./parallel/foo-[1-3].html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      parallel: true,
      minify: () => {
        // eslint-disable-next-line no-console
        process.stdout.write("stdout\n");
        // eslint-disable-next-line no-console
        process.stderr.write("stderr\n");

        return '<!-- Comment --><p title="blah" id="moo">  foo  </p>';
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(stdoutOutput).toMatchSnapshot("process stdout output");
    expect(stderrOutput).toMatchSnapshot("process stderr output");
    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    process.stdout.write = stdoutWrite;
    process.stderr.write = stderrWrite;
  });

  it("should work with child compilation", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId, {
      module: {
        rules: [
          {
            test: /entry.js$/i,
            use: [
              {
                loader: path.resolve(
                  __dirname,
                  "./helpers/emitAssetInChildCompilationLoader"
                ),
              },
            ],
          },
        ],
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should emit error", async () => {
    const testHtmlId = "./simple.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin({
      minify: () => {
        // eslint-disable-next-line global-require
        const htmlMinifier = require("html-minifier-terser");

        return htmlMinifier.minify(null);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should emit error when broken html syntax", async () => {
    const testHtmlId = "./broken-html-syntax.html";
    const compiler = getCompiler(testHtmlId);

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work and use cache by default in "development" mode', async () => {
    const testHtmlId = false;
    const compiler = getCompiler(testHtmlId, {
      mode: "development",
      entry: {
        foo: path.resolve(__dirname, "./fixtures/cache.js"),
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("result");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        "assets"
      );
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it("should work and use memory cache", async () => {
    const testHtmlId = false;
    const compiler = getCompiler(testHtmlId, {
      cache: { type: "memory" },
      entry: {
        foo: path.resolve(__dirname, "./fixtures/cache.js"),
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("result");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        "assets"
      );
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true"', async () => {
    const testHtmlId = false;
    const compiler = getCompiler(testHtmlId, {
      cache: true,
      entry: {
        foo: path.resolve(__dirname, "./fixtures/cache.js"),
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("result");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        "assets"
      );
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true" and the asset has been changed', async () => {
    const testHtmlId = false;
    const compiler = getCompiler(testHtmlId, {
      cache: true,
      entry: {
        foo: path.resolve(__dirname, "./fixtures/cache.js"),
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("result");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    new ModifyExistingAsset({ name: "cache.html" }).apply(compiler);
    new ModifyExistingAsset({ name: "cache-1.html" }).apply(compiler);

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(2);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        "assets"
      );
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work and do not use memory cache when the "cache" option is "false"', async () => {
    const testHtmlId = false;
    const compiler = getCompiler(testHtmlId, {
      cache: false,
      entry: {
        foo: path.resolve(__dirname, "./fixtures/cache.js"),
      },
    });

    new HtmlMinimizerPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);

    expect(readAssets(compiler, stats, /\.html$/i)).toMatchSnapshot("result");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(6);

      expect(readAssets(compiler, newStats, /\.html$/i)).toMatchSnapshot(
        "assets"
      );
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });
});
