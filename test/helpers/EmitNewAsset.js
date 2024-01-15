export default class EmitNewAsset {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    const { RawSource } = compiler.webpack.sources;

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          // eslint-disable-next-line no-param-reassign
          compilation.emitAsset(
            this.options.name,
            new RawSource(
              `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
              </head>
              <body>
                
              </body>
              </html>
              `,
            ),
          );
        },
      );
    });
  }
}
