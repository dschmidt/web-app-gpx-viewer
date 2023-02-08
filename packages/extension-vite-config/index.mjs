import { mergeConfig, defineConfig as _defineConfig, searchForWorkspaceRoot } from "vite"
import { join } from 'path'
import { cwd } from 'process'

import vue from '@vitejs/plugin-vue'
import serve from 'rollup-plugin-serve'
import { readFileSync } from "fs"

const distDir = 'dist'

export const defineConfig = (overrides = {}) => {
  // read package name from vite workspace
  const packageJson = JSON.parse(readFileSync(join(searchForWorkspaceRoot(cwd()), 'package.json')).toString())

  const { https, port } = overrides?.server
  return mergeConfig(_defineConfig({
    resolve: {
      alias: {
        path: 'rollup-plugin-node-polyfills/polyfills/path',
      }
    },
    build: {
      cssCodeSplit: true,
      minify: false,
      rollupOptions: {
        external: ['vue', 'vuex', 'luxon', 'web-pkg', 'web-client', 'vue3-gettext'],
        preserveEntrySignatures: 'strict',
        input: {
          [packageJson.name]: './src/index.ts'
        },
        output: {
          format: 'amd',
          dir: distDir,
          chunkFileNames: join('js', 'chunks', '[name]-[hash].mjs'),
          // FIXME: readd hash for prod builds
          entryFileNames: join('js', '[name].js'),
        },
        plugins: [
          serve({
            headers: {
              "access-control-allow-origin": '*'
            },
            contentBase: distDir,
            ...(https && { https }),
            ...(port && { port })
          })
        ]
    }
    },
    plugins: [
      vue({
        customElement: false
      }),
    ]
  }), overrides)
}
