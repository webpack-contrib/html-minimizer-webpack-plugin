import HtmlMinimizerPlugin from "../src";

it("validation", () => {
  /* eslint-disable no-new */
  expect(() => {
    new HtmlMinimizerPlugin({ test: /foo/ });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ test: "foo" });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ test: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ test: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ test: ["foo", "bar"] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ test: [/foo/, "bar"] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ test: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ test: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ include: /foo/ });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ include: "foo" });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ include: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ include: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ include: ["foo", "bar"] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ include: [/foo/, "bar"] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ include: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ include: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: /foo/ });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: "foo" });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: ["foo", "bar"] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: [/foo/, "bar"] });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ exclude: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ minimizerOptions: {} });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ minimizerOptions: null });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({
      minimizerOptions: { collapseWhitespace: true },
    });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ parallel: true });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ parallel: false });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ parallel: 2 });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ parallel: "2" });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ parallel: {} });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ minify() {} });
  }).not.toThrow();

  expect(() => {
    new HtmlMinimizerPlugin({ minify: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new HtmlMinimizerPlugin({ unknown: true });
  }).toThrowErrorMatchingSnapshot();
  /* eslint-enable no-new */
});
