<template>
  <div>
    <!-- FIXME: this is a mess but I could not make the style import work any other way ... -->
    <component is="style" type="text/css">{{ leafletCss }}</component>
    <div ref="mapElement" class="leaftletContainer" id="leafletContainer"/>
    <table style="border-spacing: 10px;">
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
import { defineComponent, onMounted, ref, onBeforeUnmount } from '@vue/composition-api'

import leafletCss from "leaflet/dist/leaflet.css"
import L from "leaflet-gpx"

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
    onMounted(async () => {
      mapObject = L.map('leafletContainer')

      const urlTemplate = props.applicationConfig.tileLayerUrlTemplate || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      const options = {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        ...props.applicationConfig.tileLayerOptions
      }
      L.tileLayer(urlTemplate, options).addTo(mapObject)
      L.control.scale({
        imperial: false
      }).addTo(mapObject)

      const assetsBaseUrl = props.applicationConfig.assetsBaseUrl
      const gpxOptions = {
        async: true,
        marker_options: {
          startIconUrl: `${assetsBaseUrl}/pin-icon-start.png`,
          endIconUrl: `${assetsBaseUrl}/pin-icon-end.png`,
          shadowUrl: `${assetsBaseUrl}/pin-shadow.png`
        }
      }

      new L.GPX(props.gpx, gpxOptions).on('loaded', (e) => {
        const gpx = e.target
        mapObject.fitBounds(e.target.getBounds())

        meta.value = {
          name: gpx.get_name(),
          distance: gpx.get_distance_imp().toFixed(2),
          elevationGain: gpx.to_ft(gpx.get_elevation_gain()).toFixed(0),
          elevationLoss: gpx.to_ft(gpx.get_elevation_loss()).toFixed(0),
          elevationNet: gpx.to_ft(gpx.get_elevation_gain()
            - gpx.get_elevation_loss()).toFixed(0)
        }
      }).addTo(mapObject);
    })

    onBeforeUnmount(() => {
      mapObject.remove()
    })

    return {
      mapElement,
      meta,
      leafletCss
    }
  }
})
</script>

<style type="scss">
#leafletContainer {
  height: 80%;
}

</style>