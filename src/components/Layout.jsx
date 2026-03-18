import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Box, Button, Text } from '@mantine/core'
import { ChevronLeft } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import { mockAois, mockShips, mockDetections } from '../data/prototypeAoiRiskData'
import {
  pointInPolygon,
  deriveShipRiskSignals,
  deriveWatchedAoiAlerts,
} from '../data/riskPrototypeUtils'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [showAoiLayer, setShowAoiLayer] = useState(true)
  const [selectedAoiIds, setSelectedAoiIds] = useState(mockAois.map((aoi) => aoi.id))
  const [watchedAoiIds, setWatchedAoiIds] = useState(['aoi-south-china-sea'])
  const [riskWindowDays, setRiskWindowDays] = useState(14)
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false)
  const [selectedShipId, setSelectedShipId] = useState(null)
  const [dismissedAlertIds, setDismissedAlertIds] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const isMyShipsView = location.pathname === '/myships'

  const handleNavClick = useCallback(
    (to) => {
      if (location.pathname === to) {
        setPanelOpen((prev) => !prev)
      } else {
        setPanelOpen(true)
        navigate(to)
      }
    },
    [location.pathname, navigate]
  )

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const selectedAois = useMemo(
    () => mockAois.filter((aoi) => selectedAoiIds.includes(aoi.id)),
    [selectedAoiIds]
  )
  const watchedAois = useMemo(
    () => mockAois.filter((aoi) => watchedAoiIds.includes(aoi.id)),
    [watchedAoiIds]
  )
  const riskSignals = useMemo(
    () =>
      deriveShipRiskSignals({
        ships: mockShips,
        detections: mockDetections,
        riskWindowDays,
      }),
    [riskWindowDays]
  )
  const riskByShipId = useMemo(() => {
    const byShip = {}
    riskSignals.forEach((signal) => {
      byShip[signal.shipId] = signal
    })
    return byShip
  }, [riskSignals])
  const aoiAlerts = useMemo(
    () =>
      deriveWatchedAoiAlerts({
        watchedAois,
        detections: mockDetections,
        riskSignals,
      }),
    [watchedAois, riskSignals]
  )
  const activeAoiAlert = useMemo(
    () => aoiAlerts.find((alert) => !dismissedAlertIds.includes(alert.id)) || null,
    [aoiAlerts, dismissedAlertIds]
  )

  const mapShips = useMemo(() => {
    const isValidLngLat = (lng, lat) =>
      Number.isFinite(lng) &&
      Number.isFinite(lat) &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90

    const ships = mockShips
      .map((ship) => {
        const signal = riskByShipId[ship.id]
        const latest = signal?.latestDetection
        if (!latest) return null
        if (!isValidLngLat(latest.lng, latest.lat)) {
          return null
        }
        const inSelectedAoi = selectedAois.some((aoi) =>
          pointInPolygon(latest.lng, latest.lat, aoi.coordinates)
        )
        if (showOnlyFlagged && !signal?.isFlagged) return null
        return {
          ...ship,
          lng: latest.lng,
          lat: latest.lat,
          inSelectedAoi,
          risk: signal,
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.risk?.isFlagged === b.risk?.isFlagged) return a.name.localeCompare(b.name)
        return a.risk?.isFlagged ? -1 : 1
      })
    return ships
  }, [riskByShipId, selectedAois, showOnlyFlagged])

  useEffect(() => {
    if (selectedShipId && mapShips.some((ship) => ship.id === selectedShipId)) return
    setSelectedShipId(mapShips[0]?.id || null)
  }, [mapShips, selectedShipId])
  useEffect(() => {
    setDismissedAlertIds([])
  }, [watchedAoiIds, riskWindowDays])

  const selectedAlertShip = activeAoiAlert
    ? mapShips.find((ship) => ship.id === activeAoiAlert.shipId)
    : null
  const handleViewAoiAlert = () => {
    if (!activeAoiAlert) return
    setSelectedShipId(activeAoiAlert.shipId)
    setPanelOpen(true)
    if (location.pathname !== '/myships') {
      navigate('/myships')
    }
  }

  const formatAlertDate = (dateStr) => {
    const parsed = new Date(dateStr)
    if (Number.isNaN(parsed.getTime())) return dateStr
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const prototypeContext = {
    mockAois,
    selectedAoiIds,
    setSelectedAoiIds,
    watchedAoiIds,
    setWatchedAoiIds,
    showAoiLayer,
    setShowAoiLayer,
    riskWindowDays,
    setRiskWindowDays,
    showOnlyFlagged,
    setShowOnlyFlagged,
    mapShips,
    selectedShipId,
    setSelectedShipId,
    selectedShip: mapShips.find((ship) => ship.id === selectedShipId) || null,
    aoiAlerts,
    activeAoiAlert,
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <Box style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Map
          aois={isMyShipsView ? selectedAois : []}
          aoiLayerVisible={isMyShipsView && showAoiLayer}
          ships={isMyShipsView ? mapShips : []}
          selectedShipId={selectedShipId}
          onShipClick={setSelectedShipId}
          onBackgroundClick={() => setSelectedShipId(null)}
        />
        {isMyShipsView && activeAoiAlert && selectedAlertShip && (
          <Box
            style={{
              position: 'absolute',
              top: 18,
              left: 62,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <Box
              style={{
                width: 360,
                maxWidth: 'calc(100vw - 120px)',
                borderRadius: 8,
                border: '1px solid #393C56',
                background: '#1F2134',
                boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
                pointerEvents: 'auto',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '11px 12px',
                  borderBottom: '1px solid #393C56',
                }}
              >
                <Text style={{ color: '#FFD166', fontWeight: 700, fontSize: 13 }}>
                  New High-Risk Entry
                </Text>
                <Text
                  onClick={() =>
                    setDismissedAlertIds((prev) => [...prev, activeAoiAlert.id])
                  }
                  style={{ color: '#9CA3B4', cursor: 'pointer', fontSize: 18 }}
                >
                  x
                </Text>
              </Box>
              <Box style={{ padding: 12 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  {selectedAlertShip.name} in {activeAoiAlert.aoiName}
                </Text>
                <Text
                  style={{
                    color: '#C8D0E4',
                    fontSize: 12,
                    lineHeight: 1.35,
                    marginTop: 6,
                  }}
                >
                  {activeAoiAlert.status === 'entered'
                    ? 'Flagged vessel has just entered your watched AOI.'
                    : 'Flagged vessel is currently active in your watched AOI.'}
                </Text>
                <Text style={{ color: '#8EA1C7', fontSize: 11, marginTop: 6 }}>
                  {activeAoiAlert.reasonSummary}
                </Text>
                <Text style={{ color: '#9CA3B4', fontSize: 11, marginTop: 2 }}>
                  Updated: {formatAlertDate(activeAoiAlert.timestamp)}
                </Text>
                <Button
                  size="xs"
                  onClick={handleViewAoiAlert}
                  style={{ marginTop: 10, background: '#0094FF', color: '#fff' }}
                >
                  View
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        <Box style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100%', pointerEvents: 'none' }}>
          <LeftNav onNavClick={handleNavClick} />
          <Box className={`slide-panel ${panelOpen ? 'slide-panel--open' : ''}`}>
            <Box onClick={closePanel} style={{ position: "relative"}}>
              <Box style={{ position: "absolute", right: 0, top: 8,  cursor: "pointer" }}>
                <CollapseButton  />
              </Box>
            </Box>
            <Box className="slide-panel-content">
              <Outlet context={prototypeContext} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
