import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Box, Text } from '@mantine/core'
import { XClose } from '@untitledui/icons'
import { useShipContext } from '../context/ShipContext'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// AIS - green ship
const aisSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00EB6C" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/></svg>`

// Dark - orange ship with radar
const darkShipSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387H12.75L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387L6.74999 20.9387Z" fill="#FFA500" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="#111326"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="#111326"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="#111326"/></svg>`

// Light - blue ship with radar
const lightShipSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00A3E3" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="white"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="white"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="white"/></svg>`

// Spoofing - pink diamond with exclamation
const spoofingSvg = `<svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="11.0607" y="1.06065" width="14.1421" height="14.1421" transform="rotate(45 11.0607 1.06065)" fill="#FF6D99" stroke="#111326" stroke-width="1.5"/><path d="M11.0607 11.8937V7.1716" stroke="#111326" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.0607" cy="14.9492" r="1.11108" fill="#111326"/></svg>`

// Unattributed - red ship with magnifying glass
const unattributedSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#F75349" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><ellipse cx="6.72543" cy="12.4387" rx="2.57571" ry="2.5" stroke="#111326" stroke-width="1.5"/><path d="M9.15069 17.4049C9.38254 17.7481 9.85378 17.8461 10.2032 17.6237C10.5527 17.4014 10.648 16.9428 10.4162 16.5996L9.78344 17.0022L9.15069 17.4049ZM8.08876 14.4934L7.45601 14.896L9.15069 17.4049L9.78344 17.0022L10.4162 16.5996L8.72151 14.0907L8.08876 14.4934Z" fill="#111326"/></svg>`

const svgByType = {
  ais: aisSvg,
  dark: darkShipSvg,
  light: lightShipSvg,
  spoofing: spoofingSvg,
  unattributed: unattributedSvg,
}

const eventColorMap = {
  ais: '#00EB6C',
  light: '#00A3E3',
  dark: '#FFA500',
  spoofing: '#FF6D99',
  unattributed: '#F75349',
}

const buildStsSvg = (leftColor, rightColor) =>
  `<svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.75" y="0.75" width="9.5" height="19" fill="${leftColor}"/><rect x="10.25" y="0.75" width="9.5" height="19" fill="${rightColor}"/><rect x="0.75" y="0.75" width="19" height="19" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M10.25 0.75L10.25 19.75" stroke="#111326" stroke-width="1.5" stroke-linecap="round"/></svg>`

const getMarkerSvg = (detection) => {
  if (detection.type === 'sts' || detection.type === 'sts-ais') {
    const leftType = 'light'
    const rightType = detection.type === 'sts' ? 'unattributed' : 'ais'
    return buildStsSvg(
      eventColorMap[leftType] || eventColorMap.light,
      eventColorMap[rightType] || eventColorMap.unattributed
    )
  }
  return svgByType[detection.type]
}

// Get just the date part (no time) from a detection date string like "Feb 27, 2026 09:53"
const getDateKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getMarkerDateLabel = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const MAP_TOOL_POPUP_LAYOUT = {
  'extended-path': { top: 82, right: 28, width: 450 },
  'estimated-location': { top: 156, right: 28, width: 450 },
  'future-path-prediction': { top: 230, right: 28, width: 450 },
}

const MAP_TOOL_POPUP_TITLES = {
  'extended-path': 'Extended path',
  'estimated-location': 'Estimated Location',
  'future-path-prediction': 'Future Path Prediction',
}

const getDefaultPopupPosition = (layout, containerWidth) => ({
  x: Math.max(12, containerWidth - layout.width - layout.right),
  y: layout.top,
})

