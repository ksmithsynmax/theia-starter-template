import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Box, Text } from '@mantine/core'
import { XClose, Minus } from '@untitledui/icons'
import ExtendedPathPanel from './ExtendedPathPanel'
import FuturePathPanel from './FuturePathPanel'
import EstimatedLocationPanel from './EstimatedLocationPanel'
import { useShipContext } from '../context/ShipContext'
import { getPortIconSvg } from '../custom-icons/PortIcon'
import { mockPortFeatures } from '../data/mockPortFeatures'

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

// Keep overlapping popup stacking deterministic so child controls/icons
// never render above a panel that should be on top.
const MAP_TOOL_POPUP_ZINDEX = {
  'extended-path': 10,
  'estimated-location': 20,
  'future-path-prediction': 30,
}

const getDefaultPopupPosition = (layout, containerWidth) => ({
  x: Math.max(12, containerWidth - layout.width - layout.right),
  y: layout.top,
})

const PROTOTYPE_PORTS = [
  { id: 'port-dubai', name: 'Dubai', lng: 55.2708, lat: 25.2648 },
  { id: 'port-muscat', name: 'Muscat', lng: 58.5659, lat: 23.6280 },
  { id: 'port-mumbai', name: 'Mumbai', lng: 72.8277, lat: 18.9360 },
  { id: 'port-bar-harbor', name: 'Bar Harbor', lng: 103.78, lat: 1.25, flag: '🇺🇸' },
]
const PORT_FOCUS_MIN_GUTTER_PX = 180

const getFeatureCenterNoMapbox = (feature) => {
  // Prefer geometric centroid for polygons so translation anchor matches
  // the same center logic used for marker alignment.
  const ring = feature?.geometry?.coordinates?.[0]
  if (Array.isArray(ring) && ring.length >= 3) {
    let area = 0
    let cx = 0
    let cy = 0
    for (let i = 0; i < ring.length - 1; i++) {
      const [x0, y0] = ring[i]
      const [x1, y1] = ring[i + 1]
      if (
        !Number.isFinite(x0) ||
        !Number.isFinite(y0) ||
        !Number.isFinite(x1) ||
        !Number.isFinite(y1)
      ) {
        continue
      }
      const f = x0 * y1 - x1 * y0
      area += f
      cx += (x0 + x1) * f
      cy += (y0 + y1) * f
    }
    area /= 2
    if (Math.abs(area) > 1e-12) {
      const k = 1 / (6 * area)
      return [cx * k, cy * k]
    }
  }

  const coordinates = feature?.geometry?.coordinates
  if (!Array.isArray(coordinates)) return null
  const points = coordinates
    .flatMap((polyRing) => polyRing || [])
    .filter(
      (coord) =>
        Array.isArray(coord) &&
        coord.length >= 2 &&
        Number.isFinite(coord[0]) &&
        Number.isFinite(coord[1])
    )
  if (points.length === 0) return null
  const lngs = points.map((point) => point[0])
  const lats = points.map((point) => point[1])
  return [
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ]
}

const BASE_PORT_BOUNDARY_CENTER = getFeatureCenterNoMapbox(
  mockPortFeatures.features.find((feature) => feature?.properties?.id === 'port-boundary')
)

// Shoelace centroid — center of mass of the outer ring.
// More accurate than a bounding-box midpoint for irregular polygons where
// more area sits on one side (e.g. a harbor shape wider at the top).
const getPolygonCenter = (feature) => {
  const ring = feature?.geometry?.coordinates?.[0]
  if (!Array.isArray(ring) || ring.length < 3) return null
  let area = 0, cx = 0, cy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const f = x0 * y1 - x1 * y0
    area += f
    cx += (x0 + x1) * f
    cy += (y0 + y1) * f
  }
  area /= 2
  if (Math.abs(area) < 1e-12) return null
  const k = 1 / (6 * area)
  return [cx * k, cy * k]
}

const ALERT_PREVIEW_AREAS = {
  persian_gulf: {
    label: 'Persian Gulf',
    length: '372.57km',
    area: '100km²',
    center: [53.5, 26.5],
    polygon: [
      [50.8, 29.4],
      [52.8, 29.2],
      [55.4, 28.6],
      [57.2, 26.9],
      [56.6, 25.2],
      [54.4, 25.0],
      [52.3, 25.6],
      [51.0, 27.0],
      [50.8, 29.4],
    ],
  },
  red_sea: {
    label: 'Red Sea',
    length: '2250km',
    area: '438000km²',
    center: [38.2, 20.8],
    polygon: [
      [33.2, 28.9],
      [35.1, 26.7],
      [37.0, 24.2],
      [39.0, 21.1],
      [41.5, 17.8],
      [43.1, 14.7],
      [42.0, 12.7],
      [39.4, 14.8],
      [36.8, 18.8],
      [34.9, 22.2],
      [33.2, 28.9],
    ],
  },
  south_china_sea: {
    label: 'South China Sea',
    length: '3500km',
    area: '3500000km²',
    center: [114.0, 14.0],
    polygon: [
      [106.0, 20.0],
      [111.0, 22.5],
      [117.5, 21.0],
      [121.8, 17.2],
      [121.2, 11.5],
      [117.4, 7.8],
      [112.0, 6.5],
      [107.5, 9.4],
      [105.2, 14.8],
      [106.0, 20.0],
    ],
  },
}

const getAlertPreviewAreaKey = (areaLabel) => {
  const normalized = String(areaLabel || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return null
  if (normalized.includes('persian gulf')) return 'persian_gulf'
  if (normalized.includes('red sea')) return 'red_sea'
  if (normalized.includes('south china sea')) return 'south_china_sea'
  return null
}

const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] }
const HOVER_CARD_BY_TYPE = {
  port: {
    title: 'Port Summary',
    ships: 24,
    cargoTypes: 6,
    products: ['Crude Oil', 'Containers', 'LNG'],
    handles: ['Container', 'Bulk Carrier', 'Tanker'],
  },
  terminal: {
    title: 'Terminal Summary',
    ships: 9,
    cargoTypes: 4,
    products: ['Containers', 'Refined Products', 'Chemicals'],
    handles: ['Container', 'Tanker'],
  },
  berth: {
    title: 'Berth Summary',
    ships: 3,
    cargoTypes: 2,
    products: ['Containers', 'Dry Bulk'],
    handles: ['Container'],
  },
}

