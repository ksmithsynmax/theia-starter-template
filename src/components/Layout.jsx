import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Box, ActionIcon, Text } from '@mantine/core'
import { Plus, Minus, XClose, LayersThree01 } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import ExpandButton from '../custom-icons/ExpandButton'
import ShipFilterIcon from '../custom-icons/ShipFilterIcon.svg'
import ShipFiltersPanel from './ShipFiltersPanel'
import MapLayersPanel from './MapLayersPanel'
import { useShipContext } from '../context/ShipContext'
import SecondaryNav from './SecondaryNav'
import ForYouSecondaryNav from './ForYouSecondaryNav'
import PortsSecondaryNav from './PortsSecondaryNav'
import StsPeekPanel from './StsPeekPanel'

function Layout() {
  const TIMELINE_PANEL_HEIGHT = 172
  const watchlistVersion = 'version7'
  const [portVisibilityBehavior] = useState('strict-layer-toggle-v2')
  // "For You" map marker rendering approach. Surfaced through the repurposed
  // top-nav dropdown so we can compare approaches:
  // 'pin' | 'pulse' | 'pulse-icon' | 'pulse-button' | 'ring'.
  const [forYouMarkerMode, setForYouMarkerMode] = useState('ring')
  // Master on/off for all "For You" map markers (defaults to visible).
  const [forYouMarkersVisible, setForYouMarkersVisible] = useState(true)
  // Whether the pulse animation plays on pulse-style markers (icons stay either
  // way). Toggled from the Maritime Briefing Overview filter.
  const [forYouPulseEnabled, setForYouPulseEnabled] = useState(false)
  // When the master toggle is off, these item ids are shown individually.
  const [forYouVisibleIds, setForYouVisibleIds] = useState([])
  // Explicit "fly to this item" request. The built-in port/shape focus logic
  // only recenters under certain conditions (first-visible / unchanged focus
  // key), so re-clicking an item wouldn't always move the map. This nonce-keyed
  // target guarantees every For You click recenters on the item.
  const [forYouFocus, setForYouFocus] = useState(null)
  // User-customizable styling for the 'ring' marker, edited from the For You
  // panel: stroke color, solid/dashed line, and optional fill with opacity.
  const [forYouRingConfig, setForYouRingConfig] = useState({
    color: '#F75349',
    lineStyle: 'solid',
    fill: true,
    fillOpacity: 0.2,
    borderWidth: 2,
    size: 36,
  })
  // For You uses the Favorites flow only (star icon + "Save to Favorites").
  // The bookmark-flow A/B ('proto2') was removed, so this stays fixed.
  const forYouPrototype = 'proto1'
  // Favorites A/B: 'v1' is the current Favorites flow, 'v2' is a variant that
  // will diverge in the Add Shapes experience. Switched via the top-nav
  // dropdown. Both are identical until the v2 Add Shapes work lands.
  const [favoritesVersion, setFavoritesVersion] = useState('v1')
  // For You presentation version, switched via the top-nav dropdown:
  // 'v1' is the curated feed list; 'v2' is the "Maritime Briefing" layout.
  const [forYouVersion, setForYouVersion] = useState('v2')
  // Ship-to-Ship experience version, switched via the top-nav dropdown. 'v1' is
  // the current STS detail view; further versions branch off this.
  const [stsVersion, setStsVersion] = useState('v1')
  // Path to Port experience version, switched via the top-nav dropdown. Each
  // version places the route output (distance / ETA / duration + speed control)
  // in a different spot; the Expected Arrivals list and map route are shared.
  const [pathToPortVersion, setPathToPortVersion] = useState('v1')
  // Ship details panel prototype. V2 initially mirrors V1 and can diverge as the
  // next panel iteration is developed.
  const [shipDetailsVersion, setShipDetailsVersion] = useState('v1')
  // Width the v7 floating network panel occludes on the right of the map, so the
  // map can pad focused vessels clear of it.
  const [stsNetworkInset, setStsNetworkInset] = useState(0)
  // Keeps the For You list panel visible after drilling into a ship/port detail
  // (which lives on the /myships route). Starts true since we land on For You.
  const [forYouContext, setForYouContext] = useState(true)
  // Mirror of forYouContext for the Ports destination: keeps the Ports secondary
  // nav visible after drilling into a port detail (which lives on /myships), so
  // clicking a port while browsing Ports doesn't kick over to the For You nav.
  const [portsContext, setPortsContext] = useState(false)
  const [forceHideSelectedPortContext, setForceHideSelectedPortContext] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [secondaryNavOpen, setSecondaryNavOpen] = useState(true)
  const [shipFiltersOpen, setShipFiltersOpen] = useState(false)
  const [mapLayersOpen, setMapLayersOpen] = useState(false)
  const [portsLayerVisible, setPortsLayerVisible] = useState(false)
  const [portHoverCardEnabled, setPortHoverCardEnabled] = useState(true)
  // Master switch for the port-shape visibility feature. When off, the
  // "Port shape visible/hidden" bar is removed from the port detail panel.
  const [portShapeControlEnabled, setPortShapeControlEnabled] = useState(true)
  const [expandPanelHovered, setExpandPanelHovered] = useState(false)
  const [timelinePanelOpen, setTimelinePanelOpen] = useState(true)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [timelineSortOrder, setTimelineSortOrder] = useState('asc')
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState(null)
  const mapRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const {
    selectDetection,
    shipTabs,
    enabledDetectionTypes,
    mapDate,
    runtimeDetections,
    openPortTab,
    closeAllTabs,
    addBookmarkedShape,
    showShape,
    stsConnectorData,
    setPreviewDetectionId,
    stsPeekDetectionId,
    setStsPeekDetectionId,
    setStsSelectSignal,
  } =
    useShipContext()

  // Secondary "peek" panel: shows the detection clicked on the map (or the vessel
  // selected in the transfer network) without switching the main panel. Its id is
  // shared via context so the map, the network selection, and this card stay in
  // sync.
  const peekDetection = useMemo(() => {
    if (stsPeekDetectionId == null) return null
    return (
      runtimeDetections.find(
        (d) => String(d.id) === String(stsPeekDetectionId)
      ) || null
    )
  }, [stsPeekDetectionId, runtimeDetections])

  // The "Priority badges" marker style was retired; coerce any lingering value.
  useEffect(() => {
    if (forYouMarkerMode === 'priority') setForYouMarkerMode('ring')
  }, [forYouMarkerMode])

  const getDetectionDateKey = useCallback((dateStr) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`
  }, [])

  const getEventColor = useCallback((type) => {
    if (type === 'ais') return '#00EB6C'
    if (type === 'dark') return '#FFA500'
    if (type === 'light') return '#00A3E3'
    if (type === 'spoofing') return '#FF6D99'
    if (type === 'sts' || type === 'sts-ais') return '#0094FF'
    if (type === 'unattributed') return '#F75349'
    return '#8D93A8'
  }, [])

  useEffect(() => {
    if (shipTabs.length === 0) setPanelOpen(false)
  }, [shipTabs])

  // While browsing For You, drilling into a ship/port moves to /myships. Once
  // the detail closes (no tabs left), return to the canonical /for-you route so
  // we never sit on /myships while showing the For You panel.
  useEffect(() => {
    if (
      forYouContext &&
      shipTabs.length === 0 &&
      !panelOpen &&
      location.pathname === '/myships'
    ) {
      navigate('/for-you', { replace: true })
    }
  }, [forYouContext, shipTabs, panelOpen, location.pathname, navigate])

  // Same idea for the Ports context: once the port detail closes, return to the
  // canonical /ports route so we never sit on /myships showing the Ports nav.
  useEffect(() => {
    if (
      portsContext &&
      shipTabs.length === 0 &&
      !panelOpen &&
      location.pathname === '/myships'
    ) {
      navigate('/ports', { replace: true })
    }
  }, [portsContext, shipTabs, panelOpen, location.pathname, navigate])

  const handleDetectionClick = useCallback(
    (detection) => {
      if (location.pathname === '/timeline') {
        const parsedTs = new Date(detection?.date).getTime()
        const sortTs = Number.isNaN(parsedTs) ? Date.now() : parsedTs
        setTimelineEvents((prev) => {
          const next = prev
            .filter((event) => String(event.id) !== String(detection.id))
            .concat({
              id: detection.id,
              shipId: detection.shipId,
              type: detection.type,
              timestamp: detection.date,
              sortTs,
              detection,
            })
          return next
        })
        setSelectedTimelineEventId(String(detection.id))
        selectDetection(detection, { source: 'timeline-map', allowTabSwitch: false })
        return
      }
      // In the STS transfer-network view, clicking a detection peeks at it in a
      // secondary panel instead of switching the main panel away from the
      // network. If the clicked detection belongs to a participating vessel, we
      // also select that vessel in the network so the map halo/line, the network
      // node, and this card all move together. Focus mode stays on; the left
      // flyout + right panels close to keep the view clean.
      if (stsConnectorData) {
        setStsPeekDetectionId(detection.id)
        setPreviewDetectionId(detection.id)
        const isParticipant = (stsConnectorData.lines || []).some(
          (l) => String(l.shipId) === String(detection.shipId)
        )
        if (isParticipant) {
          setStsSelectSignal({
            shipId: detection.shipId,
            nonce: Date.now(),
          })
        }
        setSecondaryNavOpen(false)
        setShipFiltersOpen(false)
        setMapLayersOpen(false)
        return
      }
      selectDetection(detection, {
        source: 'map',
        allowTabSwitch: true,
        stsAsShip: stsVersion === 'v20' || stsVersion === 'v21',
      })
      if (location.pathname !== '/myships' && location.pathname !== '/watchlist') {
        navigate('/myships')
      }
      setPanelOpen(true)
    },
    [
      selectDetection,
      location.pathname,
      navigate,
      stsVersion,
      stsConnectorData,
      setPreviewDetectionId,
      setStsPeekDetectionId,
      setStsSelectSignal,
    ]
  )

  // Clear the peek whenever we leave the transfer-network view.
  useEffect(() => {
    if (!stsConnectorData && stsPeekDetectionId != null) {
      setStsPeekDetectionId(null)
      setPreviewDetectionId(null)
    }
  }, [
    stsConnectorData,
    stsPeekDetectionId,
    setStsPeekDetectionId,
    setPreviewDetectionId,
  ])

  const handleNavClick = useCallback(
    (to) => {
      // Leaving For You via the left nav exits the For You context; returning to
      // it re-enters. The Ports context is tracked the same way.
      setForYouContext(to === '/for-you')
      setPortsContext(to === '/ports')
      if (location.pathname === to) {
        if (to === '/timeline') {
          setTimelinePanelOpen(true)
        } else {
          setSecondaryNavOpen(true)
        }
      } else {
        if (to === '/timeline') {
          setSecondaryNavOpen(false)
          setPanelOpen(false)
          setTimelinePanelOpen(true)
        } else {
          setSecondaryNavOpen(true)
        }
        navigate(to)
      }
    },
    [location.pathname, navigate]
  )

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const clearTimelineEvents = useCallback(() => {
    setTimelineEvents([])
    setSelectedTimelineEventId(null)
  }, [])

  const handleTimelineEventClick = useCallback(
    (event) => {
      if (!event?.detection) return
      setSelectedTimelineEventId(String(event.id))
      selectDetection(event.detection, {
        source: 'timeline-event',
        allowTabSwitch: false,
      })
    },
    [selectDetection]
  )

  const handleOpenInMyShips = useCallback(
    (event) => {
      if (!event?.detection) return
      selectDetection(event.detection, {
        source: 'timeline-open-myships',
        allowTabSwitch: true,
      })
      setSecondaryNavOpen(true)
      setPanelOpen(true)
      navigate('/myships')
    },
    [navigate, selectDetection]
  )

  const handleShipSelectFromBookmarks = useCallback(
    (shipId, { openSecondaryNav = true } = {}) => {
      if (!shipId) return
      const shipDetections = runtimeDetections.filter(
        (detection) => String(detection.shipId) === String(shipId)
      )
      if (shipDetections.length === 0) return
      const selectedDetection = [...shipDetections].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]
      selectDetection(selectedDetection, { source: 'map', allowTabSwitch: true })
      if (openSecondaryNav) setSecondaryNavOpen(true)
      setPanelOpen(true)
      navigate('/myships')
    },
    [navigate, runtimeDetections, selectDetection]
  )

  const handlePortSelectFromBookmarks = useCallback(
    (port) => {
      const portId = String(port?.id || '').trim()
      if (!portId) return
      setPortsLayerVisible(true)
      setForceHideSelectedPortContext(false)
      openPortTab({
        ...port,
        id: portId,
        type: 'port',
        name: port?.name || 'Unknown port',
      })
      setSecondaryNavOpen(true)
      setPanelOpen(true)
      navigate('/myships')
    },
    [navigate, openPortTab]
  )

  // Opening a port from the Ports nav keeps the Ports context so the nav stays
  // put after we drill into the port detail on /myships.
  const handlePortSelectFromPorts = useCallback(
    (port) => {
      setPortsContext(true)
      setForYouContext(false)
      handlePortSelectFromBookmarks(port)
    },
    [handlePortSelectFromBookmarks]
  )

  const handleForYouShipSelect = useCallback(
    (item, options) => {
      if (!item?.shipId) return
      // Stay in the For You context so the list panel doesn't switch to Watchlist.
      setForYouContext(true)
      setPortsContext(false)
      handleShipSelectFromBookmarks(item.shipId, options)
    },
    [handleShipSelectFromBookmarks]
  )

  const handleForYouPortSelect = useCallback(
    (item) => {
      if (!item?.portId) return
      setForYouContext(true)
      setPortsContext(false)
      // Clear any open ship/detection first; a lingering detection selection
      // would otherwise make the map fly back to that ship instead of the port.
      closeAllTabs()
      handlePortSelectFromBookmarks({
        id: item.portId,
        name: item.name,
        flag: item.flag,
      })
    },
    [handlePortSelectFromBookmarks, closeAllTabs]
  )

  // Ships already fly to their selected detection, so only ports/shapes need an
  // explicit map focus (they otherwise can fail to recenter on re-click).
  const focusForYouItem = useCallback((item) => {
    if (!item || item.kind === 'ship') return
    if (!Number.isFinite(item.lng) || !Number.isFinite(item.lat)) return
    setForYouFocus({
      lng: item.lng,
      lat: item.lat,
      kind: item.kind,
      nonce: Date.now(),
    })
  }, [])

  const handleForYouShapeSelect = useCallback(
    (item) => {
      if (!item?.id) return
      setForYouContext(true)
      setPortsContext(false)
      // Ships/shapes are mutually exclusive, so clear any open ship/port detail
      // first, then (re-)show the saved area. This also re-enables a shape that
      // was closed via the map label's "x" while its For You ring stayed on.
      closeAllTabs()
      addBookmarkedShape?.({
        id: item.id,
        name: item.name,
        coordinates: item.geometry?.coordinates?.[0] || [],
      })
      showShape?.(item.id)
    },
    [closeAllTabs, addBookmarkedShape, showShape]
  )

  const handleForYouMapItemClick = useCallback(
    (item) => {
      if (!item) return
      if (item.kind === 'ship') {
        handleForYouShipSelect(item, { openSecondaryNav: false })
      } else if (item.kind === 'port') {
        handleForYouPortSelect(item)
      } else if (item.kind === 'shape') {
        handleForYouShapeSelect(item)
      }
      focusForYouItem(item)
    },
    [
      handleForYouShipSelect,
      handleForYouPortSelect,
      handleForYouShapeSelect,
      focusForYouItem,
    ]
  )

  const handleRemoveTimelineEvent = useCallback((eventId) => {
    setTimelineEvents((prev) => prev.filter((event) => String(event.id) !== String(eventId)))
    setSelectedTimelineEventId((prev) => (String(prev) === String(eventId) ? null : prev))
  }, [])

  const isTimelineView = location.pathname === '/timeline'
  // Show the For You list (instead of Watchlist) while browsing For You or while
  // viewing a ship/port detail that was opened from For You.
  const showForYouNav =
    location.pathname === '/for-you' ||
    (forYouContext && location.pathname.startsWith('/myships'))
  // Show the Ports nav on /ports, and keep it up while viewing a port detail that
  // was opened from the Ports context (which lives on /myships).
  const showPortsNav =
    location.pathname === '/ports' ||
    (portsContext && location.pathname.startsWith('/myships'))
  // The bare For You list view (/for-you) has no detail content — its route
  // renders null. Any leftover open ship/port panel from a previous view would
  // show as an empty blank panel here, so suppress the slide panel entirely.
  const isForYouListView = location.pathname === '/for-you'
  // The Ports route is a list-only destination (its content lives in the Ports
  // secondary nav); its page renders nothing, so suppress the slide panel the
  // same way For You does to avoid a blank "Ports" panel.
  const isPortsListView = location.pathname === '/ports'
  const isListOnlyView = isForYouListView || isPortsListView
  const showPanelExpand =
    !panelOpen && shipTabs.length > 0 && !isListOnlyView
  const slidePanelClass = isListOnlyView
    ? ''
    : panelOpen
      ? 'slide-panel--open'
      : shipTabs.length > 0
        ? 'slide-panel--collapsed'
        : ''
  const detectionById = useMemo(
    () => new globalThis.Map(runtimeDetections.map((det) => [String(det.id), det])),
    [runtimeDetections]
  )
  const visibleTimelineEvents = useMemo(() => {
    return timelineEvents
      .map((event) => {
        const liveDetection = detectionById.get(String(event.id))
        const detection = liveDetection || event.detection || null
        if (!detection) return null
        if (!enabledDetectionTypes.has(detection.type)) return null
        if (getDetectionDateKey(detection.date) !== mapDate) return null
        const parsedTs = new Date(detection.date).getTime()
        return {
          ...event,
          detection,
          type: detection.type,
          shipId: detection.shipId,
          timestamp: detection.date,
          sortTs: Number.isNaN(parsedTs) ? event.sortTs : parsedTs,
        }
      })
      .filter(Boolean)
  }, [
    timelineEvents,
    detectionById,
    enabledDetectionTypes,
    getDetectionDateKey,
    mapDate,
  ])
  const sortedVisibleTimelineEvents = useMemo(() => {
    const sorted = [...visibleTimelineEvents].sort((a, b) => a.sortTs - b.sortTs)
    return timelineSortOrder === 'asc' ? sorted : sorted.reverse()
  }, [timelineSortOrder, visibleTimelineEvents])
  const secondaryNavInset = secondaryNavOpen ? 386 : 32
  const detailPanelInset = isListOnlyView
    ? 0
    : panelOpen
      ? 500
      : shipTabs.length > 0
        ? 32
        : 0
  const leftPanelInset = isTimelineView
    ? 50
    : 50 + secondaryNavInset + detailPanelInset

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav
        markerMode={forYouMarkerMode}
        onMarkerModeChange={setForYouMarkerMode}
        favoritesVersion={favoritesVersion}
        onFavoritesVersionChange={setFavoritesVersion}
        forYouVersion={forYouVersion}
        onForYouVersionChange={setForYouVersion}
        stsVersion={stsVersion}
        onStsVersionChange={setStsVersion}
        pathToPortVersion={pathToPortVersion}
        onPathToPortVersionChange={setPathToPortVersion}
        shipDetailsVersion={shipDetailsVersion}
        onShipDetailsVersionChange={setShipDetailsVersion}
      />
      <Box style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Map
          ref={mapRef}
          onDetectionClick={handleDetectionClick}
          onPortClick={(port) => {
            // If the user is browsing Ports, keep them in the Ports context so the
            // secondary nav stays on Ports instead of falling back to For You.
            if (showPortsNav) {
              setPortsContext(true)
              setForYouContext(false)
            }
            openPortTab(port)
            // The detail panel only mounts on /myships (or /watchlist). Without
            // this navigation, clicking a port from another route (e.g. For You)
            // opens the tab in state but never shows the panel — it only appeared
            // later once a ship click navigated here. Navigate so the port panel
            // opens consistently on the first click.
            if (
              location.pathname !== '/myships' &&
              location.pathname !== '/watchlist'
            ) {
              navigate('/myships')
            }
            setPanelOpen(true)
          }}
          showPorts={portsLayerVisible}
          leftPanelInset={leftPanelInset}
          rightPanelInset={stsNetworkInset}
          stsVersion={stsVersion}
          shipDetailsVersion={shipDetailsVersion}
          pathToPortVersion={pathToPortVersion}
          portVisibilityBehavior={portVisibilityBehavior}
          forceHideSelectedPortContext={forceHideSelectedPortContext}
          portHoverCardEnabled={portHoverCardEnabled}
          forYouActive={showForYouNav}
          forYouMarkerMode={forYouMarkerMode}
          forYouRingConfig={forYouRingConfig}
          forYouPulseEnabled={forYouPulseEnabled}
          forYouMarkersVisible={forYouMarkersVisible}
          forYouVisibleIds={forYouVisibleIds}
          forYouFocus={forYouFocus}
          onForYouItemClick={handleForYouMapItemClick}
          saveShapeLabel={
            forYouPrototype === 'proto1'
              ? 'Save to Favorites'
              : 'Save to Bookmarks'
          }
          shapesOnly={location.pathname === '/my-shapes'}
        />
        {peekDetection && (
          <StsPeekPanel
            detection={peekDetection}
            topOffset={56}
            onClose={() => {
              setStsPeekDetectionId(null)
              setPreviewDetectionId(null)
            }}
            onViewFull={(detection) => {
              setStsPeekDetectionId(null)
              setPreviewDetectionId(null)
              const isParticipant = (stsConnectorData?.lines || []).some(
                (l) => String(l.shipId) === String(detection.shipId)
              )
              // Participant → drill into its timeline INSIDE the STS event tab so
              // the analyst keeps the transfer-network flow (with a "Back to
              // transfer network" breadcrumb). Non-participant neighbor → open a
              // standalone tab, since it's a separate investigation.
              if (isParticipant) {
                setStsSelectSignal({
                  shipId: detection.shipId,
                  nonce: Date.now(),
                  drillIn: true,
                })
                setPanelOpen(true)
                return
              }
              selectDetection(detection, {
                source: 'map',
                allowTabSwitch: true,
              })
              if (
                location.pathname !== '/myships' &&
                location.pathname !== '/watchlist'
              ) {
                navigate('/myships')
              }
              setPanelOpen(true)
            }}
          />
        )}
        {shipFiltersOpen && (
          <ShipFiltersPanel onClose={() => setShipFiltersOpen(false)} />
        )}
        {mapLayersOpen && (
          <MapLayersPanel
            onClose={() => setMapLayersOpen(false)}
            portsChecked={portsLayerVisible}
            onPortsCheckedChange={(val) => {
              setPortsLayerVisible(val)
              if (val) setForceHideSelectedPortContext(false)
            }}
            portHoverCardEnabled={portHoverCardEnabled}
            onPortHoverCardEnabledChange={setPortHoverCardEnabled}
            portShapeControlEnabled={portShapeControlEnabled}
            onPortShapeControlEnabledChange={setPortShapeControlEnabled}
          />
        )}
        <Box
          style={{
            position: 'absolute',
            right: 24,
            bottom: isTimelineView
              ? timelinePanelOpen
                ? TIMELINE_PANEL_HEIGHT + 12
                : 24
              : 24,
            zIndex: 4,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <ActionIcon
              className="map-zoom-action-icon"
              variant="filled"
              aria-label="Zoom in"
              onClick={() => mapRef.current?.zoomIn()}
              style={{
                width: 46,
                height: 46,
                backgroundColor: '#24263c',
                border: '1px solid #393C56',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <Plus size={20} color="white" />
            </ActionIcon>
            <ActionIcon
              className="map-zoom-action-icon"
              variant="filled"
              aria-label="Zoom out"
              onClick={() => mapRef.current?.zoomOut()}
              style={{
                width: 46,
                height: 46,
                backgroundColor: '#24263c',
                border: '1px solid #393C56',
                borderTop: '0',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Minus size={20} color="white" />
            </ActionIcon>
          </Box>
          <ActionIcon
            className="ship-filter-action-icon"
            variant="filled"
            aria-label="Ship filter"
            onClick={() => setShipFiltersOpen((prev) => !prev)}
            style={{
              width: 46,
              height: 46,
              backgroundColor: '#24263c',
              border: '1px solid #393C56',
              borderRadius: 4,
            }}
          >
            <img src={ShipFilterIcon} alt="" style={{ width: 20, height: 20 }} />
          </ActionIcon>
          <ActionIcon
            className="map-layer-action-icon"
            variant="filled"
            aria-label="Layers"
            onClick={() => setMapLayersOpen((prev) => !prev)}
            style={{
              width: 46,
              height: 46,
              backgroundColor: '#24263c',
              border: '1px solid #393C56',
              borderRadius: 4,
            }}
          >
            <LayersThree01 size={20} color="white" />
          </ActionIcon>
        </Box>
        <Box
          style={{
            position: 'relative',
            // Above the map's DOM markers/popups (which range up to z-index 12) so
            // the solid nav rail and detail panel cover any port/ship marker that
            // sits behind them. Transparent regions of this overlay still let
            // on-map hover cards show through.
            zIndex: 15,
            display: 'flex',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <LeftNav
            onNavClick={handleNavClick}
            watchlistVersion={watchlistVersion}
            forYouPrototype={forYouPrototype}
            forYouActive={showForYouNav}
            portsActive={showPortsNav}
          />
          {!isTimelineView && (
            <>
              <SecondaryNav
                isOpen={secondaryNavOpen}
                onOpen={() => setSecondaryNavOpen(true)}
                onClose={() => setSecondaryNavOpen(false)}
                currentPath={location.pathname}
                watchlistVersion={watchlistVersion}
                forYouPrototype={forYouPrototype}
                favoritesVersion={favoritesVersion}
                forceHidden={showForYouNav || showPortsNav}
                onShipSelect={handleShipSelectFromBookmarks}
                onPortSelect={handlePortSelectFromBookmarks}
              />
              <ForYouSecondaryNav
                isOpen={secondaryNavOpen}
                onOpen={() => setSecondaryNavOpen(true)}
                onClose={() => setSecondaryNavOpen(false)}
                currentPath={location.pathname}
                active={showForYouNav}
                prototype={forYouPrototype}
                version={forYouVersion}
                markerMode={forYouMarkerMode}
                ringConfig={forYouRingConfig}
                onRingConfigChange={setForYouRingConfig}
                markersVisible={forYouMarkersVisible}
                onMarkersVisibleChange={setForYouMarkersVisible}
                pulseEnabled={forYouPulseEnabled}
                onPulseEnabledChange={setForYouPulseEnabled}
                visibleIds={forYouVisibleIds}
                onVisibleIdsChange={setForYouVisibleIds}
                onShipSelect={handleForYouShipSelect}
                onPortSelect={handleForYouPortSelect}
                onItemActivate={focusForYouItem}
              />
              <PortsSecondaryNav
                isOpen={secondaryNavOpen}
                onOpen={() => setSecondaryNavOpen(true)}
                onClose={() => setSecondaryNavOpen(false)}
                active={showPortsNav}
                onPortSelect={handlePortSelectFromPorts}
                portsLayerVisible={portsLayerVisible}
                onPortsLayerVisibleChange={setPortsLayerVisible}
              />

              <Box className={`slide-panel ${slidePanelClass}`}>
                  {showPanelExpand && (
                    <Box
                      onClick={() => setPanelOpen(true)}
                      onMouseEnter={() => setExpandPanelHovered(true)}
                      onMouseLeave={() => setExpandPanelHovered(false)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 12,
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 10,
                      }}
                    >
                      <ExpandButton
                        backgroundColor={expandPanelHovered ? '#4C5070' : '#393C56'}
                      />
                    </Box>
                  )}

                  <Box
                    className="slide-panel-content"
                    style={{
                      minWidth: 500,
                      opacity: panelOpen ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Outlet
                      context={{
                        collapsePanel: closePanel,
                        openPanel: () => setPanelOpen(true),
                        watchlistVersion,
                        portsLayerVisible,
                        onPortsLayerVisibleChange: (val) => {
                          setPortsLayerVisible(val)
                          if (val) setForceHideSelectedPortContext(false)
                        },
                        portVisibilityBehavior,
                        forceHideSelectedPortContext,
                        onForceHideSelectedPortContextChange: setForceHideSelectedPortContext,
                        portShapeControlEnabled,
                        forYouPrototype,
                        stsVersion,
                        pathToPortVersion,
                        shipDetailsVersion,
                        onStsNetworkPanelChange: setStsNetworkInset,
                      }}
                    />
                  </Box>
              </Box>
            </>
          )}
        </Box>
        {isTimelineView && (
          <Box
            style={{
              position: 'absolute',
              left: 50,
              right: 0,
              bottom: 0,
              zIndex: 3,
              pointerEvents: 'auto',
              background: '#181926',
              borderTop: '1px solid #393C56',
              height: TIMELINE_PANEL_HEIGHT,
              overflow: 'hidden',
              transform: timelinePanelOpen
                ? 'translateY(0)'
                : `translateY(${TIMELINE_PANEL_HEIGHT}px)`,
              transition: 'transform 220ms ease',
            }}
          >
            <Box
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #393C56',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 700 }}>
                Timeline
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: '#8D93A8', fontSize: 11 }}>
                  {sortedVisibleTimelineEvents.length}/{timelineEvents.length} events
                </Text>
                <Text
                  onClick={() =>
                    setTimelineSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  style={{
                    color: '#D7DAE2',
                    fontSize: 11,
                    cursor: 'pointer',
                    border: '1px solid #5A607E',
                    borderRadius: 4,
                    padding: '1px 8px',
                    minWidth: 78,
                    textAlign: 'center',
                  }}
                >
                  {timelineSortOrder === 'asc' ? 'Oldest' : 'Newest'}
                </Text>
                <Text
                  onClick={clearTimelineEvents}
                  style={{
                    color: '#FFFFFF',
                    fontSize: 11,
                    cursor: 'pointer',
                    border: '1px solid #5A607E',
                    borderRadius: 4,
                    padding: '1px 8px',
                  }}
                >
                  Clear
                </Text>
              </Box>
            </Box>
            <Box
              className="no-scrollbar"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                overflowX: 'auto',
                overflowY: 'hidden',
                height: 130,
              }}
            >
              {timelineEvents.length === 0 ? (
                <Box style={{ padding: '10px 12px' }}>
                  <Text style={{ color: '#8D93A8', fontSize: 11 }}>
                    Click a ship marker on the map to add it to the timeline.
                  </Text>
                </Box>
              ) : sortedVisibleTimelineEvents.length === 0 ? (
                <Box style={{ padding: '10px 12px' }}>
                  <Text style={{ color: '#8D93A8', fontSize: 11 }}>
                    No timeline events match current ship filters/date.
                  </Text>
                </Box>
              ) : (
                sortedVisibleTimelineEvents.map((event, index) => {
                  const isSelectedTimelineEvent =
                    String(selectedTimelineEventId) === String(event.id)
                  const dateObj = new Date(event.timestamp)
                  const dateLabel = Number.isNaN(dateObj.getTime())
                    ? 'Unknown date'
                    : dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                  const timeLabel = Number.isNaN(dateObj.getTime())
                    ? '--:--'
                    : dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })
                  const eventColor =
                    getEventColor(event.type)

                  return (
                    <Box
                      key={`${event.id}-${event.sortTs}`}
                      onClick={() => handleTimelineEventClick(event)}
                      style={{
                        flex: '0 0 180px',
                        borderLeft: '1px solid transparent',
                        borderTop: '1px solid transparent',
                        borderBottom: '1px solid transparent',
                        marginTop: 0,
                        marginBottom: 0,
                        background: isSelectedTimelineEvent
                          ? 'rgba(0, 148, 255, 0.08)'
                          : 'transparent',
                        borderRight:
                          index === sortedVisibleTimelineEvents.length - 1
                            ? 'none'
                            : '1px solid #2D3047',
                        boxShadow: isSelectedTimelineEvent
                          ? 'inset 1px 0 0 #0094FF, inset -1px 0 0 #0094FF'
                          : 'none',
                        position: 'relative',
                        zIndex: isSelectedTimelineEvent ? 1 : 0,
                        padding: '10px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Text
                        style={{ color: '#8D93A8', fontSize: 10, marginBottom: 6 }}
                      >
                        {dateLabel}
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <Box
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: eventColor,
                            flexShrink: 0,
                          }}
                        />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600 }}>
                          {timeLabel}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          color: '#D7DAE2',
                          fontSize: 10,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={`${event.type} • ${event.shipId}`}
                      >
                        {event.type} • {event.shipId}
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 6,
                        }}
                      >
                        <Text
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenInMyShips(event)
                          }}
                          style={{
                            color: '#0094FF',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Show Details
                        </Text>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveTimelineEvent(event.id)
                          }}
                          style={{
                            color: '#8D93A8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <XClose
                            strokeWidth={2.5}
                            style={{ width: 13, height: 13, color: '#FFFFFF' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )
                })
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Layout
