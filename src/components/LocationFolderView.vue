<template>
  <div>
    <no-content-message v-if="!pinLocations.length" class="files-empty" icon="map-2">
      <template #message>
        <span v-translate>No files with location data</span>
      </template>
    </no-content-message>
    <div
      ref="leafletElement"
      class="leafletContainer"
      :style="{
        height: '100%',
        ...(!pinLocations.length && { display: 'none' })
      }"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref, unref, watch, computed, onUnmounted } from 'vue'
import { useLeaflet } from '../composables'
import { useSideBar, NoContentMessage } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'

import L from 'leaflet-gpx'
import { LatLngExpression } from 'leaflet'

export default defineComponent({
  components: {
    NoContentMessage
  },
  props: {
    resources: {
      type: Array as PropType<Resource>,
      required: true
    },
    applicationConfig: {
      type: Object,
      required: true
    }
  },
  setup(props, { attrs }) {
    const { createMap, createPinIcon } = useLeaflet()
    const leafletElement = ref<HTMLElement | null>()
    const { onPanelActive } = useSideBar()
    const initialized = ref(false)
    const resources = computed(() => {
      return (unref(props.resources?.filter((r) => !!r.location)) || []) as Resource[]
    })
    const pinLocations = computed(() => {
      return unref(resources).map(
        (resource) =>
          [resource.location.latitude, resource.location.longitude, 1] as LatLngExpression
      )
    })
    const bounds = computed(() => {
      let latLngBounds = new L.LatLngBounds()
      unref(pinLocations).forEach((location) => {
        latLngBounds.extend(location)
      })
      return latLngBounds
    })

    const pinIcon = createPinIcon()
    let pins = []
    const setView = () => {
      if (!initialized.value) {
        return
      }
      mapObject?.invalidateSize()
      if (unref(pinLocations).length > 0) {
        mapObject?.fitBounds(unref(bounds), { maxZoom: unref(pinLocations).length > 1 ? 15 : 10 })
      }

      pins.forEach((pin) => mapObject.removeLayer(pin))
      unref(pinLocations).forEach((p) => {
        pins.push(L.marker(p, { icon: pinIcon }).addTo(mapObject))
      })
    }
    watch(
      () => [bounds],
      () => {
        setView()
      }
    )
    let mapObject
    onMounted(() => {
      initialized.value = true
      mapObject = createMap(props.applicationConfig, unref(leafletElement))
      setView()
    })
    onUnmounted(() => {
      mapObject?.remove()
    })
    onPanelActive('location-details', () => {
      initialized.value = true
      setView()
    })
    return {
      leafletElement,
      pinLocations
    }
  }
})
</script>
