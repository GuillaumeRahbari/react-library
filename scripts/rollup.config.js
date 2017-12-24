const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const closure = require('rollup-plugin-closure-compiler-js');
const sizes = require('./sizes.plugin');
const pkg = require('../package.json');

const rollupInputConfig = {
  input: 'src/main.js',
  plugins: [
    resolve(), // so Rollup can find node_modules
    commonjs(), // so Rollup can convert node_modules to an ES module
    babel({
      exclude: ['node_modules/**'],
    }),
    closure(),
    sizes(),
  ],
};

const banner = `/* ${pkg.name} version ${pkg.version} */`;

const commonRollupOutputOptions = {
  name: pkg.name,
  banner,
};

const bundles = [
  // browser-friendly UMD build
  {
    file: pkg.browser,
    format: 'umd',
  },
  // commonJS build
  {
    file: pkg.main,
    format: 'cjs',
  },
  // ES2015+ module build
  {
    file: pkg.module,
    format: 'es',
  },
].map(bundle => {
  return Object.assign({}, commonRollupOutputOptions, bundle);
});

module.exports = {
  rollupInputConfig,
  bundles,
};
