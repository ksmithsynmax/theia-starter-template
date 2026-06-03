import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Loader, Text } from '@mantine/core'
import {
  Plus,
  Anchor,
  BezierCurve03,
  Bell02,
  List,
  Signal01,
  Star01,
  Upload01,
  Sliders04,
  SearchMd,
  SwitchVertical01,
  Trash01,
  XClose,
} from '@untitledui/icons'
import { useNavigate } from 'react-router-dom'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import ShipIcon from '../custom-icons/ShipIcon'
import CircleIcon from '../custom-icons/CircleIcon'
import PolygonIcon from '../custom-icons/PolygonIcon'
import RectangleIcon from '../custom-icons/RectangleIcon'
import AnchorIcon from '../custom-icons/AnchorIcon.svg'
import { ships } from '../data/mockData'
import { useShipContext } from '../context/ShipContext'

const SECONDARY_NAV_DEFAULT_WIDTH = 386
const SECONDARY_NAV_MIN_WIDTH = 360
const SECONDARY_NAV_MAX_WIDTH = 720

const TOP_LEVEL_TABS = [
  { id: 'my-watchlist', label: 'My Watchlist' },
  { id: 'recently-viewed', label: 'Recently Viewed' },
]

const WATCHLIST_SUB_TABS = [
  { id: 'all', label: 'All' },
  { id: 'ships', label: 'Ships' },
  { id: 'ports', label: 'Ports' },
  { id: 'polygons', label: 'Polygons' },
  { id: 'events', label: 'Events' },
]

const PROTOTYPE_PORT_ID_BY_NAME = {
  dubai: 'port-dubai',
  muscat: 'port-muscat',
  mumbai: 'port-mumbai',
  'bar harbor': 'port-bar-harbor',
}

const VERSION2_ADD_OPTIONS = [
  {
    id: 'ships',
    title: 'Ships',
    description: 'Track a vessel by IMO or MMSI',
  },
  {
    id: 'ports',
    title: 'Ports',
    description: 'Monitor a port by Locode',
  },
  {
    id: 'polygons',
    title: 'Polygon',
    description: 'Monitor a polygon by name or shape file',
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Get updates when key activity is detected',
  },
]

const watchedPorts = []

const watchedPolygons = [
  {
    id: 'poly-oman-corridor',
    name: 'Oman Corridor',
    polygonType: 'Route',
    region: 'Arabian Sea',
    rule: 'Entry/Exit',
    updatedAt: '2026-05-14 20:32',
  },
  {
    id: 'poly-rendezvous-west',
    name: 'Rendezvous West',
    polygonType: 'Zone',
    region: 'Gulf of Oman',
    rule: 'Loitering',
    updatedAt: '2026-05-14 17:05',
  },
]

const watchedEvents = [
  {
    id: 'event-spoofing-cluster',
    name: 'Spoofing Cluster',
    severity: 'High',
    relatedTo: '3 ships',
    lastSeen: '2026-05-15 10:20',
    source: 'AIS',
  },
  {
    id: 'event-dark-activity',
    name: 'Dark Activity Burst',
    severity: 'Medium',
    relatedTo: '2 ships',
    lastSeen: '2026-05-15 07:44',
    source: 'Imagery',
  },
]

const tableShellStyles = {
  width: '100%',
  borderRadius: '4px 4px 0 0',
  overflow: 'hidden',
  background: 'transparent',
}

const getColumnsByTab = (tabId) => {
  if (tabId === 'ships') {
    return [
      { key: 'name', label: 'Name', width: 'minmax(0, 1.3fr)' },
      { key: 'flag', label: 'Flag', width: '72px', align: 'left' },
      { key: 'type', label: 'Type', width: 'minmax(0, 1.1fr)' },
      { key: 'port', label: 'Port', width: 'minmax(0, 1fr)' },
      // { key: 'event', label: 'Event', width: 'minmax(0, 0.9fr)' },
    ]
  }

  if (tabId === 'ports') {
    return [
      { key: 'name', label: 'Port', width: 'minmax(0, 1.4fr)' },
      { key: 'country', label: 'Country', width: 'minmax(0, 0.9fr)' },
      { key: 'activity', label: 'Activity', width: 'minmax(0, 1fr)' },
      { key: 'risk', label: 'Risk', width: 'minmax(0, 0.8fr)' },
      { key: 'updatedAt', label: 'Updated', width: 'minmax(0, 0.9fr)' },
    ]
  }

  if (tabId === 'polygons') {
    return [
      { key: 'name', label: 'Polygon', width: 'minmax(0, 1.3fr)' },
      { key: 'polygonType', label: 'Type', width: 'minmax(0, 0.9fr)' },
      { key: 'region', label: 'Region', width: 'minmax(0, 1fr)' },
      { key: 'rule', label: 'Rule', width: 'minmax(0, 1fr)' },
      { key: 'updatedAt', label: 'Updated', width: 'minmax(0, 0.9fr)' },
    ]
  }

  if (tabId === 'events') {
    return [
      { key: 'name', label: 'Event', width: 'minmax(0, 1.2fr)' },
      { key: 'severity', label: 'Severity', width: 'minmax(0, 0.8fr)' },
      { key: 'relatedTo', label: 'Related To', width: 'minmax(0, 1fr)' },
      { key: 'lastSeen', label: 'Last Seen', width: 'minmax(0, 1fr)' },
      { key: 'source', label: 'Source', width: 'minmax(0, 0.8fr)' },
    ]
  }

  if (tabId === 'recently-viewed') {
    return [
      { key: 'entityType', label: 'Type', width: 'minmax(0, 0.8fr)' },
      { key: 'name', label: 'Name', width: 'minmax(0, 1.3fr)' },
      { key: 'details', label: 'Details', width: 'minmax(0, 1.2fr)' },
      { key: 'lastViewed', label: 'Last Viewed', width: 'minmax(0, 1fr)' },
    ]
  }

  return [
    { key: 'entityType', label: 'Type', width: 'minmax(0, 0.8fr)' },
    { key: 'name', label: 'Name', width: 'minmax(0, 1.2fr)' },
    { key: 'description', label: 'Description', width: 'minmax(0, 1.2fr)' },
    { key: 'status', label: 'Status', width: 'minmax(0, 0.8fr)' },
    { key: 'updatedAt', label: 'Updated', width: 'minmax(0, 0.9fr)' },
  ]
}

const DataTable = ({
  rows,
  columns,
  emptyMessage,
  onRowClick,
  activeRowId,
  onRemoveRow,
}) => {
  const hasRemove = typeof onRemoveRow === 'function'
  const gridTemplateColumns = [
    ...columns.map((column) => column.width),
    ...(hasRemove ? ['32px'] : []),
  ].join(' ')
  const isInteractive = typeof onRowClick === 'function'
  const [hoveredRowId, setHoveredRowId] = useState(null)
  const [localActiveRowId, setLocalActiveRowId] = useState(null)
  const [sortConfig, setSortConfig] = useState(null)
  const resolvedActiveRowId =
    activeRowId !== undefined
      ? activeRowId === null
        ? null
        : String(activeRowId)
      : localActiveRowId
  const sortedRows = useMemo(() => {
    if (!sortConfig?.key) return rows
    const sorted = [...rows]
    const normalizeValue = (value) => {
      if (value === null || value === undefined) return ''
      const raw = String(value).trim()
      if (!raw) return ''
      const numeric = Number(raw)
      if (!Number.isNaN(numeric) && /^-?\d+(\.\d+)?$/.test(raw)) return numeric
      const parsedDate = Date.parse(raw)
      if (!Number.isNaN(parsedDate)) return parsedDate
      return raw.toLowerCase()
    }
    sorted.sort((a, b) => {
      const aVal = normalizeValue(a?.[sortConfig.key])
      const bVal = normalizeValue(b?.[sortConfig.key])
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal)
      const bStr = String(bVal)
      const cmp = aStr.localeCompare(bStr, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [rows, sortConfig])
  const SortHeaderIcon = () => <SwitchVertical01 size={12} color="#FFFFFF" />

  return (
    <Box style={tableShellStyles}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns,
          columnGap: 10,
          alignItems: 'center',
          padding: '6px 10px',
          background: '#24263C',
          borderRadius: '4px 4px 0 0',
        }}
      >
        {columns.map((column) => (
          <Text
            key={column.key}
            component="span"
            style={{
              color: '#fff',
              fontSize: 12,
              lineHeight: '16px',
              minWidth: 0,
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() =>
                setSortConfig((prev) => {
                  if (!prev || prev.key !== column.key) {
                    return { key: column.key, direction: 'asc' }
                  }
                  return {
                    key: column.key,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc',
                  }
                })
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                gap: 4,
                width: '100%',
                minWidth: 0,
                overflow: 'hidden',
                border: 'none',
                background: 'transparent',
                padding: 0,
                margin: 0,
                color: 'inherit',
                cursor: 'pointer',
                lineHeight: '16px',
              }}
            >
              <Box
                component="span"
                style={{
                  display: 'block',
                  flex: '0 1 auto',
                  minWidth: 0,
                  maxWidth: 'calc(100% - 16px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '16px',
                }}
              >
                {column.label}
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 12,
                  height: 12,
                  lineHeight: 0,
                  flexShrink: 0,
                  opacity: sortConfig?.key === column.key ? 1 : 0.65,
                  transform:
                    sortConfig?.key === column.key &&
                    sortConfig?.direction === 'desc'
                      ? 'rotate(180deg)'
                      : 'none',
                  transition: 'transform 120ms ease, opacity 120ms ease',
                }}
              >
                <SortHeaderIcon />
              </Box>
            </Box>
          </Text>
        ))}
        {hasRemove && <Box style={{ width: 32 }} />}
      </Box>

      {rows.length === 0 ? (
        <Box
          style={{
            padding: '14px 12px',
            background: '#181926',
          }}
        >
          <Text style={{ color: '#8D95AA', fontSize: 12, lineHeight: 1.4 }}>
            {emptyMessage}
          </Text>
        </Box>
      ) : (
        sortedRows.map((row, idx) => (
          <Box
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onMouseEnter={
              isInteractive ? () => setHoveredRowId(String(row.id)) : undefined
            }
            onMouseLeave={
              isInteractive ? () => setHoveredRowId(null) : undefined
            }
            onMouseDown={
              isInteractive
                ? () => setLocalActiveRowId(String(row.id))
                : undefined
            }
            style={{
              display: 'grid',
              gridTemplateColumns,
              columnGap: 10,
              alignItems: 'center',
              padding: '8px',
              borderTop:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : idx === 0 ||
                      (isInteractive &&
                        idx > 0 &&
                        resolvedActiveRowId === String(sortedRows[idx - 1]?.id))
                    ? 'none'
                    : '1px solid #393C56',
              borderRight:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : 'none',
              borderBottom:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : 'none',
              borderLeft:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : 'none',
              borderRadius: 0,
              background:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #181926'
                  : isInteractive && hoveredRowId === String(row.id)
                    ? '#0056AC'
                    : '#181926',
              cursor: isInteractive ? 'pointer' : 'default',
              transition: isInteractive
                ? 'background-color 120ms ease'
                : undefined,
            }}
          >
            {columns.map((column) => (
              <Text
                key={`${row.id}-${column.key}`}
                style={{
                  color: '#fff',
                  fontSize: column.key === 'flag' ? 16 : 12,
                  lineHeight: '16px',
                  minWidth: 0,
                  textAlign: column.align || 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={row[column.key]}
              >
                {row[column.key] || 'No info'}
              </Text>
            ))}
            {hasRemove && (
              <Box
                component="button"
                type="button"
                aria-label="Remove"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveRow(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#A4ABBE',
                  justifySelf: 'center',
                }}
              >
                <Trash01 size={14} color="#A4ABBE" />
              </Box>
            )}
          </Box>
        ))
      )}
    </Box>
  )
}

