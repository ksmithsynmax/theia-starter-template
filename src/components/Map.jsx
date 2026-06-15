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

const normalizePortToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const resolvePrototypePortFromTab = (tab) => {
  if (!tab || tab.type !== 'port') return null
  const rawId = String(tab.id || '').trim()
  const byId = PROTOTYPE_PORTS.find((port) => port.id === rawId)
  if (byId) return byId
  const nameToken = normalizePortToken(tab.name)
  if (!nameToken) return null
  return PROTOTYPE_PORTS.find((port) => normalizePortToken(port.name) === nameToken) || null
}

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

// Build a closed-ring Polygon feature from a stored shape's coordinates.
const shapeToPolygonFeature = (shape, kind) => {
  const coords = Array.isArray(shape?.coordinates) ? shape.coordinates : []
  if (coords.length < 3) return null
  const ring = [...coords]
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
    ring.push(first)
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [ring] },
    properties: {
      kind,
      id: shape?.id || 'shape',
      name: shape?.name || '',
    },
  }
}
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

// Ship Handles / Cargo Handles mirror the data shown in the port detail panel
// tabs (Myships.jsx) so the hover card stays consistent with the panel. The
// panel content is static across port/terminal/berth, so all three share it.
const PANEL_SHIP_HANDLES = [
  'Container',
  'Bulk Carrier',
  'Gas Carrier',
  'Passenger',
  'Tanker',
]
const PANEL_CARGO_HANDLES = [
  'Chemicals',
  'Black Products',
  'Bulk Other',
  'Passenger',
  'Tanker',
]

const HOVER_CARD_BY_TYPE_V2 = {
  port: {
    title: 'Port Summary',
    ships: 24,
    cargoTypes: PANEL_CARGO_HANDLES.length,
    products: PANEL_CARGO_HANDLES,
    handles: PANEL_SHIP_HANDLES,
  },
  terminal: {
    title: 'Terminal Summary',
    ships: 9,
    cargoTypes: PANEL_CARGO_HANDLES.length,
    products: PANEL_CARGO_HANDLES,
    handles: PANEL_SHIP_HANDLES,
  },
  berth: {
    title: 'Berth Summary',
    ships: 3,
    cargoTypes: PANEL_CARGO_HANDLES.length,
    products: PANEL_CARGO_HANDLES,
    handles: PANEL_SHIP_HANDLES,
  },
}

