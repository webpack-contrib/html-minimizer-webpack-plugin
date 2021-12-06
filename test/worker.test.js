import serialize from "serialize-javascript";

import { transform } from "../src/minify";
import HtmlMinimizerPlugin from "../src";

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
    const { code } = await transform(serialize(options));

    expect(code).toMatchSnapshot("html");
  });

  it("should minify html #2", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: [
        {
          implementation: HtmlMinimizerPlugin.htmlMinifierTerser,
          options: {
            removeComments: false,
          },
        },
      ],
    };
    const { code } = await transform(serialize(options));

    expect(code).toMatchSnapshot("html");
  });

  it("should minify html #3", async () => {
    const options = {
      name: "entry.html",
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizer: {
        implementation: () => {
          return {
            html: '<!-- From minify function --><p class="atata">from-minify-function</p>',
          };
        },
        options: { removeComments: false },
      },
    };
    const { code } = await transform(serialize(options));

    expect(code).toMatchSnapshot("html");
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