const SecondaryNav = ({
  isOpen,
  onOpen,
  onClose,
  currentPath,
  watchlistVersion = 'grouped',
  onShipSelect,
  onPortSelect,
}) => {
  const [activeTopTab, setActiveTopTab] = useState('my-watchlist')
  const [activeWatchlistTab, setActiveWatchlistTab] = useState('all')
  const [version2Mode, setVersion2Mode] = useState(
    watchlistVersion === 'version3' ||
      watchlistVersion === 'version4' ||
      watchlistVersion === 'version5' ||
      watchlistVersion === 'version6' ||
      watchlistVersion === 'version7'
      ? 'add-options'
      : 'empty'
  )
  const [version2SelectedFlow, setVersion2SelectedFlow] = useState(null)
  const [version2HoveredFlow, setVersion2HoveredFlow] = useState(null)
  const [version2ShipQuery, setVersion2ShipQuery] = useState('')
  const [version2SearchResults, setVersion2SearchResults] = useState([])
  const [version2IsSearching, setVersion2IsSearching] = useState(false)
  const [version2PendingShips, setVersion2PendingShips] = useState([])
  const [version2PortQuery, setVersion2PortQuery] = useState('')
  const [version2PortSearchResults, setVersion2PortSearchResults] = useState([])
  const [version2IsPortSearching, setVersion2IsPortSearching] = useState(false)
  const [version2PendingPorts, setVersion2PendingPorts] = useState([])
  const [version2AlertShipSearchValue, setVersion2AlertShipSearchValue] =
    useState('')
  const [version2AlertMyShipValue, setVersion2AlertMyShipValue] = useState('')
  const [version2UploadedFileName, setVersion2UploadedFileName] = useState('')
  const [version2UploadError, setVersion2UploadError] = useState('')
  const [version2UploadTarget, setVersion2UploadTarget] =
    useState('ships-ports')
  const [version6RecentActivityRows, setVersion6RecentActivityRows] = useState(
    []
  )
  const [version2PrototypeShipRows, setVersion2PrototypeShipRows] = useState([])
  const [version2PrototypePortRows, setVersion2PrototypePortRows] = useState([])
  const [version2HasAddedBookmarks, setVersion2HasAddedBookmarks] =
    useState(false)
  const [version2BookmarkSearchQuery, setVersion2BookmarkSearchQuery] =
    useState('')
  const [shapeNameInput, setShapeNameInput] = useState('')
  const [activeShapeRowId, setActiveShapeRowId] = useState(null)
  const [openTableFilterId, setOpenTableFilterId] = useState(null)
  const [shipTableFilters, setShipTableFilters] = useState({
    type: 'all',
    flag: 'all',
  })
  const [portTableFilters, setPortTableFilters] = useState({
    country: 'all',
    risk: 'all',
  })
  const [showQuickAddBanner, setShowQuickAddBanner] = useState(true)
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const [navWidth, setNavWidth] = useState(SECONDARY_NAV_DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(SECONDARY_NAV_DEFAULT_WIDTH)
  const version2SearchTimerRef = useRef(null)
  const version2UploadInputRef = useRef(null)
  const version6LastSelectedDetectionRef = useRef(null)
  const previousFavoriteShipCountRef = useRef(0)
  const previousFavoritePortCountRef = useRef(0)
  const navigate = useNavigate()
  const {
    shipTabs,
    activeShipTab,
    favoriteShipIds,
    favoritePorts,
    toggleFavoriteShip,
    toggleFavoritePort,
    openPortTab,
    runtimeDetections,
    selectedDetectionId,
    panelFocusDetectionId,
    activeDetectionId,
    shapeDrawMode,
    pendingShape,
    bookmarkedShapes,
    startShapeDraw,
    cancelShapeDraw,
    saveShape,
    removeShape,
    showShape,
    visibleShapeIds,
  } = useShipContext()

  const isWatchlistView =
    currentPath === '/watchlist' || currentPath.startsWith('/myships')
  const isGroupedVersion = watchlistVersion === 'grouped'
  const isVersion2 = watchlistVersion === 'version2'
  const isVersion3 = watchlistVersion === 'version3'
  const isVersion4 = watchlistVersion === 'version4'
  const isVersion7 = watchlistVersion === 'version7'
  const isVersion6 = watchlistVersion === 'version6' || isVersion7
  const isVersion5 = watchlistVersion === 'version5' || isVersion6
  const isVersion4Or5 = isVersion4 || isVersion5
  const isVersion3Or4Or5 = isVersion3 || isVersion4Or5
  const isVersion2Or3Or4Or5 = isVersion2 || isVersion3Or4Or5
  const topTabWatchlistLabel = isVersion4Or5 ? 'Bookmarks' : 'My Watchlist'
  const listCollectionLabel = isVersion4Or5 ? 'Bookmarks' : 'Watchlist'
  const listCollectionLabelLower = isVersion4Or5 ? 'bookmarks' : 'watchlist'
  const polygonEntityLabelSingular = isVersion5 ? 'Shape' : 'Polygon'
  const polygonEntityLabelPlural = isVersion5 ? 'Shapes' : 'Polygons'
  const polygonEntityLabelLowerPlural = isVersion5 ? 'shapes' : 'polygons'
  const isVersion3UploadHovered = version2HoveredFlow === 'upload-file'
  const isVersion3EntityUploadHovered =
    version2HoveredFlow === 'upload-file-entities'
  const isVersion3ShapeUploadHovered =
    version2HoveredFlow === 'upload-file-shapes'
  const version2AddOptions = useMemo(() => {
    const baseOptions = isVersion5
      ? VERSION2_ADD_OPTIONS.filter((option) => option.id !== 'alerts')
      : VERSION2_ADD_OPTIONS

    return baseOptions.map((option) =>
      isVersion5 && option.id === 'polygons'
        ? {
            ...option,
            title: 'Shapes',
            description: 'Monitor by area of interest',
          }
        : option
    )
  }, [isVersion5])

  const shipLookup = useMemo(() => {
    const rows = {}
    Object.values(ships).forEach((ship) => {
      rows[ship.id] = ship
    })
    return rows
  }, [])

  const myShipRows = useMemo(
    () =>
      favoriteShipIds
        .map((shipId) => shipLookup[shipId])
        .filter(Boolean)
        .map((ship) => ({
          id: `ship-${ship.id}`,
          sourceShipId: String(ship.id),
          name: ship.name || 'No info',
          flag: ship.flag || '-',
          type: ship.shipType || ship.aisInfo?.shipType || 'No info',
          port: ship.aisInfo?.destination || 'No info',
          event: ship.latestEvent || 'No info',
          entityType: 'Ship',
          description: `${ship.shipType || 'Unknown'} • ${ship.aisInfo?.destination || 'No destination'}`,
          status: 'Monitoring',
          updatedAt: 'Live',
        })),
    [favoriteShipIds, shipLookup]
  )

  const portRows = useMemo(
    () =>
      watchedPorts.map((port) => ({
        id: port.id,
        name: port.name || 'No info',
        country: port.country || 'No info',
        activity: port.activity || port.type || 'No info',
        risk: port.risk || port.status || 'Monitoring',
        updatedAt: port.updatedAt || 'Just now',
        entityType: 'Port',
        description: `${port.country || 'No info'} • ${port.activity || port.type || 'No info'}`,
        status: port.risk || port.status || 'Monitoring',
      })),
    []
  )

  const favoritePortRows = useMemo(
    () =>
      favoritePorts.map((port) => ({
        id: `favorite-port-row-${port.id}`,
        sourcePortId: String(port.id),
        name: port.name || 'No info',
        country: port.country || 'No info',
        activity: port.activity || 'No info',
        risk: port.risk || 'Monitoring',
        updatedAt: port.updatedAt || 'Just now',
        entityType: 'Port',
        description: `${port.country || 'No info'} • ${port.activity || 'No info'}`,
        status: port.risk || 'Monitoring',
      })),
    [favoritePorts]
  )

  const polygonRows = useMemo(
    () =>
      watchedPolygons.map((polygon) => ({
        ...polygon,
        entityType: 'Polygon',
        description: `${polygon.region} • ${polygon.rule}`,
        status: 'Monitoring',
      })),
    []
  )

  const eventRows = useMemo(
    () =>
      watchedEvents.map((event) => ({
        ...event,
        entityType: 'Event',
        description: `${event.relatedTo} • ${event.source}`,
        status: event.severity,
        updatedAt: event.lastSeen,
      })),
    []
  )

  const recentlyViewedShipRows = useMemo(
    () =>
      shipTabs
        .filter((tab) => tab.type !== 'sts')
        .map((tab) => shipLookup[tab.id])
        .filter(Boolean)
        .reverse()
        .map((ship, index) => ({
          id: `recent-ship-${ship.id}-${index}`,
          sourceShipId: String(ship.id),
          name: ship.name || 'No info',
          flag: ship.flag || '-',
          type: ship.shipType || ship.aisInfo?.shipType || 'No info',
          port: ship.aisInfo?.destination || 'No info',
          event: ship.latestEvent || 'No info',
        })),
    [shipLookup, shipTabs]
  )

  const recentlyViewedPortRows = useMemo(
    () =>
      watchedPorts.map((port, index) => ({
        ...port,
        id: `recent-port-${port.id}-${index}`,
        sourcePortId: String(port.id),
      })),
    []
  )

  const recentlyViewedPolygonRows = useMemo(
    () =>
      watchedPolygons.map((polygon, index) => ({
        ...polygon,
        id: `recent-polygon-${polygon.id}-${index}`,
      })),
    []
  )

  const recentlyViewedEventRows = useMemo(
    () =>
      watchedEvents.map((event, index) => ({
        ...event,
        id: `recent-event-${event.id}-${index}`,
      })),
    []
  )

  const watchlistRowsByTab = useMemo(
    () => ({
      ships: myShipRows,
      ports: portRows,
      polygons: polygonRows,
      events: eventRows,
    }),
    [eventRows, myShipRows, polygonRows, portRows]
  )

  const watchlistSections = useMemo(
    () => [
      { id: 'ships', title: 'Ships', rows: myShipRows },
      { id: 'ports', title: 'Ports', rows: portRows },
      { id: 'polygons', title: 'Polygons', rows: polygonRows },
      { id: 'events', title: 'Events', rows: eventRows },
    ],
    [eventRows, myShipRows, polygonRows, portRows]
  )

  const recentlyViewedSections = useMemo(
    () => [
      { id: 'ships', title: 'Ships', rows: recentlyViewedShipRows },
      { id: 'ports', title: 'Ports', rows: recentlyViewedPortRows },
      { id: 'polygons', title: 'Polygons', rows: recentlyViewedPolygonRows },
      { id: 'events', title: 'Events', rows: recentlyViewedEventRows },
    ],
    [
      recentlyViewedEventRows,
      recentlyViewedPolygonRows,
      recentlyViewedPortRows,
      recentlyViewedShipRows,
    ]
  )

  const allWatchlistRows = useMemo(
    () => [...myShipRows, ...portRows, ...polygonRows, ...eventRows],
    [eventRows, myShipRows, polygonRows, portRows]
  )

  const recentlyViewedRows = useMemo(
    () => [
      ...recentlyViewedShipRows.map((row, index) => ({
        id: `${row.id}-mixed-${index}`,
        entityType: 'Ship',
        sourceShipId: row.sourceShipId,
        name: row.name,
        details: `${row.type || 'Unknown'} • ${row.port || 'No destination'}`,
        lastViewed: index === 0 ? 'Just now' : `${index + 1} views ago`,
      })),
      ...recentlyViewedPortRows.map((row) => ({
        id: `${row.id}-mixed`,
        entityType: 'Port',
        sourcePortId: row.sourcePortId,
        name: row.name,
        details: `${row.country || 'Unknown'} • ${row.activity || 'No info'}`,
        lastViewed: row.updatedAt || 'Recently',
      })),
      ...recentlyViewedPolygonRows.map((row) => ({
        id: `${row.id}-mixed`,
        entityType: 'Polygon',
        name: row.name,
        details: `${row.region || 'Unknown'} • ${row.rule || 'No info'}`,
        lastViewed: row.updatedAt || 'Recently',
      })),
      ...recentlyViewedEventRows.map((row) => ({
        id: `${row.id}-mixed`,
        entityType: 'Event',
        name: row.name,
        details: `${row.relatedTo || 'No info'} • ${row.source || 'No source'}`,
        lastViewed: row.lastSeen || 'Recently',
      })),
    ],
    [
      recentlyViewedEventRows,
      recentlyViewedPolygonRows,
      recentlyViewedPortRows,
      recentlyViewedShipRows,
    ]
  )

  const version6RecentShipRows = useMemo(
    () =>
      version6RecentActivityRows
        .filter((row) => row.entityType === 'Ship')
        .map((row, index) => ({
          id: row.id || `v6-recent-ship-${index}`,
          name: row.name || 'No info',
          ctry: row.ctry || 'No info',
          imo: row.imo || 'No info',
          mmsi: row.mmsi || 'No info',
          event: row.event || 'No info',
        })),
    [version6RecentActivityRows]
  )

  const version6RecentPortRows = useMemo(
    () =>
      version6RecentActivityRows
        .filter((row) => row.entityType === 'Port')
        .map((row, index) => ({
          id: row.id || `v6-recent-port-${index}`,
          name: row.name || 'No info',
          ctry: row.ctry || 'No info',
          locode: row.locode || 'No info',
          type: row.type || 'No info',
          status: row.status || 'No info',
        })),
    [version6RecentActivityRows]
  )

  const version6RecentShapeRows = useMemo(
    () =>
      version6RecentActivityRows
        .filter((row) => row.entityType === 'Shape')
        .map((row, index) => ({
          id: row.id || `v6-recent-shape-${index}`,
          shapeName: row.shapeName || row.name || 'No info',
          area: row.area || 'No info',
          createdDate: row.createdDate || 'No info',
        })),
    [version6RecentActivityRows]
  )

  const version6RecentEventRows = useMemo(
    () =>
      version6RecentActivityRows
        .filter((row) => row.entityType === 'Event')
        .map((row, index) => ({
          id: row.id || `v6-recent-event-${index}`,
          event: row.event || row.name || 'No info',
          ship: row.ship || 'No info',
          flag: row.flag || 'No info',
          date: row.date || 'No info',
        })),
    [version6RecentActivityRows]
  )

  const version6RecentlyViewedSections = useMemo(
    () => [
      { id: 'ships', title: 'Ships', rows: version6RecentShipRows },
      { id: 'ports', title: 'Ports', rows: version6RecentPortRows },
      {
        id: 'polygons',
        title: polygonEntityLabelPlural,
        rows: version6RecentShapeRows,
      },
      { id: 'events', title: 'Events', rows: version6RecentEventRows },
    ],
    [
      polygonEntityLabelPlural,
      version6RecentEventRows,
      version6RecentPortRows,
      version6RecentShapeRows,
      version6RecentShipRows,
    ]
  )

  const version6RecentlyViewedColumnsBySection = useMemo(
    () => ({
      ships: [
        { key: 'name', label: 'Name', width: 'minmax(0, 1.2fr)' },
        { key: 'ctry', label: 'Ctry', width: '90px' },
        { key: 'imo', label: 'IMO', width: 'minmax(0, 1fr)' },
        { key: 'mmsi', label: 'MMSI', width: 'minmax(0, 1fr)' },
        { key: 'event', label: 'Event', width: 'minmax(0, 1fr)' },
      ],
      ports: [
        { key: 'name', label: 'Name', width: 'minmax(0, 1.2fr)' },
        { key: 'ctry', label: 'Ctry', width: '90px' },
        { key: 'locode', label: 'Locode', width: 'minmax(0, 1fr)' },
        { key: 'type', label: 'Type', width: 'minmax(0, 1fr)' },
        { key: 'status', label: 'Status', width: 'minmax(0, 1fr)' },
      ],
      polygons: [
        { key: 'shapeName', label: 'Shape Name', width: 'minmax(0, 1.5fr)' },
        { key: 'area', label: 'Area', width: 'minmax(0, 1fr)' },
        { key: 'createdDate', label: 'Created Date', width: 'minmax(0, 1fr)' },
      ],
      events: [
        { key: 'event', label: 'Event', width: 'minmax(0, 1.2fr)' },
        { key: 'ship', label: 'Ship', width: 'minmax(0, 1.1fr)' },
        { key: 'flag', label: 'Flag', width: '90px' },
        { key: 'date', label: 'Date', width: 'minmax(0, 1fr)' },
      ],
    }),
    []
  )

  const version6HasRecentActivity = version6RecentActivityRows.length > 0

  const activeRows =
    activeTopTab === 'my-watchlist' && activeWatchlistTab === 'all'
      ? isGroupedVersion
        ? []
        : allWatchlistRows
      : activeTopTab === 'my-watchlist'
        ? watchlistRowsByTab[activeWatchlistTab]
        : isGroupedVersion
          ? []
          : recentlyViewedRows

  const columns = getColumnsByTab(
    activeTopTab === 'my-watchlist' ? activeWatchlistTab : 'recently-viewed'
  )
  const cleanedVersion2ShipQuery = version2ShipQuery.trim().replace(/\s+/g, ' ')
  const normalizedVersion2ShipQuery = cleanedVersion2ShipQuery.toLowerCase()
  const hasVersion2ShipQuery = cleanedVersion2ShipQuery.length > 0
  const cleanedVersion2PortQuery = version2PortQuery.trim().replace(/\s+/g, ' ')
  const normalizedVersion2PortQuery = cleanedVersion2PortQuery.toLowerCase()
  const hasVersion2PortQuery = cleanedVersion2PortQuery.length > 0
  const showVersion1Onboarding =
    isGroupedVersion &&
    activeTopTab === 'my-watchlist' &&
    activeWatchlistTab === 'all' &&
    myShipRows.length === 0
  const version2MyWatchlistShipRows = useMemo(() => {
    const normalizeName = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')

    const shipByNormalizedName = new globalThis.Map()
    Object.values(shipLookup).forEach((ship) => {
      const token = normalizeName(ship?.name)
      if (!token || shipByNormalizedName.has(token)) return
      shipByNormalizedName.set(token, ship)
    })

    const enrichedPrototypeRows = version2PrototypeShipRows.map((row) => {
      const matchedShip = shipByNormalizedName.get(normalizeName(row?.name))
      if (!matchedShip) return row

      return {
        ...row,
        sourceShipId: String(matchedShip.id),
        flag: matchedShip.flag || row.flag || '-',
        type:
          matchedShip.shipType ||
          matchedShip.aisInfo?.shipType ||
          row.type ||
          'No info',
        port: matchedShip.aisInfo?.destination || row.port || 'No info',
        event: matchedShip.latestEvent || row.event || 'No info',
      }
    })

    const mergedRows = [...myShipRows, ...enrichedPrototypeRows]
    const seenKeys = new Set()

    return mergedRows.filter((row) => {
      const identity =
        String(row?.sourceShipId || row?.id || '')
          .trim()
          .toLowerCase() || normalizeName(row?.name)
      if (!identity || seenKeys.has(identity)) return false
      seenKeys.add(identity)
      return true
    })
  }, [myShipRows, version2PrototypeShipRows, shipLookup])
  const version2MyWatchlistPortRows = useMemo(() => {
    const mergedRows = [
      ...portRows,
      ...favoritePortRows,
      ...version2PrototypePortRows,
    ]
    const seenKeys = new Set()

    return mergedRows.filter((row) => {
      const identity =
        String(row?.sourcePortId || row?.id || '')
          .trim()
          .toLowerCase() ||
        String(row?.name || '')
          .trim()
          .toLowerCase()
      if (!identity || seenKeys.has(identity)) return false
      seenKeys.add(identity)
      return true
    })
  }, [favoritePortRows, portRows, version2PrototypePortRows])
  const version4BookmarkedPolygonRows = useMemo(
    () =>
      (bookmarkedShapes || []).map((shape) => {
        const createdDate = shape.createdAt ? new Date(shape.createdAt) : null
        const updatedAt =
          createdDate && !Number.isNaN(createdDate.getTime())
            ? createdDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Just now'
        return {
          id: shape.id,
          name: shape.name || 'Untitled shape',
          polygonType: isVersion5 ? 'Shape' : 'Polygon',
          region: 'Custom',
          rule: 'None',
          updatedAt,
        }
      }),
    [bookmarkedShapes, isVersion5]
  )
  const version4BookmarkedAlertRows = useMemo(() => [], [])
  const activeShipRowId = useMemo(() => {
    const activeTab = shipTabs.find(
      (tab) => String(tab?.id) === String(activeShipTab)
    )
    if (activeTab?.type === 'port') return null

    const candidateDetectionIds = [
      panelFocusDetectionId,
      selectedDetectionId,
      activeDetectionId,
    ].filter((id) => id !== null && id !== undefined)
    if (candidateDetectionIds.length === 0) return null

    const activeDetection = candidateDetectionIds
      .map((id) =>
        runtimeDetections.find(
          (detection) => String(detection.id) === String(id)
        )
      )
      .find(Boolean)
    const activeShipId = activeDetection?.shipId
    if (!activeShipId) return null
    const candidateRowId = `ship-${activeShipId}`
    const idMatchedRow = version2MyWatchlistShipRows.find(
      (row) => String(row?.id || '') === candidateRowId
    )
    if (idMatchedRow?.id) return String(idMatchedRow.id)

    const activeShipName = String(shipLookup?.[activeShipId]?.name || '')
      .trim()
      .toLowerCase()
    if (!activeShipName) return null

    const nameMatchedRow = version2MyWatchlistShipRows.find(
      (row) =>
        String(row?.name || '')
          .trim()
          .toLowerCase() === activeShipName
    )
    return nameMatchedRow?.id ? String(nameMatchedRow.id) : null
  }, [
    runtimeDetections,
    panelFocusDetectionId,
    selectedDetectionId,
    activeDetectionId,
    shipLookup,
    version2MyWatchlistShipRows,
    shipTabs,
    activeShipTab,
  ])
  const activePortRowId = useMemo(() => {
    const activeTab = shipTabs.find(
      (tab) => String(tab?.id) === String(activeShipTab)
    )
    if (!activeTab || activeTab.type !== 'port') return null

    const activePortId = String(activeTab.id || '').trim()
    if (!activePortId) return null

    const idMatchedRow = version2MyWatchlistPortRows.find((row) => {
      const sourcePortId = String(row?.sourcePortId || '').trim()
      const rowId = String(row?.id || '').trim()
      return sourcePortId === activePortId || rowId === activePortId
    })
    if (idMatchedRow?.id) return String(idMatchedRow.id)

    const activePortName = String(activeTab.name || '')
      .trim()
      .toLowerCase()
    if (!activePortName) return null

    const nameMatchedRow = version2MyWatchlistPortRows.find(
      (row) =>
        String(row?.name || '')
          .trim()
          .toLowerCase() === activePortName
    )
    return nameMatchedRow?.id ? String(nameMatchedRow.id) : null
  }, [shipTabs, activeShipTab, version2MyWatchlistPortRows])
  const normalizedBookmarkSearchQuery = useMemo(
    () => version2BookmarkSearchQuery.trim().toLowerCase(),
    [version2BookmarkSearchQuery]
  )
  const searchedVersion2ShipRows = useMemo(() => {
    if (!normalizedBookmarkSearchQuery) return version2MyWatchlistShipRows
    return version2MyWatchlistShipRows.filter((row) => {
      const values = [row?.name, row?.flag, row?.type, row?.port, row?.event]
      return values.some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedBookmarkSearchQuery)
      )
    })
  }, [normalizedBookmarkSearchQuery, version2MyWatchlistShipRows])
  const searchedVersion2PortRows = useMemo(() => {
    if (!normalizedBookmarkSearchQuery) return version2MyWatchlistPortRows
    return version2MyWatchlistPortRows.filter((row) => {
      const values = [
        row?.name,
        row?.country,
        row?.activity,
        row?.risk,
        row?.updatedAt,
      ]
      return values.some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedBookmarkSearchQuery)
      )
    })
  }, [normalizedBookmarkSearchQuery, version2MyWatchlistPortRows])
  const shipTypeFilterOptions = useMemo(
    () =>
      Array.from(
        new Set(
          version2MyWatchlistShipRows
            .map((row) => String(row?.type || '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [version2MyWatchlistShipRows]
  )
  const shipFlagFilterOptions = useMemo(
    () =>
      Array.from(
        new Set(
          version2MyWatchlistShipRows
            .map((row) => String(row?.flag || '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [version2MyWatchlistShipRows]
  )
  const portCountryFilterOptions = useMemo(
    () =>
      Array.from(
        new Set(
          version2MyWatchlistPortRows
            .map((row) => String(row?.country || '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [version2MyWatchlistPortRows]
  )
  const portRiskFilterOptions = useMemo(
    () =>
      Array.from(
        new Set(
          version2MyWatchlistPortRows
            .map((row) => String(row?.risk || '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [version2MyWatchlistPortRows]
  )
  const filteredVersion2ShipRows = useMemo(
    () =>
      searchedVersion2ShipRows.filter((row) => {
        const typeMatches =
          shipTableFilters.type === 'all' ||
          String(row?.type || '').trim() === shipTableFilters.type
        const flagMatches =
          shipTableFilters.flag === 'all' ||
          String(row?.flag || '').trim() === shipTableFilters.flag
        return typeMatches && flagMatches
      }),
    [searchedVersion2ShipRows, shipTableFilters]
  )
  const filteredVersion2PortRows = useMemo(
    () =>
      searchedVersion2PortRows.filter((row) => {
        const countryMatches =
          portTableFilters.country === 'all' ||
          String(row?.country || '').trim() === portTableFilters.country
        const riskMatches =
          portTableFilters.risk === 'all' ||
          String(row?.risk || '').trim() === portTableFilters.risk
        return countryMatches && riskMatches
      }),
    [searchedVersion2PortRows, portTableFilters]
  )
  const shipIdByNormalizedName = useMemo(() => {
    const normalizeShipName = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    const map = new globalThis.Map()
    Object.values(shipLookup).forEach((ship) => {
      const token = normalizeShipName(ship?.name)
      if (!token || map.has(token)) return
      map.set(token, String(ship.id))
    })
    return map
  }, [shipLookup])
  const bookmarkedShipIds = useMemo(() => {
    const ids = new Set()
    version2MyWatchlistShipRows.forEach((row) => {
      const sourceShipId = String(row?.sourceShipId || '').trim()
      if (sourceShipId) ids.add(sourceShipId)
      const rowId = String(row?.id || '').trim()
      if (rowId.startsWith('ship-')) ids.add(rowId.slice(5))
    })
    return ids
  }, [version2MyWatchlistShipRows])
  const bookmarkedShipNameTokens = useMemo(() => {
    const normalizeShipName = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    return new Set(
      version2MyWatchlistShipRows
        .map((row) => normalizeShipName(row?.name))
        .filter(Boolean)
    )
  }, [version2MyWatchlistShipRows])
  const bookmarkedPortIds = useMemo(() => {
    const ids = new Set()
    version2MyWatchlistPortRows.forEach((row) => {
      const sourcePortId = String(row?.sourcePortId || '').trim()
      if (sourcePortId) ids.add(sourcePortId)
      const rowId = String(row?.id || '').trim()
      if (rowId) ids.add(rowId)
    })
    return ids
  }, [version2MyWatchlistPortRows])
  const bookmarkedPortNameTokens = useMemo(
    () =>
      new Set(
        version2MyWatchlistPortRows
          .map((row) =>
            String(row?.name || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    [version2MyWatchlistPortRows]
  )
  const hasBookmarkSearchQuery = normalizedBookmarkSearchQuery.length > 0
  const hasAnyBookmarkedItems = version2HasAddedBookmarks
  const version2PendingShipIds = useMemo(
    () => new Set(version2PendingShips.map((ship) => ship.optionId)),
    [version2PendingShips]
  )
  const version2DisplaySearchRows = useMemo(() => {
    const seen = new Set()
    const rows = []

    version2SearchResults.forEach((ship) => {
      if (!ship?.optionId || seen.has(ship.optionId)) return
      seen.add(ship.optionId)
      rows.push(ship)
    })

    // Keep prior selections visible across searches, but don't reorder current results.
    version2PendingShips.forEach((ship) => {
      if (!ship?.optionId || seen.has(ship.optionId)) return
      seen.add(ship.optionId)
      rows.push(ship)
    })

    return rows
  }, [version2PendingShips, version2SearchResults])
  const version2PendingCount = version2PendingShips.length
  const version2SubmitLabel =
    version2PendingCount > 0
      ? `Add ${version2PendingCount} Ship${version2PendingCount === 1 ? '' : 's'}`
      : 'Select ships to add'
  const version2PendingPortIds = useMemo(
    () => new Set(version2PendingPorts.map((port) => port.optionId)),
    [version2PendingPorts]
  )
  const version2DisplayPortSearchRows = useMemo(() => {
    const seen = new Set()
    const rows = []

    version2PortSearchResults.forEach((port) => {
      if (!port?.optionId || seen.has(port.optionId)) return
      seen.add(port.optionId)
      rows.push(port)
    })

    version2PendingPorts.forEach((port) => {
      if (!port?.optionId || seen.has(port.optionId)) return
      seen.add(port.optionId)
      rows.push(port)
    })

    return rows
  }, [version2PendingPorts, version2PortSearchResults])
  const version2PendingPortCount = version2PendingPorts.length
  const version2PortSubmitLabel =
    version2PendingPortCount > 0
      ? `Add ${version2PendingPortCount} Port${version2PendingPortCount === 1 ? '' : 's'}`
      : version2Mode === 'polygons'
        ? `Select ${polygonEntityLabelLowerPlural} to add`
        : 'Select ports to add'
  const isVersion5ShapeMode = isVersion5 && version2Mode === 'polygons'
  const isVersion5MixedUploadMode = isVersion5 && version2Mode === 'add-options'
  const uploadTarget = isVersion5ShapeMode
    ? 'shapes'
    : isVersion5MixedUploadMode
      ? version2UploadTarget
      : 'ships-ports'
  const uploadAccept =
    uploadTarget === 'shapes'
      ? '.json,.geojson,application/json,application/geo+json'
      : '.csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const uploadAcceptLabel =
    uploadTarget === 'shapes' ? '(.json, .geojson)' : '(.csv, .xls, .xlsx)'
  const uploadTargetLabel = uploadTarget === 'shapes' ? 'Shapes' : 'Ships/Ports'
  const version2AddOptionIconSize = isVersion6 ? 16 : 20
  const canProceedVersion2 = Boolean(version2SelectedFlow)

  const openVersion2UploadPicker = (target = uploadTarget) => {
    setVersion2UploadTarget(target)
    setVersion2UploadError('')
    version2UploadInputRef.current?.click()
  }

  const returnToBookmarksList = () => {
    if (version2SearchTimerRef.current) {
      window.clearTimeout(version2SearchTimerRef.current)
      version2SearchTimerRef.current = null
    }
    setVersion2IsSearching(false)
    setVersion2IsPortSearching(false)
    setVersion2ShipQuery('')
    setVersion2SearchResults([])
    setVersion2PendingShips([])
    setVersion2PortQuery('')
    setVersion2PortSearchResults([])
    setVersion2PendingPorts([])
    setVersion2SelectedFlow(null)
    setVersion2HoveredFlow(null)
    setVersion2Mode('ships-list')
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('all')
  }

  const handleSaveShape = () => {
    const saved = saveShape(shapeNameInput)
    if (!saved) return
    setShapeNameInput('')
    setVersion2HasAddedBookmarks(true)
    setVersion2SelectedFlow(null)
    setVersion2HoveredFlow(null)
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('all')
    setVersion2Mode('ships-list')
  }

  const handleCancelShapeDraw = () => {
    setShapeNameInput('')
    cancelShapeDraw()
  }

  const handleRemoveShipBookmark = (row) => {
    if (!row) return
    const sourceShipId = String(row.sourceShipId || '').trim()
    if (sourceShipId && favoriteShipIds.includes(sourceShipId)) {
      toggleFavoriteShip(sourceShipId)
    }
    setVersion2PrototypeShipRows((prev) =>
      prev.filter((prototypeRow) => {
        const sameId = String(prototypeRow.id) === String(row.id)
        const sameShip =
          sourceShipId &&
          String(prototypeRow.sourceShipId || '').trim() === sourceShipId
        return !sameId && !sameShip
      })
    )
  }

  const handleRemovePortBookmark = (row) => {
    if (!row) return
    const sourcePortId = String(row.sourcePortId || '').trim()
    const favoritePort = favoritePorts.find(
      (port) => String(port.id) === sourcePortId
    )
    if (favoritePort) {
      toggleFavoritePort(favoritePort)
    }
    setVersion2PrototypePortRows((prev) =>
      prev.filter((prototypeRow) => {
        const sameId = String(prototypeRow.id) === String(row.id)
        const samePort =
          sourcePortId &&
          String(prototypeRow.sourcePortId || '').trim() === sourcePortId
        return !sameId && !samePort
      })
    )
  }

  const handleShapeRowClick = (row) => {
    if (!row) return
    showShape(row.id)
    setActiveShapeRowId(String(row.id))
  }

  useEffect(() => {
    if (!activeShapeRowId) return
    if (!(visibleShapeIds || []).includes(activeShapeRowId)) {
      setActiveShapeRowId(null)
    }
  }, [visibleShapeIds, activeShapeRowId])

  const handleShipRowClick = useCallback(
    (row) => {
      const sourceShipId = String(row?.sourceShipId || '').trim()
      if (sourceShipId) {
        onShipSelect?.(sourceShipId)
        return
      }

      const rowId = String(row?.id || '')
      if (rowId.startsWith('ship-')) {
        const shipId = rowId.slice(5)
        if (shipId) {
          onShipSelect?.(shipId)
          return
        }
      }

      const normalizedName = String(row?.name || '')
        .trim()
        .toLowerCase()
      if (!normalizedName) return
      const allShips = Object.values(shipLookup)
      const matchedShip = allShips.find(
        (ship) =>
          String(ship?.name || '')
            .trim()
            .toLowerCase() === normalizedName
      )
      if (matchedShip?.id) {
        onShipSelect?.(matchedShip.id)
        return
      }

      const normalizeToken = (value) =>
        String(value || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
      const queryToken = normalizeToken(normalizedName)
      if (!queryToken) return

      const levenshteinDistance = (a, b) => {
        const m = a.length
        const n = b.length
        if (m === 0) return n
        if (n === 0) return m
        const dp = Array.from({ length: m + 1 }, (_, i) =>
          Array.from({ length: n + 1 }, (_, j) =>
            i === 0 ? j : j === 0 ? i : 0
          )
        )
        for (let i = 1; i <= m; i += 1) {
          for (let j = 1; j <= n; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            )
          }
        }
        return dp[m][n]
      }

      let bestFuzzyMatch = null
      let bestDistance = Number.POSITIVE_INFINITY
      allShips.forEach((ship) => {
        const shipToken = normalizeToken(ship?.name)
        if (!shipToken) return
        const distance = levenshteinDistance(queryToken, shipToken)
        if (distance < bestDistance) {
          bestDistance = distance
          bestFuzzyMatch = ship
        }
      })

      // Allow near matches like "invitcus" -> "invictus"
      if (bestFuzzyMatch?.id && bestDistance <= 2) {
        onShipSelect?.(bestFuzzyMatch.id)
      }
    },
    [onShipSelect, shipLookup]
  )

  const handlePortRowClick = useCallback(
    (row) => {
      const sourcePortId = String(row?.sourcePortId || '').trim()
      const rowPortId = String(row?.id || '').trim()
      const resolvedPortName = String(row?.name || '').trim()
      const normalizedPortName = resolvedPortName.toLowerCase()
      const mappedPrototypePortId =
        PROTOTYPE_PORT_ID_BY_NAME[normalizedPortName] || ''
      const resolvedPortId =
        (sourcePortId.startsWith('port-') ? sourcePortId : '') ||
        mappedPrototypePortId ||
        sourcePortId ||
        rowPortId
      if (!resolvedPortId || !resolvedPortName) return

      const portPayload = {
        id: resolvedPortId,
        type: 'port',
        name: resolvedPortName,
        country: row?.country || 'No info',
        activity: row?.activity || 'No info',
        risk: row?.risk || 'Monitoring',
        updatedAt: row?.updatedAt || 'Just now',
      }

      if (typeof onPortSelect === 'function') {
        onPortSelect(portPayload)
        return
      }

      openPortTab?.(portPayload)
      navigate('/myships')
    },
    [navigate, onPortSelect, openPortTab]
  )

  const handleRecentlyViewedRowClick = useCallback(
    (row) => {
      const entityType = String(row?.entityType || '').toLowerCase()
      if (entityType === 'ship') {
        handleShipRowClick(row)
        return
      }
      if (entityType === 'port') {
        handlePortRowClick(row)
      }
    },
    [handlePortRowClick, handleShipRowClick]
  )

  const pushVersion6RecentActivity = useCallback((row) => {
    if (!row?.activityKey) return
    setVersion6RecentActivityRows((prev) => {
      const deduped = prev.filter(
        (existingRow) => existingRow.activityKey !== row.activityKey
      )
      return [
        { ...row, lastViewed: row.lastViewed || 'Just now' },
        ...deduped,
      ].slice(0, 30)
    })
  }, [])

  const renderVersion2UploadIcon = () =>
    isVersion6 ? (
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: 4,
          background: '#181926',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Upload01 size={16} color="#FFFFFF" />
      </Box>
    ) : (
      <Upload01 size={16} color="#FFFFFF" />
    )

  const renderVersion2TipStarIcon = () =>
    isVersion6 ? (
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: 4,
          background: '#181926',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Star01
          style={{
            color: '#F7C948',
            fill: '#F7C948',
            width: 16,
            height: 16,
          }}
        />
      </Box>
    ) : (
      <Star01
        style={{
          color: '#F7C948',
          fill: '#F7C948',
          width: 18,
          height: 18,
          flexShrink: 0,
          marginTop: 1,
        }}
      />
    )

  const handleVersion2Next = (selectedFlow = version2SelectedFlow) => {
    if (!selectedFlow) return
    if (selectedFlow === 'ships') {
      setVersion2Mode('ships')
      return
    }
    if (selectedFlow === 'ports') {
      setVersion2Mode('ports')
      return
    }
    if (selectedFlow === 'polygons') {
      setVersion2Mode('polygons')
      return
    }
    if (selectedFlow === 'alerts') {
      setVersion2Mode('alerts')
    }
  }

  const buildVersion2SearchResults = (query) => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    const normalizedQuery = cleanedQuery.toLowerCase()
    if (!cleanedQuery) return []

    const baseName = cleanedQuery
      .split(' ')
      .map((word) =>
        word
          ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
          : ''
      )
      .join(' ')
    const nameOptions = [baseName, `${baseName} Star`, `${baseName} Voyager`]
    const seed = normalizedQuery
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)

    return nameOptions.map((name, index) => ({
      optionId: `typed-${normalizedQuery}-${index}`,
      name,
      imo: String(9000000 + ((seed * 97 + index * 211) % 999999)),
      mmsi: String(300000000 + ((seed * 7919 + index * 104729) % 699999999)),
      isPrototype: true,
      baseShipId: null,
    }))
  }

  const buildVersion2PortSearchResults = (query) => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    const normalizedQuery = cleanedQuery.toLowerCase()
    if (!cleanedQuery) return []

    const baseName = cleanedQuery
      .split(' ')
      .map((word) =>
        word
          ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
          : ''
      )
      .join(' ')
    const seed = normalizedQuery
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)

    return [
      {
        optionId: `typed-port-${normalizedQuery}-0`,
        name: baseName,
        country: 'India',
        activity: 'Monitoring',
        locode: `IN${String(100 + (seed % 900)).slice(-3)}`,
      },
      {
        optionId: `typed-port-${normalizedQuery}-1`,
        name: `${baseName} Anchorage`,
        country: 'UAE',
        activity: 'Bunkering',
        locode: `AE${String(100 + (seed % 900)).slice(-3)}`,
      },
      {
        optionId: `typed-port-${normalizedQuery}-2`,
        name: `${baseName} Terminal`,
        country: 'Saudi Arabia',
        activity: 'Cargo',
        locode: `SA${String(100 + ((seed * 3) % 900)).slice(-3)}`,
      },
      {
        optionId: `typed-port-${normalizedQuery}-3`,
        name: `${baseName} Port`,
        country: 'Oman',
        activity: 'Anchorage',
        locode: `OM${String(100 + ((seed * 7) % 900)).slice(-3)}`,
      },
    ]
  }

  const handleVersion2QueueShip = (ship) => {
    if (!ship) return
    const normalizeName = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    const normalizedName = normalizeName(ship.name)
    const matchedShip = Object.values(shipLookup).find(
      (candidate) => normalizeName(candidate?.name) === normalizedName
    )
    const resolvedShipId = String(
      ship.baseShipId || matchedShip?.id || ''
    ).trim()
    const alreadyBookmarked = version2MyWatchlistShipRows.some((row) => {
      const rowShipId = String(row?.sourceShipId || '').trim()
      const sameShipId =
        resolvedShipId && rowShipId && rowShipId === resolvedShipId
      const sameName = normalizeName(row?.name) === normalizedName
      return sameShipId || sameName
    })
    if (alreadyBookmarked) return

    setVersion2PendingShips((prev) =>
      prev.some((pendingShip) => {
        const sameOption = pendingShip.optionId === ship.optionId
        const sameName = normalizeName(pendingShip?.name) === normalizedName
        return sameOption || sameName
      })
        ? prev
        : [...prev, ship]
    )
  }

  const handleVersion2ShipToggle = (ship) => {
    const isAlreadySelected = version2PendingShips.some(
      (pendingShip) => pendingShip.optionId === ship.optionId
    )
    if (isAlreadySelected) {
      setVersion2PendingShips((prev) =>
        prev.filter((pendingShip) => pendingShip.optionId !== ship.optionId)
      )
      return
    }
    handleVersion2QueueShip(ship)
  }

  const handleVersion2SubmitShips = () => {
    if (version2PendingShips.length === 0) return
    setVersion2HasAddedBookmarks(true)

    const normalizeShipName = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    const shipByNormalizedName = new globalThis.Map()
    Object.values(shipLookup).forEach((ship) => {
      const token = normalizeShipName(ship?.name)
      if (!token || shipByNormalizedName.has(token)) return
      shipByNormalizedName.set(token, ship)
    })

    const realShipIdsToFavorite = [
      ...new Set(
        version2PendingShips
          .map((ship) => {
            if (ship?.baseShipId) return String(ship.baseShipId)
            const matchedShip = shipByNormalizedName.get(
              normalizeShipName(ship?.name)
            )
            return matchedShip?.id ? String(matchedShip.id) : null
          })
          .filter(Boolean)
      ),
    ]
    const realShipsToAdd = realShipIdsToFavorite.filter(
      (shipId) => !favoriteShipIds.includes(shipId)
    )
    realShipsToAdd.forEach((shipId) => toggleFavoriteShip(shipId))
    const realShipIdsToSkip = new Set(realShipIdsToFavorite)

    const existingPrototypeNames = new Set(
      version2PrototypeShipRows.map((row) => (row.name || '').toLowerCase())
    )
    const prototypeShipsToAdd = version2PendingShips.filter((ship) => {
      const matchedShip = shipByNormalizedName.get(
        normalizeShipName(ship?.name)
      )
      if (matchedShip?.id && realShipIdsToSkip.has(String(matchedShip.id)))
        return false
      if (!ship.isPrototype) return false
      const normalizedName = (ship.name || '').toLowerCase()
      if (existingPrototypeNames.has(normalizedName)) return false
      existingPrototypeNames.add(normalizedName)
      return true
    })

    if (prototypeShipsToAdd.length > 0) {
      setVersion2PrototypeShipRows((prev) => [
        ...prev,
        ...prototypeShipsToAdd.map((ship) => ({
          id: `proto-row-${ship.optionId}`,
          name: ship.name || 'No info',
          flag: '-',
          type: 'Custom',
          port: 'No info',
          event: 'Manual',
          entityType: 'Ship',
          description: `Custom • ${ship.name || 'No info'}`,
          status: 'Monitoring',
          updatedAt: 'Just now',
        })),
      ])
    }

    if (isVersion6) {
      version2PendingShips.forEach((ship) => {
        const baseShip =
          (ship.baseShipId ? shipLookup[ship.baseShipId] : null) ||
          shipByNormalizedName.get(normalizeShipName(ship?.name)) ||
          null
        const shipName = ship.name || baseShip?.name || 'Unknown ship'
        pushVersion6RecentActivity({
          activityKey: `ship-${ship.baseShipId || ship.optionId}`,
          id: `recent-v6-ship-${ship.baseShipId || ship.optionId}`,
          entityType: 'Ship',
          name: shipName,
          ctry: baseShip?.flag || ship.flag || '-',
          imo: ship.imo || baseShip?.imo || baseShip?.aisInfo?.imo || 'No info',
          mmsi:
            ship.mmsi || baseShip?.mmsi || baseShip?.aisInfo?.mmsi || 'No info',
          event: baseShip?.latestEvent || 'Manual',
          lastViewed: 'Just now',
        })
      })
    }

    setVersion2PendingShips([])
    setVersion2ShipQuery('')
    setVersion2SearchResults([])
    setVersion2Mode('ships-list')
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('ships')
  }

  const handleVersion2QueuePort = (port) => {
    if (!port) return
    const normalizeName = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
    const normalizedName = normalizeName(port.name)
    const mappedPortId = PROTOTYPE_PORT_ID_BY_NAME[normalizedName]
    const resolvedPortId = String(
      mappedPortId || port.id || port.sourcePortId || port.optionId || ''
    ).trim()
    const alreadyBookmarked = version2MyWatchlistPortRows.some((row) => {
      const rowPortId = String(row?.sourcePortId || row?.id || '').trim()
      const samePortId =
        resolvedPortId && rowPortId && rowPortId === resolvedPortId
      const sameName = normalizeName(row?.name) === normalizedName
      return samePortId || sameName
    })
    if (alreadyBookmarked) return

    setVersion2PendingPorts((prev) =>
      prev.some((pendingPort) => {
        const sameOption = pendingPort.optionId === port.optionId
        const sameName = normalizeName(pendingPort?.name) === normalizedName
        return sameOption || sameName
      })
        ? prev
        : [...prev, port]
    )
  }

  const handleVersion2PortToggle = (port) => {
    const isAlreadySelected = version2PendingPorts.some(
      (pendingPort) => pendingPort.optionId === port.optionId
    )
    if (isAlreadySelected) {
      setVersion2PendingPorts((prev) =>
        prev.filter((pendingPort) => pendingPort.optionId !== port.optionId)
      )
      return
    }
    handleVersion2QueuePort(port)
  }

  const handleVersion2SubmitPorts = () => {
    if (version2PendingPorts.length === 0) return
    setVersion2HasAddedBookmarks(true)

    const portsToFavorite = version2PendingPorts.map((port) => {
      const normalizedName = String(port?.name || '')
        .trim()
        .toLowerCase()
      const mappedPortId = PROTOTYPE_PORT_ID_BY_NAME[normalizedName]
      const resolvedId = String(
        mappedPortId || port?.id || port?.sourcePortId || port?.optionId || ''
      ).trim()
      if (!resolvedId) return null
      return {
        id: resolvedId,
        name: port?.name || 'No info',
        country: port?.country || 'No info',
        activity: port?.activity || 'No info',
        risk: 'Medium',
        updatedAt: 'Just now',
      }
    })
    const existingFavoritePortIds = new Set(
      favoritePorts.map((port) => String(port?.id || '').trim())
    )
    portsToFavorite.forEach((port) => {
      if (!port?.id || existingFavoritePortIds.has(port.id)) return
      toggleFavoritePort(port)
      existingFavoritePortIds.add(port.id)
    })

    const existingPrototypeNames = new Set(
      version2PrototypePortRows.map((row) => (row.name || '').toLowerCase())
    )
    const prototypePortsToAdd = version2PendingPorts.filter((port) => {
      const normalizedName = (port.name || '').toLowerCase()
      const mappedPortId = PROTOTYPE_PORT_ID_BY_NAME[normalizedName]
      const resolvedPortId = String(
        mappedPortId || port.id || port.sourcePortId || port.optionId || ''
      ).trim()
      const alreadyFavorited = favoritePorts.some(
        (favoritePort) =>
          String(favoritePort?.id || '').trim() === resolvedPortId
      )
      if (alreadyFavorited) return false
      if (existingPrototypeNames.has(normalizedName)) return false
      existingPrototypeNames.add(normalizedName)
      return true
    })

    if (prototypePortsToAdd.length > 0) {
      setVersion2PrototypePortRows((prev) => [
        ...prev,
        ...prototypePortsToAdd.map((port) => ({
          id: `proto-port-row-${port.optionId}`,
          sourcePortId: String(
            PROTOTYPE_PORT_ID_BY_NAME[
              String(port.name || '')
                .trim()
                .toLowerCase()
            ] ||
              port.id ||
              port.sourcePortId ||
              port.optionId ||
              ''
          ).trim(),
          name: port.name || 'No info',
          country: port.country || 'No info',
          activity: port.activity || 'No info',
          risk: 'Medium',
          updatedAt: 'Just now',
          entityType: 'Port',
          description: `${port.country || 'No info'} • ${port.activity || 'No info'}`,
          status: 'Monitoring',
        })),
      ])
    }

    if (isVersion6) {
      version2PendingPorts.forEach((port) => {
        const portName = port.name || 'Unknown port'
        const country = port.country || 'Unknown'
        const activity = port.activity || 'Monitoring'
        pushVersion6RecentActivity({
          activityKey: `port-${port.optionId}`,
          id: `recent-v6-port-${port.optionId}`,
          entityType: 'Port',
          name: portName,
          ctry: country,
          locode: port.locode || 'No info',
          type: activity,
          status: 'Monitoring',
          lastViewed: 'Just now',
        })
      })
    }

    setVersion2PendingPorts([])
    setVersion2PortQuery('')
    setVersion2PortSearchResults([])
    setVersion2Mode('ports-list')
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('ports')
  }

  useEffect(() => {
    if (!isVersion2Or3Or4Or5) {
      setVersion2Mode('empty')
      setVersion2SelectedFlow(null)
      setVersion2HoveredFlow(null)
      setVersion2ShipQuery('')
      setVersion2SearchResults([])
      setVersion2IsSearching(false)
      setVersion2PendingShips([])
      setVersion2PortQuery('')
      setVersion2PortSearchResults([])
      setVersion2IsPortSearching(false)
      setVersion2PendingPorts([])
      setVersion2PrototypeShipRows([])
      setVersion2PrototypePortRows([])
      setVersion2HasAddedBookmarks(false)
      if (version2SearchTimerRef.current) {
        window.clearTimeout(version2SearchTimerRef.current)
        version2SearchTimerRef.current = null
      }
    }
  }, [isVersion2Or3Or4Or5])

  useEffect(() => {
    if (isVersion3Or4Or5 && version2Mode === 'empty') {
      setVersion2Mode('add-options')
    }
  }, [isVersion3Or4Or5, version2Mode])

  useEffect(() => {
    if (isVersion5 && version2Mode === 'alerts') {
      setVersion2Mode('add-options')
    }
  }, [isVersion5, version2Mode])

  useEffect(() => {
    setVersion2UploadError('')
    setVersion2UploadedFileName('')
    if (isVersion5ShapeMode) {
      setVersion2UploadTarget('shapes')
      return
    }
    setVersion2UploadTarget('ships-ports')
  }, [isVersion5ShapeMode, version2Mode])

  useEffect(() => {
    if (isVersion6) return
    setVersion6RecentActivityRows([])
    version6LastSelectedDetectionRef.current = null
  }, [isVersion6])

  useEffect(() => {
    if (!isVersion6 || !selectedDetectionId) return
    if (version6LastSelectedDetectionRef.current === selectedDetectionId) return
    version6LastSelectedDetectionRef.current = selectedDetectionId

    const selectedDetection = runtimeDetections.find(
      (detection) => String(detection.id) === String(selectedDetectionId)
    )
    if (!selectedDetection) return

    pushVersion6RecentActivity({
      activityKey: `event-${selectedDetection.id}`,
      id: `recent-v6-event-${selectedDetection.id}`,
      entityType: 'Event',
      event: `${String(selectedDetection.type || 'event')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())} Event`,
      ship:
        shipLookup[selectedDetection.shipId]?.name ||
        selectedDetection.shipId ||
        'Unknown ship',
      flag: shipLookup[selectedDetection.shipId]?.flag || '-',
      date: selectedDetection.date || 'Just now',
      lastViewed: 'Just now',
    })
  }, [
    isVersion6,
    pushVersion6RecentActivity,
    runtimeDetections,
    selectedDetectionId,
    shipLookup,
  ])

  useEffect(() => {
    if (!isVersion3Or4Or5) {
      previousFavoriteShipCountRef.current = favoriteShipIds.length
      previousFavoritePortCountRef.current = favoritePorts.length
      return
    }

    const previousCount = previousFavoritePortCountRef.current
    const currentCount = favoritePorts.length
    previousFavoritePortCountRef.current = currentCount

    if (currentCount <= previousCount) return

    setVersion2HasAddedBookmarks(true)
    setVersion2SelectedFlow(null)
    setVersion2HoveredFlow(null)
    setVersion2Mode('ports-list')
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('ports')
  }, [favoritePorts, isVersion3Or4Or5])

  useEffect(() => {
    if (!isVersion3Or4Or5) {
      previousFavoriteShipCountRef.current = favoriteShipIds.length
      return
    }

    const previousCount = previousFavoriteShipCountRef.current
    const currentCount = favoriteShipIds.length
    previousFavoriteShipCountRef.current = currentCount

    if (currentCount <= previousCount) return

    setVersion2HasAddedBookmarks(true)
    setVersion2SelectedFlow(null)
    setVersion2HoveredFlow(null)
    setVersion2Mode('ships-list')
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('ships')
  }, [favoriteShipIds, isVersion3Or4Or5])

  useEffect(
    () => () => {
      if (version2SearchTimerRef.current) {
        window.clearTimeout(version2SearchTimerRef.current)
      }
    },
    []
  )

  useEffect(() => {
    if (!isResizing) return undefined

    const handleMouseMove = (event) => {
      const deltaX = event.clientX - resizeStartXRef.current
      const nextWidth = Math.max(
        SECONDARY_NAV_MIN_WIDTH,
        Math.min(SECONDARY_NAV_MAX_WIDTH, resizeStartWidthRef.current + deltaX)
      )
      setNavWidth(nextWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <Box
      style={{
        width: isOpen && isWatchlistView ? navWidth : isWatchlistView ? 32 : 0,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: isResizing ? 'none' : 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isWatchlistView ? '1px solid #393c56' : 'none',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && isWatchlistView && (
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

      {isOpen && isWatchlistView && (
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
            borderBottom: '1px solid #393C56',
            height: 50,
          }}
        >
          {TOP_LEVEL_TABS.map((tab) => (
            <Box
              key={tab.id}
              onClick={() => setActiveTopTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderBottom:
                  activeTopTab === tab.id ? '2px solid #fff' : 'none',
                color: activeTopTab === tab.id ? '#fff' : '#888F9E',
                fontWeight: activeTopTab === tab.id ? 600 : 400,
                fontSize: 14,
              }}
            >
              {tab.id === 'my-watchlist' ? topTabWatchlistLabel : tab.label}
            </Box>
          ))}
        </Box>
        {activeTopTab === 'my-watchlist' &&
          !isVersion2Or3Or4Or5 &&
          !showVersion1Onboarding && (
            <Box
              className="no-scrollbar"
              style={{
                padding: '12px 20px 10px',
                overflowX: 'auto',
                overflowY: 'hidden',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  width: 'max-content',
                  paddingBottom: 2,
                }}
              >
                {WATCHLIST_SUB_TABS.map((tab) => (
                  <Box
                    key={tab.id}
                    onClick={() => setActiveWatchlistTab(tab.id)}
                    style={{
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      border: `1px solid ${activeWatchlistTab === tab.id ? '#0094FF' : '#4B4F70'}`,
                      background:
                        activeWatchlistTab === tab.id ? '#0A3F73' : '#252845',
                      borderRadius: 4,
                      padding: '6px 20px',
                      fontSize: 12,
                      fontWeight: 400,
                      lineHeight: '18px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition:
                        'background-color 120ms ease, border-color 120ms ease',
                    }}
                  >
                    {tab.label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

        <Box
          style={{
            padding: 0,
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {isVersion2Or3Or4Or5 ? (
            activeTopTab === 'recently-viewed' &&
            isVersion6 &&
            version6HasRecentActivity ? (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '24px 20px 20px',
                }}
              >
                {version6RecentlyViewedSections
                  .filter((section) => section.rows.length > 0)
                  .map((section) => (
                    <Box key={`v6-recent-${section.id}`}>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        {section.id === 'ships' ? (
                          <ShipIcon
                            style={{
                              width: 16,
                              height: 16,
                            }}
                          />
                        ) : section.id === 'ports' ? (
                          <Box
                            component="img"
                            src={AnchorIcon}
                            alt=""
                            style={{
                              width: 16,
                              height: 16,
                              display: 'block',
                            }}
                          />
                        ) : section.id === 'polygons' ? (
                          <BezierCurve03 size={16} color="#FFFFFF" />
                        ) : section.id === 'events' ? (
                          <List size={16} color="#FFFFFF" />
                        ) : null}
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {section.rows.length} {section.title}
                        </Text>
                      </Box>
                      <DataTable
                        rows={section.rows}
                        columns={
                          version6RecentlyViewedColumnsBySection[section.id]
                        }
                        emptyMessage={`No recently viewed ${section.title.toLowerCase()} yet.`}
                        onRowClick={
                          section.id === 'ships'
                            ? handleShipRowClick
                            : section.id === 'ports'
                              ? handlePortRowClick
                              : undefined
                        }
                      />
                    </Box>
                  ))}
              </Box>
            ) : activeTopTab === 'my-watchlist' && version2Mode === 'ships' ? (
              <Box
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {version2Mode === 'alerts' && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((step) => (
                      <Box
                        key={`alerts-step-${step}`}
                        style={{
                          flex: 1,
                          height: 14,
                          borderRadius: 999,
                          background: step === 0 ? '#006CD7' : '#0B4D73',
                          opacity: step === 0 ? 1 : 0.45,
                        }}
                      />
                    ))}
                  </Box>
                )}
                {isVersion7 && isVersion4Or5 && showQuickAddBanner && (
                  <Box
                    style={{
                      marginBottom: 10,
                      borderRadius: 6,
                      border: '1px solid #AD8B37',
                      background: 'rgba(255, 207, 92, 0.1)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      position: 'relative',
                    }}
                  >
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        background: '#181926',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <Star01
                        className={`quick-add-banner-star${
                          isOpen ? ' quick-add-banner-star--animate' : ''
                        }`}
                        style={{
                          width: 16,
                          height: 16,
                        }}
                      />
                      <svg
                        className={`quick-add-banner-cursor${
                          isOpen ? ' quick-add-banner-cursor--animate' : ''
                        }`}
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.15823 1.16501C1.69998 1.03023 1.47086 0.962837 1.31485 1.02099C1.1789 1.07167 1.07167 1.1789 1.02099 1.31485C0.962837 1.47086 1.03023 1.69998 1.16501 2.15823L5.37091 16.4583C5.49615 16.8841 5.55878 17.097 5.68517 17.1959C5.79546 17.2821 5.93686 17.3182 6.07499 17.2953C6.23328 17.269 6.39022 17.1121 6.70408 16.7982L9.75116 13.7512L14.1855 18.1855C14.3835 18.3835 14.4825 18.4825 14.5967 18.5196C14.6971 18.5522 14.8052 18.5522 14.9057 18.5196C15.0198 18.4825 15.1188 18.3835 15.3168 18.1855L18.1855 15.3168C18.3835 15.1188 18.4825 15.0198 18.5196 14.9057C18.5522 14.8052 18.5522 14.6971 18.5196 14.5967C18.4825 14.4825 18.3835 14.3835 18.1855 14.1855L13.7512 9.75116L16.7982 6.70408C17.1121 6.39022 17.269 6.23328 17.2953 6.07499C17.3182 5.93686 17.2821 5.79546 17.1959 5.68517C17.097 5.55878 16.8841 5.49615 16.4583 5.37091L2.15823 1.16501Z"
                          fill="white"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>
                    <Box style={{ minWidth: 0, paddingRight: 26 }}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          lineHeight: '18px',
                          fontWeight: 600,
                          letterSpacing: 0.4,
                          textTransform: 'none',
                          textAlign: 'left',
                          marginBottom: 2,
                        }}
                      >
                        Quick add
                      </Text>
                      <Text
                        style={{
                          color: '#8D93A8',
                          fontSize: 12,
                          lineHeight: '16px',
                          fontWeight: 500,
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Tap star on ship or ports details to bookmark.
                      </Text>
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setShowQuickAddBanner(false)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 10,
                        border: 'none',
                        background: 'transparent',
                        color: '#FFFFFF',
                        width: 16,
                        height: 16,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      aria-label="Dismiss quick add banner"
                    >
                      <XClose size={14} color="#FFFFFF" />
                    </Box>
                  </Box>
                )}
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                    marginBottom: 4,
                  }}
                >
                  Add Ships
                </Text>
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 12,
                    lineHeight: '18px',
                    marginBottom: 12,
                  }}
                >
                  Search by ship name, IMO, or MMSI and choose ships to watch.
                </Text>
                <Box
                  style={{
                    border: '1px solid #393C56',
                    borderRadius: 6,
                    background: '#0A0E19',
                    marginBottom: 10,
                    padding: '0 10px',
                    position: 'relative',
                  }}
                >
                  <Box
                    component="input"
                    className="secondary-nav-text-input"
                    value={version2ShipQuery}
                    onChange={(event) => {
                      const nextQuery = event.currentTarget.value
                      setVersion2ShipQuery(nextQuery)
                      if (version2SearchTimerRef.current) {
                        window.clearTimeout(version2SearchTimerRef.current)
                        version2SearchTimerRef.current = null
                      }
                      setVersion2IsSearching(false)
                      setVersion2SearchResults([])
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      if (!hasVersion2ShipQuery || version2IsSearching) return
                      const submittedQuery = cleanedVersion2ShipQuery
                      setVersion2IsSearching(true)
                      setVersion2SearchResults([])
                      if (version2SearchTimerRef.current) {
                        window.clearTimeout(version2SearchTimerRef.current)
                      }
                      version2SearchTimerRef.current = window.setTimeout(() => {
                        setVersion2SearchResults(
                          buildVersion2SearchResults(submittedQuery)
                        )
                        setVersion2IsSearching(false)
                        setVersion2ShipQuery('')
                        version2SearchTimerRef.current = null
                      }, 2000)
                    }}
                    placeholder="Search ships, IMO, or MMSI"
                    style={{
                      width: '100%',
                      height: 34,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#FFFFFF',
                      fontSize: 12,
                      paddingRight: 26,
                    }}
                  />
                  {version2IsSearching && (
                    <Box
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Loader size={14} color="#8D93A8" />
                    </Box>
                  )}
                </Box>
                {isVersion5 &&
                  (!isVersion6 || version2DisplaySearchRows.length === 0) && (
                    <>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginTop: 2,
                          marginBottom: 10,
                        }}
                      >
                        <Box
                          style={{ flex: 1, height: 1, background: '#393C56' }}
                        />
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 11,
                            lineHeight: '12px',
                          }}
                        >
                          or
                        </Text>
                        <Box
                          style={{ flex: 1, height: 1, background: '#393C56' }}
                        />
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onMouseEnter={() =>
                          setVersion2HoveredFlow('upload-file')
                        }
                        onMouseLeave={() => setVersion2HoveredFlow(null)}
                        onClick={() => openVersion2UploadPicker('ships-ports')}
                        style={{
                          display: 'flex',
                          width: '100%',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: isVersion6 ? 14 : 10,
                          border: `1px solid ${isVersion3UploadHovered ? '#006CD7' : '#393C56'}`,
                          borderRadius: 6,
                          background: isVersion3UploadHovered
                            ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                            : '#24263C',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: '14px',
                          padding: isVersion6 ? 8 : '12px 14px',
                          cursor: 'pointer',
                          marginBottom: 6,
                        }}
                      >
                        {renderVersion2UploadIcon()}
                        <Box style={{ minWidth: 0, textAlign: 'left' }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 600,
                              lineHeight: '16px',
                            }}
                          >
                            Upload file for Ships
                          </Text>
                          <Text
                            style={{
                              color: '#8D93A8',
                              fontSize: 11,
                              fontWeight: 600,
                              lineHeight: '14px',
                            }}
                          >
                            .csv, .xls, .xlsx
                          </Text>
                        </Box>
                      </Box>
                      {version2UploadedFileName && (
                        <Text
                          style={{
                            color: '#A0A6BC',
                            fontSize: 11,
                            lineHeight: '16px',
                            marginBottom: 8,
                          }}
                        >
                          Selected for {uploadTargetLabel}:{' '}
                          {version2UploadedFileName}
                        </Text>
                      )}
                      {version2UploadError && (
                        <Text
                          style={{
                            color: '#FF8B8B',
                            fontSize: 11,
                            lineHeight: '16px',
                            marginBottom: 8,
                          }}
                        >
                          {version2UploadError}
                        </Text>
                      )}
                      {!isVersion7 && (
                        <Box
                          style={{
                            marginBottom: 10,
                            borderRadius: 6,
                            border: '1px solid #393C56',
                            background: '#24263C',
                            padding: isVersion6 ? 8 : '12px 14px',
                            display: 'flex',
                            alignItems: isVersion6 ? 'center' : 'flex-start',
                            gap: isVersion6 ? 14 : 10,
                          }}
                        >
                          {renderVersion2TipStarIcon()}
                          <Text
                            style={{
                              color: '#8D93A8',
                              fontSize: 12,
                              lineHeight: '18px',
                              fontWeight: 500,
                            }}
                          >
                            Tap the star on any ship or port detail page to add
                            it instantly.
                          </Text>
                        </Box>
                      )}
                    </>
                  )}
                <Box style={{ flex: 1, minHeight: 0 }}>
                  {version2DisplaySearchRows.length > 0 && (
                    <Box
                      style={{
                        height: '100%',
                        minHeight: 0,
                        overflowY: 'auto',
                        paddingRight: 2,
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        {version2DisplaySearchRows.map((ship) => {
                          const normalizedShipName = String(ship?.name || '')
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '')
                          const resolvedShipId = String(
                            ship?.baseShipId ||
                              shipIdByNormalizedName.get(normalizedShipName) ||
                              ''
                          ).trim()
                          const isAlreadyBookmarked =
                            (resolvedShipId &&
                              bookmarkedShipIds.has(resolvedShipId)) ||
                            bookmarkedShipNameTokens.has(normalizedShipName)
                          const isSelected = version2PendingShipIds.has(
                            ship.optionId
                          )
                          return (
                            <Box
                              key={ship.optionId}
                              style={{
                                border: `1px solid ${
                                  isAlreadyBookmarked
                                    ? '#3C4164'
                                    : isSelected
                                      ? '#006CD7'
                                      : '#3C4164'
                                }`,
                                borderRadius: 6,
                                background: isAlreadyBookmarked
                                  ? '#20233A'
                                  : isSelected
                                    ? '#203B5A'
                                    : '#252845',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                                opacity: isAlreadyBookmarked ? 0.86 : 1,
                              }}
                            >
                              <Box style={{ minWidth: 0 }}>
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    lineHeight: '16px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {ship.name || 'Unknown ship'}
                                  {isAlreadyBookmarked && (
                                    <Text
                                      component="span"
                                      style={{
                                        color: '#F75349',
                                        fontSize: 11,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {' '}
                                      — Already bookmarked
                                    </Text>
                                  )}
                                </Text>
                                <Text
                                  style={{
                                    color: '#A0A6BC',
                                    fontSize: 11,
                                    lineHeight: '16px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  IMO: {ship.imo || 'No info'} • MMSI:{' '}
                                  {ship.mmsi || 'No info'}
                                </Text>
                              </Box>
                              <Box
                                component="input"
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isAlreadyBookmarked) return
                                  handleVersion2ShipToggle(ship)
                                }}
                                disabled={isAlreadyBookmarked}
                                style={{
                                  width: 16,
                                  height: 16,
                                  margin: 0,
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  borderRadius: 3,
                                  border: `1px solid ${isSelected ? '#006CD7' : '#393C56'}`,
                                  background: isSelected
                                    ? '#006CD7'
                                    : '#0A0E19',
                                  backgroundImage: isSelected
                                    ? 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27none%27%3E%3Cpath d=%27M3.5 8.2L6.6 11.1L12.5 4.9%27 stroke=%27%23FFFFFF%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")'
                                    : 'none',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  backgroundSize: '12px 12px',
                                  cursor: isAlreadyBookmarked
                                    ? 'not-allowed'
                                    : 'pointer',
                                  flexShrink: 0,
                                  opacity: isAlreadyBookmarked ? 0.55 : 1,
                                }}
                              />
                            </Box>
                          )
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
                <Box
                  style={{
                    marginTop: 'auto',
                    paddingTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      if (version2SearchTimerRef.current) {
                        window.clearTimeout(version2SearchTimerRef.current)
                        version2SearchTimerRef.current = null
                      }
                      setVersion2IsSearching(false)
                      setVersion2ShipQuery('')
                      setVersion2SearchResults([])
                      setVersion2PendingShips([])
                      setVersion2Mode('add-options')
                    }}
                    style={{
                      height: 32,
                      borderRadius: 4,
                      border: '1px solid #FFFFFF',
                      background: 'transparent',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      padding: '0 12px',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={handleVersion2SubmitShips}
                    disabled={version2PendingCount === 0}
                    style={{
                      marginLeft: 'auto',
                      height: 32,
                      borderRadius: 4,
                      border: 'none',
                      background:
                        version2PendingCount > 0 ? '#006CD7' : '#3A3E5E',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      padding: '0 12px',
                      cursor:
                        version2PendingCount > 0 ? 'pointer' : 'not-allowed',
                      opacity: version2PendingCount > 0 ? 1 : 0.8,
                    }}
                  >
                    {version2SubmitLabel}
                  </Box>
                </Box>
              </Box>
            ) : activeTopTab === 'my-watchlist' &&
              (version2Mode === 'ports' ||
                version2Mode === 'polygons' ||
                version2Mode === 'alerts') ? (
              <Box
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {version2Mode === 'ports' &&
                  isVersion7 &&
                  isVersion4Or5 &&
                  showQuickAddBanner && (
                    <Box
                      style={{
                        marginBottom: 10,
                        borderRadius: 6,
                        border: '1px solid #AD8B37',
                        background: 'rgba(255, 207, 92, 0.1)',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        position: 'relative',
                      }}
                    >
                      <Box
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 4,
                          background: '#181926',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                          overflow: 'visible',
                        }}
                      >
                        <Star01
                          className={`quick-add-banner-star${
                            isOpen ? ' quick-add-banner-star--animate' : ''
                          }`}
                          style={{
                            width: 16,
                            height: 16,
                          }}
                        />
                        <svg
                          className={`quick-add-banner-cursor${
                            isOpen ? ' quick-add-banner-cursor--animate' : ''
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.15823 1.16501C1.69998 1.03023 1.47086 0.962837 1.31485 1.02099C1.1789 1.07167 1.07167 1.1789 1.02099 1.31485C0.962837 1.47086 1.03023 1.69998 1.16501 2.15823L5.37091 16.4583C5.49615 16.8841 5.55878 17.097 5.68517 17.1959C5.79546 17.2821 5.93686 17.3182 6.07499 17.2953C6.23328 17.269 6.39022 17.1121 6.70408 16.7982L9.75116 13.7512L14.1855 18.1855C14.3835 18.3835 14.4825 18.4825 14.5967 18.5196C14.6971 18.5522 14.8052 18.5522 14.9057 18.5196C15.0198 18.4825 15.1188 18.3835 15.3168 18.1855L18.1855 15.3168C18.3835 15.1188 18.4825 15.0198 18.5196 14.9057C18.5522 14.8052 18.5522 14.6971 18.5196 14.5967C18.4825 14.4825 18.3835 14.3835 18.1855 14.1855L13.7512 9.75116L16.7982 6.70408C17.1121 6.39022 17.269 6.23328 17.2953 6.07499C17.3182 5.93686 17.2821 5.79546 17.1959 5.68517C17.097 5.55878 16.8841 5.49615 16.4583 5.37091L2.15823 1.16501Z"
                            fill="white"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                      <Box style={{ minWidth: 0, paddingRight: 26 }}>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 13,
                            lineHeight: '18px',
                            fontWeight: 600,
                            letterSpacing: 0.4,
                            textTransform: 'none',
                            textAlign: 'left',
                            marginBottom: 2,
                          }}
                        >
                          Quick add
                        </Text>
                        <Text
                          style={{
                            color: '#8D93A8',
                            fontSize: 12,
                            lineHeight: '16px',
                            fontWeight: 500,
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Tap star on ship or ports details to bookmark.
                        </Text>
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setShowQuickAddBanner(false)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 10,
                          border: 'none',
                          background: 'transparent',
                          color: '#FFFFFF',
                          width: 16,
                          height: 16,
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        aria-label="Dismiss quick add banner"
                      >
                        <XClose size={14} color="#FFFFFF" />
                      </Box>
                    </Box>
                  )}
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                    marginBottom: 4,
                  }}
                >
                  {version2Mode === 'polygons'
                    ? `Add ${polygonEntityLabelSingular}`
                    : version2Mode === 'alerts'
                      ? 'Add Alerts'
                      : 'Add Ports'}
                </Text>
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 12,
                    lineHeight: '18px',
                    marginBottom: 12,
                  }}
                >
                  {version2Mode === 'alerts'
                    ? 'Select the ship(s) you’d like to be alerted with.'
                    : version2Mode === 'polygons'
                      ? pendingShape
                        ? `Name your ${polygonEntityLabelSingular.toLowerCase()} and save it to bookmarks.`
                        : shapeDrawMode
                          ? `Draw your ${polygonEntityLabelSingular.toLowerCase()} on the map.`
                          : `Create a ${polygonEntityLabelLowerPlural.slice(0, -1)} by:`
                      : 'Search by port name, Locode, or country and choose ports to watch.'}
                </Text>
                {version2Mode === 'alerts' && (
                  <Box style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: '18px',
                        marginBottom: 6,
                      }}
                    >
                      Search For Ship(s)
                    </Text>
                    <Box
                      component="select"
                      value={version2AlertShipSearchValue}
                      onChange={(event) =>
                        setVersion2AlertShipSearchValue(
                          event.currentTarget.value
                        )
                      }
                      style={{
                        width: '100%',
                        height: 34,
                        border: '1px solid #393C56',
                        borderRadius: 6,
                        background: '#0A0E19',
                        color: version2AlertShipSearchValue
                          ? '#FFFFFF'
                          : '#8D93A8',
                        fontSize: 12,
                        padding: '0 30px 0 10px',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238D93A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                    >
                      <option value="">
                        Search by name, SynMax ship ID, IMO, or MMSI
                      </option>
                      {myShipRows.map((ship) => (
                        <option key={`alert-search-${ship.id}`} value={ship.id}>
                          {ship.name || 'Unknown ship'}
                        </option>
                      ))}
                      <option value="any-ship">Any ship</option>
                    </Box>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: '18px',
                        marginTop: 12,
                        marginBottom: 6,
                      }}
                    >
                      Import From My Ships
                    </Text>
                    <Box
                      component="select"
                      value={version2AlertMyShipValue}
                      onChange={(event) =>
                        setVersion2AlertMyShipValue(event.currentTarget.value)
                      }
                      style={{
                        width: '100%',
                        height: 34,
                        border: '1px solid #393C56',
                        borderRadius: 6,
                        background: '#0A0E19',
                        color: version2AlertMyShipValue ? '#FFFFFF' : '#8D93A8',
                        fontSize: 12,
                        padding: '0 30px 0 10px',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238D93A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                    >
                      <option value="">Select</option>
                      {version2MyWatchlistShipRows.map((ship) => (
                        <option key={`alert-import-${ship.id}`} value={ship.id}>
                          {ship.name || 'Unknown ship'}
                        </option>
                      ))}
                    </Box>
                  </Box>
                )}
                {version2Mode === 'polygons' &&
                  shapeDrawMode &&
                  !pendingShape && (
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <Box
                        style={{
                          borderRadius: 6,
                          border: '1px solid #006CD7',
                          background: 'rgba(0,108,215,0.1)',
                          padding: '12px 14px',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: '18px',
                            marginBottom: 6,
                          }}
                        >
                          Drawing on the map
                        </Text>
                        <Text
                          style={{
                            color: '#8D93A8',
                            fontSize: 12,
                            lineHeight: '17px',
                          }}
                        >
                          Click on the map to drop points. Click the first point
                          again or double-click to finish. Press Esc to cancel.
                        </Text>
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onClick={handleCancelShapeDraw}
                        style={{
                          height: 34,
                          borderRadius: 6,
                          border: '1px solid #FFFFFF',
                          background: 'transparent',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: '14px',
                          padding: '0 12px',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        Cancel
                      </Box>
                    </Box>
                  )}
                {version2Mode === 'polygons' && pendingShape && (
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: '18px',
                      }}
                    >
                      {`${polygonEntityLabelSingular} name`}
                    </Text>
                    <Box
                      style={{
                        border: '1px solid #393C56',
                        borderRadius: 6,
                        background: '#0A0E19',
                        padding: '0 10px',
                      }}
                    >
                      <Box
                        component="input"
                        className="secondary-nav-text-input"
                        autoFocus
                        value={shapeNameInput}
                        onChange={(event) =>
                          setShapeNameInput(event.currentTarget.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            handleSaveShape()
                          }
                        }}
                        placeholder={`Name your ${polygonEntityLabelSingular.toLowerCase()}`}
                        style={{
                          width: '100%',
                          height: 34,
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          color: '#FFFFFF',
                          fontSize: 12,
                        }}
                      />
                    </Box>
                    <Box style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      <Box
                        component="button"
                        type="button"
                        onClick={handleSaveShape}
                        style={{
                          height: 34,
                          borderRadius: 6,
                          border: 'none',
                          background: '#006CD7',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: '14px',
                          padding: '0 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Save to bookmarks
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onClick={handleCancelShapeDraw}
                        style={{
                          height: 34,
                          borderRadius: 6,
                          border: '1px solid #FFFFFF',
                          background: 'transparent',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: '14px',
                          padding: '0 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </Box>
                    </Box>
                  </Box>
                )}
                {version2Mode === 'polygons' &&
                  !shapeDrawMode &&
                  !pendingShape && (
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      marginBottom: 12,
                    }}
                  >
                    {[
                      {
                        id: 'shape',
                        label: isVersion5 ? 'Draw A Shape' : 'Draw A Polygon',
                        icon: <PolygonIcon />,
                        description: isVersion5
                          ? 'Create a custom area'
                          : 'Create a custom polygon',
                      },
                      {
                        id: 'rectangle',
                        label: 'Draw A Rectangle',
                        icon: <RectangleIcon />,
                        description: 'Create a rectangular area',
                      },
                      {
                        id: 'circle',
                        label: 'Draw A Circle',
                        icon: <CircleIcon />,
                        description: 'Create a circular area',
                      },
                    ].map((item) => {
                      const drawCardHoverId = `draw-${item.id}`
                      const isHovered = version2HoveredFlow === drawCardHoverId

                      return (
                        <Box
                          key={item.label}
                          component="button"
                          type="button"
                          onMouseEnter={() =>
                            setVersion2HoveredFlow(drawCardHoverId)
                          }
                          onMouseLeave={() => setVersion2HoveredFlow(null)}
                          onClick={() => {
                            if (item.id === 'shape') {
                              setShapeNameInput('')
                              startShapeDraw('polygon')
                            }
                          }}
                          style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: isVersion6 ? 14 : 10,
                            border: `1px solid ${isHovered ? '#006CD7' : '#393C56'}`,
                            borderRadius: 6,
                            background: isHovered
                              ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                              : '#24263C',
                            color: '#FFFFFF',
                            padding: isVersion6 ? 8 : '12px 14px',
                            cursor: 'pointer',
                          }}
                        >
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 4,
                              background: '#181926',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box style={{ minWidth: 0, textAlign: 'left' }}>
                            <Text
                              style={{
                                color: '#FFFFFF',
                                fontSize: 12,
                                fontWeight: 600,
                                lineHeight: '16px',
                              }}
                            >
                              {item.label}
                            </Text>
                            <Text
                              style={{
                                color: '#8D93A8',
                                fontSize: 11,
                                fontWeight: 500,
                                lineHeight: '14px',
                              }}
                            >
                              {item.description}
                            </Text>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                )}
                {isVersion5 &&
                  version2Mode === 'polygons' &&
                  !shapeDrawMode &&
                  !pendingShape && (
                  <>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 2,
                        marginBottom: 10,
                      }}
                    >
                      <Box
                        style={{ flex: 1, height: 1, background: '#393C56' }}
                      />
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 11,
                          lineHeight: '12px',
                        }}
                      >
                        or
                      </Text>
                      <Box
                        style={{ flex: 1, height: 1, background: '#393C56' }}
                      />
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onMouseEnter={() => setVersion2HoveredFlow('upload-file')}
                      onMouseLeave={() => setVersion2HoveredFlow(null)}
                      onClick={() => openVersion2UploadPicker('shapes')}
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: isVersion6 ? 14 : 10,
                        border: `1px solid ${isVersion3UploadHovered ? '#006CD7' : '#393C56'}`,
                        borderRadius: 6,
                        background: isVersion3UploadHovered
                          ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                          : '#24263C',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '14px',
                        padding: isVersion6 ? 8 : '12px 14px',
                        cursor: 'pointer',
                        marginBottom: 6,
                      }}
                    >
                      {renderVersion2UploadIcon()}
                      <Box style={{ minWidth: 0, textAlign: 'left' }}>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: '16px',
                          }}
                        >
                          Upload file for Shapes
                        </Text>
                        <Text
                          style={{
                            color: '#8D93A8',
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: '14px',
                          }}
                        >
                          .json, .geojson
                        </Text>
                      </Box>
                    </Box>
                    {version2UploadedFileName && (
                      <Text
                        style={{
                          color: '#A0A6BC',
                          fontSize: 11,
                          lineHeight: '16px',
                          marginBottom: 8,
                        }}
                      >
                        Selected for {uploadTargetLabel}:{' '}
                        {version2UploadedFileName}
                      </Text>
                    )}
                    {version2UploadError && (
                      <Text
                        style={{
                          color: '#FF8B8B',
                          fontSize: 11,
                          lineHeight: '16px',
                          marginBottom: 8,
                        }}
                      >
                        {version2UploadError}
                      </Text>
                    )}
                  </>
                )}
                {version2Mode === 'ports' && (
                  <Box
                    style={{
                      border: '1px solid #393C56',
                      borderRadius: 6,
                      background: '#0A0E19',
                      marginBottom: 10,
                      padding: '0 10px',
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="input"
                      className="secondary-nav-text-input"
                      value={version2PortQuery}
                      onChange={(event) => {
                        const nextQuery = event.currentTarget.value
                        setVersion2PortQuery(nextQuery)
                        if (version2SearchTimerRef.current) {
                          window.clearTimeout(version2SearchTimerRef.current)
                          version2SearchTimerRef.current = null
                        }
                        setVersion2IsPortSearching(false)
                        setVersion2PortSearchResults([])
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return
                        event.preventDefault()
                        if (!hasVersion2PortQuery || version2IsPortSearching)
                          return
                        const submittedQuery = cleanedVersion2PortQuery
                        setVersion2IsPortSearching(true)
                        setVersion2PortSearchResults([])
                        if (version2SearchTimerRef.current) {
                          window.clearTimeout(version2SearchTimerRef.current)
                        }
                        version2SearchTimerRef.current = window.setTimeout(
                          () => {
                            setVersion2PortSearchResults(
                              buildVersion2PortSearchResults(submittedQuery)
                            )
                            setVersion2IsPortSearching(false)
                            setVersion2PortQuery('')
                            version2SearchTimerRef.current = null
                          },
                          2000
                        )
                      }}
                      placeholder="Search ports, Locode, or country"
                      style={{
                        width: '100%',
                        height: 34,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: '#FFFFFF',
                        fontSize: 12,
                        paddingRight: 26,
                      }}
                    />
                    {version2IsPortSearching && (
                      <Box
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Loader size={14} color="#8D93A8" />
                      </Box>
                    )}
                  </Box>
                )}
                {isVersion5 &&
                  version2Mode === 'ports' &&
                  (!isVersion6 ||
                    version2DisplayPortSearchRows.length === 0) && (
                    <>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginTop: 2,
                          marginBottom: 10,
                        }}
                      >
                        <Box
                          style={{ flex: 1, height: 1, background: '#393C56' }}
                        />
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 11,
                            lineHeight: '12px',
                          }}
                        >
                          or
                        </Text>
                        <Box
                          style={{ flex: 1, height: 1, background: '#393C56' }}
                        />
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onMouseEnter={() =>
                          setVersion2HoveredFlow('upload-file')
                        }
                        onMouseLeave={() => setVersion2HoveredFlow(null)}
                        onClick={() => openVersion2UploadPicker('ships-ports')}
                        style={{
                          display: 'flex',
                          width: '100%',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: isVersion6 ? 14 : 10,
                          border: `1px solid ${isVersion3UploadHovered ? '#006CD7' : '#393C56'}`,
                          borderRadius: 6,
                          background: isVersion3UploadHovered
                            ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                            : '#24263C',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: '14px',
                          padding: isVersion6 ? 8 : '12px 14px',
                          cursor: 'pointer',
                          marginBottom: 6,
                        }}
                      >
                        {renderVersion2UploadIcon()}
                        <Box style={{ minWidth: 0, textAlign: 'left' }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 600,
                              lineHeight: '16px',
                            }}
                          >
                            Upload file for Ports
                          </Text>
                          <Text
                            style={{
                              color: '#8D93A8',
                              fontSize: 11,
                              fontWeight: 600,
                              lineHeight: '14px',
                            }}
                          >
                            .csv, .xls, .xlsx
                          </Text>
                        </Box>
                      </Box>
                      {version2UploadedFileName && (
                        <Text
                          style={{
                            color: '#A0A6BC',
                            fontSize: 11,
                            lineHeight: '16px',
                            marginBottom: 8,
                          }}
                        >
                          Selected for {uploadTargetLabel}:{' '}
                          {version2UploadedFileName}
                        </Text>
                      )}
                      {version2UploadError && (
                        <Text
                          style={{
                            color: '#FF8B8B',
                            fontSize: 11,
                            lineHeight: '16px',
                            marginBottom: 8,
                          }}
                        >
                          {version2UploadError}
                        </Text>
                      )}
                      {!isVersion7 && (
                        <Box
                          style={{
                            marginBottom: 10,
                            borderRadius: 6,
                            border: '1px solid #393C56',
                            background: '#24263C',
                            padding: isVersion6 ? 8 : '12px 14px',
                            display: 'flex',
                            alignItems: isVersion6 ? 'center' : 'flex-start',
                            gap: isVersion6 ? 14 : 10,
                          }}
                        >
                          {renderVersion2TipStarIcon()}
                          <Text
                            style={{
                              color: '#8D93A8',
                              fontSize: 12,
                              lineHeight: '18px',
                              fontWeight: 500,
                            }}
                          >
                            Tap the star on any ship or port detail page to add
                            it instantly.
                          </Text>
                        </Box>
                      )}
                    </>
                  )}
                <Box style={{ flex: 1, minHeight: 0 }}>
                  {version2Mode === 'ports' &&
                    version2DisplayPortSearchRows.length > 0 && (
                      <Box
                        style={{
                          height: '100%',
                          minHeight: 0,
                          overflowY: 'auto',
                          paddingRight: 2,
                        }}
                      >
                        <Box
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          {version2DisplayPortSearchRows.map((port) => {
                            const normalizedPortName = String(port?.name || '')
                              .trim()
                              .toLowerCase()
                            const resolvedPortId = String(
                              PROTOTYPE_PORT_ID_BY_NAME[normalizedPortName] ||
                                port?.id ||
                                port?.sourcePortId ||
                                port?.optionId ||
                                ''
                            ).trim()
                            const isAlreadyBookmarked =
                              (resolvedPortId &&
                                bookmarkedPortIds.has(resolvedPortId)) ||
                              bookmarkedPortNameTokens.has(normalizedPortName)
                            const isSelected = version2PendingPortIds.has(
                              port.optionId
                            )
                            return (
                              <Box
                                key={port.optionId}
                                style={{
                                  border: `1px solid ${
                                    isAlreadyBookmarked
                                      ? '#3C4164'
                                      : isSelected
                                        ? '#006CD7'
                                        : '#3C4164'
                                  }`,
                                  borderRadius: 6,
                                  background: isAlreadyBookmarked
                                    ? '#20233A'
                                    : isSelected
                                      ? '#203B5A'
                                      : '#252845',
                                  padding: '8px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                  opacity: isAlreadyBookmarked ? 0.86 : 1,
                                }}
                              >
                                <Box style={{ minWidth: 0 }}>
                                  <Text
                                    style={{
                                      color: '#FFFFFF',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      lineHeight: '16px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {port.name || 'Unknown port'}
                                    {isAlreadyBookmarked && (
                                      <Text
                                        component="span"
                                        style={{
                                          color: '#F75349',
                                          fontSize: 11,
                                          fontWeight: 500,
                                        }}
                                      >
                                        {' '}
                                        — Already bookmarked
                                      </Text>
                                    )}
                                  </Text>
                                  <Text
                                    style={{
                                      color: '#A0A6BC',
                                      fontSize: 11,
                                      lineHeight: '16px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    Locode: {port.locode || 'No info'} •{' '}
                                    {port.country || 'No info'}
                                  </Text>
                                </Box>
                                <Box
                                  component="input"
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    !isAlreadyBookmarked &&
                                    handleVersion2PortToggle(port)
                                  }
                                  disabled={isAlreadyBookmarked}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    margin: 0,
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    borderRadius: 3,
                                    border: `1px solid ${isSelected ? '#006CD7' : '#393C56'}`,
                                    background: isSelected
                                      ? '#006CD7'
                                      : '#0A0E19',
                                    backgroundImage: isSelected
                                      ? 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27none%27%3E%3Cpath d=%27M3.5 8.2L6.6 11.1L12.5 4.9%27 stroke=%27%23FFFFFF%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")'
                                      : 'none',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    backgroundSize: '12px 12px',
                                    cursor: isAlreadyBookmarked
                                      ? 'not-allowed'
                                      : 'pointer',
                                    flexShrink: 0,
                                    opacity: isAlreadyBookmarked ? 0.55 : 1,
                                  }}
                                />
                              </Box>
                            )
                          })}
                        </Box>
                      </Box>
                    )}
                </Box>
                <Box
                  style={{
                    marginTop: 'auto',
                    paddingTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      if (version2SearchTimerRef.current) {
                        window.clearTimeout(version2SearchTimerRef.current)
                        version2SearchTimerRef.current = null
                      }
                      setVersion2IsPortSearching(false)
                      setVersion2PortQuery('')
                      setVersion2PortSearchResults([])
                      setVersion2PendingPorts([])
                      setVersion2AlertShipSearchValue('')
                      setVersion2AlertMyShipValue('')
                      setVersion2Mode('add-options')
                    }}
                    style={{
                      height: 32,
                      borderRadius: 4,
                      border: '1px solid #FFFFFF',
                      background: 'transparent',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      padding: '0 12px',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={handleVersion2SubmitPorts}
                    disabled={version2PendingPortCount === 0}
                    style={{
                      marginLeft: 'auto',
                      height: 32,
                      borderRadius: 4,
                      border: 'none',
                      background:
                        version2PendingPortCount > 0 ? '#006CD7' : '#3A3E5E',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      padding: '0 12px',
                      cursor:
                        version2PendingPortCount > 0
                          ? 'pointer'
                          : 'not-allowed',
                      opacity: version2PendingPortCount > 0 ? 1 : 0.8,
                    }}
                  >
                    {version2PortSubmitLabel}
                  </Box>
                </Box>
              </Box>
            ) : activeTopTab === 'my-watchlist' &&
              version2Mode === 'add-options' ? (
              <Box
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {isVersion7 && isVersion4Or5 && showQuickAddBanner && (
                  <Box
                    style={{
                      marginBottom: 10,
                      borderRadius: 6,
                      border: '1px solid #AD8B37',
                      background: 'rgba(255, 207, 92, 0.1)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      position: 'relative',
                    }}
                  >
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        background: '#181926',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <Star01
                        className={`quick-add-banner-star${
                          isOpen ? ' quick-add-banner-star--animate' : ''
                        }`}
                        style={{
                          width: 16,
                          height: 16,
                        }}
                      />
                      <svg
                        className={`quick-add-banner-cursor${
                          isOpen ? ' quick-add-banner-cursor--animate' : ''
                        }`}
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.15823 1.16501C1.69998 1.03023 1.47086 0.962837 1.31485 1.02099C1.1789 1.07167 1.07167 1.1789 1.02099 1.31485C0.962837 1.47086 1.03023 1.69998 1.16501 2.15823L5.37091 16.4583C5.49615 16.8841 5.55878 17.097 5.68517 17.1959C5.79546 17.2821 5.93686 17.3182 6.07499 17.2953C6.23328 17.269 6.39022 17.1121 6.70408 16.7982L9.75116 13.7512L14.1855 18.1855C14.3835 18.3835 14.4825 18.4825 14.5967 18.5196C14.6971 18.5522 14.8052 18.5522 14.9057 18.5196C15.0198 18.4825 15.1188 18.3835 15.3168 18.1855L18.1855 15.3168C18.3835 15.1188 18.4825 15.0198 18.5196 14.9057C18.5522 14.8052 18.5522 14.6971 18.5196 14.5967C18.4825 14.4825 18.3835 14.3835 18.1855 14.1855L13.7512 9.75116L16.7982 6.70408C17.1121 6.39022 17.269 6.23328 17.2953 6.07499C17.3182 5.93686 17.2821 5.79546 17.1959 5.68517C17.097 5.55878 16.8841 5.49615 16.4583 5.37091L2.15823 1.16501Z"
                          fill="white"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>
                    <Box style={{ minWidth: 0, paddingRight: 26 }}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          lineHeight: '18px',
                          fontWeight: 600,
                          letterSpacing: 0.4,
                          textTransform: 'none',
                          textAlign: 'left',
                          marginBottom: 2,
                        }}
                      >
                        Quick add
                      </Text>
                      <Text
                        style={{
                          color: '#8D93A8',
                          fontSize: 12,
                          lineHeight: '16px',
                          fontWeight: 500,
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Tap star on ship or ports details to bookmark.
                      </Text>
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setShowQuickAddBanner(false)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 10,
                        border: 'none',
                        background: 'transparent',
                        color: '#FFFFFF',
                        width: 16,
                        height: 16,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      aria-label="Dismiss quick add banner"
                    >
                      <XClose size={14} color="#FFFFFF" />
                    </Box>
                  </Box>
                )}
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                    marginBottom: 4,
                    textAlign: isVersion2 ? 'center' : 'left',
                  }}
                >
                  {isVersion4Or5
                    ? 'Add bookmarks'
                    : isVersion3
                      ? 'Start tracking'
                      : `Add to ${listCollectionLabel}`}
                </Text>
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 12,
                    lineHeight: '18px',
                    marginBottom: 14,
                    textAlign: isVersion2 ? 'center' : 'left',
                  }}
                >
                  {isVersion3Or4Or5
                    ? isVersion5
                      ? 'Add ships, ports, or shapes to monitor events and activity in one place.'
                      : 'Add ships, ports, or polygons to monitor events and activity in one place.'
                    : 'What would you like to add?'}
                </Text>
                <Box
                  style={
                    isVersion2
                      ? {
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          gap: 12,
                        }
                      : { display: 'flex', flexDirection: 'column', gap: 4 }
                  }
                >
                  {version2AddOptions.map((option) => {
                    const isSelected = version2SelectedFlow === option.id
                    const isHovered = version2HoveredFlow === option.id
                    const icon =
                      option.id === 'ships' ? (
                        <ShipIcon
                          size={version2AddOptionIconSize}
                          color="#FFFFFF"
                        />
                      ) : option.id === 'ports' ? (
                        <Anchor
                          size={version2AddOptionIconSize}
                          color="#FFFFFF"
                        />
                      ) : option.id === 'polygons' ? (
                        <BezierCurve03
                          size={version2AddOptionIconSize}
                          color="#FFFFFF"
                        />
                      ) : (
                        <Bell02
                          size={version2AddOptionIconSize}
                          color="#FFFFFF"
                        />
                      )

                    return (
                      <Box
                        key={option.id}
                        onMouseEnter={() => setVersion2HoveredFlow(option.id)}
                        onMouseLeave={() => setVersion2HoveredFlow(null)}
                        onClick={() => {
                          if (isVersion2 || isVersion3Or4Or5) {
                            setVersion2SelectedFlow(null)
                            setVersion2HoveredFlow(null)
                            handleVersion2Next(option.id)
                            return
                          }
                          setVersion2SelectedFlow(option.id)
                        }}
                        style={{
                          border: `1px solid ${
                            isVersion3Or4Or5
                              ? isHovered
                                ? '#006CD7'
                                : '#393C56'
                              : isSelected
                                ? '#006CD7'
                                : isHovered
                                  ? '#4A5077'
                                  : '#3C4164'
                          }`,
                          borderRadius: 6,
                          background: isVersion3Or4Or5
                            ? isHovered
                              ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                              : '#24263C'
                            : isVersion2
                              ? isHovered
                                ? '#20233A'
                                : '#181926'
                              : isSelected
                                ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #252845'
                                : isHovered
                                  ? '#2A2E4C'
                                  : '#252845',
                          padding: isVersion2 ? '14px 10px' : 8,
                          display: 'flex',
                          flexDirection: isVersion2 ? 'column' : 'row',
                          alignItems: 'center',
                          justifyContent: isVersion2 ? 'center' : 'flex-start',
                          gap: isVersion2 ? 6 : 14,
                          cursor: 'pointer',
                          minHeight: isVersion2 ? 128 : undefined,
                        }}
                      >
                        <Box
                          style={{
                            width: isVersion2 ? 'auto' : 40,
                            height: isVersion2 ? 'auto' : 40,
                            borderRadius: isVersion2 ? 0 : 4,
                            background: isVersion2 ? 'transparent' : '#181926',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {icon}
                        </Box>
                        <Box
                          style={{
                            minWidth: 0,
                            textAlign: isVersion2 ? 'center' : 'left',
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: isVersion2 ? 14 : 13,
                              fontWeight: isVersion2 ? 400 : 600,
                              lineHeight: isVersion2 ? '18px' : '18px',
                              marginBottom: isVersion2 ? 0 : 2,
                            }}
                          >
                            {option.title}
                          </Text>
                          {!isVersion2 && (
                            <Text
                              style={{
                                color: '#A0A6BC',
                                fontSize: 12,
                                lineHeight: isVersion2 ? '18px' : '16px',
                              }}
                            >
                              {option.description}
                            </Text>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
                {isVersion3Or4Or5 && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Box
                      style={{ flex: 1, height: 1, background: '#393C56' }}
                    />
                    <Text
                      style={{
                        color: isVersion3Or4Or5 ? '#FFFFFF' : '#393C56',
                        fontSize: 11,
                        lineHeight: '12px',
                      }}
                    >
                      or
                    </Text>
                    <Box
                      style={{ flex: 1, height: 1, background: '#393C56' }}
                    />
                  </Box>
                )}
                {isVersion3Or4Or5 && isVersion5MixedUploadMode ? (
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onMouseEnter={() =>
                        setVersion2HoveredFlow('upload-file-entities')
                      }
                      onMouseLeave={() => setVersion2HoveredFlow(null)}
                      onClick={() => openVersion2UploadPicker('ships-ports')}
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        border: `1px solid ${
                          isVersion3EntityUploadHovered ? '#006CD7' : '#393C56'
                        }`,
                        borderRadius: 6,
                        background: isVersion3EntityUploadHovered
                          ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                          : '#24263C',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '14px',
                        padding: 8,
                        cursor: 'pointer',
                      }}
                    >
                      {renderVersion2UploadIcon()}
                      <Box style={{ minWidth: 0, textAlign: 'left' }}>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: '16px',
                          }}
                        >
                          Upload file for Ships/Ports
                        </Text>
                        <Text
                          style={{
                            color: '#8D93A8',
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: '14px',
                          }}
                        >
                          .csv, .xls, .xlsx
                        </Text>
                      </Box>
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onMouseEnter={() =>
                        setVersion2HoveredFlow('upload-file-shapes')
                      }
                      onMouseLeave={() => setVersion2HoveredFlow(null)}
                      onClick={() => openVersion2UploadPicker('shapes')}
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 14,
                        border: `1px solid ${
                          isVersion3ShapeUploadHovered ? '#006CD7' : '#393C56'
                        }`,
                        borderRadius: 6,
                        background: isVersion3ShapeUploadHovered
                          ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                          : '#24263C',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '14px',
                        padding: 8,
                        cursor: 'pointer',
                      }}
                    >
                      {renderVersion2UploadIcon()}
                      <Box style={{ minWidth: 0, textAlign: 'left' }}>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: '16px',
                          }}
                        >
                          Upload file for Shapes
                        </Text>
                        <Text
                          style={{
                            color: '#8D93A8',
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: '14px',
                          }}
                        >
                          .json, .geojson
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  isVersion3Or4Or5 && (
                    <Box
                      component="button"
                      type="button"
                      onMouseEnter={() => setVersion2HoveredFlow('upload-file')}
                      onMouseLeave={() => setVersion2HoveredFlow(null)}
                      onClick={() => openVersion2UploadPicker()}
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        border: `1px solid ${isVersion3UploadHovered ? '#006CD7' : '#393C56'}`,
                        borderRadius: 6,
                        background: isVersion3UploadHovered
                          ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #24263C'
                          : '#24263C',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '14px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      {renderVersion2UploadIcon()}
                      Upload a file
                      <Text
                        component="span"
                        style={{
                          color: '#8D93A8',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {uploadAcceptLabel}
                      </Text>
                    </Box>
                  )
                )}
                {isVersion3Or4Or5 && version2UploadedFileName && (
                  <Text
                    style={{
                      color: '#A0A6BC',
                      fontSize: 11,
                      lineHeight: '16px',
                      marginTop: 6,
                    }}
                  >
                    Selected for {uploadTargetLabel}: {version2UploadedFileName}
                  </Text>
                )}
                {isVersion3Or4Or5 && version2UploadError && (
                  <Text
                    style={{
                      color: '#FF8B8B',
                      fontSize: 11,
                      lineHeight: '16px',
                      marginTop: 6,
                    }}
                  >
                    {version2UploadError}
                  </Text>
                )}
                {isVersion3Or4Or5 && !isVersion7 && (
                  <Box
                    style={{
                      marginTop: 4,
                      borderRadius: 6,
                      border: '1px solid #393C56',
                      background: '#24263C',
                      padding: isVersion6 ? 8 : '12px 14px',
                      display: 'flex',
                      alignItems: isVersion6 ? 'center' : 'flex-start',
                      gap: isVersion6 ? 14 : 10,
                    }}
                  >
                    {renderVersion2TipStarIcon()}
                    <Text
                      style={{
                        color: '#8D93A8',
                        fontSize: 12,
                        lineHeight: '18px',
                        fontWeight: 500,
                      }}
                    >
                      Tap the star on any ship or port detail page to add it
                      instantly.
                    </Text>
                  </Box>
                )}
                {isVersion2 && (
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: 14,
                      gap: 8,
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => {
                        setVersion2SelectedFlow(null)
                        setVersion2HoveredFlow(null)
                        setVersion2Mode('empty')
                      }}
                      style={{
                        height: 32,
                        borderRadius: 4,
                        border: '1px solid #FFFFFF',
                        background: 'transparent',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '14px',
                        padding: '0 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </Box>
                  </Box>
                )}
                {isVersion3Or4Or5 && hasAnyBookmarkedItems && (
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: 14,
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={returnToBookmarksList}
                      style={{
                        height: 30,
                        borderRadius: 4,
                        border: '1px solid #FFFFFF',
                        background: 'transparent',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '14px',
                        padding: '0 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </Box>
                  </Box>
                )}
              </Box>
            ) : activeTopTab === 'my-watchlist' &&
              (version2Mode === 'ships-list' ||
                version2Mode === 'ports-list') ? (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 20,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 20,
                      fontWeight: 700,
                      // lineHeight: '22px',
                    }}
                  >
                    {isVersion4Or5 ? 'My Bookmarks' : 'My Watchlist'}
                  </Text>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      setVersion2ShipQuery('')
                      setVersion2PendingShips([])
                      setVersion2PortQuery('')
                      setVersion2PendingPorts([])
                      setVersion2BookmarkSearchQuery('')
                      setVersion2SelectedFlow(null)
                      setVersion2HoveredFlow(null)
                      setVersion2Mode('add-options')
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      border: 'none',
                      borderRadius: 4,
                      background: '#006CD7',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      height: 30,
                      padding: '0 10px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} color="#FFFFFF" />
                    {`Add ${listCollectionLabelLower}`}
                  </Box>
                </Box>
                <Box
                  style={{
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    background: '#0A0E19',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                    width: '100%',
                    marginBottom: 2,
                  }}
                >
                  <SearchMd color="#8D93A8" size={14} />
                  <Box
                    component="input"
                    className="secondary-nav-text-input"
                    value={version2BookmarkSearchQuery}
                    onChange={(event) =>
                      setVersion2BookmarkSearchQuery(event.currentTarget.value)
                    }
                    placeholder={`Search ${listCollectionLabelLower}`}
                    style={{
                      width: '100%',
                      height: 30,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: '#FFFFFF',
                      fontSize: 12,
                      padding: '0 10px 0 8px',
                    }}
                  />
                </Box>
                {(!isVersion4Or5 ||
                  version2MyWatchlistShipRows.length > 0 ||
                  hasBookmarkSearchQuery) && (
                  <>
                    <Box
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {isVersion4Or5 && (
                          <ShipIcon
                            style={{
                              width: 16,
                              height: 16,
                            }}
                          />
                        )}
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Ships: {filteredVersion2ShipRows.length}
                        </Text>
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onClick={() =>
                          setOpenTableFilterId((prev) =>
                            prev === 'ships' ? null : 'ships'
                          )
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          color:
                            openTableFilterId === 'ships'
                              ? '#FFFFFF'
                              : '#A4ABBE',
                        }}
                      >
                        <Sliders04
                          size={16}
                          color={
                            openTableFilterId === 'ships'
                              ? '#FFFFFF'
                              : '#A4ABBE'
                          }
                        />
                      </Box>
                      {openTableFilterId === 'ships' && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            zIndex: 20,
                            width: 230,
                            border: '1px solid #393C56',
                            borderRadius: 6,
                            background: '#24263C',
                            padding: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            // gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 600,
                              marginBottom: 8,
                            }}
                          >
                            Ship filters
                          </Text>

                          <Box style={{ marginBottom: 8 }}>
                            <Text
                              style={{
                                color: '#8D93A8',
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                            >
                              Type
                            </Text>
                            <Box
                              component="select"
                              value={shipTableFilters.type}
                              onChange={(event) => {
                                const nextType = event.currentTarget.value
                                setShipTableFilters((prev) => ({
                                  ...prev,
                                  type: nextType,
                                }))
                              }}
                              style={{
                                width: '100%',
                                height: 30,
                                border: '1px solid #393C56',
                                borderRadius: 4,
                                background: '#0A0E19',
                                color: '#FFFFFF',
                                fontSize: 12,
                                padding: '0 30px 0 10px',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                              }}
                            >
                              <option value="all">All ship types</option>
                              {shipTypeFilterOptions.map((type) => (
                                <option key={`ship-type-${type}`} value={type}>
                                  {type}
                                </option>
                              ))}
                            </Box>
                          </Box>

                          <Box style={{ marginBottom: 8 }}>
                            <Text
                              style={{
                                color: '#8D93A8',
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                            >
                              Flag
                            </Text>
                            <Box
                              component="select"
                              value={shipTableFilters.flag}
                              onChange={(event) => {
                                const nextFlag = event.currentTarget.value
                                setShipTableFilters((prev) => ({
                                  ...prev,
                                  flag: nextFlag,
                                }))
                              }}
                              style={{
                                width: '100%',
                                height: 30,
                                border: '1px solid #393C56',
                                borderRadius: 4,
                                background: '#0A0E19',
                                color: '#FFFFFF',
                                fontSize: 12,
                                padding: '0 30px 0 10px',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                              }}
                            >
                              <option value="all">All flags</option>
                              {shipFlagFilterOptions.map((flag) => (
                                <option key={`ship-flag-${flag}`} value={flag}>
                                  {flag}
                                </option>
                              ))}
                            </Box>
                          </Box>
                          <Box
                            component="button"
                            type="button"
                            onClick={() =>
                              setShipTableFilters({ type: 'all', flag: 'all' })
                            }
                            style={{
                              marginLeft: 'auto',
                              border: 'none',
                              background: 'transparent',
                              color: '#fff',
                              fontSize: 12,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Clear filters
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <DataTable
                      rows={filteredVersion2ShipRows}
                      columns={getColumnsByTab('ships')}
                      emptyMessage={`No ships in ${listCollectionLabelLower} yet.`}
                      onRowClick={handleShipRowClick}
                      activeRowId={activeShipRowId}
                      onRemoveRow={handleRemoveShipBookmark}
                    />
                  </>
                )}
                {(!isVersion4Or5 ||
                  version2MyWatchlistPortRows.length > 0 ||
                  hasBookmarkSearchQuery) && (
                  <>
                    <Box
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {isVersion4Or5 && (
                          <Box
                            component="img"
                            src={AnchorIcon}
                            alt=""
                            style={{
                              width: 16,
                              height: 16,
                              display: 'block',
                            }}
                          />
                        )}
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Ports: {filteredVersion2PortRows.length}
                        </Text>
                      </Box>
                      <Box
                        component="button"
                        type="button"
                        onClick={() =>
                          setOpenTableFilterId((prev) =>
                            prev === 'ports' ? null : 'ports'
                          )
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          color:
                            openTableFilterId === 'ports'
                              ? '#FFFFFF'
                              : '#A4ABBE',
                        }}
                      >
                        <Sliders04
                          size={16}
                          color={
                            openTableFilterId === 'ports'
                              ? '#FFFFFF'
                              : '#A4ABBE'
                          }
                        />
                      </Box>
                      {openTableFilterId === 'ports' && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            zIndex: 20,
                            width: 230,
                            border: '1px solid #393C56',
                            borderRadius: 6,
                            background: '#24263C',
                            padding: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            // gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 600,
                              marginBottom: 8,
                            }}
                          >
                            Port filters
                          </Text>
                          <Box style={{ marginBottom: 8 }}>
                            <Text
                              style={{
                                color: '#8D93A8',
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                            >
                              Country
                            </Text>
                            <Box
                              component="select"
                              value={portTableFilters.country}
                              onChange={(event) => {
                                const nextCountry = event.currentTarget.value
                                setPortTableFilters((prev) => ({
                                  ...prev,
                                  country: nextCountry,
                                }))
                              }}
                              style={{
                                width: '100%',
                                height: 30,
                                border: '1px solid #393C56',
                                borderRadius: 4,
                                background: '#0A0E19',
                                color: '#FFFFFF',
                                fontSize: 12,
                                padding: '0 30px 0 10px',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                              }}
                            >
                              <option value="all">All countries</option>
                              {portCountryFilterOptions.map((country) => (
                                <option
                                  key={`port-country-${country}`}
                                  value={country}
                                >
                                  {country}
                                </option>
                              ))}
                            </Box>
                          </Box>
                          <Box style={{ marginBottom: 8 }}>
                            <Text
                              style={{
                                color: '#8D93A8',
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                            >
                              Risk
                            </Text>
                            <Box
                              component="select"
                              value={portTableFilters.risk}
                              onChange={(event) => {
                                const nextRisk = event.currentTarget.value
                                setPortTableFilters((prev) => ({
                                  ...prev,
                                  risk: nextRisk,
                                }))
                              }}
                              style={{
                                width: '100%',
                                height: 30,
                                border: '1px solid #393C56',
                                borderRadius: 4,
                                background: '#0A0E19',
                                color: '#FFFFFF',
                                fontSize: 12,
                                padding: '0 30px 0 10px',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                              }}
                            >
                              <option value="all">All risk levels</option>
                              {portRiskFilterOptions.map((risk) => (
                                <option key={`port-risk-${risk}`} value={risk}>
                                  {risk}
                                </option>
                              ))}
                            </Box>
                          </Box>
                          <Box
                            component="button"
                            type="button"
                            onClick={() =>
                              setPortTableFilters({
                                country: 'all',
                                risk: 'all',
                              })
                            }
                            style={{
                              marginLeft: 'auto',
                              border: 'none',
                              background: 'transparent',
                              color: '#fff',
                              fontSize: 12,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Clear filters
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <DataTable
                      rows={filteredVersion2PortRows}
                      columns={getColumnsByTab('ports')}
                      emptyMessage={`No ports in ${listCollectionLabelLower} yet.`}
                      onRowClick={handlePortRowClick}
                      activeRowId={activePortRowId}
                      onRemoveRow={handleRemovePortBookmark}
                    />
                  </>
                )}
                {isVersion4Or5 && version4BookmarkedPolygonRows.length > 0 && (
                  <>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {polygonEntityLabelPlural}:{' '}
                        {version4BookmarkedPolygonRows.length}
                      </Text>
                      <Box
                        component="button"
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          color: '#A4ABBE',
                        }}
                      >
                        <Sliders04 size={16} color="#A4ABBE" />
                      </Box>
                    </Box>
                    <DataTable
                      rows={version4BookmarkedPolygonRows}
                      columns={
                        isVersion5
                          ? getColumnsByTab('polygons').map((column) =>
                              column.key === 'name'
                                ? {
                                    ...column,
                                    label: polygonEntityLabelSingular,
                                  }
                                : column
                            )
                          : getColumnsByTab('polygons')
                      }
                      emptyMessage={`No ${polygonEntityLabelLowerPlural} in ${listCollectionLabelLower} yet.`}
                      onRowClick={handleShapeRowClick}
                      activeRowId={activeShapeRowId}
                      onRemoveRow={(row) => removeShape(row.id)}
                    />
                  </>
                )}
                {isVersion4Or5 && version4BookmarkedAlertRows.length > 0 && (
                  <>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Alerts: {version4BookmarkedAlertRows.length}
                      </Text>
                      <Box
                        component="button"
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          color: '#A4ABBE',
                        }}
                      >
                        <Sliders04 size={16} color="#A4ABBE" />
                      </Box>
                    </Box>
                    <DataTable
                      rows={version4BookmarkedAlertRows}
                      columns={getColumnsByTab('events')}
                      emptyMessage={`No alerts in ${listCollectionLabelLower} yet.`}
                    />
                  </>
                )}
              </Box>
            ) : (
              <Box
                style={{
                  padding: 20,
                }}
              >
                {activeTopTab === 'my-watchlist' && (
                  <Box
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      marginTop: 16,
                      background: '#24263C',
                      border: '1px solid #393C56',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: isVersion2 ? '0 auto 12px' : '0 0 12px',
                    }}
                  >
                    <Signal01 size={20} color="#FFFFFF" />
                  </Box>
                )}
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '22px',
                    marginBottom: 10,
                    textAlign:
                      activeTopTab === 'my-watchlist' && isVersion2
                        ? 'center'
                        : 'left',
                  }}
                >
                  {activeTopTab === 'my-watchlist'
                    ? isVersion4Or5
                      ? 'Add bookmarks'
                      : 'Start tracking'
                    : 'No recently viewed items'}
                </Text>
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 13,
                    lineHeight: '18px',
                    marginBottom: activeTopTab === 'my-watchlist' ? 32 : 16,
                    maxWidth: 420,
                    textAlign:
                      activeTopTab === 'my-watchlist' && isVersion2
                        ? 'center'
                        : 'left',
                    marginLeft:
                      activeTopTab === 'my-watchlist' && isVersion2
                        ? 'auto'
                        : 0,
                    marginRight:
                      activeTopTab === 'my-watchlist' && isVersion2
                        ? 'auto'
                        : 0,
                  }}
                >
                  {activeTopTab === 'my-watchlist'
                    ? isVersion5
                      ? 'Add ships, ports, or shapes to monitor events and activity in one place.'
                      : 'Add ships, ports, or polygons to monitor events and activity in one place.'
                    : isVersion5
                      ? 'Open ships, ports, shapes, or events to build your recently viewed list.'
                      : 'Open ships, ports, polygons, or events to build your recently viewed list.'}
                </Text>
                {activeTopTab === 'my-watchlist' && !isVersion3Or4Or5 && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      setVersion2SelectedFlow(null)
                      setVersion2HoveredFlow(null)
                      setVersion2Mode('add-options')
                    }}
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 6,
                      border: 'none',
                      borderRadius: 6,
                      background: '#006CD7',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      height: 34,
                      padding: '0 16px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} color="#FFFFFF" />
                    {`Add ${listCollectionLabelLower}`}
                  </Box>
                )}
                {activeTopTab === 'my-watchlist' && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Box
                      style={{ flex: 1, height: 1, background: '#393C56' }}
                    />
                    <Text
                      style={{
                        color: '#393C56',
                        fontSize: 11,
                        lineHeight: '12px',
                      }}
                    >
                      or
                    </Text>
                    <Box
                      style={{ flex: 1, height: 1, background: '#393C56' }}
                    />
                  </Box>
                )}
                {activeTopTab === 'my-watchlist' && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => openVersion2UploadPicker()}
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      border: '1px solid #FFFFFF',
                      borderRadius: 6,
                      background: 'transparent',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      height: 34,
                      padding: '0 16px',
                      cursor: 'pointer',
                    }}
                  >
                    {renderVersion2UploadIcon()}
                    Upload a file
                    <Text
                      component="span"
                      style={{
                        color: '#8D93A8',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {uploadAcceptLabel}
                    </Text>
                  </Box>
                )}
                {activeTopTab === 'my-watchlist' &&
                  version2UploadedFileName && (
                    <Text
                      style={{
                        color: '#A0A6BC',
                        fontSize: 11,
                        lineHeight: '16px',
                        marginTop: 6,
                      }}
                    >
                      Selected for {uploadTargetLabel}:{' '}
                      {version2UploadedFileName}
                    </Text>
                  )}
                {activeTopTab === 'my-watchlist' && version2UploadError && (
                  <Text
                    style={{
                      color: '#FF8B8B',
                      fontSize: 11,
                      lineHeight: '16px',
                      marginTop: 6,
                    }}
                  >
                    {version2UploadError}
                  </Text>
                )}
                {activeTopTab === 'my-watchlist' && (
                  <Box
                    style={{
                      marginTop: 16,
                      borderRadius: 6,
                      border: '1px solid #393C56',
                      background: '#24263C',
                      padding: isVersion6 ? 8 : '12px 14px',
                      display: 'flex',
                      alignItems: isVersion6 ? 'center' : 'flex-start',
                      gap: isVersion6 ? 14 : 10,
                      maxWidth: 560,
                    }}
                  >
                    {renderVersion2TipStarIcon()}
                    <Text
                      style={{
                        color: '#8D93A8',
                        fontSize: 12,
                        lineHeight: '18px',
                        fontWeight: 500,
                      }}
                    >
                      Quick add: tap the star on any ship or port detail page to
                      add it here instantly.
                    </Text>
                  </Box>
                )}
              </Box>
            )
          ) : showVersion1Onboarding ? (
            <Box
              style={{
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  marginBottom: 10,
                }}
              >
                {`Build your ${listCollectionLabelLower}`}
              </Text>
              <Text
                style={{
                  color: '#8D93A8',
                  fontSize: 13,
                  lineHeight: '18px',
                  maxWidth: 520,
                  marginBottom: 14,
                }}
              >
                Add ships and ports to monitor activity in one place. Quick-add
                ships and ports with the star in detail panels. Events are
                generated automatically from what you monitor.
              </Text>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Star01 style={{ color: '#FFFFFF', width: 20, height: 20 }} />
                <Text
                  style={{ color: '#8D93A8', fontSize: 16, lineHeight: '16px' }}
                >
                  ----&gt;
                </Text>
                <Star01
                  style={{
                    color: '#F7C948',
                    fill: '#F7C948',
                    width: 20,
                    height: 20,
                  }}
                />
              </Box>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <Box style={{ flex: 1, height: 1, background: '#3D4264' }} />
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 12,
                    lineHeight: '12px',
                  }}
                >
                  or
                </Text>
                <Box style={{ flex: 1, height: 1, background: '#3D4264' }} />
              </Box>

              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  lineHeight: '18px',
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                Add manually or upload
              </Text>
              <Text
                style={{
                  color: '#8D93A8',
                  fontSize: 12,
                  lineHeight: '16px',
                  marginBottom: 6,
                }}
              >
                Or upload a file to add ships and ports.
              </Text>
              <Text
                style={{
                  color: '#8D93A8',
                  fontSize: 12,
                  lineHeight: '16px',
                  marginBottom: 14,
                }}
              >
                Accepted file types: .csv, .xls, .xlsx
              </Text>
              <Box
                component="button"
                type="button"
                style={{
                  height: 38,
                  borderRadius: 6,
                  border: '1px solid #FFFFFF',
                  background: 'transparent',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '0 18px',
                  cursor: 'pointer',
                }}
              >
                Upload File
              </Box>
            </Box>
          ) : isGroupedVersion &&
            activeTopTab === 'my-watchlist' &&
            activeWatchlistTab === 'all' ? (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                padding: 20,
              }}
            >
              {watchlistSections.map((section) => (
                <Box key={section.id}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {section.rows.length} {section.title}
                  </Text>
                  <DataTable
                    rows={section.rows}
                    columns={getColumnsByTab(section.id)}
                    emptyMessage={`No ${section.title.toLowerCase()} in ${listCollectionLabelLower} yet.`}
                    onRowClick={
                      section.id === 'ships'
                        ? handleShipRowClick
                        : section.id === 'ports'
                          ? handlePortRowClick
                          : undefined
                    }
                    activeRowId={
                      section.id === 'ships'
                        ? activeShipRowId
                        : section.id === 'ports'
                          ? activePortRowId
                          : undefined
                    }
                  />
                </Box>
              ))}
            </Box>
          ) : isGroupedVersion && activeTopTab === 'recently-viewed' ? (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                padding: 20,
              }}
            >
              {recentlyViewedSections.map((section) => (
                <Box key={`recent-${section.id}`}>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    {section.id === 'ships' ? (
                      <ShipIcon
                        style={{
                          width: 16,
                          height: 16,
                        }}
                      />
                    ) : section.id === 'ports' ? (
                      <Box
                        component="img"
                        src={AnchorIcon}
                        alt=""
                        style={{
                          width: 16,
                          height: 16,
                          display: 'block',
                        }}
                      />
                    ) : section.id === 'polygons' ? (
                      <BezierCurve03 size={16} color="#FFFFFF" />
                    ) : section.id === 'events' ? (
                      <List size={16} color="#FFFFFF" />
                    ) : null}
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {section.rows.length} {section.title}
                    </Text>
                  </Box>
                  <DataTable
                    rows={section.rows}
                    columns={getColumnsByTab(section.id)}
                    emptyMessage={`No recently viewed ${section.title.toLowerCase()} yet.`}
                    onRowClick={
                      section.id === 'ships'
                        ? handleShipRowClick
                        : section.id === 'ports'
                          ? handlePortRowClick
                          : undefined
                    }
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box style={{ padding: 20 }}>
              {isGroupedVersion &&
                activeTopTab === 'my-watchlist' &&
                activeWatchlistTab !== 'all' && (
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {activeRows.length}{' '}
                    {WATCHLIST_SUB_TABS.find(
                      (tab) => tab.id === activeWatchlistTab
                    )?.label || 'Items'}
                  </Text>
                )}
              <DataTable
                rows={activeRows}
                columns={columns}
                onRowClick={
                  activeTopTab === 'my-watchlist' &&
                  activeWatchlistTab === 'ships'
                    ? handleShipRowClick
                    : activeTopTab === 'my-watchlist' &&
                        activeWatchlistTab === 'ports'
                      ? handlePortRowClick
                      : activeTopTab === 'recently-viewed'
                        ? handleRecentlyViewedRowClick
                        : undefined
                }
                activeRowId={
                  activeTopTab === 'my-watchlist' &&
                  activeWatchlistTab === 'ships'
                    ? activeShipRowId
                    : activeTopTab === 'my-watchlist' &&
                        activeWatchlistTab === 'ports'
                      ? activePortRowId
                      : undefined
                }
                emptyMessage={
                  activeTopTab === 'recently-viewed'
                    ? isVersion5
                      ? 'No recently viewed entities yet. Open ships, ports, shapes, or events to populate this list.'
                      : 'No recently viewed entities yet. Open ships, ports, polygons, or events to populate this list.'
                    : `Nothing in this ${isVersion4Or5 ? 'bookmark' : 'watchlist'} segment yet.`
                }
              />
            </Box>
          )}
        </Box>
        <Box
          component="input"
          type="file"
          ref={version2UploadInputRef}
          accept={uploadAccept}
          onChange={(event) => {
            const selectedFile = event.currentTarget.files?.[0]
            const selectedFileName = selectedFile?.name || ''
            if (!selectedFileName) {
              setVersion2UploadedFileName('')
              setVersion2UploadError('')
              event.currentTarget.value = ''
              return
            }

            const normalizedFileName = selectedFileName.toLowerCase()
            const isSpreadsheetFile =
              normalizedFileName.endsWith('.csv') ||
              normalizedFileName.endsWith('.xls') ||
              normalizedFileName.endsWith('.xlsx')
            const isShapeFile =
              normalizedFileName.endsWith('.geojson') ||
              normalizedFileName.endsWith('.json')
            const isShapeUploadTarget = uploadTarget === 'shapes'
            const isValidForTarget = isShapeUploadTarget
              ? isShapeFile
              : isSpreadsheetFile

            if (!isValidForTarget) {
              setVersion2UploadedFileName('')
              setVersion2UploadError(
                isShapeUploadTarget
                  ? 'Shapes imports support .json and .geojson only.'
                  : 'Ships/Ports imports support .csv, .xls, and .xlsx only.'
              )
              event.currentTarget.value = ''
              return
            }

            setVersion2UploadedFileName(selectedFileName)
            setVersion2UploadError('')
            // Allow selecting the same file again.
            event.currentTarget.value = ''
          }}
          style={{ display: 'none' }}
        />
      </Box>
      {isOpen && isWatchlistView && (
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

export default SecondaryNav
