<template>
    <main>
    <app-top-bar :resource="resource" @close="closeApp" />
    <div v-if="loading">Loading</div>
    <div v-else-if="loadingError">Loading Error</div>
    <leaflet-map v-else class="oc-height-1-1" :gpx="gpx" :application-config="applicationConfig" />
  </main>
</template>

<script lang="ts">
import AppIndex from './index.js'
import { defineComponent, ref, unref, onBeforeUnmount, onMounted } from '@vue/composition-api'

import AppTopBar from './boilerplate/web-pkg/components/AppTopBar.vue'


import LeafletMap from './components/LeafletMap.vue'
import { useAppDefaults } from './boilerplate/web-pkg/src/composables/appDefaults/useAppDefaults'
import { DavProperties } from './boilerplate/web-pkg/src/constants'

export default defineComponent({
  name: 'GpxViewerRoot',
  components: {
    AppTopBar,
    LeafletMap
  },
  setup() {
    const appDefaults = useAppDefaults({
        applicationId: 'gpx-viewer'
    })

    const loading = ref(true)
    const loadingError = ref(false)
    const resource = ref(null)
    const gpx = ref('')

    const loadGpx = async (fileContext) => {
      try {
        loading.value = true
        resource.value = await appDefaults.getFileResource(unref(fileContext.path), DavProperties.Default)
        gpx.value = (await appDefaults.getFileContents(resource.value.webDavPath, {})).body
        loading.value = false
      } catch (e) {
        loadingError.value = true
      }
    }

    onMounted(() => {
      loadGpx(unref(appDefaults.currentFileContext))
    })


    return {
      ...appDefaults,
      loading,
      loadingError,
      resource,
      gpx
    }
  }
})
</script>

<style lang="scss" scoped>
main {
  overflow: scroll;
}
</style>
