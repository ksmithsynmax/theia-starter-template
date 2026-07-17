import { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Slider, Text, Tooltip } from '@mantine/core'
import {
  Bookmark,
  Star01,
  Trash01,
  Anchor,
  Settings04,
  Sliders04,
  ChevronDown,
  Eye,
  EyeOff,
  LinkExternal01,
  BarChartSquare02,
  List,
  Grid01,
} from '@untitledui/icons'
import { useShipContext } from '../context/ShipContext'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import ShipIcon from '../custom-icons/ShipIcon'
import PolygonIcon from '../custom-icons/PolygonIcon'
import STSDefaultIcon from '../custom-icons/STSDefaultIcon'
import AnchorIcon from '../custom-icons/AnchorIcon.svg'
import { ships } from '../data/mockData'
import { DataTable, BookmarkCardList } from './BookmarkDataViews'

const NAV_WIDTH = 386
const NAV_MIN_WIDTH = 386
const NAV_MAX_WIDTH = 760

const TOOLTIP_PROPS = {
  withArrow: true,
  arrowSize: 6,
  offset: 6,
  transitionProps: { duration: 120 },
  styles: {
    tooltip: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: '1px solid #000000',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 500,
      padding: '6px 8px',
    },
    arrow: {
      backgroundColor: '#000000',
      border: '1px solid #000000',
    },
  },
}

const RING_DEFAULTS = {
  color: '#F75349',
  lineStyle: 'solid',
  fill: true,
  fillOpacity: 0.2,
  borderWidth: 2,
  size: 36,
}

const RING_SIZE_MIN = 24
const RING_SIZE_MAX = 64

// Preset swatches for the customizable ring marker (red is the default).
const RING_SWATCHES = [
  '#F75349',
  '#1CC86B',
  '#FFCF5C',
  '#006CD7',
  '#5D6398',
  '#FFFFFF',
]

// Shared styling for the ring customizer sliders: blue filled bar over a dark
// track, with a white thumb ringed in the primary blue.
const RING_SLIDER_STYLES = {
  // Drive the filled bar + thumb ring from --slider-color and the unfilled
  // track from --slider-track-bg; the thumb keeps Mantine's default 2px ring.
  root: {
    '--slider-color': '#006CD7',
    '--slider-track-bg': '#393C56',
  },
}

// Two save-to-bookmarks treatments to compare. Bookmarks elsewhere uses a star
// to save, so proto1 keeps that consistent; proto2 keeps the bookmark glyph.
const SAVE_VARIANTS = {
  proto1: {
    Icon: Star01,
    addLabel: 'Favorite',
    removeLabel: 'Remove favorite',
    activeColor: '#FFCF5C',
  },
  proto2: {
    Icon: Bookmark,
    addLabel: 'Save',
    removeLabel: 'Remove',
    activeColor: '#0094FF',
  },
}

// Maritime Briefing (version 2): time windows for the Overview stats and the
// headline detection counts shown for each window. Static seed for the
// prototype; deltas are vs. the previous comparable window.
const BRIEFING_RANGE_OPTIONS = [
  { value: 'yesterday', label: 'Since Yesterday' },
  { value: 'week', label: 'Past 7 Days' },
  { value: 'month', label: 'Past 30 Days' },
]

// Detection-type glyphs matching the map markers, keyed by the Overview label
// so each stat card reads like the map legend.
const BRIEFING_STAT_ICONS = {
  Dark: `<svg width="11" height="16" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387H12.75L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387L6.74999 20.9387Z" fill="#FFA500" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="#111326"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="#111326"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="#111326"/></svg>`,
  Spoofing: `<svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="11.0607" y="1.06065" width="14.1421" height="14.1421" transform="rotate(45 11.0607 1.06065)" fill="#FF6D99" stroke="#111326" stroke-width="1.5"/><path d="M11.0607 11.8937V7.1716" stroke="#111326" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.0607" cy="14.9492" r="1.11108" fill="#111326"/></svg>`,
  AIS: `<svg width="11" height="16" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00EB6C" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/></svg>`,
  Light: `<svg width="11" height="16" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00A3E3" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="white"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="white"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="white"/></svg>`,
  Unattributed: `<svg width="11" height="16" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#F75349" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><ellipse cx="6.72543" cy="12.4387" rx="2.57571" ry="2.5" stroke="#111326" stroke-width="1.5"/><path d="M9.15069 17.4049C9.38254 17.7481 9.85378 17.8461 10.2032 17.6237C10.5527 17.4014 10.648 16.9428 10.4162 16.5996L9.78344 17.0022L9.15069 17.4049ZM8.08876 14.4934L7.45601 14.896L9.15069 17.4049L9.78344 17.0022L10.4162 16.5996L8.72151 14.0907L8.08876 14.4934Z" fill="#111326"/></svg>`,
}

const BRIEFING_OVERVIEW_STATS = {
  yesterday: [
    { key: 'dark', label: 'Dark', value: '2431', delta: '+132' },
    { key: 'spoofing', label: 'Spoofing', value: '150', delta: '+24' },
    { key: 'sts', label: 'STS', value: '79', delta: '+13' },
    { key: 'ais', label: 'AIS', value: '5120', delta: '+410' },
    { key: 'light', label: 'Light', value: '862', delta: '+58' },
    { key: 'unattributed', label: 'Unattributed', value: '61', delta: '+9' },
  ],
  week: [
    { key: 'dark', label: 'Dark', value: '16.2k', delta: '+1.1k' },
    { key: 'spoofing', label: 'Spoofing', value: '984', delta: '+142' },
    { key: 'sts', label: 'STS', value: '531', delta: '+68' },
    { key: 'ais', label: 'AIS', value: '34.7k', delta: '+2.9k' },
    { key: 'light', label: 'Light', value: '5.8k', delta: '+420' },
    { key: 'unattributed', label: 'Unattributed', value: '402', delta: '+54' },
  ],
  month: [
    { key: 'dark', label: 'Dark', value: '68.9k', delta: '+4.7k' },
    { key: 'spoofing', label: 'Spoofing', value: '4.1k', delta: '+390' },
    { key: 'sts', label: 'STS', value: '2.2k', delta: '+205' },
    { key: 'ais', label: 'AIS', value: '148k', delta: '+9.2k' },
    { key: 'light', label: 'Light', value: '24.3k', delta: '+1.7k' },
    {
      key: 'unattributed',
      label: 'Unattributed',
      value: '1.7k',
      delta: '+160',
    },
  ],
}

