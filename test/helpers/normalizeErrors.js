/**
 * @param {string} str The string to process
 * @returns {string} The processed string with CWD removed
 */
function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  if (isWin) {
    str = str.replaceAll("\\", "/");

    cwd = cwd.replaceAll("\\", "/");
  }

  return str.replaceAll(new RegExp(cwd, "g"), "");
}

/**
 * @param {Array<Error>} errors The errors to normalize
 * @returns {Array<string>} The normalized error messages
 */
export default (errors) =>
  errors.map((error) =>
    removeCWD(error.toString().split("\n").slice(0, 2).join("\n")),
  );
