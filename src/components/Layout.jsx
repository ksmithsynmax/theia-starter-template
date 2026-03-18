import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Box } from '@mantine/core'
import { ChevronLeft } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import { mockAois, mockShips, mockDetections } from '../data/prototypeAoiRiskData'
import {
  pointInPolygon,
  deriveShipRiskSignals,
} from '../data/riskPrototypeUtils'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [showAoiLayer, setShowAoiLayer] = useState(true)
  const [selectedAoiIds, setSelectedAoiIds] = useState(mockAois.map((aoi) => aoi.id))
  const [riskWindowDays, setRiskWindowDays] = useState(14)
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false)
  const [selectedShipId, setSelectedShipId] = useState(null)
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

  const prototypeContext = {
    mockAois,
    selectedAoiIds,
    setSelectedAoiIds,
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
