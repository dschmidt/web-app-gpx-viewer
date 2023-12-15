import translations from '../l10n/translations.json'
import {
  AppWrapperRoute,
  defineWebApplication,
  Extension,
  ApplicationSetupOptions
} from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import LocationPanel from './components/LocationPanel.vue'
import GpxMap from './components/GpxMap.vue'

import 'leaflet/dist/leaflet.css'
import LocationFolderView from './components/LocationFolderView.vue'

export default defineWebApplication({
  setup(args) {
    const { $gettext } = useGettext()

    const appInfo = {
      name: $gettext('GPX Viewer'),
      id: 'gpx-viewer',
      icon: 'map-2',
      iconFillType: 'line',
      iconColor: 'green',
      extensions: [
        {
          extension: 'gpx',
          routeName: 'gpx-viewer',
          canBeDefault: true
        }
      ]
    }

    const extensions = ({ applicationConfig }: ApplicationSetupOptions) => {
      return computed(
        () =>
          [
            {
              id: 'com.github.owncloud.web.gpx-viewer.map-panel',
              type: 'sidebarPanel',
              scopes: ['resource'],
              panel: {
                name: 'location-details',
                icon: 'map-2',
                iconFillType: 'line',
                title: () => $gettext('Location'),
                component: LocationPanel,
                componentAttrs: (panelContext) => ({
                  resources: panelContext.items,
                  applicationConfig
                }),
                isRoot: () => false,
                isVisible: ({ items }) => {
                  return items?.length > 0 && items?.some((item) => !!item.location)
                }
              }
            },
            {
              id: 'com.github.owncloud.web.gpx-viewer.folder-view.map-view',
              type: 'folderView',
              scopes: ['resource', 'favorite'],
              folderView: {
                name: 'resource-map',
                label: $gettext('Switch to map view'),
                icon: {
                  name: 'map-2',
                  fillType: 'line'
                },
                isScrollable: false,
                component: LocationFolderView,
                componentAttrs: () => ({ applicationConfig })
              }
            }
          ] satisfies Extension[]
      )
    }

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(GpxMap, {
          applicationId: 'gpx-viewer',
          urlForResourceOptions: {
            disposition: 'inline'
          }
        }),
        name: 'gpx-viewer',
        meta: {
          authContext: 'hybrid',
          title: $gettext('GPX Viewer'),
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo,
      routes,
      translations,
      extensions: extensions(args)
    }
  }
})
