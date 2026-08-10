import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  Box,
  Text,
  Title,
  Loader,
  Menu,
  Tooltip,
  Checkbox,
  Modal,
  Button,
  Accordion,
  Select,
  Switch,
} from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import {
  Star01,
  Bookmark,
  Copy02,
  XClose,
  ChevronDown,
  ChevronRight,
  List,
  MarkerPin01,
  Anchor,
  Minus,
  Browser,
  SwitchVertical01,
  ArrowNarrowUp,
  ArrowNarrowDown,
  SearchMd,
} from '@untitledui/icons'
import AlertIcon from '../custom-icons/AlertIcon'
import SatelliteIcon from '../custom-icons/SatelliteIcon'
import ShipPathPanelButton from '../components/ShipDetails/ShipPathPanelButton'
import AisIcon from '../custom-icons/AisIcon'
import LightShipIcon from '../custom-icons/LighShipIcon'
import DarkShipIcon from '../custom-icons/DarkShipIcon'
import UnattributedIcon from '../custom-icons/UnattributedIcon'
import SpoofingIcon from '../custom-icons/SpoofingIcon'
import STSIcon from '../custom-icons/STSIcon'
import STSAisIcon from '../custom-icons/STSAisIcon'
import StsV20Icon from '../custom-icons/StsV20Icon'
import ShipIcon from '../custom-icons/ShipIcon'
import EnlargeVerticalIcon from '../custom-icons/EnlargeVerticalIcon'
import TransferIcon from '../custom-icons/TransferIcon.svg'
import CollapseButton from '../custom-icons/CollapseButton'
import ShipDetailsPanel from '../components/ShipDetails/ShipDetailsPanel'
import EventTimelineCard, {
  EventToolsIcon,
} from '../components/ShipDetails/EventTimelineCard'
import ExtendedPathPanel from '../components/ExtendedPathPanel'
import FuturePathPanel from '../components/FuturePathPanel'
import EstimatedLocationPanel from '../components/EstimatedLocationPanel'
import SanctionDetailsVersionB from '../components/SanctionDetailsVersionB'
import { useShipContext } from '../context/ShipContext'
import { ships } from '../data/mockData'
import { buildExpectedArrivals } from '../data/mockExpectedArrivals'
import { resolvePortCoords } from '../data/portCoords'
import {
  formatDistanceNm,
  formatDuration,
  formatEta,
  computeEta,
  haversineNm,
  PATH_TO_PORT_SPEEDS,
  resolveShipSpeedKn,
} from '../utils/pathToPort'
import satImageA from '../assets/HAfSz3HbAAA34GM.jpeg'
import satImageB from '../assets/Baniyas_27-July-2021_WV2_single-ship.jpg'
import satImageC from '../assets/b7305b3c008782765e2f14920270f2e7834f0f17.jpg'
import satImageD from '../assets/e92d7378215156c8a7c8c4c73d773963c71bd6b1-1920x1080.avif'
import satRaft2 from '../assets/sts_raft_2.png'
import satRaft3 from '../assets/sts_raft_3.png'
import satRaft4 from '../assets/sts_raft_4.png'
import satRaft5 from '../assets/sts_raft_5.png'
import satRaft6 from '../assets/sts_raft_6.png'
import satRaftOcean from '../assets/sts_raft_ocean.png'
import sanctionedTitle from '../assets/SanctionedTitle.svg'

const baseDetailTabs = [
  'Event Timeline',
  'Imagery Timeline',
  'Ship Information',
]
const tiffaniDetailTabs = [...baseDetailTabs, 'Sanctions Details']
const SANCTION_TITLE_VARIANT_OPTIONS = [
  { value: 'info', label: 'Version 1' },
  { value: 'profile', label: 'Version 2' },
  { value: 'records', label: 'Version 3' },
]
const GO_TO_DATE_WARNING_PREF_KEY = 'myships.skipGoToDateWarning'
const GO_TO_DATE_CONFIRM_DELAY_MS = 420
const GO_TO_DATE_MODAL_TRANSITION_MS = 220
const TIMELINE_MIN_HEIGHT = 260
const NEW_LAST_KNOWN_DOT_DELAY_MS = 20_000
const NEW_LAST_KNOWN_DOT_FLASH_MS = 700
const TIMELINE_TIME_FILTER_OPTIONS = [
  { value: 'all', label: 'Max Time' },
  { value: '6m', label: '6 Months' },
  { value: '3m', label: '3 Months' },
  { value: '1m', label: '1 Month' },
]
const TIMELINE_EVENT_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Event Types' },
  { value: 'ship-to-ship', label: 'Ship-To-Ship' },
  { value: 'port-of-calls', label: 'Port of Calls' },
  { value: 'spoofing', label: 'Spoofing' },
  { value: 'ais-dark', label: 'AIS Dark' },
]
const SAT_TIMELINE_DATA_SOURCE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'sar', label: 'SAR' },
  { value: 'optical', label: 'Optical' },
]
const SAT_TIMELINE_DETECTION_TYPES = ['light', 'dark', 'spoofing', 'ais']
const STS_PREFERRED_SAT_TIMELINE_DETECTION_TYPES = ['light', 'dark', 'spoofing']
// Product's expected upper bound for a ship-to-ship transfer. Events with more
// vessels than this are still shown in full, but v18 flags them as suspect
// (the model may be wrong) while v19 treats them as a legitimate large raft.
const STS_MAX_VESSELS = 5
// Where a "Flag for review" (v18) notification is sent. Prototype only — swap
// this to an email address to demo the email destination instead of Slack.
const STS_REVIEW_DESTINATION = { kind: 'slack', target: '#maritime-sts-review' }
const getSatTimelineDataSource = (detectionType) =>
  detectionType === 'dark' ? 'sar' : 'optical'