// Order + labels for the Overview "which metrics show" customizer.
const BRIEFING_OVERVIEW_METRICS = [
  { key: 'dark', label: 'Dark' },
  { key: 'spoofing', label: 'Spoofing' },
  { key: 'sts', label: 'STS' },
  { key: 'ais', label: 'AIS' },
  { key: 'light', label: 'Light' },
  { key: 'unattributed', label: 'Unattributed' },
]

// Country lookup for the briefing Ports table. Prototype data — swap for a real
// port master when the backend exists.
const BRIEFING_PORT_COUNTRY = {
  'port-dubai': 'UAE',
  'port-muscat': 'Oman',
  'port-fujairah': 'UAE',
  'port-mumbai': 'India',
}

// Curated dashboards we surface in the Maritime Briefing. Each opens in a new
// tab. Prototype data — swap for a real feed when the backend exists.
const BRIEFING_DASHBOARDS = [
  {
    id: 'dash-yoruks',
    name: 'Yörük Straits Activity',
    description: 'Dark activity & STS clustering in the strait',
    url: 'https://synmax-yoruksdashboard.netlify.app/',
    updated: 'Updated today',
    topics: ['dark', 'sts'],
  },
]

// Topic options that back the Dashboards filter popover.
const BRIEFING_DASHBOARD_TOPICS = [
  { key: 'dark', label: 'Dark activity' },
  { key: 'sts', label: 'STS transfers' },
  { key: 'ports', label: 'Ports' },
]

