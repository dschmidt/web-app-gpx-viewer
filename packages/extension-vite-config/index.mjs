import { mergeConfig, searchForWorkspaceRoot } from 'vite'
import { join } from 'path'
import { cwd } from 'process'
import { readFileSync } from 'fs'

import vue from '@vitejs/plugin-vue'
import serve from 'rollup-plugin-serve'

const distDir = 'dist'

export const defineConfig = (overrides = {}) => {
  return ({ command, mode }) => {
    // console.log('command', command, 'mode', mode)
    const isProduction = mode === 'production'
    // read package name from vite workspace
    const packageJson = JSON.parse(
      readFileSync(join(searchForWorkspaceRoot(cwd()), 'package.json')).toString()
    )
    const { https, port } = overrides?.server

    return mergeConfig(
      {
        resolve: {
          alias: {
            path: 'rollup-plugin-node-polyfills/polyfills/path'
          }
        },
        build: {
          cssCodeSplit: true,
          minify: isProduction,
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
              entryFileNames: join('js', `[name]${isProduction ? '-[hash]' : ''}.js`)
            },
            plugins: [
              command === 'server' &&
                serve({
                  headers: {
                    'access-control-allow-origin': '*'
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
          })
        ]
      },
      overrides
    )
  }
}