const normalizeDetectionId = (id) => String(id)
const cycleTableSort = (current, key) => {
  if (current.key !== key) return { key, direction: 'asc' }
  if (current.direction === 'asc') return { key, direction: 'desc' }
  return { key: null, direction: null }
}
const sortTableRows = (rows, sort, valueByKey) => {
  if (!sort.key || !sort.direction) return rows
  const direction = sort.direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const aValue = valueByKey(a, sort.key)
    const bValue = valueByKey(b, sort.key)
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction
    }
    return String(aValue).localeCompare(String(bValue), undefined, {
      numeric: true,
      sensitivity: 'base',
    }) * direction
  })
}
const SortablePortTableHeader = ({ label, columnKey, sort, onSort }) => {
  const active = sort.key === columnKey
  const Icon = !active
    ? SwitchVertical01
    : sort.direction === 'asc'
      ? ArrowNarrowUp
      : ArrowNarrowDown
  return (
    <Box
      onClick={() => onSort(columnKey)}
      style={{
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: '#fff',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Text
        style={{
          color: 'inherit',
          fontSize: 12,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Text>
      <Icon size={12} color="#FFFFFF" style={{ flexShrink: 0 }} />
    </Box>
  )
}

// Deterministic mock UUID for prototype STS events: stable per seed (the event's
// tab id) so the "Event ID" stays constant across re-renders. Stands in for the
// backend's real bunkering-event UUID.
const seededEventUuid = (seed) => {
  const str = String(seed || 'sts-event')
  let x = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    x ^= str.charCodeAt(i)
    x = Math.imul(x, 16777619) >>> 0
  }
  const next = () => {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    return x >>> 0
  }
  let hex = ''
  while (hex.length < 32) hex += next().toString(16).padStart(8, '0')
  hex = hex.slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}
const formatPrototypeDetectionDate = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`
}
const parseFiniteNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
const getDetectionDateKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}
const getSatTimelineImageForDetection = (detection) => {
  if (['light', 'dark', 'spoofing'].includes(detection?.type)) return satImageB
  if (detection?.type === 'ais') return satImageA
  return satImageC
}

// Drag-to-resize the timeline is retired in favor of the collapse/expand
// button. Keep the code behind this flag for possible future re-enable.
const ENABLE_TIMELINE_DRAG = false
const SHIP_OWNERSHIP = {
  invictus: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'Gard',
    member: 'No Info',
  },
  tiffani: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'NorthStandard',
    member: 'KHALID FARAJ SHIPPING',
  },
  celestine: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'Skuld',
    member: 'No Info',
  },
  'meridian-star': {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'West of England',
    member: 'No Info',
  },
  'wisdom-star': {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'NorthStandard',
    member: 'KHALID FARAJ SHIPPING',
  },
  unknown: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'No Info',
    member: 'No Info',
  },
}

const TIMELINE_CONTEXT_EVENTS = {
  invictus: [
    {
      id: 'invictus-port-1',
      variant: 'port',
      dateLabel: 'Mar 11, 2026 15:10',
      sortDate: '2026-03-11T15:10:00Z',
      port: 'IMMINGHAM',
      status: 'Ongoing',
      duration: '0h 0m',
    },
    {
      id: 'invictus-flag-1',
      variant: 'flag',
      dateLabel: 'Mar 11, 2026 12:20',
      sortDate: '2026-03-11T12:20:00Z',
      newFlag: 'Turkey 🇹🇷',
      previousFlag: 'China 🇨🇳',
    },
  ],
  tiffani: [
    {
      id: 'tiffani-port-1',
      variant: 'port',
      dateLabel: 'Mar 12, 2026 18:00',
      sortDate: '2026-03-12T18:00:00Z',
      port: 'FUJAIRAH',
      status: 'Completed',
      duration: '16h 20m',
    },
    {
      id: 'tiffani-flag-1',
      variant: 'flag',
      dateLabel: 'Mar 12, 2026 15:10',
      sortDate: '2026-03-12T15:10:00Z',
      newFlag: 'Liberia 🇱🇷',
      previousFlag: 'Panama 🇵🇦',
    },
  ],
  'wisdom-star': [
    {
      id: 'wisdom-port-1',
      variant: 'port',
      dateLabel: 'Mar 11, 2026 10:10',
      sortDate: '2026-03-11T10:10:00Z',
      port: 'JEBEL ALI',
      status: 'Ongoing',
      duration: '8h 10m',
    },
    {
      id: 'wisdom-flag-1',
      variant: 'flag',
      dateLabel: 'Mar 11, 2026 08:50',
      sortDate: '2026-03-11T08:50:00Z',
      newFlag: 'Marshall Islands 🇲🇭',
      previousFlag: 'Palau 🇵🇼',
    },
  ],
}

function Myships() {
  const navigate = useNavigate()
  const {
    shipTabs,
    favoriteShipIds,
    favoritePorts,
    activeShipTab,
    setActiveShipTab,
    closeShipTab,
    closeAllTabs,
    openShipTab,
    openStsTab,
    selectDetection,
    selectedDetectionId,
    setSelectedDetectionId,
    setDetailPanelOpen,
    mapDate,
    setMapDate,
    activeDetectionId,
    setActiveDetectionId,
    setPreviewDetectionId,
    setPanelFocusDetectionId,
    shownOnMapDetectionIds,
    setShownOnMapDetectionIds,
    runtimeDetections,
    setRuntimeDetections,
    openMapToolPanelsByTab,
    toggleMapToolPanel,
    toggleFavoriteShip,
    toggleFavoritePort,
    activePortLevel,
    setActivePortLevel,
    selectedTerminal,
    setSelectedTerminal,
    selectedBerth,
    setSelectedBerth,
    pathToPortRoute,
    setPathToPortRoute,
    setPathToPortRoutes,
    pathToPortSpeed,
    setPathToPortSpeed,
    pathToPortSpeedsByShip,
    setPathToPortSpeedsByShip,
    arrivalsOverlayOn,
    setArrivalsOverlayOn,
    clearPathToPort,
    stsConnectorData,
    setStsConnectorData,
    setStsPeekDetectionId,
    stsSelectSignal,
  } = useShipContext()
  const [tabState, setTabState] = useState({})
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [activeStsShip, setActiveStsShip] = useState(0)
  // v17: which vessel the analyst is currently hovering on the segmented event
  // hero, so we can "spotlight" it (dim the rest, draw its mask edge + reticle,
  // and surface its mini clip card) per Seb's segmentation concepts.
  const [stsHeroHoverIdx, setStsHeroHoverIdx] = useState(null)
  // v17: whether the segmentation layer (hull outlines + hover spotlight + mini
  // clip card) is active. Toggled from the "SEGMENT FOCUS" chip on the hero and
  // remembered across sessions so an analyst's preference sticks.
  const [stsSegmentOn, setStsSegmentOn] = useState(() => {
    try {
      return localStorage.getItem('stsSegmentOn') !== '0'
    } catch {
      return true
    }
  })
  const toggleStsSegment = useCallback(() => {
    setStsSegmentOn((on) => {
      const next = !on
      try {
        localStorage.setItem('stsSegmentOn', next ? '1' : '0')
      } catch {
        /* ignore persistence failures (e.g. private mode) */
      }
      if (!next) setStsHeroHoverIdx(null)
      return next
    })
  }, [])
  // v4: whether the user has drilled from the transfer summary into a vessel.
  const [stsListDrilledIn, setStsListDrilledIn] = useState(false)
  // v2/v8: whether the STS event opens on the event overview (annotated
  // image + roster) rather than a single ship's detail.
  const [stsShowOverview, setStsShowOverview] = useState(true)
  // v20: the "ship-first" prototype opens an STS event on the vessel's own tab
  // and exposes the event Overview through a centered modal instead of a tab.
  const [stsOverviewModalOpen, setStsOverviewModalOpen] = useState(false)
  // v9 overview: toggle the "Vessels in event" section between the roster list
  // and an inline transfer-network graph.
  const [stsRosterView, setStsRosterView] = useState('list')
  // v18 ("Cap at 5"): whether the analyst has flagged an over-sized event for
  // review. Local prototype state; resets when the active STS tab changes.
  const [stsReviewFlagged, setStsReviewFlagged] = useState(false)
  // v7: the floating network panel — open state, anchor rect for the map area,
  // and its (draggable) position / (resizable) size.
  const [stsNetworkOpen, setStsNetworkOpen] = useState(true)
  const [stsNetworkRect, setStsNetworkRect] = useState(null)
  const [stsNetworkPos, setStsNetworkPos] = useState(null)
  const [stsNetworkSize, setStsNetworkSize] = useState({
    width: 560,
    height: 520,
  })
  const startNetworkDrag = useCallback(
    (e) => {
      e.preventDefault()
      const startX = e.clientX
      const startY = e.clientY
      const origin =
        stsNetworkPos ||
        (stsNetworkRect
          ? {
              x: Math.max(
                stsNetworkRect.left + 16,
                window.innerWidth - stsNetworkSize.width - 16
              ),
              y: stsNetworkRect.top + 16,
            }
          : { x: 100, y: 100 })
      const onMove = (ev) => {
        setStsNetworkPos({
          x: origin.x + (ev.clientX - startX),
          y: origin.y + (ev.clientY - startY),
        })
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [stsNetworkPos, stsNetworkRect]
  )
  const startNetworkResize = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      const orig = stsNetworkSize
      const onMove = (ev) => {
        setStsNetworkSize({
          width: Math.max(340, orig.width + (ev.clientX - startX)),
          height: Math.max(280, orig.height + (ev.clientY - startY)),
        })
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [stsNetworkSize]
  )
  // v2 & v8: edge fades that appear only when the tab strip can scroll that way.
  const stsStripScrollRef = useRef(null)
  const activeStsTabRef = useRef(null)
  const [stsStripFade, setStsStripFade] = useState({
    left: false,
    right: false,
  })
  const updateStsStripFade = useCallback(() => {
    const el = stsStripScrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setStsStripFade({
      left: scrollLeft > 1,
      right: scrollLeft + clientWidth < scrollWidth - 1,
    })
  }, [])
  const [loading, setLoading] = useState(false)
  const [overflowLeft, setOverflowLeft] = useState(false)
  const [overflowRight, setOverflowRight] = useState(false)
  const [detailTabsOverflowLeft, setDetailTabsOverflowLeft] = useState(false)
  const [detailTabsOverflowRight, setDetailTabsOverflowRight] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)
  const [collapsePanelHovered, setCollapsePanelHovered] = useState(false)
  const [isResizingTimeline, setIsResizingTimeline] = useState(false)
  const [isDragHandleHovered, setIsDragHandleHovered] = useState(false)
  const [topSectionHeight, setTopSectionHeight] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [hoveredCopyField, setHoveredCopyField] = useState(null)
  const [hoveredSatelliteCardId, setHoveredSatelliteCardId] = useState(null)
  const [hoveredRosterId, setHoveredRosterId] = useState(null)
  const [selectedSatDetectionByTab, setSelectedSatDetectionByTab] = useState({})
  const [satSortByTab, setSatSortByTab] = useState({})
  const [timelineSortByTab, setTimelineSortByTab] = useState({})
  const [newLastKnownDotByShip, setNewLastKnownDotByShip] = useState({})
  const [pendingLastKnownDetectionByShip, setPendingLastKnownDetectionByShip] =
    useState({})
  const [isNewLastKnownDotFlashOn, setIsNewLastKnownDotFlashOn] = useState(true)
  const [isTopSummaryCollapsed, setIsTopSummaryCollapsed] = useState(false)
  const [hoveredTopAction, setHoveredTopAction] = useState(null)
  const [detailToolsVisible, setDetailToolsVisible] = useState(true)
  const [showGoToDateModal, setShowGoToDateModal] = useState(false)
  const [activePortTab, setActivePortTab] = useState('Ships In Port')
  const [shipsInPortSort, setShipsInPortSort] = useState({
    key: null,
    direction: null,
  })
  const [shipsInPortSearch, setShipsInPortSearch] = useState('')
  const [expectedArrivalsSort, setExpectedArrivalsSort] = useState({
    key: null,
    direction: null,
  })
  const [expectedArrivalsSearch, setExpectedArrivalsSearch] = useState('')
  const [portTabOverflowLeft, setPortTabOverflowLeft] = useState(false)
  const [portTabOverflowRight, setPortTabOverflowRight] = useState(false)
  const portTabScrollRef = useRef(null)
  const [eventToolsPoppedOut, setEventToolsPoppedOut] = useState(false)
  const [eventToolsMinimized, setEventToolsMinimized] = useState(false)
  const [v10OpenToolIds, setV10OpenToolIds] = useState([])
  const [v10CollapsedToolIds, setV10CollapsedToolIds] = useState([])
  const [eventToolsPanelPosition, setEventToolsPanelPosition] = useState(() => ({
    x:
      typeof window === 'undefined'
        ? 560
        : Math.max(520, window.innerWidth - 560),
    y: 120,
  }))
  const [eventToolsDragOffset, setEventToolsDragOffset] = useState(null)

  const {
    collapsePanel,
    openPanel,
    watchlistVersion,
    portsLayerVisible,
    onPortsLayerVisibleChange,
    portVisibilityBehavior,
    forceHideSelectedPortContext,
    onForceHideSelectedPortContextChange,
    portShapeControlEnabled = true,
    forYouPrototype = 'proto1',
    stsVersion: stsVersionRaw = 'v1',
    pathToPortVersion = 'v1',
    shipDetailsVersion = 'v1',
    onStsNetworkPanelChange,
  } = useOutletContext() || {}

  useEffect(() => {
    if (
      shipDetailsVersion !== 'v4' &&
      shipDetailsVersion !== 'v5' &&
      shipDetailsVersion !== 'v6' &&
      shipDetailsVersion !== 'v10'
    ) {
      setEventToolsPoppedOut(false)
      setEventToolsMinimized(false)
    }
  }, [shipDetailsVersion])

  useEffect(() => {
    if (!eventToolsDragOffset) return
    const handleMouseMove = (event) => {
      setEventToolsPanelPosition({
        x: Math.max(
          12,
          Math.min(
            event.clientX - eventToolsDragOffset.x,
            window.innerWidth - 512
          )
        ),
        y: Math.max(
          12,
          Math.min(
            event.clientY - eventToolsDragOffset.y,
            window.innerHeight - 80
          )
        ),
      })
    }
    const handleMouseUp = () => setEventToolsDragOffset(null)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [eventToolsDragOffset])

  // Two overflow-design explorations sit on top of the v17 layout:
  //   v18 = "Cap at 5"   — treat >5 vessels as suspect; show 5 + an anomaly banner.
  //   v19 = "Scale to N" — no cap; the raft view just grows to 6, 7, 8+ vessels.
  // Both inherit every v17 style branch by resolving to 'v17' here, so the only
  // thing that differs is the overflow mode we thread through separately.
  const stsOverflowMode =
    stsVersionRaw === 'v18' ? 'cap' : stsVersionRaw === 'v19' ? 'scale' : null
  const stsVersion = stsOverflowMode ? 'v17' : stsVersionRaw

  const activeTab = shipTabs.find((t) => t.id === activeShipTab)
  const isStsTab = activeTab?.type === 'sts'
  const isPortTab = activeTab?.type === 'port'
  // v20 "ship-first" STS: the active tab is a normal ship tab, but it carries
  // STS context (attached in openShipTab). We surface the involved-vessels
  // switcher + Overview modal beneath the tools card. This keys off the tab's
  // own STS context (set when it was opened) rather than the current version
  // dropdown, so switching versions never strands a v20-opened tab without its
  // STS controls. (Whether a NEW click opens a ship tab vs a classic STS tab is
  // still governed by stsVersion === 'v20' in selectDetection.)
  const isStsShipTab = !!activeTab?.stsEvent
  const stsEventShipIds = isStsShipTab
    ? (activeTab.stsShipIds || []).filter((sid) => ships[sid])
    : []

  // Path to Port: expected arrivals for the active port, with distance/ETA
  // derived at the currently selected speed. Recomputes when the port, speed, or
  // detections change.
  const expectedArrivalsData = useMemo(() => {
    if (!isPortTab) return { port: null, rows: [] }
    const result = buildExpectedArrivals({
      portTab: activeTab,
      ships,
      detections: runtimeDetections,
      speed: pathToPortSpeed,
    })
    if (pathToPortVersion !== 'v6') return result
    return {
      ...result,
      rows: result.rows.map((row) => {
        const speed =
          pathToPortSpeedsByShip[row.shipId] ??
          resolveShipSpeedKn(ships[row.shipId])
        const { hours, etaDate } = computeEta(row.distanceNm, speed)
        return { ...row, etaHours: hours, etaDate }
      }),
    }
  }, [
    isPortTab,
    activeTab,
    runtimeDetections,
    pathToPortSpeed,
    pathToPortVersion,
    pathToPortSpeedsByShip,
  ])
  const shipsInPortRows = useMemo(() => {
    const mockShips = [
      {
        name: 'Invictus',
        flag: '🇲🇭',
        type: 'Tanker',
        imo: '9819870',
        mmsi: '311000686',
      },
      {
        name: 'Ghinah',
        flag: '🇸🇦',
        type: 'Tanker Cr...',
        imo: '9819871',
        mmsi: '311000687',
      },
      {
        name: 'Emerlad Sea',
        flag: '🇵🇦',
        type: 'Tanker Pr...',
        imo: '9819872',
        mmsi: '311000688',
      },
      {
        name: 'Melodie V',
        flag: '🇵🇦',
        type: 'Offshore',
        imo: '9819873',
        mmsi: '311000689',
      },
      {
        name: 'Abouzar 1...',
        flag: '🇮🇷',
        type: 'Other',
        imo: '9819874',
        mmsi: '311000690',
      },
    ]
    return Array.from({ length: 15 }, (_, index) => ({
      ...mockShips[index % mockShips.length],
      id: `ship-in-port-${index}`,
      reportedAt: new Date(
        Date.UTC(2025, 8, 19, 9, 53) - index * 37 * 60 * 1000
      ),
    }))
  }, [])
  const filteredShipsInPortRows = useMemo(() => {
    const query = shipsInPortSearch.trim().toLocaleLowerCase()
    if (!query) return shipsInPortRows
    return shipsInPortRows.filter((row) =>
      [row.name, row.flag, row.type, row.imo, row.mmsi].some((value) =>
        String(value).toLocaleLowerCase().includes(query)
      )
    )
  }, [shipsInPortRows, shipsInPortSearch])
  const sortedShipsInPortRows = useMemo(
    () =>
      sortTableRows(filteredShipsInPortRows, shipsInPortSort, (row, key) => {
        if (key === 'reportedAt') return row.reportedAt.getTime()
        if (key === 'imo' || key === 'mmsi') return Number(row[key])
        return row[key]
      }),
    [filteredShipsInPortRows, shipsInPortSort]
  )
  const filteredExpectedArrivalRows = useMemo(() => {
    const query = expectedArrivalsSearch.trim().toLocaleLowerCase()
    if (!query) return expectedArrivalsData.rows
    return expectedArrivalsData.rows.filter((row) =>
      [row.name, row.flag, row.type, row.imo].some((value) =>
        String(value).toLocaleLowerCase().includes(query)
      )
    )
  }, [expectedArrivalsData.rows, expectedArrivalsSearch])
  const sortedExpectedArrivalRows = useMemo(
    () =>
      sortTableRows(
        filteredExpectedArrivalRows,
        expectedArrivalsSort,
        (row, key) => {
          if (key === 'eta') return row.etaDate?.getTime()
          if (key === 'distance') return row.distanceNm
          if (key === 'imo') return Number(row.imo)
          return row[key]
        }
      ),
    [filteredExpectedArrivalRows, expectedArrivalsSort]
  )
  // v3 Path to Port: ids of Expected Arrivals rows whose inline card is open.
  // A Set so more than one card can be expanded at once.
  const [expandedArrivalIds, setExpandedArrivalIds] = useState(() => new Set())
  const [arrivalsIntroDismissed, setArrivalsIntroDismissed] = useState(false)
  // Distance / ETA for the currently-active Path to Port route (the vessel the
  // user drilled into from Expected Arrivals). Drives the v1 map panel and v2
  // vessel-panel readouts. Recomputes with the selected speed.
  const activePathToPort = useMemo(() => {
    if (!pathToPortRoute?.shipId || !pathToPortRoute?.portId) return null
    const port = resolvePortCoords({
      id: pathToPortRoute.portId,
      name: pathToPortRoute.portName,
    })
    let det =
      pathToPortRoute.detectionId != null
        ? runtimeDetections.find((d) => d.id === pathToPortRoute.detectionId)
        : null
    if (!det) {
      det = runtimeDetections
        .filter(
          (d) =>
            d.shipId === pathToPortRoute.shipId &&
            Number.isFinite(d.lng) &&
            Number.isFinite(d.lat)
        )
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
    }
    const position = det ? { lng: det.lng, lat: det.lat } : null
    const distanceNm = port && position ? haversineNm(position, port) : null
    const { hours, etaDate } = computeEta(distanceNm, pathToPortSpeed)
    const ship = ships[pathToPortRoute.shipId]
    return {
      shipId: pathToPortRoute.shipId,
      shipName: ship?.name || pathToPortRoute.shipId,
      portName: pathToPortRoute.portName || port?.name || 'destination port',
      distanceNm,
      etaHours: hours,
      etaDate,
    }
  }, [pathToPortRoute, pathToPortSpeed, runtimeDetections])

  // Speed selector shared by Path to Port v1-v5.
  const renderPathToPortSpeedChips = () => (
    <Box style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {PATH_TO_PORT_SPEEDS.map((speed) => {
        const active = speed === pathToPortSpeed
        return (
          <Box
            key={speed}
            component="button"
            type="button"
            onClick={() => setPathToPortSpeed(speed)}
            style={{
              height: 30,
              padding: '0 14px',
              borderRadius: 4,
              border: `1px solid ${active ? '#0094ff' : '#393C56'}`,
              background: active ? 'rgba(0, 148, 255, 0.12)' : '#24263C',
              color: active ? '#fff' : '#888F9E',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {speed} kn
          </Box>
        )
      })}
    </Box>
  )

  // V6 uses a continuous speed control so the projected position and ETA can be
  // explored across the full 0-50 knot range.
  const renderPathToPortSpeedSlider = (shipId) => {
    const speed =
      pathToPortSpeedsByShip[shipId] ?? resolveShipSpeedKn(ships[shipId])
    const progress = (speed / 50) * 100
    return (
      <Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Speed</Text>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {speed} kn
          </Text>
        </Box>
        <Box
          component="input"
          className="ptp-density-range"
          type="range"
          min={0}
          max={50}
          step={1}
          value={speed}
          onChange={(event) => {
            const nextSpeed = Number(event.currentTarget.value)
            setPathToPortSpeedsByShip((current) => ({
              ...current,
              [shipId]: nextSpeed,
            }))
          }}
          style={{
            width: '100%',
            background: `linear-gradient(to right, #0094FF ${progress}%, #393C56 ${progress}%)`,
          }}
        />
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Text style={{ color: '#888F9E', fontSize: 11 }}>0 kn</Text>
          <Text style={{ color: '#888F9E', fontSize: 11 }}>50 kn</Text>
        </Box>
      </Box>
    )
  }

  // Distance / ETA / Duration readout shared by every Path to Port version.
  const renderPathToPortReadout = (data) => {
    if (!data) return null
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.6fr',
            columnGap: 16,
          }}
        >
          <KeyValuePair
            keyName="Distance"
            value={formatDistanceNm(data.distanceNm)}
          />
          <KeyValuePair
            keyName="Duration"
            value={formatDuration(data.etaHours)}
          />
          <KeyValuePair keyName="ETA" value={formatEta(data.etaDate)} />
        </Box>
        {pathToPortVersion === 'v6' ? (
          renderPathToPortSpeedSlider(data.shipId)
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Speed</Text>
            {renderPathToPortSpeedChips()}
          </Box>
        )}
      </Box>
    )
  }
  const displayStsShipIds = isStsTab
    ? [
        activeTab.shipIds[0],
        activeTab.stsType === 'sts' ? 'unknown' : activeTab.shipIds[1],
      ]
    : null
  // The event's actual participant list, carried on the tab from the clicked
  // detection (2–5 ships for N-ship events).
  const eventShipIds = isStsTab
    ? (activeTab.shipIds || []).filter(Boolean)
    : null
  // Version-aware ship list driving the STS header tabs. v1 keeps the two-ship
  // pair (production behavior). Every other version renders the event's real
  // participant list exactly — a 3-ship event shows 3, a 4-ship event shows 4,
  // etc. — instead of padding to a fixed count.
  // Always render every vessel the image contains — we never truncate the
  // roster, even in v18. v18 differs from v19 only in how it *frames* an
  // over-sized event (a "may be unreliable" warning vs. a neutral large-raft
  // note); both show whatever was detected.
  const stsShipIds = !isStsTab
    ? null
    : stsVersion === 'v1'
      ? displayStsShipIds
      : eventShipIds.length
        ? eventShipIds
        : displayStsShipIds
  // How many vessels the model reported for this event.
  const stsReportedCount = stsShipIds ? stsShipIds.length : 0
  // Does this event exceed product's expected ship-to-ship size?
  const stsOverflow = stsReportedCount > STS_MAX_VESSELS

  // Display label for an STS tab.
  const stsTabLabel = (sid) => ships[sid]?.name || 'Vessel'

  // The strip-based versions land on an event overview (annotated image + roster)
  // before drilling into a single ship.
  const stsUsesOverview =
    isStsTab &&
    (stsVersion === 'v2' ||
      stsVersion === 'v8' ||
      stsVersion === 'v9' ||
      stsVersion === 'v10' ||
      stsVersion === 'v11' ||
      stsVersion === 'v12' ||
      stsVersion === 'v13' ||
      stsVersion === 'v16' ||
      stsVersion === 'v17')
  const stsOverviewActive = stsUsesOverview && stsShowOverview

  // Demo transfer times for the prototype: deterministic, most-recent first so
  // the ordering reads as a sequence of transfers within the event.
  const stsTransferLabel = (idx) => {
    const base = new Date('2026-07-13T18:40:00Z')
    const d = new Date(base.getTime() - idx * 41 * 60 * 1000)
    return `${d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })} UTC`
  }

  // Reset the selected STS vessel when the version changes so the index never
  // points past the (differently sized) v1/v2 ship lists.
  useEffect(() => {
    setActiveStsShip(0)
    setStsListDrilledIn(false)
    setStsShowOverview(true)
    setStsRosterView('list')
    setStsNetworkOpen(true)
    setStsNetworkPos(null)
    setStsHeroHoverIdx(null)
    // Key off the raw version so switching between v17/v18/v19 (which all share
    // the resolved 'v17' layout) still resets the drill-in state.
  }, [stsVersionRaw])

  // v4: return to the transfer summary whenever the active STS tab changes.
  // Also start on the first ship so a stale index from a larger event (e.g.
  // switching from a 5-ship to a 3-ship event) never carries over.
  useEffect(() => {
    setActiveStsShip(0)
    setStsListDrilledIn(false)
    setStsShowOverview(true)
    setStsRosterView('list')
    setStsNetworkOpen(true)
    setStsNetworkPos(null)
    setStsReviewFlagged(false)
  }, [activeShipTab])

  const stsShipKey = stsShipIds ? stsShipIds.join('|') : ''

  // v2/v8/v9/v10: keep the edge fades in sync with the scroll position and width.
  useLayoutEffect(() => {
    if (
      !isStsTab ||
      (stsVersion !== 'v2' &&
        stsVersion !== 'v8' &&
        stsVersion !== 'v9' &&
        stsVersion !== 'v10' &&
        stsVersion !== 'v11' &&
        stsVersion !== 'v12' &&
        stsVersion !== 'v13' &&
        stsVersion !== 'v16' &&
        stsVersion !== 'v17')
    )
      return
    const el = stsStripScrollRef.current
    if (!el) return
    updateStsStripFade()
    const ro = new ResizeObserver(updateStsStripFade)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isStsTab, stsVersion, stsShipKey, updateStsStripFade])

  // v7: anchor the expanded network canvas to the area right of the ship panel
  // (and below the top nav) by tracking the panel's on-screen rect.
  useLayoutEffect(() => {
    if (!isStsTab || stsVersion !== 'v7') return
    const measure = () => {
      const el = panelContainerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setStsNetworkRect({
        top: rect.top,
        left: rect.right,
        width: Math.max(window.innerWidth - rect.right, 0),
        height: rect.height,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (panelContainerRef.current) ro.observe(panelContainerRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [isStsTab, stsVersion, stsShipKey, stsNetworkOpen, loading])

  // Tell the map how much of its right side the v7 network panel occludes, so it
  // can pad focused vessels clear of it. Keyed off width (not drag position) to
  // avoid re-centering the map on every drag frame.
  useEffect(() => {
    if (!onStsNetworkPanelChange) return
    const active = isStsTab && stsVersion === 'v7' && stsNetworkOpen
    onStsNetworkPanelChange(active ? stsNetworkSize.width + 32 : 0)
    return () => onStsNetworkPanelChange(0)
  }, [
    isStsTab,
    stsVersion,
    stsNetworkOpen,
    stsNetworkSize.width,
    onStsNetworkPanelChange,
  ])

  useEffect(() => {
    const handleScroll = () => {
      if (portTabScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          portTabScrollRef.current
        setPortTabOverflowLeft(scrollLeft > 0)
        setPortTabOverflowRight(scrollLeft + clientWidth < scrollWidth - 1)
      }
    }
    const currentRef = portTabScrollRef.current
    if (currentRef) {
      handleScroll()
      currentRef.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('resize', handleScroll)
    }
  }, [isPortTab])
  const [showCloseAllConfirmModal, setShowCloseAllConfirmModal] =
    useState(false)
  const [dontShowGoToDateAgain, setDontShowGoToDateAgain] = useState(false)
  const [skipGoToDateWarning, setSkipGoToDateWarning] = useState(false)
  const [pendingGoToDate, setPendingGoToDate] = useState(null)
  const [goToDateSubmitting, setGoToDateSubmitting] = useState(false)
  const [closeAllCancelHovered, setCloseAllCancelHovered] = useState(false)
  const [closeAllConfirmHovered, setCloseAllConfirmHovered] = useState(false)
  const [goToDateCancelHovered, setGoToDateCancelHovered] = useState(false)
  const [goToDateConfirmHovered, setGoToDateConfirmHovered] = useState(false)
  const [timelineTimeMenuOpened, setTimelineTimeMenuOpened] = useState(false)
  const [timelineEventTypeMenuOpened, setTimelineEventTypeMenuOpened] =
    useState(false)
  const [satTimelineTimeMenuOpened, setSatTimelineTimeMenuOpened] =
    useState(false)
  const [satTimelineEventTypeMenuOpened, setSatTimelineEventTypeMenuOpened] =
    useState(false)
  const [sanctionTitleVariant, setSanctionTitleVariant] = useState('info')
  const cardRefs = useRef({})
  const satCardRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const tabScrollRef = useRef(null)
  const detailTabScrollRef = useRef(null)
  const detailTabButtonRefs = useRef({})
  const tabButtonRefs = useRef({})
  const tabScrollAnimationRef = useRef(null)
  const prevMapDateRef = useRef(mapDate)
  const panelContainerRef = useRef(null)
  const topSectionRef = useRef(null)
  const topSummaryHeaderRef = useRef(null)
  const lastExpandedTopHeightRef = useRef(null)
  const copyFeedbackTimerRef = useRef(null)
  const goToDateTimerRef = useRef(null)
  const goToDateCloseTimerRef = useRef(null)
  const newLastKnownDotTimersRef = useRef({})
  const nextSimulatedDetectionIdRef = useRef(
    runtimeDetections.reduce((maxId, d) => {
      const parsedId = Number(d.id)
      return Number.isFinite(parsedId) ? Math.max(maxId, parsedId) : maxId
    }, 0) + 1000
  )
  const allDetections = useMemo(() => runtimeDetections, [runtimeDetections])

  // v20: when switching between vessels in an STS event, resolve *that vessel's
  // own* STS detection so its tab shows its own data (not the vessel we opened
  // from). Prefer a detection that links to another participant in this event;
  // fall back to the vessel's latest STS detection, then to nothing (letting
  // openShipTab default to the vessel's latest detection of any type).
  const resolveStsVesselDetectionId = useCallback(
    (shipId, participantIds = []) => {
      const mine = allDetections
        .filter(
          (d) =>
            d.shipId === shipId &&
            (d.type === 'sts' || d.type === 'sts-ais')
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      const linked = mine.find(
        (d) => d.stsPartner && participantIds.includes(d.stsPartner)
      )
      return (linked || mine[0])?.id ?? null
    },
    [allDetections]
  )

  // Open a vessel's own tab while preserving STS event context (used by the v20
  // involved-vessels switcher + Overview modal).
  const openStsVesselTab = useCallback(
    (shipId, tab) => {
      if (!shipId || !tab) return
      openShipTab(
        {
          shipId,
          id:
            resolveStsVesselDetectionId(shipId, tab.stsShipIds || []) ??
            tab.stsDetectionId,
        },
        {
          stsEvent: true,
          stsType: tab.stsType,
          stsShipIds: tab.stsShipIds,
          stsDetectionId: tab.stsDetectionId,
        }
      )
    },
    [openShipTab, resolveStsVesselDetectionId]
  )

  const isBookmarkVersion =
    watchlistVersion === 'version4' ||
    watchlistVersion === 'version5' ||
    watchlistVersion === 'version6' ||
    watchlistVersion === 'version7'
  // proto2 = Bookmarks (bookmark glyph); proto1 = Favorites (star glyph).
  const isBookmarkProto = forYouPrototype === 'proto2'

  const updateOverflow = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setOverflowLeft(el.scrollLeft > 0)
    setOverflowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  const updateDetailTabsOverflow = useCallback(() => {
    const el = detailTabScrollRef.current
    if (!el) {
      setDetailTabsOverflowLeft(false)
      setDetailTabsOverflowRight(false)
      return
    }
    setDetailTabsOverflowLeft(el.scrollLeft > 0)
    setDetailTabsOverflowRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    )
  }, [])

  const animateTabScrollTo = useCallback(
    (targetLeft) => {
      const container = tabScrollRef.current
      if (!container) return

      const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth)
      const clampedTarget = Math.min(Math.max(0, targetLeft), maxLeft)
      const startLeft = container.scrollLeft
      const distance = clampedTarget - startLeft

      if (Math.abs(distance) < 1) return

      if (tabScrollAnimationRef.current) {
        window.cancelAnimationFrame(tabScrollAnimationRef.current)
        tabScrollAnimationRef.current = null
      }

      const prefersReducedMotion = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      )?.matches
      if (prefersReducedMotion) {
        container.scrollLeft = clampedTarget
        updateOverflow()
        return
      }

      const durationMs = 280
      let startTime = null
      const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

      const step = (timestamp) => {
        if (startTime === null) {
          startTime = timestamp
        }
        const elapsed = timestamp - startTime
        const progress = Math.min(1, elapsed / durationMs)
        container.scrollLeft = startLeft + distance * easeInOutCubic(progress)
        updateOverflow()

        if (progress < 1) {
          tabScrollAnimationRef.current = window.requestAnimationFrame(step)
        } else {
          tabScrollAnimationRef.current = null
        }
      }

      tabScrollAnimationRef.current = window.requestAnimationFrame(step)
    },
    [updateOverflow]
  )

  const getMinTopHeight = useCallback(() => {
    const FALLBACK_MIN = 96
    if (!topSummaryHeaderRef.current || !topSectionRef.current)
      return FALLBACK_MIN

    const headerRect = topSummaryHeaderRef.current.getBoundingClientRect()
    const topSectionStyles = window.getComputedStyle(topSectionRef.current)
    const headerStyles = window.getComputedStyle(topSummaryHeaderRef.current)

    const paddingTop = parseFloat(topSectionStyles.paddingTop) || 0
    const paddingBottom = parseFloat(topSectionStyles.paddingBottom) || 0
    const marginBottom = parseFloat(headerStyles.marginBottom) || 0

    return Math.ceil(
      headerRect.height + paddingTop + paddingBottom + marginBottom
    )
  }, [])

  const getTopSectionBounds = useCallback(() => {
    if (!panelContainerRef.current) return null
    const rect = panelContainerRef.current.getBoundingClientRect()
    const maxTopHeight = Math.max(0, rect.height - TIMELINE_MIN_HEIGHT)
    const minTopHeight = Math.min(getMinTopHeight(), maxTopHeight)
    return { minTopHeight, maxTopHeight }
  }, [getMinTopHeight])

  const getPreferredExpandedTopHeight = useCallback(
    (minTopHeight, maxTopHeight) => {
      const naturalHeight = topSectionRef.current?.scrollHeight ?? maxTopHeight
      const preferredHeight = lastExpandedTopHeightRef.current ?? naturalHeight
      return Math.max(minTopHeight, Math.min(maxTopHeight, preferredHeight))
    },
    []
  )

  const applyGoToDate = useCallback(
    (dateKey, detectionId, options = {}) => {
      const { preferExactDetection = false } = options
      const sourceDetection = allDetections.find((d) => d.id === detectionId)
      const sourceShipId = sourceDetection?.shipId
      const sourceType = sourceDetection?.type
      const shipDetectionsForDate = sourceShipId
        ? allDetections
            .filter(
              (d) =>
                d.shipId === sourceShipId &&
                getDetectionDateKey(d.date) === dateKey
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        : []
      const resolvedDetection = preferExactDetection
        ? sourceDetection ||
          shipDetectionsForDate.find((d) => d.type === sourceType) ||
          shipDetectionsForDate[0]
        : shipDetectionsForDate.find((d) => d.type === 'ais') ||
          shipDetectionsForDate.find((d) => d.type === sourceType) ||
          shipDetectionsForDate[0] ||
          sourceDetection
      const resolvedDetectionId = resolvedDetection?.id ?? detectionId

      setMapDate(dateKey)
      setPreviewDetectionId(null)
      if (activeShipTab) {
        setTabState((prev) => ({
          ...prev,
          [activeShipTab]: {
            ...prev[activeShipTab],
            selectedCard: resolvedDetectionId,
            previewCards: [],
            activeDetailTab: prev[activeShipTab]?.activeDetailTab ?? 0,
          },
        }))
      }
      // Force refocus even if this detection is already active.
      setActiveDetectionId(null)
      window.setTimeout(() => {
        setActiveDetectionId(resolvedDetectionId)
      }, 0)
    },
    [
      activeShipTab,
      allDetections,
      setMapDate,
      setActiveDetectionId,
      setPreviewDetectionId,
    ]
  )

  const requestGoToDate = useCallback(
    (dateKey, detectionId, dateLabel) => {
      if (skipGoToDateWarning) {
        applyGoToDate(dateKey, detectionId)
        return
      }
      setDontShowGoToDateAgain(false)
      setPendingGoToDate({ dateKey, detectionId, dateLabel })
      setShowGoToDateModal(true)
    },
    [skipGoToDateWarning, applyGoToDate]
  )

  const closeGoToDateModal = useCallback((onClosed) => {
    setShowGoToDateModal(false)
    if (goToDateCloseTimerRef.current) {
      window.clearTimeout(goToDateCloseTimerRef.current)
    }
    goToDateCloseTimerRef.current = window.setTimeout(() => {
      setPendingGoToDate(null)
      setGoToDateSubmitting(false)
      onClosed?.()
      goToDateCloseTimerRef.current = null
    }, GO_TO_DATE_MODAL_TRANSITION_MS)
  }, [])

  useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    updateOverflow()
    el.addEventListener('scroll', updateOverflow)
    const ro = new ResizeObserver(updateOverflow)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateOverflow)
      ro.disconnect()
    }
  }, [updateOverflow, shipTabs])

  useEffect(() => {
    const el = detailTabScrollRef.current
    if (!el) return
    updateDetailTabsOverflow()
    el.addEventListener('scroll', updateDetailTabsOverflow)
    const ro = new ResizeObserver(updateDetailTabsOverflow)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateDetailTabsOverflow)
      ro.disconnect()
    }
  }, [updateDetailTabsOverflow, activeShipTab, shipTabs])

  useEffect(() => {
    if (!activeShipTab) return
    const container = tabScrollRef.current
    const activeTabEl = tabButtonRefs.current[activeShipTab]
    if (!container || !activeTabEl) return

    const padding = 24
    const currentLeft = container.scrollLeft
    const currentRight = currentLeft + container.clientWidth
    const tabLeft = activeTabEl.offsetLeft - padding
    const tabRight = activeTabEl.offsetLeft + activeTabEl.offsetWidth + padding

    if (tabLeft < currentLeft) {
      animateTabScrollTo(tabLeft)
      return
    }

    if (tabRight > currentRight) {
      animateTabScrollTo(tabRight - container.clientWidth)
    }
  }, [activeShipTab, shipTabs, animateTabScrollTo])

  useEffect(() => {
    try {
      const pref = window.localStorage.getItem(GO_TO_DATE_WARNING_PREF_KEY)
      if (pref === 'true') setSkipGoToDateWarning(true)
    } catch {
      // Ignore storage access issues and default to showing warning.
    }
  }, [])

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        window.clearTimeout(copyFeedbackTimerRef.current)
      }
      if (goToDateTimerRef.current) {
        window.clearTimeout(goToDateTimerRef.current)
      }
      if (goToDateCloseTimerRef.current) {
        window.clearTimeout(goToDateCloseTimerRef.current)
      }
      if (tabScrollAnimationRef.current) {
        window.cancelAnimationFrame(tabScrollAnimationRef.current)
        tabScrollAnimationRef.current = null
      }
      Object.values(newLastKnownDotTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      newLastKnownDotTimersRef.current = {}
    }
  }, [])

  useEffect(() => {
    const flashTimer = window.setInterval(() => {
      setIsNewLastKnownDotFlashOn((prev) => !prev)
    }, NEW_LAST_KNOWN_DOT_FLASH_MS)
    return () => window.clearInterval(flashTimer)
  }, [])

  const handleCopyToClipboard = useCallback((value, fieldKey) => {
    if (!value) return
    navigator.clipboard.writeText(String(value)).catch(() => {
      // Ignore clipboard permission issues in prototype mode.
    })
    setCopiedField(fieldKey)
    if (copyFeedbackTimerRef.current) {
      window.clearTimeout(copyFeedbackTimerRef.current)
    }
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev))
      copyFeedbackTimerRef.current = null
    }, 1200)
  }, [])

  useEffect(() => {
    if (mapDate === prevMapDateRef.current) return
    prevMapDateRef.current = mapDate
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (mapDate === todayStr && activeShipTab) {
      const tab = shipTabs.find((t) => t.id === activeShipTab)
      const shipId = tab?.type === 'sts' ? tab.shipIds[0] : activeShipTab
      const latest = allDetections
        .filter((d) => d.shipId === shipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setFlashEnabled(true)
      setActiveDetectionId(null)
      setPreviewDetectionId(null)
      setTabState((prev) => ({
        ...prev,
        [activeShipTab]: {
          ...prev[activeShipTab],
          selectedCard: latest?.id ?? null,
          previewCards: [],
        },
      }))
    }
  }, [
    mapDate,
    activeShipTab,
    allDetections,
    setActiveDetectionId,
    setPreviewDetectionId,
  ])

  const currentTabState = tabState[activeShipTab] || {
    selectedCard: null,
    previewCards: [],
    activeDetailTab: 0,
    timelineTimeFilter: 'all',
    timelineEventTypeFilter: 'all',
    satTimelineTimeFilter: 'all',
    satTimelineDataSourceFilter: 'all',
  }
  const selectedCard = currentTabState.selectedCard
  const previewCards = Array.isArray(currentTabState.previewCards)
    ? currentTabState.previewCards
    : currentTabState.previewCard != null
      ? [currentTabState.previewCard]
      : []
  const activeDetailTab = currentTabState.activeDetailTab
  const timelineTimeFilter = currentTabState.timelineTimeFilter || 'all'
  const timelineEventTypeFilter =
    currentTabState.timelineEventTypeFilter || 'all'
  const satTimelineTimeFilter = currentTabState.satTimelineTimeFilter || 'all'
  const satTimelineDataSourceFilter =
    currentTabState.satTimelineDataSourceFilter ||
    currentTabState.satTimelineEventTypeFilter ||
    'all'
  const satTimelineSortOrder = satSortByTab[activeShipTab] ?? 'desc'
  const timelineSortOrder = timelineSortByTab[activeShipTab] ?? 'desc'

  const updateTabState = (key, value) => {
    setTabState((prev) => ({
      ...prev,
      [activeShipTab]: {
        ...prev[activeShipTab],
        selectedCard: prev[activeShipTab]?.selectedCard ?? null,
        previewCards: prev[activeShipTab]?.previewCards ?? [],
        activeDetailTab: prev[activeShipTab]?.activeDetailTab ?? 0,
        timelineTimeFilter: prev[activeShipTab]?.timelineTimeFilter ?? 'all',
        timelineEventTypeFilter:
          prev[activeShipTab]?.timelineEventTypeFilter ?? 'all',
        satTimelineTimeFilter:
          prev[activeShipTab]?.satTimelineTimeFilter ?? 'all',
        satTimelineDataSourceFilter:
          prev[activeShipTab]?.satTimelineDataSourceFilter ??
          prev[activeShipTab]?.satTimelineEventTypeFilter ??
          'all',
        [key]: value,
      },
    }))
  }

  const handleDetailTabClick = (tabLabel, tabIndex) => {
    updateTabState('activeDetailTab', tabIndex)

    if (tabLabel !== 'Sanctions Details') return

    // Ensure sanctions card starts at the top whenever the tab is clicked.
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    window.requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  useEffect(() => {
    if (!activeShipTab) return
    const currentTab = shipTabs.find((t) => t.id === activeShipTab)
    const supportsSanctionsDetails =
      currentTab?.type !== 'sts' && currentTab?.id === 'tiffani'
    const detailTabCount = supportsSanctionsDetails
      ? tiffaniDetailTabs.length
      : baseDetailTabs.length
    if (activeDetailTab < detailTabCount) return
    setTabState((prev) => ({
      ...prev,
      [activeShipTab]: {
        ...prev[activeShipTab],
        selectedCard: prev[activeShipTab]?.selectedCard ?? null,
        previewCards: prev[activeShipTab]?.previewCards ?? [],
        activeDetailTab: 0,
      },
    }))
  }, [activeShipTab, activeDetailTab, shipTabs])

  useEffect(() => {
    if (selectedDetectionId == null || !activeShipTab) return

    const normalizedSelectedId = normalizeDetectionId(selectedDetectionId)
    const targetDetection = allDetections.find(
      (detection) => normalizeDetectionId(detection.id) === normalizedSelectedId
    )
    if (!targetDetection) {
      setSelectedDetectionId(null)
      return
    }

    const activeTabForSelection = shipTabs.find((t) => t.id === activeShipTab)
    if (!activeTabForSelection) {
      // Tab activation can lag behind click dispatch by one render.
      // Keep the clicked id until the target tab is mounted/active.
      return
    }

    const tabShipIds =
      activeTabForSelection.type === 'sts'
        ? activeTabForSelection.shipIds || []
        : [activeShipTab]
    if (!tabShipIds.includes(targetDetection.shipId)) {
      // The clicked detection belongs to a different ship/tab that may still
      // be opening. Preserve the id so it can apply on the next render.
      return
    }

    updateTabState('selectedCard', targetDetection.id)
    updateTabState('previewCards', [])
    setActiveDetectionId(targetDetection.id)
    setPreviewDetectionId(null)
    setSelectedDetectionId(null)
  }, [
    activeShipTab,
    allDetections,
    selectedDetectionId,
    setActiveDetectionId,
    setSelectedDetectionId,
    setPreviewDetectionId,
    shipTabs,
  ])

  useEffect(() => {
    if (
      selectedCard != null &&
      cardRefs.current[selectedCard] &&
      scrollContainerRef.current
    ) {
      const card = cardRefs.current[selectedCard]
      const container = scrollContainerRef.current
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const padding = 20

      if (cardRect.top < containerRect.top + padding) {
        container.scrollTo({
          top:
            container.scrollTop + (cardRect.top - containerRect.top) - padding,
          behavior: 'smooth',
        })
      } else if (cardRect.bottom > containerRect.bottom - padding) {
        container.scrollTo({
          top:
            container.scrollTop +
            (cardRect.bottom - containerRect.bottom) +
            padding,
          behavior: 'smooth',
        })
      }
    }
  }, [selectedCard])

  useEffect(() => {
    if (!isResizingTimeline) return undefined

    const handleMouseMove = (e) => {
      if (!panelContainerRef.current) return
      const rect = panelContainerRef.current.getBoundingClientRect()
      const bounds = getTopSectionBounds()
      if (!bounds) return
      const pointerY = e.clientY - rect.top
      const { minTopHeight, maxTopHeight } = bounds
      const next = Math.max(minTopHeight, Math.min(maxTopHeight, pointerY))
      setTopSectionHeight(next)
    }

    const handleMouseUp = () => {
      const bounds = getTopSectionBounds()
      if (bounds && topSectionHeight != null) {
        const { minTopHeight, maxTopHeight } = bounds
        const preferredHeight = getPreferredExpandedTopHeight(
          minTopHeight,
          maxTopHeight
        )
        const snapPoints = [minTopHeight, preferredHeight, maxTopHeight]
        const snappedHeight = snapPoints.reduce((closest, candidate) => {
          if (
            Math.abs(candidate - topSectionHeight) <
            Math.abs(closest - topSectionHeight)
          ) {
            return candidate
          }
          return closest
        }, minTopHeight)
        const collapsed = Math.abs(snappedHeight - minTopHeight) <= 2
        setTopSectionHeight(snappedHeight)
        setIsTopSummaryCollapsed(collapsed)
        if (!collapsed) {
          lastExpandedTopHeightRef.current = snappedHeight
        }
      }
      setIsResizingTimeline(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isResizingTimeline,
    getTopSectionBounds,
    getPreferredExpandedTopHeight,
    topSectionHeight,
  ])

  useEffect(() => {
    if (topSectionHeight == null) return
    const bounds = getTopSectionBounds()
    if (!bounds) return
    const { minTopHeight, maxTopHeight } = bounds
    const clamped = Math.max(
      minTopHeight,
      Math.min(maxTopHeight, topSectionHeight)
    )
    if (clamped !== topSectionHeight) {
      setTopSectionHeight(clamped)
    }
  }, [topSectionHeight, getTopSectionBounds])

  useEffect(() => {
    if (topSectionHeight != null && !isTopSummaryCollapsed) {
      lastExpandedTopHeightRef.current = topSectionHeight
    }
  }, [topSectionHeight, isTopSummaryCollapsed])

  useEffect(() => {
    if (!topSectionRef.current) return
    topSectionRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    // If tools are hidden after a drag-resize, release fixed height so
    // the timeline immediately moves up and no empty gap remains.
    if (!detailToolsVisible && !isTopSummaryCollapsed && !isResizingTimeline) {
      setTopSectionHeight(null)
      lastExpandedTopHeightRef.current = null
    }
  }, [detailToolsVisible, isTopSummaryCollapsed, isResizingTimeline])

  const handleTimelineResizeStart = (e) => {
    if (!ENABLE_TIMELINE_DRAG) return
    e.preventDefault()
    if (topSectionHeight == null && topSectionRef.current) {
      setTopSectionHeight(topSectionRef.current.getBoundingClientRect().height)
    }
    setIsTopSummaryCollapsed(false)
    setIsResizingTimeline(true)
  }

  const handleTopSummaryToggle = () => {
    const bounds = getTopSectionBounds()
    if (!bounds) {
      setIsTopSummaryCollapsed((v) => !v)
      return
    }
    const { minTopHeight, maxTopHeight } = bounds
    if (isTopSummaryCollapsed) {
      // Treat button expand as a reset to default, not a restore of partial drag.
      setTopSectionHeight(null)
      setIsTopSummaryCollapsed(false)
      lastExpandedTopHeightRef.current = null
      return
    }
    // Clear custom drag memory when collapsing via the button.
    lastExpandedTopHeightRef.current = null
    setTopSectionHeight(minTopHeight)
    setIsTopSummaryCollapsed(true)
  }

  const activeStsShipIndex =
    isStsTab && stsShipIds
      ? Math.min(activeStsShip, stsShipIds.length - 1)
      : activeStsShip

  // v2/v8/v9/v10: keep the selected vessel tab scrolled into view after picking.
  useEffect(() => {
    if (
      !isStsTab ||
      (stsVersion !== 'v2' &&
        stsVersion !== 'v8' &&
        stsVersion !== 'v9' &&
        stsVersion !== 'v10' &&
        stsVersion !== 'v11' &&
        stsVersion !== 'v12' &&
        stsVersion !== 'v13' &&
        stsVersion !== 'v16' &&
        stsVersion !== 'v17')
    )
      return
    // While the overview/network is showing, selecting a vessel updates the map
    // (not the tab strip), so don't yank the sticky tab row around.
    if (stsShowOverview) return
    const el = activeStsTabRef.current
    if (!el) return
    el.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    })
  }, [isStsTab, stsVersion, stsShipKey, activeStsShipIndex, stsShowOverview])
  // STS convergence connectors for the map: dashed lines from the event point
  // out to each participating vessel's approach position, with the currently
  // focused vessel's line highlighted. Computed here (we own the ship list +
  // selection) and drawn by Map via context.
  useEffect(() => {
    if (
      (stsVersion !== 'v9' &&
        stsVersion !== 'v10' &&
        stsVersion !== 'v11' &&
        stsVersion !== 'v12') ||
      !isStsTab ||
      !stsShipIds ||
      stsShipIds.length < 2 ||
      // Only paint the map network while the user is actually on the transfer
      // network view (in the event overview) — not the roster list.
      !stsShowOverview ||
      stsRosterView !== 'network'
    ) {
      setStsConnectorData(null)
      return
    }
    // Resolve the event point robustly: N-ship tabs encode the detection id
    // (sts-evt-<id>); otherwise fall back to the current selection, then to an
    // STS detection whose participant list matches this tab. This keeps the
    // connectors present even when arriving on an already-open tab (no click).
    const tabEventId =
      typeof activeTab?.id === 'string' && activeTab.id.startsWith('sts-evt-')
        ? activeTab.id.slice('sts-evt-'.length)
        : null
    const shipKey = stsShipIds.join('|')
    const eventDet =
      allDetections.find((d) => String(d.id) === String(tabEventId)) ||
      allDetections.find((d) => String(d.id) === String(selectedDetectionId)) ||
      allDetections.find(
        (d) =>
          (d.type === 'sts' || d.type === 'sts-ais') &&
          Array.isArray(d.stsShips) &&
          d.stsShips.join('|') === shipKey
      )
    if (
      !eventDet ||
      !Number.isFinite(eventDet.lng) ||
      !Number.isFinite(eventDet.lat)
    ) {
      setStsConnectorData(null)
      return
    }
    const center = [eventDet.lng, eventDet.lat]
    const approachFor = (sid, idx) => {
      // Prefer the vessel's most recent non-STS detection (its real approach).
      const latest = allDetections
        .filter(
          (d) =>
            String(d.shipId) === String(sid) &&
            d.type !== 'sts' &&
            d.type !== 'sts-ais' &&
            Number.isFinite(d.lng) &&
            Number.isFinite(d.lat)
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      if (
        latest &&
        Math.hypot(latest.lng - center[0], latest.lat - center[1]) > 0.4
      ) {
        return { coord: [latest.lng, latest.lat], detId: latest.id }
      }
      // Fallback: fan out on a deterministic ring so the line stays legible
      // even when a participant has no separate approach track (co-located).
      const ang = (idx / stsShipIds.length) * Math.PI * 2 - Math.PI / 2
      const rad = 1.6
      return {
        coord: [
          center[0] + rad * Math.cos(ang),
          center[1] + rad * Math.sin(ang),
        ],
        detId: null,
      }
    }
    // Only the detections belonging to THIS event stay lit under the focus
    // overlay (the event marker + each participant's approach position).
    const keepDetectionIds = [String(eventDet.id)]
    let selectedDetId = null
    let selectedShipId = null
    const lines = stsShipIds.map((sid, idx) => {
      const { coord, detId } = approachFor(sid, idx)
      if (detId != null) keepDetectionIds.push(String(detId))
      const selected = idx === activeStsShipIndex
      // Remember the detection the *selected* line points to so the map can put
      // the "active" halo on that exact marker (keeping the halo and the blue
      // connector line in agreement).
      if (selected) {
        selectedShipId = sid
        if (detId != null) selectedDetId = String(detId)
      }
      return {
        shipId: sid,
        coord,
        selected,
        name: ships[sid]?.name || 'Unattributed',
        detId: detId != null ? String(detId) : null,
      }
    })
    setStsConnectorData({
      center,
      lines,
      keepDetectionIds,
      selectedDetId,
      selectedShipId,
    })
  }, [
    isStsTab,
    stsVersion,
    stsShipKey,
    activeShipTab,
    activeStsShipIndex,
    selectedDetectionId,
    allDetections,
    stsShowOverview,
    stsRosterView,
    setStsConnectorData,
  ])

  // Clear connectors when leaving the STS view entirely.
  useEffect(() => () => setStsConnectorData(null), [setStsConnectorData])

  // Map marker clicks (via Layout) request selecting a participant here so the
  // transfer-network selection stays in sync with what's clicked on the map. A
  // `drillIn` request additionally opens that vessel's full timeline inside the
  // event (the peek card's "View full details"), keeping the event flow.
  const handledStsSignalRef = useRef(null)
  useEffect(() => {
    if (
      !stsSelectSignal ||
      stsSelectSignal.nonce === handledStsSignalRef.current
    )
      return
    handledStsSignalRef.current = stsSelectSignal.nonce
    if (!isStsTab || !stsShipIds || stsShipIds.length < 2) return
    const idx = stsShipIds.findIndex(
      (sid) => String(sid) === String(stsSelectSignal.shipId)
    )
    if (idx >= 0) {
      setActiveStsShip(idx)
      if (stsSelectSignal.drillIn) setStsShowOverview(false)
    }
  }, [stsSelectSignal, isStsTab, stsShipKey])

  const activeShipId = isStsTab
    ? stsShipIds[activeStsShipIndex]
    : isPortTab
      ? null
      : activeShipTab
  const activeShip = activeShipId ? ships[activeShipId] : null
  const isActiveShipFavorite = activeShip?.id
    ? favoriteShipIds.includes(activeShip.id)
    : false
  const isActivePortFavorite = activeTab?.id
    ? favoritePorts.some((favoritePort) => favoritePort.id === activeTab.id)
    : false
  const isTiffaniShipTab = !isStsTab && activeShipId === 'tiffani'
  const showSanctionedTitle = activeShip?.id === 'tiffani' && isTiffaniShipTab
  const detailTabs = isTiffaniShipTab ? tiffaniDetailTabs : baseDetailTabs
  const stsPartnerShipId = isStsTab
    ? stsVersion !== 'v1'
      ? stsShipIds.find((_, i) => i !== activeStsShipIndex) || null
      : activeTab.shipIds[activeStsShip === 0 ? 1 : 0]
    : null
  const activeShipDetections = activeShipId
    ? allDetections
        .filter((d) => d.shipId === activeShipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []
  const timelineDetections = activeShipDetections.filter(
    (d) => d.type !== 'ais'
  )
  const timelineContextEvents = activeShipId
    ? TIMELINE_CONTEXT_EVENTS[activeShipId] || []
    : []
  const timelineItems = [
    ...timelineDetections.map((detection) => ({
      kind: 'detection',
      id: detection.id,
      sortTs: Number.isNaN(new Date(detection.date).getTime())
        ? 0
        : new Date(detection.date).getTime(),
      detection,
    })),
    ...timelineContextEvents.map((event) => ({
      kind: 'context',
      id: event.id,
      sortTs: Number.isNaN(new Date(event.sortDate).getTime())
        ? 0
        : new Date(event.sortDate).getTime(),
      event,
    })),
  ].sort((a, b) => b.sortTs - a.sortTs)
  const timelineTimeFilterLabel =
    TIMELINE_TIME_FILTER_OPTIONS.find(
      (option) => option.value === timelineTimeFilter
    )?.label || 'Max Time'
  const timelineEventTypeFilterLabel =
    TIMELINE_EVENT_TYPE_FILTER_OPTIONS.find(
      (option) => option.value === timelineEventTypeFilter
    )?.label || 'All Event Types'
  const timelineEventTypeDisplayLabel =
    timelineEventTypeFilter === 'all' ? 'All' : timelineEventTypeFilterLabel
  const timelineSortLabel =
    timelineSortOrder === 'desc'
      ? 'Sort by: Date (Newest)'
      : 'Sort by: Date (Oldest)'
  const timeFilteredTimelineItems = useMemo(() => {
    if (timelineTimeFilter === 'all') return timelineItems

    const monthWindowByFilter = {
      '6m': 6,
      '3m': 3,
      '1m': 1,
    }
    const monthWindow = monthWindowByFilter[timelineTimeFilter]
    if (!monthWindow) return timelineItems

    // Anchor to most-recent timeline event so filters stay meaningful for mock/historical data.
    const latestTimelineTs = timelineItems.find(
      (item) => Number.isFinite(item.sortTs) && item.sortTs > 0
    )?.sortTs
    if (!latestTimelineTs) return timelineItems

    const cutoffDate = new Date(latestTimelineTs)
    cutoffDate.setMonth(cutoffDate.getMonth() - monthWindow)
    const cutoffTs = cutoffDate.getTime()

    return timelineItems.filter(
      (item) => Number.isFinite(item.sortTs) && item.sortTs >= cutoffTs
    )
  }, [timelineItems, timelineTimeFilter])
  const filteredTimelineItems = useMemo(() => {
    if (timelineEventTypeFilter === 'all') return timeFilteredTimelineItems

    return timeFilteredTimelineItems.filter((item) => {
      if (timelineEventTypeFilter === 'port-of-calls') {
        return item.kind === 'context' && item.event?.variant === 'port'
      }
      if (item.kind !== 'detection') return false

      if (timelineEventTypeFilter === 'ship-to-ship') {
        return (
          item.detection?.type === 'sts' || item.detection?.type === 'sts-ais'
        )
      }
      if (timelineEventTypeFilter === 'spoofing') {
        return item.detection?.type === 'spoofing'
      }
      if (timelineEventTypeFilter === 'ais-dark') {
        return item.detection?.type === 'dark'
      }
      return true
    })
  }, [timeFilteredTimelineItems, timelineEventTypeFilter])
  const sortedFilteredTimelineItems = useMemo(
    () =>
      [...filteredTimelineItems].sort((a, b) =>
        timelineSortOrder === 'asc' ? a.sortTs - b.sortTs : b.sortTs - a.sortTs
      ),
    [filteredTimelineItems, timelineSortOrder]
  )

  const latestDetection = activeShipDetections[0] || null
  const latestAisDetection =
    activeShipDetections.find((d) => d.type === 'ais') || null
  const loadedTimelineLocationIds = [
    ...(latestAisDetection ? [latestAisDetection.id] : []),
    ...sortedFilteredTimelineItems
      .filter((item) => item.kind === 'detection' && item.detection?.id != null)
      .map((item) => item.detection.id),
  ]
  const allLoadedTimelineLocationsShown =
    loadedTimelineLocationIds.length > 0 &&
    loadedTimelineLocationIds.every((detectionId) =>
      shownOnMapDetectionIds.some(
        (shownId) =>
          normalizeDetectionId(shownId) === normalizeDetectionId(detectionId)
      )
    )
  const toggleAllLoadedTimelineLocations = () => {
    const loadedIds = new Set(
      loadedTimelineLocationIds.map((id) => normalizeDetectionId(id))
    )
    setShownOnMapDetectionIds((current) =>
      allLoadedTimelineLocationsShown
        ? current.filter(
            (id) => !loadedIds.has(normalizeDetectionId(id))
          )
        : [
            ...current,
            ...loadedTimelineLocationIds.filter(
              (id) =>
                !current.some(
                  (currentId) =>
                    normalizeDetectionId(currentId) === normalizeDetectionId(id)
                )
            ),
          ]
    )
  }
  const latestCoordinateDetection =
    activeShipDetections.find(
      (d) =>
        typeof d?.lat === 'number' &&
        Number.isFinite(d.lat) &&
        typeof d?.lng === 'number' &&
        Number.isFinite(d.lng)
    ) || null
  const latestKnownLocationDetection =
    latestCoordinateDetection || latestAisDetection || latestDetection
  const hasPendingNewLastKnownData = Boolean(
    activeShipId && newLastKnownDotByShip[activeShipId]
  )
  const pendingLatestKnownDetection = activeShipId
    ? pendingLastKnownDetectionByShip[activeShipId] || null
    : null
  const hoverLastKnownDetection =
    hasPendingNewLastKnownData && pendingLatestKnownDetection
      ? pendingLatestKnownDetection
      : latestKnownLocationDetection
  const latestNonStsDetection = activeShipDetections.find(
    (d) => d.type !== 'sts' && d.type !== 'sts-ais'
  )

  useEffect(() => {
    const container = detailTabScrollRef.current
    const activeDetailTabEl = detailTabButtonRefs.current[activeDetailTab]
    if (!container || !activeDetailTabEl) return

    const padding = 18
    const currentLeft = container.scrollLeft
    const currentRight = currentLeft + container.clientWidth
    const tabLeft = activeDetailTabEl.offsetLeft - padding
    const tabRight =
      activeDetailTabEl.offsetLeft + activeDetailTabEl.offsetWidth + padding

    if (tabLeft < currentLeft) {
      container.scrollTo({ left: Math.max(0, tabLeft), behavior: 'smooth' })
      return
    }
    if (tabRight > currentRight) {
      container.scrollTo({
        left: tabRight - container.clientWidth,
        behavior: 'smooth',
      })
    }
  }, [activeDetailTab, detailTabs.length])

  useEffect(() => {
    if (!activeShipId) return
    if (newLastKnownDotByShip[activeShipId]) return
    if (pendingLastKnownDetectionByShip[activeShipId]) return
    if (newLastKnownDotTimersRef.current[activeShipId]) return

    newLastKnownDotTimersRef.current[activeShipId] = window.setTimeout(() => {
      const baseDetection =
        latestAisDetection || latestCoordinateDetection || latestDetection
      const fallbackLat = parseFiniteNumber(activeShip?.aisInfo?.latitude)
      const fallbackLng = parseFiniteNumber(activeShip?.aisInfo?.longitude)
      const nextSimulatedDetection = {
        id: nextSimulatedDetectionIdRef.current++,
        shipId: activeShipId,
        type: 'ais',
        isSyntheticLastKnown: true,
        lat:
          fallbackLat ??
          (typeof baseDetection?.lat === 'number' ? baseDetection.lat : 0),
        lng:
          fallbackLng ??
          (typeof baseDetection?.lng === 'number' ? baseDetection.lng : 0),
        date: formatPrototypeDetectionDate(new Date()),
      }
      setPendingLastKnownDetectionByShip((prev) => ({
        ...prev,
        [activeShipId]: nextSimulatedDetection,
      }))
      setNewLastKnownDotByShip((prev) => ({
        ...prev,
        [activeShipId]: true,
      }))
      delete newLastKnownDotTimersRef.current[activeShipId]
    }, NEW_LAST_KNOWN_DOT_DELAY_MS)
  }, [
    activeShipId,
    activeShip,
    latestAisDetection,
    latestCoordinateDetection,
    latestDetection,
    newLastKnownDotByShip,
    pendingLastKnownDetectionByShip,
  ])

  useEffect(() => {
    if (!activeShipTab || !activeShipDetections.length) return
    if (selectedDetectionId != null) return
    const preferredId = isStsTab
      ? activeShipDetections.find((d) => d.stsPartner === stsPartnerShipId)?.id
      : activeShipDetections[0]?.id
    if (!preferredId) return
    // Only auto-select when nothing is selected yet.
    // Avoid overriding explicit user-driven selection/focus state.
    if (selectedCard == null) {
      updateTabState('selectedCard', preferredId)
    }
  }, [
    activeShipTab,
    activeShipDetections,
    selectedCard,
    selectedDetectionId,
    isStsTab,
    stsPartnerShipId,
  ])
  const isStsUnattributed =
    isStsTab && activeTab?.stsType === 'sts' && activeStsShip === 1
  const selectedDetection = selectedCard
    ? activeShipDetections.find(
        (d) => normalizeDetectionId(d.id) === normalizeDetectionId(selectedCard)
      ) || latestDetection
    : latestDetection
  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (selectedCard == null || !selectedDetection) return
    if (
      normalizeDetectionId(selectedDetection.id) !==
      normalizeDetectionId(selectedCard)
    ) {
      // Surface state divergence quickly while prototyping.
      console.warn(
        '[selection-sync] selectedCard does not match resolved selectedDetection',
        {
          activeShipTab,
          selectedCard,
          resolvedDetectionId: selectedDetection.id,
          resolvedDetectionType: selectedDetection.type,
        }
      )
    }
  }, [activeShipTab, selectedCard, selectedDetection])
  const isUnattributed =
    isStsUnattributed || selectedDetection?.type === 'unattributed'
  const canCopyImo = !isUnattributed && Boolean(activeShip?.imo)
  const canCopyMmsi = !isUnattributed && Boolean(activeShip?.mmsi)
  const canCopyShipId = !isUnattributed && Boolean(activeShip?.shipId)
  const shouldShowNewAisDetailsRow = selectedDetection?.type === 'ais'
  const selectedSatDetectionForTab = activeShipTab
    ? (selectedSatDetectionByTab[activeShipTab] ?? null)
    : null
  const activeMapToolPanels = openMapToolPanelsByTab['__global__'] || []

  useEffect(() => {
    setV10CollapsedToolIds((current) =>
      current.filter((toolId) => v10OpenToolIds.includes(toolId))
    )
  }, [v10OpenToolIds])

  useEffect(() => {
    setPanelFocusDetectionId(selectedDetection?.id ?? null)
  }, [selectedDetection?.id, setPanelFocusDetectionId])

  useEffect(() => {
    if (activeDetailTab !== 1 || !activeShipTab || !selectedDetection) return
    if (!SAT_TIMELINE_DETECTION_TYPES.includes(selectedDetection.type)) return
    setSelectedSatDetectionByTab((prev) => ({
      ...prev,
      [activeShipTab]: normalizeDetectionId(selectedDetection.id),
    }))
  }, [
    activeDetailTab,
    activeShipTab,
    selectedDetection?.id,
    selectedDetection?.type,
  ])

  const eventLabel = {
    ais: 'AIS',
    light: 'Light',
    dark: 'Dark',
    spoofing: 'Spoofing',
    sts: 'Ship-to-Ship',
    'sts-ais': 'Ship-to-Ship',
    unattributed: 'Unattributed',
  }

  const MULTI_SELECT_PANEL_TOOLS = new Set([
    'extended-path',
    'future-path-prediction',
    'estimated-location',
  ])
  const handleShipToolAction = useCallback(
    (toolId) => {
      if (toolId === 'path-playback') {
        if (selectedDetection?.id != null) {
          navigate(`/temporal-analysis/${selectedDetection.id}`)
        }
        return
      }
      if (!MULTI_SELECT_PANEL_TOOLS.has(toolId)) return
      if (shipDetailsVersion === 'v10') {
        openPanel?.()
        setDetailPanelOpen(true)
        setEventToolsPoppedOut(true)
        setV10OpenToolIds((current) =>
          current.includes(toolId)
            ? current.filter((id) => id !== toolId)
            : [...current, toolId]
        )
        return
      }
      toggleMapToolPanel(toolId)
    },
    [
      navigate,
      openPanel,
      selectedDetection?.id,
      setDetailPanelOpen,
      shipDetailsVersion,
      toggleMapToolPanel,
    ]
  )

  const navigateToDetection = (targetDetection) => {
    if (!targetDetection) return

    setFlashEnabled(true)
    setActiveDetectionId(targetDetection.id)
    setPreviewDetectionId(null)
    updateTabState('previewCards', [])

    if (isStsTab && activeTab) {
      const currentShipId = activeTab.shipIds[activeStsShip]
      const existingSingleShipTab = shipTabs.find(
        (t) => t.id === currentShipId && t.type !== 'sts'
      )

      if (existingSingleShipTab) {
        setTabState((prev) => ({
          ...prev,
          [currentShipId]: {
            ...prev[currentShipId],
            selectedCard: targetDetection.id,
            previewCards: [],
            activeDetailTab: prev[currentShipId]?.activeDetailTab ?? 0,
          },
        }))
        setActiveShipTab(currentShipId)
        return
      }

      openShipTab(targetDetection)
      return
    }

    updateTabState('selectedCard', targetDetection.id)
  }

  const handleShowLastKnownLocation = () => {
    if (!activeShipId) return

    const baseDetection =
      latestAisDetection || latestCoordinateDetection || latestDetection
    const fallbackLat = parseFiniteNumber(activeShip?.aisInfo?.latitude)
    const fallbackLng = parseFiniteNumber(activeShip?.aisInfo?.longitude)
    const baseLat =
      fallbackLat ??
      (typeof baseDetection?.lat === 'number' ? baseDetection.lat : 0)
    const baseLng =
      fallbackLng ??
      (typeof baseDetection?.lng === 'number' ? baseDetection.lng : 0)
    const offsetSeed = Number(nextSimulatedDetectionIdRef.current % 7) + 1
    const oceanOffsetLng = 0.8 + offsetSeed * 0.03
    const oceanOffsetLat = -0.15 + offsetSeed * 0.01
    const targetDetection = {
      id: nextSimulatedDetectionIdRef.current++,
      shipId: activeShipId,
      type: 'ais',
      isSyntheticLastKnown: true,
      // Always create a fresh, current AIS event for this action.
      // Push the prototype point offshore so it doesn't appear on land.
      lat: baseLat + oceanOffsetLat,
      lng: baseLng + oceanOffsetLng,
      date: formatPrototypeDetectionDate(new Date()),
    }
    setRuntimeDetections((prev) => [
      ...prev.filter(
        (d) => !(d.shipId === activeShipId && d.isSyntheticLastKnown)
      ),
      targetDetection,
    ])
    setPendingLastKnownDetectionByShip((prev) => ({
      ...prev,
      [activeShipId]: null,
    }))

    setFlashEnabled(true)
    setPreviewDetectionId(null)
    setSelectedDetectionId(null)
    updateTabState('previewCards', [])
    setActiveDetectionId(targetDetection.id)

    // Preserve STS tab behavior when jumping from a grouped tab.
    if (isStsTab && activeTab && !targetDetection.stsPartner) {
      openShipTab(targetDetection)
    } else {
      updateTabState('selectedCard', targetDetection.id)
    }

    if (activeShipId) {
      if (newLastKnownDotTimersRef.current[activeShipId]) {
        window.clearTimeout(newLastKnownDotTimersRef.current[activeShipId])
        delete newLastKnownDotTimersRef.current[activeShipId]
      }
      setNewLastKnownDotByShip((prev) => ({
        ...prev,
        [activeShipId]: false,
      }))
    }
  }

  const eventColorMap = {
    ais: '#00EB6C',
    light: '#00A3E3',
    dark: '#FFA500',
    spoofing: '#FF6D99',
    unattributed: '#F75349',
    sts: '#00A3E3',
    'sts-ais': '#00EB6C',
  }

  const getLatestNonStsByShip = useCallback(
    (shipId) => {
      return allDetections
        .filter(
          (d) => d.shipId === shipId && d.type !== 'sts' && d.type !== 'sts-ais'
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    },
    [allDetections]
  )

  const getStsTabBarColors = useCallback((tab) => {
    if (!tab || tab.type !== 'sts') return null
    const color1 = eventColorMap.light
    const color2 =
      tab.stsType === 'sts' ? eventColorMap.unattributed : eventColorMap.ais
    return [color1, color2]
  }, [])

  const renderStsBars = useCallback((colors, size) => {
    if (!colors) return null
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: size.gap,
          flexShrink: 0,
          height: size.height,
        }}
      >
        <Box
          style={{
            width: size.width,
            height: size.height,
            backgroundColor: colors[0],
          }}
        />
        <Box
          style={{
            width: size.width,
            height: size.height,
            backgroundColor: colors[1],
          }}
        />
      </Box>
    )
  }, [])

  const getStsDetectionBarColors = useCallback((det) => {
    if (!det || (det.type !== 'sts' && det.type !== 'sts-ais')) return null
    const leftType = 'light'
    const rightType = det.type === 'sts' ? 'unattributed' : 'ais'
    return [
      eventColorMap[leftType] || eventColorMap.light,
      eventColorMap[rightType] || eventColorMap.unattributed,
    ]
  }, [])

  const renderStsTabIcon = useCallback(
    (tab, size = { width: 8, height: 20, gap: 2 }) => {
      const colors = getStsTabBarColors(tab)
      return renderStsBars(colors, size)
    },
    [getStsTabBarColors, renderStsBars]
  )

  // Shared STS event hero image with numbered pins. Used on the Overview and (in
  // v10) on each vessel tab, where `activeIdx` highlights that vessel's pin and
  // dims the rest so the analyst can locate it in the rafting.
  const renderStsHero = useCallback(
    (
      list,
      {
        activeIdx = null,
        height = 260,
        width = '100%',
        marginBottom = 16,
        borderRadius = 8,
        onPinClick,
      } = {}
    ) => {
      if (!Array.isArray(list) || list.length === 0) return null
      const heroByCount = {
        // 0 vessels = open-ocean plate with no ships (baseline / empty scene).
        0: satRaftOcean,
        2: satRaft2,
        3: satRaft3,
        4: satRaft4,
        5: satRaft5,
        6: satRaft6,
      }
      const pinPosByCount = {
        2: [
          { top: '34%', left: '44%' },
          { top: '52%', left: '55%' },
        ],
        3: [
          { top: '30%', left: '42%' },
          { top: '62%', left: '50%' },
          { top: '30%', left: '59%' },
        ],
        4: [
          { top: '30%', left: '36%' },
          { top: '62%', left: '45%' },
          { top: '30%', left: '55%' },
          { top: '62%', left: '64%' },
        ],
        5: [
          { top: '28%', left: '37%' },
          { top: '60%', left: '44%' },
          { top: '28%', left: '50%' },
          { top: '60%', left: '56%' },
          { top: '28%', left: '62%' },
        ],
        6: [
          { top: '28%', left: '36%' },
          { top: '60%', left: '42%' },
          { top: '28%', left: '47%' },
          { top: '60%', left: '53%' },
          { top: '28%', left: '59%' },
          { top: '60%', left: '65%' },
        ],
      }
      const heroImage = heroByCount[list.length] || satRaft5
      const pinPos = pinPosByCount[list.length] || pinPosByCount[5]
      const hasActive = activeIdx != null

      // v17: instead of numbered pins, draw a segmentation-style "mask edge"
      // capsule over each vessel's hull. Hovering a hull spotlights it (dims
      // the rest of the clip, brightens its outline, drops corner reticles, and
      // surfaces a mini clip card) and clicking drills into that vessel — a
      // synthesis of Seb's Spotlight / Magnifier / Mini Clip Card concepts.
      if (
        stsVersion === 'v17' ||
        stsVersion === 'v20' ||
        stsVersion === 'v21'
      ) {
        // Pen-traced hull outlines (Figma), baked into the hero image's own
        // pixel space (viewBox 0 0 1536 1024) and drawn with the same `cover`
        // crop as the <img>, so each outline hugs its ship at any box size.
        // `bbox` (center + size, image px) drives the spotlight aperture and the
        // corner reticle. Counts without traces yet render no overlay.
        const HERO_VB = { w: 1536, h: 1024 }
        // Pen-traced hull outlines (Figma), kept EXACTLY as authored in their own
        // trace space. Position and size are split so each hull is easy to tune by
        // hand: `tx/ty` move it (a <g translate> — also overridable via the
        // `.sts-hull-*` CSS class), `sx/sy` resize it (a scale on the <path>). The
        // brown/left hull is wider than the gray/right one, so each gets its own
        // numbers. `tb` is the hull's bbox in trace space; the spotlight center
        // (`cx/cy/w/h`) is derived from it + the transform, so the aperture follows
        // whenever you nudge `tx/ty/sx/sy`. Counts without traces render no overlay.
        const hullOutlinesByCount = {
          2: {
            hulls: [
              {
                d: 'M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z',
                tx: 567.7,
                ty: 139.8,
                sx: 1.0944,
                sy: 1.0143,
                tb: [3, 12, 173, 779],
              },
              {
                d: 'M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z',
                tx: 585.4,
                ty: 146.9,
                sx: 1.0135,
                sy: 1.0181,
                tb: [191, 3, 339, 779],
              },
            ],
          },
          3: {
            hulls: [
              {
                d: 'M114.5 780.005H54.0002C14.0002 720.805 3.33358 633.671 3.00024 597.505L11.0002 159.005C26.2002 46.2047 79.5002 10.4526 95.0002 14.0047C138 27.0046 165.667 118.338 168.5 159.005V597.505C164.5 674.305 130.834 751.171 114.5 780.005Z',
                tx: 506.1,
                ty: 116.8,
                sx: 0.9728,
                sy: 1.0349,
                tb: [3, 13.8, 168.5, 780],
              },
              {
                d: 'M295 781.005H237C207.4 729.805 193 649.671 189.5 616.005V161.005C200.3 37.4045 242.334 5.50454 262 5.00457C308.4 4.60457 327.334 108.838 331 161.005L337 616.005C331.4 684.005 306.667 754.338 295 781.005Z',
                tx: 467.6,
                ty: 114.8,
                sx: 1.1526,
                sy: 1.0438,
                tb: [189.5, 5, 337, 781],
              },
              {
                d: 'M473 776.005H411C377.4 728.005 360.334 648.005 356 614.005L350 159.005C364.4 33.4045 407.334 2.67121 427 3.00457C468.6 2.20457 494.334 106.671 502 159.005L516 614.005C511.2 682.005 485.334 750.338 473 776.005Z',
                tx: 496.0,
                ty: 120.9,
                sx: 1.0485,
                sy: 1.0362,
                tb: [350, 3, 516, 776],
              },
            ],
          },
          4: {
            hulls: [
              {
                d: 'M41.5008 712.03H88.0008C109.201 688.83 129.834 609.697 137.501 573.03L149.501 128.53C145.101 36.93 104.667 11.3634 85.0008 10.03C41.8008 10.43 21.3341 89.1967 16.5008 128.53L3.00078 573.03C4.20078 643.03 29.1674 694.863 41.5008 712.03Z',
                tx: 482.8,
                ty: 198.4,
                sx: 1.0514,
                sy: 0.9573,
                tb: [3, 10, 149.5, 712],
              },
              {
                d: 'M162.001 138.53L151.001 569.53C155.001 642.33 180.334 693.863 192.501 710.53H233.001C258.201 682.53 277.167 604.863 283.501 569.53L293.001 138.53C291.801 38.93 251.501 10.3634 231.501 8.53003C183.501 9.33003 165.167 95.53 162.001 138.53Z',
                tx: 486.3,
                ty: 199.8,
                sx: 1.0707,
                sy: 0.963,
                tb: [151, 8.5, 293, 710.5],
              },
              {
                d: 'M296.501 569.53C294.101 631.93 321.501 687.197 335.501 707.03H377.501C396.701 690.63 419.834 608.53 429.001 569.53L434.501 129.53C430.901 25.9299 390.667 2.02994 371.001 3.02994C320.201 7.02993 305.501 89.0299 304.501 129.53L296.501 569.53Z',
                tx: 479.9,
                ty: 202.1,
                sx: 1.1003,
                sy: 0.9616,
                tb: [296.4, 3, 434.5, 707],
              },
              {
                d: 'M446.501 142.03V564.53C452.101 632.13 478.834 684.697 491.501 702.53H533.501C563.901 659.33 576.501 592.53 579.001 564.53V145.03C575.401 40.63 533.167 8.1967 512.501 5.03003C463.701 6.63003 448.167 97.03 446.501 142.03Z',
                tx: 460.5,
                ty: 201.1,
                sx: 1.1321,
                sy: 0.9663,
                tb: [446.5, 5, 579, 702.5],
              },
            ],
          },
          5: {
            hulls: [
              {
                d: 'M25.7061 632.504L63.7061 634.504C87.3061 604.504 100.873 540.67 104.706 512.503L135.706 121.504C136.506 25.9035 109.04 2.67019 95.2062 3.00352C60.8062 3.00352 42.5395 76.0035 37.7062 112.504L3.70612 505.004C-0.693882 569.004 16.5395 616.67 25.7061 632.504Z',
                tx: 508.6,
                ty: 192.1,
                sx: 0.7987,
                sy: 0.9819,
                tb: [3, 3, 135.7, 634.5],
              },
              {
                d: 'M148.706 647.003H185.206C205.206 615.803 217.873 555.337 221.706 529.003L236.706 115.003C229.106 51.8034 204.206 30.0034 192.706 27.0034C162.706 28.6034 147.206 83.6701 143.206 111.003L122.706 520.003C119.906 582.403 138.873 630.67 148.706 647.003Z',
                tx: 503.4,
                ty: 178.1,
                sx: 0.9276,
                sy: 0.9952,
                tb: [122.4, 27, 236.7, 647],
              },
              {
                d: 'M250.706 144.503L230.706 522.503C227.616 580.903 245.419 631.837 254.706 650.003H287.206C307.606 616.403 320.039 558.337 323.706 533.503L343.706 149.003C344.506 65.0034 316.373 41.3368 302.206 40.0034C266.606 40.4034 253.039 109.837 250.706 144.503Z',
                tx: 507.6,
                ty: 179.7,
                sx: 0.935,
                sy: 1.0082,
                tb: [230.4, 40, 343.7, 650],
              },
              {
                d: 'M354.206 151.003L327.706 545.503C326.506 606.303 341.54 652.17 349.206 667.503L392.206 669.003C403.006 652.203 421.04 588.337 428.706 558.503L454.706 158.003C455.906 70.4034 425.873 45.5034 410.706 44.0034C377.106 44.8034 359.04 115.67 354.206 151.003Z',
                tx: 555.8,
                ty: 191.8,
                sx: 0.834,
                sy: 0.9809,
                tb: [327.6, 44, 454.7, 669],
              },
              {
                d: 'M462.206 198.503L469.706 600.003C476.106 642.803 492.706 675.17 500.206 686.003H539.706C547.306 672.003 558.54 622.837 563.206 600.003L553.206 198.503C546.806 103.703 516.873 80.67 502.706 81.0033C467.906 85.4033 461.206 161.17 462.206 198.503Z',
                tx: 450.3,
                ty: 177.4,
                sx: 1.0488,
                sy: 0.995,
                tb: [462.1, 81, 563.2, 686],
              },
            ],
          },
        }
        const outlineSet = hullOutlinesByCount[list.length] || null
        // Derive each hull's spotlight aperture (image px) from its trace bbox +
        // transform, so `cx/cy/w/h` stay correct after any `tx/ty/sx/sy` tweak.
        const outlines = outlineSet
          ? outlineSet.hulls.map((o) => {
              const [x0, y0, x1, y1] = o.tb
              return {
                ...o,
                cx: o.tx + o.sx * ((x0 + x1) / 2),
                cy: o.ty + o.sy * ((y0 + y1) / 2),
                w: o.sx * (x1 - x0),
                h: o.sy * (y1 - y0),
              }
            })
          : null
        const hasOutlines =
          Array.isArray(outlines) && outlines.length === list.length
        // v21: bounding-box mini-clips instead of segmentation outlines.
        const bboxMode = stsVersion === 'v21'
        // Hover wins; fall back to any externally-driven active vessel.
        const focusIdx =
          stsHeroHoverIdx != null && stsHeroHoverIdx < list.length
            ? stsHeroHoverIdx
            : activeIdx
        const hasFocus = stsSegmentOn && hasOutlines && focusIdx != null
        const focusShape = hasFocus ? outlines[focusIdx] : null
        const focusSid = hasFocus ? list[focusIdx] : null
        const focusShip = focusSid ? ships[focusSid] : null
        const focusName = focusShip?.name || 'Unattributed'
        const focusLength =
          focusShip?.aisInfo?.length || focusShip?.synMaxInfo?.length
        const focusHeading =
          focusShip?.aisInfo?.heading || focusShip?.synMaxInfo?.heading
        // Deterministic demo confidence so the card reads as real per-ship data.
        const focusConf = hasFocus ? 88 + ((focusIdx * 13) % 11) : 0
        // Park the mini clip card on the opposite side from the focused hull.
        const cardOnLeft = focusShape ? focusShape.cx >= HERO_VB.w / 2 : false
        // Segmentation edge color: white for attributed hulls (reads clearly on
        // the dark water), amber for unattributed (mirrors pin semantics).
        const restEdge = 'rgba(255, 255, 255, 0.7)'
        return (
          <Box
            style={{
              position: 'relative',
              borderRadius,
              overflow: 'hidden',
              border: '1px solid #393C56',
              marginBottom,
              width,
              flexShrink: width === '100%' ? undefined : 0,
            }}
          >
            <img
              src={heroImage}
              alt="Ship-to-ship event"
              style={{
                width: '100%',
                height,
                objectFit: 'cover',
                display: 'block',
                filter: hasFocus ? 'brightness(0.9)' : 'none',
                transition: 'filter 0.2s ease',
              }}
            />
            {/* Honest fallback: we only have pen-traced hulls for 2–5 vessels.
                For any other count the stock raft image can't match the event,
                so instead of a silently-dead toggle we say so outright. Only on
                the full-size overview hero (not the tiny drill-in thumbnail). */}
            {stsSegmentOn && !hasOutlines && width === '100%' && (
              <Box
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(3, 6, 15, 0.62)',
                  border: '1px solid rgba(141,147,168,0.45)',
                  zIndex: 3,
                }}
              >
                <Text
                  style={{
                    color: '#C2C7D6',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  {`Segmentation unavailable for ${list.length} vessels`}
                </Text>
              </Box>
            )}
            {/* Segmentation overlay: outlines + spotlight + reticle, all in the
                image's pixel space with the same `cover` crop as the <img>.
                Hidden entirely when the analyst turns SEGMENT FOCUS off. */}
            {stsSegmentOn && hasOutlines && (
              <svg
                viewBox={`0 0 ${HERO_VB.w} ${HERO_VB.h}`}
                preserveAspectRatio="xMidYMid slice"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                {/* Spotlight: dim everything except a soft ellipse on the hull. */}
                {hasFocus &&
                  (() => {
                    const r = focusShape.w * 0.95
                    const sy = (focusShape.h * 0.62) / r
                    const gid = `stsSpot-${Math.round(focusShape.cx)}-${list.length}`
                    return (
                      <>
                        <defs>
                          <radialGradient
                            id={gid}
                            gradientUnits="userSpaceOnUse"
                            cx={focusShape.cx}
                            cy={focusShape.cy}
                            r={r}
                            gradientTransform={`translate(0 ${focusShape.cy * (1 - sy)}) scale(1 ${sy})`}
                          >
                            <stop
                              offset="46%"
                              stopColor="#03060f"
                              stopOpacity="0"
                            />
                            <stop
                              offset="100%"
                              stopColor="#03060f"
                              stopOpacity="0.62"
                            />
                          </radialGradient>
                        </defs>
                        <rect
                          x="0"
                          y="0"
                          width={HERO_VB.w}
                          height={HERO_VB.h}
                          fill={`url(#${gid})`}
                          style={{ pointerEvents: 'none' }}
                        />
                      </>
                    )
                  })()}
                {/* Per-hull outlines (the hover/click target). Position and size
                    are split: the <g> only translates (nudge with `tx/ty`, or
                    override `transform` on the `.sts-hull-*` class in CSS), the
                    <path> only scales (`sx/sy`). Focused hull is drawn last so its
                    glow sits above its neighbour. */}
                {outlines
                  .map((o, idx) => ({ o, idx }))
                  .sort(
                    (a, b) =>
                      (a.idx === focusIdx ? 1 : 0) -
                      (b.idx === focusIdx ? 1 : 0)
                  )
                  .map(({ o, idx }) => {
                    const sid = list[idx]
                    const s = ships[sid]
                    const attributed = Boolean(s) && sid !== 'unknown'
                    const isFocus = hasFocus && idx === focusIdx
                    const dimmed = hasFocus && !isFocus
                    const edge = attributed
                      ? isFocus
                        ? '#FFFFFF'
                        : restEdge
                      : isFocus
                        ? '#F7B24A'
                        : 'rgba(247, 178, 74, 0.45)'
                    const glow = attributed
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(247,178,74,0.7)'
                    // v21: draw a bounding box (mini-clip rectangle) instead of
                    // the pixel-accurate segmentation outline. The rect uses the
                    // hull's trace bbox in the same local space, so it inherits
                    // the same group transform and reads as a tight box.
                    const shapeProps = {
                      transform: `scale(${o.sx} ${o.sy})`,
                      vectorEffect: 'non-scaling-stroke',
                      fill: isFocus
                        ? 'rgba(255,255,255,0.14)'
                        : 'rgba(0,0,0,0.001)',
                      stroke: edge,
                      strokeWidth: isFocus ? 2.5 : 1.5,
                      strokeLinejoin: 'round',
                      onClick: onPinClick ? () => onPinClick(idx) : undefined,
                      onMouseEnter: () => setStsHeroHoverIdx(idx),
                      onMouseLeave: () =>
                        setStsHeroHoverIdx((cur) =>
                          cur === idx ? null : cur
                        ),
                      style: {
                        cursor: onPinClick ? 'pointer' : 'default',
                        pointerEvents: 'all',
                        opacity: dimmed ? 0.35 : 1,
                        filter: isFocus
                          ? `drop-shadow(0 0 4px ${glow})`
                          : 'none',
                        transition:
                          'stroke 0.18s ease, stroke-width 0.18s ease, opacity 0.18s ease',
                      },
                    }
                    const [bx0, by0, bx1, by1] = o.tb
                    return (
                      <g
                        key={`seg-${sid}-${idx}`}
                        className={`sts-hull sts-hull-${list.length}-${idx} ${
                          idx === 0 ? 'sts-hull-left' : 'sts-hull-right'
                        }`}
                        transform={`translate(${o.tx} ${o.ty})`}
                      >
                        {bboxMode ? (
                          <rect
                            x={bx0}
                            y={by0}
                            width={bx1 - bx0}
                            height={by1 - by0}
                            {...shapeProps}
                          />
                        ) : (
                          <path d={o.d} {...shapeProps} />
                        )}
                      </g>
                    )
                  })}
              </svg>
            )}
            {/* Mini clip card for the focused hull (CONF / LENGTH / HEADING).
                The "SHIP N" eyebrow + vessel name identify the card, so the old
                "SEGMENTED MINI-CLIP" label was dropped to save space. */}
            {hasFocus && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: cardOnLeft ? 10 : undefined,
                  right: cardOnLeft ? undefined : 10,
                  // width: 150,
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(12, 15, 26, 0.92)',
                  border: `1px solid #006cd7`,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    // v21 (bounding boxes) shows only name + flag, so no gap
                    // below is needed.
                    marginBottom: bboxMode ? 0 : 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {focusName}
                  </Text>
                  {focusShip?.flag && (
                    <Text style={{ fontSize: 13, lineHeight: 1 }}>
                      {focusShip.flag}
                    </Text>
                  )}
                </Box>
                {!bboxMode && (
                  <Box style={{ display: 'flex', gap: 12 }}>
                    <KeyValuePair keyName="CONF" value={`${focusConf}%`} />
                    <KeyValuePair
                      keyName="LENGTH"
                      value={focusLength ? `${focusLength}m` : '—'}
                    />
                    <KeyValuePair
                      keyName="HEADING"
                      value={focusHeading ? `${focusHeading}°` : '—'}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )
      }
      return (
        <Box
          style={{
            position: 'relative',
            borderRadius,
            overflow: 'hidden',
            border: '1px solid #393C56',
            marginBottom,
            width,
            flexShrink: width === '100%' ? undefined : 0,
          }}
        >
          <img
            src={heroImage}
            alt="Ship-to-ship event"
            style={{
              width: '100%',
              height,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {shipDetailsVersion !== 'v2' &&
            shipDetailsVersion !== 'v3' &&
            shipDetailsVersion !== 'v4' &&
            shipDetailsVersion !== 'v5' &&
            shipDetailsVersion !== 'v6' &&
            shipDetailsVersion !== 'v7' &&
            shipDetailsVersion !== 'v11' &&
            shipDetailsVersion !== 'v8' &&
            shipDetailsVersion !== 'v9' &&
            shipDetailsVersion !== 'v10' &&
            list.map((sid, idx) => {
            const pos = pinPos[idx] || pinPos[pinPos.length - 1]
            const s = ships[sid]
            const attributed = Boolean(s) && sid !== 'unknown'
            const name = s?.name || 'Unattributed'
            const isActive = hasActive && idx === activeIdx
            const dimmed = hasActive && !isActive
            return (
              <Tooltip
                key={`pin-${sid}-${idx}`}
                label={`${idx + 1}. ${name}`}
                withArrow
                color="#181926"
                styles={{
                  tooltip: { color: '#fff', fontSize: 12, fontWeight: 600 },
                }}
              >
                <Box
                  onClick={onPinClick ? () => onPinClick(idx) : undefined}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    transform: `translate(-50%, -50%) scale(${isActive ? 1.2 : 1})`,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: attributed ? '#006CD7' : '#F75349',
                    border: isActive ? '2px solid #fff' : '2px solid #fff',
                    boxShadow: isActive
                      ? '0 0 0 3px rgba(0,148,255,0.6), 0 1px 4px rgba(0,0,0,0.5)'
                      : '0 1px 4px rgba(0,0,0,0.5)',
                    opacity: dimmed ? 0.4 : 1,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: onPinClick ? 'pointer' : 'default',
                    transition:
                      'opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                    zIndex: isActive ? 2 : 1,
                  }}
                >
                  {idx + 1}
                </Box>
              </Tooltip>
            )
            })}
        </Box>
      )
    },
    [ships, stsVersion, stsHeroHoverIdx, stsSegmentOn, shipDetailsVersion]
  )
  const selectedEventIsSts =
    selectedDetection?.type === 'sts' ||
    selectedDetection?.type === 'sts-ais'
  const selectedStsIcon = selectedEventIsSts
    ? (stsVersion === 'v17' ||
        stsVersion === 'v20' ||
        stsVersion === 'v21') &&
      (isStsTab || isStsShipTab)
      ? (
          <StsV20Icon
            type={activeTab?.stsType || selectedDetection?.type}
            size={16}
          />
        )
      : isStsTab && activeTab
        ? renderStsTabIcon(activeTab, { width: 6, height: 14, gap: 2 })
        : undefined
    : undefined

  const isLatest =
    !selectedCard || selectedDetection?.id === latestDetection?.id
  const selectedEventToolsPopoverContent =
    shipDetailsVersion === 'v7' ||
    shipDetailsVersion === 'v11' ||
    shipDetailsVersion === 'v8' ||
    shipDetailsVersion === 'v9' ? (
      <ShipDetailsPanel
        version={shipDetailsVersion}
        hideHeader
        selectedEvent={selectedDetection}
        isLatest={isLatest}
        eventLabel={eventLabel[selectedDetection?.type] || ''}
        eventIconOverride={selectedStsIcon}
        flashEnabled={false}
        unattributed={isUnattributed}
        onToolsVisibleChange={setDetailToolsVisible}
        onToolAction={handleShipToolAction}
        activeToolIds={activeMapToolPanels}
      />
    ) : null
  const shouldShowLastKnownLocationButton = latestKnownLocationDetection != null
  const satTimelineTimeFilterLabel =
    TIMELINE_TIME_FILTER_OPTIONS.find(
      (option) => option.value === satTimelineTimeFilter
    )?.label || 'Max Time'
  const satTimelineDataSourceFilterLabel =
    SAT_TIMELINE_DATA_SOURCE_FILTER_OPTIONS.find(
      (option) => option.value === satTimelineDataSourceFilter
    )?.label || 'All Sources'
  const satTimeFilteredDetections = useMemo(() => {
    const satDetections = activeShipDetections.filter((d) =>
      SAT_TIMELINE_DETECTION_TYPES.includes(d.type)
    )
    if (satTimelineTimeFilter === 'all') return satDetections

    const monthWindowByFilter = {
      '6m': 6,
      '3m': 3,
      '1m': 1,
    }
    const monthWindow = monthWindowByFilter[satTimelineTimeFilter]
    if (!monthWindow) return satDetections

    const latestTs = satDetections.reduce((maxTs, detection) => {
      const ts = new Date(detection.date).getTime()
      if (Number.isNaN(ts)) return maxTs
      return Math.max(maxTs, ts)
    }, 0)
    if (!latestTs) return satDetections

    const cutoffDate = new Date(latestTs)
    cutoffDate.setMonth(cutoffDate.getMonth() - monthWindow)
    const cutoffTs = cutoffDate.getTime()

    return satDetections.filter((detection) => {
      const ts = new Date(detection.date).getTime()
      return !Number.isNaN(ts) && ts >= cutoffTs
    })
  }, [activeShipDetections, satTimelineTimeFilter])
  const satFilteredDetections = useMemo(() => {
    if (satTimelineDataSourceFilter === 'all') return satTimeFilteredDetections
    return satTimeFilteredDetections.filter(
      (detection) =>
        getSatTimelineDataSource(detection.type) === satTimelineDataSourceFilter
    )
  }, [satTimeFilteredDetections, satTimelineDataSourceFilter])
  const focusedSatDetectionId = [activeDetectionId, selectedDetection?.id]
    .map((id) => (id == null ? null : normalizeDetectionId(id)))
    .find(
      (normalizedId) =>
        normalizedId != null &&
        satFilteredDetections.some(
          (detection) => normalizeDetectionId(detection.id) === normalizedId
        )
    )
  const compareSatTimelineDetections = (a, b) => {
    const aTs = new Date(a.date).getTime()
    const bTs = new Date(b.date).getTime()
    const safeA = Number.isNaN(aTs) ? 0 : aTs
    const safeB = Number.isNaN(bTs) ? 0 : bTs
    if (safeA !== safeB) {
      return satTimelineSortOrder === 'asc' ? safeA - safeB : safeB - safeA
    }
    const aId = Number(a.id) || 0
    const bId = Number(b.id) || 0
    return satTimelineSortOrder === 'asc' ? aId - bId : bId - aId
  }
  const sortedSatFilteredDetections = [...satFilteredDetections].sort(
    compareSatTimelineDetections
  )
  const shouldPrioritizeStsSatCard =
    timelineEventTypeFilter === 'ship-to-ship' ||
    selectedDetection?.type === 'sts' ||
    selectedDetection?.type === 'sts-ais'
  const normalizedSelectedSatDetectionForTab =
    selectedSatDetectionForTab != null &&
    satFilteredDetections.some(
      (detection) =>
        normalizeDetectionId(detection.id) ===
        normalizeDetectionId(selectedSatDetectionForTab)
    )
      ? normalizeDetectionId(selectedSatDetectionForTab)
      : null
  const stsPreferredSatDetectionId = shouldPrioritizeStsSatCard
    ? normalizeDetectionId(
        sortedSatFilteredDetections.find((detection) =>
          STS_PREFERRED_SAT_TIMELINE_DETECTION_TYPES.includes(detection.type)
        )?.id || sortedSatFilteredDetections[0]?.id
      )
    : null
  const selectedSatDetectionId = shouldPrioritizeStsSatCard
    ? stsPreferredSatDetectionId ||
      normalizedSelectedSatDetectionForTab ||
      focusedSatDetectionId ||
      null
    : normalizedSelectedSatDetectionForTab || focusedSatDetectionId || null

  useEffect(() => {
    if (activeDetailTab !== 1) return
    const container = scrollContainerRef.current
    if (!container) return

    if (selectedSatDetectionId == null) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const selectedCard =
      satCardRefs.current[normalizeDetectionId(selectedSatDetectionId)]
    if (!selectedCard) return

    const frame = window.requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect()
      const cardRect = selectedCard.getBoundingClientRect()
      const topOffset = 64
      const absoluteCardTop =
        container.scrollTop + (cardRect.top - containerRect.top)
      const targetTop = Math.max(0, absoluteCardTop - topOffset)
      container.scrollTo({ top: targetTop, behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeDetailTab, activeShipTab, selectedSatDetectionId])

  const shouldUseStsActiveSatImage = shouldPrioritizeStsSatCard
  const satelliteTimelineRows = sortedSatFilteredDetections.map((d) => {
    const latValue =
      typeof d.lat === 'number'
        ? d.lat.toFixed(4)
        : activeShip?.aisInfo?.latitude || 'No info'
    const lonValue =
      typeof d.lng === 'number'
        ? d.lng.toFixed(4)
        : activeShip?.aisInfo?.longitude || 'No info'
    const parsedDate = new Date(d.date)
    const capturedTime = Number.isNaN(parsedDate.getTime())
      ? d.date
      : parsedDate.toISOString()
    const isSelectedDetection =
      selectedSatDetectionId != null &&
      normalizeDetectionId(d.id) === selectedSatDetectionId
    return {
      id: `${activeShip?.id || 'ship'}-sat-${d.id}`,
      detectionId: d.id,
      isSelected: isSelectedDetection,
      detectionDateKey: getDetectionDateKey(d.date),
      image:
        shouldUseStsActiveSatImage && isSelectedDetection
          ? satImageD
          : getSatTimelineImageForDetection(d),
      capturedTime,
      latitude: latValue,
      longitude: lonValue,
      oid: 16100000 + d.id * 37,
    }
  })
  const ownershipInfo = SHIP_OWNERSHIP[activeShip?.id] || SHIP_OWNERSHIP.unknown
  const attributionRows = [
    {
      metric: 'Time',
      prediction: 'n/a',
      reference: 'n/a',
      difference: 'n/a',
      score: 'Mismatch',
      scoreColor: '#1B1D2D',
      scoreBg: '#FF533C',
    },
    {
      metric: 'Heading',
      prediction: activeShip?.synMaxInfo?.heading || 'n/a',
      reference: activeShip?.aisInfo?.heading || 'n/a',
      difference:
        activeShip?.synMaxInfo?.heading && activeShip?.aisInfo?.heading
          ? String(
              Math.abs(
                Number(activeShip.synMaxInfo.heading) -
                  Number(activeShip.aisInfo.heading)
              )
            )
          : 'n/a',
      score: 'Good',
      scoreColor: '#1B1D2D',
      scoreBg: '#85DB77',
    },
    {
      metric: 'Distance',
      prediction: 'n/a',
      reference: 'n/a',
      difference: 'n/a',
      score: 'Average',
      scoreColor: '#1B1D2D',
      scoreBg: '#FFCF5C',
    },
    {
      metric: 'Length',
      prediction: activeShip?.synMaxInfo?.shipLength || 'n/a',
      reference: activeShip?.aisInfo?.length || 'n/a',
      difference:
        activeShip?.synMaxInfo?.shipLength && activeShip?.aisInfo?.length
          ? String(
              Math.abs(
                Number(activeShip.synMaxInfo.shipLength) -
                  Number(activeShip.aisInfo.length)
              )
            )
          : 'n/a',
      score: 'Average',
      scoreColor: '#1B1D2D',
      scoreBg: '#FFCF5C',
    },
    {
      metric: 'Ship Type',
      prediction: activeShip?.synMaxInfo?.shipType || 'n/a',
      reference: activeShip?.aisInfo?.shipType || 'n/a',
      difference: 'n/a',
      score:
        activeShip?.synMaxInfo?.shipType === activeShip?.aisInfo?.shipType
          ? 'Good'
          : 'Mismatch',
      scoreColor:
        activeShip?.synMaxInfo?.shipType === activeShip?.aisInfo?.shipType
          ? '#1B1D2D'
          : '#1B1D2D',
      scoreBg:
        activeShip?.synMaxInfo?.shipType === activeShip?.aisInfo?.shipType
          ? '#85DB77'
          : '#FF533C',
    },
    {
      metric: 'Ship Sub-type',
      prediction: activeShip?.synMaxInfo?.shipSubtype || 'n/a',
      reference: activeShip?.aisInfo?.shipType || 'n/a',
      difference: 'n/a',
      score: 'Average',
      scoreColor: '#1B1D2D',
      scoreBg: '#FFCF5C',
    },
  ]

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {overflowLeft && (
          <Box
            onClick={() =>
              tabScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 50,
              cursor: 'pointer',
              background: '#24263C',
              borderBottom: '1px solid #393C56',
              borderRight: '1px solid #393C56',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              style={{
                color: '#898f9d',
                width: 16,
                height: 16,
                transform: 'rotate(90deg)',
              }}
            />
          </Box>
        )}
        <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Box
            ref={tabScrollRef}
            className="tab-scroll"
            style={{
              display: 'flex',
              flex: 1,
            }}
          >
            {shipTabs.map((tab, index) => {
              const isActive = activeShipTab === tab.id
              return (
                <Box
                  key={tab.id}
                  ref={(node) => {
                    if (node) {
                      tabButtonRefs.current[tab.id] = node
                    } else {
                      delete tabButtonRefs.current[tab.id]
                    }
                  }}
                  onClick={() => {
                    setFlashEnabled(false)
                    setActiveStsShip(0)
                    setActiveShipTab(tab.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 50,
                    padding: '0 12px',
                    cursor: 'pointer',
                    borderRight:
                      index === shipTabs.length - 1
                        ? 'none'
                        : '1px solid #393C56',
                    borderBottom: isActive ? 'none' : '1px solid #393C56',
                    background: isActive ? '#181926' : '#24263C',
                    position: 'relative',
                    zIndex: isActive ? 1 : 0,
                    marginBottom: isActive ? -1 : 0,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {tab.type === 'sts' ? (
                    <ShipIcon style={{ width: 16, height: 16 }} />
                  ) : tab.type === 'port' ? (
                    <Anchor style={{ width: 16, height: 16, color: '#fff' }} />
                  ) : (
                    <ShipIcon style={{ width: 16, height: 16 }} />
                  )}
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {tab.name}
                  </Text>
                  {isActive && (
                    <XClose
                      onClick={(e) => {
                        e.stopPropagation()
                        closeShipTab(tab.id)
                      }}
                      style={{
                        color: '#898f9d',
                        width: 14,
                        height: 14,
                        cursor: 'pointer',
                      }}
                    />
                  )}
                </Box>
              )
            })}
            <Box
              style={{
                flex: 1,
                height: 50,
                background: '#24263C',
                borderBottom: '1px solid #393C56',
              }}
            />
          </Box>
        </Box>
        {overflowRight && (
          <Box
            onClick={() =>
              tabScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 50,
              cursor: 'pointer',
              background: '#24263C',
              borderBottom: '1px solid #393C56',
              borderLeft: '1px solid #393C56',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              style={{
                color: '#898f9d',
                width: 16,
                height: 16,
                transform: 'rotate(-90deg)',
              }}
            />
          </Box>
        )}
        <Menu
          position="bottom-end"
          withinPortal
          opened={menuOpened}
          onChange={setMenuOpened}
        >
          <Menu.Target>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 50,
                cursor: 'pointer',
                background: '#24263C',
                borderBottom: '1px solid #393C56',
                borderLeft: '1px solid #393C56',
                flexShrink: 0,
              }}
            >
              <List style={{ color: '#898f9d', width: 18, height: 18 }} />
            </Box>
          </Menu.Target>
          <Menu.Dropdown
            styles={{
              dropdown: {
                background: '#1B1D2E',
                border: '1px solid #393C56',
                minWidth: 220,
                padding: 0,
              },
            }}
          >
            {/* Ships Section */}
            <Box
              style={{
                background: '#24263C',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#898f9d',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Ships
              </Text>
              {shipTabs.length > 0 && (
                <Text
                  onClick={() => {
                    setMenuOpened(false)
                    setShowCloseAllConfirmModal(true)
                  }}
                  style={{
                    color: '#F75349',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Close All
                </Text>
              )}
            </Box>
            {shipTabs.filter((t) => t.type !== 'sts').length > 0 ? (
              shipTabs
                .filter((t) => t.type !== 'sts')
                .map((tab, i, arr) => (
                  <React.Fragment key={tab.id}>
                    <Menu.Item
                      onClick={() => {
                        setFlashEnabled(false)
                        setActiveStsShip(0)
                        setActiveShipTab(tab.id)
                      }}
                      leftSection={
                        tab.type === 'port' ? (
                          <Anchor
                            style={{ width: 14, height: 14, color: '#fff' }}
                          />
                        ) : (
                          <ShipIcon style={{ width: 14, height: 14 }} />
                        )
                      }
                      styles={{
                        item: {
                          color: '#fff',
                          fontSize: 12,
                          padding: '12px 16px',
                          background:
                            activeShipTab === tab.id
                              ? '#393C56'
                              : 'transparent',
                          borderRadius: 0,
                        },
                        itemLabel: { color: '#fff' },
                      }}
                    >
                      {tab.name}
                    </Menu.Item>
                    {i < arr.length - 1 && (
                      <Box
                        style={{
                          height: 1,
                          background: '#393C56',
                          margin: 0,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))
            ) : (
              <Text
                style={{ color: '#555', fontSize: 12, padding: '12px 16px' }}
              >
                No ships open
              </Text>
            )}
            {/* Ship-to-Ship: only show section when there are STS tabs */}
            {shipTabs.some((t) => t.type === 'sts') && (
              <>
                <Box
                  style={{
                    background: '#24263C',
                    padding: '12px 16px',
                    marginTop: 0,
                  }}
                >
                  <Text
                    style={{
                      color: '#898f9d',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Ship-to-Ship
                  </Text>
                </Box>
                {shipTabs
                  .filter((t) => t.type === 'sts')
                  .map((tab, i, arr) => (
                    <React.Fragment key={tab.id}>
                      <Menu.Item
                        onClick={() => {
                          setFlashEnabled(false)
                          setActiveStsShip(0)
                          setActiveShipTab(tab.id)
                        }}
                        leftSection={
                          <ShipIcon style={{ width: 14, height: 14 }} />
                        }
                        styles={{
                          item: {
                            color: '#fff',
                            fontSize: 12,
                            padding: '12px 16px',
                            background:
                              activeShipTab === tab.id
                                ? '#393C56'
                                : 'transparent',
                            borderRadius: 0,
                          },
                          itemLabel: { color: '#fff' },
                        }}
                      >
                        {tab.name}
                      </Menu.Item>
                      {i < arr.length - 1 && (
                        <Box
                          style={{
                            height: 1,
                            background: '#393C56',
                            margin: 0,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
              </>
            )}
          </Menu.Dropdown>
        </Menu>
        <Box
          onClick={() => collapsePanel?.()}
          onMouseEnter={() => setCollapsePanelHovered(true)}
          onMouseLeave={() => setCollapsePanelHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: 40,
            height: 50,
            cursor: 'pointer',
            background: '#24263C',
            borderBottom: '1px solid #393C56',
            borderLeft: '1px solid #393C56',
            flexShrink: 0,
            paddingRight: 0,
          }}
        >
          <CollapseButton
            backgroundColor={collapsePanelHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      </Box>

      {activeShip && loading && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Loader color="#fff" size="md" />
        </Box>
      )}

      {activeShip && !loading && !isPortTab && (
        <Box
          ref={panelContainerRef}
          className="no-scrollbar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {isStsTab &&
            (stsVersion === 'v2' ||
              stsVersion === 'v8' ||
              stsVersion === 'v9' ||
              stsVersion === 'v10' ||
              stsVersion === 'v11' ||
              stsVersion === 'v12' ||
              stsVersion === 'v13' ||
              stsVersion === 'v16' ||
              stsVersion === 'v17') &&
            (() => {
              const list = stsShipIds || []
              if (list.length === 0) return null

              // v13 / v16 only: give Overview a distinct, icon-led solid button
              // (filled blue when active) so it doesn't read as tab #0. Other
              // versions keep the original tab-styled Overview button.
              const distinctOverviewBtn =
                stsVersion === 'v13' ||
                stsVersion === 'v16' ||
                stsVersion === 'v17'
              const overviewButton = distinctOverviewBtn ? (
                <Box
                  key="overview"
                  onClick={() => setStsShowOverview(true)}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 4,
                    border: stsShowOverview
                      ? '1px solid #006CD7'
                      : '1px solid #393C56',
                    background: stsShowOverview ? '#006CD7' : '#1B1D2E',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Text
                    style={{
                      color: stsShowOverview ? '#fff' : '#C9CEDC',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Overview
                  </Text>
                </Box>
              ) : (
                <Box
                  key="overview"
                  onClick={() => setStsShowOverview(true)}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 4,
                    border: stsShowOverview
                      ? '2px solid #006CD7'
                      : '1px solid #393C56',
                    background: stsShowOverview
                      ? 'rgba(0, 108, 215, 0.1)'
                      : '#24263C',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
                  >
                    Overview
                  </Text>
                </Box>
              )

              const vesselButtons = list.map((sid, idx) => {
                const s = ships[sid]
                if (!s) return null
                const isActive = !stsShowOverview && activeStsShipIndex === idx
                return (
                  <Box
                    key={`${sid}-${idx}`}
                    ref={isActive ? activeStsTabRef : undefined}
                    onClick={() => {
                      setStsShowOverview(false)
                      setActiveStsShip(idx)
                    }}
                    style={{
                      flex: '0 0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 4,
                      border: isActive
                        ? '2px solid #006CD7'
                        : '1px solid #393C56',
                      background: isActive
                        ? 'rgba(0, 108, 215, 0.1)'
                        : '#24263C',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stsVersion === 'v17' && s.flag && (
                      <Text style={{ fontSize: 15, lineHeight: 1 }}>
                        {s.flag}
                      </Text>
                    )}
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                    </Text>
                  </Box>
                )
              })

              // v11: two-tier header. The Overview lives on its own row as an
              // event-level bar (with a divider under it), and the vessel tabs
              // sit on a separate row below — so Overview reads as the parent
              // event, not a sibling ship tab.
              if (stsVersion === 'v11') {
                return (
                  <Box
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
                      background: '#181926',
                      paddingBottom: 0,
                      flexShrink: 0,
                    }}
                  >
                    {/* Row 1: event-level Overview header */}
                    <Box style={{ padding: '16px 20px 12px 20px' }}>
                      <Box
                        onClick={() => setStsShowOverview(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 4,
                          border: stsShowOverview
                            ? '2px solid #006CD7'
                            : '1px solid #393C56',
                          background: stsShowOverview
                            ? 'rgba(0, 108, 215, 0.1)'
                            : '#24263C',
                          cursor: 'pointer',
                        }}
                      >
                        <STSIcon style={{ width: 18, height: 18 }} />
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Ship-to-Ship event
                        </Text>
                        <Text
                          style={{
                            color: '#888F9E',
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {`${list.length} vessels`}
                        </Text>
                        <Box style={{ flex: 1 }} />
                        <Text
                          style={{
                            color: stsShowOverview ? '#0094FF' : '#888F9E',
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {stsShowOverview ? 'Viewing' : 'View overview'}
                        </Text>
                      </Box>
                    </Box>
                    {/* Divider between the event row and the vessel row */}
                    <Box
                      style={{
                        height: 1,
                        background: '#393C56',
                        margin: '0 20px',
                      }}
                    />
                    {/* Row 2: vessel tabs */}
                    <Box
                      style={{
                        position: 'relative',
                        padding: '12px 20px 0 20px',
                      }}
                    >
                      <Text
                        style={{
                          color: '#6C7392',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        Vessels in event
                      </Text>
                      <Box style={{ position: 'relative' }}>
                        <Box
                          ref={stsStripScrollRef}
                          onScroll={updateStsStripFade}
                          className="no-scrollbar"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            overflowX: 'auto',
                            flexWrap: 'nowrap',
                          }}
                        >
                          {vesselButtons}
                        </Box>
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 24,
                            pointerEvents: 'none',
                            background:
                              'linear-gradient(to right, #181926 0%, rgba(24,25,38,0) 100%)',
                            opacity: stsStripFade.left ? 1 : 0,
                            transition: 'opacity 0.15s ease',
                          }}
                        />
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 0,
                            width: 32,
                            pointerEvents: 'none',
                            background:
                              'linear-gradient(to left, #181926 0%, rgba(24,25,38,0) 100%)',
                            opacity: stsStripFade.right ? 1 : 0,
                            transition: 'opacity 0.15s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )
              }

              // v10 / v12 / v13 / v16: pin the Overview control on the left,
              // separated from the scrollable vessel tabs by a divider, so it
              // doesn't read as just another ship tab. (These versions reuse
              // v10's layout and only differ in the map icon.)
              if (
                stsVersion === 'v10' ||
                stsVersion === 'v12' ||
                stsVersion === 'v13' ||
                stsVersion === 'v16' ||
                stsVersion === 'v17'
              ) {
                return (
                  <Box
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
                      background: '#181926',
                      paddingBottom: 0,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 12,
                        padding: '16px 20px 0px 20px',
                      }}
                    >
                      {overviewButton}
                      <Box
                        style={{
                          width: 1,
                          alignSelf: 'stretch',
                          background: '#393C56',
                          flexShrink: 0,
                        }}
                      />
                      <Box
                        style={{
                          position: 'relative',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          ref={stsStripScrollRef}
                          onScroll={updateStsStripFade}
                          className="no-scrollbar"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            overflowX: 'auto',
                            flexWrap: 'nowrap',
                          }}
                        >
                          {vesselButtons}
                        </Box>
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 24,
                            pointerEvents: 'none',
                            background:
                              'linear-gradient(to right, #181926 0%, rgba(24,25,38,0) 100%)',
                            opacity: stsStripFade.left ? 1 : 0,
                            transition: 'opacity 0.15s ease',
                          }}
                        />
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 0,
                            width: 32,
                            pointerEvents: 'none',
                            background:
                              'linear-gradient(to left, #181926 0%, rgba(24,25,38,0) 100%)',
                            opacity: stsStripFade.right ? 1 : 0,
                            transition: 'opacity 0.15s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )
              }

              return (
                <Box
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    background: '#181926',
                    paddingBottom: 12,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    ref={stsStripScrollRef}
                    onScroll={updateStsStripFade}
                    className="no-scrollbar"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '16px 20px 0px 20px',
                      overflowX: 'auto',
                      flexWrap: 'nowrap',
                    }}
                  >
                    {overviewButton}
                    {vesselButtons}
                  </Box>
                  <Box
                    style={{
                      position: 'absolute',
                      top: 16,
                      bottom: 0,
                      left: 0,
                      width: 32,
                      pointerEvents: 'none',
                      background:
                        'linear-gradient(to right, #181926 0%, rgba(24,25,38,0) 100%)',
                      opacity: stsStripFade.left ? 1 : 0,
                      transition: 'opacity 0.15s ease',
                    }}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      top: 16,
                      bottom: 0,
                      right: 0,
                      width: 40,
                      pointerEvents: 'none',
                      background:
                        'linear-gradient(to left, #181926 0%, rgba(24,25,38,0) 100%)',
                      opacity: stsStripFade.right ? 1 : 0,
                      transition: 'opacity 0.15s ease',
                    }}
                  />
                </Box>
              )
            })()}
          {isStsTab &&
            stsVersion === 'v1' &&
            (() => {
              const [sid1, sid2] = displayStsShipIds
              const s1 = ships[sid1]
              const s2 = ships[sid2]
              if (!s1 || !s2) return null
              const pill = (s, idx) => {
                const isActive = activeStsShip === idx
                return (
                  <Box
                    key={s.id}
                    onClick={() => setActiveStsShip(idx)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 4,
                      border: isActive
                        ? '2px solid #006CD7'
                        : '1px solid #393C56',
                      background: isActive
                        ? 'rgba(0, 108, 215, 0.1)'
                        : '#24263C',
                      cursor: 'pointer',
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
                    >
                      {s.name}
                    </Text>
                    {s.flag && <Text style={{ fontSize: 16 }}>{s.flag}</Text>}
                  </Box>
                )
              }
              return (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px 0px 20px',
                  }}
                >
                  {pill(s1, 0)}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={TransferIcon}
                      alt="Transfer"
                      style={{ width: 20, height: 20, display: 'block' }}
                    />
                  </Box>
                  {pill(s2, 1)}
                </Box>
              )
            })()}
          {isStsTab &&
            stsVersion === 'v4' &&
            !stsListDrilledIn &&
            (() => {
              const list = stsShipIds || []
              if (list.length === 0) return null
              const subjectId = list[0]
              const subject = ships[subjectId]
              if (!subject) return null
              const partners = list.slice(1)
              return (
                <Box
                  className="no-scrollbar"
                  style={{
                    padding: '16px 20px 20px 20px',
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                  }}
                >
                  {/* Event summary */}
                  <Box style={{ marginBottom: 12 }}>
                    <Text
                      style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}
                    >
                      Ship-to-Ship event
                    </Text>
                    <Text style={{ color: '#8B90A5', fontSize: 12 }}>
                      {list.length} vessels ·{' '}
                      {stsTransferLabel(list.length - 1)}
                      {' – '}
                      {stsTransferLabel(0)}
                    </Text>
                  </Box>

                  {/* Vessel of interest */}
                  <Box
                    onClick={() => {
                      setActiveStsShip(0)
                      setStsListDrilledIn(true)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 6,
                      border:
                        activeStsShipIndex === 0
                          ? '2px solid #006CD7'
                          : '1px solid #393C56',
                      background:
                        activeStsShipIndex === 0
                          ? 'rgba(0, 108, 215, 0.1)'
                          : '#24263C',
                      cursor: 'pointer',
                      marginBottom: 16,
                    }}
                  >
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          color: '#8B90A5',
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        Vessel of interest
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {subject.name}
                        </Text>
                        {subject.flag && (
                          <Text style={{ fontSize: 16 }}>{subject.flag}</Text>
                        )}
                      </Box>
                    </Box>
                    <Text style={{ color: '#8B90A5', fontSize: 12 }}>
                      {partners.length} transfers
                    </Text>
                  </Box>

                  {/* Transfers timeline */}
                  <Text
                    style={{
                      color: '#8B90A5',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                      marginBottom: 10,
                    }}
                  >
                    Transfers
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginLeft: 6,
                      paddingLeft: 18,
                      borderLeft: '2px solid #393C56',
                    }}
                  >
                    {partners.map((sid, i) => {
                      const idx = i + 1
                      const s = ships[sid]
                      if (!s) return null
                      const isActive = activeStsShipIndex === idx
                      return (
                        <Box
                          key={`${sid}-${idx}`}
                          onClick={() => {
                            setActiveStsShip(idx)
                            setStsListDrilledIn(true)
                          }}
                          style={{ position: 'relative', cursor: 'pointer' }}
                        >
                          <Box
                            style={{
                              position: 'absolute',
                              left: -24,
                              top: 14,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: isActive ? '#006CD7' : '#4C5070',
                              border: '2px solid #181926',
                            }}
                          />
                          <Box
                            style={{
                              padding: '10px 12px',
                              borderRadius: 6,
                              border: isActive
                                ? '2px solid #006CD7'
                                : '1px solid #393C56',
                              background: isActive
                                ? 'rgba(0, 108, 215, 0.1)'
                                : '#24263C',
                            }}
                          >
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
                                  color: '#fff',
                                  fontSize: 14,
                                  fontWeight: 600,
                                }}
                              >
                                {s.name}
                              </Text>
                              {s.flag && (
                                <Text style={{ fontSize: 15 }}>{s.flag}</Text>
                              )}
                            </Box>
                            <Box
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 3,
                              }}
                            >
                              <Text style={{ color: '#8B90A5', fontSize: 11 }}>
                                {subject.name} ↔ {s.name}
                              </Text>
                              <Text style={{ color: '#5A5F73', fontSize: 11 }}>
                                ·
                              </Text>
                              <Text style={{ color: '#8B90A5', fontSize: 11 }}>
                                {stsTransferLabel(idx)}
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )
            })()}
          {stsOverviewActive &&
            (() => {
              const list = stsShipIds || []
              if (list.length === 0) return null
              const shipMeta = (sid) => {
                const s = ships[sid]
                return {
                  name: s?.name || 'Unattributed',
                  flag: s?.flag || '',
                  attributed: Boolean(s) && sid !== 'unknown',
                }
              }
              const evtDate = selectedDetection?.date
              const evtLat = selectedDetection?.lat
              const evtLng = selectedDetection?.lng
              const eventId = seededEventUuid(activeTab?.id)
              return (
                <Box
                  className="no-scrollbar"
                  style={{
                    padding: `${stsVersion === 'v10' || stsVersion === 'v11' || stsVersion === 'v12' || stsVersion === 'v13' || stsVersion === 'v16' || stsVersion === 'v17' ? 12 : 0}px 20px 20px 20px`,
                  }}
                >
                  {/* Overflow messaging for events bigger than product's expected
                      ship-to-ship size. v18 ("Cap at 5") frames it as a suspected
                      mis-detection (amber, with a flag-for-review action); v19
                      ("Scale to N") frames it as a legitimate large raft (blue,
                      informational). Any other version renders no banner. */}
                  {stsOverflow && stsOverflowMode && (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 14,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background:
                          stsOverflowMode === 'cap'
                            ? 'rgba(247, 178, 74, 0.12)'
                            : 'rgba(0, 148, 255, 0.10)',
                        border: `1px solid ${
                          stsOverflowMode === 'cap'
                            ? 'rgba(247, 178, 74, 0.55)'
                            : 'rgba(0, 148, 255, 0.45)'
                        }`,
                      }}
                    >
                      <Box
                        style={{
                          flexShrink: 0,
                          width: 18,
                          height: 18,
                          marginTop: 1,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            stsOverflowMode === 'cap' ? '#F7B24A' : '#0094FF',
                          color: '#0B0E1A',
                          fontSize: 12,
                          fontWeight: 800,
                          lineHeight: 1,
                        }}
                      >
                        {stsOverflowMode === 'cap' ? '!' : 'i'}
                      </Box>
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Text
                          style={{
                            color:
                              stsOverflowMode === 'cap' ? '#F7C67E' : '#8FD0FF',
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 3,
                          }}
                        >
                          {stsOverflowMode === 'cap'
                            ? `Unusually large transfer — ${stsReportedCount} vessels reported`
                            : `Large raft — ${stsReportedCount} vessels detected`}
                        </Text>
                        <Text
                          style={{
                            color: '#C2C7D6',
                            fontSize: 11,
                            lineHeight: 1.45,
                          }}
                        >
                          {stsOverflowMode === 'cap'
                            ? `Ship-to-ship transfers usually involve ${STS_MAX_VESSELS} vessels or fewer, so this detection may be unreliable.`
                            : `This is larger than a typical transfer. All ${stsReportedCount} vessels are listed below; the annotated image only covers the first ${STS_MAX_VESSELS}.`}
                        </Text>
                        {stsOverflowMode === 'cap' &&
                          (stsReviewFlagged ? (
                            // Confirmation + a preview of exactly what got sent,
                            // so the "where does it go?" question is answered on
                            // screen. Destination (Slack vs email) is driven by
                            // STS_REVIEW_DESTINATION.
                            <Box style={{ marginTop: 10 }}>
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  marginBottom: 8,
                                }}
                              >
                                <Box
                                  style={{
                                    flexShrink: 0,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#2FBF71',
                                    color: '#08110B',
                                    fontSize: 10,
                                    fontWeight: 800,
                                  }}
                                >
                                  ✓
                                </Box>
                                <Text
                                  style={{
                                    color: '#7CE0AE',
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                >
                                  {STS_REVIEW_DESTINATION.kind === 'slack'
                                    ? `Sent to ${STS_REVIEW_DESTINATION.target} on Slack`
                                    : `Emailed to ${STS_REVIEW_DESTINATION.target}`}
                                </Text>
                                <Text
                                  onClick={() => setStsReviewFlagged(false)}
                                  style={{
                                    color: '#8B90A5',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                  }}
                                >
                                  Undo
                                </Text>
                              </Box>
                              <Box
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: 6,
                                  background: 'rgba(3, 6, 15, 0.5)',
                                  border: '1px solid rgba(141,147,168,0.28)',
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#888F9E',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    marginBottom: 3,
                                  }}
                                >
                                  {STS_REVIEW_DESTINATION.kind === 'slack'
                                    ? `SynMax bot · ${STS_REVIEW_DESTINATION.target}`
                                    : `To: ${STS_REVIEW_DESTINATION.target}`}
                                </Text>
                                <Text
                                  style={{
                                    color: '#D7DBE6',
                                    fontSize: 11,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {`⚠️ Possible STS mis-detection — ${stsReportedCount} vessels reported (expected ≤${STS_MAX_VESSELS}). Event ${eventId}${
                                    evtLat != null && evtLng != null
                                      ? ` · ${evtLat}°, ${evtLng}°`
                                      : ''
                                  }. Please confirm or dismiss.`}
                                </Text>
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              onClick={() => setStsReviewFlagged(true)}
                              style={{
                                marginTop: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '5px 10px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                userSelect: 'none',
                                background: 'transparent',
                                border: '1px solid rgba(247, 178, 74, 0.55)',
                              }}
                            >
                              <Text
                                style={{
                                  color: '#F7C67E',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: 0.3,
                                }}
                              >
                                Flag for review
                              </Text>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  )}
                  <Box
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <Box style={{ minWidth: 0 }}>
                      <Text
                        style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}
                      >
                        Ship-to-Ship event
                      </Text>
                      <Text style={{ color: '#8B90A5', fontSize: 12 }}>
                        {`${list.length} vessels`}
                        {evtDate ? ` · ${evtDate} UTC` : ''}
                      </Text>
                    </Box>
                    {/* v17: segmentation on/off. Lives here (next to the title)
                        rather than on the hero so it doesn't cover the ships.
                        Only shown for counts we have traced hulls for (2–5) so
                        the toggle is never a no-op; other counts get an inline
                        "unavailable" note on the hero instead. */}
                    {stsVersion === 'v17' &&
                      [2, 3, 4, 5].includes(list.length) && (
                      <Switch
                        checked={stsSegmentOn}
                        onChange={toggleStsSegment}
                        label="Segment focus"
                        labelPosition="left"
                        size="xs"
                        color="#006CD7"
                        style={{ flexShrink: 0 }}
                        styles={{
                          root: { display: 'flex' },
                          body: { display: 'flex', alignItems: 'center' },
                          track: {
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: stsSegmentOn
                              ? '#0094FF'
                              : '#4A4D6A',
                          },
                          thumb: { border: 'none', backgroundColor: '#FFFFFF' },
                          label: {
                            color: stsSegmentOn ? '#FFFFFF' : '#8D93A8',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 0.8,
                            textTransform: 'uppercase',
                            paddingRight: 8,
                            cursor: 'pointer',
                            transition: 'color 0.15s ease',
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* Location + event-level ID (ID last; stands in for the
                      backend bunkering UUID) */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    {evtLat != null && evtLng != null && (
                      <>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <KeyValuePair
                            keyName="Latitude"
                            value={`${evtLat}°`}
                          />
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <KeyValuePair
                            keyName="Longitude"
                            value={`${evtLng}°`}
                          />
                        </Box>
                      </>
                    )}
                    <Box
                      onMouseEnter={() => setHoveredCopyField('eventId')}
                      onMouseLeave={() => setHoveredCopyField(null)}
                      style={{ flexShrink: 0 }}
                    >
                      <Text style={{ color: '#888F9E', fontSize: 10 }}>
                        SynMax Event ID
                      </Text>
                      <Box
                        onClick={() =>
                          handleCopyToClipboard(eventId, 'eventId')
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 11,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {eventId}
                        </Text>
                        <Tooltip
                          label={
                            copiedField === 'eventId'
                              ? 'Copied!'
                              : 'Copy SynMax Event ID'
                          }
                          withArrow
                          color="#393C56"
                          opened={
                            hoveredCopyField === 'eventId' ||
                            copiedField === 'eventId'
                          }
                          styles={{
                            tooltip: {
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              flexShrink: 0,
                              opacity:
                                hoveredCopyField === 'eventId' ||
                                copiedField === 'eventId'
                                  ? 1
                                  : 0,
                              transition: 'opacity 120ms ease',
                            }}
                          >
                            <Copy02
                              style={{
                                width: 14,
                                height: 14,
                                color:
                                  copiedField === 'eventId'
                                    ? '#fff'
                                    : '#0094ff',
                              }}
                            />
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  {/* Annotated event image: each vessel numbered (shared with the
                      per-vessel tab hero in v10). */}
                  {renderStsHero(list, {
                    onPinClick: (idx) => {
                      setStsShowOverview(false)
                      setActiveStsShip(idx)
                    },
                  })}

                  {/* Roster header — v9 gets a small list/network toggle on the
                      right so analysts can flip between "who's here" and "who
                      transferred with whom" without leaving the overview. */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: '#8B90A5',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                      }}
                    >
                      Vessels in event
                    </Text>
                    {(stsVersion === 'v9' ||
                      stsVersion === 'v10' ||
                      stsVersion === 'v11' ||
                      stsVersion === 'v12') && (
                      <Box
                        style={{
                          display: 'flex',
                          gap: 4,
                          flexShrink: 0,
                        }}
                      >
                        <Tooltip
                          label="Vessel list"
                          withArrow
                          color="#181926"
                          styles={{
                            tooltip: {
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Box
                            onClick={() => setStsRosterView('list')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 30,
                              height: 24,
                              borderRadius: 4,
                              cursor: 'pointer',
                              background:
                                stsRosterView === 'list'
                                  ? '#006CD7'
                                  : 'transparent',
                              color:
                                stsRosterView === 'list' ? '#fff' : '#8B90A5',
                            }}
                          >
                            <List style={{ width: 15, height: 15 }} />
                          </Box>
                        </Tooltip>
                        <Tooltip
                          label="Transfer network"
                          withArrow
                          color="#181926"
                          styles={{
                            tooltip: {
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Box
                            onClick={() => setStsRosterView('network')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 30,
                              height: 24,
                              borderRadius: 4,
                              cursor: 'pointer',
                              background:
                                stsRosterView === 'network'
                                  ? '#006CD7'
                                  : 'transparent',
                              color:
                                stsRosterView === 'network'
                                  ? '#fff'
                                  : '#8B90A5',
                            }}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8.95103 11.6598C8.95103 9.61233 10.6109 7.95249 12.6584 7.95249C14.7059 7.95249 16.3657 9.61233 16.3657 11.6598C16.3657 13.7074 14.7059 15.3672 12.6584 15.3672C10.6109 15.3672 8.95103 13.7074 8.95103 11.6598Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M16.207 6.30664C16.207 5.34014 16.9905 4.55664 17.957 4.55664C18.9235 4.55664 19.707 5.34014 19.707 6.30664C19.707 7.27314 18.9235 8.05664 17.957 8.05664C16.9905 8.05664 16.207 7.27314 16.207 6.30664Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9.65992 19.2924C9.65992 18.5245 10.2824 17.9021 11.0502 17.9021C11.818 17.9021 12.4404 18.5245 12.4404 19.2924C12.4404 20.0602 11.818 20.6826 11.0502 20.6826C10.2824 20.6826 9.65992 20.0602 9.65992 19.2924Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M11.2388 17.8935L11.8478 15.3281"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M3.00021 14.6573C3.00021 13.7615 3.72639 13.0354 4.62218 13.0354C5.51796 13.0354 6.24414 13.7615 6.24414 14.6573C6.24414 15.5531 5.51796 16.2793 4.62218 16.2793C3.72639 16.2793 3.00021 15.5531 3.00021 14.6573Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M4.31699 5.63555C4.31699 4.35585 5.35439 3.31845 6.63408 3.31845C7.91377 3.31845 8.95117 4.35585 8.95117 5.63555C8.95117 6.91524 7.91377 7.95264 6.63408 7.95264C5.35439 7.95264 4.31699 6.91524 4.31699 5.63555Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M17.2927 15.367C17.2927 14.3433 18.1226 13.5134 19.1463 13.5134C20.1701 13.5134 21 14.3433 21 15.367C21 16.3908 20.1701 17.2207 19.1463 17.2207C18.1226 17.2207 17.2927 16.3908 17.2927 15.367Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9.98242 8.9834L8.30715 7.30813"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M15.3351 8.9834L16.7373 7.58119"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M17.5262 14.46L15.9097 13.4941"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9.19844 13.0327L6.15674 14.107"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Box>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                  {(stsVersion === 'v9' ||
                    stsVersion === 'v10' ||
                    stsVersion === 'v11' ||
                    stsVersion === 'v12') &&
                  stsRosterView === 'network' ? (
                    (() => {
                      // Inline ego-network: subject at center, partners on a
                      // ring. Spoke thickness encodes transfer count. Tapping a
                      // node drills into that vessel (same as a roster row).
                      const n = list.length
                      const W = 320
                      const H = 300
                      const cx = W / 2
                      const cy = H / 2
                      const R = Math.min(W, H) / 2 - 62
                      const partnerCount = Math.max(n - 1, 1)
                      const transferCount = (idx) => ((idx * 7) % 3) + 1
                      const pos = (idx) => {
                        if (idx === 0) return { x: cx, y: cy }
                        const k = idx - 1
                        const theta =
                          (k / partnerCount) * Math.PI * 2 - Math.PI / 2
                        return {
                          x: cx + R * Math.cos(theta),
                          y: cy + R * Math.sin(theta),
                        }
                      }
                      const nodeR = (idx) =>
                        idx === 0 ? 22 : 13 + transferCount(idx) * 2
                      // Selecting a node highlights it here and pans/focuses
                      // that vessel on the map — but keeps us in the overview
                      // (stsShowOverview stays true). Explicit drill-in lives
                      // in the footer "View timeline" affordance.
                      const sel = activeStsShipIndex
                      const focusedMeta = shipMeta(list[sel] || list[0])
                      return (
                        <Box>
                          <Box
                            style={{
                              border: '1px solid #393C56',
                              borderRadius: 8,
                              background: '#12131F',
                              padding: 8,
                            }}
                          >
                            <svg
                              viewBox={`0 0 ${W} ${H}`}
                              width="100%"
                              height={H}
                              preserveAspectRatio="xMidYMid meet"
                            >
                              {list.map((sid, idx) => {
                                if (idx === 0) return null
                                const p = pos(idx)
                                const isSel = sel === idx
                                // Trim the spoke so it stops at each circle's
                                // edge instead of running under the nodes.
                                const dx = p.x - cx
                                const dy = p.y - cy
                                const len = Math.hypot(dx, dy) || 1
                                const ux = dx / len
                                const uy = dy / len
                                const r0 = nodeR(0)
                                const r1 = nodeR(idx)
                                return (
                                  <line
                                    key={`sp-${idx}`}
                                    x1={cx + ux * r0}
                                    y1={cy + uy * r0}
                                    x2={p.x - ux * r1}
                                    y2={p.y - uy * r1}
                                    stroke={isSel ? '#006CD7' : '#3A3F5C'}
                                    strokeWidth={1 + transferCount(idx)}
                                    strokeOpacity={isSel ? 0.9 : 0.6}
                                  >
                                    <title>{`${ships[list[0]]?.name} ↔ ${ships[sid]?.name} · ${transferCount(idx)} transfer(s)`}</title>
                                  </line>
                                )
                              })}
                              {list.map((sid, idx) => {
                                const s = shipMeta(sid)
                                const p = pos(idx)
                                const r = nodeR(idx)
                                const isSubject = idx === 0
                                const isSel = sel === idx
                                return (
                                  <g
                                    key={`nd-${idx}`}
                                    onClick={() => {
                                      setActiveStsShip(idx)
                                      const detId =
                                        stsConnectorData?.lines?.[idx]?.detId ??
                                        null
                                      setStsPeekDetectionId(detId)
                                      setPreviewDetectionId(detId)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <title>
                                      {`${s.name}${
                                        isSubject
                                          ? ' · vessel of interest'
                                          : ` · transferred ${stsTransferLabel(idx)}`
                                      }`}
                                    </title>
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r={r}
                                      fill={
                                        isSubject
                                          ? '#006CD7'
                                          : isSel
                                            ? 'rgba(0,108,215,0.18)'
                                            : '#24263C'
                                      }
                                      stroke={
                                        isSubject || isSel
                                          ? '#006CD7'
                                          : '#393C56'
                                      }
                                      strokeWidth={isSel ? 3 : 2}
                                    />
                                    <text
                                      x={p.x}
                                      y={p.y + r * 0.32}
                                      textAnchor="middle"
                                      fontSize={r * 0.9}
                                      style={{ pointerEvents: 'none' }}
                                    >
                                      {s.flag || '🚢'}
                                    </text>
                                    <text
                                      x={p.x}
                                      y={p.y + r + 14}
                                      textAnchor="middle"
                                      fontSize={11}
                                      fontWeight={
                                        isSubject || isSel ? 700 : 500
                                      }
                                      fill={
                                        isSubject || isSel ? '#fff' : '#C7CCDD'
                                      }
                                      style={{ pointerEvents: 'none' }}
                                    >
                                      {s.name}
                                    </text>
                                  </g>
                                )
                              })}
                            </svg>
                          </Box>
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                              marginTop: 8,
                            }}
                          >
                            <Text style={{ color: '#5A5F73', fontSize: 11 }}>
                              Tap a vessel to focus it on the map
                            </Text>
                            <Box
                              onClick={() => setStsShowOverview(false)}
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              View {focusedMeta.name} timeline →
                            </Box>
                          </Box>
                        </Box>
                      )
                    })()
                  ) : (
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {list.map((sid, idx) => {
                        const m = shipMeta(sid)
                        const isHovered = hoveredRosterId === `${sid}-${idx}`
                        return (
                          <Box
                            key={`roster-${sid}-${idx}`}
                            onClick={() => {
                              setStsShowOverview(false)
                              setActiveStsShip(idx)
                            }}
                            onMouseEnter={() =>
                              setHoveredRosterId(`${sid}-${idx}`)
                            }
                            onMouseLeave={() => setHoveredRosterId(null)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 6,
                              border: `1px solid ${
                                isHovered ? '#006CD7' : '#393C56'
                              }`,
                              background: isHovered
                                ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                                : '#24263C',
                              cursor: 'pointer',
                              transition:
                                'background 140ms ease, border-color 140ms ease',
                            }}
                          >
                            <Box
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: m.attributed
                                  ? '#006CD7'
                                  : '#F75349',
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
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
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 600,
                                  }}
                                >
                                  {m.name}
                                </Text>
                                {m.flag && (
                                  <Text style={{ fontSize: 15 }}>{m.flag}</Text>
                                )}
                              </Box>
                              <Text style={{ color: '#8B90A5', fontSize: 11 }}>
                                {stsVersion === 'v9' ||
                                stsVersion === 'v10' ||
                                stsVersion === 'v11' ||
                                stsVersion === 'v12'
                                  ? idx === 0
                                    ? 'Vessel of interest'
                                    : `${ships[list[0]]?.name || 'Vessel'} ↔ ${m.name} · ${stsTransferLabel(idx)}`
                                  : m.attributed
                                    ? idx === 0
                                      ? 'Vessel of interest'
                                      : 'Attributed'
                                    : 'Unattributed'}
                              </Text>
                            </Box>
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              View →
                            </Text>
                          </Box>
                        )
                      })}
                    </Box>
                  )}
                </Box>
              )
            })()}
          {(stsVersion !== 'v4' || stsListDrilledIn) && !stsOverviewActive && (
            <>
              {stsVersion === 'v4' && stsListDrilledIn && (
                <Box
                  onClick={() => setStsListDrilledIn(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 20px 0 20px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{ color: '#0094FF', fontSize: 16, fontWeight: 600 }}
                  >
                    ←
                  </Text>
                  <Text
                    style={{ color: '#0094FF', fontSize: 13, fontWeight: 600 }}
                  >
                    Back to transfer summary
                  </Text>
                </Box>
              )}
              {stsVersion === 'v9' && stsUsesOverview && !stsShowOverview && (
                <Box
                  onClick={() => setStsShowOverview(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 20px 0 20px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{ color: '#0094FF', fontSize: 16, fontWeight: 600 }}
                  >
                    ←
                  </Text>
                  <Text
                    style={{ color: '#0094FF', fontSize: 13, fontWeight: 600 }}
                  >
                    {stsRosterView === 'network'
                      ? 'Back to transfer network'
                      : 'Back to vessels in event'}
                  </Text>
                </Box>
              )}
              <Box
                ref={topSectionRef}
                style={{
                  display:
                    (shipDetailsVersion === 'v4' ||
                      shipDetailsVersion === 'v5' ||
                      shipDetailsVersion === 'v6') &&
                    eventToolsPoppedOut
                      ? 'none'
                      : undefined,
                  padding: isTopSummaryCollapsed
                    ? `${isStsTab && (stsVersion === 'v10' || stsVersion === 'v11' || stsVersion === 'v12' || stsVersion === 'v13' || stsVersion === 'v16' || stsVersion === 'v17') ? 12 : 20}px 20px 0px 20px`
                    : `${isStsTab && (stsVersion === 'v10' || stsVersion === 'v11' || stsVersion === 'v12' || stsVersion === 'v13' || stsVersion === 'v16' || stsVersion === 'v17') ? 12 : 20}px 20px 0px 20px`,
                  flexShrink: 0,
                  ...(topSectionHeight != null
                    ? { height: topSectionHeight, overflowY: 'auto' }
                    : {}),
                }}
              >
                <Box
                  ref={topSummaryHeaderRef}
                  style={{ display: 'flex', marginBottom: '16px' }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Title order={4} style={{ color: 'white' }}>
                        {activeShip.name}
                      </Title>
                      {activeShip.flag && (
                        <Text style={{ fontSize: 18 }}>{activeShip.flag}</Text>
                      )}
                    </Box>
                    {(shouldShowLastKnownLocationButton ||
                      showSanctionedTitle) && (
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginTop: 2,
                        }}
                      >
                        {shouldShowLastKnownLocationButton && (
                          <Tooltip
                            withArrow
                            arrowSize={10}
                            openDelay={150}
                            position="right"
                            offset={10}
                            color="#000"
                            label={
                              <Box
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 8,
                                }}
                              >
                                <KeyValuePair
                                  keyName="Last Known Location Event"
                                  value={
                                    hasPendingNewLastKnownData ? (
                                      <Box
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 6,
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: '#fff',
                                            fontSize: 12,
                                          }}
                                        >
                                          {eventLabel[
                                            hoverLastKnownDetection?.type
                                          ] ||
                                            hoverLastKnownDetection?.type ||
                                            'Unknown'}
                                        </Text>
                                        <Text
                                          style={{
                                            color: '#00EB6C',
                                            fontSize: 12,
                                            fontWeight: 700,
                                          }}
                                        >
                                          (New)
                                        </Text>
                                      </Box>
                                    ) : (
                                      eventLabel[
                                        hoverLastKnownDetection?.type
                                      ] ||
                                      hoverLastKnownDetection?.type ||
                                      'Unknown'
                                    )
                                  }
                                />
                                <KeyValuePair
                                  keyName="Reported Time"
                                  value={
                                    hoverLastKnownDetection?.date || 'No info'
                                  }
                                />
                              </Box>
                            }
                            styles={{
                              tooltip: {
                                color: '#fff',
                                borderRadius: 8,
                                padding: '10px 12px',
                                maxWidth: 240,
                              },
                            }}
                          >
                            <Box
                              onClick={handleShowLastKnownLocation}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer',
                              }}
                            >
                              <MarkerPin01
                                style={{
                                  width: 14,
                                  height: 14,
                                  color: '#0094FF',
                                  flexShrink: 0,
                                }}
                              />
                              <Text
                                style={{
                                  color: '#0094FF',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Show last known location
                              </Text>
                              {hasPendingNewLastKnownData && (
                                <Box
                                  style={{
                                    width: 7,
                                    height: 7,
                                    marginLeft: 4,
                                    borderRadius: 999,
                                    background: isNewLastKnownDotFlashOn
                                      ? '#00EB6C'
                                      : 'rgba(0, 235, 108, 0.28)',
                                    boxShadow: isNewLastKnownDotFlashOn
                                      ? '0 0 0 2px rgba(0, 235, 108, 0.2)'
                                      : 'none',
                                    flexShrink: 0,
                                    transition: 'all 160ms ease',
                                  }}
                                />
                              )}
                            </Box>
                          </Tooltip>
                        )}
                        {showSanctionedTitle && (
                          <>
                            {shouldShowLastKnownLocationButton && (
                              <Box
                                style={{
                                  width: 1,
                                  height: 12,
                                  background: '#393C56',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <img
                              src={sanctionedTitle}
                              alt="Sanctioned"
                              style={{
                                height: 12,
                                width: 'auto',
                                display: 'block',
                                flexShrink: 0,
                              }}
                            />
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                  <Box style={{ flex: 1 }}></Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    {/* Temporarily hidden until Add ship notes feature is implemented. */}
                    {/*
                <Tooltip label="Add ship notes" withArrow openDelay={200}>
                  <Box
                    onMouseEnter={() => setHoveredTopAction('note')}
                    onMouseLeave={() => setHoveredTopAction(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background:
                        hoveredTopAction === 'note' ? '#24263C' : 'transparent',
                    }}
                  >
                    <File02 style={{ color: '#fff', width: 20, height: 20 }} />
                  </Box>
                </Tooltip>
                */}
                    {/*
                <Tooltip label="Create alert" withArrow openDelay={200}>
                  <Box
                    onMouseEnter={() => setHoveredTopAction('alert')}
                    onMouseLeave={() => setHoveredTopAction(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background:
                        hoveredTopAction === 'alert'
                          ? '#24263C'
                          : 'transparent',
                    }}
                  >
                    <AlertIcon
                      style={{ color: '#fff', width: 20, height: 20 }}
                    />
                  </Box>
                </Tooltip>
                */}
                    <Tooltip
                      label={
                        isBookmarkVersion
                          ? isBookmarkProto
                            ? 'Bookmark'
                            : 'Favorite'
                          : isActiveShipFavorite
                            ? 'Remove from My Ships'
                            : 'Add to My Ships'
                      }
                      withArrow
                      openDelay={200}
                      styles={{
                        tooltip: {
                          backgroundColor: '#000',
                          color: '#fff',
                          border: '1px solid #000',
                        },
                        arrow: {
                          backgroundColor: '#000',
                          border: '1px solid #000',
                        },
                      }}
                    >
                      <Box
                        onClick={() => {
                          if (activeShip?.id) toggleFavoriteShip(activeShip.id)
                        }}
                        onMouseEnter={() => setHoveredTopAction('favorite')}
                        onMouseLeave={() => setHoveredTopAction(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          cursor: 'pointer',
                          background:
                            hoveredTopAction === 'favorite'
                              ? '#24263C'
                              : 'transparent',
                        }}
                      >
                        {isBookmarkProto ? (
                          <Bookmark
                            style={{
                              color: isActiveShipFavorite ? '#0094FF' : '#fff',
                              fill: isActiveShipFavorite ? '#0094FF' : 'none',
                              width: 20,
                              height: 20,
                            }}
                          />
                        ) : (
                          <Star01
                            style={{
                              color: isActiveShipFavorite ? '#F7C948' : '#fff',
                              fill: isActiveShipFavorite ? '#F7C948' : 'none',
                              width: 20,
                              height: 20,
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                    {shipDetailsVersion !== 'v10' && (
                      <Tooltip
                        label="Expand/collapse"
                        withArrow
                        openDelay={200}
                        styles={{
                          tooltip: {
                            backgroundColor: '#000',
                            color: '#fff',
                            border: '1px solid #000',
                          },
                          arrow: {
                            backgroundColor: '#000',
                            border: '1px solid #000',
                          },
                        }}
                      >
                        <Box
                          onClick={handleTopSummaryToggle}
                          onMouseEnter={() => setHoveredTopAction('resize')}
                          onMouseLeave={() => setHoveredTopAction(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            cursor: 'pointer',
                            background: isTopSummaryCollapsed
                              ? '#006CD7'
                              : hoveredTopAction === 'resize'
                                ? '#24263C'
                                : 'transparent',
                          }}
                        >
                          <EnlargeVerticalIcon
                            width={26}
                            height={26}
                            style={{
                              color: '#fff',
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                    {(shipDetailsVersion === 'v4' ||
                      shipDetailsVersion === 'v5' ||
                      shipDetailsVersion === 'v6' ||
                      shipDetailsVersion === 'v10') && (
                      <Tooltip
                        label={
                          shipDetailsVersion === 'v10' && eventToolsPoppedOut
                            ? 'Close event tools map panel'
                            : 'Open event tools as map panel'
                        }
                        withArrow
                        openDelay={200}
                        styles={{
                          tooltip: {
                            backgroundColor: '#000',
                            color: '#fff',
                            border: '1px solid #000',
                          },
                          arrow: {
                            backgroundColor: '#000',
                            border: '1px solid #000',
                          },
                        }}
                      >
                        <Box
                          onClick={() => {
                            if (
                              shipDetailsVersion === 'v10' &&
                              eventToolsPoppedOut
                            ) {
                              setEventToolsPoppedOut(false)
                              setEventToolsMinimized(false)
                              setIsTopSummaryCollapsed(false)
                              setTopSectionHeight(null)
                              return
                            }
                            setEventToolsPoppedOut(true)
                            if (shipDetailsVersion === 'v10') {
                              const bounds = getTopSectionBounds()
                              if (bounds) {
                                setTopSectionHeight(bounds.minTopHeight)
                              }
                              setIsTopSummaryCollapsed(true)
                            }
                          }}
                          onMouseEnter={() => setHoveredTopAction('popout')}
                          onMouseLeave={() => setHoveredTopAction(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            cursor: 'pointer',
                            background:
                              shipDetailsVersion === 'v10' &&
                              eventToolsPoppedOut
                                ? '#006CD7'
                                : hoveredTopAction === 'popout'
                                ? '#24263C'
                                : 'transparent',
                          }}
                        >
                          {shipDetailsVersion === 'v4' ||
                          shipDetailsVersion === 'v10' ? (
                            <EventToolsIcon />
                          ) : (
                            <Browser
                              style={{ width: 21, height: 21, color: '#fff' }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                {!isTopSummaryCollapsed && (
                  <>
                    <Box
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'max-content max-content minmax(0, 1fr)',
                        columnGap: '16px',
                        marginBottom: '16px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        onMouseEnter={() => setHoveredCopyField('imo')}
                        onMouseLeave={() => setHoveredCopyField(null)}
                      >
                        <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                          IMO
                        </Text>
                        <Box
                          onClick={() => {
                            if (canCopyImo)
                              handleCopyToClipboard(activeShip.imo, 'imo')
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            cursor: canCopyImo ? 'pointer' : 'default',
                          }}
                        >
                          <Text
                            size="xs"
                            style={{
                              color: 'white',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              minWidth: 0,
                            }}
                            title={activeShip.imo || 'No info'}
                          >
                            {activeShip.imo || 'No info'}
                          </Text>
                          {canCopyImo && (
                            <Tooltip
                              label={
                                copiedField === 'imo' ? 'Copied!' : 'Copy IMO'
                              }
                              withArrow
                              color="#393C56"
                              opened={
                                hoveredCopyField === 'imo' ||
                                copiedField === 'imo'
                              }
                              styles={{
                                tooltip: {
                                  color: '#fff',
                                  fontSize: 12,
                                  fontWeight: 600,
                                },
                              }}
                            >
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 18,
                                  height: 18,
                                  color:
                                    copiedField === 'imo' ? '#fff' : '#0094ff',
                                  cursor:
                                    hoveredCopyField === 'imo' ||
                                    copiedField === 'imo'
                                      ? 'pointer'
                                      : 'default',
                                  flexShrink: 0,
                                  transform:
                                    copiedField === 'imo'
                                      ? 'scale(1.12)'
                                      : 'scale(1)',
                                  transition:
                                    'transform 140ms ease, color 140ms ease, opacity 140ms ease',
                                  borderRadius: 999,
                                  background: 'transparent',
                                  opacity:
                                    hoveredCopyField === 'imo' ||
                                    copiedField === 'imo'
                                      ? 1
                                      : 0,
                                  pointerEvents:
                                    hoveredCopyField === 'imo' ||
                                    copiedField === 'imo'
                                      ? 'auto'
                                      : 'none',
                                }}
                              >
                                <Copy02
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color:
                                      copiedField === 'imo'
                                        ? '#fff'
                                        : '#0094ff',
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      <Box
                        onMouseEnter={() => setHoveredCopyField('mmsi')}
                        onMouseLeave={() => setHoveredCopyField(null)}
                      >
                        <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                          MMSI
                        </Text>
                        <Box
                          onClick={() => {
                            if (canCopyMmsi)
                              handleCopyToClipboard(activeShip.mmsi, 'mmsi')
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            cursor: canCopyMmsi ? 'pointer' : 'default',
                          }}
                        >
                          <Text
                            size="xs"
                            style={{
                              color: 'white',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              minWidth: 0,
                            }}
                            title={activeShip.mmsi || 'No info'}
                          >
                            {activeShip.mmsi || 'No info'}
                          </Text>
                          {canCopyMmsi && (
                            <Tooltip
                              label={
                                copiedField === 'mmsi' ? 'Copied!' : 'Copy MMSI'
                              }
                              withArrow
                              color="#393C56"
                              opened={
                                hoveredCopyField === 'mmsi' ||
                                copiedField === 'mmsi'
                              }
                              styles={{
                                tooltip: {
                                  color: '#fff',
                                  fontSize: 12,
                                  fontWeight: 600,
                                },
                              }}
                            >
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 18,
                                  height: 18,
                                  color:
                                    copiedField === 'mmsi' ? '#fff' : '#0094ff',
                                  cursor:
                                    hoveredCopyField === 'mmsi' ||
                                    copiedField === 'mmsi'
                                      ? 'pointer'
                                      : 'default',
                                  flexShrink: 0,
                                  transform:
                                    copiedField === 'mmsi'
                                      ? 'scale(1.12)'
                                      : 'scale(1)',
                                  transition:
                                    'transform 140ms ease, color 140ms ease, opacity 140ms ease',
                                  borderRadius: 999,
                                  background: 'transparent',
                                  opacity:
                                    hoveredCopyField === 'mmsi' ||
                                    copiedField === 'mmsi'
                                      ? 1
                                      : 0,
                                  pointerEvents:
                                    hoveredCopyField === 'mmsi' ||
                                    copiedField === 'mmsi'
                                      ? 'auto'
                                      : 'none',
                                }}
                              >
                                <Copy02
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color:
                                      copiedField === 'mmsi'
                                        ? '#fff'
                                        : '#0094ff',
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      <Box
                        onMouseEnter={() => setHoveredCopyField('shipId')}
                        onMouseLeave={() => setHoveredCopyField(null)}
                      >
                        <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                          SynMax Ship ID
                        </Text>
                        <Box
                          onClick={() => {
                            if (canCopyShipId)
                              handleCopyToClipboard(activeShip.shipId, 'shipId')
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: canCopyShipId ? 'pointer' : 'default',
                          }}
                        >
                          <Box
                            title={activeShip.shipId || 'No info'}
                            style={{
                              color: 'white',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 0,
                              fontSize: 11,
                              whiteSpace: 'nowrap',
                              overflow: 'visible',
                            }}
                          >
                            {activeShip.shipId ? (
                              <Box
                                component="span"
                                style={{
                                  display: 'inline-block',
                                }}
                              >
                                {activeShip.shipId}
                              </Box>
                            ) : (
                              'No info'
                            )}
                          </Box>
                          {canCopyShipId && (
                            <Tooltip
                              label={
                                copiedField === 'shipId'
                                  ? 'Copied!'
                                  : 'Copy SynMax Ship Id'
                              }
                              withArrow
                              color="#393C56"
                              opened={
                                hoveredCopyField === 'shipId' ||
                                copiedField === 'shipId'
                              }
                              styles={{
                                tooltip: {
                                  color: '#fff',
                                  fontSize: 12,
                                  fontWeight: 600,
                                },
                              }}
                            >
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 18,
                                  height: 18,
                                  color:
                                    copiedField === 'shipId'
                                      ? '#fff'
                                      : '#0094ff',
                                  cursor:
                                    hoveredCopyField === 'shipId' ||
                                    copiedField === 'shipId'
                                      ? 'pointer'
                                      : 'default',
                                  flexShrink: 0,
                                  transform:
                                    copiedField === 'shipId'
                                      ? 'scale(1.12)'
                                      : 'scale(1)',
                                  transition:
                                    'transform 140ms ease, color 140ms ease, opacity 140ms ease',
                                  borderRadius: 999,
                                  background: 'transparent',
                                  opacity:
                                    hoveredCopyField === 'shipId' ||
                                    copiedField === 'shipId'
                                      ? 1
                                      : 0,
                                  pointerEvents:
                                    hoveredCopyField === 'shipId' ||
                                    copiedField === 'shipId'
                                      ? 'auto'
                                      : 'none',
                                }}
                              >
                                <Copy02
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color:
                                      copiedField === 'shipId'
                                        ? '#fff'
                                        : '#0094ff',
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    {shouldShowNewAisDetailsRow && (
                      <Box
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'max-content max-content minmax(0, 1fr)',
                          columnGap: '16px',
                          marginBottom: '16px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box style={{ minWidth: 183 }}>
                          <KeyValuePair
                            keyName="Latest Speed"
                            value={
                              activeShip?.aisInfo?.latestSpeed || 'No info'
                            }
                          />
                        </Box>
                        <Box style={{ minWidth: 0 }}>
                          <KeyValuePair
                            keyName="Destination"
                            value={
                              activeShip?.aisInfo?.destination || 'No info'
                            }
                          />
                        </Box>
                      </Box>
                    )}
                    {!isUnattributed &&
                      shipDetailsVersion !== 'v7' &&
                      shipDetailsVersion !== 'v11' &&
                      shipDetailsVersion !== 'v8' &&
                      shipDetailsVersion !== 'v9' &&
                      shipDetailsVersion !== 'v10' && (
                      <ShipDetailsPanel
                        version={shipDetailsVersion}
                        selectedEvent={selectedDetection}
                        isLatest={isLatest}
                        eventLabel={eventLabel[selectedDetection?.type] || ''}
                        eventIconOverride={selectedStsIcon}
                        flashEnabled={flashEnabled}
                        onToolsVisibleChange={setDetailToolsVisible}
                        onToolAction={handleShipToolAction}
                        activeToolIds={activeMapToolPanels}
                      />
                    )}
                    {isStsShipTab &&
                      (stsVersionRaw === 'v20' || stsVersionRaw === 'v21') && (
                      // Compact single-row STS switcher directly under the tools
                      // card: an Overview button + the involved vessels. Kept
                      // slim so it doesn't push the detail tabs below the fold.
                      <Box style={{ marginTop: 16 }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Ship-to-Ship Event
                        </Text>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setStsOverviewModalOpen(true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            height: 30,
                            padding: '0 10px',
                            background: '#181926',
                            border: '1px solid #393C56',
                            borderRadius: 4,
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          STS Overview
                        </Box>
                        <Box
                          style={{
                            width: 1,
                            height: 30,
                            background: '#393C56',
                            flexShrink: 0,
                          }}
                        />
                        <Box
                          className="tab-row-scroll"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            overflowX: 'auto',
                            minWidth: 0,
                          }}
                        >
                          {stsEventShipIds.map((sid) => {
                            const s = ships[sid]
                            if (!s) return null
                            const active = activeShipTab === sid
                            return (
                              <Box
                                key={sid}
                                component="button"
                                type="button"
                                onClick={() => {
                                  if (active) return
                                  openStsVesselTab(sid, activeTab)
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  height: 30,
                                  padding: '0 10px',
                                  borderRadius: 4,
                                  border: `1px solid ${active ? '#0094FF' : '#393C56'}`,
                                  background: active
                                    ? 'rgba(0, 148, 255, 0.12)'
                                    : '#181926',
                                  cursor: active ? 'default' : 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: active ? 600 : 500,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {s.name}
                                </Text>
                                {s.flag && (
                                  <Text style={{ fontSize: 13 }}>{s.flag}</Text>
                                )}
                              </Box>
                            )
                          })}
                        </Box>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
              {isUnattributed ? (
                <>
                  {shipDetailsVersion !== 'v7' &&
                    shipDetailsVersion !== 'v11' &&
                    shipDetailsVersion !== 'v8' &&
                    shipDetailsVersion !== 'v9' &&
                    shipDetailsVersion !== 'v10' && (
                    <Box style={{ flexShrink: 0, padding: '20px 20px 0 20px' }}>
                      <ShipDetailsPanel
                        version={shipDetailsVersion}
                        selectedEvent={selectedDetection}
                        isLatest
                        eventLabel={
                          isStsUnattributed
                            ? 'Unattributed'
                            : eventLabel[selectedDetection?.type] || ''
                        }
                        flashEnabled={false}
                        unattributed
                        onToolsVisibleChange={setDetailToolsVisible}
                        onToolAction={handleShipToolAction}
                        activeToolIds={activeMapToolPanels}
                      />
                    </Box>
                  )}
                  <Box
                    className="no-scrollbar"
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '8px 20px 20px 20px',
                    }}
                  >
                    <EventTimelineCard
                      showEventToolsButton={
                        shipDetailsVersion === 'v7' ||
                        shipDetailsVersion === 'v11' ||
                        shipDetailsVersion === 'v8' ||
                        shipDetailsVersion === 'v9'
                      }
                      eventToolsContent={selectedEventToolsPopoverContent}
                      eventToolsScrollCloseDelay={
                        shipDetailsVersion === 'v7' ||
                        shipDetailsVersion === 'v11'
                          ? 900
                          : 400
                      }
                      squareImages={
                        shipDetailsVersion === 'v4' ||
                        shipDetailsVersion === 'v5' ||
                        shipDetailsVersion === 'v6' ||
                        shipDetailsVersion === 'v10'
                      }
                      showViewEventLocation={
                        shipDetailsVersion !== 'v2' &&
                        shipDetailsVersion !== 'v3' &&
                        shipDetailsVersion !== 'v4' &&
                        shipDetailsVersion !== 'v5' &&
                        shipDetailsVersion !== 'v6' &&
                        shipDetailsVersion !== 'v7' &&
                        shipDetailsVersion !== 'v11' &&
                        shipDetailsVersion !== 'v8' &&
                        shipDetailsVersion !== 'v9' &&
                        shipDetailsVersion !== 'v10'
                      }
                      compactActions={
                        shipDetailsVersion === 'v2' ||
                        shipDetailsVersion === 'v3' ||
                        shipDetailsVersion === 'v4' ||
                        shipDetailsVersion === 'v5' ||
                        shipDetailsVersion === 'v6' ||
                        shipDetailsVersion === 'v7' ||
                        shipDetailsVersion === 'v11' ||
                        shipDetailsVersion === 'v8' ||
                        shipDetailsVersion === 'v9' ||
                        shipDetailsVersion === 'v10'
                      }
                      date={latestDetection?.date}
                      event={
                        isStsUnattributed
                          ? 'Unattributed'
                          : eventLabel[selectedDetection?.type] ||
                            selectedDetection?.type
                      }
                      icon={<UnattributedIcon style={{ height: 14 }} />}
                      selected
                      onActivate={
                        shipDetailsVersion === 'v7' ||
                        shipDetailsVersion === 'v11' ||
                        shipDetailsVersion === 'v8' ||
                        shipDetailsVersion === 'v9'
                          ? () => {}
                          : undefined
                      }
                      onSelect={() => {}}
                      aisInfo={{}}
                      synMaxInfo={
                        activeShip.synMaxInfo ||
                        (isStsUnattributed
                          ? {
                              objectId: 'N/A',
                              imageCapturedTime:
                                latestDetection?.date || 'No info',
                              imageSource: 'Planet Scope',
                              status: 'Preview',
                              latitude:
                                activeShip.aisInfo?.latitude || 'No info',
                              longitude:
                                activeShip.aisInfo?.longitude || 'No info',
                              heading: activeShip.aisInfo?.heading || 'No info',
                              shipLength:
                                activeShip.aisInfo?.length || 'No info',
                              shipWidth: activeShip.aisInfo?.width || 'No info',
                              shipType:
                                activeShip.aisInfo?.shipType || 'No info',
                              shipSubtype: 'Unassigned',
                            }
                          : undefined)
                      }
                    />
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid #393C56',
                      flexShrink: 0,
                    }}
                  >
                    {detailTabsOverflowLeft && (
                      <Box
                        onClick={() =>
                          detailTabScrollRef.current?.scrollBy({
                            left: -140,
                            behavior: 'smooth',
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 30,
                          height: 50,
                          cursor: 'pointer',
                          background: '#181926',
                          flexShrink: 0,
                        }}
                      >
                        <ChevronDown
                          style={{
                            color: '#898f9d',
                            width: 14,
                            height: 14,
                            transform: 'rotate(90deg)',
                          }}
                        />
                      </Box>
                    )}
                    <Box
                      style={{
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        ref={detailTabScrollRef}
                        className="tab-row-scroll"
                        style={{
                          display: 'flex',
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {detailTabs.map((tab, i) => (
                          <Box
                            key={tab}
                            ref={(node) => {
                              if (node) {
                                detailTabButtonRefs.current[i] = node
                              } else {
                                delete detailTabButtonRefs.current[i]
                              }
                            }}
                            onClick={() => handleDetailTabClick(tab, i)}
                            style={{
                              flex: '0 0 auto',
                              height: 50,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 18px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              borderBottom:
                                activeDetailTab === i
                                  ? '2px solid #fff'
                                  : '2px solid transparent',
                            }}
                          >
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: activeDetailTab === i ? 700 : 400,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {tab}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    {detailTabsOverflowRight && (
                      <Box
                        onClick={() =>
                          detailTabScrollRef.current?.scrollBy({
                            left: 140,
                            behavior: 'smooth',
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 30,
                          height: 50,
                          cursor: 'pointer',
                          background: '#181926',
                          flexShrink: 0,
                        }}
                      >
                        <ChevronDown
                          style={{
                            color: '#898f9d',
                            width: 14,
                            height: 14,
                            transform: 'rotate(-90deg)',
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                  {ENABLE_TIMELINE_DRAG && (
                    <Tooltip
                      label="Drag to resize timeline"
                      position="bottom"
                      withArrow
                      openDelay={0}
                      closeDelay={0}
                      color="#393C56"
                      styles={{
                        tooltip: {
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 600,
                        },
                      }}
                    >
                      <Box
                        onMouseDown={handleTimelineResizeStart}
                        onMouseEnter={() => setIsDragHandleHovered(true)}
                        onMouseLeave={() => setIsDragHandleHovered(false)}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 10,
                          flexShrink: 0,
                          cursor: 'ns-resize',
                          background: 'transparent',
                          position: 'relative',
                        }}
                      >
                        <Box
                          style={{
                            width:
                              isResizingTimeline || isDragHandleHovered
                                ? 54
                                : 42,
                            height: 3,
                            borderRadius: 999,
                            background:
                              isResizingTimeline || isDragHandleHovered
                                ? '#5C6270'
                                : 'rgba(92, 98, 112, 0.45)',
                            transition: 'all 120ms ease',
                          }}
                        />
                      </Box>
                    </Tooltip>
                  )}
                  <Box
                    ref={scrollContainerRef}
                    style={{ flex: 1, overflowY: 'auto' }}
                  >
                    {activeDetailTab === 0 && (
                      <Box
                        style={{
                          padding: '8px 20px 20px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0,
                        }}
                      >
                        {(shipDetailsVersion === 'v2' ||
                          shipDetailsVersion === 'v3' ||
                          shipDetailsVersion === 'v4' ||
                          shipDetailsVersion === 'v5' ||
                          shipDetailsVersion === 'v6' ||
                          shipDetailsVersion === 'v7' ||
                          shipDetailsVersion === 'v11' ||
                          shipDetailsVersion === 'v8' ||
                          shipDetailsVersion === 'v9' ||
                          shipDetailsVersion === 'v10') &&
                          latestAisDetection &&
                          (() => {
                            const aisDate = new Date(latestAisDetection.date)
                            const aisDateKey = `${aisDate.getFullYear()}-${String(
                              aisDate.getMonth() + 1
                            ).padStart(2, '0')}-${String(
                              aisDate.getDate()
                            ).padStart(2, '0')}`
                            const aisLocationActive =
                              normalizeDetectionId(selectedCard) ===
                                normalizeDetectionId(
                                  latestAisDetection.id
                                ) ||
                              shownOnMapDetectionIds.some(
                                (id) =>
                                  normalizeDetectionId(id) ===
                                  normalizeDetectionId(latestAisDetection.id)
                              )
                            const toggleAisLocation = () =>
                              setShownOnMapDetectionIds((current) =>
                                aisLocationActive
                                  ? current.filter(
                                      (id) =>
                                        normalizeDetectionId(id) !==
                                        normalizeDetectionId(
                                          latestAisDetection.id
                                        )
                                    )
                                  : [...current, latestAisDetection.id]
                              )
                            return (
                              <>
                                {shipDetailsVersion === 'v10' && (
                                  <Box
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      gap: 6,
                                      marginBottom: 3,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: '#FFFFFF',
                                        fontSize: 10,
                                        fontWeight: 500,
                                      }}
                                    >
                                      Show all events on map
                                    </Text>
                                    <Box
                                      role="switch"
                                      tabIndex={0}
                                      aria-label="Show all events on map"
                                      aria-checked={
                                        allLoadedTimelineLocationsShown
                                      }
                                      onClick={
                                        loadedTimelineLocationIds.length
                                          ? toggleAllLoadedTimelineLocations
                                          : undefined
                                      }
                                      onKeyDown={(event) => {
                                        if (
                                          loadedTimelineLocationIds.length &&
                                          (event.key === 'Enter' ||
                                            event.key === ' ')
                                        ) {
                                          event.preventDefault()
                                          toggleAllLoadedTimelineLocations()
                                        }
                                      }}
                                      style={{
                                        width: 28,
                                        height: 16,
                                        borderRadius: 8,
                                        padding: 2,
                                        display: 'flex',
                                        justifyContent:
                                          allLoadedTimelineLocationsShown
                                            ? 'flex-end'
                                            : 'flex-start',
                                        background:
                                          allLoadedTimelineLocationsShown
                                            ? '#006CD7'
                                            : '#393C56',
                                        cursor: loadedTimelineLocationIds.length
                                          ? 'pointer'
                                          : 'default',
                                        opacity:
                                          loadedTimelineLocationIds.length
                                            ? 1
                                            : 0.45,
                                        transition: 'background 0.15s ease',
                                      }}
                                    >
                                      <Box
                                        style={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          background: '#FFFFFF',
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                )}
                                <Box
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 4,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    AIS Data
                                  </Text>
                                  <Box
                                    style={{
                                      height: 1,
                                      flex: 1,
                                      background: '#393C56',
                                    }}
                                  />
                                  <Box
                                    style={{
                                      width: 18,
                                      height: 1,
                                      background: '#fff',
                                    }}
                                  />
                                </Box>
                                <Box style={{ marginBottom: 8 }}>
                                  <EventTimelineCard
                                    showEventToolsButton={
                                      shipDetailsVersion === 'v7' ||
                                      shipDetailsVersion === 'v8' ||
                                      ((shipDetailsVersion === 'v9' ||
                                        shipDetailsVersion === 'v11') &&
                                        normalizeDetectionId(selectedCard) ===
                                          normalizeDetectionId(
                                            latestAisDetection.id
                                          ))
                                    }
                                    eventToolsContent={
                                      selectedEventToolsPopoverContent
                                    }
                                    eventToolsScrollCloseDelay={
                                      shipDetailsVersion === 'v7' ||
                                      shipDetailsVersion === 'v11'
                                        ? 900
                                        : 400
                                    }
                                    squareImages={
                                      shipDetailsVersion === 'v4' ||
                                      shipDetailsVersion === 'v5' ||
                                      shipDetailsVersion === 'v6' ||
                                      shipDetailsVersion === 'v10'
                                    }
                                    compactActions
                                    showDateContext={false}
                                    showViewEventLocation={false}
                                    date={`${latestAisDetection.date} (Latest)`}
                                    event="AIS"
                                    icon={<AisIcon style={{ height: 14 }} />}
                                    selected={
                                      normalizeDetectionId(selectedCard) ===
                                      normalizeDetectionId(
                                        latestAisDetection.id
                                      )
                                    }
                                    locationActive={aisLocationActive}
                                    onToggleLocation={toggleAisLocation}
                                    onActivate={() => {
                                      updateTabState(
                                        'selectedCard',
                                        latestAisDetection.id
                                      )
                                      setFlashEnabled(true)
                                    }}
                                    onSelect={() => {}}
                                    onGoToDate={
                                      aisDateKey !== mapDate
                                        ? () =>
                                            requestGoToDate(
                                              aisDateKey,
                                              latestAisDetection.id,
                                              aisDate.toLocaleDateString(
                                                'en-US',
                                                {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                }
                                              )
                                            )
                                        : undefined
                                    }
                                    aisInfo={activeShip?.aisInfo || {}}
                                    synMaxInfo={activeShip?.synMaxInfo}
                                    detectionType="ais"
                                  />
                                </Box>
                                <Box
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginBottom: 4,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Detection &amp; Other Events
                                  </Text>
                                  <Box
                                    style={{
                                      height: 1,
                                      flex: 1,
                                      background: '#393C56',
                                    }}
                                  />
                                </Box>
                              </>
                            )
                          })()}
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: 16,
                            marginBottom: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 5,
                            background: '#181926',
                            padding: '8px 0 8px 0',
                          }}
                        >
                          <Menu
                            withinPortal
                            position="top-start"
                            middlewares={{ flip: false, shift: true }}
                            offset={6}
                            opened={timelineTimeMenuOpened}
                            onChange={setTimelineTimeMenuOpened}
                          >
                            <Menu.Target>
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {`Date: ${timelineTimeFilterLabel}`}
                                </Text>
                                <ChevronDown
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: '#FFFFFF',
                                    transform: timelineTimeMenuOpened
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)',
                                    transition: 'transform 140ms ease',
                                  }}
                                />
                              </Box>
                            </Menu.Target>
                            <Menu.Dropdown
                              styles={{
                                dropdown: {
                                  background: '#1B1D2E',
                                  border: '1px solid #393C56',
                                  minWidth: 170,
                                  padding: 0,
                                },
                              }}
                            >
                              {TIMELINE_TIME_FILTER_OPTIONS.map((option) => (
                                <Menu.Item
                                  key={option.value}
                                  onClick={() => {
                                    updateTabState(
                                      'timelineTimeFilter',
                                      option.value
                                    )
                                    setTimelineTimeMenuOpened(false)
                                  }}
                                  styles={{
                                    item: {
                                      color: '#fff',
                                      fontSize: 12,
                                      fontWeight:
                                        timelineTimeFilter === option.value
                                          ? 700
                                          : 500,
                                      padding: '12px 16px',
                                      background:
                                        timelineTimeFilter === option.value
                                          ? '#393C56'
                                          : 'transparent',
                                      borderRadius: 0,
                                    },
                                    itemLabel: { color: '#fff' },
                                  }}
                                >
                                  {option.label}
                                </Menu.Item>
                              ))}
                            </Menu.Dropdown>
                          </Menu>
                          <Menu
                            withinPortal
                            position="top-start"
                            middlewares={{ flip: false, shift: true }}
                            offset={6}
                            opened={timelineEventTypeMenuOpened}
                            onChange={setTimelineEventTypeMenuOpened}
                          >
                            <Menu.Target>
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {`Event type: ${timelineEventTypeDisplayLabel}`}
                                </Text>
                                <ChevronDown
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: '#FFFFFF',
                                    transform: timelineEventTypeMenuOpened
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)',
                                    transition: 'transform 140ms ease',
                                  }}
                                />
                              </Box>
                            </Menu.Target>
                            <Menu.Dropdown
                              styles={{
                                dropdown: {
                                  background: '#1B1D2E',
                                  border: '1px solid #393C56',
                                  minWidth: 170,
                                  padding: 0,
                                },
                              }}
                            >
                              {TIMELINE_EVENT_TYPE_FILTER_OPTIONS.map(
                                (option) => (
                                  <Menu.Item
                                    key={option.value}
                                    onClick={() => {
                                      updateTabState(
                                        'timelineEventTypeFilter',
                                        option.value
                                      )
                                      setTimelineEventTypeMenuOpened(false)
                                    }}
                                    styles={{
                                      item: {
                                        color: '#fff',
                                        fontSize: 12,
                                        fontWeight:
                                          timelineEventTypeFilter ===
                                          option.value
                                            ? 700
                                            : 500,
                                        padding: '12px 16px',
                                        background:
                                          timelineEventTypeFilter ===
                                          option.value
                                            ? '#393C56'
                                            : 'transparent',
                                        borderRadius: 0,
                                      },
                                      itemLabel: { color: '#fff' },
                                    }}
                                  >
                                    {option.label}
                                  </Menu.Item>
                                )
                              )}
                            </Menu.Dropdown>
                          </Menu>
                          <Box
                            onClick={() =>
                              setTimelineSortByTab((prev) => ({
                                ...prev,
                                [activeShipTab]:
                                  (prev[activeShipTab] ?? 'desc') === 'desc'
                                    ? 'asc'
                                    : 'desc',
                              }))
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              cursor: 'pointer',
                              userSelect: 'none',
                            }}
                          >
                            <Text
                              style={{
                                color: '#FFFFFF',
                                fontSize: 10,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {timelineSortLabel}
                            </Text>
                            <ChevronDown
                              style={{
                                width: 16,
                                height: 16,
                                color: '#FFFFFF',
                                transform:
                                  timelineSortOrder === 'asc'
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                transition: 'transform 140ms ease',
                              }}
                            />
                          </Box>
                        </Box>
                        {sortedFilteredTimelineItems.map((item, index) => {
                          const isLastTimelineItem =
                            index === sortedFilteredTimelineItems.length - 1
                          if (item.kind === 'context') {
                            const contextEvent = item.event
                            return (
                              <Box
                                key={contextEvent.id}
                                style={{
                                  marginBottom: isLastTimelineItem ? 0 : 8,
                                }}
                              >
                                <EventTimelineCard
                                  showEventToolsButton={
                                    shipDetailsVersion === 'v7' ||
                                    shipDetailsVersion === 'v8'
                                  }
                                  eventToolsContent={
                                    selectedEventToolsPopoverContent
                                  }
                                  eventToolsScrollCloseDelay={
                                    shipDetailsVersion === 'v7' ||
                                    shipDetailsVersion === 'v11'
                                      ? 900
                                      : 400
                                  }
                                  squareImages={
                                    shipDetailsVersion === 'v4' ||
                                    shipDetailsVersion === 'v5' ||
                                    shipDetailsVersion === 'v6' ||
                                    shipDetailsVersion === 'v10'
                                  }
                                  showViewEventLocation={
                                    shipDetailsVersion !== 'v2' &&
                                    shipDetailsVersion !== 'v3' &&
                                    shipDetailsVersion !== 'v4' &&
                                    shipDetailsVersion !== 'v5' &&
                                    shipDetailsVersion !== 'v6' &&
                                    shipDetailsVersion !== 'v7' &&
                                    shipDetailsVersion !== 'v11' &&
                                    shipDetailsVersion !== 'v8' &&
                                    shipDetailsVersion !== 'v9' &&
                                    shipDetailsVersion !== 'v10'
                                  }
                                  compactActions={
                                    shipDetailsVersion === 'v2' ||
                                    shipDetailsVersion === 'v3' ||
                                    shipDetailsVersion === 'v4' ||
                                    shipDetailsVersion === 'v5' ||
                                    shipDetailsVersion === 'v6' ||
                                    shipDetailsVersion === 'v7' ||
                                    shipDetailsVersion === 'v11' ||
                                    shipDetailsVersion === 'v8' ||
                                    shipDetailsVersion === 'v9' ||
                                    shipDetailsVersion === 'v10'
                                  }
                                  date={contextEvent.dateLabel}
                                  variant={contextEvent.variant}
                                  port={contextEvent.port}
                                  status={contextEvent.status}
                                  duration={contextEvent.duration}
                                  newFlag={contextEvent.newFlag}
                                  previousFlag={contextEvent.previousFlag}
                                />
                              </Box>
                            )
                          }

                          const det = item.detection
                          const stsLightIcon = renderStsBars(
                            getStsDetectionBarColors(det),
                            {
                              width: 6,
                              height: 14,
                              gap: 2,
                            }
                          )
                          const stsAisIcon = renderStsBars(
                            getStsDetectionBarColors(det),
                            {
                              width: 6,
                              height: 14,
                              gap: 2,
                            }
                          )
                          const useV20StsIcon =
                            stsVersion === 'v17' ||
                            stsVersion === 'v20' ||
                            stsVersion === 'v21'
                          const iconMap = {
                            ais: <AisIcon style={{ height: 14 }} />,
                            light: <LightShipIcon style={{ height: 14 }} />,
                            dark: <DarkShipIcon style={{ height: 14 }} />,
                            spoofing: <SpoofingIcon style={{ height: 14 }} />,
                            sts: useV20StsIcon ? (
                              <StsV20Icon type="sts" size={16} />
                            ) : (
                              stsLightIcon
                            ),
                            'sts-ais': useV20StsIcon ? (
                              <StsV20Icon type="sts-ais" size={16} />
                            ) : (
                              stsAisIcon
                            ),
                            unattributed: (
                              <UnattributedIcon style={{ height: 14 }} />
                            ),
                          }
                          const parsedDetDate = new Date(det.date)
                          const detDateKey = `${parsedDetDate.getFullYear()}-${String(parsedDetDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDetDate.getDate()).padStart(2, '0')}`
                          return (
                            <Box
                              key={det.id}
                              ref={(el) => {
                                cardRefs.current[det.id] = el
                              }}
                              style={{
                                marginBottom: isLastTimelineItem ? 0 : 8,
                              }}
                            >
                              <EventTimelineCard
                                showEventToolsButton={
                                  shipDetailsVersion === 'v7' ||
                                  shipDetailsVersion === 'v8' ||
                                  ((shipDetailsVersion === 'v9' ||
                                    shipDetailsVersion === 'v11') &&
                                    normalizeDetectionId(selectedCard) ===
                                      normalizeDetectionId(det.id))
                                }
                                eventToolsContent={
                                  selectedEventToolsPopoverContent
                                }
                                eventToolsScrollCloseDelay={
                                  shipDetailsVersion === 'v7' ||
                                  shipDetailsVersion === 'v11'
                                    ? 900
                                    : 400
                                }
                                squareImages={
                                  shipDetailsVersion === 'v4' ||
                                  shipDetailsVersion === 'v5' ||
                                  shipDetailsVersion === 'v6' ||
                                  shipDetailsVersion === 'v10'
                                }
                                showViewEventLocation={
                                  shipDetailsVersion !== 'v2' &&
                                  shipDetailsVersion !== 'v3' &&
                                  shipDetailsVersion !== 'v4' &&
                                  shipDetailsVersion !== 'v5' &&
                                  shipDetailsVersion !== 'v6' &&
                                  shipDetailsVersion !== 'v7' &&
                                  shipDetailsVersion !== 'v11' &&
                                  shipDetailsVersion !== 'v8' &&
                                  shipDetailsVersion !== 'v9' &&
                                  shipDetailsVersion !== 'v10'
                                }
                                compactActions={
                                  shipDetailsVersion === 'v2' ||
                                  shipDetailsVersion === 'v3' ||
                                  shipDetailsVersion === 'v4' ||
                                  shipDetailsVersion === 'v5' ||
                                  shipDetailsVersion === 'v6' ||
                                  shipDetailsVersion === 'v7' ||
                                  shipDetailsVersion === 'v11' ||
                                  shipDetailsVersion === 'v8' ||
                                  shipDetailsVersion === 'v9' ||
                                  shipDetailsVersion === 'v10'
                                }
                                locationActive={
                                  normalizeDetectionId(selectedCard) ===
                                    normalizeDetectionId(det.id) ||
                                  shownOnMapDetectionIds.some(
                                    (id) =>
                                      normalizeDetectionId(id) ===
                                      normalizeDetectionId(det.id)
                                  )
                                }
                                onToggleLocation={
                                  shipDetailsVersion === 'v2' ||
                                  shipDetailsVersion === 'v3' ||
                                  shipDetailsVersion === 'v4' ||
                                  shipDetailsVersion === 'v5' ||
                                  shipDetailsVersion === 'v6' ||
                                  shipDetailsVersion === 'v7' ||
                                  shipDetailsVersion === 'v11' ||
                                  shipDetailsVersion === 'v8' ||
                                  shipDetailsVersion === 'v9' ||
                                  shipDetailsVersion === 'v10'
                                    ? () =>
                                        setShownOnMapDetectionIds((current) => {
                                          const isShown = current.some(
                                            (id) =>
                                              normalizeDetectionId(id) ===
                                              normalizeDetectionId(det.id)
                                          )
                                          return isShown
                                            ? current.filter(
                                                (id) =>
                                                  normalizeDetectionId(id) !==
                                                  normalizeDetectionId(det.id)
                                              )
                                            : [...current, det.id]
                                        })
                                    : undefined
                                }
                                onActivate={
                                  shipDetailsVersion === 'v2' ||
                                  shipDetailsVersion === 'v3' ||
                                  shipDetailsVersion === 'v4' ||
                                  shipDetailsVersion === 'v5' ||
                                  shipDetailsVersion === 'v6' ||
                                  shipDetailsVersion === 'v7' ||
                                  shipDetailsVersion === 'v11' ||
                                  shipDetailsVersion === 'v8' ||
                                  shipDetailsVersion === 'v9' ||
                                  shipDetailsVersion === 'v10'
                                    ? () => {
                                        updateTabState('selectedCard', det.id)
                                        setFlashEnabled(true)
                                      }
                                    : undefined
                                }
                                date={det.date}
                                event={eventLabel[det.type] || det.type}
                                icon={iconMap[det.type]}
                                variant={
                                  det.type === 'sts' || det.type === 'sts-ais'
                                    ? 'sts'
                                    : undefined
                                }
                                selected={
                                  normalizeDetectionId(selectedCard) ===
                                  normalizeDetectionId(det.id)
                                }
                                isPreviewed={previewCards.includes(det.id)}
                                onTogglePreview={() => {
                                  const nextPreviewCards =
                                    previewCards.includes(det.id)
                                      ? previewCards.filter(
                                          (id) => id !== det.id
                                        )
                                      : [...previewCards, det.id]
                                  updateTabState(
                                    'previewCards',
                                    nextPreviewCards
                                  )
                                  // Keep "Show Details" local to the card; do not move map focus.
                                  setPreviewDetectionId(null)
                                }}
                                onGoToDate={
                                  detDateKey !== mapDate
                                    ? () => {
                                        const dateLabel =
                                          parsedDetDate.toLocaleDateString(
                                            'en-US',
                                            {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                            }
                                          )
                                        requestGoToDate(
                                          detDateKey,
                                          det.id,
                                          dateLabel
                                        )
                                      }
                                    : undefined
                                }
                                onSelect={() => {
                                  setFlashEnabled(true)
                                  setPreviewDetectionId(null)
                                  updateTabState('previewCards', [])

                                  // On STS tab, selecting a non-STS event navigates to ship tab.
                                  const shouldSwitchToShipTab =
                                    isStsTab && !det.stsPartner
                                  selectDetection(det, {
                                    source: 'timeline',
                                    allowTabSwitch: shouldSwitchToShipTab,
                                    stsAsShip:
                                      stsVersion === 'v20' ||
                                      stsVersion === 'v21',
                                  })
                                }}
                                onViewStsShips={
                                  det.stsPartner
                                    ? () =>
                                        selectDetection(det, {
                                          source: 'timeline',
                                          allowTabSwitch: true,
                                          stsAsShip:
                                            stsVersion === 'v20' ||
                                            stsVersion === 'v21',
                                        })
                                    : undefined
                                }
                                aisInfo={activeShip.aisInfo}
                                partnerAisInfo={
                                  det.stsPartner
                                    ? ships[det.stsPartner]?.aisInfo
                                    : undefined
                                }
                                shipName={activeShip.name}
                                partnerName={
                                  det.stsPartner
                                    ? ships[det.stsPartner]?.name
                                    : undefined
                                }
                                synMaxInfo={
                                  det.type === 'light' ||
                                  det.type === 'dark' ||
                                  det.type === 'spoofing'
                                    ? activeShip.synMaxInfo
                                    : undefined
                                }
                                detectionType={det.type}
                                stsHeroNode={
                                  (det.type === 'sts' ||
                                    det.type === 'sts-ais') &&
                                  isStsTab &&
                                  Array.isArray(stsShipIds) &&
                                  stsShipIds.length > 1
                                    ? renderStsHero(stsShipIds, {
                                        activeIdx: activeStsShipIndex,
                                        height:
                                          shipDetailsVersion === 'v4' ||
                                          shipDetailsVersion === 'v5' ||
                                          shipDetailsVersion === 'v6' ||
                                          shipDetailsVersion === 'v10'
                                            ? 180
                                            : 206,
                                        width: 180,
                                        marginBottom: 0,
                                        borderRadius: 4,
                                      })
                                    : undefined
                                }
                              />
                            </Box>
                          )
                        })}
                      </Box>
                    )}
                    {activeDetailTab === 1 && (
                      <Box style={{ padding: '8px 20px 20px 20px' }}>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: 16,
                            marginBottom: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 5,
                            background: '#181926',
                            padding: '8px 0 8px 0',
                          }}
                        >
                          <Menu
                            withinPortal
                            position="top-start"
                            middlewares={{ flip: false, shift: true }}
                            offset={6}
                            opened={satTimelineTimeMenuOpened}
                            onChange={setSatTimelineTimeMenuOpened}
                          >
                            <Menu.Target>
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {`Date: ${satTimelineTimeFilterLabel}`}
                                </Text>
                                <ChevronDown
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: '#FFFFFF',
                                    transform: satTimelineTimeMenuOpened
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)',
                                    transition: 'transform 140ms ease',
                                  }}
                                />
                              </Box>
                            </Menu.Target>
                            <Menu.Dropdown
                              styles={{
                                dropdown: {
                                  background: '#1B1D2E',
                                  border: '1px solid #393C56',
                                  minWidth: 170,
                                  padding: 0,
                                },
                              }}
                            >
                              {TIMELINE_TIME_FILTER_OPTIONS.map((option) => (
                                <Menu.Item
                                  key={option.value}
                                  onClick={() => {
                                    updateTabState(
                                      'satTimelineTimeFilter',
                                      option.value
                                    )
                                    setSatTimelineTimeMenuOpened(false)
                                  }}
                                  styles={{
                                    item: {
                                      color: '#fff',
                                      fontSize: 12,
                                      fontWeight:
                                        satTimelineTimeFilter === option.value
                                          ? 700
                                          : 500,
                                      padding: '12px 16px',
                                      background:
                                        satTimelineTimeFilter === option.value
                                          ? '#393C56'
                                          : 'transparent',
                                      borderRadius: 0,
                                    },
                                    itemLabel: { color: '#fff' },
                                  }}
                                >
                                  {option.label}
                                </Menu.Item>
                              ))}
                            </Menu.Dropdown>
                          </Menu>
                          <Menu
                            withinPortal
                            position="top-start"
                            middlewares={{ flip: false, shift: true }}
                            offset={6}
                            opened={satTimelineEventTypeMenuOpened}
                            onChange={setSatTimelineEventTypeMenuOpened}
                          >
                            <Menu.Target>
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {`Data Source: ${satTimelineDataSourceFilterLabel}`}
                                </Text>
                                <ChevronDown
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: '#FFFFFF',
                                    transform: satTimelineEventTypeMenuOpened
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)',
                                    transition: 'transform 140ms ease',
                                  }}
                                />
                              </Box>
                            </Menu.Target>
                            <Menu.Dropdown
                              styles={{
                                dropdown: {
                                  background: '#1B1D2E',
                                  border: '1px solid #393C56',
                                  minWidth: 170,
                                  padding: 0,
                                },
                              }}
                            >
                              {SAT_TIMELINE_DATA_SOURCE_FILTER_OPTIONS.map(
                                (option) => (
                                  <Menu.Item
                                    key={option.value}
                                    onClick={() => {
                                      updateTabState(
                                        'satTimelineDataSourceFilter',
                                        option.value
                                      )
                                      setSatTimelineEventTypeMenuOpened(false)
                                    }}
                                    styles={{
                                      item: {
                                        color: '#fff',
                                        fontSize: 12,
                                        fontWeight:
                                          satTimelineDataSourceFilter ===
                                          option.value
                                            ? 700
                                            : 500,
                                        padding: '12px 16px',
                                        background:
                                          satTimelineDataSourceFilter ===
                                          option.value
                                            ? '#393C56'
                                            : 'transparent',
                                        borderRadius: 0,
                                      },
                                      itemLabel: { color: '#fff' },
                                    }}
                                  >
                                    {option.label}
                                  </Menu.Item>
                                )
                              )}
                            </Menu.Dropdown>
                          </Menu>
                          <Box
                            onClick={() =>
                              setSatSortByTab((prev) => ({
                                ...prev,
                                [activeShipTab]:
                                  (prev[activeShipTab] ?? 'desc') === 'desc'
                                    ? 'asc'
                                    : 'desc',
                              }))
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              cursor: 'pointer',
                              userSelect: 'none',
                            }}
                          >
                            <Text
                              style={{
                                color: '#FFFFFF',
                                fontSize: 10,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {satTimelineSortOrder === 'desc'
                                ? 'Sort by: Date (Newest)'
                                : 'Sort by: Date (Oldest)'}
                            </Text>
                            <ChevronDown
                              style={{
                                width: 16,
                                height: 16,
                                color: '#FFFFFF',
                                transform:
                                  satTimelineSortOrder === 'asc'
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                transition: 'transform 140ms ease',
                              }}
                            />
                          </Box>
                        </Box>
                        {satelliteTimelineRows.length === 0 ? (
                          <Text style={{ color: '#898F9D', fontSize: 12 }}>
                            No satellite imagery available.
                          </Text>
                        ) : (
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                              // marginTop: 8,
                              gap: 8,
                              cursor: 'pointer',
                            }}
                          >
                            {satelliteTimelineRows.map((item) => (
                              <Box
                                key={item.id}
                                ref={(el) => {
                                  const key = normalizeDetectionId(
                                    item.detectionId
                                  )
                                  if (el) {
                                    satCardRefs.current[key] = el
                                  } else {
                                    delete satCardRefs.current[key]
                                  }
                                }}
                                onClick={() => {
                                  if (activeShipTab) {
                                    setSelectedSatDetectionByTab((prev) => ({
                                      ...prev,
                                      [activeShipTab]: normalizeDetectionId(
                                        item.detectionId
                                      ),
                                    }))
                                  }
                                  applyGoToDate(
                                    item.detectionDateKey,
                                    item.detectionId,
                                    { preferExactDetection: true }
                                  )
                                }}
                                onMouseEnter={() =>
                                  setHoveredSatelliteCardId(item.id)
                                }
                                onMouseLeave={() =>
                                  setHoveredSatelliteCardId(null)
                                }
                                style={{
                                  minWidth: 0,
                                  border: item.isSelected
                                    ? '1px solid #0094FF'
                                    : '1px solid #3D456B',
                                  borderRadius: 4,
                                  background: item.isSelected
                                    ? '#262947'
                                    : hoveredSatelliteCardId === item.id
                                      ? '#262947'
                                      : '#24263C',
                                  padding: 10,
                                  transition:
                                    'background 140ms ease, border-color 140ms ease',
                                  boxSizing: 'border-box',
                                }}
                              >
                                <Box
                                  style={{
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    background: '#1B1D2E',
                                    height: 226,
                                    border: '1px solid #393C56',
                                  }}
                                >
                                  <img
                                    src={item.image}
                                    alt="Satellite timeline capture"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                </Box>
                                <Box style={{ marginTop: 12 }}>
                                  <KeyValuePair
                                    keyName="Image Captured Time"
                                    value={item.capturedTime}
                                  />
                                </Box>
                                <Box
                                  style={{
                                    marginTop: 8,
                                    display: 'grid',
                                    gridTemplateColumns:
                                      'repeat(3, minmax(0, 1fr))',
                                    gap: 12,
                                  }}
                                >
                                  <KeyValuePair
                                    keyName="Latitude"
                                    value={item.latitude}
                                  />
                                  <KeyValuePair
                                    keyName="Longitude"
                                    value={item.longitude}
                                  />
                                  <KeyValuePair
                                    keyName="OID"
                                    value={item.oid}
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                    {activeDetailTab === 2 && (
                      <Box style={{ padding: '8px 20px 20px 20px' }}>
                        <Box
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: '#8D95AA',
                              fontSize: 12,
                              fontWeight: 400,
                              lineHeight: 1.2,
                            }}
                          >
                            Ownership
                          </Text>
                          <Box
                            style={{
                              border: '1px solid #3D456B',
                              borderRadius: 4,
                              background: '#24263C',
                              padding: 20,
                              marginBottom: 16,
                            }}
                          >
                            <Box
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(2, minmax(0, 1fr))',
                                gap: '12px 20px',
                              }}
                            >
                              <KeyValuePair
                                keyName="Commercial Owner"
                                value={ownershipInfo.commercialOwner}
                              />
                              <KeyValuePair
                                keyName="Effective Owner"
                                value={ownershipInfo.effectiveOwner}
                              />
                              <KeyValuePair
                                keyName="Financial Owner"
                                value={ownershipInfo.financialOwner}
                              />
                              <KeyValuePair
                                keyName="Technical Owner"
                                value={ownershipInfo.technicalOwner}
                              />
                              <KeyValuePair
                                keyName="P&I Club"
                                value={ownershipInfo.pniClub}
                              />
                              <KeyValuePair
                                keyName="Member"
                                value={ownershipInfo.member}
                              />
                            </Box>
                          </Box>

                          <Text
                            style={{
                              color: '#8D95AA',
                              fontSize: 12,
                              fontWeight: 400,
                              lineHeight: 1.2,
                            }}
                          >
                            Attribution
                          </Text>
                          <Box
                            style={{
                              width: '100%',
                              borderRadius: 4,
                              overflow: 'hidden',
                              background: 'transparent',
                            }}
                          >
                            <Box
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(0, 0.9fr) 96px',
                                columnGap: 10,
                                alignItems: 'center',
                                padding: '6px 12px',
                                background: '#24263C',
                                borderRadius: 4,
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  color: '#ffff',
                                  fontSize: 12,
                                  minWidth: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                Metric
                              </Text>
                              <Text
                                style={{
                                  color: '#ffff',
                                  fontSize: 12,
                                  minWidth: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                Prediction
                              </Text>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 12,
                                  minWidth: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                Reference
                              </Text>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 12,
                                  minWidth: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                Difference
                              </Text>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 12,
                                  textAlign: 'center',
                                }}
                              >
                                Score
                              </Text>
                            </Box>
                            {attributionRows.map((row, idx) => (
                              <Box
                                key={`${row.metric}-${idx}`}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    'minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(0, 0.9fr) 96px',
                                  columnGap: 10,
                                  alignItems: 'center',
                                  padding: '6px 12px',
                                  borderTop:
                                    idx === 0 ? 'none' : '1px solid #393C56',
                                  background: '#181926',
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    lineHeight: 1.2,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.metric}
                                </Text>
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.prediction}
                                </Text>
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.reference}
                                </Text>
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 400,
                                    lineHeight: 1.2,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.difference}
                                </Text>
                                <Box
                                  style={{
                                    justifySelf: 'center',
                                    borderRadius: 999,
                                    background: row.scoreBg,
                                    color: row.scoreColor,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    lineHeight: 1.2,
                                    textAlign: 'center',
                                    minWidth: 70,
                                    flexShrink: 0,
                                  }}
                                >
                                  {row.score}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    )}
                    {isTiffaniShipTab && activeDetailTab === 3 && (
                      <Box style={{ padding: '8px 20px 20px 20px' }}>
                        <Box
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: 4,
                            marginBottom: 10,
                            borderRadius: 6,
                            border: '1px solid #3D456B',
                            background: '#24263C',
                          }}
                        >
                          {SANCTION_TITLE_VARIANT_OPTIONS.map((option) => {
                            const isActive =
                              sanctionTitleVariant === option.value
                            return (
                              <Box
                                key={option.value}
                                onClick={() =>
                                  setSanctionTitleVariant(option.value)
                                }
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: 4,
                                  border: isActive
                                    ? '1px solid #0094FF'
                                    : '1px solid transparent',
                                  background: isActive
                                    ? '#273252'
                                    : 'transparent',
                                  padding: '4px 10px',
                                }}
                              >
                                <Text
                                  style={{
                                    color: isActive ? '#FFFFFF' : '#8D95AA',
                                    fontSize: 11,
                                    fontWeight: isActive ? 600 : 500,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {option.label}
                                </Text>
                              </Box>
                            )
                          })}
                        </Box>
                        <SanctionDetailsVersionB
                          titleVariant={sanctionTitleVariant}
                        />
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      )}
      {isStsTab &&
        stsVersion === 'v7' &&
        activeShip &&
        stsNetworkRect &&
        stsNetworkOpen &&
        createPortal(
          (() => {
            const list = stsShipIds || []
            const n = list.length
            if (n === 0) return null
            const W = 1000
            const H = 800
            const cx = W / 2
            const cy = H / 2
            const R = Math.min(W, H) / 2 - 150
            const partnerCount = Math.max(n - 1, 1)
            const transferCount = (idx) => ((idx * 7) % 3) + 1
            const pos = (idx) => {
              if (idx === 0) return { x: cx, y: cy }
              const k = idx - 1
              const theta = (k / partnerCount) * Math.PI * 2 - Math.PI / 2
              return {
                x: cx + R * Math.cos(theta),
                y: cy + R * Math.sin(theta),
              }
            }
            const nodeR = (idx) =>
              idx === 0 ? 46 : 24 + transferCount(idx) * 5
            const secondaryTargets = (idx) => {
              if (idx === 0 || n <= 2) return []
              const a = ((idx * 2) % (n - 1)) + 1
              const b = ((idx * 3 + 1) % (n - 1)) + 1
              return [...new Set([a, b])].filter(
                (t) => t !== idx && t !== 0 && t < n
              )
            }
            const sel = activeStsShipIndex
            const selSecondary = new Set(secondaryTargets(sel))
            const panelPos = stsNetworkPos || {
              x: Math.max(
                stsNetworkRect.left + 16,
                window.innerWidth - stsNetworkSize.width - 16
              ),
              y: stsNetworkRect.top + 16,
            }
            return (
              <Box
                style={{
                  position: 'fixed',
                  top: panelPos.y,
                  left: panelPos.x,
                  width: stsNetworkSize.width,
                  height: stsNetworkSize.height,
                  background: '#12131F',
                  border: '1px solid #393C56',
                  borderRadius: 10,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  zIndex: 45,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box
                  onMouseDown={startNetworkDrag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid #393C56',
                    flexShrink: 0,
                    cursor: 'move',
                    userSelect: 'none',
                  }}
                >
                  <Box>
                    <Text
                      style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}
                    >
                      Transfer network
                    </Text>
                    <Text style={{ color: '#8B90A5', fontSize: 12 }}>
                      {n} vessels · click a node to focus
                    </Text>
                  </Box>
                  <Box
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setStsNetworkOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 4,
                      border: '1px solid #393C56',
                      background: '#24263C',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Collapse
                  </Box>
                </Box>
                <Box style={{ flex: 1, minHeight: 0 }}>
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Spoke edges: subject <-> each partner */}
                    {list.map((sid, idx) => {
                      if (idx === 0) return null
                      const p = pos(idx)
                      const isSel = sel === idx
                      return (
                        <line
                          key={`spoke-${idx}`}
                          x1={cx}
                          y1={cy}
                          x2={p.x}
                          y2={p.y}
                          stroke={isSel ? '#0094FF' : '#3A3F5C'}
                          strokeWidth={1.5 + transferCount(idx)}
                          strokeOpacity={isSel ? 0.9 : 0.5}
                        >
                          <title>
                            {`${ships[list[0]]?.name} ↔ ${ships[sid]?.name} · ${transferCount(
                              idx
                            )} transfer(s)`}
                          </title>
                        </line>
                      )
                    })}
                    {/* Secondary edges revealed for the selected partner */}
                    {[...selSecondary].map((t) => {
                      const a = pos(sel)
                      const b = pos(t)
                      return (
                        <line
                          key={`sec-${sel}-${t}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke="#0094FF"
                          strokeWidth={2}
                          strokeOpacity={0.7}
                          strokeDasharray="6 6"
                        >
                          <title>
                            {`${ships[list[sel]]?.name} ↔ ${ships[list[t]]?.name}`}
                          </title>
                        </line>
                      )
                    })}
                    {/* Nodes */}
                    {list.map((sid, idx) => {
                      const s = ships[sid]
                      if (!s) return null
                      const p = pos(idx)
                      const r = nodeR(idx)
                      const isSel = sel === idx
                      const isSubject = idx === 0
                      return (
                        <g
                          key={`node-${idx}`}
                          onClick={() => setActiveStsShip(idx)}
                          style={{ cursor: 'pointer' }}
                        >
                          <title>
                            {`${s.name}${isSubject ? ' · vessel of interest' : ` · transferred ${stsTransferLabel(idx)}`}`}
                          </title>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={r}
                            fill={
                              isSubject
                                ? '#0094FF'
                                : isSel
                                  ? 'rgba(0,148,255,0.18)'
                                  : '#24263C'
                            }
                            stroke={isSel || isSubject ? '#0094FF' : '#393C56'}
                            strokeWidth={isSel ? 4 : 2}
                          />
                          <text
                            x={p.x}
                            y={p.y + 9}
                            textAnchor="middle"
                            fontSize={r * 0.85}
                          >
                            {s.flag || '🚢'}
                          </text>
                          <text
                            x={p.x}
                            y={p.y + r + 26}
                            textAnchor="middle"
                            fontSize={22}
                            fontWeight={isSel || isSubject ? 700 : 500}
                            fill={isSel || isSubject ? '#fff' : '#C7CCDD'}
                          >
                            {s.name}
                          </text>
                          {isSubject && (
                            <text
                              x={p.x}
                              y={p.y + r + 48}
                              textAnchor="middle"
                              fontSize={16}
                              fill="#8B90A5"
                            >
                              Vessel of interest
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </Box>
                <Box
                  onMouseDown={startNetworkResize}
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 18,
                    height: 18,
                    cursor: 'nwse-resize',
                    background:
                      'linear-gradient(135deg, transparent 50%, #4C5070 50%)',
                    borderBottomRightRadius: 10,
                  }}
                />
              </Box>
            )
          })(),
          document.body
        )}
      {isStsTab &&
        stsVersion === 'v7' &&
        activeShip &&
        stsNetworkRect &&
        !stsNetworkOpen &&
        createPortal(
          <Box
            onClick={() => setStsNetworkOpen(true)}
            style={{
              position: 'fixed',
              top: stsNetworkRect.top + 12,
              left: stsNetworkRect.left + 12,
              zIndex: 45,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 4,
              border: '1px solid #393C56',
              background: '#24263C',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
            }}
          >
            Show network
          </Box>,
          document.body
        )}
      {isPortTab && !loading && (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            padding: '20px',
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Title order={4} style={{ color: 'white' }}>
                {activeTab.name}
              </Title>
              {activeTab.flag && (
                <Text style={{ fontSize: 18 }}>{activeTab.flag}</Text>
              )}
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tooltip
                label={
                  isBookmarkVersion
                    ? isBookmarkProto
                      ? 'Bookmark'
                      : 'Favorite'
                    : 'Add/Remove from My Ships'
                }
                withArrow
                openDelay={200}
                styles={{
                  tooltip: {
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #000',
                  },
                  arrow: {
                    backgroundColor: '#000',
                    border: '1px solid #000',
                  },
                }}
              >
                <Box
                  onClick={() => {
                    if (activeTab?.id) toggleFavoritePort(activeTab)
                  }}
                  onMouseEnter={() => setHoveredTopAction('port-favorite')}
                  onMouseLeave={() => setHoveredTopAction(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    cursor: 'pointer',
                    background:
                      hoveredTopAction === 'port-favorite'
                        ? '#24263C'
                        : 'transparent',
                  }}
                >
                  {isBookmarkProto ? (
                    <Bookmark
                      style={{
                        color: isActivePortFavorite ? '#0094FF' : '#fff',
                        fill: isActivePortFavorite ? '#0094FF' : 'none',
                        width: 20,
                        height: 20,
                      }}
                    />
                  ) : (
                    <Star01
                      style={{
                        color: isActivePortFavorite ? '#F7C948' : '#fff',
                        fill: isActivePortFavorite ? '#F7C948' : 'none',
                        width: 20,
                        height: 20,
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
              <Tooltip
                label="Expand/collapse"
                withArrow
                openDelay={200}
                styles={{
                  tooltip: {
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #000',
                  },
                  arrow: {
                    backgroundColor: '#000',
                    border: '1px solid #000',
                  },
                }}
              >
                <Box
                  onClick={handleTopSummaryToggle}
                  onMouseEnter={() => setHoveredTopAction('port-resize')}
                  onMouseLeave={() => setHoveredTopAction(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    cursor: 'pointer',
                    background:
                      hoveredTopAction === 'port-resize'
                        ? '#24263C'
                        : 'transparent',
                  }}
                >
                  <EnlargeVerticalIcon
                    width={26}
                    height={26}
                    style={{
                      color: '#fff',
                    }}
                  />
                </Box>
              </Tooltip>
            </Box>
          </Box>

          {/* Temporarily hidden: "Port shape visible on map" banner
          {portShapeControlEnabled &&
            (portVisibilityBehavior === 'strict-layer-toggle' ||
              portVisibilityBehavior === 'strict-layer-toggle-v2' ||
              portVisibilityBehavior === 'strict-layer-toggle-v3') && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  marginBottom: 16,
                  background: portsLayerVisible
                    ? 'rgba(0, 148, 255, 0.08)'
                    : '#060a14',
                  border: portsLayerVisible
                    ? '1px solid #0094FF'
                    : '1px solid #1e293b',
                  borderRadius: 6,
                  gap: 8,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MarkerPin01
                    size={15}
                    color={portsLayerVisible ? '#0094FF' : '#888F9E'}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: portsLayerVisible ? '#ffffff' : '#888F9E',
                    }}
                  >
                    {portsLayerVisible
                      ? 'Port shape visible on map'
                      : 'Port shape hidden — Ports layer is off'}
                  </Text>
                </Box>
                <Box
                  onClick={() =>
                    onPortsLayerVisibleChange?.(!portsLayerVisible)
                  }
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: portsLayerVisible ? '#888F9E' : '#0094FF',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {portsLayerVisible ? 'Hide' : 'Show on map'}
                </Box>
              </Box>
            )}
          */}

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 24,
              marginBottom: 16,
            }}
          >
            <KeyValuePair keyName="Harbor Type" value="Natural" />
            <KeyValuePair keyName="Port Geography" value="Sea" />
            <KeyValuePair keyName="Port Size" value="Major" />
            <KeyValuePair keyName="Port Status" value="Active" />
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyValuePair keyName="Un/locode" value="SGSIN" />
              <Copy02
                style={{
                  color: '#fff',
                  width: 16,
                  height: 16,
                  cursor: 'pointer',
                  marginTop: 16,
                }}
              />
            </Box>
          </Box>

          <Box>
            <KeyValuePair
              keyName="Port Access"
              value="Inland waterway, rail, road, sea"
            />
          </Box>

          {!isTopSummaryCollapsed && (
            <Box
              style={{
                marginTop: 20,
                padding: 12,
                background: '#24263C',
                border: '1px solid #393C56',
                borderRadius: 4,
                display: 'flex',
                gap: 6,
              }}
            >
              <ShipPathPanelButton
                fullWidth
                singleLineLabel
                label="Create Alert"
                icon={<AlertIcon />}
                onClick={() => {}}
              />
              <ShipPathPanelButton
                fullWidth
                singleLineLabel
                label="Task Satellite Imagery"
                icon={<SatelliteIcon />}
                onClick={() => {}}
              />
              {(pathToPortVersion === 'v5' ||
                pathToPortVersion === 'v6') && (
                <ShipPathPanelButton
                  fullWidth
                  singleLineLabel
                  active={arrivalsOverlayOn}
                  label={
                    arrivalsOverlayOn ? 'Hide Path to Port' : 'Path to Port'
                  }
                  icon={
                    <Anchor style={{ width: 20, height: 20, color: '#fff' }} />
                  }
                  onClick={() =>
                    setArrivalsOverlayOn((v) => {
                      const next = !v
                      // Turning the overlay on clears any single-vessel focus so
                      // the two views stay mutually exclusive.
                      if (next) {
                        clearPathToPort()
                        setExpandedArrivalIds(new Set())
                      }
                      return next
                    })
                  }
                />
              )}
            </Box>
          )}

          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 24,
              marginBottom: 24,
              flexShrink: 0,
            }}
          >
            {['Port Details', 'Terminal Details', 'Berth Details'].map(
              (level, i, arr) => (
                <React.Fragment key={level}>
                  <Button
                    onClick={() => {
                      setActivePortLevel(level)
                      if (level === 'Port Details') {
                        setSelectedTerminal(null)
                        setSelectedBerth(null)
                      } else if (level === 'Terminal Details') {
                        setSelectedTerminal(null)
                        setSelectedBerth(null)
                      } else if (level === 'Berth Details') {
                        setSelectedBerth(null)
                        setSelectedTerminal(null)
                      }
                      if (
                        level === 'Terminal Details' &&
                        (activePortTab === 'Ships In Port' ||
                          activePortTab === 'Expected Arrivals' ||
                          activePortTab === 'Notes' ||
                          activePortTab === 'Specifications')
                      ) {
                        setActivePortTab('Ship Handles')
                      } else if (
                        level === 'Berth Details' &&
                        (activePortTab === 'Ships In Port' ||
                          activePortTab === 'Expected Arrivals' ||
                          activePortTab === 'Notes')
                      ) {
                        setActivePortTab('Ship Handles')
                      } else if (
                        level === 'Port Details' &&
                        ![
                          'Ships In Port',
                          'Expected Arrivals',
                          'Ship Handles',
                          'Cargo Handles',
                          'Services',
                          'Notes',
                        ].includes(activePortTab)
                      ) {
                        setActivePortTab('Ships In Port')
                      }
                    }}
                    style={{
                      background:
                        activePortLevel === level
                          ? 'rgba(0, 148, 255, 0.1)'
                          : 'transparent',
                      border: `1px solid ${activePortLevel === level ? '#0094FF' : '#393C56'}`,
                      color: activePortLevel === level ? '#fff' : '#888F9E',
                      fontWeight: 500,
                      fontSize: 14,
                      height: 36,
                      padding: '0 16px',
                      flexShrink: 0,
                    }}
                  >
                    {level}
                  </Button>
                  {i < arr.length - 1 && (
                    <ChevronRight
                      style={{
                        color: '#393C56',
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </React.Fragment>
              )
            )}
          </Box>

          {activePortLevel === 'Terminal Details' && (
            <Box style={{ marginBottom: 24 }}>
              <Text style={{ color: '#888F9E', fontSize: 12, marginBottom: 8 }}>
                Terminal
              </Text>
              <Select
                placeholder="Select a terminal"
                value={selectedTerminal}
                onChange={setSelectedTerminal}
                data={[
                  { value: 'brani', label: 'BRANI TERMINAL' },
                  {
                    value: 'jurong_vlcc',
                    label: 'JURONG ISLAND VLCC TERMINAL',
                  },
                  { value: 'jurong_port', label: 'JURONG PORT' },
                ]}
                searchable
                rightSection={
                  <ChevronDown
                    style={{ width: 16, height: 16, color: '#fff' }}
                  />
                }
                styles={{
                  input: {
                    backgroundColor: '#0A0E19',
                    borderColor: '#424750',
                    color: '#fff',
                    height: 40,
                    '&:focus': {
                      borderColor: '#0094FF',
                    },
                    '&::placeholder': {
                      color: '#fff',
                    },
                  },
                  dropdown: {
                    backgroundColor: '#0A0E19',
                    borderColor: '#424750',
                  },
                  option: {
                    color: '#fff',
                    padding: '10px 16px',
                    fontSize: 14,
                    backgroundColor: 'transparent',
                    '&[data-hovered]': {
                      backgroundColor: '#0094FF',
                      color: '#fff',
                    },
                    '&:hover': {
                      backgroundColor: '#0094FF',
                      color: '#fff',
                    },
                    '&[data-selected]': {
                      backgroundColor: 'rgba(0, 148, 255, 0.1)',
                      color: '#0094FF',
                    },
                  },
                }}
              />

              {selectedTerminal && (
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginTop: 24,
                  }}
                >
                  <Box
                    style={{
                      minWidth: 0,
                      flex: '1 1 auto',
                      overflow: 'hidden',
                    }}
                  >
                    <KeyValuePair
                      keyName="Terminal Name"
                      value={
                        ['brani', 'jurong_vlcc', 'jurong_port'].includes(
                          selectedTerminal
                        )
                          ? [
                              'BRANI TERMINAL',
                              'JURONG ISLAND VLCC TERMINAL',
                              'JURONG PORT',
                            ][
                              ['brani', 'jurong_vlcc', 'jurong_port'].indexOf(
                                selectedTerminal
                              )
                            ]
                          : 'BRANI TERMINAL'
                      }
                    />
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      minWidth: 0,
                      flex: '1 1 auto',
                      overflow: 'hidden',
                    }}
                  >
                    <Box style={{ minWidth: 0, overflow: 'hidden' }}>
                      <KeyValuePair
                        keyName="Terminal Code"
                        value="SGSIN0001TD"
                      />
                    </Box>
                    <Copy02
                      style={{
                        color: '#fff',
                        width: 16,
                        height: 16,
                        cursor: 'pointer',
                        marginTop: 14,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                  <Box
                    style={{
                      minWidth: 0,
                      flex: '1 1 auto',
                      overflow: 'hidden',
                    }}
                  >
                    <KeyValuePair keyName="Terminal Subtype" value="Dry" />
                  </Box>
                  <Box style={{ minWidth: 0, flex: '0 0 auto' }}>
                    <KeyValuePair keyName="Status" value="Active" />
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {activePortLevel === 'Berth Details' && (
            <Box style={{ marginBottom: 24 }}>
              <Text style={{ color: '#888F9E', fontSize: 12, marginBottom: 8 }}>
                Berth
              </Text>
              <Select
                placeholder="Select a berth"
                value={selectedBerth}
                onChange={setSelectedBerth}
                data={[
                  { value: 'b1', label: 'BERTH NO. B1' },
                  { value: 'b2', label: 'BERTH NO. B2' },
                  { value: 'b3', label: 'BERTH NO. B3' },
                ]}
                searchable
                rightSection={
                  <ChevronDown
                    style={{ width: 16, height: 16, color: '#fff' }}
                  />
                }
                styles={{
                  input: {
                    backgroundColor: '#0A0E19',
                    borderColor: '#424750',
                    color: '#fff',
                    height: 40,
                    '&:focus': {
                      borderColor: '#0094FF',
                    },
                    '&::placeholder': {
                      color: '#fff',
                    },
                  },
                  dropdown: {
                    backgroundColor: '#0A0E19',
                    borderColor: '#424750',
                  },
                  option: {
                    color: '#fff',
                    padding: '10px 16px',
                    fontSize: 14,
                    backgroundColor: 'transparent',
                    '&[data-hovered]': {
                      backgroundColor: '#0094FF',
                      color: '#fff',
                    },
                    '&:hover': {
                      backgroundColor: '#0094FF',
                      color: '#fff',
                    },
                    '&[data-selected]': {
                      backgroundColor: 'rgba(0, 148, 255, 0.1)',
                      color: '#0094FF',
                    },
                  },
                }}
              />

              {selectedBerth && (
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    marginTop: 24,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <Box
                      style={{
                        minWidth: 0,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                      }}
                    >
                      <KeyValuePair
                        keyName="Berth Name"
                        value={
                          ['b1', 'b2', 'b3'].includes(selectedBerth)
                            ? ['BERTH NO. B1', 'BERTH NO. B2', 'BERTH NO. B3'][
                                ['b1', 'b2', 'b3'].indexOf(selectedBerth)
                              ]
                            : 'BERTH NO. B1'
                        }
                      />
                    </Box>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        minWidth: 0,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                      }}
                    >
                      <Box style={{ minWidth: 0, overflow: 'hidden' }}>
                        <KeyValuePair keyName="Berth Code" value="SGSIN0101B" />
                      </Box>
                      <Copy02
                        style={{
                          color: '#fff',
                          width: 16,
                          height: 16,
                          cursor: 'pointer',
                          marginTop: 14,
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                    <Box
                      style={{
                        minWidth: 0,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                      }}
                    >
                      <KeyValuePair keyName="Transactions" value="Container" />
                    </Box>
                    <Box style={{ minWidth: 0, flex: '0 0 auto' }}>
                      <KeyValuePair keyName="Status" value="Active" />
                    </Box>
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <Box
                      style={{
                        minWidth: 0,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                      }}
                    >
                      <KeyValuePair
                        keyName="Associated Terminal"
                        value="BRANI TERMINAL"
                      />
                    </Box>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        minWidth: 0,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                      }}
                    >
                      <Box style={{ minWidth: 0, overflow: 'hidden' }}>
                        <KeyValuePair
                          keyName="Terminal Code"
                          value="SGSIN0001TD"
                        />
                      </Box>
                      <Copy02
                        style={{
                          color: '#fff',
                          width: 16,
                          height: 16,
                          cursor: 'pointer',
                          marginTop: 14,
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                    <Box
                      style={{
                        minWidth: 0,
                        flex: '1 1 auto',
                        overflow: 'hidden',
                      }}
                    >
                      <KeyValuePair keyName="Terminal Subtype" value="Dry" />
                    </Box>
                    <Box style={{ minWidth: 0, flex: '0 0 auto' }}>
                      <KeyValuePair keyName="Status" value="Active" />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {(activePortLevel === 'Port Details' ||
            (activePortLevel === 'Terminal Details' && selectedTerminal) ||
            (activePortLevel === 'Berth Details' && selectedBerth)) && (
            <>
              <Box
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #393C56',
                  marginLeft: -20,
                  marginRight: -20,
                  paddingLeft: 4,
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {portTabOverflowLeft && (
                  <Box
                    onClick={() =>
                      portTabScrollRef.current?.scrollBy({
                        left: -150,
                        behavior: 'smooth',
                      })
                    }
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(to right, #181926 50%, rgba(24, 25, 38, 0))',
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  >
                    <ChevronRight
                      style={{
                        color: '#898f9d',
                        width: 16,
                        height: 16,
                        transform: 'rotate(180deg)',
                      }}
                    />
                  </Box>
                )}
                {portTabOverflowRight && (
                  <Box
                    onClick={() =>
                      portTabScrollRef.current?.scrollBy({
                        left: 150,
                        behavior: 'smooth',
                      })
                    }
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(to left, #181926 50%, rgba(24, 25, 38, 0))',
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  >
                    <ChevronRight
                      style={{ color: '#898f9d', width: 16, height: 16 }}
                    />
                  </Box>
                )}
                <Box
                  ref={portTabScrollRef}
                  className="tab-scroll"
                  style={{
                    display: 'flex',
                    flex: 1,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {(activePortLevel === 'Terminal Details'
                    ? ['Ship Handles', 'Cargo Handles', 'Services']
                    : activePortLevel === 'Berth Details'
                      ? [
                          'Ship Handles',
                          'Cargo Handles',
                          'Services',
                          'Specifications',
                        ]
                      : [
                          'Ships In Port',
                          'Expected Arrivals',
                          'Ship Handles',
                          'Cargo Handles',
                          'Services',
                          'Notes',
                        ]
                  ).map((tab) => (
                    <Box
                      key={tab}
                      onClick={() => setActivePortTab(tab)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom:
                          activePortTab === tab
                            ? '2px solid #fff'
                            : '2px solid transparent',
                        color: activePortTab === tab ? '#fff' : '#888F9E',
                        fontWeight: activePortTab === tab ? 600 : 400,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab}
                    </Box>
                  ))}
                </Box>
              </Box>

              {activePortTab === 'Ships In Port' && (
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  <Box
                    style={{
                      height: 36,
                      margin: '16px 20px 8px 20px',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#0C0D14',
                      border: '1px solid #393C56',
                      borderRadius: 4,
                    }}
                  >
                    <SearchMd size={16} color="#FFFFFF" style={{ flexShrink: 0 }} />
                    <Box
                      component="input"
                      type="search"
                      value={shipsInPortSearch}
                      onChange={(event) =>
                        setShipsInPortSearch(event.currentTarget.value)
                      }
                      placeholder="Search by ship name, flag, IMO, MMSI or ship type"
                      aria-label="Search ships in port"
                      style={{
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        color: '#FFFFFF',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: 12,
                      }}
                    />
                  </Box>
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'minmax(0, 1.5fr) 40px minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr)',
                      columnGap: 10,
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: '#24263C',
                      borderRadius: '4px',
                      margin: '0 20px 8px 20px',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {[
                      ['name', 'Name'],
                      ['flag', 'Ctry'],
                      ['type', 'Type'],
                      ['imo', 'IMO'],
                      ['mmsi', 'MMSI'],
                      ['reportedAt', 'Reported Time'],
                    ].map(([key, label]) => (
                      <SortablePortTableHeader
                        key={key}
                        label={label}
                        columnKey={key}
                        sort={shipsInPortSort}
                        onSort={(columnKey) =>
                          setShipsInPortSort((current) =>
                            cycleTableSort(current, columnKey)
                          )
                        }
                      />
                    ))}
                  </Box>

                  {sortedShipsInPortRows.length === 0 && (
                    <Text
                      style={{
                        color: '#888F9E',
                        fontSize: 13,
                        margin: '16px 20px',
                      }}
                    >
                      No ships match your search.
                    </Text>
                  )}
                  {sortedShipsInPortRows.map((ship) => {
                      return (
                        <Box
                          key={ship.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              'minmax(0, 1.5fr) 40px minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr)',
                            columnGap: 10,
                            alignItems: 'center',
                            padding: '8px 10px',
                            margin: '0 20px',
                            borderBottom: '1px solid #393C56',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#24263C'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ship.name}
                          </Text>
                          <Text style={{ fontSize: 14 }}>{ship.flag}</Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ship.type}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ship.imo}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ship.mmsi}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ship.reportedAt.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                              timeZone: 'UTC',
                            })}{' '}
                            UTC
                          </Text>
                        </Box>
                      )
                    })}
                </Box>
              )}

              {activePortTab === 'Expected Arrivals' && (
                <Box
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  {Number.parseInt(pathToPortVersion.slice(1), 10) < 6 &&
                    !arrivalsIntroDismissed && (
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          margin: '16px 20px 0 20px',
                          padding: '8px 10px',
                          background: '#24263C',
                          border: '1px solid #393C56',
                          borderRadius: 4,
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
                          <Anchor size={20} color="#FFFFFF" />
                        </Box>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            lineHeight: '16px',
                            fontWeight: 500,
                            textAlign: 'left',
                          }}
                        >
                          Select a vessel in the table below to jump to its
                          current position and preview the predicted path to
                          port.
                        </Text>
                        <Box
                          component="button"
                          type="button"
                          aria-label="Dismiss"
                          onClick={() => setArrivalsIntroDismissed(true)}
                          style={{
                            marginLeft: 'auto',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <XClose size={16} color="#888F9E" />
                        </Box>
                      </Box>
                    )}

                  {pathToPortVersion === 'v2' && activePathToPort && (
                    <Box
                      style={{
                        margin: '8px 20px 4px 20px',
                        padding: 16,
                        background: '#24263C',
                        border: '1px solid #393C56',
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 15,
                          fontWeight: 600,
                          marginBottom: 16,
                        }}
                      >
                        Path to {activePathToPort.portName} —{' '}
                        {activePathToPort.shipName}
                      </Text>
                      {renderPathToPortReadout(activePathToPort)}
                    </Box>
                  )}

                  <Box
                    style={{
                      height: 36,
                      margin: '12px 20px 8px 20px',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#0C0D14',
                      border: '1px solid #393C56',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    <SearchMd
                      size={16}
                      color="#FFFFFF"
                      style={{ flexShrink: 0 }}
                    />
                    <Box
                      component="input"
                      type="search"
                      value={expectedArrivalsSearch}
                      onChange={(event) =>
                        setExpectedArrivalsSearch(event.currentTarget.value)
                      }
                      placeholder="Search by ship name, flag, IMO or ship type"
                      aria-label="Search expected arrivals"
                      style={{
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        color: '#FFFFFF',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: 12,
                      }}
                    />
                  </Box>

                  {/* Table header stays fixed with the intro/card above it. */}
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'minmax(0, 1.3fr) 24px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.7fr) minmax(0, 0.8fr) 44px',
                      columnGap: 10,
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: '#24263C',
                      borderRadius: '4px',
                      margin: '0 20px 8px 20px',
                      flexShrink: 0,
                    }}
                  >
                    {[
                      ['name', 'Name'],
                      ['flag', 'Ctry'],
                      ['type', 'Type'],
                      ['imo', 'IMO'],
                      ['eta', 'ETA'],
                      ['distance', 'Dist'],
                    ].map(([key, label]) => (
                      <SortablePortTableHeader
                        key={key}
                        label={label}
                        columnKey={key}
                        sort={expectedArrivalsSort}
                        onSort={(columnKey) =>
                          setExpectedArrivalsSort((current) =>
                            cycleTableSort(current, columnKey)
                          )
                        }
                      />
                    ))}
                    <Box />
                  </Box>

                  {/* Only the rows scroll. */}
                  <Box
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: 'auto',
                    }}
                  >
                  {expectedArrivalsData.rows.length === 0 && (
                    <Text
                      style={{
                        color: '#888F9E',
                        fontSize: 13,
                        margin: '16px 20px',
                      }}
                    >
                      No expected arrivals for this port.
                    </Text>
                  )}
                  {expectedArrivalsData.rows.length > 0 &&
                    sortedExpectedArrivalRows.length === 0 && (
                      <Text
                        style={{
                          color: '#888F9E',
                          fontSize: 13,
                          margin: '16px 20px',
                        }}
                      >
                        No expected arrivals match your search.
                      </Text>
                    )}

                  {sortedExpectedArrivalRows.map((row) => {
                    const isActiveRoute =
                      pathToPortRoute?.shipId === row.shipId
                    const usesInlineArrivals =
                      pathToPortVersion === 'v3' ||
                      pathToPortVersion === 'v6'
                    const isExpanded =
                      usesInlineArrivals && expandedArrivalIds.has(row.id)
                    // v3/v6 highlight every expanded row (multiple can be open);
                    // other versions highlight the single active route.
                    const isRowActive =
                      usesInlineArrivals ? isExpanded : isActiveRoute
                    const etaShort = row.etaDate
                      ? row.etaDate.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZone: 'UTC',
                        })
                      : '—'
                    return (
                      <Box key={row.id}>
                        <Box
                          onClick={() => {
                            // Every version stays on the port detail panel:
                            // clicking an arrival draws the route + frames the map
                            // without switching to the vessel tab.
                            if (usesInlineArrivals) {
                              // Inline version toggles the in-row readout; more
                              // than one card can be open at once, and each open
                              // card draws its own route on the map.
                              if (pathToPortVersion === 'v6') {
                                setArrivalsOverlayOn(false)
                              }
                              const willExpand = !expandedArrivalIds.has(row.id)
                              setExpandedArrivalIds((prev) => {
                                const next = new Set(prev)
                                if (next.has(row.id)) next.delete(row.id)
                                else next.add(row.id)
                                return next
                              })
                              const descriptor = {
                                shipId: row.shipId,
                                detectionId: row.detectionId ?? null,
                                portId: activeTab?.id,
                                portName: activeTab?.name || null,
                              }
                              setPathToPortRoutes((prev) => {
                                const others = prev.filter(
                                  (r) => r.shipId !== row.shipId
                                )
                                return willExpand
                                  ? [...others, descriptor]
                                  : others
                              })
                              // Keep the single route in sync (last expanded) so
                              // framing / any single-route consumers still work.
                              if (willExpand) {
                                setPathToPortRoute(descriptor)
                              } else if (pathToPortRoute?.shipId === row.shipId) {
                                setPathToPortRoute(null)
                              }
                            } else if (isActiveRoute) {
                              // v1/v2/v4 show the readout in the floating map panel.
                              // Clicking the active row again clears it.
                              clearPathToPort()
                            } else {
                              // In v4/v5, focusing a single vessel turns off the
                              // "show all arrivals" overlay so the two stay
                              // mutually exclusive (and can each be re-entered).
                              if (
                                pathToPortVersion === 'v4' ||
                                pathToPortVersion === 'v5'
                              ) {
                                setArrivalsOverlayOn(false)
                              }
                              setPathToPortRoute({
                                shipId: row.shipId,
                                detectionId: row.detectionId ?? null,
                                portId: activeTab?.id,
                                portName: activeTab?.name || null,
                              })
                            }
                          }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              'minmax(0, 1.3fr) 24px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.7fr) minmax(0, 0.8fr) 44px',
                            columnGap: 10,
                            alignItems: 'center',
                            padding: '8px 10px',
                            // When active, pull up 1px so the solid highlight
                            // covers the previous row's bottom border (no line
                            // showing across the top of the active row).
                            margin: isRowActive
                              ? '-1px 20px 0 20px'
                              : '0 20px',
                            position: isRowActive ? 'relative' : 'static',
                            borderBottom: isRowActive
                              ? 'none'
                              : '1px solid #393C56',
                            cursor: 'pointer',
                            background: isRowActive
                              ? '#002B56'
                              : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isRowActive)
                              e.currentTarget.style.background = '#24263C'
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowActive)
                              e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.name}
                          </Text>
                          <Text style={{ fontSize: 14 }}>{row.flag}</Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.type}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.imo}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {etaShort}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {formatDistanceNm(row.distanceNm)}
                          </Text>
                          {usesInlineArrivals ? (
                            <Box
                              style={{
                                justifySelf: 'end',
                                width: 26,
                                height: 26,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4,
                                border: `1px solid ${
                                  isExpanded ? '#0094ff' : '#393C56'
                                }`,
                                background: isExpanded
                                  ? 'rgba(0, 148, 255, 0.12)'
                                  : '#24263C',
                              }}
                            >
                              {isExpanded ? (
                                <XClose size={14} color="#fff" />
                              ) : (
                                <List
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color: '#fff',
                                  }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Text
                              style={{
                                color: isActiveRoute ? '#fff' : '#0094ff',
                                fontSize: 12,
                                fontWeight: 600,
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              View
                            </Text>
                          )}
                        </Box>
                        {isExpanded && (
                          <Box
                            style={{
                              position: 'relative',
                              margin: '10px 20px 14px 20px',
                              padding: 14,
                              background: '#24263C',
                              border: '1px solid #393C56',
                              borderRadius: 4,
                            }}
                          >
                            {/* Caret pointing up to the row's toggle button. */}
                            <Box
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: 12,
                                width: 10,
                                height: 10,
                                background: '#24263C',
                                borderLeft: '1px solid #393C56',
                                borderTop: '1px solid #393C56',
                                transform: 'rotate(45deg)',
                              }}
                            />
                            {renderPathToPortReadout({
                              shipId: row.shipId,
                              distanceNm: row.distanceNm,
                              etaDate: row.etaDate,
                              etaHours: row.etaHours,
                            })}
                          </Box>
                        )}
                      </Box>
                    )
                  })}
                  </Box>
                </Box>
              )}

              {activePortTab === 'Ship Handles' && (
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  <Accordion
                    variant="default"
                    defaultValue="Container"
                    styles={{
                      root: {
                        border: '1px solid #393C56',
                        borderRadius: 4,
                        overflow: 'hidden',
                      },
                      item: {
                        backgroundColor: '#24263C',
                        border: 'none',
                        borderBottom: '1px solid #393C56',
                        '&:last-of-type': {
                          borderBottom: 'none',
                        },
                        '&[data-active]': {
                          backgroundColor: '#24263C',
                        },
                      },
                      control: {
                        padding: '8px 16px',
                        minHeight: 'unset',
                        backgroundColor: '#24263C',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        },
                      },
                      label: {
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 400,
                        padding: 0,
                      },
                      chevron: {
                        color: '#fff',
                      },
                      panel: {
                        backgroundColor: '#181926',
                        borderTop: '1px solid #393C56',
                      },
                      content: {
                        padding: '0 16px 16px 16px',
                      },
                    }}
                  >
                    <Accordion.Item value="Container">
                      <Accordion.Control>Container</Accordion.Control>
                      <Accordion.Panel>
                        <Box style={{ paddingTop: 16 }}>
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: 16,
                              marginBottom: 16,
                            }}
                          >
                            <KeyValuePair
                              keyName="Maximum Vessel"
                              value="450.00"
                            />
                            <KeyValuePair
                              keyName="Maximum Draft"
                              value="16.40"
                            />
                            <KeyValuePair
                              keyName="Maximum Air Draft"
                              value="1.00"
                            />
                          </Box>
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: 16,
                              marginBottom: 16,
                            }}
                          >
                            <KeyValuePair
                              keyName="Maximum Beam"
                              value="32.00"
                            />
                            <KeyValuePair keyName="Maximum UKC" value="0.50" />
                            <KeyValuePair
                              keyName="Minimum Dead Weight"
                              value="16.40"
                            />
                          </Box>
                          <Box>
                            <KeyValuePair
                              keyName="Ship Size"
                              value="Feeder, Freedemax, Panamax, Post-Panamax"
                            />
                          </Box>
                        </Box>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Bulk Carrier">
                      <Accordion.Control>Bulk Carrier</Accordion.Control>
                      <Accordion.Panel>
                        <Box style={{ paddingTop: 16 }}>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            Data not available
                          </Text>
                        </Box>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Gas Carrier">
                      <Accordion.Control>Gas Carrier</Accordion.Control>
                      <Accordion.Panel>
                        <Box style={{ paddingTop: 16 }}>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            Data not available
                          </Text>
                        </Box>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Passenger">
                      <Accordion.Control>Passenger</Accordion.Control>
                      <Accordion.Panel>
                        <Box style={{ paddingTop: 16 }}>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            Data not available
                          </Text>
                        </Box>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Tanker">
                      <Accordion.Control>Tanker</Accordion.Control>
                      <Accordion.Panel>
                        <Box style={{ paddingTop: 16 }}>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            Data not available
                          </Text>
                        </Box>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Box>
              )}

              {activePortTab === 'Cargo Handles' && (
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  <Accordion
                    variant="default"
                    defaultValue="Chemicals"
                    styles={{
                      root: {
                        border: '1px solid #393C56',
                        borderRadius: 4,
                        overflow: 'hidden',
                      },
                      item: {
                        backgroundColor: '#24263C',
                        border: 'none',
                        borderBottom: '1px solid #393C56',
                        '&:last-of-type': {
                          borderBottom: 'none',
                        },
                        '&[data-active]': {
                          backgroundColor: '#24263C',
                        },
                      },
                      control: {
                        padding: '8px 16px',
                        minHeight: 'unset',
                        backgroundColor: '#24263C',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        },
                      },
                      label: {
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 400,
                        padding: 0,
                      },
                      chevron: {
                        color: '#fff',
                      },
                      panel: {
                        backgroundColor: '#181926',
                        borderTop: '1px solid #393C56',
                      },
                      content: {
                        padding: '16px',
                      },
                    }}
                  >
                    <Accordion.Item value="Chemicals">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Chemicals
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (8 products)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          Acetone, Benzene, Caustic Soda, Ethanol, Methanol,
                          Styrene Monomer, Toluene, Xylene
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Black Products">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Black Products
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (3 products)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Bulk Other">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Bulk Other
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (1 product)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Passenger">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Passenger
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (2 products)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Tanker">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Tanker
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (4 products)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Box>
              )}

              {activePortTab === 'Services' && (
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  <Accordion
                    variant="default"
                    defaultValue="Port Service"
                    styles={{
                      root: {
                        border: '1px solid #393C56',
                        borderRadius: 4,
                        overflow: 'hidden',
                      },
                      item: {
                        backgroundColor: '#24263C',
                        border: 'none',
                        borderBottom: '1px solid #393C56',
                        '&:last-of-type': {
                          borderBottom: 'none',
                        },
                        '&[data-active]': {
                          backgroundColor: '#24263C',
                        },
                      },
                      control: {
                        padding: '8px 16px',
                        minHeight: 'unset',
                        backgroundColor: '#24263C',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        },
                      },
                      label: {
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 400,
                        padding: 0,
                      },
                      chevron: {
                        color: '#fff',
                      },
                      panel: {
                        backgroundColor: '#181926',
                        borderTop: '1px solid #393C56',
                      },
                      content: {
                        padding: '16px',
                      },
                    }}
                  >
                    <Accordion.Item value="Port Service">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Port Service
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (9 services)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          Bunker, Fresh Water, Launch, Marpol Reception,
                          Nitrogen Supply, Slop Disposal, Dirty Ballast
                          Disposal, Garbage Disposal, LNG Bunker
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Service Availability">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Service Availability
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (5 services)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Bunker Fuels">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Bunker Fuels
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (4 services)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Restrictions">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Restrictions
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (9 services)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Facilities">
                      <Accordion.Control>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            Facilities
                          </Text>
                          <Text style={{ color: '#888F9E', fontSize: 14 }}>
                            (9 services)
                          </Text>
                        </Box>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Box>
              )}

              {activePortTab === 'Specifications' && (
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  <Box
                    style={{
                      background: '#1F2134',
                      border: '1px solid #393C56',
                      borderRadius: 4,
                      padding: 20,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 24,
                    }}
                  >
                    <KeyValuePair keyName="Length of Berth" value="201.00" />
                    <KeyValuePair keyName="Berth Flat Side" value="No info" />
                    <KeyValuePair keyName="Depth Alongside" value="4.65" />

                    <KeyValuePair keyName="Max Length Overall" value="200.50" />
                    <KeyValuePair keyName="Max Draft Alongside" value="4.15" />
                    <KeyValuePair keyName="Min Alongside UKC" value="0.47" />

                    <KeyValuePair keyName="Max Beam Width" value="0.00" />
                    <KeyValuePair
                      keyName="Maximum Airdraft Alongside"
                      value="0.00"
                    />
                    <KeyValuePair
                      keyName="Min PMB Forward of Ship Manifold"
                      value="No info"
                    />

                    <KeyValuePair keyName="Min PMB" value="No info" />
                    <KeyValuePair
                      keyName="Min PMB Aft of Ship Manifold"
                      value="No info"
                    />
                    <KeyValuePair keyName="Max Freeboard" value="No info" />
                  </Box>
                </Box>
              )}

              {activePortTab === 'Notes' && (
                <Box
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    marginLeft: -20,
                    marginRight: -20,
                  }}
                >
                  <Accordion
                    variant="default"
                    defaultValue="General"
                    styles={{
                      root: {
                        border: '1px solid #393C56',
                        borderRadius: 4,
                        overflow: 'hidden',
                      },
                      item: {
                        backgroundColor: '#24263C',
                        border: 'none',
                        borderBottom: '1px solid #393C56',
                        '&:last-of-type': {
                          borderBottom: 'none',
                        },
                        '&[data-active]': {
                          backgroundColor: '#24263C',
                        },
                      },
                      control: {
                        padding: '8px 16px',
                        minHeight: 'unset',
                        backgroundColor: '#24263C',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        },
                      },
                      label: {
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 400,
                        padding: 0,
                      },
                      chevron: {
                        color: '#fff',
                      },
                      panel: {
                        backgroundColor: '#181926',
                        borderTop: '1px solid #393C56',
                      },
                      content: {
                        padding: '16px',
                      },
                    }}
                  >
                    <Accordion.Item value="General">
                      <Accordion.Control>
                        <Text style={{ color: '#fff', fontSize: 14 }}>
                          General
                        </Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          Port Control Depth, Port Maximum Draft and Port
                          Maximum Airdraft were varies depending on the location
                          and berths. UKC refers to the underkeel clearance.
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Operations">
                      <Accordion.Control>
                        <Text style={{ color: '#fff', fontSize: 14 }}>
                          Operations
                        </Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="Shipping">
                      <Accordion.Control>
                        <Text style={{ color: '#fff', fontSize: 14 }}>
                          Shipping
                        </Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text style={{ color: '#888F9E', fontSize: 14 }}>
                          Data not available
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
      <Modal
        opened={showCloseAllConfirmModal}
        onClose={() => setShowCloseAllConfirmModal(false)}
        withCloseButton={false}
        centered
        size="460px"
        radius={8}
        overlayProps={{ backgroundOpacity: 0.65, blur: 1 }}
        styles={{
          content: {
            background: '#24263C',
            border: '1px solid #393C56',
          },
          body: {
            padding: 24,
          },
        }}
      >
        <Box style={{ padding: '2px 4px' }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Close all tabs?
          </Text>
          <Text
            style={{
              color: '#8D93A8',
              fontSize: 14,
              lineHeight: 1.45,
              marginBottom: 22,
            }}
          >
            This will close every open ship tab and all ship-specific tools
            opened from those tabs (for example, Extended path and Estimated
            Location panels).
          </Text>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Button
              onMouseEnter={() => setCloseAllCancelHovered(true)}
              onMouseLeave={() => setCloseAllCancelHovered(false)}
              onClick={() => setShowCloseAllConfirmModal(false)}
              style={{
                background: closeAllCancelHovered
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                fontSize: 14,
                minWidth: 88,
              }}
            >
              Cancel
            </Button>
            <Button
              onMouseEnter={() => setCloseAllConfirmHovered(true)}
              onMouseLeave={() => setCloseAllConfirmHovered(false)}
              onClick={() => {
                closeAllTabs()
                setShowCloseAllConfirmModal(false)
              }}
              style={{
                background: closeAllConfirmHovered ? '#C53E36' : '#F75349',
                color: '#fff',
                borderColor: closeAllConfirmHovered ? '#C53E36' : '#F75349',
                minWidth: 96,
              }}
            >
              Close All
            </Button>
          </Box>
        </Box>
      </Modal>
      {(shipDetailsVersion === 'v4' ||
        shipDetailsVersion === 'v5' ||
        shipDetailsVersion === 'v6' ||
        shipDetailsVersion === 'v10') &&
        eventToolsPoppedOut &&
        activeShip &&
        typeof document !== 'undefined' &&
        createPortal(
          <Box
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              position: 'fixed',
              top: eventToolsPanelPosition.y,
              left: eventToolsPanelPosition.x,
              width: 500,
              maxHeight: 'calc(100vh - 24px)',
              zIndex: 1200,
              background: '#181926',
              border: '1px solid #393C56',
              borderRadius: 4,
              overflowY: shipDetailsVersion === 'v10' ? 'auto' : 'hidden',
              overflowX: 'hidden',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.38)',
            }}
          >
            <Box
              onMouseDown={(event) => {
                if (event.button !== 0) return
                setEventToolsDragOffset({
                  x: event.clientX - eventToolsPanelPosition.x,
                  y: event.clientY - eventToolsPanelPosition.y,
                })
              }}
              style={{
                height: 64,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#24263C',
                cursor: eventToolsDragOffset ? 'grabbing' : 'grab',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>
                Selected Event Tools
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {shipDetailsVersion !== 'v10' && (
                  <Tooltip
                    label="Dock Selected Event Tools back into timeline"
                    withArrow
                    color="#0D0F17"
                    zIndex={2000}
                    styles={{ tooltip: { fontSize: 12 } }}
                  >
                    <Box
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={() => {
                        setEventToolsPoppedOut(false)
                        setEventToolsMinimized(false)
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {shipDetailsVersion === 'v4' ? (
                        <EventToolsIcon />
                      ) : (
                        <Browser style={{ width: 20, height: 20 }} />
                      )}
                    </Box>
                  </Tooltip>
                )}
                <Minus
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={() => setEventToolsMinimized((current) => !current)}
                  style={{
                    width: 20,
                    height: 20,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                />
                <XClose
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    setEventToolsPoppedOut(false)
                    setEventToolsMinimized(false)
                    if (shipDetailsVersion === 'v10') {
                      setV10OpenToolIds([])
                      setIsTopSummaryCollapsed(false)
                      setTopSectionHeight(null)
                    }
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                />
              </Box>
            </Box>
            {!eventToolsMinimized && (
              <Box
                style={{
                  padding: 20,
                  maxHeight:
                    shipDetailsVersion === 'v10'
                      ? undefined
                      : 'calc(100vh - 88px)',
                  overflowY: 'auto',
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <Box>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}
                      >
                        {activeShip.name}
                      </Text>
                      {activeShip.flag && (
                        <Text style={{ fontSize: 16 }}>{activeShip.flag}</Text>
                      )}
                    </Box>
                    <Box
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {shouldShowLastKnownLocationButton && (
                        <Box
                          onClick={handleShowLastKnownLocation}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            color: '#0094FF',
                            cursor: 'pointer',
                          }}
                        >
                          <MarkerPin01 style={{ width: 14, height: 14 }} />
                          <Text style={{ color: 'inherit', fontSize: 12 }}>
                            Show last known location
                          </Text>
                        </Box>
                      )}
                      {showSanctionedTitle && (
                        <>
                          <Box
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#008B6D',
                            }}
                          />
                          <Box
                            style={{
                              width: 1,
                              height: 12,
                              background: '#393C56',
                            }}
                          />
                          <img
                            src={sanctionedTitle}
                            alt="Sanctioned"
                            style={{ height: 12, width: 'auto' }}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                  <Star01
                    onClick={() => {
                      if (activeShip?.id) toggleFavoriteShip(activeShip.id)
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      color: isActiveShipFavorite ? '#F7C948' : '#fff',
                      fill: isActiveShipFavorite ? '#F7C948' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1.7fr',
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <KeyValuePair
                    keyName="IMO"
                    value={activeShip.imo || 'No info'}
                  />
                  <KeyValuePair
                    keyName="MMSI"
                    value={activeShip.mmsi || 'No info'}
                  />
                  <KeyValuePair
                    keyName="SynMax Ship ID"
                    value={activeShip.shipId || 'No info'}
                  />
                </Box>
                {!isUnattributed && (
                  <ShipDetailsPanel
                    version={shipDetailsVersion}
                    compactHeader
                    selectedEvent={selectedDetection}
                    isLatest={isLatest}
                    eventLabel={eventLabel[selectedDetection?.type] || ''}
                    eventIconOverride={selectedStsIcon}
                    flashEnabled={flashEnabled}
                    onToolsVisibleChange={setDetailToolsVisible}
                    onToolAction={handleShipToolAction}
                    activeToolIds={
                      shipDetailsVersion === 'v10'
                        ? v10OpenToolIds
                        : activeMapToolPanels
                    }
                  />
                )}
              </Box>
            )}
            {shipDetailsVersion === 'v10' &&
              v10OpenToolIds.map((toolId) => {
                const title =
                  {
                    'extended-path': 'Extended Path',
                    'future-path-prediction': 'Future Path Prediction',
                    'estimated-location': 'Estimated Location',
                  }[toolId] || 'Tool'
                const collapsed = v10CollapsedToolIds.includes(toolId)
                return (
                  <Box
                    key={toolId}
                    style={{ borderTop: '1px solid #393C56' }}
                  >
                    <Box
                      onClick={() =>
                        setV10CollapsedToolIds((current) =>
                          collapsed
                            ? current.filter((id) => id !== toolId)
                            : [...current, toolId]
                        )
                      }
                      style={{
                        minHeight: 56,
                        padding: '0 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: collapsed ? '#24263C' : '#2D3048',
                        cursor: 'pointer',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: collapsed ? 500 : 600,
                        }}
                      >
                        {title}
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                        }}
                      >
                        {collapsed ? (
                          <ChevronRight
                            style={{ width: 20, height: 20, color: '#fff' }}
                          />
                        ) : (
                          <ChevronDown
                            style={{ width: 20, height: 20, color: '#fff' }}
                          />
                        )}
                        <XClose
                          onClick={(event) => {
                            event.stopPropagation()
                            setV10OpenToolIds((current) =>
                              current.filter((id) => id !== toolId)
                            )
                          }}
                          style={{
                            width: 20,
                            height: 20,
                            color: '#fff',
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                    {!collapsed && (
                      <Box>
                        {toolId === 'extended-path' && (
                          <ExtendedPathPanel ship={activeShip} />
                        )}
                        {toolId === 'future-path-prediction' && (
                          <FuturePathPanel ship={activeShip} />
                        )}
                        {toolId === 'estimated-location' && (
                          <EstimatedLocationPanel />
                        )}
                      </Box>
                    )}
                  </Box>
                )
              })}
          </Box>,
          document.body
        )}
      <Modal
        opened={showGoToDateModal && Boolean(pendingGoToDate)}
        onClose={() => {
          if (goToDateSubmitting) return
          closeGoToDateModal()
        }}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        size="550px"
        radius={8}
        transitionProps={{
          transition: 'fade',
          duration: GO_TO_DATE_MODAL_TRANSITION_MS,
          timingFunction: 'ease',
        }}
        overlayProps={{ backgroundOpacity: 0.65, blur: 1 }}
        styles={{
          content: {
            background: '#24263C',
            border: '1px solid #393C56',
            maxWidth: 680,
          },
          body: {
            padding: 28,
          },
        }}
      >
        {pendingGoToDate && (
          <Box style={{ padding: '4px 6px' }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Warning
            </Text>
            <Text
              style={{
                color: '#8D93A8',
                fontSize: 14,
                lineHeight: 1.45,
                marginBottom: 20,
                maxWidth: 560,
              }}
            >
              This will update the map and ship positions to{' '}
              <Text span style={{ color: '#fff', fontWeight: 700 }}>
                {pendingGoToDate.dateLabel}.
              </Text>{' '}
              You can return to today&apos;s view using the calendar in the
              header.
            </Text>
            <Box style={{ marginTop: 8, marginBottom: 24 }}>
              <Checkbox
                size="sm"
                className="go-to-date-warning-checkbox"
                color="#0094FF"
                checked={dontShowGoToDateAgain}
                disabled={goToDateSubmitting}
                onChange={(e) =>
                  setDontShowGoToDateAgain(e.currentTarget.checked)
                }
                label="Don't show this again"
                styles={{
                  label: { color: '#8D93A8', fontSize: 14 },
                  input: {
                    background: 'transparent',
                    borderColor: '#5C6270',
                    '&:checked, &[data-checked]': {
                      backgroundColor: '#0094FF',
                      borderColor: '#0094FF',
                      color: '#fff',
                    },
                  },
                  icon: { color: '#fff !important' },
                }}
              />
            </Box>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Button
                disabled={goToDateSubmitting}
                onMouseEnter={() => setGoToDateCancelHovered(true)}
                onMouseLeave={() => setGoToDateCancelHovered(false)}
                onClick={() => {
                  if (goToDateSubmitting) return
                  closeGoToDateModal()
                }}
                style={{
                  background: goToDateCancelHovered
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'transparent',
                  border: '1px solid #fff',
                  color: '#fff',
                  fontSize: 14,
                  minWidth: 88,
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={goToDateSubmitting}
                loading={goToDateSubmitting}
                onMouseEnter={() => setGoToDateConfirmHovered(true)}
                onMouseLeave={() => setGoToDateConfirmHovered(false)}
                onClick={() => {
                  if (goToDateSubmitting || !pendingGoToDate) return
                  if (dontShowGoToDateAgain) {
                    setSkipGoToDateWarning(true)
                    try {
                      window.localStorage.setItem(
                        GO_TO_DATE_WARNING_PREF_KEY,
                        'true'
                      )
                    } catch {
                      // Ignore storage issues; behavior still applies this session.
                    }
                  }
                  const nextGoToDate = pendingGoToDate
                  setGoToDateSubmitting(true)
                  goToDateTimerRef.current = window.setTimeout(() => {
                    // Update behind the modal first, then fade modal away,
                    // so the new state appears smoothly without a visible flicker.
                    applyGoToDate(
                      nextGoToDate.dateKey,
                      nextGoToDate.detectionId
                    )
                    closeGoToDateModal()
                    goToDateTimerRef.current = null
                  }, GO_TO_DATE_CONFIRM_DELAY_MS)
                }}
                style={{
                  background: goToDateSubmitting
                    ? '#5C6270'
                    : goToDateConfirmHovered
                      ? '#007DD6'
                      : '#0094FF',
                  color: goToDateSubmitting ? '#D7DAE2' : '#fff',
                  borderColor: goToDateSubmitting
                    ? '#5C6270'
                    : goToDateConfirmHovered
                      ? '#007DD6'
                      : '#0094FF',
                  cursor: goToDateSubmitting ? 'not-allowed' : 'pointer',
                  minWidth: 88,
                }}
              >
                Yes
              </Button>
            </Box>
          </Box>
        )}
      </Modal>
      <Modal
        opened={
          isStsShipTab &&
          (stsVersionRaw === 'v20' || stsVersionRaw === 'v21') &&
          stsOverviewModalOpen
        }
        onClose={() => setStsOverviewModalOpen(false)}
        withCloseButton={false}
        centered
        size="560px"
        radius={8}
        overlayProps={{ backgroundOpacity: 0.65, blur: 1 }}
        styles={{
          content: {
            background: '#24263C',
            border: '1px solid #393C56',
          },
          body: { padding: 0 },
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 20px 12px 20px',
          }}
        >
          <Box>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
              Ship-to-Ship event
            </Text>
            <Text style={{ color: '#888F9E', fontSize: 12, marginTop: 2 }}>
              {`${stsEventShipIds.length} vessels`}
              {selectedDetection?.date ? ` · ${selectedDetection.date} UTC` : ''}
            </Text>
          </Box>
          <Box
            style={{ display: 'flex', alignItems: 'center', gap: 14 }}
          >
            {/* Match v17: segmentation focus toggle. Only shown for vessel
                counts we have traced hulls for (2–5) so the toggle is never a
                no-op. */}
            {[2, 3, 4, 5].includes(stsEventShipIds.length) && (
              <Box
                onClick={toggleStsSegment}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <Text
                  style={{
                    color: stsSegmentOn ? '#FFFFFF' : '#8D93A8',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    transition: 'color 0.15s ease',
                  }}
                >
                  Segment focus
                </Text>
                <Box
                  role="switch"
                  aria-checked={stsSegmentOn}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    padding: 2,
                    background: stsSegmentOn ? '#006CD7' : '#393C56',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    justifyContent: stsSegmentOn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                    }}
                  />
                </Box>
              </Box>
            )}
            <Box
              component="button"
              type="button"
              onClick={() => setStsOverviewModalOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <XClose style={{ width: 18, height: 18, color: '#888F9E' }} />
            </Box>
          </Box>
        </Box>
        <Box style={{ padding: '0 20px 20px 20px' }}>
          {renderStsHero(stsEventShipIds, {
            height: 300,
            marginBottom: 16,
            onPinClick: (idx) => {
              const sid = stsEventShipIds[idx]
              if (!sid) return
              openStsVesselTab(sid, activeTab)
              setStsOverviewModalOpen(false)
            },
          })}
          <Text
            style={{
              color: '#888F9E',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            Vessels in event
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stsEventShipIds.map((sid, idx) => {
              const s = ships[sid]
              if (!s) return null
              const active = activeShipTab === sid
              return (
                <Box
                  key={sid}
                  component="button"
                  type="button"
                  onClick={() => {
                    if (!active) openStsVesselTab(sid, activeTab)
                    setStsOverviewModalOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 4,
                    border: `1px solid ${active ? '#0094FF' : '#393C56'}`,
                    background: active ? 'rgba(0, 148, 255, 0.12)' : '#181926',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#24263C',
                      border: '1px solid #393C56',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Text
                    style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}
                  >
                    {s.name}
                  </Text>
                  {s.flag && <Text style={{ fontSize: 14 }}>{s.flag}</Text>}
                  <Box style={{ flex: 1 }} />
                  {active ? (
                    <Text
                      style={{ color: '#888F9E', fontSize: 12, fontWeight: 500 }}
                    >
                      Viewing
                    </Text>
                  ) : (
                    <Text
                      style={{ color: '#0094FF', fontSize: 12, fontWeight: 600 }}
                    >
                      View
                    </Text>
                  )}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default Myships