const Map = ({ onDetectionClick }) => {
  const {
    activeDetectionId,
    previewDetectionId,
    panelFocusDetectionId,
    mapDate,
    activeShipTab,
    shipTabs,
    runtimeDetections,
    openMapToolPanelsByTab,
    closeMapToolPanel,
  } = useShipContext()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({})
  const onDetectionClickRef = useRef(onDetectionClick)
  const [mapReady, setMapReady] = useState(false)
  const [popupPositions, setPopupPositions] = useState({})
  const [dragState, setDragState] = useState(null)
  const popupPositionsRef = useRef({})
  onDetectionClickRef.current = onDetectionClick
  const openToolPanels = activeShipTab
    ? openMapToolPanelsByTab[activeShipTab] || []
    : []
  const mapWidth =
    mapContainer.current?.clientWidth ||
    (typeof window !== 'undefined' ? window.innerWidth : 1280)

  // Initialize map once.
  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [63, 15],
      zoom: 4,
      projection: 'mercator',
      attributionControl: false,
      logoPosition: 'bottom-right',
    })
    setMapReady(true)

    const observer = new ResizeObserver(() => {
      map.current?.resize()
    })
    observer.observe(mapContainer.current)

    return () => {
      setMapReady(false)
      observer.disconnect()
      map.current.remove()
      map.current = null
    }
  }, [])

  // Create markers for all detections (including newly added prototype detections).
  useEffect(() => {
    if (!map.current || !mapReady) return

    const validIds = new Set(runtimeDetections.map((d) => String(d.id)))
    Object.keys(markersRef.current).forEach((id) => {
      if (validIds.has(String(id))) return
      markersRef.current[id]?.remove()
      delete markersRef.current[id]
    })

    runtimeDetections.forEach((detection) => {
      let marker = markersRef.current[detection.id]
      if (!marker) {
        const svg = getMarkerSvg(detection)
        if (!svg) return
        const el = document.createElement('div')
        el.className = 'map-marker'
        el.style.cursor = 'pointer'
        el.addEventListener('click', () => {
          Object.values(markersRef.current).forEach((m) => {
            m.getElement().classList.remove('active')
            m.getElement().classList.remove('previewed')
          })
          el.classList.add('active')
          onDetectionClickRef.current?.(detection)
        })
        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([detection.lng, detection.lat])
          .addTo(map.current)
        markersRef.current[detection.id] = marker
      }

      marker.setLngLat([detection.lng, detection.lat])
      const el = marker.getElement()
      const svg = getMarkerSvg(detection)
      if (svg) el.innerHTML = svg
      el.dataset.detectionId = detection.id
      el.dataset.shipId = detection.shipId
      el.dataset.detectionType = detection.type
      el.dataset.markerDate = getMarkerDateLabel(detection.date)
      if (getDateKey(detection.date) !== mapDate) {
        el.style.display = 'none'
      }
    })
  }, [runtimeDetections, mapDate, mapReady])

  // Refresh marker SVGs so STS colors stay in sync.
  useEffect(() => {
    runtimeDetections.forEach((det) => {
      const marker = markersRef.current[det.id]
      if (!marker) return
      const el = marker.getElement()
      const svg = getMarkerSvg(det)
      if (svg) el.innerHTML = svg
    })
  }, [mapDate, shipTabs, activeDetectionId, runtimeDetections])

  // When a detection is selected or previewed from timeline, highlight it and fly to it
  useEffect(() => {
    if (!map.current) return

    const panelFocusId =
      panelFocusDetectionId == null ? null : String(panelFocusDetectionId)
    const activeId = activeDetectionId == null ? null : String(activeDetectionId)
    const previewId = previewDetectionId == null ? null : String(previewDetectionId)
    const primaryFocusId = panelFocusId || activeId

    // Clear all selection/preview highlights
    Object.values(markersRef.current).forEach((m) => {
      m.getElement().classList.remove('active')
      m.getElement().classList.remove('previewed')
    })

    if (primaryFocusId) {
      const selectedMarker = markersRef.current[primaryFocusId]
      selectedMarker?.getElement().classList.add('active')
    }

    if (previewId && !primaryFocusId) {
      const previewMarker = markersRef.current[previewId]
      previewMarker?.getElement().classList.add('previewed')
    }

    // Panel-selected event is authoritative, then active, then preview.
    const focusDetectionId = primaryFocusId || previewId
    if (!focusDetectionId) return
    const focusDet = runtimeDetections.find(
      (d) => String(d.id) === String(focusDetectionId)
    )
    if (!focusDet) return
    map.current.flyTo({ center: [focusDet.lng, focusDet.lat], zoom: 6, duration: 1500 })
  }, [
    panelFocusDetectionId,
    activeDetectionId,
    previewDetectionId,
    runtimeDetections,
  ])

  // Show halo on markers whose ship has an open tab
  useEffect(() => {
    if (!map.current) return
    const openShipIds = new Set()
    shipTabs.forEach((tab) => {
      if (tab.type === 'sts' && tab.shipIds) {
        tab.shipIds.forEach((id) => openShipIds.add(id))
      } else {
        openShipIds.add(tab.id)
      }
    })
    runtimeDetections.forEach((det) => {
      const marker = markersRef.current[det.id]
      if (!marker) return
      const el = marker.getElement()
      if (
        openShipIds.has(det.shipId) &&
        !el.classList.contains('active')
      ) {
        el.classList.add('opened')
      } else {
        el.classList.remove('opened')
      }
    })
  }, [shipTabs, activeDetectionId, previewDetectionId, runtimeDetections])

  // Filter markers by date, but keep selected/preview detection visible
  useEffect(() => {
    if (!map.current) return

    const panelFocusId =
      panelFocusDetectionId == null ? null : String(panelFocusDetectionId)
    const activeId = activeDetectionId == null ? null : String(activeDetectionId)
    const previewId = previewDetectionId == null ? null : String(previewDetectionId)
    const primaryFocusId = panelFocusId || activeId

    runtimeDetections.forEach((det) => {
      const marker = markersRef.current[det.id]
      if (!marker) return
      const el = marker.getElement()
      const isSelected =
        primaryFocusId != null && String(det.id) === String(primaryFocusId)
      const isPreviewed = previewId != null && String(det.id) === previewId
      const isCurrentDate = getDateKey(det.date) === mapDate
      el.dataset.historical = isCurrentDate ? 'false' : 'true'
      el.style.display = isCurrentDate || isSelected || isPreviewed ? '' : 'none'
    })
  }, [
    mapDate,
    panelFocusDetectionId,
    activeDetectionId,
    previewDetectionId,
    runtimeDetections,
  ])

  useEffect(() => {
    popupPositionsRef.current = popupPositions
  }, [popupPositions])

  useEffect(() => {
    if (!activeShipTab) return
    setPopupPositions((prev) => {
      let changed = false
      const next = { ...prev }
      openToolPanels.forEach((toolId) => {
        if (!MAP_TOOL_POPUP_LAYOUT[toolId]) return
        if (!next[toolId]) {
          const layout = MAP_TOOL_POPUP_LAYOUT[toolId]
          const defaultPosition = getDefaultPopupPosition(layout, mapWidth)
          next[toolId] = {
            x: defaultPosition.x,
            y: defaultPosition.y,
          }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [activeShipTab, openToolPanels, mapWidth])

  useEffect(() => {
    if (!dragState) return undefined

    const handleMouseMove = (event) => {
      const nextX = Math.max(12, event.clientX - dragState.offsetX)
      const nextY = Math.max(12, event.clientY - dragState.offsetY)
      setPopupPositions((prev) => ({
        ...prev,
        [dragState.toolId]: { x: nextX, y: nextY },
      }))
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState])

  return (
    <>
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
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {openToolPanels
          .filter((toolId) => MAP_TOOL_POPUP_LAYOUT[toolId])
          .map((toolId) => {
            const layout = MAP_TOOL_POPUP_LAYOUT[toolId]
            const defaultPosition = getDefaultPopupPosition(layout, mapWidth)
            const title = MAP_TOOL_POPUP_TITLES[toolId] || 'Tool'
            return (
              <Box
                key={toolId}
                style={{
                  position: 'absolute',
                  top: popupPositions[toolId]?.y ?? defaultPosition.y,
                  left: popupPositions[toolId]?.x ?? defaultPosition.x,
                  width: layout.width,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#0A0F35',
                  border: '1px solid #393C56',
                  pointerEvents: 'auto',
                }}
              >
                <Box
                  style={{
                    height: 58,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#252846',
                    cursor: dragState?.toolId === toolId ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={(event) => {
                    if (event.button !== 0) return
                    const currentPosition =
                      popupPositionsRef.current[toolId] || {
                        x: defaultPosition.x,
                        y: defaultPosition.y,
                      }
                    setDragState({
                      toolId,
                      offsetX: event.clientX - currentPosition.x,
                      offsetY: event.clientY - currentPosition.y,
                    })
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 500 }}>
                    {title}
                  </Text>
                  <XClose
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={() => closeMapToolPanel(activeShipTab, toolId)}
                    style={{
                      width: 20,
                      height: 20,
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Box>
            )
          })}
      </Box>
    </>
  )
}

export default Map
