const gzip = require('gzip-size');
const Stats = require('./stats');

module.exports = function sizes() {
  return {
    ongenerate(bundle, obj) {
      const size = Buffer.byteLength(obj.code);
      const gzipSize = gzip.sync(obj.code);

      Stats.currentBuildResults.bundleSizes[bundle.file] = {
        size,
        gzip: gzipSize,
      };
    },
  };
};
