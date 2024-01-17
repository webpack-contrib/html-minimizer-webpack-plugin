export default class ExistingCommentsFile {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const plugin = { name: this.constructor.name };
    const { ConcatSource } = compiler.webpack.sources;

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tap(plugin, () => {
        // eslint-disable-next-line no-param-reassign
        compilation.assets[this.options.name] = new ConcatSource(
          `<p> Modified!!! </p>`,
          compilation.assets[this.options.name],
        );
      });
    });
  }
}
