/**
 * @param {string} map The source map string
 * @returns {string} The normalized source map
 */
export default function normalizedSourceMap(map) {
  return map.replace(
    // eslint-disable-next-line no-useless-escape
    /"sources":\[([\d\w\/\:\"\'].*)\]\,\"names\"/i,
    '"sources": [replaced for tests], "names"',
  );
}
