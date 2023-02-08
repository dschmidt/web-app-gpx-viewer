import { defineConfig } from '@ownclouders/extension-vite-config'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  server: {
    port: 9222
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'node_modules/leaflet-gpx/pin-*.png', dest: 'assets' }]
    })
  ]
})
