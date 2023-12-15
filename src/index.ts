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
              id: 'com.github.owncloud.web.gpx-viewer.mapPanel',
              type: 'sidebarPanel',
              scopes: ['resource'],
              panel: {
                name: 'location-details',
                icon: 'map-2',
                iconFillType: 'line',
                title: () => $gettext('Location'),
                component: LocationPanel,
                componentAttrs: (panelContext) => ({ panelContext, applicationConfig }),
                isRoot: () => false,
                isVisible: ({ items }) => {
                  return items?.length > 0 && items?.some((item) => !!item.location)
                }
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
