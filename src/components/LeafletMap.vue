<template>
  <div>
    <!-- FIXME: this is a mess but I could not make the style import work any other way ... -->
    <component :is="styleTag" type="text/css">{{ leafletCss }}</component>
    <div id="leafletContainer" ref="mapElement" class="leafletContainer" />
    <table style="border-spacing: 10px">
      <tr>
        <th>Distance</th>
        <th>Elevation Gain</th>
        <th>Elevation Loss</th>
        <th>Name</th>
      </tr>
      <tr>
        <td>{{ meta.distance }}km</td>
        <td>{{ meta.elevationGain }}m</td>
        <td>{{ meta.elevationLoss }}m</td>
        <td>{{ meta.name }}</td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'

import leafletCss from 'leaflet/dist/leaflet.css?inline'
import L from 'leaflet-gpx'
import { dirname } from '@ownclouders/web-pkg'

export default defineComponent({
  props: {
    gpx: {
      type: String,
      required: true
    },
    applicationConfig: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const mapElement = ref()
    let mapObject = null
    let meta = ref({})
    onMounted(() => {
      mapObject = L.map('leafletContainer')

      const urlTemplate =
        props.applicationConfig.tileLayerUrlTemplate ||
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      const options = {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        ...props.applicationConfig.tileLayerOptions
      }
      L.tileLayer(urlTemplate, options).addTo(mapObject)
      L.control
        .scale({
          imperial: false
        })
        .addTo(mapObject)

      const assetsBaseUrl = `${dirname(dirname(import.meta.url))}/assets`
      const gpxOptions = {
        async: true,
        marker_options: {
          startIconUrl: `${assetsBaseUrl}/pin-icon-start.png`,
          endIconUrl: `${assetsBaseUrl}/pin-icon-end.png`,
          shadowUrl: `${assetsBaseUrl}/pin-shadow.png`
        }
      }

      new L.GPX(props.gpx, gpxOptions)
        .on('loaded', (e) => {
          const gpx = e.target
          mapObject.fitBounds(e.target.getBounds())

          meta.value = {
            name: gpx.get_name(),
            distance: gpx.get_distance_imp().toFixed(2),
            elevationGain: gpx.to_ft(gpx.get_elevation_gain()).toFixed(0),
            elevationLoss: gpx.to_ft(gpx.get_elevation_loss()).toFixed(0),
            elevationNet: gpx.to_ft(gpx.get_elevation_gain() - gpx.get_elevation_loss()).toFixed(0)
          }
        })
        .addTo(mapObject)
    })

    onBeforeUnmount(() => {
      mapObject.remove()
    })

    return {
      mapElement,
      meta,
      leafletCss,
      styleTag: 'style'
    }
  }
})
</script>

<style type="scss">
#leafletContainer {
  height: 80%;
}
</style>
