import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useRef } from 'react'
import { Box, ActionIcon } from '@mantine/core'
import { ChevronLeft, Plus, Minus } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import ShipFilterIcon from '../custom-icons/ShipFilterIcon.svg'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(true)
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
                width: 50,
                height: 50,
                backgroundColor: '#393C56',
                borderRadius: '4px 4px 0 0',
                borderBottom: '1px solid #24263C',
              }}
            >
              <Plus size={26} color="white" />
            </ActionIcon>
            <ActionIcon
              className="map-zoom-action-icon"
              variant="filled"
              aria-label="Zoom out"
              onClick={() => mapRef.current?.zoomOut()}
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#393C56',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Minus size={26} color="white" />
            </ActionIcon>
          </Box>
          <ActionIcon
            className="ship-filter-action-icon"
            variant="filled"
            aria-label="Ship filter"
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#393C56',
              borderRadius: 4,
            }}
          >
            <img src={ShipFilterIcon} alt="" style={{ width: 24, height: 24 }} />
          </ActionIcon>
        </Box>
        <Box style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100%', pointerEvents: 'none' }}>
          <LeftNav onNavClick={handleNavClick} />
          <Box className={`slide-panel ${panelOpen ? 'slide-panel--open' : ''}`}>
            <Box onClick={closePanel} style={{ position: "relative"}}>
              <Box style={{ position: "absolute", right: 0, top: 8,  cursor: "pointer" }}>
                <CollapseButton  />
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