const Map = forwardRef(function Map(
  {
    onDetectionClick,
    onPortClick,
    showPorts = false,
    leftPanelInset = 0,
    portVisibilityBehavior = 'strict-layer-toggle',
    forceHideSelectedPortContext = false,
    portHoverCardEnabled = true,
    forYouActive = false,
    forYouMarkerMode = 'pin',
    forYouRingConfig = {
      color: '#F75349',
      lineStyle: 'solid',
      fill: true,
      fillOpacity: 0.2,
      borderWidth: 2,
      size: 36,
    },
    forYouMarkersVisible = true,
    forYouVisibleIds = null,
    forYouFocus = null,
    onForYouItemClick,
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
    shapeDrawMode,
    pendingShape,
    bookmarkedShapes,
    visibleShapeIds,
    completeShapeDraw,
    cancelShapeDraw,
    hideShape,
    closeShipTab,
    forYouItems,
  } = useShipContext()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({})
  const portMarkersRef = useRef({})
  const onDetectionClickRef = useRef(onDetectionClick)
  const onPortClickRef = useRef(onPortClick)
  const closeShipTabRef = useRef(closeShipTab)
  const activeShipTabRef = useRef(activeShipTab)
  const alertPreviewMarkersRef = useRef({})
  const detectionByIdRef = useRef(new globalThis.Map())
  const lastPreviewAreaSignatureRef = useRef('')
  const lastFocusedPortViewportKeyRef = useRef('')
  const portAnimatingRef = useRef(false)
  const portShapeExplicitlyShownRef = useRef(false)
  const activePortCenterRef = useRef(null)
  const portHoverPopupRef = useRef(null)
  const shapeMarkersRef = useRef({})
  const lastVisibleShapeIdsRef = useRef([])
  const forYouMarkersRef = useRef({})
  const forYouFocusNonceRef = useRef(null)
  const onForYouItemClickRef = useRef(onForYouItemClick)
  const forYouFittedRef = useRef(false)
  onForYouItemClickRef.current = onForYouItemClick
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
  closeShipTabRef.current = closeShipTab
  activeShipTabRef.current = activeShipTab
  const openToolPanels = openMapToolPanelsByTab['__global__'] || []
  const isStrictLayerMode =
    portVisibilityBehavior === 'strict-layer-toggle' ||
    portVisibilityBehavior === 'strict-layer-toggle-v2' ||
    portVisibilityBehavior === 'strict-layer-toggle-v3'
  const panelAwareFocusPadding = useMemo(() => {
    const viewportWidth = mapDimensions.width || 0
    if (viewportWidth <= 0) {
      return { top: 80, right: 120, bottom: 80, left: 48 }
    }

    const inset = Math.max(0, Number(leftPanelInset) || 0)
    const rightPadding = Math.max(110, Math.min(220, viewportWidth * 0.14))
    const desiredLeftPadding = inset > 0 ? inset + 52 : 52
    const maxSafeLeftPadding = Math.max(52, viewportWidth - rightPadding - 220)
    const leftPadding = Math.min(desiredLeftPadding, maxSafeLeftPadding)

    return {
      top: 80,
      right: rightPadding,
      bottom: 80,
      left: leftPadding,
    }
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
      Object.values(shapeMarkersRef.current).forEach((marker) => {
        marker.remove()
      })
      shapeMarkersRef.current = {}
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
        promoteId: 'id',
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

      // Hover highlight: brightens the outline of whichever port/terminal/berth
      // polygon is currently hovered (driven by feature-state).
      map.current.addLayer({
        id: 'port-features-hover-outline',
        type: 'line',
        source: 'port-features',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2.5,
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0,
          ],
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
          getPortIconSvg('#FFFFFF', 30)
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

    if (!portHoverCardEnabled || !showPorts) {
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

    const useV3HoverCardInteractive = portVisibilityBehavior === 'strict-layer-toggle-v3'
    const useV2HoverCardDensity =
      portVisibilityBehavior === 'strict-layer-toggle-v2' || useV3HoverCardInteractive

    const renderHoverCardHtml = (feature) => {
      const type = feature?.properties?.type
      const hoverCardDataSet = useV2HoverCardDensity ? HOVER_CARD_BY_TYPE_V2 : HOVER_CARD_BY_TYPE
      const info = hoverCardDataSet[type] || hoverCardDataSet.port
      const products = useV2HoverCardDensity
        ? info.products.join(', ')
        : info.products.slice(0, 2).join(', ')
      const productsMore = useV2HoverCardDensity
        ? 0
        : Math.max(0, info.products.length - 2)
      const handles = useV2HoverCardDensity
        ? info.handles.join(', ')
        : info.handles.slice(0, 2).join(', ')
      const handlesMore = useV2HoverCardDensity
        ? 0
        : Math.max(0, info.handles.length - 2)
      const entityLabel =
        feature?.properties?.name || feature?.properties?.id || type || 'Area'

      // Cap products/handles at three lines each so the card can show more
      // detail without growing unbounded. The v3 interactive card uses its own
      // scroll region, so skip the clamp there.
      const clampStyle = useV3HoverCardInteractive
        ? ''
        : 'display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;'

      const detailsHtml = `
        <div style="font-size:11px;color:#A8B0C2;line-height:1.4;${clampStyle}">
          <span style="font-weight:600;">Ship Handles:</span> <span style="color:#FFFFFF">${handles}${handlesMore > 0 ? ` +${handlesMore}` : ''}</span>
        </div>
        <div style="font-size:11px;color:#A8B0C2;line-height:1.4;${useV2HoverCardDensity ? 'margin-top:6px;' : ''}${clampStyle}">
          <span style="font-weight:600;">Cargo Handles:</span> <span style="color:#FFFFFF">${products}${productsMore > 0 ? ` +${productsMore}` : ''}</span>
        </div>
      `

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
          <div style="display:flex;gap:16px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="font-size:11px;color:#A8B0C2;">Ships</div>
              <div style="font-size:11px;color:#FFFFFF;font-weight:600;">${info.ships}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="font-size:11px;color:#A8B0C2;">Cargo Types</div>
              <div style="font-size:11px;color:#FFFFFF;font-weight:600;">${info.cargoTypes}</div>
            </div>
          </div>
          ${
            useV3HoverCardInteractive
              ? `<div class="port-hover-card-scroll-region" style="max-height:110px;overflow-y:scroll;overflow-x:hidden;">${detailsHtml}</div>`
              : detailsHtml
          }
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
          anchor: 'top',
          offset: [0, 18],
          className: useV3HoverCardInteractive
            ? 'port-hover-card-popup port-hover-card-popup--interactive'
            : 'port-hover-card-popup',
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
      if (!useV3HoverCardInteractive) {
        map.current.on('mouseleave', layerId, closeHoverCard)
      }
    })

    if (useV3HoverCardInteractive) {
      map.current.on('click', closeHoverCard)
    }

    return () => {
      if (!map.current) return
      interactiveHoverLayers.forEach((layerId) => {
        if (!map.current.getLayer(layerId)) return
        map.current.off('mousemove', layerId, handleHoverMove)
        if (!useV3HoverCardInteractive) {
          map.current.off('mouseleave', layerId, closeHoverCard)
        }
      })
      if (useV3HoverCardInteractive) {
        map.current.off('click', closeHoverCard)
      }
      closeHoverCard()
    }
  }, [mapReady, portHoverCardEnabled, showPorts, portVisibilityBehavior])

  // Highlight the outline of the port/terminal/berth polygon under the cursor.
  // Independent of the hover card so the cue shows even if the card is off.
  useEffect(() => {
    if (!map.current || !mapReady || !showPorts) return
    const m = map.current
    const hoverLayers = ['port-fill', 'terminal-fill', 'berth-fill']
    let hoveredId = null

    const setHover = (nextId) => {
      if (hoveredId === nextId) return
      if (hoveredId !== null) {
        m.setFeatureState(
          { source: 'port-features', id: hoveredId },
          { hover: false }
        )
      }
      hoveredId = nextId
      if (hoveredId !== null) {
        m.setFeatureState(
          { source: 'port-features', id: hoveredId },
          { hover: true }
        )
      }
    }

    const handleMove = (event) => {
      const feature = event?.features?.[0]
      const featureId = feature?.id ?? feature?.properties?.id
      if (featureId == null) return
      setHover(featureId)
    }

    const handleLeave = () => setHover(null)

    hoverLayers.forEach((layerId) => {
      if (!m.getLayer(layerId)) return
      m.on('mousemove', layerId, handleMove)
      m.on('mouseleave', layerId, handleLeave)
    })

    return () => {
      if (!m) return
      hoverLayers.forEach((layerId) => {
        if (!m.getLayer(layerId)) return
        m.off('mousemove', layerId, handleMove)
        m.off('mouseleave', layerId, handleLeave)
      })
      if (hoveredId !== null) {
        m.setFeatureState(
          { source: 'port-features', id: hoveredId },
          { hover: false }
        )
      }
    }
  }, [mapReady, showPorts])

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

    // Re-clicking the active (open) port's anchor toggles it closed,
    // removing its polygon and everything inside it.
    const handleActivePortMarkerClick = (event) => {
      if (event?.originalEvent) event.originalEvent.stopPropagation()
      const activeId = activeShipTabRef.current
      if (!activeId) return
      closeShipTabRef.current?.(activeId)
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
    map.current.on('click', 'active-port-marker-anchor', handleActivePortMarkerClick)
    map.current.on('mouseenter', 'active-port-marker-anchor', setInactivePortCursorPointer)
    map.current.on('mouseleave', 'active-port-marker-anchor', clearInactivePortCursor)

    return () => {
      if (!map.current) return
      map.current.off('click', 'inactive-port-marker-anchor', handleInactivePortMarkerClick)
      map.current.off('mouseenter', 'inactive-port-marker-anchor', setInactivePortCursorPointer)
      map.current.off('mouseleave', 'inactive-port-marker-anchor', clearInactivePortCursor)
      map.current.off('click', 'active-port-marker-anchor', handleActivePortMarkerClick)
      map.current.off('mouseenter', 'active-port-marker-anchor', setInactivePortCursorPointer)
      map.current.off('mouseleave', 'active-port-marker-anchor', clearInactivePortCursor)
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
    const shouldShowSelectedPortContext = showPorts
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
      const port = resolvePrototypePortFromTab(activeTab)
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
            const inactivePort = resolvePrototypePortFromTab(tab)
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
              const inactivePort = resolvePrototypePortFromTab(tab)
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
              map.current.setPaintProperty('terminal-outline', 'line-opacity', 1)
              map.current.setPaintProperty('terminal-outline', 'line-color', '#FFFFFF')
              map.current.setPaintProperty('terminal-outline', 'line-dasharray', [2, 2])
              map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
              map.current.setPaintProperty('berth-outline', 'line-opacity', 1)
              map.current.setPaintProperty('berth-outline', 'line-color', '#FFFFFF')
            }

            if (isStrictLayerMode) {
              // In strict mode: show shapes immediately, no hide/fade sequence.
              applyPortShapeOpacities()
              portAnimatingRef.current = false
            } else {
              // Non-strict fallback: hide shapes during zoom, fade in on moveend.
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
      // Clear the active port geometry so hover queries can no longer hit it.
      // Without this the (invisible) polygon still triggers hover outlines and
      // the hover card after the port is closed.
      const portFeaturesSource = map.current.getSource('port-features')
      if (portFeaturesSource) {
        portFeaturesSource.setData(EMPTY_FEATURE_COLLECTION)
      }
      if (portHoverPopupRef.current) {
        portHoverPopupRef.current.remove()
        portHoverPopupRef.current = null
      }
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
    if (isStrictLayerMode && !portShapeExplicitlyShownRef.current) return

    // Port Details Active
    if (activePortLevel === 'Port Details') {
      setActivePortMarkerVisibility(shouldShowActivePortMarker)
      map.current.setPaintProperty('port-fill', 'fill-opacity', 0.2)
      map.current.setPaintProperty('port-outline', 'line-opacity', 1)
      map.current.setPaintProperty('port-outline', 'line-color', '#0094FF')
      
      map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('terminal-outline', 'line-opacity', 1)
      map.current.setPaintProperty('terminal-outline', 'line-color', '#FFFFFF')
      map.current.setPaintProperty('terminal-outline', 'line-dasharray', [2, 2])
      
      map.current.setPaintProperty('berth-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('berth-outline', 'line-opacity', 1)
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
      map.current.setPaintProperty('berth-outline', 'line-opacity', 1)
      map.current.setPaintProperty('berth-outline', 'line-color', '#FFFFFF')
    }
    // Berth Details Active
    else if (activePortLevel === 'Berth Details') {
      setActivePortMarkerVisibility(shouldShowActivePortMarker)
      map.current.setPaintProperty('port-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('port-outline', 'line-opacity', 0.5)
      map.current.setPaintProperty('port-outline', 'line-color', '#FFFFFF')

      map.current.setPaintProperty('terminal-fill', 'fill-opacity', 0)
      map.current.setPaintProperty('terminal-outline', 'line-opacity', 1)
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
    const activePrototypePort = resolvePrototypePortFromTab(activeTab)
    const activePortId = activePrototypePort?.id || null
    const openPortTabIds = new Set(
      shipTabs
        .filter((t) => t?.type === 'port')
        .map((tab) => resolvePrototypePortFromTab(tab)?.id)
        .filter(Boolean)
    )
    const inactiveOpenPortTabs =
      activeTab?.type === 'port'
        ? shipTabs.filter((t) => t?.type === 'port' && t.id !== activePortId)
        : []

    const inactivePortCenterById = new globalThis.Map()
    inactiveOpenPortTabs.forEach((tab) => {
      const inactivePort = resolvePrototypePortFromTab(tab)
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
          if (circle) circle.setAttribute('stroke', '#FFFFFF')
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
          if (circle) circle.setAttribute('stroke', '#FFFFFF')
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
        // Keep detections above the curated "For You" ring overlay so a solid
        // ring fill never hides the underlying ship detection.
        el.style.zIndex = '1'
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
      padding: panelAwareFocusPadding,
    })
  }, [
    panelFocusDetectionId,
    activeDetectionId,
    previewDetectionId,
    runtimeDetections,
    panelAwareFocusPadding,
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

  // Create the sources/layers used for user-drawn shapes (saved + in-progress draft).
  useEffect(() => {
    if (!map.current || !mapReady) return
    const m = map.current

    if (!m.getSource('user-shapes')) {
      m.addSource('user-shapes', {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      })
      m.addLayer({
        id: 'user-shapes-fill',
        type: 'fill',
        source: 'user-shapes',
        paint: {
          'fill-color': '#006CD7',
          'fill-opacity': 0.18,
        },
      })
      m.addLayer({
        id: 'user-shapes-outline',
        type: 'line',
        source: 'user-shapes',
        paint: {
          'line-color': '#006CD7',
          'line-width': 2,
        },
      })
    }

    if (!m.getSource('shape-draft')) {
      m.addSource('shape-draft', {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      })
      m.addLayer({
        id: 'shape-draft-fill',
        type: 'fill',
        source: 'shape-draft',
        filter: ['==', '$type', 'Polygon'],
        paint: { 'fill-color': '#006CD7', 'fill-opacity': 0.12 },
      })
      m.addLayer({
        id: 'shape-draft-line',
        type: 'line',
        source: 'shape-draft',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#006CD7',
          'line-width': 2,
          'line-dasharray': [2, 1],
        },
      })
      m.addLayer({
        id: 'shape-draft-vertices',
        type: 'circle',
        source: 'shape-draft',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 4,
          'circle-color': 'transparent',
          'circle-stroke-color': '#006CD7',
          'circle-stroke-width': 2,
        },
      })
    }
  }, [mapReady])

  // Keep visible saved shapes + the in-progress pending shape rendered, with a
  // small floating label/close control per visible saved shape.
  useEffect(() => {
    if (!map.current || !mapReady) return
    const m = map.current
    const source = m.getSource('user-shapes')
    if (!source) return

    const visibleIdSet = new Set(visibleShapeIds || [])
    const visibleShapes = (bookmarkedShapes || []).filter((shape) =>
      visibleIdSet.has(shape.id)
    )

    const features = []
    visibleShapes.forEach((shape) => {
      const feature = shapeToPolygonFeature(shape, 'saved')
      if (feature) features.push(feature)
    })
    if (pendingShape) {
      const pendingFeature = shapeToPolygonFeature(pendingShape, 'pending')
      if (pendingFeature) features.push(pendingFeature)
    }
    source.setData({ type: 'FeatureCollection', features })

    // Sync close-label markers with the set of visible shapes.
    const nextIds = new Set(visibleShapes.map((shape) => shape.id))
    Object.entries(shapeMarkersRef.current).forEach(([id, marker]) => {
      if (nextIds.has(id)) return
      marker.remove()
      delete shapeMarkersRef.current[id]
    })

    visibleShapes.forEach((shape) => {
      const center = getPolygonCenter(shapeToPolygonFeature(shape, 'saved'))
      if (!center) return

      let marker = shapeMarkersRef.current[shape.id]
      if (!marker) {
        const el = document.createElement('div')
        el.style.display = 'flex'
        el.style.alignItems = 'center'
        el.style.gap = '6px'
        el.style.padding = '4px 6px 4px 10px'
        el.style.background = '#181926'
        el.style.border = '1px solid #393C56'
        el.style.borderRadius = '6px'
        el.style.color = '#FFFFFF'
        el.style.fontFamily = 'Inter, sans-serif'
        el.style.fontSize = '12px'
        el.style.fontWeight = '600'
        el.style.whiteSpace = 'nowrap'

        const label = document.createElement('span')
        label.dataset.shapeLabel = 'true'
        el.appendChild(label)

        const closeButton = document.createElement('button')
        closeButton.type = 'button'
        closeButton.setAttribute('aria-label', 'Close shape')
        closeButton.style.display = 'inline-flex'
        closeButton.style.alignItems = 'center'
        closeButton.style.justifyContent = 'center'
        closeButton.style.width = '16px'
        closeButton.style.height = '16px'
        closeButton.style.border = 'none'
        closeButton.style.background = 'transparent'
        closeButton.style.color = '#A4ABBE'
        closeButton.style.cursor = 'pointer'
        closeButton.style.padding = '0'
        closeButton.innerHTML =
          '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        closeButton.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopPropagation()
          hideShape(shape.id)
        })
        el.appendChild(closeButton)

        marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(center)
          .addTo(m)
        shapeMarkersRef.current[shape.id] = marker
      } else {
        marker.setLngLat(center)
      }

      const labelEl = marker
        .getElement()
        .querySelector('[data-shape-label="true"]')
      if (labelEl) labelEl.textContent = shape.name || 'Shape'
    })

    // Fly to a shape the first time it becomes visible.
    const previousIds = new Set(lastVisibleShapeIdsRef.current)
    const newlyVisible = visibleShapes.filter(
      (shape) => !previousIds.has(shape.id)
    )
    if (newlyVisible.length > 0) {
      const coords = newlyVisible
        .map((shape) => shapeToPolygonFeature(shape, 'saved'))
        .filter(Boolean)
        .flatMap((feature) => feature.geometry.coordinates[0])
        .filter(
          (coord) =>
            Array.isArray(coord) &&
            Number.isFinite(coord[0]) &&
            Number.isFinite(coord[1])
        )
      if (coords.length > 1) {
        const bounds = coords.reduce(
          (acc, coord) => acc.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        )
        m.fitBounds(bounds, {
          padding: { top: 120, right: 120, bottom: 120, left: 160 },
          maxZoom: 9,
          duration: 1000,
        })
      }
    }
    lastVisibleShapeIdsRef.current = visibleShapes.map((shape) => shape.id)
  }, [mapReady, bookmarkedShapes, pendingShape, visibleShapeIds, hideShape])

  // "For You" curated items rendered on the map. We support three marker
  // approaches so we can compare them, toggled via the top-nav dropdown:
  //   - 'pin':      classic teardrop pin per item
  //   - 'pulse':    dot with an animated pulsing ring
  //   - 'priority': numbered badge ranked by the item's priority
  useEffect(() => {
    if (!map.current || !mapReady) return
    const m = map.current

    // Tear down existing markers on every change; the list is small.
    Object.values(forYouMarkersRef.current).forEach((marker) => marker.remove())
    forYouMarkersRef.current = {}

    if (!forYouActive || !Array.isArray(forYouItems) || forYouItems.length === 0) {
      // Note: intentionally do NOT reset forYouFittedRef here. Resetting on every
      // navigation away made the feed re-fit to ALL items when returning to For
      // You, which stomped single-item focus (e.g. clicking a shape after a ship
      // briefly routes through /myships). We fit to the whole feed once.
      return
    }

    // When the master toggle is on, show everything. When it's off, show only
    // the items the user individually enabled via the per-card checkboxes.
    const visibleForYouItems = forYouMarkersVisible
      ? forYouItems
      : forYouItems.filter((item) =>
          Array.isArray(forYouVisibleIds)
            ? forYouVisibleIds.includes(item.id)
            : false
        )

    if (visibleForYouItems.length === 0) {
      return
    }

    const buildPinEl = (item) => {
      const el = document.createElement('div')
      el.style.cursor = 'pointer'
      el.style.transform = 'translateY(2px)'
      el.innerHTML =
        `<svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="M13 1C6.37 1 1 6.37 1 13c0 8.5 12 20 12 20s12-11.5 12-20C25 6.37 19.63 1 13 1Z" fill="${item.color}" stroke="#111326" stroke-width="1.5"/>` +
        `<circle cx="13" cy="13" r="4.5" fill="#111326"/></svg>`
      return { el, anchor: 'bottom' }
    }

    const buildPulseEl = (item) => {
      const el = document.createElement('div')
      el.style.cursor = 'pointer'
      el.style.position = 'relative'
      el.style.width = '16px'
      el.style.height = '16px'

      const ring = document.createElement('div')
      ring.className = 'for-you-pulse-ring'
      ring.style.position = 'absolute'
      ring.style.left = '50%'
      ring.style.top = '50%'
      ring.style.width = '16px'
      ring.style.height = '16px'
      ring.style.marginLeft = '-8px'
      ring.style.marginTop = '-8px'
      ring.style.borderRadius = '50%'
      ring.style.background = item.color

      const dot = document.createElement('div')
      dot.style.position = 'absolute'
      dot.style.left = '50%'
      dot.style.top = '50%'
      dot.style.width = '12px'
      dot.style.height = '12px'
      dot.style.marginLeft = '-6px'
      dot.style.marginTop = '-6px'
      dot.style.borderRadius = '50%'
      dot.style.background = item.color
      dot.style.border = '2px solid #111326'

      el.appendChild(ring)
      el.appendChild(dot)
      return { el, anchor: 'center' }
    }

    const buildPriorityEl = (item) => {
      const el = document.createElement('div')
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.width = '22px'
      el.style.height = '22px'
      el.style.borderRadius = '50%'
      el.style.background = item.color
      el.style.border = '2px solid #111326'
      el.style.color = '#111326'
      el.style.fontFamily = 'Inter, sans-serif'
      el.style.fontSize = '12px'
      el.style.fontWeight = '700'
      el.textContent = String(item.priority ?? '')
      return { el, anchor: 'center' }
    }

    const ringInnerIconPaths = (kind, color) => {
      if (kind === 'port') {
        return `<path d="M9.99984 6.66675C11.3805 6.66675 12.4998 5.54746 12.4998 4.16675C12.4998 2.78604 11.3805 1.66675 9.99984 1.66675C8.61913 1.66675 7.49984 2.78604 7.49984 4.16675C7.49984 5.54746 8.61913 6.66675 9.99984 6.66675ZM9.99984 6.66675V18.3334M9.99984 18.3334C7.7897 18.3334 5.67008 17.4554 4.10728 15.8926C2.54448 14.3298 1.6665 12.2102 1.6665 10.0001H4.1665M9.99984 18.3334C12.21 18.3334 14.3296 17.4554 15.8924 15.8926C17.4552 14.3298 18.3332 12.2102 18.3332 10.0001H15.8332" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
      }
      if (kind === 'shape') {
        return `<path d="M9.04746 5.83333L4.28555 14.1667M4.99984 15.8333H14.9997M15.7141 14.1667L10.9522 5.83333M2.99984 17.5H3.6665C4.13321 17.5 4.36657 17.5 4.54483 17.4092C4.70163 17.3293 4.82911 17.2018 4.90901 17.045C4.99984 16.8667 4.99984 16.6334 4.99984 16.1667V15.5C4.99984 15.0333 4.99984 14.7999 4.90901 14.6217C4.82911 14.4649 4.70163 14.3374 4.54483 14.2575C4.36657 14.1667 4.13321 14.1667 3.6665 14.1667H2.99984C2.53313 14.1667 2.29977 14.1667 2.12151 14.2575C1.96471 14.3374 1.83723 14.4649 1.75733 14.6217C1.6665 14.7999 1.6665 15.0333 1.6665 15.5V16.1667C1.6665 16.6334 1.6665 16.8667 1.75733 17.045C1.83723 17.2018 1.96471 17.3293 2.12151 17.4092C2.29977 17.5 2.53313 17.5 2.99984 17.5ZM16.3332 17.5H16.9998C17.4665 17.5 17.6999 17.5 17.8782 17.4092C18.035 17.3293 18.1624 17.2018 18.2423 17.045C18.3332 16.8667 18.3332 16.6334 18.3332 16.1667V15.5C18.3332 15.0333 18.3332 14.7999 18.2423 14.6217C18.1624 14.4649 18.035 14.3374 17.8782 14.2575C17.6999 14.1667 17.4665 14.1667 16.9998 14.1667H16.3332C15.8665 14.1667 15.6331 14.1667 15.4548 14.2575C15.298 14.3374 15.1706 14.4649 15.0907 14.6217C14.9998 14.7999 14.9998 15.0333 14.9998 15.5V16.1667C14.9998 16.6334 14.9998 16.8667 15.0907 17.045C15.1706 17.2018 15.298 17.3293 15.4548 17.4092C15.6331 17.5 15.8665 17.5 16.3332 17.5ZM9.6665 5.83333H10.3332C10.7999 5.83333 11.0332 5.83333 11.2115 5.74251C11.3683 5.66261 11.4958 5.53513 11.5757 5.37833C11.6665 5.20007 11.6665 4.96671 11.6665 4.5V3.83333C11.6665 3.36662 11.6665 3.13327 11.5757 2.95501C11.4958 2.79821 11.3683 2.67072 11.2115 2.59083C11.0332 2.5 10.7999 2.5 10.3332 2.5H9.6665C9.19979 2.5 8.96644 2.5 8.78818 2.59083C8.63138 2.67072 8.50389 2.79821 8.424 2.95501C8.33317 3.13327 8.33317 3.36662 8.33317 3.83333V4.5C8.33317 4.96671 8.33317 5.20007 8.424 5.37833C8.50389 5.53513 8.63138 5.66261 8.78818 5.74251C8.96644 5.83333 9.19979 5.83333 9.6665 5.83333Z" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
      }
      // ship / detection
      return (
        `<path d="M15.8333 17.5L17.2458 13.6146C17.3157 13.4225 17.3125 13.2114 17.2369 13.0215C17.1614 12.8316 17.0186 12.6761 16.8358 12.5846L10.3725 9.3529C10.2568 9.2951 10.1293 9.26501 9.99999 9.26501C9.87069 9.26501 9.74316 9.2951 9.6275 9.3529L3.16416 12.5846C2.98132 12.676 2.83847 12.8315 2.7628 13.0214C2.68712 13.2113 2.6839 13.4224 2.75374 13.6146L4.16666 17.5" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<path d="M12.0833 5.83332V2.49999C12.0833 2.27898 11.9955 2.06701 11.8393 1.91073C11.683 1.75445 11.471 1.66666 11.25 1.66666H8.74999C8.52898 1.66666 8.31702 1.75445 8.16074 1.91073C8.00446 2.06701 7.91666 2.27898 7.91666 2.49999V5.83332M14.5833 5.83332H5.41666C5.19565 5.83332 4.98369 5.92112 4.82741 6.0774C4.67113 6.23368 4.58333 6.44564 4.58333 6.66666V11.6667L9.65083 9.32791C9.7603 9.27739 9.87943 9.25123 9.99999 9.25123C10.1206 9.25123 10.2397 9.27739 10.3492 9.32791L15.4167 11.6667V6.66666C15.4167 6.44564 15.3289 6.23368 15.1726 6.0774C15.0163 5.92112 14.8043 5.83332 14.5833 5.83332Z" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M10 13.3333V16.6666" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>` +
        `<path d="M1.66666 18.3333C3.33333 18.3333 3.33333 17.5 4.58333 17.5C5.83333 17.5 5.83333 18.3333 7.08333 18.3333C8.33333 18.3333 8.54166 17.5 10 17.5C11.4583 17.5 11.6667 18.3333 12.9167 18.3333C14.1667 18.3333 14.1667 17.5 15.4167 17.5C16.6667 17.5 16.6667 18.3333 18.3333 18.3333" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
      )
    }

    const hexToRgb = (hex) => {
      const h = String(hex).replace('#', '').trim()
      const full =
        h.length === 3
          ? h
              .split('')
              .map((c) => c + c)
              .join('')
          : h
      const n = parseInt(full, 16)
      if (full.length !== 6 || Number.isNaN(n)) return { r: 255, g: 255, b: 255 }
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }

    const buildRingEl = (item) => {
      const el = document.createElement('div')
      el.style.cursor = 'pointer'
      // Kill the inline-SVG descender gap so the ring centers on the geo point
      // (and thus on the underlying detection marker, which does the same).
      el.style.lineHeight = '0'

      const color = forYouRingConfig?.color || '#FFFFFF'
      const isDashed = forYouRingConfig?.lineStyle === 'dashed'
      // Fill is driven purely by opacity now (0 = no fill).
      const fillOpacity = Number(forYouRingConfig?.fillOpacity ?? 0.2)
      const borderWidth = Number(forYouRingConfig?.borderWidth ?? 2)
      const dashAttr = isDashed ? ' stroke-dasharray="5 4"' : ''
      // Ring diameter is freely sized via the slider; the inner glyph stays a
      // fixed size (like detection markers don't resize).
      const INNER_ICON = 16
      const rawSize = Number(forYouRingConfig?.size)
      const ringDiameter = Number.isFinite(rawSize)
        ? Math.min(64, Math.max(24, rawSize))
        : 36
      // Ports and shapes have no underlying map marker, so they carry their own
      // glyph inside the ring. Ships render as an empty ring; their existing
      // detection marker stays on top via a higher z-index (set where the
      // detection markers are created) so the ring fill never hides it.
      const innerKind =
        item.kind === 'port' ? 'port' : item.kind === 'shape' ? 'shape' : null
      // Shapes have no underlying selectable marker, so when the shape is the
      // active one we draw the white "active" halo onto its ring (ships get it
      // from the detection marker, ports from the white port-icon border).
      const isActive =
        item.kind === 'shape' && (visibleShapeIds || []).includes(item.id)
      const HALO_GAP = 3
      const HALO_WIDTH = 2
      const haloRadius = ringDiameter / 2 + HALO_GAP
      const baseDim = innerKind ? Math.max(ringDiameter, INNER_ICON) : ringDiameter
      const dim = isActive
        ? Math.max(baseDim, (haloRadius + HALO_WIDTH) * 2)
        : baseDim
      const center = dim / 2
      const ringRadius = ringDiameter / 2 - borderWidth

      // Auto-contrast glyph color: the ring fill is the glyph's background, so
      // pick black or white based on the EFFECTIVE fill (the chosen color
      // composited at its opacity over the dark map). This keeps the glyph
      // readable from a transparent fill all the way to a solid light color.
      let inner = ''
      if (innerKind) {
        const fill = hexToRgb(color)
        const base = { r: 16, g: 19, b: 31 } // approx. dark map under the marker
        const eff = {
          r: base.r * (1 - fillOpacity) + fill.r * fillOpacity,
          g: base.g * (1 - fillOpacity) + fill.g * fillOpacity,
          b: base.b * (1 - fillOpacity) + fill.b * fillOpacity,
        }
        const luminance =
          (0.299 * eff.r + 0.587 * eff.g + 0.114 * eff.b) / 255
        const iconColor = luminance > 0.6 ? '#0A0E19' : '#FFFFFF'
        const scale = INNER_ICON / 20
        const offset = (dim - INNER_ICON) / 2
        inner = `<g transform="translate(${offset},${offset}) scale(${scale})">${ringInnerIconPaths(innerKind, iconColor)}</g>`
      }

      // Active halo (white ring around the marker) drawn outside the colored ring.
      const halo = isActive
        ? `<circle cx="${center}" cy="${center}" r="${haloRadius}" fill="none" stroke="#FFFFFF" stroke-width="${HALO_WIDTH}"/>`
        : ''

      // Paint the halo, then the ring (fill + stroke), then the glyph on top so a
      // high fill opacity can no longer hide the icon.
      el.innerHTML =
        `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" fill="none" xmlns="http://www.w3.org/2000/svg">` +
        halo +
        `<circle cx="${center}" cy="${center}" r="${Math.max(0, ringRadius)}" fill="${color}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-width="${borderWidth}"${dashAttr}/>` +
        inner +
        `</svg>`
      return { el, anchor: 'center' }
    }

    const builders = {
      pin: buildPinEl,
      pulse: buildPulseEl,
      priority: buildPriorityEl,
      ring: buildRingEl,
    }
    const build = builders[forYouMarkerMode] || buildPinEl

    // For ships, anchor the ring on the ship's actual latest detection (the same
    // one selecting the ship flies to) so the ring wraps the detection marker
    // instead of sitting at the feed's approximate coordinate. Ports/shapes use
    // their own coordinate.
    const resolveItemLngLat = (item) => {
      if (
        item.kind === 'ship' &&
        item.shipId &&
        Array.isArray(runtimeDetections)
      ) {
        const dets = runtimeDetections.filter(
          (d) => String(d.shipId) === String(item.shipId)
        )
        if (dets.length > 0) {
          const latest = [...dets].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]
          if (Number.isFinite(latest?.lng) && Number.isFinite(latest?.lat)) {
            return [latest.lng, latest.lat]
          }
        }
      }
      if (Number.isFinite(item.lng) && Number.isFinite(item.lat)) {
        return [item.lng, item.lat]
      }
      return null
    }

    visibleForYouItems.forEach((item) => {
      const lngLat = resolveItemLngLat(item)
      if (!lngLat) return
      const { el, anchor } = build(item)
      el.title = `${item.name} — ${item.reason}`
      el.addEventListener('click', (event) => {
        event.stopPropagation()
        onForYouItemClickRef.current?.(item)
      })
      const marker = new mapboxgl.Marker({ element: el, anchor })
        .setLngLat(lngLat)
        .addTo(m)
      forYouMarkersRef.current[item.id] = marker
    })

    // Fit the map to the curated set once when the feed first becomes active.
    if (!forYouFittedRef.current) {
      const coords = visibleForYouItems
        .map((item) => resolveItemLngLat(item))
        .filter(Boolean)
      if (coords.length > 1) {
        const bounds = coords.reduce(
          (acc, coord) => acc.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        )
        m.fitBounds(bounds, {
          padding: { top: 100, right: 120, bottom: 100, left: leftPanelInset + 80 },
          maxZoom: 7,
          duration: 900,
        })
      }
      forYouFittedRef.current = true
    }
  }, [
    mapReady,
    forYouActive,
    forYouMarkerMode,
    forYouRingConfig,
    forYouMarkersVisible,
    forYouVisibleIds,
    forYouItems,
    runtimeDetections,
    visibleShapeIds,
    leftPanelInset,
  ])

  // Explicit recenter when a For You item is clicked. Runs on every click (the
  // nonce changes each time) so re-clicking an already-shown port/shape still
  // flies the map back to it.
  useEffect(() => {
    if (!map.current || !mapReady || !forYouFocus) return
    if (forYouFocusNonceRef.current === forYouFocus.nonce) return
    const { lng, lat } = forYouFocus
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
    forYouFocusNonceRef.current = forYouFocus.nonce
    map.current.flyTo({
      center: [lng, lat],
      zoom: forYouFocus.kind === 'shape' ? 7.5 : 9.5,
      duration: 1200,
      padding: panelAwareFocusPadding,
    })
  }, [forYouFocus, mapReady, panelAwareFocusPadding])

  // Interactive polygon drawing while a shape draw tool is active.
  useEffect(() => {
    if (!map.current || !mapReady) return
    if (shapeDrawMode !== 'polygon') return

    const m = map.current
    let points = []

    const draftSource = () => m.getSource('shape-draft')

    m.getCanvas().style.cursor = 'crosshair'
    m.doubleClickZoom.disable()

    const renderDraft = () => {
      const features = []
      if (points.length >= 3) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[...points, points[0]]] },
          properties: {},
        })
      }
      if (points.length >= 2) {
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: points },
          properties: {},
        })
      }
      points.forEach((point, index) => {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: point },
          properties: { index },
        })
      })
      draftSource()?.setData({ type: 'FeatureCollection', features })
    }

    const clearDraft = () => {
      points = []
      draftSource()?.setData(EMPTY_FEATURE_COLLECTION)
    }

    const finish = () => {
      if (points.length >= 3) {
        completeShapeDraw({ type: 'polygon', coordinates: [...points] })
      }
      clearDraft()
    }

    const handleClick = (event) => {
      // Closing the loop: click near the first vertex finishes the shape.
      if (points.length >= 3) {
        const firstPixel = m.project(points[0])
        const distance = Math.hypot(
          firstPixel.x - event.point.x,
          firstPixel.y - event.point.y
        )
        if (distance <= 12) {
          finish()
          return
        }
      }
      points = [...points, [event.lngLat.lng, event.lngLat.lat]]
      renderDraft()
    }

    const handleDoubleClick = (event) => {
      event.preventDefault?.()
      // The two clicks preceding a double-click each add a vertex; drop the
      // duplicate so the closing point isn't doubled up.
      if (points.length > 0) {
        points = points.slice(0, -1)
      }
      finish()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        finish()
      } else if (event.key === 'Escape') {
        clearDraft()
        cancelShapeDraw()
      }
    }

    m.on('click', handleClick)
    m.on('dblclick', handleDoubleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      m.off('click', handleClick)
      m.off('dblclick', handleDoubleClick)
      window.removeEventListener('keydown', handleKeyDown)
      if (map.current) {
        m.getCanvas().style.cursor = ''
        m.doubleClickZoom.enable()
        draftSource()?.setData(EMPTY_FEATURE_COLLECTION)
      }
    }
  }, [mapReady, shapeDrawMode, completeShapeDraw, cancelShapeDraw])

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
