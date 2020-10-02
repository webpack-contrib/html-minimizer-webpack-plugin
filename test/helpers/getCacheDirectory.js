import os from 'os';

import findCacheDir from 'find-cache-dir';

function getCacheDirectory() {
  return findCacheDir({ name: 'html-minimizer-webpack-plugin' }) || os.tmpdir();
}

export default getCacheDirectory;
