// rollup.config.js
import vue from 'rollup-plugin-vue';
import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import minimist from 'minimist';
import scss from 'rollup-plugin-scss';

const argv = minimist(process.argv.slice(2));

const config = {
  input: 'src/entry.js',
  output: {
    name: 'VueFunnelGraph',
    exports: 'named',
    globals: {
        'polymorph-js': 'interpolate',
        '@tweenjs/tween.js': 'TWEEN',
        'funnel-graph-js': 'FunnelGraph',
        'funnel-graph-js/src/js/number': 'formatNumber',
        'funnel-graph-js/src/js/graph': 'getDefaultColors'
    }
  },
  external: [
      '@tweenjs/tween.js',
      'polymorph-js',
      'funnel-graph-js',
      'funnel-graph-js/src/js/number',
      'funnel-graph-js/src/js/graph',
      'funnel-graph-js/src/scss/main.scss',
      'funnel-graph-js/src/scss/theme.scss'
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    vue({
      css: true,
      compileTemplate: true,
      template: {
        isProduction: true,
      },
    }),
    scss(),
    buble(),
    commonjs(),
  ],
};

export default config;

