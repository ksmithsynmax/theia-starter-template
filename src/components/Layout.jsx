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

function Layout() {
  const TIMELINE_PANEL_HEIGHT = 172
  const watchlistVersion = 'version7'
  const [portVisibilityBehavior, setPortVisibilityBehavior] = useState(
    'selected-context'
  )
  const [panelOpen, setPanelOpen] = useState(false)
  const [secondaryNavOpen, setSecondaryNavOpen] = useState(false)
  const [shipFiltersOpen, setShipFiltersOpen] = useState(false)
  const [mapLayersOpen, setMapLayersOpen] = useState(false)
  const [portsLayerVisible, setPortsLayerVisible] = useState(false)
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
  } =
    useShipContext()

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
      selectDetection(detection, { source: 'map', allowTabSwitch: true })
      if (location.pathname !== '/myships' && location.pathname !== '/watchlist') {
        navigate('/myships')
      }
      setPanelOpen(true)
    },
    [selectDetection, location.pathname, navigate]
  )

  const handleNavClick = useCallback(
    (to) => {
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
    (shipId) => {
      if (!shipId) return
      const shipDetections = runtimeDetections.filter(
        (detection) => String(detection.shipId) === String(shipId)
      )
      if (shipDetections.length === 0) return
      const selectedDetection = [...shipDetections].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]
      selectDetection(selectedDetection, { source: 'map', allowTabSwitch: true })
      setSecondaryNavOpen(true)
      setPanelOpen(true)
      navigate('/myships')
    },
    [navigate, runtimeDetections, selectDetection]
  )

  const handleRemoveTimelineEvent = useCallback((eventId) => {
    setTimelineEvents((prev) => prev.filter((event) => String(event.id) !== String(eventId)))
    setSelectedTimelineEventId((prev) => (String(prev) === String(eventId) ? null : prev))
  }, [])

  const isTimelineView = location.pathname === '/timeline'
  const showPanelExpand = !panelOpen && shipTabs.length > 0
  const slidePanelClass = panelOpen
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
  const detailPanelInset = panelOpen ? 500 : shipTabs.length > 0 ? 32 : 0
  const leftPanelInset = isTimelineView
    ? 50
    : 50 + secondaryNavInset + detailPanelInset

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav
        portVisibilityBehavior={portVisibilityBehavior}
        onPortVisibilityBehaviorChange={setPortVisibilityBehavior}
      />
      <Box style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Map
          ref={mapRef}
          onDetectionClick={handleDetectionClick}
          onPortClick={(port) => {
            openPortTab(port)
            setPanelOpen(true)
          }}
          showPorts={portsLayerVisible}
          leftPanelInset={leftPanelInset}
          portVisibilityBehavior={portVisibilityBehavior}
        />
        {shipFiltersOpen && (
          <ShipFiltersPanel onClose={() => setShipFiltersOpen(false)} />
        )}
        {mapLayersOpen && (
          <MapLayersPanel
            onClose={() => setMapLayersOpen(false)}
            portsChecked={portsLayerVisible}
            onPortsCheckedChange={setPortsLayerVisible}
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
            zIndex: 1,
            display: 'flex',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <LeftNav
            onNavClick={handleNavClick}
            watchlistVersion={watchlistVersion}
          />
          {!isTimelineView && (
            <>
              <SecondaryNav
                isOpen={secondaryNavOpen}
                onOpen={() => setSecondaryNavOpen(true)}
                onClose={() => setSecondaryNavOpen(false)}
                currentPath={location.pathname}
                watchlistVersion={watchlistVersion}
                onShipSelect={handleShipSelectFromBookmarks}
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
                      context={{ collapsePanel: closePanel, watchlistVersion }}
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
