# ownCloud Web GPX Viewer

[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web-app-gpx-viewer/status.svg)](https://drone.owncloud.com/owncloud/web-app-gpx-viewer)

ownCloud Web GPX Viewer app.

## Quick reference

- **Where to file issues:**\
  [owncloud/web-app-gpx-viewer](https://github.com/owncloud/web-app-gpx-viewer/issues)

- **Supported architectures:**\
  `amd64`

## Config

```json
{
  …
  "external_apps": [
    {
      "id": "gpx-viewer",
      "path": "http://gpxviewer.yourdomain.com/js/web-app-gpx-viewer.js",
      "config": {
        "tileLayerUrlTemplate": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        "tileLayerOptions": {
          "maxZoom": 19,
          "attribution": "© OpenStreetMap"
        }
      }
    }
  ]
}
```

`tileLayerUrlTemplate` and `tileLayerOptions` don't need to be specified as they default to these values anyway, but you can use these settings to override the defaults.

## Docker Tags and respective Dockerfile links

- [`latest`](https://github.com/owncloud/web-app-gpx-viewer/blob/master/docker/Dockerfile) available as `registry.owncloud.com/internal/web-app-gpx-viewer:latest`

## Default volumes

None

## Exposed ports

- 8080

## Environment variables

None

## Copyright

```Text
Copyright (c) 2021 ownCloud GmbH
```
