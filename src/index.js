import App from './App.vue'
import translations from '../l10n/translations'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: 'GPX Viewer',
  id: 'gpx-viewer',
  icon: 'map-2',
  iconFillType: 'line',
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
    path: '/:filePath*',
    component: App,
    name: 'gpx-viewer',
    meta: {
      auth: false,
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
