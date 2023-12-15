import { MapOptions } from 'leaflet'
import L from 'leaflet-gpx'
import { dirname } from '@ownclouders/web-pkg'

export type GeoCoordinates = {
  latitude: number
  longitude: number
}

export type MarkerOptions = {
  location: GeoCoordinates
  pinOptions: unknown
}

export const useLeaflet = () => {
  const assetsBaseUrl = `${dirname(dirname(import.meta.url))}/assets`

  const createPinIcon = (...options) => {
    return L.icon({
      iconUrl: `${assetsBaseUrl}/pin-icon-start.png`,
      shadowUrl: `${assetsBaseUrl}/pin-shadow.png`,
      ...options
    })
  }

  const createMap = (
    applicationConfig: Record<string, any>,
    element: string | HTMLElement,
    options?: MapOptions
  ) => {
    const map = L.map(element, options)

    const urlTemplate =
      applicationConfig?.tileLayerUrlTemplate || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    const tileOptions = {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
      ...applicationConfig?.tileLayerOptions
    }

    L.tileLayer(urlTemplate, tileOptions).addTo(map)

    L.control
      .scale({
        imperial: false
      })
      .addTo(map)

    return map
  }

  return {
    assetsBaseUrl,
    createMap,
    createPinIcon
  }
}
