import serialize from "serialize-javascript";

import HtmlMinimizerPlugin from "../src";
import { transform } from "../src/minify";

import { normalizeErrors } from "./helpers";

describe("worker", () => {
  it("should minify html", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: {
        implementation: HtmlMinimizerPlugin.htmlMinifierTerser,
        options: {
          removeComments: false,
        },
      },
    };
    const result = await transform(serialize(options));

    expect(result).toMatchSnapshot("html");
  });

  it("should minify html #2", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: {
        implementation: HtmlMinimizerPlugin.htmlMinifierTerser,
        options: {
          removeComments: false,
        },
      },
    };
    const result = await transform(serialize(options));

    expect(result).toMatchSnapshot("html");
  });

  it("should minify html #3", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: {
        implementation: () => ({
          code: '<!-- From minify function --><p class="atata">from-minify-function</p>',
        }),
        options: { removeComments: false },
      },
    };
    const result = await transform(serialize(options));

    expect(result).toMatchSnapshot("html");
  });

  it("should minify html #4", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: {
        implementation: [
          () => ({
            code: '<!-- From minify function 1 --><p class="atata">from-minify-function</p>',
          }),
          () => ({
            code: '<!-- From minify function 2 --><p class="atata">from-minify-function</p>',
          }),
        ],
        options: { removeComments: false },
      },
    };
    const result = await transform(serialize(options));

    expect(result).toMatchSnapshot("html");
  });

  it("should minify html #5", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: {
        implementation: [
          () => ({
            code: '<!-- From minify function 1 --><p class="atata">from-minify-function</p>',
          }),
          (_code, opt) => ({
            code: `<!-- From minify function with "{ removeComments: ${opt.removeComments} }" --><p class="atata">from-minify-function</p>`,
          }),
        ],
        options: [{ removeComments: false }, { removeComments: true }],
      },
    };
    const result = await transform(serialize(options));

    expect(result).toMatchSnapshot("html");
  });

  it("should emit error", async () => {
    const options = {
      name: "entry.html",
      input: false,
      minimizer: {
        implementation: HtmlMinimizerPlugin.htmlMinifierTerser,
      },
    };

    try {
      await transform(serialize(options));
    } catch (error) {
      const normalizeError = { ...error };

      normalizeError.message = [error.message.split("\n")];

      expect(normalizeErrors(normalizeError.message)).toMatchSnapshot("error");
    }
  });
});
