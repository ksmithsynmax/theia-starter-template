import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useRef } from 'react'
import { Box, ActionIcon } from '@mantine/core'
import { ChevronLeft, Plus, Minus } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import ShipFilterIcon from '../custom-icons/ShipFilterIcon.svg'
import ShipFiltersPanel from './ShipFiltersPanel'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [shipFiltersOpen, setShipFiltersOpen] = useState(false)
  const mapRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

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

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <Box style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Map ref={mapRef} />
        {shipFiltersOpen && (
          <ShipFiltersPanel onClose={() => setShipFiltersOpen(false)} />
        )}
        <Box
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            zIndex: 2,
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
            <img
              src={ShipFilterIcon}
              alt=""
              style={{ width: 20, height: 20 }}
            />
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
          <LeftNav onNavClick={handleNavClick} />
          <Box
            className={`slide-panel ${panelOpen ? 'slide-panel--open' : ''}`}
          >
            <Box onClick={closePanel} style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 8,
                  cursor: 'pointer',
                }}
              >
                <CollapseButton />
              </Box>
            </Box>
            <Box className="slide-panel-content">
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
