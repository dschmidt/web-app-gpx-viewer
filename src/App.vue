<template>
  <leaflet-map
    class="oc-height-1-1"
    :gpx="currentContent"
    :application-config="applicationConfig"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import LeafletMap from './components/LeafletMap.vue'
import { AppConfigObject } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'GpxViewerRoot',
  components: {
    LeafletMap
  },
  props: {
    applicationConfig: { type: Object as PropType<AppConfigObject>, required: true },
    currentContent: {
      type: String,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
main {
  overflow: scroll;
}
</style>
