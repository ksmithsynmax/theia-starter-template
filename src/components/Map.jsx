import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const AOI_SOURCE_ID = 'prototype-aois-source'
const AOI_FILL_LAYER_ID = 'prototype-aois-fill'
const AOI_LINE_LAYER_ID = 'prototype-aois-line'
const AOI_LABEL_LAYER_ID = 'prototype-aois-label'

const Map = ({
  aois = [],
  aoiLayerVisible = true,
  ships = [],
  selectedShipId = null,
  onShipClick,
  onBackgroundClick,
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const popupRef = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'mercator',
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('click', () => {
      onBackgroundClick?.()
    })

    const observer = new ResizeObserver(() => {
      map.current?.resize()
    })
    observer.observe(mapContainer.current)

    return () => {
      observer.disconnect()
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      popupRef.current?.remove()
      popupRef.current = null
      map.current.remove()
      map.current = null
    }
  }, [onBackgroundClick])

  useEffect(() => {
    if (!map.current) return
    const mapInstance = map.current
    const featureCollection = {
      type: 'FeatureCollection',
      features: aois.map((aoi) => ({
        type: 'Feature',
        properties: {
          id: aoi.id,
          name: aoi.name,
          customerName: aoi.customerName,
          color: aoi.color,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [aoi.coordinates],
        },
      })),
    }

    const updateLayerVisibility = () => {
      if (!mapInstance.getLayer(AOI_FILL_LAYER_ID)) return
      const visibility = aoiLayerVisible ? 'visible' : 'none'
      mapInstance.setLayoutProperty(AOI_FILL_LAYER_ID, 'visibility', visibility)
      mapInstance.setLayoutProperty(AOI_LINE_LAYER_ID, 'visibility', visibility)
      mapInstance.setLayoutProperty(AOI_LABEL_LAYER_ID, 'visibility', visibility)
    }

    if (mapInstance.getSource(AOI_SOURCE_ID)) {
      mapInstance.getSource(AOI_SOURCE_ID).setData(featureCollection)
      updateLayerVisibility()
      return
    }

    const addAoiLayers = () => {
      if (mapInstance.getSource(AOI_SOURCE_ID)) {
        mapInstance.getSource(AOI_SOURCE_ID).setData(featureCollection)
        updateLayerVisibility()
        return
      }
      mapInstance.addSource(AOI_SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
      })
      mapInstance.addLayer({
        id: AOI_FILL_LAYER_ID,
        type: 'fill',
        source: AOI_SOURCE_ID,
        paint: {
          'fill-color': ['coalesce', ['get', 'color'], '#2A9DFF'],
          'fill-opacity': 0.13,
        },
      })
      mapInstance.addLayer({
        id: AOI_LINE_LAYER_ID,
        type: 'line',
        source: AOI_SOURCE_ID,
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#2A9DFF'],
          'line-width': 2,
          'line-opacity': 0.9,
        },
      })
      mapInstance.addLayer({
        id: AOI_LABEL_LAYER_ID,
        type: 'symbol',
        source: AOI_SOURCE_ID,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#DDE6F6',
          'text-halo-color': '#181926',
          'text-halo-width': 1,
        },
      })
      updateLayerVisibility()
    }

    if (!mapInstance.isStyleLoaded()) {
      mapInstance.once('load', addAoiLayers)
      return
    }
    addAoiLayers()
  }, [aois, aoiLayerVisible])

  useEffect(() => {
    if (!map.current) return
    const mapInstance = map.current
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    popupRef.current?.remove()
    popupRef.current = null

    ships.forEach((ship) => {
      if (
        !Number.isFinite(ship.lng) ||
        !Number.isFinite(ship.lat) ||
        ship.lng < -180 ||
        ship.lng > 180 ||
        ship.lat < -90 ||
        ship.lat > 90
      ) {
        return
      }

      const markerElement = document.createElement('div')
      const markerSize = ship.risk?.isFlagged ? 18 : 14
      markerElement.style.width = `${markerSize}px`
      markerElement.style.height = `${markerSize}px`
      markerElement.style.borderRadius = '999px'
      markerElement.style.background = ship.risk?.isFlagged ? '#F75349' : '#00A3E3'
      markerElement.style.border =
        selectedShipId === ship.id ? '2px solid #FFFFFF' : '1px solid #101425'
      markerElement.style.boxShadow = ship.inSelectedAoi
        ? '0 0 0 5px rgba(42,157,255,0.25)'
        : '0 0 0 3px rgba(247,83,73,0.2)'
      markerElement.style.cursor = 'pointer'
      markerElement.style.position = 'relative'
      markerElement.style.display = 'flex'
      markerElement.style.alignItems = 'center'
      markerElement.style.justifyContent = 'center'

      if (ship.risk?.isFlagged) {
        const badge = document.createElement('div')
        badge.textContent = '!'
        badge.style.position = 'absolute'
        badge.style.top = '-7px'
        badge.style.right = '-7px'
        badge.style.width = '14px'
        badge.style.height = '14px'
        badge.style.borderRadius = '999px'
        badge.style.background = '#FFD166'
        badge.style.color = '#1B1D2E'
        badge.style.fontSize = '10px'
        badge.style.fontWeight = '700'
        badge.style.lineHeight = '14px'
        badge.style.textAlign = 'center'
        markerElement.appendChild(badge)
      }

      markerElement.addEventListener('mouseenter', () => {
        popupRef.current?.remove()
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 18,
          className: 'risk-marker-popup',
        })
          .setLngLat([ship.lng, ship.lat])
          .setHTML(
            `<div style="min-width:190px"><div style="font-weight:700;margin-bottom:4px">${ship.name}</div><div style="font-size:12px;line-height:1.35">${ship.risk?.reasonSummary || 'No active risk signal.'}</div></div>`
          )
          .addTo(mapInstance)
        popupRef.current = popup
      })
      markerElement.addEventListener('mouseleave', () => {
        popupRef.current?.remove()
        popupRef.current = null
      })
      markerElement.addEventListener('click', (event) => {
        event.stopPropagation()
        onShipClick?.(ship.id)
      })

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat([ship.lng, ship.lat])
        .addTo(mapInstance)
      markersRef.current.push(marker)
    })
  }, [ships, selectedShipId, onShipClick])

  return (
    <div
      ref={mapContainer}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        outline: 'none',
      }}
    />
  )
}

export default Map
