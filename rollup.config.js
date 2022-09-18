import vue from 'rollup-plugin-vue'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from '@rollup/plugin-json'
import builtins from '@erquhart/rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import css from 'rollup-plugin-import-css'
import ts from 'rollup-plugin-ts'
import copy from 'rollup-plugin-copy'


const production = !process.env.ROLLUP_WATCH

// We can't really do much about circular dependencies in node_modules
function onwarn(warning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    console.error(`(!) ${warning.message}`)
  }
}

export default {
  input: 'src/index.js',
  output: {
    file: 'assets/web-app-gpx-viewer.js',
    format: 'amd',
    sourcemap: !production
  },
  onwarn,
  external: [
    '@vue/composition-api',
    'vuex',
    'luxon'
  ],
  plugins: [
    vue(),
    css(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      preventAssignment: true
    }),
    resolve({
      mainFields: ['browser', 'jsnext', 'module', 'main'],
      include: 'node_modules/**',
      preferBuiltins: true
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    ts({
      browserslist: false
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    json(),
    globals(),
    builtins(),
    production && terser(),
    production && filesize(),
    copy({
      targets: [
        { src: 'node_modules/leaflet-gpx/pin-*.png', dest: 'assets' },
      ]
    })
  ]
}
