import App from './App.vue'
import translations from '../l10n/translations.json'
import { AppWrapperRoute } from '@ownclouders/web-pkg/src/components/AppTemplates/AppWrapperRoute'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: 'GPX Viewer',
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

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: AppWrapperRoute(App, {
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

export default {
  appInfo,
  routes,
  translations
}