const Map = forwardRef(function Map(
  {
    onDetectionClick,
    onPortClick,
    showPorts = false,
    leftPanelInset = 0,
    portVisibilityBehavior = 'selected-context',
    forceHideSelectedPortContext = false,
    portHoverCardEnabled = true,
  },
  ref
) {
  const {
    activeDetectionId,
    previewDetectionId,
    panelFocusDetectionId,
    mapDate,
    activeShipTab,
    shipTabs,
    runtimeDetections,
    enabledDetectionTypes,
    openMapToolPanelsByTab,
    closeMapToolPanel,
    activePortLevel,
    setActivePortLevel,
    selectedTerminal,
    setSelectedTerminal,
    selectedBerth,
    setSelectedBerth,
    alertPreviewAreas,
  } = useShipContext()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({})
  const portMarkersRef = useRef({})
  const onDetectionClickRef = useRef(onDetectionClick)
  const onPortClickRef = useRef(onPortClick)
  const alertPreviewMarkersRef = useRef({})
  const detectionByIdRef = useRef(new globalThis.Map())
  const lastPreviewAreaSignatureRef = useRef('')
  const lastFocusedPortViewportKeyRef = useRef('')
  const portAnimatingRef = useRef(false)
  const portShapeExplicitlyShownRef = useRef(false)
  const activePortCenterRef = useRef(null)
  const portHoverPopupRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [popupPositions, setPopupPositions] = useState({})
  const [dragState, setDragState] = useState(null)
  const [mapDimensions, setMapDimensions] = useState({
    width: 1280,
    height: 800,
  })
  const popupPositionsRef = useRef({})
  onDetectionClickRef.current = onDetectionClick
  onPortClickRef.current = onPortClick
  const openToolPanels = openMapToolPanelsByTab['__global__'] || []
  const panelAwareFocusOffsetX = useMemo(() => {
    const viewportWidth = mapDimensions.width || 0
    if (viewportWidth <= 0) return 0

    const inset = Math.max(0, Number(leftPanelInset) || 0)
    if (inset === 0) return 0

    const availableWidth = Math.max(0, viewportWidth - inset)
    const dynamicGutter = Math.max(PORT_FOCUS_MIN_GUTTER_PX, availableWidth * 0.45)
    const desiredFocusX = Math.min(
      viewportWidth * 0.82,
      inset + dynamicGutter
    )
    const centerX = viewportWidth / 2
    const rawOffset = desiredFocusX - centerX
    return Math.max(0, Math.min(520, rawOffset))
  }, [leftPanelInset, mapDimensions.width])

  useEffect(() => {
    detectionByIdRef.current = new globalThis.Map(
      runtimeDetections.map((detection) => [String(detection.id), detection])
    )
  }, [runtimeDetections])

  useImperativeHandle(ref, () => ({
    zoomIn: () => map.current?.zoomIn(),
    zoomOut: () => map.current?.zoomOut(),
  }))

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
    
    map.current.on('load', () => {
      setMapReady(true)
    })

    const observer = new ResizeObserver(() => {
      map.current?.resize()
      if (mapContainer.current) {
        setMapDimensions({
          width: mapContainer.current.clientWidth,
          height: mapContainer.current.clientHeight,
        })
      }
    })
    observer.observe(mapContainer.current)

    return () => {
      setMapReady(false)
      observer.disconnect()
      Object.values(alertPreviewMarkersRef.current).forEach((marker) => {
        marker.remove()
      })
      alertPreviewMarkersRef.current = {}
      Object.values(portMarkersRef.current).forEach((marker) => {
        marker.__cleanupListeners?.()
        marker.remove()
      })
      portMarkersRef.current = {}
      map.current.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapReady) return

    if (!map.current.getSource('port-features')) {
      map.current.addSource('port-features', {
        type: 'geojson',
        data: mockPortFeatures,
      })

      // Port Boundary Fill
      map.current.addLayer({
        id: 'port-fill',
        type: 'fill',
        source: 'port-features',
        filter: ['==', 'type', 'port'],
        paint: {
          'fill-color': '#0094FF',
          'fill-opacity': 0, // Default hidden
        },
      })

      // Port Boundary Outline
      map.current.addLayer({
        id: 'port-outline',
        type: 'line',
        source: 'port-features',
        filter: ['==', 'type', 'port'],
        paint: {
          'line-color': '#0094FF',
          'line-width': 2,
          'line-opacity': 0, // Default hidden
        },
      })

      // Terminal Fill
      map.current.addLayer({
        id: 'terminal-fill',
        type: 'fill',
        source: 'port-features',
        filter: ['==', 'type', 'terminal'],
        paint: {
          'fill-color': '#0094FF',
          'fill-opacity': 0, // Default hidden
        },
      })

      // Terminal Outline
      map.current.addLayer({
        id: 'terminal-outline',
        type: 'line',
        source: 'port-features',
        filter: ['==', 'type', 'terminal'],
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1,
          'line-dasharray': [2, 2],
          'line-opacity': 0, // Default hidden
        },
      })

      // Berth Fill
      map.current.addLayer({
        id: 'berth-fill',
        type: 'fill',
        source: 'port-features',
        filter: ['==', 'type', 'berth'],
        paint: {
          'fill-color': '#0094FF',
          'fill-opacity': 0, // Default hidden
        },
      })
      
      // Berth Outline
      map.current.addLayer({
        id: 'berth-outline',
        type: 'line',
        source: 'port-features',
        filter: ['==', 'type', 'berth'],
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1,
          'line-opacity': 0, // Default hidden
        },
      })

      // Labels for Terminals and Berths
      map.current.addLayer({
        id: 'port-labels',
        type: 'symbol',
        source: 'port-features',
        filter: ['in', 'type', 'terminal', 'berth'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'left',
          'text-offset': [1, 0],
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
          'text-opacity': 0, // Default hidden
        },
      })

      map.current.addSource('inactive-port-features', {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      })

      map.current.addLayer({
        id: 'inactive-port-fill',
        type: 'fill',
        source: 'inactive-port-features',
        filter: ['==', 'type', 'port'],
        paint: {
          'fill-color': '#9AA3B8',
          'fill-opacity': 0,
        },
      })

      map.current.addLayer({
        id: 'inactive-port-outline',
        type: 'line',
        source: 'inactive-port-features',
        filter: ['==', 'type', 'port'],
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2,
          'line-opacity': 0,
        },
      })

      map.current.addLayer({
        id: 'inactive-port-inner-outline',
        type: 'line',
        source: 'inactive-port-features',
        filter: ['in', 'type', 'terminal', 'berth'],
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1,
          'line-dasharray': [2, 2],
          'line-opacity': 0,
        },
      })

      map.current.addSource('active-port-marker', {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      })

      map.current.addSource('inactive-port-marker', {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      })

      if (!map.current.hasImage('active-port-custom')) {
        const activePortIcon = new Image(30, 30)
        activePortIcon.onload = () => {
          if (!map.current || map.current.hasImage('active-port-custom')) return
          map.current.addImage('active-port-custom', activePortIcon, { pixelRatio: 1 })
        }
        activePortIcon.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          getPortIconSvg('#0094FF', 30)
        )}`
      }

      if (!map.current.hasImage('inactive-port-custom')) {
        const inactivePortIcon = new Image(30, 30)
        inactivePortIcon.onload = () => {
          if (!map.current || map.current.hasImage('inactive-port-custom')) return
          map.current.addImage('inactive-port-custom', inactivePortIcon, { pixelRatio: 1 })
        }
        inactivePortIcon.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          getPortIconSvg('#393C56', 30)
        )}`
      }

      map.current.addLayer({
        id: 'active-port-marker-anchor',
        type: 'symbol',
        source: 'active-port-marker',
        layout: {
          'icon-image': 'active-port-custom',
          'icon-size': 1,
          'icon-anchor': 'center',
          'icon-ignore-placement': true,
          'icon-allow-overlap': true,
        },
        paint: {
          'icon-opacity': 0,
        },
      })

      map.current.addLayer({
        id: 'inactive-port-marker-anchor',
        type: 'symbol',
        source: 'inactive-port-marker',
        layout: {
          'icon-image': 'inactive-port-custom',
          'icon-size': 1,
          'icon-anchor': 'center',
          'icon-ignore-placement': true,
          'icon-allow-overlap': true,
        },
        paint: {
          'icon-opacity': 0,
        },
      })
    }
  }, [mapReady])

  useEffect(() => {
    if (!map.current || !mapReady) return

    if (!portHoverCardEnabled) {
      if (portHoverPopupRef.current) {
        portHoverPopupRef.current.remove()
        portHoverPopupRef.current = null
      }
      return
    }

    const interactiveHoverLayers = [
      'port-fill',
      'port-outline',
      'terminal-fill',
      'terminal-outline',
      'berth-fill',
      'berth-outline',
      'inactive-port-fill',
      'inactive-port-outline',
      'inactive-port-inner-outline',
    ]

    const closeHoverCard = () => {
      if (!portHoverPopupRef.current) return
      portHoverPopupRef.current.remove()
      portHoverPopupRef.current = null
    }

    const renderHoverCardHtml = (feature) => {
      const type = feature?.properties?.type
      const info = HOVER_CARD_BY_TYPE[type] || HOVER_CARD_BY_TYPE.port
      const products = info.products.slice(0, 2).join(', ')
      const productsMore = Math.max(0, info.products.length - 2)
      const handles = info.handles.slice(0, 2).join(', ')
      const handlesMore = Math.max(0, info.handles.length - 2)
      const entityLabel =
        feature?.properties?.name || feature?.properties?.id || type || 'Area'

      return `
        <div class="port-hover-card-shell" style="
          position:relative;
          overflow:visible;
          background:#181926;
          border:1px solid #393C56;
          border-radius:6px;
          color:#FFFFFF;
          min-width:240px;
          max-width:280px;
          padding:10px 12px;
          font-family:Inter,sans-serif;
          box-shadow:0 10px 24px rgba(0,0,0,0.35);
        ">
          <div style="font-size:12px;font-weight:600;line-height:1.2;margin-bottom:4px;">${info.title}</div>
          <div style="font-size:11px;color:#A8B0C2;line-height:1.2;margin-bottom:8px;">${entityLabel}</div>
          <div style="display:flex;gap:12px;margin-bottom:8px;">
            <div style="font-size:11px;color:#A8B0C2;">Ships</div>
            <div style="font-size:11px;color:#FFFFFF;font-weight:600;">${info.ships}</div>
            <div style="font-size:11px;color:#A8B0C2;">Cargo Types</div>
            <div style="font-size:11px;color:#FFFFFF;font-weight:600;">${info.cargoTypes}</div>
          </div>
          <div style="font-size:11px;color:#A8B0C2;line-height:1.4;">
            Products: <span style="color:#FFFFFF">${products}${productsMore > 0 ? ` +${productsMore}` : ''}</span>
          </div>
          <div style="font-size:11px;color:#A8B0C2;line-height:1.4;">
            Handles: <span style="color:#FFFFFF">${handles}${handlesMore > 0 ? ` +${handlesMore}` : ''}</span>
          </div>
        </div>
      `
    }

    const handleHoverMove = (event) => {
      // Prevent hover cards from showing during fly-in while shapes are still
      // transitioning into view.
      if (portAnimatingRef.current) {
        closeHoverCard()
        return
      }
      const feature = event?.features?.[0]
      if (!feature) return
      const lngLat = event.lngLat
      if (!lngLat) return

      const html = renderHoverCardHtml(feature)
      if (!portHoverPopupRef.current) {
        portHoverPopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'bottom',
          offset: [0, -18],
          className: 'port-hover-card-popup',
        })
      }

      portHoverPopupRef.current
        .setLngLat(lngLat)
        .setHTML(html)
        .addTo(map.current)
    }

    interactiveHoverLayers.forEach((layerId) => {
      if (!map.current.getLayer(layerId)) return
      map.current.on('mousemove', layerId, handleHoverMove)
      map.current.on('mouseleave', layerId, closeHoverCard)
    })

    return () => {
      if (!map.current) return
      interactiveHoverLayers.forEach((layerId) => {
        if (!map.current.getLayer(layerId)) return
        map.current.off('mousemove', layerId, handleHoverMove)
        map.current.off('mouseleave', layerId, closeHoverCard)
      })
      closeHoverCard()
    }
  }, [mapReady, portHoverCardEnabled])

  useEffect(() => {
    if (!map.current || !mapReady) return

    const handleInactivePortMarkerClick = (event) => {
      const feature = event?.features?.[0]
      const portId = feature?.properties?.portId
      if (!portId) return
      const port = PROTOTYPE_PORTS.find((item) => item.id === portId)
      if (!port) return
      onPortClickRef.current?.(port)
    }

    const setInactivePortCursorPointer = () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = 'pointer'
    }

    const clearInactivePortCursor = () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = ''
    }

    map.current.on('click', 'inactive-port-marker-anchor', handleInactivePortMarkerClick)
    map.current.on('mouseenter', 'inactive-port-marker-anchor', setInactivePortCursorPointer)
    map.current.on('mouseleave', 'inactive-port-marker-anchor', clearInactivePortCursor)

    return () => {
      if (!map.current) return
      map.current.off('click', 'inactive-port-marker-anchor', handleInactivePortMarkerClick)
      map.current.off('mouseenter', 'inactive-port-marker-anchor', setInactivePortCursorPointer)
      map.current.off('mouseleave', 'inactive-port-marker-anchor', clearInactivePortCursor)
    }
  }, [mapReady])

  useEffect(() => {
    if (!map.current || !mapReady) return

    const interactiveLayers = [
      'port-fill',
      'port-outline',
      'terminal-fill',
      'terminal-outline',
      'berth-fill',
      'berth-outline',
    ]

    const setPointerCursor = () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = 'pointer'
    }

    const clearCursor = () => {
      if (!map.current) return
      map.current.getCanvas().style.cursor = ''
    }

    const handlePortLayerClick = (event) => {
      const activeTab = shipTabs.find((tab) => tab.id === activeShipTab)
      if (activeTab?.type !== 'port') return

      const feature = event?.features?.[0]
      const featureType = feature?.properties?.type
      const featureId = feature?.properties?.id || null

      if (featureType === 'berth') {
        setActivePortLevel('Berth Details')
        setSelectedBerth(featureId)
        setSelectedTerminal(null)
        return
      }

      if (featureType === 'terminal') {
        setActivePortLevel('Terminal Details')
        setSelectedTerminal(featureId)
        setSelectedBerth(null)
        return
      }

      setActivePortLevel('Port Details')
      setSelectedTerminal(null)
      setSelectedBerth(null)
    }

    interactiveLayers.forEach((layerId) => {
      if (!map.current.getLayer(layerId)) return
      map.current.on('click', layerId, handlePortLayerClick)
      map.current.on('mouseenter', layerId, setPointerCursor)
      map.current.on('mouseleave', layerId, clearCursor)
    })

    return () => {
      if (!map.current) return
      interactiveLayers.forEach((layerId) => {
        if (!map.current.getLayer(layerId)) return
        map.current.off('click', layerId, handlePortLayerClick)
        map.current.off('mouseenter', layerId, setPointerCursor)
        map.current.off('mouseleave', layerId, clearCursor)
      })
    }
  }, [
    mapReady,
    shipTabs,
    activeShipTab,
    setActivePortLevel,
    setSelectedTerminal,
    setSelectedBerth,
  ])

  useEffect(() => {
    if (!map.current || !mapReady) return

    const activeTab = shipTabs.find((t) => t.id === activeShipTab)
    const isPortTabActive = activeTab?.type === 'port'
    const openPortTabs = shipTabs.filter((t) => t?.type === 'port')
    const inactiveOpenPortTabs = openPortTabs.filter((t) => t.id !== activeShipTab)
    const shouldShowSelectedPortContext =
      showPorts || (portVisibilityBehavior === 'selected-context' && !forceHideSelectedPortContext)
    const shouldShowActivePortMarker = isPortTabActive && showPorts

    const setActivePortMarkerVisibility = (visible) => {
      if (!map.current.getLayer('active-port-marker-anchor')) {
        return
      }
      const iconOpacity = visible ? 1 : 0
      map.current.setPaintProperty('active-port-marker-anchor', 'icon-opacity', iconOpacity)
    }

    const setInactivePortVisibility = (visible) => {
      if (
        !map.current.getLayer('inactive-port-fill') ||
        !map.current.getLayer('inactive-port-outline') ||
        !map.current.getLayer('inactive-port-inner-outline') ||
        !map.current.getLayer('inactive-port-marker-anchor')
      ) {
        return
      }
      map.current.setPaintProperty('inactive-port-fill', 'fill-opacity', visible ? 0.14 : 0)
      map.current.setPaintProperty('inactive-port-outline', 'line-opacity', visible ? 1 : 0)
      map.current.setPaintProperty('inactive-port-inner-outline', 'line-opacity', visible ? 1 : 0)
      map.current.setPaintProperty('inactive-port-marker-anchor', 'icon-opacity', visible ? 1 : 0)
    }

    const translatePortFeatures = (port) => {
      const baseCenterLng = BASE_PORT_BOUNDARY_CENTER?.[0] ?? 103.78
      const baseCenterLat = BASE_PORT_BOUNDARY_CENTER?.[1] ?? 1.25
      const lngOffset = port.lng - baseCenterLng
      const latOffset = port.lat - baseCenterLat

      return {
        ...mockPortFeatures,
        features: mockPortFeatures.features.map((feature) => ({
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map((ring) =>
              ring.map((coord) => [coord[0] + lngOffset, coord[1] + latOffset])
            ),
          },
        })),
      }
    }

    if (isPortTabActive) {
      const port = PROTOTYPE_PORTS.find(p => p.id === activeTab.id)
      if (port) {
        const translatedFeatures = translatePortFeatures(port)

        const source = map.current.getSource('port-features')
        if (source) {
          source.setData(translatedFeatures)
        }

        const inactiveSource = map.current.getSource('inactive-port-features')
        if (inactiveSource) {
          const inactiveMarkerSource = map.current.getSource('inactive-port-marker')
          const inactiveFeatures = inactiveOpenPortTabs.flatMap((tab) => {
            const inactivePort = PROTOTYPE_PORTS.find((p) => p.id === tab.id)
            if (!inactivePort) return []
            const translatedInactive = translatePortFeatures(inactivePort)
            return translatedInactive.features
              .map((feature) => ({
                ...feature,
                properties: {
                  ...feature.properties,
                  portId: inactivePort.id,
                },
              }))
          })
          const inactiveMarkerFeatures = inactiveOpenPortTabs
            .map((tab) => {
              const inactivePort = PROTOTYPE_PORTS.find((p) => p.id === tab.id)
              if (!inactivePort) return null
              const translatedInactive = translatePortFeatures(inactivePort)
              const inactivePortFeature = translatedInactive.features.find(
                (feature) => feature?.properties?.type === 'port'
              )
              const center = getPolygonCenter(inactivePortFeature)
              if (!center) return null
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: center,
                },
                properties: {
                  portId: inactivePort.id,
                },
              }
            })
            .filter(Boolean)

          inactiveSource.setData({
            type: 'FeatureCollection',
            features: inactiveFeatures,
          })
          if (inactiveMarkerSource) {
            inactiveMarkerSource.setData({
              type: 'FeatureCollection',
              features: inactiveMarkerFeatures,
            })
          }
          setInactivePortVisibility(showPorts && inactiveFeatures.length > 0)
        }

        const selectedPortFeature = translatedFeatures.features.find(
          (feature) => feature?.properties?.type === 'port'
        )
        const selectedPortCenter = getPolygonCenter(selectedPortFeature)
        activePortCenterRef.current = selectedPortCenter || null
        const selectedMarker = portMarkersRef.current[port.id]
        if (selectedMarker && selectedPortCenter) {
          selectedMarker.setLngLat(selectedPortCenter)
        }
        const activePortMarkerSource = map.current.getSource('active-port-marker')
        if (activePortMarkerSource) {
          activePortMarkerSource.setData(
            selectedPortCenter
              ? {
                  type: 'FeatureCollection',
                  features: [
                    {
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: selectedPortCenter,
                      },
                      properties: {},
                    },
                  ],
                }
              : EMPTY_FEATURE_COLLECTION
          )
        }
        setActivePortMarkerVisibility(shouldShowActivePortMarker && Boolean(selectedPortCenter))

        const focusKey = `${port.id}:${Math.round(leftPanelInset)}:${Math.round(mapDimensions.width)}`

        if (lastFocusedPortViewportKeyRef.current !== focusKey) {
          const allPortCoords = translatedFeatures.features
            .filter((feature) => feature?.geometry?.type === 'Polygon')
            .flatMap((feature) =>
              (feature.geometry.coordinates || []).flatMap((ring) => ring || [])
            )
            .filter(
              (coord) =>
                Array.isArray(coord) &&
                coord.length >= 2 &&
                Number.isFinite(coord[0]) &&
                Number.isFinite(coord[1])
            )

          if (allPortCoords.length > 1) {
            const bounds = allPortCoords.reduce(
              (acc, coord) => acc.extend(coord),
              new mapboxgl.LngLatBounds(allPortCoords[0], allPortCoords[0])
            )

            const applyPortShapeOpacities = () => {
              if (!map.current) return
              portShapeExplicitlyShownRef.current = true
              map.current.setPaintProperty('port-fill', 'fill-opacity', 0.2)
              map.current.setPaintProperty('port-outline', 'line-opacity', 1)
              map.current.setPaintProperty('port-outline', 'line-color', '#0094FF')
              map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
              map.current.setPaintProperty('terminal-outline', 'line-opacity', 0.5)
              map.current.setPaintProperty('terminal-outline', 'line-color', '#FFFFFF')
              map.current.setPaintProperty('terminal-outline', 'line-dasharray', [2, 2])
              map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
              map.current.setPaintProperty('berth-outline', 'line-opacity', 0.5)
              map.current.setPaintProperty('berth-outline', 'line-color', '#FFFFFF')
            }

            if (portVisibilityBehavior === 'strict-layer-toggle') {
              // In strict mode: show shapes immediately, no hide/fade sequence.
              applyPortShapeOpacities()
              portAnimatingRef.current = false
            } else {
              // In selected-context mode: hide shapes during zoom, fade in on moveend.
              portAnimatingRef.current = true
              map.current.setPaintProperty('port-fill', 'fill-opacity', 0)
              map.current.setPaintProperty('port-outline', 'line-opacity', 0)
              map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
              map.current.setPaintProperty('terminal-outline', 'line-opacity', 0)
              map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
              map.current.setPaintProperty('berth-outline', 'line-opacity', 0)
              map.current.setPaintProperty('port-labels', 'text-opacity', 0)

              map.current.once('moveend', () => {
                portAnimatingRef.current = false
                if (!map.current) return
                const fade = { duration: 500, delay: 0 }
                map.current.setPaintProperty('port-fill', 'fill-opacity-transition', fade)
                map.current.setPaintProperty('port-outline', 'line-opacity-transition', fade)
                map.current.setPaintProperty('terminal-outline', 'line-opacity-transition', fade)
                applyPortShapeOpacities()
              })
            }

            map.current.fitBounds(bounds, {
              padding: {
                top: 72,
                right: 72,
                bottom: 72,
                left: Math.max(72, leftPanelInset + 40),
              },
              maxZoom: 12.1,
              duration: 1700,
              easing: (t) => 1 - (1 - t) ** 3,
            })

            lastFocusedPortViewportKeyRef.current = focusKey
          }
        }
      }
    }

    if (!isPortTabActive || !shouldShowSelectedPortContext) {
      lastFocusedPortViewportKeyRef.current = ''
      portShapeExplicitlyShownRef.current = false
      activePortCenterRef.current = null
      const activePortMarkerSource = map.current.getSource('active-port-marker')
      if (activePortMarkerSource) {
        activePortMarkerSource.setData(EMPTY_FEATURE_COLLECTION)
      }
      const inactiveSource = map.current.getSource('inactive-port-features')
      const inactiveMarkerSource = map.current.getSource('inactive-port-marker')
      if (inactiveSource) {
        inactiveSource.setData(EMPTY_FEATURE_COLLECTION)
      }
      if (inactiveMarkerSource) {
        inactiveMarkerSource.setData(EMPTY_FEATURE_COLLECTION)
      }
      setInactivePortVisibility(false)
      setActivePortMarkerVisibility(false)
      // Reset all port markers to deselected state
      PROTOTYPE_PORTS.forEach((port) => {
        const marker = portMarkersRef.current[port.id]
        if (!marker) return
        marker.setLngLat([port.lng, port.lat])
        const el = marker.getElement()
        el.dataset.selected = 'false'
        const circle = el.querySelector('circle')
        if (circle) circle.setAttribute('stroke', '#393C56')
      })
      // Hide all port features
      map.current.setPaintProperty('port-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('port-outline', 'line-opacity', 0)
      map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('terminal-outline', 'line-opacity', 0)
      map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('berth-outline', 'line-opacity', 0)
      map.current.setPaintProperty('port-labels', 'text-opacity', 0)
      return
    }

    // Skip opacity updates while the zoom-to-port animation is running —
    // the moveend callback above handles the initial fade-in.
    if (portAnimatingRef.current) return

    // In strict mode, only apply shape opacities if they were explicitly revealed
    // via a port icon click. Prevents re-enabling the checkbox from auto-showing shapes.
    if (portVisibilityBehavior === 'strict-layer-toggle' && !portShapeExplicitlyShownRef.current) return

    // Port Details Active
    if (activePortLevel === 'Port Details') {
      setActivePortMarkerVisibility(shouldShowActivePortMarker)
      map.current.setPaintProperty('port-fill', 'fill-opacity', 0.2)
      map.current.setPaintProperty('port-outline', 'line-opacity', 1)
      map.current.setPaintProperty('port-outline', 'line-color', '#0094FF')
      
      map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('terminal-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('terminal-outline', 'line-color', '#FFFFFF')
      map.current.setPaintProperty('terminal-outline', 'line-dasharray', [2, 2])
      
      map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('berth-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('berth-outline', 'line-color', '#FFFFFF')
    } 
    // Terminal Details Active
    else if (activePortLevel === 'Terminal Details') {
      setActivePortMarkerVisibility(shouldShowActivePortMarker)
      map.current.setPaintProperty('port-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('port-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('port-outline', 'line-color', '#FFFFFF')

      if (selectedTerminal) {
        // Highlight selected terminal
        map.current.setPaintProperty('terminal-fill', 'fill-opacity', [
          'case',
          ['==', ['get', 'id'], selectedTerminal],
          0.2,
          0
        ])
        map.current.setPaintProperty('terminal-outline', 'line-opacity', 1)
        map.current.setPaintProperty('terminal-outline', 'line-color', [
          'case',
          ['==', ['get', 'id'], selectedTerminal],
          '#0094FF',
          '#FFFFFF'
        ])
        map.current.setPaintProperty('terminal-outline', 'line-dasharray', [
          'case',
          ['==', ['get', 'id'], selectedTerminal],
          ['literal', [1]], // solid line
          ['literal', [2, 2]] // dashed line
        ])
        map.current.setPaintProperty('port-labels', 'text-opacity', [
          'case',
          ['==', ['get', 'id'], selectedTerminal],
          1,
          0
        ])
      } else {
        // No terminal selected: highlight all terminals as the active context.
        map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0.16)
        map.current.setPaintProperty('terminal-fill', 'fill-color', '#0094FF')
        map.current.setPaintProperty('terminal-outline', 'line-opacity', 1)
        map.current.setPaintProperty('terminal-outline', 'line-color', '#0094FF')
        map.current.setPaintProperty('terminal-outline', 'line-dasharray', [2, 2])
        map.current.setPaintProperty('port-labels', 'text-opacity', 0)
      }

      map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('berth-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('berth-outline', 'line-color', '#FFFFFF')
    }
    // Berth Details Active
    else if (activePortLevel === 'Berth Details') {
      setActivePortMarkerVisibility(shouldShowActivePortMarker)
      map.current.setPaintProperty('port-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('port-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('port-outline', 'line-color', '#FFFFFF')

      map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('terminal-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('terminal-outline', 'line-color', '#FFFFFF')
      map.current.setPaintProperty('terminal-outline', 'line-dasharray', [2, 2])

      if (selectedBerth) {
        // Highlight selected berth
        map.current.setPaintProperty('berth-fill', 'fill-opacity', [
          'case',
          ['==', ['get', 'id'], selectedBerth],
          1,
          0
        ])
        map.current.setPaintProperty('berth-outline', 'line-opacity', 1)
        map.current.setPaintProperty('berth-outline', 'line-color', [
          'case',
          ['==', ['get', 'id'], selectedBerth],
          '#0094FF',
          '#FFFFFF'
        ])
        map.current.setPaintProperty('port-labels', 'text-opacity', [
          'case',
          ['==', ['get', 'id'], selectedBerth],
          1,
          0
        ])
      } else {
        map.current.setPaintProperty('berth-fill', 'fill-opacity', 0.5)
        map.current.setPaintProperty('berth-fill', 'fill-color', '#0094FF')
        map.current.setPaintProperty('berth-outline', 'line-opacity', 1)
        map.current.setPaintProperty('berth-outline', 'line-color', '#0094FF')
        map.current.setPaintProperty('port-labels', 'text-opacity', 0)
      }
    }
  }, [
    mapReady,
    activeShipTab,
    shipTabs,
    activePortLevel,
    selectedTerminal,
    selectedBerth,
    showPorts,
    portVisibilityBehavior,
    forceHideSelectedPortContext,
    leftPanelInset,
    mapDimensions.width,
  ])

  useEffect(() => {
    if (!map.current || !mapReady) return

    if (!showPorts) {
      Object.values(portMarkersRef.current).forEach((marker) => {
        marker.remove()
      })
      portMarkersRef.current = {}
      return
    }

    const activeTab = shipTabs.find((t) => t.id === activeShipTab)
    const activePortId = activeTab?.type === 'port' ? activeTab.id : null
    const openPortTabIds = new Set(
      shipTabs.filter((t) => t?.type === 'port').map((t) => t.id)
    )
    const inactiveOpenPortTabs =
      activeTab?.type === 'port'
        ? shipTabs.filter((t) => t?.type === 'port' && t.id !== activePortId)
        : []

    const inactivePortCenterById = new globalThis.Map()
    inactiveOpenPortTabs.forEach((tab) => {
      const inactivePort = PROTOTYPE_PORTS.find((p) => p.id === tab.id)
      if (!inactivePort) return
      const baseCenterLng = BASE_PORT_BOUNDARY_CENTER?.[0] ?? 103.78
      const baseCenterLat = BASE_PORT_BOUNDARY_CENTER?.[1] ?? 1.25
      const lngOffset = inactivePort.lng - baseCenterLng
      const latOffset = inactivePort.lat - baseCenterLat
      const translatedPortFeature = mockPortFeatures.features
        .filter((feature) => feature?.properties?.type === 'port')
        .map((feature) => ({
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map((ring) =>
              ring.map((coord) => [coord[0] + lngOffset, coord[1] + latOffset])
            ),
          },
        }))[0]
      const center = getPolygonCenter(translatedPortFeature)
      if (center) {
        inactivePortCenterById.set(inactivePort.id, center)
      }
    })

    PROTOTYPE_PORTS.forEach((port) => {
      const isActivePort = activePortId === port.id
      const inactiveCenter = inactivePortCenterById.get(port.id)
      const targetLngLat =
        isActivePort && activePortCenterRef.current
          ? activePortCenterRef.current
          : inactiveCenter
            ? inactiveCenter
          : [port.lng, port.lat]

      let marker = portMarkersRef.current[port.id]
      if (!marker) {
        const el = document.createElement('div')
        el.setAttribute('aria-label', `${port.name} port`)
        el.style.width = '30px'
        el.style.height = '30px'
        el.style.cursor = 'pointer'
        el.style.pointerEvents = 'auto'
        el.style.position = 'relative'

        // Render the SVG exactly once to prevent any flicker
        el.innerHTML = getPortIconSvg('#393C56', 30)
        const markerIcon = el.querySelector('svg')
        if (markerIcon) {
          markerIcon.style.opacity = '1'
          markerIcon.style.transform = 'scale(1)'
          markerIcon.style.transformOrigin = 'center'
          markerIcon.style.transition = 'opacity 220ms ease, transform 240ms ease'
        }

        // Add tooltip
        const tooltip = document.createElement('div')
        tooltip.dataset.portTooltip = 'true'
        tooltip.innerText = port.name
        tooltip.style.position = 'absolute'
        tooltip.style.left = '36px'
        tooltip.style.top = '50%'
        tooltip.style.transform = 'translateY(-50%)'
        tooltip.style.background = '#000'
        tooltip.style.color = '#fff'
        tooltip.style.padding = '4px 8px'
        tooltip.style.borderRadius = '4px'
        tooltip.style.fontSize = '12px'
        tooltip.style.whiteSpace = 'nowrap'
        tooltip.style.pointerEvents = 'none'
        tooltip.style.opacity = '0'
        tooltip.style.transition = 'opacity 180ms ease, transform 220ms ease'
        tooltip.style.transform = 'translate(0, -50%)'
        tooltip.style.border = '1px solid #393C56'
        el.appendChild(tooltip)

        el.addEventListener('mouseenter', () => {
          tooltip.style.opacity = '1'
        })
        el.addEventListener('mouseleave', () => {
          if (el.dataset.selected !== 'true') {
            tooltip.style.opacity = '0'
          }
        })

        const onClick = (event) => {
          event.preventDefault()
          event.stopPropagation()

          // Already active — do nothing, same as ship/detection behavior
          if (el.dataset.selected === 'true') return

          // Deselect all other port markers
          Object.values(portMarkersRef.current).forEach((m) => {
            const mEl = m.getElement()
            mEl.dataset.selected = 'false'
            const mIcon = mEl.querySelector('svg')
            if (mIcon) {
              mIcon.style.opacity = '1'
              mIcon.style.transform = 'scale(1)'
            }
            const circle = mEl.querySelector('circle')
            if (circle) circle.setAttribute('stroke', '#393C56')
            const t = mEl.querySelector('div')
            if (t) {
              t.style.opacity = '0'
              t.style.transform = 'translate(0, -50%)'
            }
          })

          // Select this port
          el.dataset.selected = 'true'
          const circle = el.querySelector('circle')
          if (circle) circle.setAttribute('stroke', '#0094FF')
          if (onPortClickRef.current) onPortClickRef.current(port)
        }

        el.addEventListener('click', onClick)

        marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(targetLngLat)
          .addTo(map.current)

        portMarkersRef.current[port.id] = marker

        // If this port is already the active tab, restore the active state visually.
        if (activeTab?.type === 'port' && activeTab.id === port.id) {
          el.dataset.selected = 'true'
          const circle = el.querySelector('circle')
          if (circle) circle.setAttribute('stroke', '#0094FF')
        }
      } else {
        marker.setLngLat(targetLngLat)
      }

      const markerTooltip = marker
        .getElement()
        .querySelector('[data-port-tooltip="true"]')
      if (markerTooltip) {
        markerTooltip.style.left = '36px'
      }
      marker.getElement().style.display =
        activeTab?.type === 'port' && openPortTabIds.has(port.id) ? 'none' : ''
    })
  }, [showPorts, mapReady, activeShipTab, shipTabs])

  useEffect(() => {
    if (!map.current || !mapReady) return

    const previewEntries = Array.isArray(alertPreviewAreas) ? alertPreviewAreas : []
    const normalizedPreviewEntries = previewEntries
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return {
            entryId: `legacy-${index}-${entry}`,
            label: entry,
            area: entry,
          }
        }
        return {
          entryId: entry?.id || `entry-${index}`,
          label: entry?.label || entry?.area || 'Area',
          area: entry?.area || '',
        }
      })
      .filter((entry) => Boolean(entry.area))

    const selectedAreaConfigs = normalizedPreviewEntries
      .map((entry) => {
        const key = getAlertPreviewAreaKey(entry.area)
        const config = key ? ALERT_PREVIEW_AREAS[key] : null
        if (!config) return null
        return {
          entryId: entry.entryId,
          areaKey: key,
          displayLabel: entry.label,
          config,
        }
      })
      .filter((item) => Boolean(item.config))
    const sourceId = 'alert-preview-area'
    const fillLayerId = 'alert-preview-area-fill'
    const lineLayerId = 'alert-preview-area-line'

    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.current.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#05B4FF',
          'fill-opacity': 0.2,
        },
      })
      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#00B8FF',
          'line-width': 2,
        },
      })
    }

    const source = map.current.getSource(sourceId)
    if (!source) return

    if (selectedAreaConfigs.length === 0) {
      source.setData({ type: 'FeatureCollection', features: [] })
      Object.values(alertPreviewMarkersRef.current).forEach((marker) => {
        marker.remove()
      })
      alertPreviewMarkersRef.current = {}
      lastPreviewAreaSignatureRef.current = ''
      return
    }

    source.setData({
      type: 'FeatureCollection',
      features: selectedAreaConfigs.map(({ key, config }) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [config.polygon],
        },
        properties: {
          key,
          name: config.label,
        },
      })),
    })

    const nextMarkerIds = new Set(selectedAreaConfigs.map((item) => item.entryId))
    Object.entries(alertPreviewMarkersRef.current).forEach(([key, marker]) => {
      if (nextMarkerIds.has(key)) return
      marker.remove()
      delete alertPreviewMarkersRef.current[key]
    })

    selectedAreaConfigs.forEach(({ entryId, displayLabel, config }) => {
      if (alertPreviewMarkersRef.current[entryId]) return
      const popupElement = document.createElement('div')
      popupElement.style.background = '#24263C'
      popupElement.style.border = '1px solid #393C56'
      popupElement.style.borderRadius = '8px'
      popupElement.style.padding = '10px 12px'
      popupElement.style.minWidth = '195px'
      popupElement.style.color = '#FFFFFF'
      popupElement.style.boxShadow = '0 10px 24px rgba(0,0,0,0.35)'
      popupElement.style.fontFamily = 'inherit'
      popupElement.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <span style="font-size:14px;font-weight:600;line-height:1;">${displayLabel}</span>
          <span style="display:flex;align-items:center;gap:10px;color:#D5DBEA;font-size:14px;">
            <span style="cursor:pointer;">•••</span>
            <span style="cursor:pointer;">🗑</span>
          </span>
        </div>
        <div style="font-size:11px;color:#A8B0C2;display:flex;gap:12px;">
          <span>Length: ${config.length}</span>
          <span>Area: ${config.area}</span>
        </div>
      `
      const marker = new mapboxgl.Marker({
        element: popupElement,
        anchor: 'bottom-left',
      })
        .setLngLat(config.center)
        .addTo(map.current)
      marker.getElement().classList.add('alert-preview-marker')
      alertPreviewMarkersRef.current[entryId] = marker
    })

    // Move map to selected AOI once when the selected area changes.
    const previewSignature = selectedAreaConfigs
      .map((item) => `${item.entryId}:${item.areaKey}`)
      .join('|')
    if (lastPreviewAreaSignatureRef.current !== previewSignature) {
      const allCoordinates = selectedAreaConfigs.flatMap(
        ({ config }) => config.polygon
      )
      const bounds = allCoordinates.reduce(
        (acc, coordinate) => acc.extend(coordinate),
        new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0])
      )
      map.current.fitBounds(bounds, {
        padding: { top: 120, right: 220, bottom: 100, left: 160 },
        maxZoom: 6.8,
        duration: 1200,
      })
      lastPreviewAreaSignatureRef.current = previewSignature
    }
  }, [mapReady, alertPreviewAreas])

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
        el.addEventListener('click', (event) => {
          const markerEl = event.currentTarget
          const detectionId = markerEl?.dataset?.detectionId
          const latestDetection = detectionId
            ? detectionByIdRef.current.get(String(detectionId))
            : detection
          if (!latestDetection) return
          Object.values(markersRef.current).forEach((m) => {
            m.getElement().classList.remove('active')
            m.getElement().classList.remove('previewed')
          })
          el.classList.add('active')
          onDetectionClickRef.current?.(latestDetection)
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
      if (
        getDateKey(detection.date) !== mapDate ||
        !enabledDetectionTypes.has(detection.type)
      ) {
        el.style.display = 'none'
      }
    })
  }, [runtimeDetections, mapDate, mapReady, enabledDetectionTypes])

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
    const activeId =
      activeDetectionId == null ? null : String(activeDetectionId)
    const previewId =
      previewDetectionId == null ? null : String(previewDetectionId)
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
    if (import.meta.env.DEV) {
      const focusedMarker = markersRef.current[String(focusDetectionId)]
      const markerType = focusedMarker?.getElement()?.dataset?.detectionType
      if (markerType && markerType !== focusDet.type) {
        console.warn(
          '[selection-sync] marker type mismatch for focused detection',
          {
            focusDetectionId: String(focusDetectionId),
            markerType,
            detectionType: focusDet.type,
          }
        )
      }
    }
    map.current.flyTo({
      center: [focusDet.lng, focusDet.lat],
      zoom: 6,
      duration: 1500,
      offset: [panelAwareFocusOffsetX, 0],
    })
  }, [
    panelFocusDetectionId,
    activeDetectionId,
    previewDetectionId,
    runtimeDetections,
    panelAwareFocusOffsetX,
  ])

  // Filter markers by date, but keep selected/preview detection visible
  useEffect(() => {
    if (!map.current) return

    const panelFocusId =
      panelFocusDetectionId == null ? null : String(panelFocusDetectionId)
    const activeId =
      activeDetectionId == null ? null : String(activeDetectionId)
    const previewId =
      previewDetectionId == null ? null : String(previewDetectionId)
    const primaryFocusId = panelFocusId || activeId

    runtimeDetections.forEach((det) => {
      const marker = markersRef.current[det.id]
      if (!marker) return
      const el = marker.getElement()
      const isSelected =
        primaryFocusId != null && String(det.id) === String(primaryFocusId)
      const isPreviewed = previewId != null && String(det.id) === previewId
      const isCurrentDate = getDateKey(det.date) === mapDate
      const isTypeEnabled = enabledDetectionTypes.has(det.type)
      el.dataset.historical = isCurrentDate ? 'false' : 'true'
      el.style.display =
        (isCurrentDate && isTypeEnabled) || isSelected || isPreviewed
          ? ''
          : 'none'
    })
  }, [
    mapDate,
    enabledDetectionTypes,
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
          const defaultPosition = getDefaultPopupPosition(
            layout,
            mapDimensions.width
          )
          next[toolId] = {
            x: defaultPosition.x,
            y: defaultPosition.y,
          }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [activeShipTab, openToolPanels, mapDimensions.width])

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
            const defaultPosition = getDefaultPopupPosition(
              layout,
              mapDimensions.width
            )
            const title = MAP_TOOL_POPUP_TITLES[toolId] || 'Tool'
            const popupZIndex = MAP_TOOL_POPUP_ZINDEX[toolId] || 10

            // Clamp the position so it doesn't go off-screen when the window shrinks
            const rawX = popupPositions[toolId]?.x ?? defaultPosition.x
            const clampedX = Math.max(
              12,
              Math.min(rawX, mapDimensions.width - layout.width - 12)
            )
            const clampedY = popupPositions[toolId]?.y ?? defaultPosition.y

            return (
              <Box
                key={toolId}
                style={{
                  position: 'absolute',
                  top: clampedY,
                  left: clampedX,
                  width: layout.width,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#181926',
                  border: '1px solid #393C56',
                  pointerEvents: 'auto',
                  zIndex: popupZIndex,
                  isolation: 'isolate',
                }}
              >
                <Box
                  style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#24263C',
                    cursor: dragState?.toolId === toolId ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={(event) => {
                    if (event.button !== 0) return
                    setDragState({
                      toolId,
                      offsetX: event.clientX - clampedX,
                      offsetY: event.clientY - clampedY,
                    })
                  }}
                >
                  <Text
                    style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 500 }}
                  >
                    {title}
                  </Text>
                  <Box
                    style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <Minus
                      onMouseDown={(event) => event.stopPropagation()}
                      style={{
                        width: 20,
                        height: 20,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        marginTop: 10,
                      }}
                    />
                    <XClose
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={() => closeMapToolPanel(toolId)}
                      style={{
                        width: 20,
                        height: 20,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    />
                  </Box>
                </Box>
                {toolId === 'extended-path' && (
                  <ExtendedPathPanel
                    ship={shipTabs.find((t) => t.id === activeShipTab)}
                  />
                )}
                {toolId === 'future-path-prediction' && (
                  <FuturePathPanel
                    ship={shipTabs.find((t) => t.id === activeShipTab)}
                  />
                )}
                {toolId === 'estimated-location' && <EstimatedLocationPanel />}
              </Box>
            )
          })}
      </Box>
    </>
  )
})

export default Map
