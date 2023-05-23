<template>
  <main>
    <app-top-bar :resource="resource" @close="closeApp" />
    <div v-if="loading">Loading</div>
    <div v-else-if="loadingError">Loading Error</div>
    <leaflet-map v-else class="oc-height-1-1" :gpx="gpx" :application-config="applicationConfig" />
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, unref, onMounted } from 'vue'

import LeafletMap from './components/LeafletMap.vue'
import { FileContext, AppTopBar, useAppDefaults } from '@ownclouders/web-pkg'

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

    const loadGpx = async (fileContext: FileContext) => {
      try {
        loading.value = true
        resource.value = await appDefaults.getFileInfo(fileContext)
        gpx.value = (await appDefaults.getFileContents(fileContext, {})).body
        loading.value = false
      } catch (e) {
        console.log('ERROR', e)
        loadingError.value = true
      }
    }

    onMounted(() => {
      // unref does not deal well with MaybeRefs ...
      loadGpx(unref(appDefaults.currentFileContext) as unknown as FileContext)
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