function ForYouSecondaryNav({
  isOpen,
  onOpen,
  onClose,
  currentPath,
  active = false,
  prototype = 'proto1',
  version = 'v1',
  markerMode = 'pin',
  ringConfig,
  onRingConfigChange,
  markersVisible = true,
  onMarkersVisibleChange,
  visibleIds = [],
  onVisibleIdsChange,
  onShipSelect,
  onPortSelect,
  onItemActivate,
}) {
  const {
    forYouItems,
    dismissForYouItem,
    favoriteShipIds,
    favoritePorts,
    bookmarkedShapes,
    toggleFavoriteShip,
    toggleFavoritePort,
    addBookmarkedShape,
    removeShape,
    showShape,
    visibleShapeIds,
    activeShipTab,
    closeAllTabs,
  } = useShipContext()
  const [expandHovered, setExpandHovered] = useState(false)
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [hoveredItemId, setHoveredItemId] = useState(null)
  // The ring-style customizer is tucked behind a settings toggle so it isn't
  // always taking up space at the top of the feed.
  const [showRingSettings, setShowRingSettings] = useState(false)
  // Maritime Briefing (version 2) time window for the Overview stats.
  const [briefingRange, setBriefingRange] = useState('yesterday')
  // Ships/Ports presentation in the briefing: 'table' (default) or 'cards'.
  const [briefingViewMode, setBriefingViewMode] = useState('table')
  // Let analysts widen the panel to see more table data.
  const [navWidth, setNavWidth] = useState(NAV_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(NAV_WIDTH)
  // Which section's filter popover is open ('ships' | 'ports' | null) and the
  // per-section criteria that decide what surfaces in each list.
  const [openFilter, setOpenFilter] = useState(null)
  // Which detection-type metric cards show in the Overview.
  const [overviewMetrics, setOverviewMetrics] = useState({
    dark: true,
    spoofing: true,
    sts: true,
    ais: false,
    light: false,
    unattributed: false,
  })
  const [shipFilters, setShipFilters] = useState({
    dark: true,
    spoofing: true,
    sts: true,
    onlyFollowed: false,
  })
  const [portFilters, setPortFilters] = useState({
    elevated: true,
    vesselsOfInterest: true,
    onlyFollowed: false,
  })
  const [dashboardFilters, setDashboardFilters] = useState({
    dark: true,
    sts: true,
    ports: true,
  })
  // Map-marker visibility for the briefing, controlled from the Overview filter.
  // When a kind is off, its rows expose a per-row eye toggle (ids kept here).
  const [briefingMarkerKinds, setBriefingMarkerKinds] = useState({
    ship: true,
    port: true,
    shape: true,
  })
  const [briefingMarkerItemIds, setBriefingMarkerItemIds] = useState([])

  // Close the filter popover on any outside click. Clicks inside the popover or
  // on its trigger stop propagation, so this only fires for outside clicks.
  useEffect(() => {
    if (!openFilter) return
    const handleClickOutside = () => setOpenFilter(null)
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openFilter])

  // Drag-to-resize the panel width.
  useEffect(() => {
    if (!isResizing) return undefined
    const handleMouseMove = (event) => {
      const deltaX = event.clientX - resizeStartXRef.current
      const nextWidth = Math.max(
        NAV_MIN_WIDTH,
        Math.min(NAV_MAX_WIDTH, resizeStartWidthRef.current + deltaX)
      )
      setNavWidth(nextWidth)
    }
    const handleMouseUp = () => setIsResizing(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const toggleOverviewMetric = (key) =>
    setOverviewMetrics((prev) => ({ ...prev, [key]: !prev[key] }))
  const toggleShipFilter = (key) =>
    setShipFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  const togglePortFilter = (key) =>
    setPortFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  const toggleDashboardFilter = (key) =>
    setDashboardFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  const toggleBriefingMarkerKind = (key) =>
    setBriefingMarkerKinds((prev) => ({ ...prev, [key]: !prev[key] }))
  const allBriefingMarkersOn =
    briefingMarkerKinds.ship &&
    briefingMarkerKinds.port &&
    briefingMarkerKinds.shape
  const toggleAllBriefingMarkers = () => {
    const next = !allBriefingMarkersOn
    setBriefingMarkerKinds({ ship: next, port: next, shape: next })
  }
  const toggleBriefingMarkerItem = (itemId) =>
    setBriefingMarkerItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )

  const isForYouView = currentPath === '/for-you' || active
  const isBriefing = version === 'v2'
  const saveVariant = SAVE_VARIANTS[prototype] || SAVE_VARIANTS.proto1

  // Which briefing items should render a map marker: a whole kind can be toggled
  // off in the Overview filter, after which only individually re-enabled items
  // (via the per-row eye) show. Shapes aren't kind-gated, so they always show.
  const briefingMarkerVisibleIds = useMemo(
    () =>
      (forYouItems || [])
        .filter((item) => {
          if (item.kind === 'ship')
            return (
              briefingMarkerKinds.ship ||
              briefingMarkerItemIds.includes(item.id)
            )
          if (item.kind === 'port')
            return (
              briefingMarkerKinds.port ||
              briefingMarkerItemIds.includes(item.id)
            )
          // Shapes are hidden in the briefing for now.
          // if (item.kind === 'shape')
          //   return (
          //     briefingMarkerKinds.shape ||
          //     briefingMarkerItemIds.includes(item.id)
          //   )
          if (item.kind === 'shape') return false
          return true
        })
        .map((item) => item.id),
    [forYouItems, briefingMarkerKinds, briefingMarkerItemIds]
  )

  // Drive the shared map marker layer from the briefing's kind toggles. The map
  // supports "all" or "allowlist" only, so we run it in allowlist mode while the
  // briefing is active and hand it the computed set. Leaving the briefing
  // restores the classic For You "show all" default.
  useEffect(() => {
    if (!isBriefing) {
      onMarkersVisibleChange?.(true)
      return
    }
    onMarkersVisibleChange?.(false)
    onVisibleIdsChange?.(briefingMarkerVisibleIds)
  }, [isBriefing, briefingMarkerVisibleIds])
  const SaveIcon = saveVariant.Icon

  const ring = ringConfig || RING_DEFAULTS
  const ringSize = (() => {
    const n = Number(ring.size)
    if (!Number.isFinite(n)) return RING_DEFAULTS.size
    return Math.min(RING_SIZE_MAX, Math.max(RING_SIZE_MIN, n))
  })()
  const updateRing = (patch) => {
    onRingConfigChange?.({ ...ring, ...patch })
  }
  const showRingCustomizer = markerMode === 'ring'

  // Per-item marker checkboxes only appear when the master toggle is off.
  const showItemCheckboxes = !markersVisible
  const isMarkerShown = (item) =>
    markersVisible || (visibleIds || []).includes(item.id)
  const toggleItemMarker = (item) => {
    const ids = visibleIds || []
    const next = ids.includes(item.id)
      ? ids.filter((id) => id !== item.id)
      : [...ids, item.id]
    onVisibleIdsChange?.(next)
  }

  const isBookmarked = (item) => {
    if (item.kind === 'ship') return favoriteShipIds.includes(item.shipId)
    if (item.kind === 'port')
      return favoritePorts.some((port) => port.id === item.portId)
    if (item.kind === 'shape')
      return bookmarkedShapes.some((shape) => shape.id === item.id)
    return false
  }

  const handleBookmarkToggle = (item) => {
    if (item.kind === 'ship') {
      toggleFavoriteShip(item.shipId)
    } else if (item.kind === 'port') {
      toggleFavoritePort({ id: item.portId, name: item.name, flag: item.flag })
    } else if (item.kind === 'shape') {
      if (isBookmarked(item)) {
        removeShape(item.id)
      } else {
        addBookmarkedShape({
          id: item.id,
          name: item.name,
          coordinates: item.geometry?.coordinates?.[0] || [],
        })
      }
    }
  }

  const handleRowClick = (item) => {
    if (item.kind === 'ship') {
      onShipSelect?.(item)
    } else if (item.kind === 'port') {
      onPortSelect?.(item)
    } else if (item.kind === 'shape') {
      // Ships/shapes are mutually exclusive, so clear any open ship/port detail
      // first. The map only renders shapes that are bookmarked + visible, so
      // make sure the saved area exists in that set before showing it.
      closeAllTabs?.()
      addBookmarkedShape({
        id: item.id,
        name: item.name,
        coordinates: item.geometry?.coordinates?.[0] || [],
      })
      showShape(item.id)
    }
    // Always recenter the map on the clicked item, even on re-click.
    onItemActivate?.(item)
  }

  // Maritime Briefing groups the curated feed into Ships and Ports sections.
  const briefingShips = forYouItems.filter((item) => item.kind === 'ship')
  const briefingPorts = forYouItems.filter((item) => item.kind === 'port')
  // Shapes are hidden in the briefing for now (product hasn't decided on them).
  // const briefingShapes = forYouItems.filter((item) => item.kind === 'shape')
  const briefingStats = (
    BRIEFING_OVERVIEW_STATS[briefingRange] || BRIEFING_OVERVIEW_STATS.yesterday
  ).filter((stat) => overviewMetrics[stat.key])

  // Apply the Ships criteria: keep a ship only if its trigger type is enabled
  // and (optionally) it's one the user follows.
  const shipTypeEnabled = (type) => {
    if (type === 'dark') return shipFilters.dark
    if (type === 'spoofing') return shipFilters.spoofing
    if (type === 'sts' || type === 'sts-ais') return shipFilters.sts
    return true
  }
  const visibleBriefingShips = briefingShips.filter(
    (item) =>
      shipTypeEnabled(item.detectionType) &&
      (!shipFilters.onlyFollowed || favoriteShipIds.includes(item.shipId))
  )

  // Ports carry no explicit trigger field, so derive one from the reason copy:
  // anything mentioning vessels is treated as a "vessels of interest" trigger,
  // otherwise it's "elevated activity".
  const portTrigger = (item) =>
    /vessel/i.test(item.reason || '') ? 'vesselsOfInterest' : 'elevated'
  const visibleBriefingPorts = briefingPorts.filter((item) => {
    const trigger = portTrigger(item)
    const triggerEnabled =
      trigger === 'vesselsOfInterest'
        ? portFilters.vesselsOfInterest
        : portFilters.elevated
    return (
      triggerEnabled &&
      (!portFilters.onlyFollowed ||
        favoritePorts.some((port) => port.id === item.portId))
    )
  })

  // Reshape the curated feed items into the row shape the shared table/card
  // views expect. `id` matches the active-tab id so a row can highlight, while
  // `itemId` keeps the original feed id used for dismissal.
  const briefingShipRows = visibleBriefingShips.map((item) => {
    const ship = ships[item.shipId]
    return {
      ...item,
      id: item.shipId,
      itemId: item.id,
      name: item.name,
      flag: ship?.flag || item.flag || '',
      type: ship?.shipType || item.subtitle || 'No info',
      port: ship?.aisInfo?.destination || 'No info',
    }
  })
  // Dashboards surface only when one of their topics is still enabled.
  const visibleBriefingDashboards = BRIEFING_DASHBOARDS.filter((dash) =>
    (dash.topics || []).some((topic) => dashboardFilters[topic])
  )

  const briefingPortRows = visibleBriefingPorts.map((item) => ({
    ...item,
    id: item.portId,
    itemId: item.id,
    name: item.name,
    country: BRIEFING_PORT_COUNTRY[item.portId] || 'No info',
    activity: 'No info',
    risk: 'Monitoring',
    updatedAt: 'Just now',
  }))
  // const briefingShapeRows = briefingShapes.map((item) => ({
  //   ...item,
  //   id: item.id,
  //   itemId: item.id,
  //   name: item.name,
  // }))

  // Sliders affordance next to each section header. When an onToggle is given,
  // it opens/closes that section's filter popover.
  const renderCustomizeButton = (label, onToggle, isOpen = false) => (
    <Tooltip label={`Customize ${label}`} {...TOOLTIP_PROPS}>
      <Box
        component="button"
        type="button"
        aria-label={`Customize ${label}`}
        aria-pressed={isOpen}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onToggle?.()
        }}
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 4,
          border: 'none',
          background: isOpen ? '#006CD7' : 'transparent',
          color: isOpen ? '#FFFFFF' : '#A4ABBE',
          cursor: 'pointer',
        }}
      >
        <Sliders04 width={16} height={16} />
      </Box>
    </Tooltip>
  )

  const renderCheckRow = (checked, onToggle, label) => (
    <Box
      component="button"
      type="button"
      role="checkbox"
      aria-checked={checked}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: '6px 0',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <Box
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: 4,
          border: `1px solid ${checked ? '#006CD7' : '#4C5070'}`,
          background: checked ? '#006CD7' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5L5 9L9.5 3.5"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Box>
      <Text style={{ color: '#D7DAE2', fontSize: 12 }}>{label}</Text>
    </Box>
  )

  const renderFilterPopover = (sectionKey) => {
    if (openFilter !== sectionKey) return null
    const isShips = sectionKey === 'ships'
    const groupLabelStyle = {
      color: '#8D93A8',
      fontSize: 11,
      fontWeight: 600,
      margin: '4px 0 2px',
    }
    if (sectionKey === 'overview') {
      return (
        <Box
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 250,
            background: '#1E2033',
            border: '1px solid #393C56',
            borderRadius: 8,
            padding: 12,
            zIndex: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}>
            Overview metrics
          </Text>
          <Text style={{ color: '#888F9E', fontSize: 11, marginBottom: 6 }}>
            Choose which detection counts appear here.
          </Text>
          {BRIEFING_OVERVIEW_METRICS.map((metric) =>
            renderCheckRow(
              overviewMetrics[metric.key],
              () => toggleOverviewMetric(metric.key),
              metric.label
            )
          )}
          <Box style={{ height: 1, background: '#2D3047', margin: '8px 0' }} />
          <Text style={groupLabelStyle}>Map markers</Text>
          {renderCheckRow(
            allBriefingMarkersOn,
            toggleAllBriefingMarkers,
            'All markers'
          )}
        </Box>
      )
    }
    if (sectionKey === 'dashboards') {
      return (
        <Box
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 250,
            background: '#1E2033',
            border: '1px solid #393C56',
            borderRadius: 8,
            padding: 12,
            zIndex: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}>
            Dashboard topics
          </Text>
          <Text style={{ color: '#888F9E', fontSize: 11, marginBottom: 6 }}>
            Choose which dashboards surface here.
          </Text>
          {BRIEFING_DASHBOARD_TOPICS.map((topic) =>
            renderCheckRow(
              dashboardFilters[topic.key],
              () => toggleDashboardFilter(topic.key),
              topic.label
            )
          )}
        </Box>
      )
    }
    if (sectionKey === 'shapes') {
      return (
        <Box
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 250,
            background: '#1E2033',
            border: '1px solid #393C56',
            borderRadius: 8,
            padding: 12,
            zIndex: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}>
            Area criteria
          </Text>
          <Text style={{ color: '#888F9E', fontSize: 11, marginBottom: 6 }}>
            Choose what surfaces areas in this section.
          </Text>
          <Text style={groupLabelStyle}>Map markers</Text>
          {renderCheckRow(
            briefingMarkerKinds.shape,
            () => toggleBriefingMarkerKind('shape'),
            'Show area markers'
          )}
        </Box>
      )
    }
    return (
      <Box
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          width: 250,
          background: '#1E2033',
          border: '1px solid #393C56',
          borderRadius: 8,
          padding: 12,
          zIndex: 30,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}>
          {isShips ? 'Ship criteria' : 'Port criteria'}
        </Text>
        <Text style={{ color: '#888F9E', fontSize: 11, marginBottom: 6 }}>
          Choose what surfaces {isShips ? 'ships' : 'ports'} in this section.
        </Text>
        <Text style={groupLabelStyle}>Trigger types</Text>
        {isShips ? (
          <>
            {renderCheckRow(
              shipFilters.dark,
              () => toggleShipFilter('dark'),
              'Dark activity'
            )}
            {renderCheckRow(
              shipFilters.spoofing,
              () => toggleShipFilter('spoofing'),
              'AIS spoofing'
            )}
            {renderCheckRow(
              shipFilters.sts,
              () => toggleShipFilter('sts'),
              'STS transfer'
            )}
          </>
        ) : (
          <>
            {renderCheckRow(
              portFilters.elevated,
              () => togglePortFilter('elevated'),
              'Elevated activity'
            )}
            {renderCheckRow(
              portFilters.vesselsOfInterest,
              () => togglePortFilter('vesselsOfInterest'),
              'Vessels of interest'
            )}
          </>
        )}
        <Box style={{ height: 1, background: '#2D3047', margin: '8px 0' }} />
        <Text style={groupLabelStyle}>Relevance</Text>
        {isShips
          ? renderCheckRow(
              shipFilters.onlyFollowed,
              () => toggleShipFilter('onlyFollowed'),
              'Only vessels I follow'
            )
          : renderCheckRow(
              portFilters.onlyFollowed,
              () => togglePortFilter('onlyFollowed'),
              'Only ports I follow'
            )}
        <Box style={{ height: 1, background: '#2D3047', margin: '8px 0' }} />
        <Text style={groupLabelStyle}>Map markers</Text>
        {isShips
          ? renderCheckRow(
              briefingMarkerKinds.ship,
              () => toggleBriefingMarkerKind('ship'),
              'Show ship markers'
            )
          : renderCheckRow(
              briefingMarkerKinds.port,
              () => toggleBriefingMarkerKind('port'),
              'Show port markers'
            )}
      </Box>
    )
  }

  const renderDashboardRow = (dash) => {
    const isHovered = hoveredItemId === dash.id
    return (
      <Box
        key={dash.id}
        onClick={() =>
          window.open(dash.url, '_blank', 'noopener,noreferrer')
        }
        onMouseEnter={() => setHoveredItemId(dash.id)}
        onMouseLeave={() => setHoveredItemId(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 8,
          borderRadius: 4,
          border: `1px solid ${isHovered ? '#006CD7' : '#393C56'}`,
          background: isHovered
            ? 'linear-gradient(0deg, rgba(0,108,215,0.16), rgba(0,108,215,0.16)), #24263C'
            : '#24263C',
          cursor: 'pointer',
          transition: 'background 140ms ease, border-color 140ms ease',
        }}
      >
        <Box
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 4,
            background: '#181926',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BarChartSquare02 width={18} height={18} color="#FFFFFF" />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {dash.name}
          </Text>
          <Text
            style={{
              color: '#A4ABBE',
              fontSize: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {dash.description}
          </Text>
        </Box>
        <LinkExternal01
          width={15}
          height={15}
          color={isHovered ? '#FFFFFF' : '#6C7392'}
          style={{ flexShrink: 0 }}
        />
      </Box>
    )
  }

  // Compact segmented control that lives next to the Maritime Briefing title.
  const renderBriefingViewToggle = () => (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
      }}
    >
      {[
        { id: 'cards', label: 'Card view', Icon: Grid01 },
        { id: 'table', label: 'Table view', Icon: List },
      ].map(({ id, label, Icon }) => {
        const isActive = briefingViewMode === id
        return (
          <Tooltip key={id} label={label} {...TOOLTIP_PROPS}>
            <Box
              component="button"
              type="button"
              aria-label={label}
              aria-pressed={isActive}
              onClick={() => setBriefingViewMode(id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                border: 'none',
                borderRadius: 4,
                background: isActive ? '#006CD7' : 'transparent',
                color: isActive ? '#FFFFFF' : '#A4ABBE',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 120ms ease, color 120ms ease',
              }}
            >
              <Icon size={14} color="currentColor" />
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )

  const renderBriefingSection = (sectionKey, title, rows, totalCount, kind) => {
    const emptyLabel =
      totalCount > 0
        ? `No ${title.toLowerCase()} match these filters.`
        : `No ${title.toLowerCase()} need attention.`
    // When this kind's markers are toggled off, each row exposes an eye control
    // to re-enable individual markers on the map.
    const markerKindOff =
      kind === 'port'
        ? !briefingMarkerKinds.port
        : kind === 'shape'
          ? !briefingMarkerKinds.shape
          : !briefingMarkerKinds.ship
    // Briefing tables lead with identity, then the "why surfaced" description.
    const columns =
      kind === 'port'
        ? [
            { key: 'name', label: 'Port', width: 'minmax(0, 1fr)' },
            { key: 'reason', label: 'Why flagged', width: 'minmax(0, 1.8fr)' },
          ]
        : kind === 'shape'
          ? [
              { key: 'name', label: 'Shape', width: 'minmax(0, 1fr)' },
              {
                key: 'reason',
                label: 'Why flagged',
                width: 'minmax(0, 1.8fr)',
              },
            ]
          : [
              { key: 'name', label: 'Name', width: 'minmax(0, 1fr)' },
              { key: 'flag', label: 'Flag', width: '52px', align: 'left' },
              {
                key: 'reason',
                label: 'Why flagged',
                width: 'minmax(0, 1.8fr)',
              },
            ]
    return (
      <Box style={{ marginTop: 24 }}>
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {kind === 'port' ? (
              <Box
                component="img"
                src={AnchorIcon}
                alt=""
                style={{ width: 16, height: 16, display: 'block' }}
              />
            ) : kind === 'shape' ? (
              <PolygonIcon style={{ width: 16, height: 16 }} />
            ) : (
              <ShipIcon style={{ width: 16, height: 16 }} />
            )}
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>
              {title}: {rows.length}
            </Text>
          </Box>
          {renderCustomizeButton(
            title,
            () =>
              setOpenFilter((prev) =>
                prev === sectionKey ? null : sectionKey
              ),
            openFilter === sectionKey
          )}
          {renderFilterPopover(sectionKey)}
        </Box>
        {briefingViewMode === 'cards' ? (
          <BookmarkCardList
            rows={rows}
            kind={kind}
            emptyMessage={emptyLabel}
            onRowClick={handleRowClick}
            activeRowId={activeShipTab}
            secondaryText={(row) => row.reason}
            isFavorite={(row) => isBookmarked(row)}
            onToggleFavorite={(row) => handleBookmarkToggle(row)}
            isMarkerOn={
              markerKindOff
                ? (row) => briefingMarkerItemIds.includes(row.itemId)
                : undefined
            }
            onToggleMarker={
              markerKindOff
                ? (row) => toggleBriefingMarkerItem(row.itemId)
                : undefined
            }
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            emptyMessage={emptyLabel}
            onRowClick={handleRowClick}
            activeRowId={activeShipTab}
            isFavorite={(row) => isBookmarked(row)}
            onToggleFavorite={(row) => handleBookmarkToggle(row)}
            isMarkerOn={
              markerKindOff
                ? (row) => briefingMarkerItemIds.includes(row.itemId)
                : undefined
            }
            onToggleMarker={
              markerKindOff
                ? (row) => toggleBriefingMarkerItem(row.itemId)
                : undefined
            }
          />
        )}
      </Box>
    )
  }

  const renderBriefing = () => (
    <Box
      className="no-scrollbar"
      style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 700 }}>
          Maritime Briefing
        </Text>
        {renderBriefingViewToggle()}
      </Box>
      <Text
        style={{
          color: '#888F9E',
          fontSize: 12,
          lineHeight: '18px',
          marginTop: 8,
        }}
      >
        We highlight vessels, ports, and developments that may need attention.
        Start with our recommended priorities or customize your own criteria.
      </Text>

      <Box style={{ marginTop: 24 }}>
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>
            Overview
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box style={{ position: 'relative', display: 'inline-flex' }}>
              <Box
                component="select"
                value={briefingRange}
                onChange={(event) =>
                  setBriefingRange(event.currentTarget.value)
                }
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  height: 28,
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 12,
                  padding: '0 20px 0 0',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {BRIEFING_RANGE_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    style={{ background: '#24263C' }}
                  >
                    {opt.label}
                  </option>
                ))}
              </Box>
              <ChevronDown
                width={14}
                height={14}
                color="#FFFFFF"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
            {renderCustomizeButton(
              'Overview',
              () =>
                setOpenFilter((prev) =>
                  prev === 'overview' ? null : 'overview'
                ),
              openFilter === 'overview'
            )}
          </Box>
          {renderFilterPopover('overview')}
        </Box>
        {briefingStats.length === 0 ? (
          <Text style={{ color: '#888F9E', fontSize: 12 }}>
            No metrics selected.
          </Text>
        ) : (
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {briefingStats.map((stat) => (
              <Box
                key={stat.label}
                style={{
                  flex: '1 1 calc(33.333% - 3px)',
                  minWidth: 90,
                  background: '#24263C',
                  border: '1px solid #393C56',
                  borderRadius: 6,
                  padding: '10px 12px',
                }}
              >
                <Box
                  style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 22,
                      fontWeight: 700,
                      lineHeight: 1.1,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{ color: '#1CC86B', fontSize: 12, fontWeight: 600 }}
                  >
                    {stat.delta}
                  </Text>
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  <Box
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.label === 'STS' ? (
                      <STSDefaultIcon style={{ width: 13, height: 13 }} />
                    ) : (
                      BRIEFING_STAT_ICONS[stat.label] && (
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: BRIEFING_STAT_ICONS[stat.label],
                          }}
                        />
                      )
                    )}
                  </Box>
                  <Text style={{ color: '#A4ABBE', fontSize: 12 }}>
                    {stat.label}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {renderBriefingSection(
        'ships',
        'Ships',
        briefingShipRows,
        briefingShips.length,
        'ship'
      )}
      {renderBriefingSection(
        'ports',
        'Ports',
        briefingPortRows,
        briefingPorts.length,
        'port'
      )}
      {/* Shapes section hidden for now — product hasn't decided on it.
      {renderBriefingSection(
        'shapes',
        'Shapes',
        briefingShapeRows,
        briefingShapes.length,
        'shape'
      )} */}

      <Box style={{ marginTop: 24 }}>
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChartSquare02 width={16} height={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>
              Dashboards: {visibleBriefingDashboards.length}
            </Text>
          </Box>
          {renderCustomizeButton(
            'Dashboards',
            () =>
              setOpenFilter((prev) =>
                prev === 'dashboards' ? null : 'dashboards'
              ),
            openFilter === 'dashboards'
          )}
          {renderFilterPopover('dashboards')}
        </Box>
        {briefingViewMode === 'cards' ? (
          visibleBriefingDashboards.length === 0 ? (
            <Text style={{ color: '#888F9E', fontSize: 12 }}>
              {BRIEFING_DASHBOARDS.length === 0
                ? 'No dashboards available.'
                : 'No dashboards match these filters.'}
            </Text>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {visibleBriefingDashboards.map((dash) =>
                renderDashboardRow(dash)
              )}
            </Box>
          )
        ) : (
          <DataTable
            rows={visibleBriefingDashboards.map((dash) => ({
              id: dash.id,
              name: dash.name,
              description: dash.description,
              updated: dash.updated,
              url: dash.url,
            }))}
            columns={[
              { key: 'name', label: 'Dashboard', width: 'minmax(0, 1fr)' },
              { key: 'description', label: 'About', width: 'minmax(0, 1.6fr)' },
              { key: 'updated', label: 'Updated', width: 'minmax(0, 0.8fr)' },
            ]}
            emptyMessage={
              BRIEFING_DASHBOARDS.length === 0
                ? 'No dashboards available.'
                : 'No dashboards match these filters.'
            }
            onRowClick={(row) =>
              window.open(row.url, '_blank', 'noopener,noreferrer')
            }
          />
        )}
      </Box>
    </Box>
  )

  return (
    <Box
      style={{
        height: '100%',
        width: isOpen && isForYouView ? navWidth : isForYouView ? 32 : 0,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: isResizing ? 'none' : 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isForYouView ? '1px solid #393c56' : 'none',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && isForYouView && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 12,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ExpandButton
            backgroundColor={expandHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      {isOpen && isForYouView && (
        <Box
          onClick={onClose}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 12,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <CollapseButton
            backgroundColor={collapseHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      <Box
        style={{
          width: navWidth,
          minWidth: navWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderBottom: '1px solid #393C56',
            height: 50,
            padding: '0 20px',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 14 }}>
            {isBriefing ? 'Maritime Briefing' : 'For You'}
          </Text>
        </Box>

        {isBriefing ? (
          renderBriefing()
        ) : (
          <>
            <Box
              style={{
                padding: '12px 20px 8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <Text
                style={{
                  color: '#888F9E',
                  fontSize: 12,
                  lineHeight: '16px',
                  flex: 1,
                }}
              >
                Tailored to you from what you follow and view. Dismiss anything
                that isn&apos;t relevant.
              </Text>
              {showRingCustomizer && (
                <Box
                  component="button"
                  type="button"
                  aria-label="Ring style settings"
                  aria-pressed={showRingSettings}
                  onClick={() => setShowRingSettings((prev) => !prev)}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: showRingSettings ? 'none' : '1px solid #FFFFFF',
                    cursor: 'pointer',
                    background: showRingSettings ? '#006CD7' : 'transparent',
                    color: '#FFFFFF',
                  }}
                >
                  <Settings04 width={16} height={16} />
                </Box>
              )}
            </Box>

            <Box style={{ padding: '4px 20px 8px' }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  background: '#24263C',
                  border: '1px solid #393C56',
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                <Box style={{ minWidth: 0 }}>
                  <Text
                    style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}
                  >
                    Show markers on map
                  </Text>
                  <Text style={{ color: '#888F9E', fontSize: 11 }}>
                    {markersVisible
                      ? 'Turn off to choose markers individually.'
                      : 'Check items below to show them on the map.'}
                  </Text>
                </Box>
                <Box
                  component="button"
                  type="button"
                  role="switch"
                  aria-checked={markersVisible}
                  aria-label="Show markers on map"
                  onClick={() => onMarkersVisibleChange?.(!markersVisible)}
                  style={{
                    flexShrink: 0,
                    position: 'relative',
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    background: markersVisible ? '#006CD7' : '#393C56',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Box
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: markersVisible ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transition: 'left 0.15s ease',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {showRingCustomizer && showRingSettings && (
              <Box style={{ padding: '4px 20px 8px' }}>
                <Box
                  style={{
                    background: '#24263C',
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    padding: 8,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {(() => {
                        const dim = Math.min(ringSize, 40)
                        const center = dim / 2
                        const bw = ring.borderWidth ?? 2
                        return (
                          <svg
                            width={dim}
                            height={dim}
                            viewBox={`0 0 ${dim} ${dim}`}
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx={center}
                              cy={center}
                              r={Math.max(0, center - bw)}
                              fill={ring.color}
                              fillOpacity={ring.fillOpacity ?? 0}
                              stroke={ring.color}
                              strokeWidth={bw}
                              strokeDasharray={
                                ring.lineStyle === 'dashed' ? '5 4' : undefined
                              }
                            />
                          </svg>
                        )
                      })()}
                    </Box>
                    <Box>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Ring style
                      </Text>
                      <Text style={{ color: '#888F9E', fontSize: 11 }}>
                        Customize how curated items appear on the map.
                      </Text>
                    </Box>
                  </Box>

                  <Text
                    style={{
                      color: '#8D93A8',
                      fontSize: 11,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Color
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    {RING_SWATCHES.map((swatch) => {
                      const isActive =
                        String(ring.color).toLowerCase() ===
                        swatch.toLowerCase()
                      return (
                        <Box
                          key={swatch}
                          component="button"
                          type="button"
                          title={swatch}
                          aria-label={swatch}
                          onClick={() => updateRing({ color: swatch })}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: swatch,
                            cursor: 'pointer',
                            padding: 0,
                            border: isActive
                              ? '2px solid #FFFFFF'
                              : '2px solid #393C56',
                            boxShadow: isActive ? '0 0 0 1px #006CD7' : 'none',
                          }}
                        />
                      )
                    })}
                    <Box
                      component="input"
                      type="color"
                      value={ring.color}
                      onChange={(event) =>
                        updateRing({ color: event.currentTarget.value })
                      }
                      title="Custom color"
                      style={{
                        width: 22,
                        height: 22,
                        padding: 0,
                        border: '1px solid #393C56',
                        borderRadius: 4,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    />
                  </Box>

                  <Text
                    style={{
                      color: '#8D93A8',
                      fontSize: 11,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Line
                  </Text>
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      borderRadius: 6,
                      background: '#0A0E19',
                      padding: 2,
                      marginBottom: 12,
                    }}
                  >
                    {[
                      { id: 'solid', label: 'Solid' },
                      { id: 'dashed', label: 'Dashed' },
                    ].map(({ id, label }) => {
                      const isActive = ring.lineStyle === id
                      return (
                        <Box
                          key={id}
                          component="button"
                          type="button"
                          onClick={() => updateRing({ lineStyle: id })}
                          style={{
                            border: 'none',
                            borderRadius: 4,
                            background: isActive ? '#006CD7' : 'transparent',
                            color: isActive ? '#FFFFFF' : '#A4ABBE',
                            fontSize: 12,
                            fontWeight: 500,
                            padding: '4px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          {label}
                        </Box>
                      )
                    })}
                  </Box>

                  <Box style={{ marginBottom: 12 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: '#8D93A8',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Size
                      </Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 11 }}>
                        {ringSize}px
                      </Text>
                    </Box>
                    <Slider
                      value={ringSize}
                      onChange={(v) => updateRing({ size: v })}
                      min={RING_SIZE_MIN}
                      max={RING_SIZE_MAX}
                      step={1}
                      label={null}
                      size="sm"
                      thumbSize={16}
                      styles={RING_SLIDER_STYLES}
                    />
                  </Box>

                  <Box style={{ marginBottom: 12 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: '#8D93A8',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Border width
                      </Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 11 }}>
                        {ring.borderWidth ?? 2}px
                      </Text>
                    </Box>
                    <Slider
                      value={ring.borderWidth ?? 2}
                      onChange={(v) => updateRing({ borderWidth: v })}
                      min={1}
                      max={6}
                      step={0.5}
                      label={null}
                      size="sm"
                      thumbSize={16}
                      styles={RING_SLIDER_STYLES}
                    />
                  </Box>

                  <Box>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: '#8D93A8',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Fill opacity
                      </Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 11 }}>
                        {Math.round((ring.fillOpacity ?? 0) * 100)}%
                      </Text>
                    </Box>
                    <Slider
                      value={Math.round((ring.fillOpacity ?? 0) * 100)}
                      onChange={(v) => updateRing({ fillOpacity: v / 100 })}
                      min={0}
                      max={100}
                      label={null}
                      size="sm"
                      thumbSize={16}
                      styles={RING_SLIDER_STYLES}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            <Box
              className="no-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '4px 20px 16px',
              }}
            >
              {forYouItems.length === 0 ? (
                <Box style={{ padding: '24px 8px', textAlign: 'center' }}>
                  <Text style={{ color: '#888F9E', fontSize: 13 }}>
                    You&apos;re all caught up.
                  </Text>
                </Box>
              ) : (
                forYouItems.map((item) => {
                  const bookmarked = isBookmarked(item)
                  const clickable =
                    item.kind === 'ship' ||
                    item.kind === 'port' ||
                    item.kind === 'shape'
                  const isActive =
                    (item.kind === 'ship' && activeShipTab === item.shipId) ||
                    (item.kind === 'port' && activeShipTab === item.portId) ||
                    (item.kind === 'shape' &&
                      (visibleShapeIds || []).includes(item.id))
                  const isHovered = clickable && hoveredItemId === item.id
                  return (
                    <Box
                      key={item.id}
                      onClick={
                        clickable ? () => handleRowClick(item) : undefined
                      }
                      onMouseEnter={
                        clickable ? () => setHoveredItemId(item.id) : undefined
                      }
                      onMouseLeave={
                        clickable ? () => setHoveredItemId(null) : undefined
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: 8,
                        background: isActive
                          ? 'linear-gradient(0deg, rgba(0,108,215,0.16), rgba(0,108,215,0.16)), #24263C'
                          : isHovered
                            ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                            : '#24263C',
                        border: `1px solid ${
                          isActive || isHovered ? '#006CD7' : '#393C56'
                        }`,
                        borderRadius: 4,
                        marginBottom: 4,
                        cursor: clickable ? 'pointer' : 'default',
                      }}
                    >
                      <Box
                        style={{
                          position: 'relative',
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          borderRadius: 4,
                          background: '#181926',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.kind === 'ship' && (
                          <ShipIcon style={{ width: 18, height: 18 }} />
                        )}
                        {item.kind === 'port' && (
                          <Anchor
                            style={{ width: 18, height: 18, color: '#fff' }}
                          />
                        )}
                        {item.kind === 'shape' && (
                          <PolygonIcon style={{ width: 18, height: 18 }} />
                        )}
                        {item.kind === 'ship' && (
                          <Box
                            style={{
                              position: 'absolute',
                              top: -3,
                              right: -3,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: item.color,
                              border: '2px solid #24263C',
                            }}
                          />
                        )}
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              flex: 1,
                              minWidth: 0,
                              color: '#FFFFFF',
                              fontSize: 13,
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                            {item.flag ? ` ${item.flag}` : ''}
                          </Text>
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              flexShrink: 0,
                            }}
                          >
                            {showItemCheckboxes && (
                              <Tooltip
                                label={
                                  isMarkerShown(item)
                                    ? 'Hide marker on map'
                                    : 'Show marker on map'
                                }
                                {...TOOLTIP_PROPS}
                              >
                                <Box
                                  component="button"
                                  type="button"
                                  role="switch"
                                  aria-checked={isMarkerShown(item)}
                                  aria-label={
                                    isMarkerShown(item)
                                      ? `Hide ${item.name} on map`
                                      : `Show ${item.name} on map`
                                  }
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    toggleItemMarker(item)
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 22,
                                    height: 18,
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                >
                                  {isMarkerShown(item) ? (
                                    <Eye size={15} color="#006CD7" />
                                  ) : (
                                    <EyeOff size={15} color="#888F9E" />
                                  )}
                                </Box>
                              </Tooltip>
                            )}
                            <Tooltip
                              label={
                                bookmarked
                                  ? saveVariant.removeLabel
                                  : saveVariant.addLabel
                              }
                              {...TOOLTIP_PROPS}
                            >
                              <Box
                                component="button"
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleBookmarkToggle(item)
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 22,
                                  height: 18,
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                <SaveIcon
                                  size={15}
                                  color={
                                    bookmarked
                                      ? saveVariant.activeColor
                                      : '#888F9E'
                                  }
                                  style={
                                    bookmarked
                                      ? { fill: saveVariant.activeColor }
                                      : undefined
                                  }
                                />
                              </Box>
                            </Tooltip>
                            <Tooltip label="Dismiss" {...TOOLTIP_PROPS}>
                              <Box
                                component="button"
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  dismissForYouItem(item.id)
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 22,
                                  height: 18,
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                <Trash01 size={15} color="#888F9E" />
                              </Box>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Text
                          style={{
                            color: '#888F9E',
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {item.reason}
                        </Text>
                      </Box>
                    </Box>
                  )
                })
              )}
            </Box>
          </>
        )}
      </Box>

      {isOpen && isForYouView && (
        <Box
          onMouseDown={(event) => {
            if (event.button !== 0) return
            resizeStartXRef.current = event.clientX
            resizeStartWidthRef.current = navWidth
            setIsResizing(true)
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 8,
            height: '100%',
            cursor: 'ew-resize',
            zIndex: 9,
          }}
        />
      )}
    </Box>
  )
}

export default ForYouSecondaryNav
