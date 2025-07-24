/**
 * @param {import("webpack").Compiler} compiler The webpack compiler
 * @returns {Promise<import("webpack").Stats>} Promise that resolves to the compilation stats
 */
export default function compile(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      return resolve(stats);
    });
  });
}
