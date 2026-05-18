import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Loader, Text } from '@mantine/core'
import { Plus, Anchor, BezierCurve03, Bell02, Star01 } from '@untitledui/icons'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import ShipIcon from '../custom-icons/ShipIcon'
import { ships } from '../data/mockData'
import { useShipContext } from '../context/ShipContext'

const SECONDARY_NAV_DEFAULT_WIDTH = 386
const SECONDARY_NAV_MIN_WIDTH = 340
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
    description: 'Watch an area by drawing or uploading',
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Watch an area by drawing or uploading',
  },
]

const watchedPorts = [
  {
    id: 'port-fujairah',
    name: 'Fujairah Anchorage',
    country: 'UAE',
    activity: 'Congestion',
    risk: 'Medium',
    updatedAt: '2026-05-15 09:48',
  },
  {
    id: 'port-jebel-ali',
    name: 'Jebel Ali',
    country: 'UAE',
    activity: 'Bunkering',
    risk: 'Low',
    updatedAt: '2026-05-15 08:15',
  },
]

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
  borderRadius: 4,
  overflow: 'hidden',
  background: 'transparent',
}

const getColumnsByTab = (tabId) => {
  if (tabId === 'ships') {
    return [
      { key: 'name', label: 'Name', width: 'minmax(0, 1.3fr)' },
      { key: 'flag', label: 'Flag', width: '56px', align: 'center' },
      { key: 'type', label: 'Type', width: 'minmax(0, 1.1fr)' },
      { key: 'port', label: 'Port', width: 'minmax(0, 1fr)' },
      { key: 'event', label: 'Event', width: 'minmax(0, 0.9fr)' },
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

const DataTable = ({ rows, columns, emptyMessage }) => {
  const gridTemplateColumns = columns.map((column) => column.width).join(' ')

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
          borderRadius: 4,
        }}
      >
        {columns.map((column) => (
          <Text
            key={column.key}
            style={{
              color: '#fff',
              fontSize: 12,
              minWidth: 0,
              textAlign: column.align || 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {column.label}
          </Text>
        ))}
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
        rows.map((row, idx) => (
          <Box
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns,
              columnGap: 10,
              alignItems: 'center',
              padding: '8px',
              borderTop: idx === 0 ? 'none' : '1px solid #393C56',
              background: '#181926',
            }}
          >
            {columns.map((column) => (
              <Text
                key={`${row.id}-${column.key}`}
                style={{
                  color: '#fff',
                  fontSize: 12,
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
}) => {
  const [activeTopTab, setActiveTopTab] = useState('my-watchlist')
  const [activeWatchlistTab, setActiveWatchlistTab] = useState('all')
  const [version2Mode, setVersion2Mode] = useState('empty')
  const [version2SelectedFlow, setVersion2SelectedFlow] = useState(null)
  const [version2HoveredFlow, setVersion2HoveredFlow] = useState(null)
  const [version2ShipQuery, setVersion2ShipQuery] = useState('')
  const [version2SearchResults, setVersion2SearchResults] = useState([])
  const [version2IsSearching, setVersion2IsSearching] = useState(false)
  const [version2PendingShips, setVersion2PendingShips] = useState([])
  const [version2PrototypeShipRows, setVersion2PrototypeShipRows] = useState([])
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const [navWidth, setNavWidth] = useState(SECONDARY_NAV_DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(SECONDARY_NAV_DEFAULT_WIDTH)
  const version2SearchTimerRef = useRef(null)
  const { shipTabs, favoriteShipIds, toggleFavoriteShip } = useShipContext()

  const isWatchlistView = currentPath === '/watchlist'
  const isGroupedVersion = watchlistVersion === 'grouped'
  const isVersion2 = watchlistVersion === 'version2'

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
        ...port,
        entityType: 'Port',
        description: `${port.country} • ${port.activity}`,
        status: port.risk,
      })),
    []
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
        name: row.name,
        details: `${row.type || 'Unknown'} • ${row.port || 'No destination'}`,
        lastViewed: index === 0 ? 'Just now' : `${index + 1} views ago`,
      })),
      ...recentlyViewedPortRows.map((row) => ({
        id: `${row.id}-mixed`,
        entityType: 'Port',
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
  const showVersion1Onboarding =
    isGroupedVersion &&
    activeTopTab === 'my-watchlist' &&
    activeWatchlistTab === 'all' &&
    myShipRows.length === 0
  const version2MyWatchlistShipRows = useMemo(
    () => [...myShipRows, ...version2PrototypeShipRows],
    [myShipRows, version2PrototypeShipRows]
  )
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
      : 'Add to Watchlist'
  const canProceedVersion2 = version2SelectedFlow === 'ships'

  const handleVersion2Next = () => {
    if (!version2SelectedFlow) return
    if (version2SelectedFlow === 'ships') {
      setVersion2Mode('ships')
    }
  }

  const buildVersion2SearchResults = (query) => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    const normalizedQuery = cleanedQuery.toLowerCase()
    if (!cleanedQuery) return []

    const baseName = cleanedQuery
      .split(' ')
      .map((word) =>
        word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : ''
      )
      .join(' ')
    const nameOptions = [
      baseName,
      `${baseName} Star`,
      `${baseName} Voyager`,
    ]
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

  const handleVersion2QueueShip = (ship) => {
    if (!ship) return
    setVersion2PendingShips((prev) =>
      prev.some((pendingShip) => pendingShip.optionId === ship.optionId)
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

    const realShipsToAdd = version2PendingShips.filter(
      (ship) => ship.baseShipId && !favoriteShipIds.includes(ship.baseShipId)
    )
    realShipsToAdd.forEach((ship) => toggleFavoriteShip(ship.baseShipId))

    const existingPrototypeNames = new Set(
      version2PrototypeShipRows.map((row) => (row.name || '').toLowerCase())
    )
    const prototypeShipsToAdd = version2PendingShips.filter((ship) => {
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

    setVersion2PendingShips([])
    setVersion2ShipQuery('')
    setVersion2SearchResults([])
    setVersion2Mode('ships-list')
    setActiveTopTab('my-watchlist')
    setActiveWatchlistTab('ships')
  }

  useEffect(() => {
    if (!isVersion2) {
      setVersion2Mode('empty')
      setVersion2SelectedFlow(null)
      setVersion2HoveredFlow(null)
      setVersion2ShipQuery('')
      setVersion2SearchResults([])
      setVersion2IsSearching(false)
      setVersion2PendingShips([])
      setVersion2PrototypeShipRows([])
      if (version2SearchTimerRef.current) {
        window.clearTimeout(version2SearchTimerRef.current)
        version2SearchTimerRef.current = null
      }
    }
  }, [isVersion2])

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
            top: 71,
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
              {tab.label}
            </Box>
          ))}
        </Box>

        <Box
          style={{
            padding: '20px 16px',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {activeTopTab === 'my-watchlist' &&
            !isVersion2 &&
            !showVersion1Onboarding && (
            <Box
              className="no-scrollbar"
              style={{
                marginBottom: 16,
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

          {isVersion2 ? (
            activeTopTab === 'my-watchlist' && version2Mode === 'ships' ? (
              <Box
                style={{
                  padding: '2px 4px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
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
                    border: '1px solid #424750',
                    borderRadius: 6,
                    background: '#0A0E19',
                    marginBottom: 10,
                    padding: '0 10px',
                    position: 'relative',
                  }}
                >
                  <Box
                    component="input"
                    value={version2ShipQuery}
                    onChange={(event) => setVersion2ShipQuery(event.currentTarget.value)}
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
                        setVersion2SearchResults(buildVersion2SearchResults(submittedQuery))
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
                          gap: 6,
                        }}
                      >
                        {version2DisplaySearchRows.map((ship) => {
                          const isSelected = version2PendingShipIds.has(ship.optionId)
                          return (
                            <Box
                              key={ship.optionId}
                              style={{
                                border: `1px solid ${isSelected ? '#006CD7' : '#3C4164'}`,
                                borderRadius: 6,
                                background: isSelected ? '#203B5A' : '#252845',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
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
                                  IMO: {ship.imo || 'No info'} • MMSI: {ship.mmsi || 'No info'}
                                </Text>
                              </Box>
                              <Box
                                component="input"
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleVersion2ShipToggle(ship)}
                                style={{
                                  width: 16,
                                  height: 16,
                                  margin: 0,
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  borderRadius: 3,
                                  border: `1px solid ${isSelected ? '#006CD7' : '#424750'}`,
                                  background: isSelected ? '#006CD7' : '#0A0E19',
                                  backgroundImage: isSelected
                                    ? 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27none%27%3E%3Cpath d=%27M3.5 8.2L6.6 11.1L12.5 4.9%27 stroke=%27%23FFFFFF%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")'
                                    : 'none',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  backgroundSize: '12px 12px',
                                  cursor: 'pointer',
                                  flexShrink: 0,
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
                      background: version2PendingCount > 0 ? '#006CD7' : '#3A3E5E',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      padding: '0 12px',
                      cursor: version2PendingCount > 0 ? 'pointer' : 'not-allowed',
                      opacity: version2PendingCount > 0 ? 1 : 0.8,
                    }}
                  >
                    {version2SubmitLabel}
                  </Box>
                </Box>
              </Box>
            ) : activeTopTab === 'my-watchlist' &&
              version2Mode === 'add-options' ? (
              <Box
                style={{
                  margin: '-20px -16px 0 -16px',
                  padding: '22px 28px 30px',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                    marginBottom: 4,
                  }}
                >
                  Add to Watchlist
                </Text>
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 12,
                    lineHeight: '18px',
                    marginBottom: 14,
                  }}
                >
                  What would you like to add?
                </Text>
                <Box
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  {VERSION2_ADD_OPTIONS.map((option) => {
                    const isSelected = version2SelectedFlow === option.id
                    const isHovered = version2HoveredFlow === option.id
                    const icon =
                      option.id === 'ships' ? (
                        <ShipIcon size={20} color="#FFFFFF" />
                      ) : option.id === 'ports' ? (
                        <Anchor size={20} color="#FFFFFF" />
                      ) : option.id === 'polygons' ? (
                        <BezierCurve03 size={20} color="#FFFFFF" />
                      ) : (
                        <Bell02 size={20} color="#FFFFFF" />
                      )

                    return (
                      <Box
                        key={option.id}
                        onMouseEnter={() => setVersion2HoveredFlow(option.id)}
                        onMouseLeave={() => setVersion2HoveredFlow(null)}
                        onClick={() => setVersion2SelectedFlow(option.id)}
                        style={{
                          border: `1px solid ${isSelected ? '#006CD7' : isHovered ? '#4A5077' : '#3C4164'}`,
                          borderRadius: 6,
                          background: isSelected
                            ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #252845'
                            : isHovered
                              ? '#2A2E4C'
                              : '#252845',
                          padding: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
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
                          {icon}
                        </Box>
                        <Box style={{ minWidth: 0 }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 13,
                              fontWeight: 600,
                              lineHeight: '18px',
                              marginBottom: 2,
                            }}
                          >
                            {option.title}
                          </Text>
                          <Text
                            style={{
                              color: '#A0A6BC',
                              fontSize: 12,
                              lineHeight: '16px',
                            }}
                          >
                            {option.description}
                          </Text>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={handleVersion2Next}
                    disabled={!canProceedVersion2}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      border: 'none',
                      borderRadius: 4,
                      background: canProceedVersion2 ? '#006CD7' : '#3A3E5E',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: '14px',
                      height: 32,
                      padding: '0 14px',
                      cursor: canProceedVersion2 ? 'pointer' : 'not-allowed',
                      opacity: canProceedVersion2 ? 1 : 0.8,
                    }}
                  >
                    Next
                  </Box>
                </Box>
              </Box>
            ) : activeTopTab === 'my-watchlist' &&
              version2Mode === 'ships-list' ? (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
                    Ships: {version2MyWatchlistShipRows.length}
                  </Text>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      setVersion2ShipQuery('')
                      setVersion2PendingShips([])
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
                    Add to Watchlist
                  </Box>
                </Box>
                <DataTable
                  rows={version2MyWatchlistShipRows}
                  columns={getColumnsByTab('ships')}
                  emptyMessage="No ships in watchlist yet."
                />
              </Box>
            ) : (
              <Box
                style={{
                  margin: '-20px -16px 0 -16px',
                  padding: '30px 32px',
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
                  {activeTopTab === 'my-watchlist'
                    ? 'Your watchlist is empty'
                    : 'No recently viewed items'}
                </Text>
                <Text
                  style={{
                    color: '#8D93A8',
                    fontSize: 13,
                    lineHeight: '18px',
                    marginBottom: 16,
                    maxWidth: 420,
                  }}
                >
                  {activeTopTab === 'my-watchlist'
                    ? 'Add ships, ports, polygons, and alerts to monitor them in one place. Events will appear automatically once you have items.'
                    : 'Open ships, ports, polygons, or events to build your recently viewed list.'}
                </Text>
                {activeTopTab === 'my-watchlist' && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
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
                      height: 32,
                      padding: '0 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} color="#FFFFFF" />
                    Add to Watchlist
                  </Box>
                )}
              </Box>
            )
          ) : showVersion1Onboarding ? (
            <Box
              style={{
                margin: '-20px -16px 0 -16px',
                padding: '30px 32px',
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
                Build your watchlist
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
                Add ships and ports to monitor activity in one place.
                Quick-add ships and ports with the star in detail panels. Events
                are generated automatically from what you monitor.
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
                <Text style={{ color: '#8D93A8', fontSize: 16, lineHeight: '16px' }}>
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
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                    emptyMessage={`No ${section.title.toLowerCase()} in watchlist yet.`}
                  />
                </Box>
              ))}
            </Box>
          ) : isGroupedVersion && activeTopTab === 'recently-viewed' ? (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {recentlyViewedSections.map((section) => (
                <Box key={`recent-${section.id}`}>
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
                    emptyMessage={`No recently viewed ${section.title.toLowerCase()} yet.`}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <DataTable
              rows={activeRows}
              columns={columns}
              emptyMessage={
                activeTopTab === 'recently-viewed'
                  ? 'No recently viewed entities yet. Open ships, ports, polygons, or events to populate this list.'
                  : 'Nothing in this watchlist segment yet.'
              }
            />
          )}
        </Box>
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
